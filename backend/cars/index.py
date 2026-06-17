"""
Автомобили, прикреплённые к заявке клиента.
GET /?order_id=N — список авто по заявке (клиент видит только свои, сотрудник — любые)
POST / — сотрудник добавляет авто к заявке (с загрузкой фото в S3) + разборный лист
PATCH / — клиент отмечает нужные узлы в разборном листе (по car_id)
DELETE / — сотрудник удаляет авто (order_id не нужен, по car_id)
"""
import json
import os
import base64
import uuid
import psycopg2
import boto3

DB = os.environ["DATABASE_URL"]
SCHEMA = "t_p64303579_auto_import_project_"

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Session-Token",
}


def get_conn():
    return psycopg2.connect(DB)


def get_user(cur, token: str):
    cur.execute(
        f"SELECT u.id, u.role FROM {SCHEMA}.sessions s JOIN {SCHEMA}.users u ON u.id = s.user_id "
        f"WHERE s.token = %s AND s.expires_at > NOW()",
        (token,)
    )
    row = cur.fetchone()
    return (row[0], row[1] or "client") if row else (None, None)


def ok(data, status=200):
    return {"statusCode": status,
            "headers": {**CORS, "Content-Type": "application/json"},
            "body": json.dumps(data, ensure_ascii=False, default=str)}


def err(msg, status=400):
    return {"statusCode": status,
            "headers": {**CORS, "Content-Type": "application/json"},
            "body": json.dumps({"error": msg}, ensure_ascii=False)}


def s3_client():
    return boto3.client(
        "s3",
        endpoint_url="https://bucket.poehali.dev",
        aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
        aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
    )


def upload_photo(s3, data_url: str) -> str:
    """Принимает data URL (data:image/jpeg;base64,...) и возвращает CDN-ссылку."""
    header, b64 = data_url.split(",", 1)
    ext = "jpg"
    ctype = "image/jpeg"
    if "image/png" in header:
        ext, ctype = "png", "image/png"
    elif "image/webp" in header:
        ext, ctype = "webp", "image/webp"
    raw = base64.b64decode(b64)
    key = f"cars/{uuid.uuid4().hex}.{ext}"
    s3.put_object(Bucket="files", Key=key, Body=raw, ContentType=ctype)
    return f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    token = event.get("headers", {}).get("X-Session-Token", "")
    if not token:
        return err("Не авторизован", 401)

    conn = get_conn()
    try:
        cur = conn.cursor()
        user_id, role = get_user(cur, token)
        if not user_id:
            return err("Не авторизован", 401)
        is_staff = role == "staff"

        if method == "GET":
            params = event.get("queryStringParameters") or {}
            order_id = params.get("order_id")
            if not order_id:
                return err("Не указана заявка")
            cur.execute(f"SELECT user_id FROM {SCHEMA}.orders WHERE id = %s", (order_id,))
            row = cur.fetchone()
            if not row:
                return err("Заявка не найдена", 404)
            if not is_staff and row[0] != user_id:
                return err("Нет доступа", 403)
            cur.execute(
                f"SELECT id, car_brand, car_model, car_year, price, mileage, description, photos, teardown, created_at "
                f"FROM {SCHEMA}.cars WHERE order_id = %s ORDER BY created_at DESC",
                (order_id,)
            )
            cars = [
                {"id": r[0], "car_brand": r[1], "car_model": r[2], "car_year": r[3],
                 "price": r[4], "mileage": r[5], "description": r[6] or "",
                 "photos": json.loads(r[7]) if r[7] else [],
                 "teardown": r[8] if isinstance(r[8], list) else (json.loads(r[8]) if r[8] else []),
                 "created_at": str(r[9])}
                for r in cur.fetchall()
            ]
            return ok({"cars": cars})

        if method == "POST":
            if not is_staff:
                return err("Добавлять авто может только сотрудник", 403)
            body = json.loads(event.get("body") or "{}")
            order_id = body.get("order_id")
            if not order_id:
                return err("Не указана заявка")
            cur.execute(f"SELECT id FROM {SCHEMA}.orders WHERE id = %s", (order_id,))
            if not cur.fetchone():
                return err("Заявка не найдена", 404)

            s3 = s3_client()
            photo_urls = []
            for ph in (body.get("photos") or []):
                if ph.startswith("data:"):
                    photo_urls.append(upload_photo(s3, ph))
                elif ph.startswith("http"):
                    photo_urls.append(ph)

            teardown = []
            for item in (body.get("teardown") or []):
                name = (item.get("name") or "").strip() if isinstance(item, dict) else str(item).strip()
                if name:
                    teardown.append({"name": name, "needed": bool(item.get("needed")) if isinstance(item, dict) else False})

            cur.execute(
                f"INSERT INTO {SCHEMA}.cars "
                f"(order_id, car_brand, car_model, car_year, price, mileage, description, photos, teardown, created_by) "
                f"VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id",
                (order_id, body.get("car_brand", "").strip(), body.get("car_model", "").strip(),
                 body.get("car_year") or None, body.get("price") or None, body.get("mileage") or None,
                 body.get("description", "").strip(), json.dumps(photo_urls),
                 json.dumps(teardown, ensure_ascii=False), user_id)
            )
            car_id = cur.fetchone()[0]
            conn.commit()
            return ok({"id": car_id, "photos": photo_urls, "message": "Автомобиль добавлен"})

        if method == "PATCH":
            body = json.loads(event.get("body") or "{}")
            car_id = body.get("car_id")
            if not car_id:
                return err("Не указан автомобиль")
            cur.execute(
                f"SELECT c.teardown, o.user_id FROM {SCHEMA}.cars c "
                f"JOIN {SCHEMA}.orders o ON o.id = c.order_id WHERE c.id = %s",
                (car_id,)
            )
            row = cur.fetchone()
            if not row:
                return err("Автомобиль не найден", 404)
            if not is_staff and row[1] != user_id:
                return err("Нет доступа", 403)

            current = row[0] if isinstance(row[0], list) else (json.loads(row[0]) if row[0] else [])
            needed_map = {str(x.get("name", "")).strip(): bool(x.get("needed")) for x in (body.get("teardown") or []) if isinstance(x, dict)}
            for item in current:
                key = str(item.get("name", "")).strip()
                if key in needed_map:
                    item["needed"] = needed_map[key]

            cur.execute(
                f"UPDATE {SCHEMA}.cars SET teardown = %s WHERE id = %s",
                (json.dumps(current, ensure_ascii=False), car_id)
            )
            conn.commit()
            return ok({"teardown": current, "message": "Отметки сохранены"})

        if method == "DELETE":
            if not is_staff:
                return err("Удалять может только сотрудник", 403)
            params = event.get("queryStringParameters") or {}
            car_id = params.get("car_id")
            if not car_id:
                return err("Не указан автомобиль")
            cur.execute(f"DELETE FROM {SCHEMA}.cars WHERE id = %s", (car_id,))
            conn.commit()
            return ok({"message": "Автомобиль удалён"})

        return err("Метод не поддерживается", 405)

    finally:
        conn.close()
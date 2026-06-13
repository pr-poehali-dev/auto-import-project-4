"""
Горячие предложения машинокомплектов (по направлениям).
GET /?origin=hongkong — публичный список предложений (без авторизации)
POST / — сотрудник добавляет/обновляет предложение (с загрузкой фото в S3)
DELETE /?id=N — сотрудник удаляет предложение
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
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
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
    header, b64 = data_url.split(",", 1)
    ext, ctype = "jpg", "image/jpeg"
    if "image/png" in header:
        ext, ctype = "png", "image/png"
    elif "image/webp" in header:
        ext, ctype = "webp", "image/webp"
    raw = base64.b64decode(b64)
    key = f"hot-deals/{uuid.uuid4().hex}.{ext}"
    s3.put_object(Bucket="files", Key=key, Body=raw, ContentType=ctype)
    return f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"


def row_to_deal(r):
    return {"id": r[0], "origin": r[1], "brand": r[2], "model": r[3],
            "year": r[4], "mileage": r[5], "engine": r[6], "price": r[7],
            "badge": r[8], "photo": r[9], "sort_order": r[10]}


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    token = event.get("headers", {}).get("X-Session-Token", "")

    conn = get_conn()
    try:
        cur = conn.cursor()

        if method == "GET":
            params = event.get("queryStringParameters") or {}
            origin = params.get("origin", "hongkong")
            cur.execute(
                f"SELECT id, origin, brand, model, year, mileage, engine, price, badge, photo, sort_order "
                f"FROM {SCHEMA}.hot_deals WHERE origin = %s ORDER BY sort_order, id",
                (origin,)
            )
            deals = [row_to_deal(r) for r in cur.fetchall()]
            return ok({"deals": deals})

        if not token:
            return err("Не авторизован", 401)
        user_id, role = get_user(cur, token)
        if not user_id:
            return err("Не авторизован", 401)
        if role != "staff":
            return err("Доступ только для сотрудников", 403)

        if method == "POST":
            body = json.loads(event.get("body") or "{}")
            deal_id = body.get("id")
            origin = body.get("origin", "hongkong").strip() or "hongkong"
            brand = body.get("brand", "").strip()
            model = body.get("model", "").strip()
            year = body.get("year") or None
            mileage = body.get("mileage", "").strip()
            engine = body.get("engine", "").strip()
            price = body.get("price", "").strip()
            badge = body.get("badge", "").strip()
            sort_order = body.get("sort_order") or 0

            photo = (body.get("photo") or "").strip()
            if photo.startswith("data:"):
                s3 = s3_client()
                photo = upload_photo(s3, photo)

            if deal_id:
                if photo:
                    cur.execute(
                        f"UPDATE {SCHEMA}.hot_deals SET origin=%s, brand=%s, model=%s, year=%s, "
                        f"mileage=%s, engine=%s, price=%s, badge=%s, photo=%s, sort_order=%s WHERE id=%s",
                        (origin, brand, model, year, mileage, engine, price, badge, photo, sort_order, deal_id)
                    )
                else:
                    cur.execute(
                        f"UPDATE {SCHEMA}.hot_deals SET origin=%s, brand=%s, model=%s, year=%s, "
                        f"mileage=%s, engine=%s, price=%s, badge=%s, sort_order=%s WHERE id=%s",
                        (origin, brand, model, year, mileage, engine, price, badge, sort_order, deal_id)
                    )
                conn.commit()
                return ok({"id": deal_id, "message": "Предложение обновлено"})

            cur.execute(
                f"INSERT INTO {SCHEMA}.hot_deals "
                f"(origin, brand, model, year, mileage, engine, price, badge, photo, sort_order) "
                f"VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id",
                (origin, brand, model, year, mileage, engine, price, badge, photo, sort_order)
            )
            new_id = cur.fetchone()[0]
            conn.commit()
            return ok({"id": new_id, "photo": photo, "message": "Предложение добавлено"})

        if method == "DELETE":
            params = event.get("queryStringParameters") or {}
            deal_id = params.get("id")
            if not deal_id:
                return err("Не указано предложение")
            cur.execute(f"DELETE FROM {SCHEMA}.hot_deals WHERE id = %s", (deal_id,))
            conn.commit()
            return ok({"message": "Предложение удалено"})

        return err("Метод не поддерживается", 405)

    finally:
        conn.close()

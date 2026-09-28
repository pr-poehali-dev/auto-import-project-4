"""
Запросы наличия автозапчастей (направление Китай).
GET  / — клиент: свои запросы; сотрудник: все запросы с данными клиента
POST / — создать запрос наличия по группе запчастей
PATCH / — сотрудник: сменить статус запроса
"""
import json
import os
import psycopg2

DB = os.environ["DATABASE_URL"]
SCHEMA = "t_p64303579_auto_import_project_"

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Session-Token",
}

STATUS_MAP = {
    "new": "Новый",
    "processing": "В работе",
    "answered": "Ответ отправлен",
    "closed": "Закрыт",
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
            if is_staff:
                cur.execute(
                    f"SELECT r.id, r.origin, r.category_id, r.category_title, r.car_brand, r.car_model, "
                    f"r.car_year, r.vin, r.parts_text, r.comment, r.status, r.created_at, "
                    f"u.full_name, u.email, u.phone, u.company "
                    f"FROM {SCHEMA}.parts_requests r "
                    f"JOIN {SCHEMA}.users u ON u.id = r.user_id "
                    f"ORDER BY r.created_at DESC"
                )
                items = [
                    {"id": r[0], "origin": r[1], "category_id": r[2], "category_title": r[3],
                     "car_brand": r[4], "car_model": r[5] or "", "car_year": r[6],
                     "vin": r[7] or "", "parts_text": r[8] or "", "comment": r[9] or "",
                     "status": r[10], "status_label": STATUS_MAP.get(r[10], r[10]),
                     "created_at": str(r[11]),
                     "client_name": r[12] or "", "client_email": r[13] or "",
                     "client_phone": r[14] or "", "client_company": r[15] or ""}
                    for r in cur.fetchall()
                ]
                return ok({"requests": items})

            cur.execute(
                f"SELECT id, origin, category_id, category_title, car_brand, car_model, car_year, "
                f"vin, parts_text, comment, status, created_at "
                f"FROM {SCHEMA}.parts_requests WHERE user_id = %s ORDER BY created_at DESC",
                (user_id,)
            )
            items = [
                {"id": r[0], "origin": r[1], "category_id": r[2], "category_title": r[3],
                 "car_brand": r[4], "car_model": r[5] or "", "car_year": r[6],
                 "vin": r[7] or "", "parts_text": r[8] or "", "comment": r[9] or "",
                 "status": r[10], "status_label": STATUS_MAP.get(r[10], r[10]),
                 "created_at": str(r[11])}
                for r in cur.fetchall()
            ]
            return ok({"requests": items})

        if method == "POST":
            body = json.loads(event.get("body") or "{}")
            category_id = (body.get("category_id") or "").strip()[:32]
            category_title = (body.get("category_title") or "").strip()[:128]
            car_brand = (body.get("car_brand") or "").strip()[:64]
            if not category_id or not category_title:
                return err("Не указана группа запчастей")
            if not car_brand:
                return err("Укажите марку автомобиля")

            year = body.get("car_year")
            try:
                year = int(year) if year else None
            except (ValueError, TypeError):
                year = None

            cur.execute(
                f"INSERT INTO {SCHEMA}.parts_requests "
                f"(user_id, origin, category_id, category_title, car_brand, car_model, car_year, "
                f"vin, parts_text, comment) "
                f"VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id, created_at",
                (user_id, (body.get("origin") or "china").strip()[:32], category_id, category_title,
                 car_brand, (body.get("car_model") or "").strip()[:64] or None, year,
                 (body.get("vin") or "").strip().upper()[:32] or None,
                 (body.get("parts_text") or "").strip() or None,
                 (body.get("comment") or "").strip() or None)
            )
            row = cur.fetchone()
            conn.commit()
            return ok({"id": row[0], "created_at": str(row[1]),
                       "message": "Запрос отправлен — менеджер свяжется с вами"})

        if method == "PATCH":
            if not is_staff:
                return err("Менять статус может только сотрудник", 403)
            body = json.loads(event.get("body") or "{}")
            req_id = body.get("request_id")
            new_status = (body.get("status") or "").strip()
            if not req_id:
                return err("Не указан запрос")
            if new_status not in STATUS_MAP:
                return err("Неизвестный статус")
            cur.execute(
                f"UPDATE {SCHEMA}.parts_requests SET status = %s WHERE id = %s",
                (new_status, req_id)
            )
            conn.commit()
            return ok({"status": new_status, "status_label": STATUS_MAP[new_status],
                       "message": "Статус обновлён"})

        return err("Метод не поддерживается", 405)
    finally:
        conn.close()

"""
Заявки пользователя: создание и список.
GET / — список своих заявок
POST / — создать заявку
"""
import json
import os
import random
import psycopg2

DB = os.environ["DATABASE_URL"]
SCHEMA = "t_p64303579_auto_import_project_"

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Session-Token",
}


def get_conn():
    return psycopg2.connect(DB)


def get_user_id(cur, token: str):
    cur.execute(
        f"SELECT u.id FROM {SCHEMA}.sessions s JOIN {SCHEMA}.users u ON u.id = s.user_id "
        f"WHERE s.token = %s AND s.expires_at > NOW()",
        (token,)
    )
    row = cur.fetchone()
    return row[0] if row else None


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
        user_id = get_user_id(cur, token)
        if not user_id:
            return err("Не авторизован", 401)

        if method == "GET":
            cur.execute(
                f"SELECT id, order_number, car_brand, car_model, car_year, "
                f"quantity, budget, status, origin, created_at "
                f"FROM {SCHEMA}.orders WHERE user_id = %s ORDER BY created_at DESC",
                (user_id,)
            )
            rows = cur.fetchall()
            STATUS_MAP = {
                "new": "Новая", "processing": "В обработке",
                "auction": "На аукционе", "shipped": "Отправлен",
                "customs": "На таможне", "delivered": "Доставлен", "done": "Завершён"
            }
            orders = [
                {"id": r[0], "order_number": r[1], "car_brand": r[2],
                 "car_model": r[3], "car_year": r[4], "quantity": r[5],
                 "budget": r[6], "status": r[7],
                 "status_label": STATUS_MAP.get(r[7], r[7]),
                 "origin": r[8], "created_at": str(r[9])}
                for r in rows
            ]
            return ok({"orders": orders})

        if method == "POST":
            body = json.loads(event.get("body") or "{}")
            car_brand = body.get("car_brand", "").strip()
            car_model = body.get("car_model", "").strip()
            car_year = body.get("car_year") or None
            quantity = body.get("quantity", 1)
            budget = body.get("budget") or None
            comment = body.get("comment", "").strip()
            origin = body.get("origin", "").strip()

            order_num = f"PC-{random.randint(10000, 99999)}"
            cur.execute(
                f"INSERT INTO {SCHEMA}.orders "
                f"(user_id, order_number, car_brand, car_model, car_year, quantity, budget, comment, origin) "
                f"VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id, order_number",
                (user_id, order_num, car_brand, car_model, car_year, quantity, budget, comment, origin)
            )
            row = cur.fetchone()
            conn.commit()
            return ok({"id": row[0], "order_number": row[1], "message": "Заявка создана"})

        return err("Метод не поддерживается", 405)

    finally:
        conn.close()

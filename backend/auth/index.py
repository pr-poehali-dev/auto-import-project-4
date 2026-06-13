"""
Аутентификация: регистрация, вход, выход, профиль.
action в теле запроса: register | login | logout | me | update_profile
"""
import json
import os
import hashlib
import secrets
import psycopg2

DB = os.environ["DATABASE_URL"]
SCHEMA = "t_p64303579_auto_import_project_"

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Session-Token",
}


def get_conn():
    return psycopg2.connect(DB)


def hash_pw(pw: str) -> str:
    return hashlib.sha256(pw.encode()).hexdigest()


def make_token() -> str:
    return secrets.token_hex(32)


def get_user_by_token(cur, token: str):
    cur.execute(
        f"SELECT u.id, u.email, u.phone, u.full_name, u.company, u.inn, u.created_at "
        f"FROM {SCHEMA}.sessions s JOIN {SCHEMA}.users u ON u.id = s.user_id "
        f"WHERE s.token = %s AND s.expires_at > NOW()",
        (token,)
    )
    row = cur.fetchone()
    if not row:
        return None
    return {"id": row[0], "email": row[1], "phone": row[2] or "",
            "full_name": row[3] or "", "company": row[4] or "",
            "inn": row[5] or "", "created_at": str(row[6])}


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

    token = event.get("headers", {}).get("X-Session-Token", "")
    body = {}
    if event.get("body"):
        body = json.loads(event["body"])

    action = body.get("action", "me")
    conn = get_conn()
    try:
        cur = conn.cursor()

        if action == "register":
            email = body.get("email", "").strip().lower()
            password = body.get("password", "")
            full_name = body.get("full_name", "").strip()
            phone = body.get("phone", "").strip()
            company = body.get("company", "").strip()

            if not email or not password:
                return err("Email и пароль обязательны")
            if len(password) < 6:
                return err("Пароль — минимум 6 символов")

            cur.execute(f"SELECT id FROM {SCHEMA}.users WHERE email = %s", (email,))
            if cur.fetchone():
                return err("Пользователь с таким email уже существует")

            cur.execute(
                f"INSERT INTO {SCHEMA}.users (email, phone, password_hash, full_name, company) "
                f"VALUES (%s, %s, %s, %s, %s) RETURNING id",
                (email, phone, hash_pw(password), full_name, company)
            )
            user_id = cur.fetchone()[0]
            tk = make_token()
            cur.execute(
                f"INSERT INTO {SCHEMA}.sessions (user_id, token) VALUES (%s, %s)",
                (user_id, tk)
            )
            conn.commit()
            return ok({"token": tk, "message": "Регистрация успешна"})

        if action == "login":
            email = body.get("email", "").strip().lower()
            password = body.get("password", "")
            cur.execute(
                f"SELECT id FROM {SCHEMA}.users WHERE email = %s AND password_hash = %s",
                (email, hash_pw(password))
            )
            row = cur.fetchone()
            if not row:
                return err("Неверный email или пароль", 401)
            tk = make_token()
            cur.execute(
                f"INSERT INTO {SCHEMA}.sessions (user_id, token) VALUES (%s, %s)",
                (row[0], tk)
            )
            conn.commit()
            return ok({"token": tk, "message": "Вход выполнен"})

        if action == "me":
            if not token:
                return err("Не авторизован", 401)
            user = get_user_by_token(cur, token)
            if not user:
                return err("Сессия истекла", 401)
            return ok({"user": user})

        if action == "update_profile":
            if not token:
                return err("Не авторизован", 401)
            user = get_user_by_token(cur, token)
            if not user:
                return err("Сессия истекла", 401)
            full_name = body.get("full_name", "").strip()
            phone = body.get("phone", "").strip()
            company = body.get("company", "").strip()
            inn = body.get("inn", "").strip()
            cur.execute(
                f"UPDATE {SCHEMA}.users SET full_name=%s, phone=%s, company=%s, inn=%s, updated_at=NOW() WHERE id=%s",
                (full_name, phone, company, inn, user["id"])
            )
            conn.commit()
            return ok({"message": "Профиль обновлён"})

        if action == "logout":
            if token:
                cur.execute(f"DELETE FROM {SCHEMA}.sessions WHERE token = %s", (token,))
                conn.commit()
            return ok({"message": "Выход выполнен"})

        return err("Неизвестный action", 400)

    finally:
        conn.close()

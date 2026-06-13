"""
Аутентификация: регистрация, вход, выход, профиль, подтверждение телефона.
action в теле запроса: send_code | register | login | logout | me | update_profile
"""
import json
import os
import re
import random
import hashlib
import secrets
import urllib.request
import urllib.parse
import psycopg2

DB = os.environ["DATABASE_URL"]
SCHEMA = "t_p64303579_auto_import_project_"
SMSC_LOGIN = os.environ.get("SMSC_LOGIN", "")
SMSC_PASSWORD = os.environ.get("SMSC_PASSWORD", "")


def normalize_phone(phone: str) -> str:
    digits = re.sub(r"\D", "", phone or "")
    if digits.startswith("8") and len(digits) == 11:
        digits = "7" + digits[1:]
    return digits


def send_sms(phone: str, text: str) -> bool:
    if not SMSC_LOGIN or not SMSC_PASSWORD:
        return False
    params = urllib.parse.urlencode({
        "login": SMSC_LOGIN, "psw": SMSC_PASSWORD,
        "phones": phone, "mes": text, "fmt": 3, "charset": "utf-8",
    })
    url = "https://smsc.ru/sys/send.php?" + params
    try:
        with urllib.request.urlopen(url, timeout=10) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return "error" not in data
    except Exception:
        return False

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
        f"SELECT u.id, u.email, u.phone, u.full_name, u.company, u.inn, u.created_at, u.role "
        f"FROM {SCHEMA}.sessions s JOIN {SCHEMA}.users u ON u.id = s.user_id "
        f"WHERE s.token = %s AND s.expires_at > NOW()",
        (token,)
    )
    row = cur.fetchone()
    if not row:
        return None
    return {"id": row[0], "email": row[1], "phone": row[2] or "",
            "full_name": row[3] or "", "company": row[4] or "",
            "inn": row[5] or "", "created_at": str(row[6]),
            "role": row[7] or "client"}


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

        if action == "send_code":
            phone = normalize_phone(body.get("phone", ""))
            if len(phone) < 11:
                return err("Укажите корректный номер телефона")
            cur.execute(
                f"SELECT id FROM {SCHEMA}.users WHERE phone = %s AND phone_verified = TRUE",
                (phone,)
            )
            if cur.fetchone():
                return err("Этот телефон уже зарегистрирован")
            code = f"{random.randint(1000, 9999)}"
            cur.execute(f"DELETE FROM {SCHEMA}.phone_codes WHERE phone = %s", (phone,))
            cur.execute(
                f"INSERT INTO {SCHEMA}.phone_codes (phone, code) VALUES (%s, %s)",
                (phone, code)
            )
            conn.commit()
            sent = send_sms(phone, f"Partcore: код подтверждения {code}")
            if not sent:
                return err("Не удалось отправить SMS. Попробуйте позже", 502)
            return ok({"message": "Код отправлен", "phone": phone})

        if action == "register":
            email = body.get("email", "").strip().lower()
            password = body.get("password", "")
            full_name = body.get("full_name", "").strip()
            phone = normalize_phone(body.get("phone", ""))
            company = body.get("company", "").strip()
            code = body.get("code", "").strip()

            if not email or not password:
                return err("Email и пароль обязательны")
            if len(password) < 6:
                return err("Пароль — минимум 6 символов")
            if len(phone) < 11:
                return err("Укажите корректный номер телефона")
            if not code:
                return err("Введите код из SMS")

            cur.execute(
                f"SELECT id, code, attempts FROM {SCHEMA}.phone_codes "
                f"WHERE phone = %s AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1",
                (phone,)
            )
            row = cur.fetchone()
            if not row:
                return err("Код истёк или не запрашивался")
            code_id, real_code, attempts = row
            if attempts >= 5:
                return err("Слишком много попыток. Запросите новый код")
            if code != real_code:
                cur.execute(f"UPDATE {SCHEMA}.phone_codes SET attempts = attempts + 1 WHERE id = %s", (code_id,))
                conn.commit()
                return err("Неверный код из SMS")

            cur.execute(f"SELECT id FROM {SCHEMA}.users WHERE email = %s", (email,))
            if cur.fetchone():
                return err("Пользователь с таким email уже существует")

            cur.execute(
                f"INSERT INTO {SCHEMA}.users (email, phone, password_hash, full_name, company, phone_verified) "
                f"VALUES (%s, %s, %s, %s, %s, TRUE) RETURNING id",
                (email, phone, hash_pw(password), full_name, company)
            )
            user_id = cur.fetchone()[0]
            cur.execute(f"DELETE FROM {SCHEMA}.phone_codes WHERE phone = %s", (phone,))
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

        if action == "list_users":
            if not token:
                return err("Не авторизован", 401)
            me = get_user_by_token(cur, token)
            if not me or me["role"] != "staff":
                return err("Доступ только для сотрудников", 403)
            cur.execute(
                f"SELECT id, email, full_name, phone, company, role, created_at "
                f"FROM {SCHEMA}.users ORDER BY id"
            )
            users = [
                {"id": r[0], "email": r[1], "full_name": r[2] or "",
                 "phone": r[3] or "", "company": r[4] or "",
                 "role": r[5] or "client", "created_at": str(r[6])}
                for r in cur.fetchall()
            ]
            return ok({"users": users})

        if action == "set_role":
            if not token:
                return err("Не авторизован", 401)
            me = get_user_by_token(cur, token)
            if not me or me["role"] != "staff":
                return err("Доступ только для сотрудников", 403)
            target_id = body.get("user_id")
            new_role = body.get("role", "")
            if new_role not in ("client", "staff"):
                return err("Недопустимая роль")
            if not target_id:
                return err("Не указан пользователь")
            if int(target_id) == me["id"] and new_role != "staff":
                return err("Нельзя снять роль сотрудника с самого себя")
            cur.execute(
                f"UPDATE {SCHEMA}.users SET role=%s, updated_at=NOW() WHERE id=%s",
                (new_role, int(target_id))
            )
            conn.commit()
            return ok({"message": "Роль обновлена"})

        if action == "logout":
            if token:
                cur.execute(f"DELETE FROM {SCHEMA}.sessions WHERE token = %s", (token,))
                conn.commit()
            return ok({"message": "Выход выполнен"})

        return err("Неизвестный action", 400)

    finally:
        conn.close()
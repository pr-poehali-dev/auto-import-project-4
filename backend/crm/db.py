import json
import os

import psycopg2

SCHEMA = "t_p64303579_auto_import_project_"
S = SCHEMA

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Session-Token",
}

STAGES = ["new", "in_work", "offer", "payment", "delivery", "won", "lost"]
STAGE_LABELS = {
    "new": "Новая", "in_work": "В работе", "offer": "Предложение отправлено",
    "payment": "Оплата", "delivery": "Доставка", "won": "Завершена", "lost": "Отказ",
}
CLOSED = ("won", "lost")


def connect():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def rows(cur):
    cols = [c[0] for c in cur.description]
    return [dict(zip(cols, r)) for r in cur.fetchall()]


def one(cur):
    r = rows(cur)
    return r[0] if r else None


def ok(data, status=200):
    return {"statusCode": status,
            "headers": {**CORS, "Content-Type": "application/json"},
            "body": json.dumps(data, ensure_ascii=False, default=str)}


def err(msg, status=400):
    return {"statusCode": status,
            "headers": {**CORS, "Content-Type": "application/json"},
            "body": json.dumps({"error": msg}, ensure_ascii=False)}


def get_user(cur, token: str):
    cur.execute(
        f"SELECT u.id, u.role, COALESCE(NULLIF(u.full_name, ''), u.email) AS name "
        f"FROM {S}.sessions s JOIN {S}.users u ON u.id = s.user_id "
        f"WHERE s.token = %s AND s.expires_at > NOW()",
        (token,)
    )
    return one(cur)


def to_int(v, default=None):
    try:
        return int(v) if v not in (None, "") else default
    except (TypeError, ValueError):
        return default


def log_event(cur, deal_id: int, author_id, kind: str, text: str):
    cur.execute(
        f"INSERT INTO {S}.crm_events (deal_id, author_id, kind, text) VALUES (%s, %s, %s, %s)",
        (deal_id, author_id, kind, text[:4000])
    )

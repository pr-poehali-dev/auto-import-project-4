"""
Схемы узлов с артикулами для каталогов направления Китай.
GET    /                 — количество схем по каждому каталогу (марке)
GET    /?catalog_id=haval — список схем марки
GET    /?id=5            — схема с таблицей артикулов
POST   /                 — сотрудник: создать или обновить схему вместе с артикулами
DELETE /?id=5            — сотрудник: удалить схему
"""
import base64
import json
import math
import os
import re
import uuid

import boto3
import psycopg2

DB = os.environ["DATABASE_URL"]
SCHEMA = "t_p64303579_auto_import_project_"

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Session-Token",
}


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
        f"SELECT u.id, u.role FROM {SCHEMA}.sessions s JOIN {SCHEMA}.users u ON u.id = s.user_id "
        f"WHERE s.token = %s AND s.expires_at > NOW()",
        (token,)
    )
    row = cur.fetchone()
    return (row[0], row[1] or "client") if row else (None, None)


def upload_image(data_url: str) -> str:
    header, b64 = data_url.split(",", 1)
    ext, ctype = "jpg", "image/jpeg"
    if "image/png" in header:
        ext, ctype = "png", "image/png"
    elif "image/webp" in header:
        ext, ctype = "webp", "image/webp"
    s3 = boto3.client(
        "s3",
        endpoint_url="https://bucket.poehali.dev",
        aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
        aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
    )
    key = f"parts-schemes/{uuid.uuid4().hex}.{ext}"
    s3.put_object(Bucket="files", Key=key, Body=base64.b64decode(b64), ContentType=ctype)
    return f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"


STOCK_VALUES = ("in_stock", "on_order", "out")


def parse_price(v):
    if v is None or v == "":
        return None
    if isinstance(v, (int, float)):
        return int(math.floor(v + 0.5)) if v >= 0 else None
    txt = str(v).replace(" ", "").replace("\u00a0", "")
    if not txt or txt.startswith("-"):
        return None
    txt = re.sub(r"[^\d.,]", "", txt)
    if not txt:
        return None
    if "," in txt and "." in txt:
        last = max(txt.rfind(","), txt.rfind("."))
        txt = re.sub(r"[.,]", "", txt[:last]) + "." + txt[last + 1:]
    elif re.fullmatch(r"\d{1,3}([.,]\d{3})+", txt):
        txt = re.sub(r"[.,]", "", txt)
    else:
        txt = txt.replace(",", ".")
    try:
        return int(math.floor(float(txt) + 0.5))
    except ValueError:
        return None


def clean_items(raw):
    items = []
    for i, it in enumerate(raw or []):
        if not isinstance(it, dict):
            continue
        pos = str(it.get("pos") or "").strip()[:16]
        article = str(it.get("article") or "").strip()[:64]
        name = str(it.get("name") or "").strip()[:255]
        note = str(it.get("note") or "").strip()[:255]
        if not article and not name:
            continue
        price = parse_price(it.get("price"))
        stock = str(it.get("stock") or "").strip()
        stock = stock if stock in STOCK_VALUES else ""
        try:
            qty = max(1, int(float(it.get("qty") or 1)))
        except (ValueError, TypeError):
            qty = 1
        items.append((pos, article, name, qty, note, price, stock, i))
    return items


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    headers = event.get("headers") or {}
    token = headers.get("X-Session-Token") or headers.get("x-session-token") or ""
    if not token:
        return err("Не авторизован", 401)
    query = event.get("queryStringParameters") or {}

    conn = psycopg2.connect(DB)
    try:
        cur = conn.cursor()
        user_id, role = get_user(cur, token)
        if not user_id:
            return err("Не авторизован", 401)
        is_staff = role == "staff"

        if method == "GET":
            scheme_id = query.get("id")
            if scheme_id:
                cur.execute(
                    f"SELECT id, catalog_id, model, title, image_url, sort_order, updated_at "
                    f"FROM {SCHEMA}.parts_schemes WHERE id = %s", (int(scheme_id),)
                )
                r = cur.fetchone()
                if not r:
                    return err("Схема не найдена", 404)
                cur.execute(
                    f"SELECT pos, article, name, qty, note, price, stock FROM {SCHEMA}.parts_scheme_items "
                    f"WHERE scheme_id = %s ORDER BY sort_order, id", (r[0],)
                )
                items = [{"pos": i[0], "article": i[1], "name": i[2], "qty": i[3], "note": i[4],
                          "price": i[5], "stock": i[6] or ""}
                         for i in cur.fetchall()]
                return ok({"scheme": {"id": r[0], "catalog_id": r[1], "model": r[2], "title": r[3],
                                      "image_url": r[4], "sort_order": r[5], "updated_at": str(r[6]),
                                      "items": items}})

            catalog_id = (query.get("catalog_id") or "").strip()
            if catalog_id:
                cur.execute(
                    f"SELECT s.id, s.catalog_id, s.model, s.title, s.image_url, s.sort_order, "
                    f"(SELECT COUNT(*) FROM {SCHEMA}.parts_scheme_items i WHERE i.scheme_id = s.id) "
                    f"FROM {SCHEMA}.parts_schemes s WHERE s.catalog_id = %s "
                    f"ORDER BY s.model, s.sort_order, s.id", (catalog_id,)
                )
                schemes = [{"id": r[0], "catalog_id": r[1], "model": r[2], "title": r[3],
                            "image_url": r[4], "sort_order": r[5], "items_count": r[6]}
                           for r in cur.fetchall()]
                return ok({"schemes": schemes})

            cur.execute(f"SELECT catalog_id, COUNT(*) FROM {SCHEMA}.parts_schemes GROUP BY catalog_id")
            return ok({"counts": {r[0]: r[1] for r in cur.fetchall()}})

        if not is_staff:
            return err("Доступно только сотрудникам", 403)

        if method == "POST":
            body = json.loads(event.get("body") or "{}")
            catalog_id = (body.get("catalog_id") or "").strip()[:32]
            title = (body.get("title") or "").strip()[:160]
            model = (body.get("model") or "").strip()[:64]
            if not catalog_id:
                return err("Не выбрана марка")
            if not title:
                return err("Укажите название узла")
            image = (body.get("image") or "").strip()
            if image.startswith("data:"):
                image = upload_image(image)
            try:
                sort_order = int(body.get("sort_order") or 0)
            except (ValueError, TypeError):
                sort_order = 0
            items = clean_items(body.get("items"))

            scheme_id = body.get("id")
            if scheme_id:
                scheme_id = int(scheme_id)
                cur.execute(
                    f"UPDATE {SCHEMA}.parts_schemes SET catalog_id=%s, model=%s, title=%s, image_url=%s, "
                    f"sort_order=%s, updated_at=NOW() WHERE id=%s",
                    (catalog_id, model, title, image, sort_order, scheme_id)
                )
                if cur.rowcount == 0:
                    return err("Схема не найдена", 404)
                cur.execute(f"DELETE FROM {SCHEMA}.parts_scheme_items WHERE scheme_id = %s", (scheme_id,))
            else:
                cur.execute(
                    f"INSERT INTO {SCHEMA}.parts_schemes (catalog_id, model, title, image_url, sort_order) "
                    f"VALUES (%s, %s, %s, %s, %s) RETURNING id",
                    (catalog_id, model, title, image, sort_order)
                )
                scheme_id = cur.fetchone()[0]

            for pos, article, name, qty, note, price, stock, i in items:
                cur.execute(
                    f"INSERT INTO {SCHEMA}.parts_scheme_items (scheme_id, pos, article, name, qty, note, price, stock, sort_order) "
                    f"VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)",
                    (scheme_id, pos, article, name, qty, note, price, stock, i)
                )
            conn.commit()
            return ok({"id": scheme_id, "image_url": image, "items_count": len(items),
                       "message": "Схема сохранена"})

        if method == "DELETE":
            scheme_id = query.get("id")
            if not scheme_id:
                return err("Не указана схема")
            cur.execute(f"DELETE FROM {SCHEMA}.parts_scheme_items WHERE scheme_id = %s", (int(scheme_id),))
            cur.execute(f"DELETE FROM {SCHEMA}.parts_schemes WHERE id = %s", (int(scheme_id),))
            conn.commit()
            return ok({"message": "Схема удалена"})

        return err("Метод не поддерживается", 405)
    finally:
        conn.close()

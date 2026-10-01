"""
Запросы наличия автозапчастей (направление Китай).
GET  / — клиент: свои запросы; сотрудник: все запросы с данными клиента
POST / — создать запрос наличия по группе запчастей (+ уведомление сотрудникам в Telegram)
PATCH / — сотрудник: сменить статус запроса
"""
import html
import json
import os
import time
import urllib.request

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


TG_LIMIT = 4096


def ensure_deal(cur, req: dict, user_id: int):
    """Сразу заводим сделку CRM для запроса, чтобы кнопки в Telegram работали с первой секунды."""
    title = "Запчасти: " + " ".join(x for x in (req["car_brand"], req["car_model"]) if x) + " · " + req["category_title"]
    cur.execute(
        f"INSERT INTO {SCHEMA}.crm_deals (source_type, source_id, client_id, title, stage) "
        f"VALUES ('parts', %s, %s, %s, 'new') ON CONFLICT (source_type, source_id) WHERE source_id IS NOT NULL DO NOTHING RETURNING id",
        (req["id"], user_id, title[:255]))
    r = cur.fetchone()
    if r:
        cur.execute(f"INSERT INTO {SCHEMA}.crm_events (deal_id, kind, text) VALUES (%s, 'system', %s)",
                    (r[0], "Сделка создана из заявки клиента"))
        return r[0]
    cur.execute(f"SELECT id FROM {SCHEMA}.crm_deals WHERE source_type = 'parts' AND source_id = %s", (req["id"],))
    r = cur.fetchone()
    return r[0] if r else None


def notify_telegram(req: dict, cur=None, conn=None, deal_id=None) -> None:
    """Сообщение сотрудникам о новом запросе. Без ключей или при сбое Telegram — молча пропускаем."""
    token = os.environ.get("TELEGRAM_BOT_TOKEN", "").strip()
    chat_ids = [c.strip() for c in os.environ.get("TELEGRAM_CHAT_ID", "").replace(";", ",").split(",") if c.strip()]
    if not token or not chat_ids:
        return
    e = lambda v: html.escape(str(v or ""))
    car = " ".join(str(x) for x in (req["car_brand"], req["car_model"], req["car_year"]) if x)
    lines = [f"<b>🔧 Новый запрос запчастей №{req['id']}</b>", "",
             f"<b>Авто:</b> {e(car)}"]
    if req["vin"]:
        lines.append(f"<b>VIN:</b> <code>{e(req['vin'])}</code>")
    lines.append(f"<b>Раздел:</b> {e(req['category_title'])}")
    client = ", ".join(x for x in (req["client_name"], req["client_company"]) if x) or "—"
    lines.append(f"<b>Клиент:</b> {e(client)}")
    contacts = " · ".join(x for x in (req["client_phone"], req["client_email"]) if x)
    if contacts:
        lines.append(f"<b>Контакты:</b> {e(contacts)}")
    footer = []
    if req["comment"]:
        footer = ["", f"<b>Комментарий:</b> {e(req['comment'])}"]

    head = "\n".join(lines)
    parts = [p.strip() for p in (req["parts_text"] or "").split("\n") if p.strip()]
    if parts:
        block = ["", f"<b>Позиции ({len(parts)}):</b>"]
        budget = TG_LIMIT - len(head) - len("\n".join(footer)) - 120
        for n, p in enumerate(parts, 1):
            row = f"{n}. {e(p)}"
            if len("\n".join(block)) + len(row) > budget:
                block.append(f"… и ещё {len(parts) - n + 1} — полный список в кабинете")
                break
            block.append(row)
        text = head + "\n" + "\n".join(block) + "\n".join([""] + footer if footer else [])
    else:
        text = head + "\n".join([""] + footer if footer else [])
    text = text[:TG_LIMIT - 260]
    base_text = text
    if deal_id:
        text += ("\n\n━━━━━━━━━━━━\n<b>Статус:</b> 🔵 Новая\n<b>Ответственный:</b> не назначен")
    markup = {"inline_keyboard": [[{"text": "🙋 Взять в работу", "callback_data": f"d:{deal_id}:take"}]]} if deal_id else None

    deadline = time.monotonic() + 3.0
    for chat_id in chat_ids:
        left = deadline - time.monotonic()
        if left < 0.3:
            print(f"telegram notify skipped for chat {chat_id}: time budget exhausted")
            continue
        try:
            payload = {"chat_id": chat_id, "text": text, "parse_mode": "HTML", "disable_web_page_preview": True}
            if markup:
                payload["reply_markup"] = markup
            r = urllib.request.Request(f"https://api.telegram.org/bot{token}/sendMessage",
                                       data=json.dumps(payload).encode(),
                                       headers={"Content-Type": "application/json"})
            res = json.loads(urllib.request.urlopen(r, timeout=left).read())
            msg_id = (res.get("result") or {}).get("message_id")
            if deal_id and msg_id and cur is not None:
                cur.execute(
                    f"INSERT INTO {SCHEMA}.crm_tg_messages (deal_id, chat_id, message_id, base_text) "
                    f"VALUES (%s, %s, %s, %s) ON CONFLICT DO NOTHING",
                    (deal_id, str(chat_id), msg_id, base_text))
                conn.commit()
        except Exception as ex:
            print(f"telegram notify failed for chat {chat_id}: {type(ex).__name__}")


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

            cur.execute(f"SELECT full_name, company, phone, email FROM {SCHEMA}.users WHERE id = %s", (user_id,))
            u = cur.fetchone() or ("", "", "", "")
            req_info = {
                "id": row[0], "car_brand": car_brand,
                "car_model": (body.get("car_model") or "").strip()[:64], "car_year": year,
                "vin": (body.get("vin") or "").strip().upper()[:32],
                "category_title": category_title,
                "parts_text": (body.get("parts_text") or "").strip(),
                "comment": (body.get("comment") or "").strip(),
                "client_name": u[0] or "", "client_company": u[1] or "",
                "client_phone": u[2] or "", "client_email": u[3] or "",
            }
            deal_id = None
            try:
                deal_id = ensure_deal(cur, req_info, user_id)
                conn.commit()
            except Exception as ex:
                conn.rollback()
                print(f"crm deal create failed: {type(ex).__name__}")
            notify_telegram(req_info, cur, conn, deal_id)
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

"""
CRM для сотрудников: воронка сделок, карточка клиента, ответственные, комментарии и история,
задачи с напоминаниями в Telegram, отчёты.
GET  ?view=board|deal|client|clients|tasks|report|staff
POST {action: create|update|move|comment|task_add|task_done|task_delete|remind|my_telegram}
"""
import json
import time
from datetime import datetime, timedelta, timezone

from db import S, STAGES, STAGE_LABELS, CLOSED, connect, rows, one, ok, err, get_user, to_int, log_event
from telegram import send, chats_for_user, esc

DEAL_COLS = (
    "d.id, d.source_type, d.source_id, d.client_id, d.title, d.stage, d.manager_id, d.amount, "
    "d.lost_reason, d.created_at, d.updated_at, d.stage_changed_at, d.closed_at, "
    "COALESCE(NULLIF(c.full_name, ''), NULLIF(d.contact_name, ''), c.email, '') AS client_name, "
    "COALESCE(c.company, '') AS client_company, "
    "COALESCE(NULLIF(c.phone, ''), d.contact_phone, '') AS client_phone, COALESCE(c.email, '') AS client_email, "
    "COALESCE(NULLIF(m.full_name, ''), m.email, '') AS manager_name, "
    "(SELECT COUNT(*) FROM {S}.crm_tasks t WHERE t.deal_id = d.id AND NOT t.done) AS open_tasks, "
    "(SELECT MIN(t.due_at) FROM {S}.crm_tasks t WHERE t.deal_id = d.id AND NOT t.done) AS next_task_at"
).replace("{S}", S)
DEAL_FROM = f"FROM {S}.crm_deals d LEFT JOIN {S}.users c ON c.id = d.client_id LEFT JOIN {S}.users m ON m.id = d.manager_id"

TASK_COLS = (
    "t.id, t.deal_id, t.client_id, t.assignee_id, t.title, t.due_at, t.done, t.done_at, t.created_at, "
    "COALESCE(NULLIF(a.full_name, ''), a.email, '') AS assignee_name, COALESCE(d.title, '') AS deal_title, "
    "COALESCE(NULLIF(c.full_name, ''), c.email, '') AS client_name"
)
TASK_FROM = (f"FROM {S}.crm_tasks t LEFT JOIN {S}.users a ON a.id = t.assignee_id "
             f"LEFT JOIN {S}.crm_deals d ON d.id = t.deal_id LEFT JOIN {S}.users c ON c.id = COALESCE(t.client_id, d.client_id)")


def sync_sources(cur):
    """Новые заявки на авто и запросы запчастей автоматически становятся сделками."""
    cur.execute(
        f"INSERT INTO {S}.crm_deals (source_type, source_id, client_id, title, stage, amount, created_at, updated_at, stage_changed_at, closed_at) "
        f"SELECT 'order', o.id, o.user_id, "
        f"CONCAT('Авто: ', CONCAT_WS(' ', o.car_brand, o.car_model, o.car_year::text), ' · ', o.order_number), "
        f"CASE WHEN o.status IN ('processing','auction') THEN 'in_work' "
        f"     WHEN o.status IN ('teardown','shipped','customs') THEN 'delivery' "
        f"     WHEN o.status IN ('delivered','done') THEN 'won' ELSE 'new' END, "
        f"o.budget, COALESCE(o.created_at, NOW()), COALESCE(o.created_at, NOW()), COALESCE(o.created_at, NOW()), "
        f"CASE WHEN o.status IN ('delivered','done') THEN COALESCE(o.updated_at, NOW()) END "
        f"FROM {S}.orders o WHERE NOT EXISTS (SELECT 1 FROM {S}.crm_deals x WHERE x.source_type = 'order' AND x.source_id = o.id)"
    )
    created = cur.rowcount
    cur.execute(
        f"INSERT INTO {S}.crm_deals (source_type, source_id, client_id, title, stage, created_at, updated_at, stage_changed_at, closed_at) "
        f"SELECT 'parts', r.id, r.user_id, "
        f"CONCAT('Запчасти: ', CONCAT_WS(' ', r.car_brand, r.car_model), ' · ', r.category_title), "
        f"CASE r.status WHEN 'processing' THEN 'in_work' WHEN 'answered' THEN 'offer' WHEN 'closed' THEN 'won' ELSE 'new' END, "
        f"r.created_at, r.created_at, r.created_at, CASE WHEN r.status = 'closed' THEN r.created_at END "
        f"FROM {S}.parts_requests r WHERE NOT EXISTS (SELECT 1 FROM {S}.crm_deals x WHERE x.source_type = 'parts' AND x.source_id = r.id)"
    )
    created += cur.rowcount
    if created:
        cur.execute(
            f"INSERT INTO {S}.crm_events (deal_id, kind, text, created_at) "
            f"SELECT d.id, 'system', 'Сделка создана из заявки клиента', d.created_at FROM {S}.crm_deals d "
            f"WHERE d.source_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM {S}.crm_events e WHERE e.deal_id = d.id)"
        )
    return created


def source_details(cur, deal):
    if deal["source_type"] == "order" and deal["source_id"]:
        cur.execute(
            f"SELECT order_number, car_brand, car_model, car_year, quantity, budget, comment, origin, status "
            f"FROM {S}.orders WHERE id = %s", (deal["source_id"],))
        return one(cur)
    if deal["source_type"] == "parts" and deal["source_id"]:
        cur.execute(
            f"SELECT category_title, car_brand, car_model, car_year, vin, parts_text, comment, status "
            f"FROM {S}.parts_requests WHERE id = %s", (deal["source_id"],))
        return one(cur)
    return None


MSK = timezone(timedelta(hours=3))


def msk(dt) -> str:
    return dt.astimezone(MSK).strftime("%d.%m.%Y %H:%M") if dt else ""


def get_deal(cur, deal_id):
    cur.execute(f"SELECT {DEAL_COLS} {DEAL_FROM} WHERE d.id = %s", (deal_id,))
    return one(cur)


def staff_name(cur, uid):
    if not uid:
        return "—"
    cur.execute(f"SELECT COALESCE(NULLIF(full_name, ''), email) FROM {S}.users WHERE id = %s", (uid,))
    r = cur.fetchone()
    return r[0] if r else "—"


def notify_assigned(cur, deal, manager_id, by_name):
    chats, personal = chats_for_user(cur, manager_id)
    if not personal:
        return
    send(chats, f"<b>📌 Вам назначена сделка №{deal['id']}</b>\n{esc(deal['title'])}\n"
                f"Клиент: {esc(deal['client_name'] or '—')}\nНазначил: {esc(by_name)}", budget=2.0)


def handle_get(cur, conn, me, q):
    view = q.get("view") or "board"

    if view == "staff":
        cur.execute(f"SELECT id, COALESCE(NULLIF(full_name, ''), email) AS name, telegram_chat_id "
                    f"FROM {S}.users WHERE role = 'staff' ORDER BY name")
        staff = rows(cur)
        return ok({"staff": [{"id": s["id"], "name": s["name"]} for s in staff], "me": me["id"],
                   "my_telegram": next((s["telegram_chat_id"] for s in staff if s["id"] == me["id"]), ""),
                   "stages": [{"id": s, "label": STAGE_LABELS[s]} for s in STAGES]})

    if view == "board":
        if sync_sources(cur):
            conn.commit()
        where, args = ["(d.stage NOT IN ('won','lost') OR d.updated_at > NOW() - INTERVAL '30 days')"], []
        manager = q.get("manager") or ""
        if manager == "me":
            where.append("d.manager_id = %s"); args.append(me["id"])
        elif manager == "none":
            where.append("d.manager_id IS NULL")
        elif to_int(manager):
            where.append("d.manager_id = %s"); args.append(to_int(manager))
        if q.get("source") in ("order", "parts", "manual"):
            where.append("d.source_type = %s"); args.append(q["source"])
        search = (q.get("q") or "").strip()
        if search:
            where.append("(d.title ILIKE %s OR c.full_name ILIKE %s OR c.company ILIKE %s OR c.phone ILIKE %s "
                         "OR c.email ILIKE %s OR d.contact_name ILIKE %s OR d.contact_phone ILIKE %s OR d.id::text = %s)")
            like = f"%{search}%"
            args += [like] * 7 + [search]
        cur.execute(f"SELECT {DEAL_COLS} {DEAL_FROM} WHERE {' AND '.join(where)} "
                    f"ORDER BY d.updated_at DESC LIMIT 600", tuple(args))
        return ok({"deals": rows(cur)})

    if view == "deal":
        deal_id = to_int(q.get("id"))
        deal = get_deal(cur, deal_id) if deal_id else None
        if not deal:
            return err("Сделка не найдена", 404)
        cur.execute(
            f"SELECT e.id, e.kind, e.text, e.created_at, COALESCE(NULLIF(u.full_name, ''), u.email, '') AS author "
            f"FROM {S}.crm_events e LEFT JOIN {S}.users u ON u.id = e.author_id "
            f"WHERE e.deal_id = %s ORDER BY e.created_at DESC, e.id DESC LIMIT 300", (deal_id,))
        events = rows(cur)
        cur.execute(f"SELECT {TASK_COLS} {TASK_FROM} WHERE t.deal_id = %s ORDER BY t.done, t.due_at", (deal_id,))
        return ok({"deal": deal, "source": source_details(cur, deal), "events": events, "tasks": rows(cur)})

    if view == "clients":
        search = (q.get("q") or "").strip()
        args, where = [], "u.role = 'client'"
        if search:
            like = f"%{search}%"
            where += " AND (u.full_name ILIKE %s OR u.company ILIKE %s OR u.phone ILIKE %s OR u.email ILIKE %s OR u.inn ILIKE %s)"
            args = [like] * 5
        cur.execute(
            f"SELECT u.id, COALESCE(NULLIF(u.full_name, ''), u.email) AS name, COALESCE(u.company, '') AS company, "
            f"COALESCE(u.phone, '') AS phone, u.email, u.created_at, "
            f"(SELECT COUNT(*) FROM {S}.crm_deals d WHERE d.client_id = u.id) AS deals_total, "
            f"(SELECT COUNT(*) FROM {S}.crm_deals d WHERE d.client_id = u.id AND d.stage NOT IN ('won','lost')) AS deals_open, "
            f"(SELECT COALESCE(SUM(d.amount), 0) FROM {S}.crm_deals d WHERE d.client_id = u.id AND d.stage = 'won') AS won_amount, "
            f"(SELECT MAX(d.updated_at) FROM {S}.crm_deals d WHERE d.client_id = u.id) AS last_activity "
            f"FROM {S}.users u WHERE {where} ORDER BY last_activity DESC NULLS LAST, u.created_at DESC LIMIT 300",
            tuple(args))
        return ok({"clients": rows(cur)})

    if view == "client":
        cid = to_int(q.get("id"))
        cur.execute(f"SELECT id, email, COALESCE(phone, '') AS phone, COALESCE(full_name, '') AS full_name, "
                    f"COALESCE(company, '') AS company, COALESCE(inn, '') AS inn, created_at, phone_verified "
                    f"FROM {S}.users WHERE id = %s", (cid,))
        client = one(cur)
        if not client:
            return err("Клиент не найден", 404)
        cur.execute(f"SELECT {DEAL_COLS} {DEAL_FROM} WHERE d.client_id = %s ORDER BY d.created_at DESC", (cid,))
        deals = rows(cur)
        cur.execute(f"SELECT id, order_number, car_brand, car_model, car_year, budget, status, created_at "
                    f"FROM {S}.orders WHERE user_id = %s ORDER BY created_at DESC", (cid,))
        orders = rows(cur)
        cur.execute(f"SELECT id, category_title, car_brand, car_model, vin, status, created_at "
                    f"FROM {S}.parts_requests WHERE user_id = %s ORDER BY created_at DESC", (cid,))
        parts = rows(cur)
        cur.execute(f"SELECT c.id, c.car_brand, c.car_model, c.car_year, c.vin, c.price, o.order_number "
                    f"FROM {S}.cars c JOIN {S}.orders o ON o.id = c.order_id WHERE o.user_id = %s "
                    f"ORDER BY c.created_at DESC", (cid,))
        cars = rows(cur)
        cur.execute(f"SELECT COUNT(*) FROM {S}.documents WHERE user_id = %s", (cid,))
        docs = cur.fetchone()[0]
        cur.execute(f"SELECT {TASK_COLS} {TASK_FROM} WHERE t.client_id = %s OR d.client_id = %s "
                    f"ORDER BY t.done, t.due_at LIMIT 100", (cid, cid))
        tasks = rows(cur)
        won = [d for d in deals if d["stage"] == "won"]
        stats = {"deals_total": len(deals), "deals_open": len([d for d in deals if d["stage"] not in CLOSED]),
                 "deals_won": len(won), "won_amount": sum(d["amount"] or 0 for d in won),
                 "orders": len(orders), "parts_requests": len(parts), "cars": len(cars), "documents": docs}
        return ok({"client": client, "stats": stats, "deals": deals, "orders": orders,
                   "parts_requests": parts, "cars": cars, "tasks": tasks})

    if view == "tasks":
        scope = q.get("scope") or "mine"
        where, args = ["NOT t.done"], []
        if scope == "mine":
            where.append("t.assignee_id = %s"); args.append(me["id"])
        elif scope == "done":
            where = ["t.done", "t.done_at > NOW() - INTERVAL '14 days'"]
        cur.execute(f"SELECT {TASK_COLS} {TASK_FROM} WHERE {' AND '.join(where)} "
                    f"ORDER BY {'t.done_at DESC' if scope == 'done' else 't.due_at'} LIMIT 300", tuple(args))
        tasks = rows(cur)
        cur.execute(f"SELECT COUNT(*) FROM {S}.crm_tasks WHERE NOT done AND assignee_id = %s AND due_at <= NOW()", (me["id"],))
        return ok({"tasks": tasks, "my_overdue": cur.fetchone()[0]})

    if view == "report":
        date_from = (q.get("from") or "").strip()[:10]
        date_to = (q.get("to") or "").strip()[:10]
        if not date_from or not date_to:
            return err("Укажите период")
        try:
            d_from = datetime.strptime(date_from, "%Y-%m-%d")
            d_to = datetime.strptime(date_to, "%Y-%m-%d") + timedelta(days=1)
        except ValueError:
            return err("Неверный формат даты")
        if d_to <= d_from:
            return err("Дата «по» раньше даты «с»")
        period = (d_from.strftime("%Y-%m-%d 00:00:00+03"), d_to.strftime("%Y-%m-%d 00:00:00+03"))
        rng = ">= (%s::timestamptz) AND {col} < (%s::timestamptz)"
        cur.execute(
            f"SELECT COUNT(*) FILTER (WHERE d.created_at {rng.format(col='d.created_at')}) AS created, "
            f"COUNT(*) FILTER (WHERE d.stage = 'won' AND d.closed_at {rng.format(col='d.closed_at')}) AS won, "
            f"COUNT(*) FILTER (WHERE d.stage = 'lost' AND d.closed_at {rng.format(col='d.closed_at')}) AS lost, "
            f"COALESCE(SUM(d.amount) FILTER (WHERE d.stage = 'won' AND d.closed_at {rng.format(col='d.closed_at')}), 0) AS won_amount, "
            f"COUNT(*) FILTER (WHERE d.stage NOT IN ('won','lost')) AS open_now, "
            f"COALESCE(SUM(d.amount) FILTER (WHERE d.stage NOT IN ('won','lost')), 0) AS open_amount, "
            f"AVG(EXTRACT(EPOCH FROM (d.closed_at - d.created_at)) / 86400) FILTER (WHERE d.stage = 'won' AND d.closed_at {rng.format(col='d.closed_at')}) AS avg_days "
            f"FROM {S}.crm_deals d", period * 5)
        totals = one(cur)
        cur.execute(
            f"SELECT d.manager_id, COALESCE(NULLIF(m.full_name, ''), m.email, 'Без ответственного') AS name, "
            f"COUNT(*) FILTER (WHERE d.created_at {rng.format(col='d.created_at')}) AS created, "
            f"COUNT(*) FILTER (WHERE d.stage = 'won' AND d.closed_at {rng.format(col='d.closed_at')}) AS won, "
            f"COUNT(*) FILTER (WHERE d.stage = 'lost' AND d.closed_at {rng.format(col='d.closed_at')}) AS lost, "
            f"COALESCE(SUM(d.amount) FILTER (WHERE d.stage = 'won' AND d.closed_at {rng.format(col='d.closed_at')}), 0) AS won_amount, "
            f"COUNT(*) FILTER (WHERE d.stage NOT IN ('won','lost')) AS open_now "
            f"FROM {S}.crm_deals d LEFT JOIN {S}.users m ON m.id = d.manager_id "
            f"GROUP BY d.manager_id, name ORDER BY won_amount DESC, won DESC", period * 4)
        by_manager = [r for r in rows(cur) if r["created"] or r["won"] or r["lost"] or r["open_now"]]
        cur.execute(
            f"SELECT d.source_type AS source, COUNT(*) AS created, "
            f"COUNT(*) FILTER (WHERE d.stage = 'won') AS won "
            f"FROM {S}.crm_deals d WHERE d.created_at {rng.format(col='d.created_at')} GROUP BY d.source_type", period)
        by_source = rows(cur)
        cur.execute(f"SELECT stage, COUNT(*) AS count, COALESCE(SUM(amount), 0) AS amount "
                    f"FROM {S}.crm_deals WHERE stage NOT IN ('won','lost') GROUP BY stage")
        funnel = {r["stage"]: r for r in rows(cur)}
        cur.execute(f"SELECT created_at FROM {S}.crm_deals d WHERE d.created_at {rng.format(col='d.created_at')}", period)
        per_day = {}
        for (created,) in cur.fetchall():
            day = created.astimezone(MSK).strftime("%Y-%m-%d")
            per_day[day] = per_day.get(day, 0) + 1
        daily = [{"day": k, "created": v} for k, v in sorted(per_day.items())]
        cur.execute(f"SELECT COUNT(*) FROM {S}.crm_tasks WHERE NOT done AND due_at < NOW()")
        overdue = cur.fetchone()[0]
        return ok({"totals": totals, "by_manager": by_manager, "by_source": by_source, "daily": daily,
                   "funnel": [{"stage": s, "label": STAGE_LABELS[s], "count": funnel.get(s, {}).get("count", 0),
                               "amount": funnel.get(s, {}).get("amount", 0)} for s in STAGES if s not in CLOSED],
                   "overdue_tasks": overdue})

    return err("Неизвестный раздел")


def handle_post(cur, conn, me, body):
    action = body.get("action") or ""

    if action == "remind":
        cur.execute(
            f"UPDATE {S}.crm_tasks SET reminded_at = NOW() WHERE id IN ("
            f"SELECT id FROM {S}.crm_tasks WHERE NOT done AND reminded_at IS NULL AND due_at <= NOW() "
            f"ORDER BY due_at LIMIT 10 FOR UPDATE SKIP LOCKED) RETURNING id")
        ids = [r[0] for r in cur.fetchall()]
        conn.commit()
        sent = 0
        deadline = time.monotonic() + 3.2
        for n, tid in enumerate(ids):
            if time.monotonic() > deadline:
                cur.execute(f"UPDATE {S}.crm_tasks SET reminded_at = NULL WHERE id = ANY(%s)", (ids[n:],))
                conn.commit()
                break
            cur.execute(f"SELECT {TASK_COLS}, COALESCE(c.phone, '') AS client_phone {TASK_FROM} WHERE t.id = %s", (tid,))
            t = one(cur)
            chats, personal = chats_for_user(cur, t["assignee_id"])
            who = "" if personal else f"\nОтветственный: {esc(t['assignee_name'] or '—')}"
            lines = [f"<b>⏰ Напоминание: {esc(t['title'])}</b>", f"Срок: {msk(t['due_at'])} (МСК)"]
            if t["deal_title"]:
                lines.append(f"Сделка №{t['deal_id']}: {esc(t['deal_title'])}")
            if t["client_name"]:
                lines.append(f"Клиент: {esc(t['client_name'])}" + (f" · {esc(t['client_phone'])}" if t["client_phone"] else ""))
            sent += send(chats, "\n".join(lines) + who, budget=1.2)
        return ok({"due": len(ids), "sent": sent})

    if action == "my_telegram":
        chat_id = "".join(ch for ch in str(body.get("chat_id") or "") if ch.isdigit() or ch == "-")[:32]
        cur.execute(f"UPDATE {S}.users SET telegram_chat_id = %s WHERE id = %s", (chat_id, me["id"]))
        conn.commit()
        delivered = send([chat_id], "✅ Напоминания CRM будут приходить сюда.") if chat_id else 0
        return ok({"chat_id": chat_id, "test_sent": bool(delivered)})

    if action == "create":
        title = (body.get("title") or "").strip()[:255]
        if not title:
            return err("Укажите название сделки")
        stage = body.get("stage") if body.get("stage") in STAGES else "new"
        client_id = to_int(body.get("client_id"))
        manager_id = to_int(body.get("manager_id"), me["id"])
        cur.execute(
            f"INSERT INTO {S}.crm_deals (source_type, client_id, contact_name, contact_phone, title, stage, manager_id, amount, closed_at) "
            f"VALUES ('manual', %s, %s, %s, %s, %s, %s, %s, CASE WHEN %s IN ('won','lost') THEN NOW() END) RETURNING id",
            (client_id, (body.get("contact_name") or "").strip()[:255], (body.get("contact_phone") or "").strip()[:64],
             title, stage, manager_id, to_int(body.get("amount")), stage))
        deal_id = cur.fetchone()[0]
        log_event(cur, deal_id, me["id"], "system", f"Сделка создана вручную · этап «{STAGE_LABELS[stage]}»")
        conn.commit()
        return ok({"id": deal_id})

    deal_id = to_int(body.get("deal_id"))

    if action == "move":
        stage = body.get("stage")
        if stage not in STAGES:
            return err("Неизвестный этап")
        deal = get_deal(cur, deal_id)
        if not deal:
            return err("Сделка не найдена", 404)
        if deal["stage"] == stage:
            return ok({"deal": deal})
        reason = (body.get("lost_reason") or "").strip()[:1000]
        if stage == "lost" and not reason:
            return err("Укажите причину отказа")
        cur.execute(
            f"UPDATE {S}.crm_deals SET stage = %s, stage_changed_at = NOW(), updated_at = NOW(), "
            f"closed_at = CASE WHEN %s IN ('won','lost') THEN NOW() ELSE NULL END, "
            f"lost_reason = CASE WHEN %s = 'lost' THEN %s ELSE '' END, "
            f"manager_id = COALESCE(manager_id, %s) WHERE id = %s",
            (stage, stage, stage, reason, me["id"], deal_id))
        text = f"Этап: «{STAGE_LABELS[deal['stage']]}» → «{STAGE_LABELS[stage]}»"
        if reason:
            text += f". Причина: {reason}"
        log_event(cur, deal_id, me["id"], "stage", text)
        if not deal["manager_id"]:
            log_event(cur, deal_id, me["id"], "manager", f"Ответственный: {me['name']}")
        conn.commit()
        return ok({"deal": get_deal(cur, deal_id)})

    if action == "update":
        deal = get_deal(cur, deal_id)
        if not deal:
            return err("Сделка не найдена", 404)
        changes = []
        if "title" in body:
            title = (body.get("title") or "").strip()[:255]
            if not title:
                return err("Название не может быть пустым")
            if title != deal["title"]:
                cur.execute(f"UPDATE {S}.crm_deals SET title = %s WHERE id = %s", (title, deal_id))
                changes.append(("system", f"Название: {title}"))
        if "amount" in body:
            amount = to_int(body.get("amount"))
            if amount is not None and amount < 0:
                return err("Сумма не может быть отрицательной")
            if amount != deal["amount"]:
                cur.execute(f"UPDATE {S}.crm_deals SET amount = %s WHERE id = %s", (amount, deal_id))
                changes.append(("amount", f"Сумма: {amount:,} ₽".replace(",", " ") if amount is not None else "Сумма очищена"))
        if "manager_id" in body:
            manager_id = to_int(body.get("manager_id"))
            if manager_id != deal["manager_id"]:
                cur.execute(f"UPDATE {S}.crm_deals SET manager_id = %s WHERE id = %s", (manager_id, deal_id))
                changes.append(("manager", f"Ответственный: {staff_name(cur, manager_id) if manager_id else 'не назначен'}"))
        if "client_id" in body:
            client_id = to_int(body.get("client_id"))
            if client_id != deal["client_id"]:
                cur.execute(f"UPDATE {S}.crm_deals SET client_id = %s WHERE id = %s", (client_id, deal_id))
                changes.append(("system", "Клиент изменён"))
        if not changes:
            return ok({"deal": deal})
        cur.execute(f"UPDATE {S}.crm_deals SET updated_at = NOW() WHERE id = %s", (deal_id,))
        for kind, text in changes:
            log_event(cur, deal_id, me["id"], kind, text)
        conn.commit()
        updated = get_deal(cur, deal_id)
        new_manager = to_int(body.get("manager_id")) if "manager_id" in body else None
        if new_manager and new_manager != deal["manager_id"] and new_manager != me["id"]:
            notify_assigned(cur, updated, new_manager, me["name"])
        return ok({"deal": updated})

    if action == "comment":
        text = (body.get("text") or "").strip()
        if not text:
            return err("Пустой комментарий")
        if not get_deal(cur, deal_id):
            return err("Сделка не найдена", 404)
        log_event(cur, deal_id, me["id"], "comment", text)
        cur.execute(f"UPDATE {S}.crm_deals SET updated_at = NOW() WHERE id = %s", (deal_id,))
        conn.commit()
        return ok({"ok": True})

    if action == "task_add":
        title = (body.get("title") or "").strip()[:255]
        due_at = (body.get("due_at") or "").strip()
        if not title or not due_at:
            return err("Укажите задачу и срок")
        assignee = to_int(body.get("assignee_id"), me["id"])
        client_id = to_int(body.get("client_id"))
        if deal_id and not client_id:
            d = get_deal(cur, deal_id)
            if not d:
                return err("Сделка не найдена", 404)
            client_id = d["client_id"]
        cur.execute(
            f"INSERT INTO {S}.crm_tasks (deal_id, client_id, assignee_id, author_id, title, due_at) "
            f"VALUES (%s, %s, %s, %s, %s, %s::timestamptz) RETURNING id, due_at",
            (deal_id, client_id, assignee, me["id"], title, due_at))
        tid, due = cur.fetchone()
        if deal_id:
            log_event(cur, deal_id, me["id"], "task", f"Задача: {title} · до {msk(due)} · {staff_name(cur, assignee)}")
            cur.execute(f"UPDATE {S}.crm_deals SET updated_at = NOW() WHERE id = %s", (deal_id,))
        conn.commit()
        if assignee != me["id"]:
            chats, personal = chats_for_user(cur, assignee)
            if personal:
                send(chats, f"<b>📝 Новая задача от {esc(me['name'])}</b>\n{esc(title)}\nСрок: {msk(due)} (МСК)", budget=2.0)
        return ok({"id": tid, "due_at": due})

    if action in ("task_done", "task_delete"):
        tid = to_int(body.get("task_id"))
        cur.execute(f"SELECT id, deal_id, title, done FROM {S}.crm_tasks WHERE id = %s", (tid,))
        t = one(cur)
        if not t:
            return err("Задача не найдена", 404)
        if action == "task_delete":
            cur.execute(f"DELETE FROM {S}.crm_tasks WHERE id = %s", (tid,))
            note = f"Задача удалена: {t['title']}"
        else:
            done = bool(body.get("done", True))
            cur.execute(f"UPDATE {S}.crm_tasks SET done = %s, done_at = CASE WHEN %s THEN NOW() END WHERE id = %s",
                        (done, done, tid))
            note = f"{'Задача выполнена' if done else 'Задача возвращена в работу'}: {t['title']}"
        if t["deal_id"]:
            log_event(cur, t["deal_id"], me["id"], "task", note)
        conn.commit()
        return ok({"ok": True})

    return err("Неизвестное действие")


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": {"Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, X-Session-Token",
                "Access-Control-Max-Age": "86400"}, "body": ""}
    headers = event.get("headers") or {}
    token = headers.get("X-Session-Token") or headers.get("x-session-token") or ""
    if not token:
        return err("Не авторизован", 401)

    conn = connect()
    try:
        cur = conn.cursor()
        me = get_user(cur, token)
        if not me:
            return err("Не авторизован", 401)
        if me["role"] != "staff":
            return err("Доступно только сотрудникам", 403)
        if event.get("httpMethod") == "GET":
            return handle_get(cur, conn, me, event.get("queryStringParameters") or {})
        if event.get("httpMethod") == "POST":
            return handle_post(cur, conn, me, json.loads(event.get("body") or "{}"))
        return err("Метод не поддерживается", 405)
    finally:
        conn.close()

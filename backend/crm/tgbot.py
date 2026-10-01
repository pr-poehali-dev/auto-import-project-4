"""Обработка нажатий кнопок в Telegram-уведомлениях о сделках (webhook)."""
import re

from db import S, STAGES, STAGE_LABELS, CLOSED, one, log_event
from telegram import api, refresh_deal_messages, deal_for_tg, LOST_REASONS, webhook_secret

VIA = " (из Telegram)"


def answer(cb_id: str, text: str, alert: bool = False):
    api("answerCallbackQuery", {"callback_query_id": cb_id, "text": text[:200], "show_alert": alert}, timeout=1.2)


def staff_by_tg(cur, tg_user_id) -> dict:
    cur.execute(
        f"SELECT id, role, COALESCE(NULLIF(full_name, ''), email) AS name FROM {S}.users "
        f"WHERE telegram_chat_id = %s AND role = 'staff' LIMIT 1", (str(tg_user_id),))
    return one(cur)


def handle_update(cur, conn, update: dict, apply_move, apply_take) -> dict:
    cb = update.get("callback_query")
    if not cb:
        msg = update.get("message") or {}
        text = (msg.get("text") or "").strip()
        chat = (msg.get("chat") or {}).get("id")
        if chat and text.startswith(("/start", "/id")) and (msg.get("chat") or {}).get("type") == "private":
            uid = (msg.get("from") or {}).get("id")
            api("sendMessage", {"chat_id": chat, "parse_mode": "HTML",
                                "text": f"Ваш Telegram ID: <code>{uid}</code>\n\nВставьте его в CRM → Задачи → «Напоминания в Telegram». "
                                        f"После этого вы сможете брать запросы в работу кнопками в уведомлениях."}, timeout=1.5)
        return {"ok": True}

    cb_id = cb.get("id", "")
    data = cb.get("data") or ""
    m = re.fullmatch(r"d:(\d+):(take|back|lostmenu|st:[a-z_]+|lost:\d+)", data)
    if not m:
        answer(cb_id, "Кнопка устарела")
        return {"ok": True}
    deal_id, action = int(m.group(1)), m.group(2)
    message = cb.get("message") or {}
    chat_id = (message.get("chat") or {}).get("id")
    message_id = message.get("message_id")

    me = staff_by_tg(cur, (cb.get("from") or {}).get("id"))
    if not me:
        answer(cb_id, "Вы не привязаны к CRM. Напишите боту /start в личке, скопируйте ID и вставьте его "
                      "на сайте: CRM → Задачи → «Напоминания в Telegram».", alert=True)
        return {"ok": True}

    deal = deal_for_tg(cur, deal_id)
    if not deal:
        answer(cb_id, "Сделка не найдена", alert=True)
        return {"ok": True}
    cur.execute(f"SELECT stage, manager_id FROM {S}.crm_deals WHERE id = %s FOR UPDATE", (deal_id,))
    stage_now, manager_now = cur.fetchone()
    deal = {**deal, "stage": stage_now, "manager_id": manager_now}

    if action == "lostmenu":
        if deal["stage"] in CLOSED:
            answer(cb_id, "Сделка уже закрыта")
        else:
            answer(cb_id, "Выберите причину отказа")
        conn.commit()
        refresh_deal_messages(cur, deal_id, budget=1.5,
                              menu_for=(chat_id, message_id) if deal["stage"] not in CLOSED else None)
        return {"ok": True}

    if action == "back":
        conn.commit()
        answer(cb_id, "")
        refresh_deal_messages(cur, deal_id, budget=1.5)
        return {"ok": True}

    if action == "take":
        changed = apply_take(cur, deal, me, VIA)
        conn.commit()
        if not changed:
            answer(cb_id, "Сделка уже ваша")
        else:
            prev = deal_for_tg(cur, deal_id)
            answer(cb_id, f"Вы ответственный · {STAGE_LABELS[prev['stage']]}")
        refresh_deal_messages(cur, deal_id, budget=1.8)
        return {"ok": True}

    if action.startswith("st:"):
        stage = action[3:]
        if stage not in STAGES or stage == "lost":
            answer(cb_id, "Неизвестный этап")
            return {"ok": True}
        if deal["stage"] == stage:
            conn.commit()
            answer(cb_id, f"Уже «{STAGE_LABELS[stage]}»")
            refresh_deal_messages(cur, deal_id, budget=1.5)
            return {"ok": True}
        if deal["manager_id"] and deal["manager_id"] != me["id"]:
            cur.execute(f"SELECT COALESCE(NULLIF(full_name, ''), email) FROM {S}.users WHERE id = %s", (deal["manager_id"],))
            owner = (cur.fetchone() or ["другой сотрудник"])[0]
            conn.commit()
            answer(cb_id, f"Сделку ведёт {owner}. Нажмите «Забрать себе», чтобы менять этапы.", alert=True)
            return {"ok": True}
        apply_move(cur, deal, stage, "", me, VIA)
        conn.commit()
        answer(cb_id, f"Этап: {STAGE_LABELS[stage]}")
        refresh_deal_messages(cur, deal_id, budget=1.8)
        return {"ok": True}

    if action.startswith("lost:"):
        idx = int(action[5:])
        if idx >= len(LOST_REASONS):
            answer(cb_id, "Неизвестная причина")
            return {"ok": True}
        if deal["stage"] == "lost":
            conn.commit()
            answer(cb_id, "Уже в отказе")
            refresh_deal_messages(cur, deal_id, budget=1.5)
            return {"ok": True}
        if deal["manager_id"] and deal["manager_id"] != me["id"]:
            conn.commit()
            answer(cb_id, "Сделку ведёт другой сотрудник. Сначала «Забрать себе».", alert=True)
            refresh_deal_messages(cur, deal_id, budget=1.5)
            return {"ok": True}
        apply_move(cur, deal, "lost", LOST_REASONS[idx], me, VIA)
        conn.commit()
        answer(cb_id, f"Отказ: {LOST_REASONS[idx]}")
        refresh_deal_messages(cur, deal_id, budget=1.8)
        return {"ok": True}

    answer(cb_id, "")
    return {"ok": True}


def check_secret(headers: dict) -> bool:
    expected = webhook_secret()
    got = headers.get("X-Telegram-Bot-Api-Secret-Token") or headers.get("x-telegram-bot-api-secret-token") or ""
    return bool(expected) and got == expected

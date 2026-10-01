import hashlib
import html
import json
import os
import time
import urllib.request
from datetime import datetime, timedelta, timezone

from db import S, STAGES, STAGE_LABELS, CLOSED, rows

MSK = timezone(timedelta(hours=3))
STAGE_ICONS = {"new": "🔵", "in_work": "🟡", "offer": "🟣", "payment": "🟠", "delivery": "🚚", "won": "✅", "lost": "❌"}
SHORT = {"in_work": "В работу", "offer": "Предложение", "payment": "Оплата", "delivery": "Доставка", "won": "Завершена"}
LOST_REASONS = ["Дорого", "Долгий срок", "Купил у других", "Нет нужной позиции", "Не выходит на связь"]
TG_LIMIT = 4096


def esc(v) -> str:
    return html.escape(str(v or ""))


def bot_token() -> str:
    return os.environ.get("TELEGRAM_BOT_TOKEN", "").strip()


def webhook_secret() -> str:
    t = bot_token()
    return hashlib.sha256(f"crm-webhook:{t}".encode()).hexdigest()[:32] if t else ""


def api(method: str, payload: dict, timeout: float = 2.5):
    """Вызов Bot API. Возвращает result или None при любой ошибке."""
    token = bot_token()
    if not token or timeout < 0.2:
        return None
    try:
        req = urllib.request.Request(f"https://api.telegram.org/bot{token}/{method}",
                                     data=json.dumps(payload).encode(),
                                     headers={"Content-Type": "application/json"})
        data = json.loads(urllib.request.urlopen(req, timeout=timeout).read())
        return data.get("result") if data.get("ok") else None
    except Exception as ex:
        body = ""
        if hasattr(ex, "read"):
            try:
                body = ex.read().decode()[:200]
            except Exception:
                pass
        if "message is not modified" not in body:
            print(f"telegram {method} failed: {type(ex).__name__} {body}")
        return None


def send(chat_ids, text: str, budget: float = 2.5) -> int:
    """Отправка сообщения. Без токена или при сбое — тихо пропускаем. Возвращает число доставленных."""
    ids = [c for c in dict.fromkeys(str(c).strip() for c in chat_ids) if c]
    if not bot_token() or not ids:
        return 0
    sent = 0
    deadline = time.monotonic() + budget
    for chat_id in ids:
        left = deadline - time.monotonic()
        if left < 0.3:
            break
        if api("sendMessage", {"chat_id": chat_id, "text": text[:TG_LIMIT], "parse_mode": "HTML",
                               "disable_web_page_preview": True}, timeout=left) is not None:
            sent += 1
    return sent


def group_chats():
    return [c.strip() for c in os.environ.get("TELEGRAM_CHAT_ID", "").replace(";", ",").split(",") if c.strip()]


def chats_for_user(cur, user_id):
    """Личный чат менеджера, если он его указал; иначе — общий чат сотрудников."""
    if user_id:
        cur.execute(f"SELECT telegram_chat_id FROM {S}.users WHERE id = %s", (user_id,))
        r = cur.fetchone()
        if r and r[0]:
            return [r[0]], True
    return group_chats(), False


# ── Кнопки в уведомлениях о сделке ─────────────────────────────

def btn(text: str, deal_id: int, action: str) -> dict:
    return {"text": text, "callback_data": f"d:{deal_id}:{action}"[:64]}


def deal_keyboard(deal: dict, menu: str = "") -> dict:
    did, stage = deal["id"], deal["stage"]
    if menu == "lost":
        kb = [[btn(r, did, f"lost:{i}")] for i, r in enumerate(LOST_REASONS)]
        kb.append([btn("« Назад", did, "back")])
        return {"inline_keyboard": kb}
    if stage in CLOSED:
        return {"inline_keyboard": [[btn("↩️ Вернуть в работу", did, "st:in_work")]]}
    if not deal["manager_id"]:
        return {"inline_keyboard": [[btn("🙋 Взять в работу", did, "take")]]}
    idx = STAGES.index(stage)
    nxt = [s for s in STAGES[idx + 1:] if s not in CLOSED]
    kb = []
    if nxt:
        kb.append([btn(f"➡️ {SHORT[nxt[0]]}", did, f"st:{nxt[0]}")] +
                  [btn(SHORT[s], did, f"st:{s}") for s in nxt[1:3]])
    kb.append([btn("✅ Завершена", did, "st:won"), btn("❌ Отказ", did, "lostmenu")])
    kb.append([btn("🙋 Забрать себе", did, "take")])
    return {"inline_keyboard": kb}


def status_block(deal: dict) -> str:
    stage = deal["stage"]
    lines = ["", "━━━━━━━━━━━━",
             f"<b>Статус:</b> {STAGE_ICONS.get(stage, '')} {esc(STAGE_LABELS.get(stage, stage))}",
             f"<b>Ответственный:</b> {esc(deal.get('manager_name') or 'не назначен')}"]
    if stage == "lost" and deal.get("lost_reason"):
        lines.append(f"<b>Причина:</b> {esc(deal['lost_reason'])}")
    lines.append(f"<i>Обновлено {datetime.now(MSK).strftime('%d.%m %H:%M')} МСК</i>")
    return "\n".join(lines)


def deal_for_tg(cur, deal_id: int):
    cur.execute(
        f"SELECT d.id, d.stage, d.manager_id, d.lost_reason, "
        f"COALESCE(NULLIF(m.full_name, ''), m.email, '') AS manager_name "
        f"FROM {S}.crm_deals d LEFT JOIN {S}.users m ON m.id = d.manager_id WHERE d.id = %s", (deal_id,))
    r = rows(cur)
    return r[0] if r else None


def refresh_deal_messages(cur, deal_id: int, budget: float = 2.0, menu_for: tuple = None) -> int:
    """Обновляет текст и кнопки всех сообщений о сделке во всех чатах.
    menu_for=(chat_id, message_id) — в этом сообщении показать меню причин отказа."""
    if not bot_token():
        return 0
    cur.execute(f"SELECT chat_id, message_id, base_text FROM {S}.crm_tg_messages WHERE deal_id = %s", (deal_id,))
    msgs = cur.fetchall()
    if not msgs:
        return 0
    deal = deal_for_tg(cur, deal_id)
    if not deal:
        return 0
    status = status_block(deal)
    deadline = time.monotonic() + budget
    done = 0
    for chat_id, message_id, base in msgs:
        left = deadline - time.monotonic()
        if left < 0.3:
            break
        menu = "lost" if menu_for and str(menu_for[0]) == str(chat_id) and int(menu_for[1]) == int(message_id) else ""
        text = base[:TG_LIMIT - len(status) - 1] + "\n" + status
        if api("editMessageText", {"chat_id": chat_id, "message_id": message_id, "text": text,
                                   "parse_mode": "HTML", "disable_web_page_preview": True,
                                   "reply_markup": deal_keyboard(deal, menu)}, timeout=left) is not None:
            done += 1
    return done

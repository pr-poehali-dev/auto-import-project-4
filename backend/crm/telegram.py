import html
import json
import os
import time
import urllib.request

from db import S


def esc(v) -> str:
    return html.escape(str(v or ""))


def send(chat_ids, text: str, budget: float = 2.5) -> int:
    """Отправка сообщения в Telegram. Без токена или при сбое — тихо пропускаем. Возвращает число доставленных."""
    token = os.environ.get("TELEGRAM_BOT_TOKEN", "").strip()
    ids = [c for c in dict.fromkeys(str(c).strip() for c in chat_ids) if c]
    if not token or not ids:
        return 0
    sent = 0
    deadline = time.monotonic() + budget
    for chat_id in ids:
        left = deadline - time.monotonic()
        if left < 0.3:
            break
        try:
            data = json.dumps({"chat_id": chat_id, "text": text[:4096], "parse_mode": "HTML",
                               "disable_web_page_preview": True}).encode()
            req = urllib.request.Request(f"https://api.telegram.org/bot{token}/sendMessage", data=data,
                                         headers={"Content-Type": "application/json"})
            urllib.request.urlopen(req, timeout=left).read()
            sent += 1
        except Exception as ex:
            print(f"telegram send failed for chat {chat_id}: {type(ex).__name__}")
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

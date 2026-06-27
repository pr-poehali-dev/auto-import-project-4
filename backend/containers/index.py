"""
Контейнеры для отправки: сборка машинокомплектов (авто) из заявок в работе.
GET / — список контейнеров с вложенными авто (только сотрудник)
GET /?available=1 — список авто из заявок «в работе», доступных для добавления (не в контейнере)
POST / {action:create, name, container_number, origin, comment} — создать контейнер
POST / {action:add, container_id, car_ids:[...]} — добавить машинокомплекты в контейнер
POST / {action:remove, container_id, car_id} — убрать авто из контейнера
PUT / {container_id, status} — сменить статус контейнера
"""
import json
import os
import psycopg2

DB = os.environ["DATABASE_URL"]
SCHEMA = "t_p64303579_auto_import_project_"

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Session-Token",
}

# Статусы заявок, которые считаются «в работе»
IN_WORK_STATUSES = ("processing", "auction")

CONTAINER_STATUS = {
    "collecting": "Сборка",
    "shipped": "Отправлен",
    "arrived": "Прибыл",
    "done": "Завершён",
}


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


def car_row(r, with_teardown=False):
    d = {
        "id": r[0], "car_brand": r[1] or "", "car_model": r[2] or "",
        "car_year": r[3], "vin": r[4] or "",
        "order_id": r[5], "order_number": r[6] or "",
        "client_name": r[7] or "", "client_company": r[8] or "",
        "origin": r[9] or "", "status": r[10] or "",
    }
    if with_teardown:
        td = r[11]
        d["teardown"] = td if isinstance(td, list) else (json.loads(td) if td else [])
    return d


def handler(event: dict, context) -> dict:
    """Сборка машинокомплектов в контейнеры для отправки (доступно только сотрудникам)."""
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
        if role != "staff":
            return err("Доступ только для сотрудников", 403)

        if method == "GET":
            params = event.get("queryStringParameters") or {}

            # Авто из заявок «в работе», ещё не добавленные ни в один контейнер
            if params.get("available"):
                cur.execute(
                    f"SELECT c.id, c.car_brand, c.car_model, c.car_year, c.vin, "
                    f"o.id, o.order_number, u.full_name, u.company, o.origin, o.status "
                    f"FROM {SCHEMA}.cars c "
                    f"JOIN {SCHEMA}.orders o ON o.id = c.order_id "
                    f"JOIN {SCHEMA}.users u ON u.id = o.user_id "
                    f"WHERE o.status IN %s "
                    f"AND c.id NOT IN (SELECT car_id FROM {SCHEMA}.container_cars) "
                    f"ORDER BY o.order_number, c.id",
                    (IN_WORK_STATUSES,)
                )
                cars = [car_row(r) for r in cur.fetchall()]
                return ok({"cars": cars})

            # Список контейнеров с вложенными авто
            cur.execute(
                f"SELECT id, name, container_number, origin, status, comment, created_at "
                f"FROM {SCHEMA}.containers ORDER BY created_at DESC"
            )
            containers = []
            for c in cur.fetchall():
                containers.append({
                    "id": c[0], "name": c[1], "container_number": c[2] or "",
                    "origin": c[3] or "", "status": c[4],
                    "status_label": CONTAINER_STATUS.get(c[4], c[4]),
                    "comment": c[5] or "", "created_at": str(c[6]), "cars": [],
                })
            if containers:
                cur.execute(
                    f"SELECT cc.container_id, c.id, c.car_brand, c.car_model, c.car_year, c.vin, "
                    f"o.id, o.order_number, u.full_name, u.company, o.origin, o.status, c.teardown "
                    f"FROM {SCHEMA}.container_cars cc "
                    f"JOIN {SCHEMA}.cars c ON c.id = cc.car_id "
                    f"JOIN {SCHEMA}.orders o ON o.id = c.order_id "
                    f"JOIN {SCHEMA}.users u ON u.id = o.user_id "
                    f"ORDER BY cc.added_at"
                )
                by_id = {c["id"]: c for c in containers}
                for r in cur.fetchall():
                    cont = by_id.get(r[0])
                    if cont is not None:
                        cont["cars"].append(car_row(r[1:], with_teardown=True))
            return ok({"containers": containers})

        if method == "POST":
            body = json.loads(event.get("body") or "{}")
            action = body.get("action", "create")

            if action == "create":
                name = (body.get("name") or "").strip()
                if not name:
                    return err("Укажите название контейнера")
                cur.execute(
                    f"INSERT INTO {SCHEMA}.containers (name, container_number, origin, comment, created_by) "
                    f"VALUES (%s, %s, %s, %s, %s) RETURNING id",
                    (name[:150], (body.get("container_number") or "").strip()[:50] or None,
                     (body.get("origin") or "").strip()[:50] or None,
                     (body.get("comment") or "").strip() or None, user_id)
                )
                cid = cur.fetchone()[0]
                conn.commit()
                return ok({"id": cid, "message": "Контейнер создан"})

            if action == "add":
                container_id = body.get("container_id")
                car_ids = body.get("car_ids") or []
                if not container_id or not car_ids:
                    return err("Выберите контейнер и машинокомплекты")
                cur.execute(f"SELECT id FROM {SCHEMA}.containers WHERE id = %s", (container_id,))
                if not cur.fetchone():
                    return err("Контейнер не найден", 404)
                added = 0
                for cid in car_ids:
                    cur.execute(
                        f"INSERT INTO {SCHEMA}.container_cars (container_id, car_id) "
                        f"VALUES (%s, %s) ON CONFLICT (container_id, car_id) DO NOTHING",
                        (container_id, int(cid))
                    )
                    added += cur.rowcount
                conn.commit()
                return ok({"added": added, "message": f"Добавлено машинокомплектов: {added}"})

            if action == "remove":
                container_id = body.get("container_id")
                car_id = body.get("car_id")
                if not container_id or not car_id:
                    return err("Некорректные данные")
                cur.execute(
                    f"DELETE FROM {SCHEMA}.container_cars WHERE container_id = %s AND car_id = %s",
                    (container_id, int(car_id))
                )
                conn.commit()
                return ok({"message": "Машинокомплект убран из контейнера"})

            return err("Неизвестное действие")

        if method == "PUT":
            body = json.loads(event.get("body") or "{}")
            container_id = body.get("container_id")
            status = (body.get("status") or "").strip()
            if not container_id or status not in CONTAINER_STATUS:
                return err("Некорректные данные")
            cur.execute(
                f"UPDATE {SCHEMA}.containers SET status = %s, updated_at = NOW() WHERE id = %s",
                (status, container_id)
            )
            conn.commit()
            return ok({"message": "Статус контейнера обновлён"})

        return err("Метод не поддерживается", 405)

    finally:
        conn.close()
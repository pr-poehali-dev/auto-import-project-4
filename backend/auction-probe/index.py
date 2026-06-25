import json
import re
import urllib.request


def handler(event: dict, context) -> dict:
    """Разведка: скачивает страницу jpcenter.ru, извлекает формы и ссылки для парсинга лотов."""
    method = event.get('httpMethod', 'GET')
    cors = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    }
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors, 'body': ''}

    params = event.get('queryStringParameters') or {}
    target = params.get('url') or 'https://jpcenter.ru/japan'

    req = urllib.request.Request(target, headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
    })
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            raw = resp.read()
            status = resp.status
    except Exception as e:
        return {'statusCode': 200, 'headers': {**cors, 'Content-Type': 'application/json'},
                'body': json.dumps({'error': str(e)})}

    try:
        text = raw.decode('windows-1251', errors='replace')
    except Exception:
        text = raw.decode('utf-8', errors='replace')

    # вытащить формы: action + method + поля
    forms = []
    for fm in re.finditer(r'<form[^>]*>', text, re.IGNORECASE):
        tag = fm.group(0)
        action = re.search(r'action\s*=\s*["\']?([^"\'\s>]+)', tag, re.IGNORECASE)
        fmethod = re.search(r'method\s*=\s*["\']?([^"\'\s>]+)', tag, re.IGNORECASE)
        forms.append({
            'action': action.group(1) if action else None,
            'method': fmethod.group(1) if fmethod else 'GET',
        })

    # имена input/select полей
    fields = []
    for inp in re.finditer(r'<(input|select)[^>]*name\s*=\s*["\']?([^"\'\s>]+)', text, re.IGNORECASE):
        fields.append(inp.group(2))
    fields = sorted(set(fields))

    # внутренние ссылки, похожие на поиск/лоты
    links = []
    for a in re.finditer(r'href\s*=\s*["\']([^"\']+)["\']', text, re.IGNORECASE):
        href = a.group(1)
        low = href.lower()
        if any(k in low for k in ['search', 'find', 'lot', 'auc', 'car', 'japan', 'result']):
            links.append(href)
    links = sorted(set(links))[:40]

    return {
        'statusCode': 200,
        'headers': {**cors, 'Content-Type': 'application/json'},
        'body': json.dumps({
            'status': status,
            'forms': forms[:20],
            'fields': fields[:60],
            'links': links,
        }, ensure_ascii=False),
    }

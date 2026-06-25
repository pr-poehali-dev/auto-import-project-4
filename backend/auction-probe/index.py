import json
import urllib.request


def handler(event: dict, context) -> dict:
    """Разведка: скачивает страницу jpcenter.ru, чтобы понять структуру лотов для парсинга."""
    method = event.get('httpMethod', 'GET')
    cors = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    }
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors, 'body': ''}

    params = event.get('queryStringParameters') or {}
    target = params.get('url') or 'https://jpcenter.ru/?lang=en'

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

    low = text.lower()
    markers = {
        'has_login_form': ('type="password"' in low),
        'mentions_login': ('login' in low or 'log in' in low or 'sign in' in low),
        'has_search': ('search' in low),
        'has_lot': ('lot' in low),
        'has_img_tags': low.count('<img'),
        'has_table': low.count('<table'),
        'length': len(text),
    }

    return {
        'statusCode': 200,
        'headers': {**cors, 'Content-Type': 'application/json'},
        'body': json.dumps({
            'status': status,
            'markers': markers,
            'preview': text[:3000],
        }, ensure_ascii=False),
    }

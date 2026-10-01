// Сервис-воркер CRM: нужен для установки на телефон.
// Данные всегда берутся из сети — офлайн-кэша нет, чтобы сотрудники не видели устаревшие сделки.
const SHELL = "crm-shell-v1";

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(SHELL).then((c) => c.addAll(["/crm-icon-192.png"])).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== SHELL).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || req.mode !== "navigate") return;
  e.respondWith(
    fetch(req).catch(() => new Response(
      '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<body style="margin:0;background:#0b1120;color:#efe9dc;font-family:system-ui;display:flex;align-items:center;justify-content:center;height:100vh;text-align:center;padding:24px">' +
      '<div><div style="font-size:42px">📡</div><h2>Нет интернета</h2><p style="opacity:.6">CRM работает онлайн. Проверьте связь и обновите страницу.</p>' +
      '<button onclick="location.reload()" style="margin-top:12px;padding:12px 22px;border:0;border-radius:4px;background:#e6b44a;font-weight:700">Обновить</button></div>',
      { headers: { "Content-Type": "text/html; charset=utf-8" } }
    ))
  );
});

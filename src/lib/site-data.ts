import type { TeardownMode } from "@/components/TeardownModeBadge";

export const LOGO = "https://cdn.poehali.dev/projects/92e249db-e174-4ab7-8e64-42d927b13e30/bucket/0d9e1542-9580-4b01-a093-0b9580927df1.jpg";
export const COMPANY_NAME = "PRIME CARS";
export const HERO_IMG = "https://cdn.poehali.dev/projects/92e249db-e174-4ab7-8e64-42d927b13e30/files/7f88b313-5823-46e8-b5bc-217779dc9159.jpg";
export const DIRECTIONS_IMG = "https://cdn.poehali.dev/projects/92e249db-e174-4ab7-8e64-42d927b13e30/files/aedb59f4-ddb5-4001-b220-1edb774e89a4.jpg";
export const SERVICES_IMG = "https://cdn.poehali.dev/projects/92e249db-e174-4ab7-8e64-42d927b13e30/files/8b4c69b3-835f-482c-a4d0-7789392c02da.jpg";
export const HOW_IMG = "https://cdn.poehali.dev/projects/92e249db-e174-4ab7-8e64-42d927b13e30/files/860a7ef0-c02a-4734-806c-11360d2ed14d.jpg";
export const CONTACTS_IMG = "https://cdn.poehali.dev/projects/92e249db-e174-4ab7-8e64-42d927b13e30/files/ca83d876-8b7a-4801-86e6-c0bd70225c97.jpg";
export const PAGE_BG = "https://cdn.poehali.dev/projects/92e249db-e174-4ab7-8e64-42d927b13e30/files/99f57650-e15d-441d-a58e-1ae5e323cbce.jpg";

export const AUTH_URL = "https://functions.poehali.dev/ddb4a7f6-82c2-4cca-8d4c-ed685f8a3c72";
export const ORDERS_URL = "https://functions.poehali.dev/d57608b2-729a-4006-a5c2-598ca59a8239";
export const CARS_URL = "https://functions.poehali.dev/8f3531c8-943d-46dc-acd0-b9a6618054db";
export const HOT_DEALS_URL = "https://functions.poehali.dev/cc988794-2c9d-4cf0-935d-51df0229a699";
export const CONTAINERS_URL = "https://functions.poehali.dev/6f8b4d6b-c853-4c24-8cde-fbbe7b23c3df";

// ── API helpers ──────────────────────────────────────────────
export async function safeJson(res: Response) {
  try { return await res.json(); }
  catch { return { error: "Сервис временно недоступен" }; }
}

export async function apiAuth(action: string, payload: object = {}, token?: string) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["X-Session-Token"] = token;
  const res = await fetch(AUTH_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({ action, ...payload }),
  });
  return safeJson(res);
}

export async function apiOrders(method: "GET" | "POST" | "PUT", token: string, body?: object) {
  const headers: Record<string, string> = { "X-Session-Token": token };
  if (body) headers["Content-Type"] = "application/json";
  const res = await fetch(ORDERS_URL, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  return safeJson(res);
}

export async function apiCars(method: "GET" | "POST" | "PATCH" | "DELETE", token: string, opts: { body?: object; query?: string } = {}) {
  const headers: Record<string, string> = { "X-Session-Token": token };
  if (opts.body) headers["Content-Type"] = "application/json";
  const url = opts.query ? `${CARS_URL}?${opts.query}` : CARS_URL;
  const res = await fetch(url, {
    method,
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  return res.json();
}

export async function apiContainers(method: "GET" | "POST" | "PUT", token: string, opts: { body?: object; query?: string } = {}) {
  const headers: Record<string, string> = { "X-Session-Token": token };
  if (opts.body) headers["Content-Type"] = "application/json";
  const url = opts.query ? `${CONTAINERS_URL}?${opts.query}` : CONTAINERS_URL;
  const res = await fetch(url, {
    method,
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  return safeJson(res);
}

export async function apiHotDeals(method: "GET" | "POST" | "DELETE", opts: { token?: string; body?: object; query?: string } = {}) {
  const headers: Record<string, string> = {};
  if (opts.token) headers["X-Session-Token"] = opts.token;
  if (opts.body) headers["Content-Type"] = "application/json";
  const url = opts.query ? `${HOT_DEALS_URL}?${opts.query}` : HOT_DEALS_URL;
  const res = await fetch(url, {
    method,
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  return res.json();
}

// ── Types ────────────────────────────────────────────────────
export interface User { id: number; email: string; phone: string; full_name: string; company: string; inn: string; created_at: string; role?: string; }
export interface Order { id: number; order_number: string; car_brand: string; car_model: string; car_year: number; quantity: number; budget: number; status: string; status_label: string; origin: string; created_at: string; comment?: string; client_name?: string; client_email?: string; client_phone?: string; client_company?: string; cars_count?: number; }
export interface TeardownItem { name: string; needed: boolean; qty?: number; }
export interface Car { id: number; car_brand: string; car_model: string; car_year: number; price: number; mileage: number; description: string; photos: string[]; teardown: TeardownItem[]; created_at: string; vin?: string; }

// Разделитель «Группа » Узел» внутри name (для совместимости с бэкендом, который хранит только name)
export const TD_SEP = " » ";
export const splitTd = (name: string): { group: string; part: string } => {
  const i = name.indexOf(TD_SEP);
  return i === -1 ? { group: "Другое", part: name } : { group: name.slice(0, i), part: name.slice(i + TD_SEP.length) };
};
export const joinTd = (group: string, part: string) => `${group}${TD_SEP}${part}`;

// Детальный разборный лист: группы → узлы
export const TEARDOWN_GROUPS: { group: string; parts: string[] }[] = [
  { group: "Двигатель и навесное", parts: [
    "Двигатель в сборе", "Блок ДВС", "ГБЦ", "Турбина", "Стартер", "Генератор",
    "Радиатор", "Интеркулер", "Топливный насос", "Форсунки", "Дроссельная заслонка",
  ] },
  { group: "Трансмиссия", parts: [
    "АКПП", "МКПП", "Вариатор (CVT)", "Раздаточная коробка", "Редуктор передний",
    "Редуктор задний", "Карданный вал", "Привод левый", "Привод правый",
  ] },
  { group: "Ходовая и подвеска", parts: [
    "Стойка передняя левая", "Стойка передняя правая", "Стойка задняя левая",
    "Стойка задняя правая", "Рычаги передние", "Рычаги задние", "Ступица передняя",
    "Ступица задняя", "Рулевая рейка", "Подрамник",
  ] },
  { group: "Тормозная система", parts: [
    "Суппорт передний левый", "Суппорт передний правый", "Суппорт задний левый",
    "Суппорт задний правый", "Тормозные диски", "Главный тормозной цилиндр", "ABS блок",
  ] },
  { group: "Кузовные детали", parts: [
    "Ноускат (морда)", "Капот", "Крыло переднее левое", "Крыло переднее правое",
    "Дверь передняя левая", "Дверь передняя правая", "Дверь задняя левая",
    "Дверь задняя правая", "Крышка багажника", "Бампер передний", "Бампер задний",
    "Порог левый", "Порог правый", "Зеркало левое", "Зеркало правое", "Крыша",
  ] },
  { group: "Оптика", parts: [
    "Фара левая", "Фара правая", "Фонарь задний левый", "Фонарь задний правый",
    "Птф левая", "Птф правая",
  ] },
  { group: "Салон", parts: [
    "Сиденья комплект", "Сиденье водителя", "Торпедо (панель)", "Руль",
    "Airbag комплект", "Климат-блок", "Магнитола / мультимедиа", "Ковры / обшивка",
  ] },
  { group: "Электрика", parts: [
    "Проводка моторная", "Блок предохранителей", "ЭБУ (мозги)", "Замок зажигания комплект",
    "Аккумулятор",
  ] },
  { group: "Колёса", parts: [
    "Диски комплект", "Шины комплект", "Запасное колесо",
  ] },
  { group: "Крупные узлы (халфкат)", parts: [
    "Халфкат передний (перед в сборе)", "Халфкат задний (зад в сборе)",
    "Двигатель в сборе с КПП", "Кузов в сборе (без ДВС)",
    "Ноускат в сборе",
  ] },
];
export const TEARDOWN_PRESET = TEARDOWN_GROUPS.flatMap((g) => g.parts.map((p) => joinTd(g.group, p)));

// ── РЕЖИМЫ РАЗБОРНОГО ЛИСТА ──
export const HALFCUT_GROUP = "Крупные узлы (халфкат)";
// 1. Крупноузловой (халфкаты) — только крупные узлы
export const TD_HALFCUT = TEARDOWN_GROUPS
  .filter((g) => g.group === HALFCUT_GROUP)
  .flatMap((g) => g.parts.map((p) => joinTd(g.group, p)));
// 2. Полный разбор — все детальные позиции (без крупных узлов)
export const TD_FULL = TEARDOWN_GROUPS
  .filter((g) => g.group !== HALFCUT_GROUP)
  .flatMap((g) => g.parts.map((p) => joinTd(g.group, p)));
// Передние детали, которые входят в ноускат (в режиме с ноускатом идут в сборе)
export const NOSKAT_INCLUDED = [
  joinTd("Кузовные детали", "Ноускат (морда)"),
  joinTd("Кузовные детали", "Капот"),
  joinTd("Кузовные детали", "Крыло переднее левое"),
  joinTd("Кузовные детали", "Крыло переднее правое"),
  joinTd("Кузовные детали", "Бампер передний"),
  joinTd("Оптика", "Фара левая"),
  joinTd("Оптика", "Фара правая"),
  joinTd("Оптика", "Птф левая"),
  joinTd("Оптика", "Птф правая"),
  joinTd("Двигатель и навесное", "Радиатор"),
  joinTd("Двигатель и навесное", "Интеркулер"),
];
// 3. Разбор с ноускатом — полный разбор, но перед идёт одним ноускатом
export const TD_NOSKAT = [
  joinTd(HALFCUT_GROUP, "Ноускат в сборе"),
  ...TD_FULL.filter((n) => !NOSKAT_INCLUDED.includes(n)),
];

// Группировка списка узлов для отображения
export const groupTeardown = (items: TeardownItem[]): { group: string; items: { name: string; part: string; needed: boolean; qty: number }[] }[] => {
  const map: Record<string, { name: string; part: string; needed: boolean; qty: number }[]> = {};
  const order: string[] = [];
  for (const it of items) {
    const { group, part } = splitTd(it.name);
    if (!map[group]) { map[group] = []; order.push(group); }
    map[group].push({ name: it.name, part, needed: it.needed, qty: it.qty || 1 });
  }
  return order.map((g) => ({ group: g, items: map[g] }));
};

// ── Определение типа разбора по составу разборного листа ──
export const detectTeardownMode = (items: TeardownItem[]): TeardownMode | null => {
  if (!items || items.length === 0) return null;
  const names = items.map((i) => i.name);
  const hasNoskatUnit = names.includes(joinTd(HALFCUT_GROUP, "Ноускат в сборе"));
  const bigUnits = names.filter((n) => splitTd(n).group === HALFCUT_GROUP);
  const detailed = names.filter((n) => splitTd(n).group !== HALFCUT_GROUP);
  // только крупные узлы → халфкат
  if (bigUnits.length > 0 && detailed.length === 0) return "halfcut";
  // ноускат в сборе + детали, но без передних деталей → разбор с ноускатом
  if (hasNoskatUnit && detailed.length > 0) {
    const frontPresent = NOSKAT_INCLUDED.some((n) => names.includes(n));
    if (!frontPresent) return "noskat";
    return "custom";
  }
  // все детальные позиции без крупных узлов → полный разбор
  if (bigUnits.length === 0) {
    const missing = TD_FULL.filter((n) => !names.includes(n));
    if (missing.length === 0) return "full";
    return "custom";
  }
  return "custom";
};

export interface HotDeal { id: number; origin: string; brand: string; model: string; year: number | null; mileage: string; engine: string; price: string; badge: string; photo: string; sort_order: number; }

export type Lang = "ru" | "en";
export type LS = { ru: string; en: string };

export const ORIGINS = [
  {
    id: "hongkong", flag: "🇭🇰", cc: "hk",
    name: { ru: "Гонконг", en: "Hong Kong" },
    desc: { ru: "Европейские и американские марки по доступным ценам", en: "European and American brands at competitive prices" },
    volume: { ru: "от 20 ед./мес.", en: "from 20 units/month" },
    intro: { ru: "Гонконг — направление для премиальных европейских и американских марок. BMW, Mercedes-Benz, Audi и Volkswagen по ценам ниже европейского рынка.", en: "Hong Kong is the destination for premium European and American brands. BMW, Mercedes-Benz, Audi and Volkswagen at prices below the European market." },
    brands: ["BMW", "Mercedes-Benz", "Audi", "Volkswagen", "Land Rover", "Porsche"],
    auctions: [
      { ru: "Прямые контракты с дилерами", en: "Direct dealer contracts" },
      { ru: "Закрытые торги", en: "Closed auctions" },
    ],
    auctionLinks: [
      { name: "28car", url: "https://28car.com", desc: { ru: "Крупнейшая площадка авто в Гонконге", en: "Largest car marketplace in Hong Kong" } },
      { name: "Carused.hk", url: "https://www.carused.hk", desc: { ru: "Каталог подержанных авто Гонконга", en: "Used car catalog of Hong Kong" } },
      { name: "Hong Kong Car", url: "https://www.hkcars.com", desc: { ru: "Премиальные европейские марки", en: "Premium European brands" } },
    ],
    facts: [
      { icon: "Clock", title: { ru: "Срок доставки", en: "Delivery time" }, val: { ru: "45–55 дней", en: "45–55 days" } },
      { icon: "Anchor", title: { ru: "Порт прибытия", en: "Port of arrival" }, val: { ru: "Владивосток", en: "Vladivostok" } },
      { icon: "Package", title: { ru: "Объём", en: "Volume" }, val: { ru: "от 20 ед./мес.", en: "from 20 units/month" } },
      { icon: "Gem", title: { ru: "Сегмент", en: "Segment" }, val: { ru: "Премиум", en: "Premium" } },
    ],
    advantages: [
      { ru: "Европейские и американские премиум-марки", en: "Premium European and American brands" },
      { ru: "Цены ниже европейского рынка", en: "Prices below the European market" },
      { ru: "Машины в отличном состоянии", en: "Vehicles in excellent condition" },
      { ru: "Редкие комплектации и дорогие агрегаты", en: "Rare trims and high-value components" },
    ],
  },
  {
    id: "japan", flag: "🇯🇵", cc: "jp",
    name: { ru: "Япония", en: "Japan" },
    desc: { ru: "Праворульные авто с аукционов USS, JU, TAA", en: "Right-hand drive vehicles from USS, JU, TAA auctions" },
    volume: { ru: "от 50 ед./мес.", en: "from 50 units/month" },
    intro: { ru: "Япония — ключевое направление для поставки машинокомплектов. Огромный выбор автомобилей в отличном состоянии, прозрачные аукционы и высокое качество узлов под разборку.", en: "Japan is the key destination for sourcing vehicle assemblies. A huge selection of cars in excellent condition, transparent auctions and high-quality components for dismantling." },
    brands: ["Toyota", "Lexus", "Honda", "Nissan", "Mazda", "Mitsubishi", "Subaru", "Suzuki"],
    auctions: [
      { ru: "USS Auction", en: "USS Auction" },
      { ru: "JU Auction", en: "JU Auction" },
      { ru: "TAA (Toyota)", en: "TAA (Toyota)" },
      { ru: "HAA (Honda)", en: "HAA (Honda)" },
    ],
    auctionLinks: [
      { name: "USS Auction", url: "https://www.ussnet.co.jp", desc: { ru: "Крупнейший аукцион Японии · 20 000+ лотов в неделю", en: "Largest auction in Japan · 20,000+ lots per week" } },
      { name: "JU Auction", url: "https://www.ju-group.co.jp", desc: { ru: "Сеть региональных аукционов по всей Японии", en: "Network of regional auctions across Japan" } },
      { name: "TAA (Toyota)", url: "https://www.taa.gr.jp", desc: { ru: "Официальный аукцион Toyota и Lexus", en: "Official Toyota and Lexus auction" } },
      { name: "HAA Kobe (Honda)", url: "https://www.honda-auto-auction.com", desc: { ru: "Аукцион Honda и Acura", en: "Honda and Acura auction" } },
    ],
    facts: [
      { icon: "Clock", title: { ru: "Срок доставки", en: "Delivery time" }, val: { ru: "40–50 дней", en: "40–50 days" } },
      { icon: "Anchor", title: { ru: "Порт прибытия", en: "Port of arrival" }, val: { ru: "Владивосток", en: "Vladivostok" } },
      { icon: "Package", title: { ru: "Объём", en: "Volume" }, val: { ru: "от 50 ед./мес.", en: "from 50 units/month" } },
      { icon: "Star", title: { ru: "Состояние", en: "Condition" }, val: { ru: "Премиальное", en: "Premium" } },
    ],
    advantages: [
      { ru: "Самый большой выбор лотов в Азии — более 20 000 авто еженедельно", en: "The widest selection of lots in Asia — over 20,000 cars weekly" },
      { ru: "Прозрачная аукционная оценка состояния (баллы 3.5–5)", en: "Transparent auction condition grading (scores 3.5–5)" },
      { ru: "Минимальная коррозия благодаря мягкому климату", en: "Minimal corrosion thanks to the mild climate" },
      { ru: "Оригинальные машинокомплекты", en: "Genuine vehicle assemblies" },
    ],
  },
  {
    id: "japan-kits", flag: "🇯🇵", cc: "jp",
    name: { ru: "Япония · Машинокомплекты", en: "Japan · Vehicle Kits" },
    desc: { ru: "Поставка машинокомплектов под разборку — двигатели, кузова, агрегаты", en: "Supply of vehicle kits for dismantling — engines, bodies, components" },
    volume: { ru: "от 40 комплектов/мес.", en: "from 40 kits/month" },
    intro: { ru: "Япония — оптимальное направление для поставки машинокомплектов под разборку. Поставляем распилы, конструкторы и полные машинокомплекты: двигатели, АКПП, кузова и агрегаты в оригинальном состоянии с минимальным износом.", en: "Japan is the optimal destination for supplying vehicle kits for dismantling. We deliver cut bodies, constructors and full vehicle kits: engines, transmissions, bodies and components in original condition with minimal wear." },
    brands: ["Toyota", "Lexus", "Honda", "Nissan", "Mazda", "Mitsubishi", "Subaru", "Suzuki"],
    auctions: [
      { ru: "USS Auction", en: "USS Auction" },
      { ru: "JU Auction", en: "JU Auction" },
      { ru: "Прямые контракты с разборками", en: "Direct contracts with dismantlers" },
    ],
    auctionLinks: [
      { name: "USS Auction", url: "https://www.ussnet.co.jp", desc: { ru: "Крупнейший аукцион Японии · 20 000+ лотов в неделю", en: "Largest auction in Japan · 20,000+ lots per week" } },
      { name: "JU Auction", url: "https://www.ju-group.co.jp", desc: { ru: "Сеть региональных аукционов по всей Японии", en: "Network of regional auctions across Japan" } },
      { name: "TAA (Toyota)", url: "https://www.taa.gr.jp", desc: { ru: "Официальный аукцион Toyota и Lexus", en: "Official Toyota and Lexus auction" } },
    ],
    facts: [
      { icon: "Clock", title: { ru: "Срок доставки", en: "Delivery time" }, val: { ru: "40–50 дней", en: "40–50 days" } },
      { icon: "Anchor", title: { ru: "Порт прибытия", en: "Port of arrival" }, val: { ru: "Владивосток", en: "Vladivostok" } },
      { icon: "Boxes", title: { ru: "Объём", en: "Volume" }, val: { ru: "от 40 компл./мес.", en: "from 40 kits/month" } },
      { icon: "Wrench", title: { ru: "Формат", en: "Format" }, val: { ru: "Машинокомплекты", en: "Vehicle kits" } },
    ],
    advantages: [
      { ru: "Полные машинокомплекты, распилы и конструкторы", en: "Full vehicle kits, cut bodies and constructors" },
      { ru: "Оригинальные двигатели и АКПП с малым пробегом", en: "Original engines and transmissions with low mileage" },
      { ru: "Выгодная таможенная схема для комплектующих", en: "Favorable customs scheme for components" },
      { ru: "Полный комплект документов на каждый агрегат", en: "Complete documentation for each component" },
    ],
  },
  {
    id: "korea", flag: "🇰🇷", cc: "kr",
    name: { ru: "Корея", en: "Korea" },
    desc: { ru: "Hyundai, Kia, Ssangyong — высокий спрос на запчасти", en: "Hyundai, Kia, Ssangyong — high demand for parts" },
    volume: { ru: "от 30 ед./мес.", en: "from 30 units/month" },
    intro: { ru: "Корея — выгодное направление для популярных в России марок. Hyundai, Kia и Ssangyong с высоким спросом на запчасти и привлекательной ценой машинокомплектов.", en: "Korea is a cost-effective destination for brands popular in Russia. Hyundai, Kia and Ssangyong with high demand for parts and attractive prices for vehicle assemblies." },
    brands: ["Hyundai", "Kia", "Ssangyong", "Genesis", "Daewoo", "Renault Samsung"],
    auctions: [
      { ru: "Kcaa Auction", en: "Kcaa Auction" },
      { ru: "Manheim Korea", en: "Manheim Korea" },
      { ru: "Lotte Auction", en: "Lotte Auction" },
    ],
    auctionLinks: [
      { name: "Kcaa Auction", url: "https://www.kcaa.or.kr", desc: { ru: "Крупнейший автоаукцион Кореи", en: "Largest car auction in Korea" } },
      { name: "Manheim Korea", url: "https://korea.manheim.com", desc: { ru: "Международная площадка с базой корейских авто", en: "International platform with a base of Korean cars" } },
      { name: "Lotte Auto Auction", url: "https://www.lotteautoauction.net", desc: { ru: "Аукцион Lotte — широкий выбор лотов", en: "Lotte auction — a wide selection of lots" } },
      { name: "Encar", url: "https://www.encar.com", desc: { ru: "Каталог авто с пробегом по всей Корее", en: "Catalog of used cars across Korea" } },
    ],
    facts: [
      { icon: "Clock", title: { ru: "Срок доставки", en: "Delivery time" }, val: { ru: "35–45 дней", en: "35–45 days" } },
      { icon: "Anchor", title: { ru: "Порт прибытия", en: "Port of arrival" }, val: { ru: "Владивосток", en: "Vladivostok" } },
      { icon: "Package", title: { ru: "Объём", en: "Volume" }, val: { ru: "от 30 ед./мес.", en: "from 30 units/month" } },
      { icon: "TrendingUp", title: { ru: "Спрос на з/ч", en: "Parts demand" }, val: { ru: "Высокий", en: "High" } },
    ],
    advantages: [
      { ru: "Самые востребованные в РФ марки — быстрая оборачиваемость запчастей", en: "The most in-demand brands in Russia — fast parts turnover" },
      { ru: "Доступная цена машинокомплектов", en: "Affordable price for vehicle assemblies" },
      { ru: "Современные модели с актуальными агрегатами", en: "Modern models with up-to-date components" },
      { ru: "Удобная логистика через порт Владивостока", en: "Convenient logistics via the port of Vladivostok" },
    ],
  },
  {
    id: "china", flag: "🇨🇳", cc: "cn",
    name: { ru: "Китай", en: "China" },
    desc: { ru: "Электромобили и новые марки — Geely, Chery, BYD, Haval", en: "EVs and new brands — Geely, Chery, BYD, Haval" },
    volume: { ru: "от 40 ед./мес.", en: "from 40 units/month" },
    intro: { ru: "Китай — быстрорастущее направление для современных автомобилей и электрокаров. Geely, Chery, BYD и Haval с растущим спросом на запчасти и выгодными ценами на машинокомплекты.", en: "China is a fast-growing destination for modern cars and EVs. Geely, Chery, BYD and Haval with rising demand for parts and attractive prices for vehicle assemblies." },
    brands: ["Geely", "Chery", "BYD", "Haval", "Changan", "Great Wall", "Li Auto", "Zeekr"],
    auctions: [
      { ru: "Che300 Auction", en: "Che300 Auction" },
      { ru: "Yongda Auction", en: "Yongda Auction" },
      { ru: "Прямые контракты с дилерами", en: "Direct dealer contracts" },
    ],
    auctionLinks: [
      { name: "Che300", url: "https://www.che300.com", desc: { ru: "Крупнейшая площадка авто с пробегом в Китае", en: "Largest used car marketplace in China" } },
      { name: "Dongchedi", url: "https://www.dongchedi.com", desc: { ru: "Каталог новых и подержанных авто", en: "Catalog of new and used cars" } },
      { name: "Guazi", url: "https://www.guazi.com", desc: { ru: "Популярный сервис продажи авто с пробегом", en: "Popular used car sales service" } },
    ],
    facts: [
      { icon: "Clock", title: { ru: "Срок доставки", en: "Delivery time" }, val: { ru: "30–40 дней", en: "30–40 days" } },
      { icon: "Anchor", title: { ru: "Порт прибытия", en: "Port of arrival" }, val: { ru: "Владивосток", en: "Vladivostok" } },
      { icon: "Package", title: { ru: "Объём", en: "Volume" }, val: { ru: "от 40 ед./мес.", en: "from 40 units/month" } },
      { icon: "Zap", title: { ru: "Сегмент", en: "Segment" }, val: { ru: "EV и новые марки", en: "EVs and new brands" } },
    ],
    advantages: [
      { ru: "Электромобили и гибриды с актуальными батареями и агрегатами", en: "EVs and hybrids with up-to-date batteries and components" },
      { ru: "Низкая цена машинокомплектов и быстрая логистика", en: "Low price for vehicle assemblies and fast logistics" },
      { ru: "Растущий спрос на запчасти китайских марок в России", en: "Growing demand for Chinese brand parts in Russia" },
      { ru: "Огромный выбор новых моделей каждый год", en: "A huge selection of new models every year" },
    ],
  },
];
export const SERVICES = [
  { icon: "Package", title: { ru: "Поставка авто под разборку", en: "Supply of cars for dismantling" }, desc: { ru: "Подбираем автомобили с аукционов и у дилеров под ваш запрос. Битые, с пробегом, снятые с учёта.", en: "We source cars from auctions and dealers to match your request. Damaged, used, deregistered." } },
  { icon: "FileCheck", title: { ru: "Таможенное оформление", en: "Customs clearance" }, desc: { ru: "Полное сопровождение: документы, СБКТС, таможенная декларация. Растаможка под ключ.", en: "Full support: documents, certification, customs declaration. Turnkey customs clearance." } },
  { icon: "Truck", title: { ru: "Доставка по России", en: "Delivery across Russia" }, desc: { ru: "Логистика от порта до вашего склада. Работаем с Владивостоком, Санкт-Петербургом, Новороссийском.", en: "Logistics from the port to your warehouse. We work with Vladivostok, St. Petersburg and Novorossiysk." } },
  { icon: "Search", title: { ru: "Подбор по запросу", en: "Sourcing on request" }, desc: { ru: "Нужна конкретная марка, модель или год? Ищем точно под ваши требования на аукционах Азии.", en: "Need a specific make, model or year? We search precisely to your requirements at Asian auctions." } },
  { icon: "Warehouse", title: { ru: "Хранение на складе", en: "Warehouse storage" }, desc: { ru: "Временное хранение до вашей готовности принять партию. Охраняемые склады у портов.", en: "Temporary storage until you are ready to receive the batch. Secured warehouses near the ports." } },
  { icon: "ShieldCheck", title: { ru: "Проверка перед покупкой", en: "Pre-purchase inspection" }, desc: { ru: "Инспекция состояния авто, фото и отчёт о комплектности узлов до отправки из страны.", en: "Vehicle condition inspection, photos and a report on component completeness before shipping from the country." } },
];
export const STATS = [
  { num: "1 200+", label: { ru: "Авто поставлено", en: "Cars supplied" } }, { num: "8 лет", label: { ru: "На рынке", en: "Years on the market" } },
  { num: "4", label: { ru: "Страны отправки", en: "Source countries" } }, { num: "30–55", label: { ru: "Дней — срок доставки", en: "Days — delivery time" } },
];
export const WHY = [
  { icon: "Building2", title: { ru: "Прямые контракты", en: "Direct contracts" }, desc: { ru: "Работаем напрямую с аукционными домами без посредников — ниже цена, быстрее сделка.", en: "We work directly with auction houses without intermediaries — lower prices, faster deals." } },
  { icon: "BarChart3", title: { ru: "Оптовые объёмы", en: "Wholesale volumes" }, desc: { ru: "Ориентированы на B2B: минимальная партия от 3 авто. Чем больше объём — тем выгоднее условия.", en: "Focused on B2B: minimum batch of 3 cars. The larger the volume, the better the terms." } },
  { icon: "ClipboardList", title: { ru: "Прозрачная отчётность", en: "Transparent reporting" }, desc: { ru: "Фото, видео и отчёт на каждом этапе — от аукциона до разгрузки на вашем складе.", en: "Photos, video and a report at every stage — from the auction to unloading at your warehouse." } },
  { icon: "Headphones", title: { ru: "Персональный менеджер", en: "Personal manager" }, desc: { ru: "Один контакт на весь цикл сделки. Знает ваш бизнес и подбирает авто точно под ваш профиль.", en: "One contact for the entire deal cycle. They know your business and source cars to fit your profile." } },
];
export const STEPS = [
  { n: "01", title: { ru: "Заявка", en: "Request" }, desc: { ru: "Присылаете список нужных марок, моделей, годов и бюджет.", en: "You send a list of the makes, models, years and budget you need." } },
  { n: "02", title: { ru: "Подбор и торги", en: "Sourcing and bidding" }, desc: { ru: "Участвуем в аукционах. Согласовываем лот с вами до покупки.", en: "We take part in auctions. We confirm the lot with you before purchase." } },
  { n: "03", title: { ru: "Проверка и отгрузка", en: "Inspection and shipping" }, desc: { ru: "Инспектируем авто, грузим в контейнер, оформляем документы.", en: "We inspect the cars, load them into a container and prepare the documents." } },
  { n: "04", title: { ru: "Таможня и доставка", en: "Customs and delivery" }, desc: { ru: "Растаможиваем и доставляем до вашего склада по России.", en: "We clear customs and deliver to your warehouse across Russia." } },
];
export const BRANDS = ["Toyota","Lexus","Honda","Nissan","Mazda","Mitsubishi","Subaru","Hyundai","Kia","Ssangyong","BMW","Mercedes-Benz","Audi","Volkswagen"];

export const STATUS_COLOR: Record<string, string> = {
  new: "bg-blue-100 text-blue-700", processing: "bg-yellow-100 text-yellow-700",
  auction: "bg-purple-100 text-purple-700", shipped: "bg-indigo-100 text-indigo-700",
  customs: "bg-orange-100 text-orange-700", delivered: "bg-teal-100 text-teal-700", done: "bg-green-100 text-green-700",
};

// ── Status labels (frontend translation by status code) ──
export const STATUS_LABEL: Record<Lang, Record<string, string>> = {
  ru: { new: "Новая", processing: "В обработке", auction: "На аукционе", shipped: "Отправлен", customs: "На таможне", delivered: "Доставлен", done: "Завершён" },
  en: { new: "New", processing: "Processing", auction: "At auction", shipped: "Shipped", customs: "At customs", delivered: "Delivered", done: "Completed" },
};

// ── Origin name <-> code map (для перевода поля origin из заявок) ──
export const ORIGIN_LABEL: Record<Lang, Record<string, string>> = {
  ru: { "Япония": "Япония", "Корея": "Корея", "Гонконг": "Гонконг", "Китай": "Китай" },
  en: { "Япония": "Japan", "Корея": "Korea", "Гонконг": "Hong Kong", "Китай": "China" },
};

// ── i18n dictionary ──────────────────────────────────────────
export const I18N: Record<Lang, Record<string, string>> = {
  ru: {
    // nav
    nav_home: "Главная", nav_directions: "Направления", nav_services: "Услуги", nav_how: "Как работаем", nav_contacts: "Контакты",
    login: "Войти", register: "Регистрация", cabinet: "Личный кабинет", logout: "Выйти",
    // home hero
    hero_tag: "B2B поставки · Япония · Корея · Гонконг · Китай",
    hero_title_1: "ПОСТАВКА", hero_title_2: "МАШИНОКОМПЛЕКТОВ",
    hero_subtitle: "Partcore Logistics поставляет автомобили с азиатских аукционов для разборщиков и автомагазинов. Опт от 3 авто, полное таможенное сопровождение.",
    send_request: "Отправить заявку", how_we_work: "Как мы работаем",
    // home sections
    directions_tag: "Направления", from_where: "ОТКУДА ВЕЗЁМ",
    more: "Подробнее",
    what_we_do: "Что мы делаем", services_title: "УСЛУГИ",
    advantages_tag: "Преимущества", why_us: "ПОЧЕМУ МЫ",
    start_coop_tag: "Начните сотрудничество",
    cta_need_1: "НУЖНЫ", cta_need_2: "КОНТРАКТНЫЕ ЗАПЧАСТИ?",
    cta_subtitle: "Оставьте заявку — менеджер свяжется в течение 2 часов",
    // services page
    custom_service_title: "Нужна индивидуальная услуга?",
    custom_service_sub: "Расскажите о своём запросе — найдём решение под ваш бизнес",
    discuss_task: "Обсудить задачу",
    // how page
    process_tag: "Процесс", how_we_work_title: "КАК МЫ РАБОТАЕМ", start_coop: "Начать сотрудничество",
    // directions page
    source_countries: "СТРАНЫ ОТПРАВКИ",
    directions_intro: "Поставляем машинокомплекты с аукционов и от дилеров из Азии. Выберите направление, чтобы посмотреть марки, аукционы и условия доставки.",
    leave_request: "Оставить заявку",
    // origin page
    all_directions: "Все направления", direction_tag: "Направление",
    auction_access: "Доступ к аукционам",
    auction_access_sub: "Выберите площадку — мы откроем её во встроенном окне. Если аукцион не разрешает встраивание, откройте его в отдельной вкладке.",
    open_here: "Открыть здесь", open_new_tab_title: "Открыть в новой вкладке",
    in_new_tab: "В новой вкладке",
    iframe_warning: "Если окно пустое — аукцион запрещает встраивание. Откройте площадку напрямую.",
    open_auction: "Открыть аукцион",
    advantages: "Преимущества", popular_brands: "Популярные марки", auctions_platforms: "Аукционы и площадки",
    hot_deals_title: "Горячие предложения", hot_deals_sub: "Машинокомплекты в наличии и под заказ — успейте забронировать по выгодной цене",
    hd_year: "Год", hd_mileage: "Пробег", hd_engine: "Двигатель", hd_reserve: "Забронировать",
    tab_hot_deals: "Горячие предложения",
    hde_title: "Управление горячими предложениями (Гонконг)",
    hde_sub: "Добавляйте, редактируйте и удаляйте машинокомплекты, которые видят клиенты на странице Гонконга.",
    hde_brand: "Марка", hde_model: "Модель", hde_year: "Год выпуска", hde_mileage: "Пробег",
    hde_engine: "Двигатель", hde_price: "Цена", hde_badge: "Бейдж (например: Хит)",
    hde_photo: "Фото", hde_upload: "Загрузить фото", hde_add: "Добавить предложение",
    hde_save: "Сохранить изменения", hde_cancel: "Отменить", hde_edit: "Редактировать", hde_delete: "Удалить",
    hde_empty: "Предложений пока нет", hde_loading: "Загружаем предложения...", hde_saving: "Сохраняем...",
    hde_form_new: "Новое предложение", hde_form_edit: "Редактирование предложения",
    origin_cta_title_pre: "Нужны машинокомплекты из ", origin_cta_title_post: "?",
    origin_cta_sub: "Оставьте заявку — подберём авто под ваш запрос",
    // contacts
    contact_tag: "Связь", leave_request_title: "ОСТАВИТЬ ЗАЯВКУ",
    request_accepted: "Заявка принята!",
    request_accepted_sub: "Менеджер свяжется с вами в течение 2 рабочих часов",
    send_another: "Отправить ещё заявку",
    supply_request: "Заявка на поставку",
    supply_request_sub: "Для разборщиков и автомагазинов. Ответим за 2 часа.",
    contact_person: "Контактное лицо *", company_ip: "Компания / ИП", phone_req: "Телефон *",
    comment: "Комментарий", comment_ph: "Марки, объём, бюджет...",
    contacts: "Контакты", phone: "Телефон", phone_sub: "Бесплатно по России",
    email_sub: "Для коммерческих запросов", messenger_sub: "Ответим в течение 15 мин",
    office: "Офис", office_city: "Москва", office_hours: "Пн–Пт 9:00–18:00",
    ph_name: "Иван Петров", ph_company: "ООО «АвтоРазбор»",
    // login / register
    login_title: "Вход в кабинет", login_sub: "Введите email и пароль для входа",
    pwd: "Пароль *", logging_in: "Входим...", no_account: "Нет аккаунта?", do_register: "Зарегистрироваться",
    forgot_pwd: "Забыли пароль?", forgot_title: "Восстановление пароля", forgot_sub: "Укажите email — мы пришлём код для сброса пароля", forgot_sub2: "Введите код из письма и новый пароль",
    send_code: "Отправить код", sending: "Отправляем...", code_from_email: "Код из письма", new_pwd: "Новый пароль *", change_pwd: "Изменить пароль", saving: "Сохраняем...", resend_code: "Отправить код заново", back_to_login: "Вернуться ко входу",
    register_title: "Регистрация", register_sub: "Создайте аккаунт для доступа к личному кабинету",
    your_name: "Ваше имя *", phone_opt: "Телефон", pwd_min: "Пароль * (мин. 6 символов)",
    registering: "Регистрируем...", have_account: "Уже есть аккаунт?",
    err_login: "Ошибка входа", err_register: "Ошибка регистрации",
    err_send_code: "Не удалось отправить код", err_pwd_min: "Пароль — минимум 6 символов",
    get_code: "Получить код", sending_code: "Отправляем код...",
    code_title: "Подтверждение телефона", code_sub: "Введите код из SMS, отправленный на номер",
    sms_code: "Код из SMS", confirm: "Подтвердить", change_number: "Изменить номер",
    resend_code: "Отправить код повторно",
    auction_locked_title: "Доступ только для зарегистрированных",
    auction_locked_sub: "Войдите или зарегистрируйтесь, чтобы получить доступ к просмотру аукционов.",
    staff_login_title: "Вход для сотрудников", staff_login_sub: "Служебный доступ к панели работы с клиентами",
    err_not_staff: "Этот аккаунт не является сотрудником",
    // cabinet
    auth_required: "Для доступа необходимо войти",
    staff_cabinet: "Кабинет сотрудника", personal_cabinet: "Личный кабинет", staff_badge: "Сотрудник",
    tab_clients: "Заявки клиентов", tab_profile: "Профиль", tab_orders: "Мои заявки",
    tab_teardowns: "Разборные листы",
    tab_in_work: "Заявки в работе", tab_shipping: "Отправки",
    in_work_empty: "Нет заявок в работе", in_work_empty_sub: "Здесь появятся заявки, переведённые в работу",
    shipping_empty: "Нет отправок", shipping_empty_sub: "Здесь появятся отправленные и доставленные заявки",
    containers_title: "Собрать контейнер", container_new: "Новый контейнер", container_create: "Создать контейнер",
    container_name: "Название", container_number: "Номер контейнера",
    container_pick_title: "Машинокомплекты из заявок в работе", container_pick_hint: "Отметьте машинокомплекты и добавьте их в контейнер",
    container_no_cars: "Нет доступных машинокомплектов из заявок в работе", container_picked: "Выбрано",
    container_choose: "Выберите контейнер", container_add: "Добавить в контейнер",
    container_empty: "Контейнеры ещё не созданы", container_no_items: "Контейнер пуст",
    cst_collecting: "Сборка", cst_shipped: "Отправлен", cst_arrived: "Прибыл", cst_done: "Завершён",
    staff_create_order: "Создать заявку клиенту",
    staff_create_client: "Создать клиента",
    staff_client_created: "Клиент создан",
    staff_client_password: "Пароль (необязательно)",
    staff_client_password_ph: "Оставьте пустым — сгенерируется автоматически",
    staff_pick_client: "Клиент",
    staff_pick_client_ph: "Выберите клиента",
    td_all_group: "Выбрать все",
    td_clear_group: "Снять все",
    td_selected: "Выбрано",
    td_full: "Полная разборка",
    td_clear_all: "Очистить всё",
    td_mode_halfcut: "Крупноузловой (халфкат)",
    td_mode_halfcut_hint: "Крупные узлы: халфкаты, ДВС с КПП, кузов в сборе",
    td_mode_full: "Полный разбор",
    td_mode_full_hint: "Все детали и узлы по отдельности",
    td_mode_noskat: "Разбор с ноускатом",
    td_mode_noskat_hint: "Полный разбор, но передняя часть идёт одним ноускатом",
    td_badge_halfcut: "Халфкат",
    td_badge_full: "Полный разбор",
    td_badge_noskat: "С ноускатом",
    td_badge_custom: "Свой набор",
    td_filter_all: "Все",
    td_filter_none: "Нет авто с таким типом разбора",
    vin: "VIN автомобиля",
    pdf_popup_blocked: "Разрешите всплывающие окна, чтобы скачать PDF",
    teardowns_empty: "Пока нет авто с разборными листами",
    teardowns_empty_sub: "Они появятся, когда вы добавите авто в заявки клиентов",
    teardowns_all_cars: "Все авто с разборными листами",
    teardowns_open_order: "Открыть заявку",
    teardowns_no_list: "Разборный лист пуст",
    tab_active_orders: "Заказы", tab_new_order: "Новая заявка", tab_auctions: "Аукционы", tab_documents: "Документы",
    tab_staff_users: "Сотрудники",
    su_title: "Управление сотрудниками",
    su_sub: "Назначайте роль «Сотрудник» — такие пользователи получают доступ к панели работы с клиентами.",
    su_loading: "Загружаем пользователей...",
    su_empty: "Пользователей пока нет",
    su_role_staff: "Сотрудник", su_role_client: "Клиент",
    su_make_staff: "Сделать сотрудником", su_remove_staff: "Снять роль",
    su_you: "это вы",
    su_registered: "Регистрация:",
    loading_orders: "Загружаем заявки...", no_new_orders: "Новых заявок нет",
    no_new_orders_sub: "Создайте заявку на подбор — она появится здесь до начала работы",
    create_order: "Создать заявку",
    pcs: "шт.", up_to: "до",
    loading_active: "Загружаем заказы...", no_active_orders: "Активных заказов нет",
    no_active_orders_sub: "Здесь появятся заказы, как только менеджер возьмёт заявку в работу",
    step_processing: "В обработке", step_auction: "Торги", step_shipped: "Отгрузка",
    step_customs: "Таможня", step_delivered: "Доставка", step_done: "Готово",
    selected_cars: "Подобранные автомобили", km: "км",
    loading_clients: "Загружаем заявки клиентов...", no_client_orders: "Заявок пока нет",
    no_client_orders_sub: "Здесь появятся заявки от клиентов",
    cars_word: "авто", request_word: "Запрос:",
    all_client_orders: "Все заявки клиентов",
    client: "Клиент:", company_label: "Компания:", email_label: "Email:", phone_label: "Телефон:",
    request_label: "Запрос:", direction_label: "Направление:",
    client_comment: "Комментарий клиента: ",
    order_status: "Статус заказа",
    st_new: "Новая", st_processing: "В обработке", st_auction: "На аукционе", st_shipped: "Отправлен",
    st_customs: "На таможне", st_delivered: "Доставлен", st_done: "Завершён",
    add_car_title: "Добавить автомобиль клиенту",
    brand: "Марка *", model: "Модель", year: "Год", price_rub: "Цена, ₽", mileage_km: "Пробег, км",
    description_trim: "Описание / комплектация", description_ph: "Состояние, оценка аукциона, комплектация, узлы...",
    car_photos: "Фото автомобиля", photo: "Фото",
    saving: "Сохраняем...", add_car: "Добавить автомобиль",
    proposed_cars: "Предложенные автомобили", loading: "Загрузка...", nothing_added: "Пока ничего не добавлено",
    teardown_title: "Разборный лист", teardown_staff_hint: "Отметьте узлы и детали авто — клиент выберет нужные ему в личном кабинете",
    teardown_add: "Добавить", teardown_add_ph: "Своя позиция (узел или деталь)",
    teardown_client_hint: "Отметьте галочками узлы и детали, которые вам нужны", teardown_client_picked: "Клиент выбрал",
    new_order_created: "Заявка создана!", new_order_redirect: "Переходим к списку заявок...",
    new_order_title: "Новая заявка на подбор", new_order_sub: "Укажите параметры — менеджер подберёт варианты",
    qty: "Кол-во шт.", direction: "Направление", budget_unit: "Бюджет за ед., ₽",
    comment_req_ph: "Доп. требования к комплектации, состоянию...",
    jp_auctions: "Японские аукционы",
    jp_auctions_sub: "Прямой доступ к крупнейшим аукционным площадкам Японии и Кореи",
    go_to_auction: "Перейти на аукцион",
    auction_info_pre: "Наши менеджеры могут участвовать в торгах от вашего имени. ",
    auction_info_link: "Создайте заявку", auction_info_post: " — мы найдём нужный лот.",
    documents: "Документы", documents_sub: "Загрузите необходимые документы для оформления поставки",
    upload_document: "Загрузить документ", upload_hint: "PDF, JPG, PNG — до 10 МБ", choose_file: "Выбрать файл",
    no_documents: "Документов пока нет",
    edit_profile: "Редактировать профиль", profile_saved: "Профиль сохранён",
    full_name: "Полное имя", inn: "ИНН", save_changes: "Сохранить изменения",
    ph_inn: "1234567890",
    // footer
    footer_copy: "© 2024 Partcore Logistics. Поставка авто под разборку.",
    // auctions tab descriptions
    auc_uss: "Крупнейший аукцион Японии. Более 20 000 лотов еженедельно.",
    auc_ju: "Японский аукцион с широким выбором битых и страховых авто.",
    auc_taa: "Toyota Automobile Auction — официальная площадка Toyota.",
    auc_haa: "Honda Auto Auction — специализация на Honda и Acura.",
    auc_kcaa: "Крупнейший аукцион Кореи. Hyundai, Kia, Ssangyong.",
    auc_manheim: "Международная платформа с широкой базой корейских авто.",
    auc_tag_jp1: "Топ-1 Япония", auc_tag_crash: "Битые авто", auc_tag_toyota: "Toyota Official",
    auc_tag_honda: "Honda Official", auc_tag_kr1: "Топ-1 Корея", auc_tag_intl: "Международный",
  },
  en: {
    // nav
    nav_home: "Home", nav_directions: "Destinations", nav_services: "Services", nav_how: "How we work", nav_contacts: "Contacts",
    login: "Log in", register: "Sign up", cabinet: "Dashboard", logout: "Log out",
    // home hero
    hero_tag: "B2B supply · Japan · Korea · Hong Kong · China",
    hero_title_1: "VEHICLE ASSEMBLY", hero_title_2: "SUPPLY",
    hero_subtitle: "Partcore Logistics supplies cars from Asian auctions for dismantlers and auto shops. Wholesale from 3 cars, full customs support.",
    send_request: "Send request", how_we_work: "How we work",
    // home sections
    directions_tag: "Destinations", from_where: "WHERE WE SOURCE",
    more: "Learn more",
    what_we_do: "What we do", services_title: "SERVICES",
    advantages_tag: "Advantages", why_us: "WHY US",
    start_coop_tag: "Start cooperation",
    cta_need_1: "NEED", cta_need_2: "CONTRACT PARTS?",
    cta_subtitle: "Leave a request — a manager will contact you within 2 hours",
    // services page
    custom_service_title: "Need a custom service?",
    custom_service_sub: "Tell us about your request — we'll find a solution for your business",
    discuss_task: "Discuss your task",
    // how page
    process_tag: "Process", how_we_work_title: "HOW WE WORK", start_coop: "Start cooperation",
    // directions page
    source_countries: "SOURCE COUNTRIES",
    directions_intro: "We supply vehicle assemblies from auctions and dealers across Asia. Select a destination to view brands, auctions and delivery terms.",
    leave_request: "Leave a request",
    // origin page
    all_directions: "All destinations", direction_tag: "Destination",
    auction_access: "Auction access",
    auction_access_sub: "Select a platform — we'll open it in an embedded window. If the auction does not allow embedding, open it in a separate tab.",
    open_here: "Open here", open_new_tab_title: "Open in a new tab",
    in_new_tab: "In a new tab",
    iframe_warning: "If the window is empty, the auction blocks embedding. Open the platform directly.",
    open_auction: "Open auction",
    advantages: "Advantages", popular_brands: "Popular brands", auctions_platforms: "Auctions and platforms",
    hot_deals_title: "Hot deals", hot_deals_sub: "Vehicle assemblies in stock and to order — reserve now at a great price",
    hd_year: "Year", hd_mileage: "Mileage", hd_engine: "Engine", hd_reserve: "Reserve",
    tab_hot_deals: "Hot deals",
    hde_title: "Manage hot deals (Hong Kong)",
    hde_sub: "Add, edit and remove vehicle assemblies that clients see on the Hong Kong page.",
    hde_brand: "Brand", hde_model: "Model", hde_year: "Year", hde_mileage: "Mileage",
    hde_engine: "Engine", hde_price: "Price", hde_badge: "Badge (e.g. Hot)",
    hde_photo: "Photo", hde_upload: "Upload photo", hde_add: "Add deal",
    hde_save: "Save changes", hde_cancel: "Cancel", hde_edit: "Edit", hde_delete: "Delete",
    hde_empty: "No deals yet", hde_loading: "Loading deals...", hde_saving: "Saving...",
    hde_form_new: "New deal", hde_form_edit: "Edit deal",
    origin_cta_title_pre: "Need vehicle assemblies from ", origin_cta_title_post: "?",
    origin_cta_sub: "Leave a request — we'll source cars to match your needs",
    // contacts
    contact_tag: "Contact", leave_request_title: "LEAVE A REQUEST",
    request_accepted: "Request received!",
    request_accepted_sub: "A manager will contact you within 2 business hours",
    send_another: "Send another request",
    supply_request: "Supply request",
    supply_request_sub: "For dismantlers and auto shops. We'll reply within 2 hours.",
    contact_person: "Contact person *", company_ip: "Company / sole proprietor", phone_req: "Phone *",
    comment: "Comment", comment_ph: "Brands, volume, budget...",
    contacts: "Contacts", phone: "Phone", phone_sub: "Toll-free across Russia",
    email_sub: "For commercial inquiries", messenger_sub: "We reply within 15 min",
    office: "Office", office_city: "Moscow", office_hours: "Mon–Fri 9:00–18:00",
    ph_name: "John Smith", ph_company: "Acme Auto Parts LLC",
    // login / register
    login_title: "Log in to your dashboard", login_sub: "Enter your email and password to log in",
    pwd: "Password *", logging_in: "Logging in...", no_account: "No account?", do_register: "Sign up",
    forgot_pwd: "Forgot password?", forgot_title: "Reset password", forgot_sub: "Enter your email — we'll send a reset code", forgot_sub2: "Enter the code from the email and a new password",
    send_code: "Send code", sending: "Sending...", code_from_email: "Code from email", new_pwd: "New password *", change_pwd: "Change password", saving: "Saving...", resend_code: "Resend code", back_to_login: "Back to login",
    register_title: "Sign up", register_sub: "Create an account to access your dashboard",
    your_name: "Your name *", phone_opt: "Phone", pwd_min: "Password * (min. 6 characters)",
    registering: "Signing up...", have_account: "Already have an account?",
    err_login: "Login error", err_register: "Registration error",
    err_send_code: "Failed to send the code", err_pwd_min: "Password must be at least 6 characters",
    get_code: "Get code", sending_code: "Sending code...",
    code_title: "Phone verification", code_sub: "Enter the code from the SMS sent to",
    sms_code: "SMS code", confirm: "Confirm", change_number: "Change number",
    resend_code: "Resend code",
    auction_locked_title: "Registered users only",
    auction_locked_sub: "Log in or sign up to get access to auction viewing.",
    staff_login_title: "Staff login", staff_login_sub: "Internal access to the client management panel",
    err_not_staff: "This account is not a staff member",
    // cabinet
    auth_required: "You need to log in to access this",
    staff_cabinet: "Staff dashboard", personal_cabinet: "Dashboard", staff_badge: "Staff",
    tab_clients: "Client requests", tab_profile: "Profile", tab_orders: "My requests",
    tab_teardowns: "Teardown lists",
    tab_in_work: "In progress", tab_shipping: "Shipping",
    in_work_empty: "No requests in progress", in_work_empty_sub: "Requests moved to work will appear here",
    shipping_empty: "No shipments", shipping_empty_sub: "Shipped and delivered requests will appear here",
    containers_title: "Build a container", container_new: "New container", container_create: "Create container",
    container_name: "Name", container_number: "Container number",
    container_pick_title: "Vehicle kits from in-progress requests", container_pick_hint: "Select vehicle kits and add them to a container",
    container_no_cars: "No available vehicle kits from in-progress requests", container_picked: "Selected",
    container_choose: "Choose container", container_add: "Add to container",
    container_empty: "No containers yet", container_no_items: "Container is empty",
    cst_collecting: "Collecting", cst_shipped: "Shipped", cst_arrived: "Arrived", cst_done: "Completed",
    staff_create_order: "Create client request",
    staff_create_client: "Create client",
    staff_client_created: "Client created",
    staff_client_password: "Password (optional)",
    staff_client_password_ph: "Leave empty to auto-generate",
    staff_pick_client: "Client",
    staff_pick_client_ph: "Select a client",
    td_all_group: "Select all",
    td_clear_group: "Clear all",
    td_selected: "Selected",
    td_full: "Full teardown",
    td_clear_all: "Clear all",
    td_mode_halfcut: "Half-cut (large units)",
    td_mode_halfcut_hint: "Large units: half-cuts, engine with gearbox, body assembly",
    td_mode_full: "Full teardown",
    td_mode_full_hint: "All parts and components separately",
    td_mode_noskat: "Teardown with nose cut",
    td_mode_noskat_hint: "Full teardown, but the front goes as a single nose cut",
    td_badge_halfcut: "Half-cut",
    td_badge_full: "Full teardown",
    td_badge_noskat: "With nose cut",
    td_badge_custom: "Custom set",
    td_filter_all: "All",
    td_filter_none: "No cars with this teardown type",
    vin: "Vehicle VIN",
    pdf_popup_blocked: "Allow pop-ups to download the PDF",
    teardowns_empty: "No cars with teardown lists yet",
    teardowns_empty_sub: "They appear once you add cars to client requests",
    teardowns_all_cars: "All cars with teardown lists",
    teardowns_open_order: "Open request",
    teardowns_no_list: "Teardown list is empty",
    tab_active_orders: "Orders", tab_new_order: "New request", tab_auctions: "Auctions", tab_documents: "Documents",
    tab_staff_users: "Staff",
    su_title: "Staff management",
    su_sub: "Grant the \"Staff\" role — these users get access to the client management panel.",
    su_loading: "Loading users...",
    su_empty: "No users yet",
    su_role_staff: "Staff", su_role_client: "Client",
    su_make_staff: "Make staff", su_remove_staff: "Remove role",
    su_you: "you",
    su_registered: "Registered:",
    loading_orders: "Loading requests...", no_new_orders: "No new requests",
    no_new_orders_sub: "Create a sourcing request — it will appear here until work begins",
    create_order: "Create request",
    pcs: "pcs", up_to: "up to",
    loading_active: "Loading orders...", no_active_orders: "No active orders",
    no_active_orders_sub: "Orders will appear here once a manager starts working on your request",
    step_processing: "Processing", step_auction: "Bidding", step_shipped: "Shipping",
    step_customs: "Customs", step_delivered: "Delivery", step_done: "Done",
    selected_cars: "Selected cars", km: "km",
    loading_clients: "Loading client requests...", no_client_orders: "No requests yet",
    no_client_orders_sub: "Client requests will appear here",
    cars_word: "cars", request_word: "Request:",
    all_client_orders: "All client requests",
    client: "Client:", company_label: "Company:", email_label: "Email:", phone_label: "Phone:",
    request_label: "Request:", direction_label: "Destination:",
    client_comment: "Client comment: ",
    order_status: "Order status",
    st_new: "New", st_processing: "Processing", st_auction: "At auction", st_shipped: "Shipped",
    st_customs: "At customs", st_delivered: "Delivered", st_done: "Completed",
    add_car_title: "Add a car for the client",
    brand: "Make *", model: "Model", year: "Year", price_rub: "Price, ₽", mileage_km: "Mileage, km",
    description_trim: "Description / trim", description_ph: "Condition, auction grade, trim, components...",
    car_photos: "Car photos", photo: "Photo",
    saving: "Saving...", add_car: "Add car",
    proposed_cars: "Proposed cars", loading: "Loading...", nothing_added: "Nothing added yet",
    teardown_title: "Teardown list", teardown_staff_hint: "Mark the car's parts and components — the client will pick the ones they need in their dashboard",
    teardown_add: "Add", teardown_add_ph: "Custom item (part or component)",
    teardown_client_hint: "Tick the parts and components you need", teardown_client_picked: "Client picked",
    new_order_created: "Request created!", new_order_redirect: "Redirecting to the request list...",
    new_order_title: "New sourcing request", new_order_sub: "Specify the parameters — a manager will find options",
    qty: "Quantity", direction: "Destination", budget_unit: "Budget per unit, ₽",
    comment_req_ph: "Additional requirements for trim, condition...",
    jp_auctions: "Japanese auctions",
    jp_auctions_sub: "Direct access to the largest auction platforms in Japan and Korea",
    go_to_auction: "Go to auction",
    auction_info_pre: "Our managers can bid on your behalf. ",
    auction_info_link: "Create a request", auction_info_post: " — we'll find the right lot.",
    documents: "Documents", documents_sub: "Upload the documents required to process the supply",
    upload_document: "Upload document", upload_hint: "PDF, JPG, PNG — up to 10 MB", choose_file: "Choose file",
    no_documents: "No documents yet",
    edit_profile: "Edit profile", profile_saved: "Profile saved",
    full_name: "Full name", inn: "Tax ID (INN)", save_changes: "Save changes",
    ph_inn: "1234567890",
    // footer
    footer_copy: "© 2024 Partcore Logistics. Supply of cars for dismantling.",
    // auctions tab descriptions
    auc_uss: "The largest auction in Japan. Over 20,000 lots weekly.",
    auc_ju: "Japanese auction with a wide selection of damaged and insurance cars.",
    auc_taa: "Toyota Automobile Auction — Toyota's official platform.",
    auc_haa: "Honda Auto Auction — specializing in Honda and Acura.",
    auc_kcaa: "The largest auction in Korea. Hyundai, Kia, Ssangyong.",
    auc_manheim: "International platform with a wide base of Korean cars.",
    auc_tag_jp1: "Top-1 Japan", auc_tag_crash: "Damaged cars", auc_tag_toyota: "Toyota Official",
    auc_tag_honda: "Honda Official", auc_tag_kr1: "Top-1 Korea", auc_tag_intl: "International",
  },
};

export type Page = "home" | "directions" | "services" | "how" | "contacts" | "login" | "register" | "cabinet" | "origin" | "staff_login" | "forgot";
export type CabinetTab = "orders" | "active_orders" | "new_order" | "auctions" | "documents" | "profile" | "clients" | "in_work" | "shipping" | "staff_users" | "hot_deals" | "teardowns";

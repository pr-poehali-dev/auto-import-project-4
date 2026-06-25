import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";

const LOGO = "https://cdn.poehali.dev/projects/92e249db-e174-4ab7-8e64-42d927b13e30/bucket/0d9e1542-9580-4b01-a093-0b9580927df1.jpg";
const HERO_IMG = "https://cdn.poehali.dev/projects/92e249db-e174-4ab7-8e64-42d927b13e30/files/7f88b313-5823-46e8-b5bc-217779dc9159.jpg";
const DIRECTIONS_IMG = "https://cdn.poehali.dev/projects/92e249db-e174-4ab7-8e64-42d927b13e30/files/aedb59f4-ddb5-4001-b220-1edb774e89a4.jpg";
const SERVICES_IMG = "https://cdn.poehali.dev/projects/92e249db-e174-4ab7-8e64-42d927b13e30/files/8b4c69b3-835f-482c-a4d0-7789392c02da.jpg";
const HOW_IMG = "https://cdn.poehali.dev/projects/92e249db-e174-4ab7-8e64-42d927b13e30/files/860a7ef0-c02a-4734-806c-11360d2ed14d.jpg";
const CONTACTS_IMG = "https://cdn.poehali.dev/projects/92e249db-e174-4ab7-8e64-42d927b13e30/files/ca83d876-8b7a-4801-86e6-c0bd70225c97.jpg";
const PAGE_BG = "https://cdn.poehali.dev/projects/92e249db-e174-4ab7-8e64-42d927b13e30/files/99f57650-e15d-441d-a58e-1ae5e323cbce.jpg";

const AUTH_URL = "https://functions.poehali.dev/ddb4a7f6-82c2-4cca-8d4c-ed685f8a3c72";
const ORDERS_URL = "https://functions.poehali.dev/d57608b2-729a-4006-a5c2-598ca59a8239";
const CARS_URL = "https://functions.poehali.dev/8f3531c8-943d-46dc-acd0-b9a6618054db";
const HOT_DEALS_URL = "https://functions.poehali.dev/cc988794-2c9d-4cf0-935d-51df0229a699";

// ── API helpers ──────────────────────────────────────────────
async function safeJson(res: Response) {
  try { return await res.json(); }
  catch { return { error: "Сервис временно недоступен" }; }
}

async function apiAuth(action: string, payload: object = {}, token?: string) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["X-Session-Token"] = token;
  const res = await fetch(AUTH_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({ action, ...payload }),
  });
  return safeJson(res);
}

async function apiOrders(method: "GET" | "POST" | "PUT", token: string, body?: object) {
  const headers: Record<string, string> = { "X-Session-Token": token };
  if (body) headers["Content-Type"] = "application/json";
  const res = await fetch(ORDERS_URL, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  return safeJson(res);
}

async function apiCars(method: "GET" | "POST" | "PATCH" | "DELETE", token: string, opts: { body?: object; query?: string } = {}) {
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

async function apiHotDeals(method: "GET" | "POST" | "DELETE", opts: { token?: string; body?: object; query?: string } = {}) {
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
interface User { id: number; email: string; phone: string; full_name: string; company: string; inn: string; created_at: string; role?: string; }
interface Order { id: number; order_number: string; car_brand: string; car_model: string; car_year: number; quantity: number; budget: number; status: string; status_label: string; origin: string; created_at: string; comment?: string; client_name?: string; client_email?: string; client_phone?: string; client_company?: string; cars_count?: number; }
interface TeardownItem { name: string; needed: boolean; }
interface Car { id: number; car_brand: string; car_model: string; car_year: number; price: number; mileage: number; description: string; photos: string[]; teardown: TeardownItem[]; created_at: string; }

const TEARDOWN_PRESET = [
  "Двигатель", "АКПП / МКПП", "Раздаточная коробка", "Редуктор",
  "Передняя подвеска", "Задняя подвеска", "Рулевая рейка",
  "Кузов (каркас)", "Капот", "Двери комплект", "Крылья", "Бамперы",
  "Фары / фонари", "Салон (сиденья, торпедо)", "Электрика / проводка",
  "Колёса / диски", "Радиатор / охлаждение", "Топливная система",
  "Выхлопная система", "Тормозная система",
];
interface HotDeal { id: number; origin: string; brand: string; model: string; year: number | null; mileage: string; engine: string; price: string; badge: string; photo: string; sort_order: number; }

type Lang = "ru" | "en";
type LS = { ru: string; en: string };

const ORIGINS = [
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
const SERVICES = [
  { icon: "Package", title: { ru: "Поставка авто под разборку", en: "Supply of cars for dismantling" }, desc: { ru: "Подбираем автомобили с аукционов и у дилеров под ваш запрос. Битые, с пробегом, снятые с учёта.", en: "We source cars from auctions and dealers to match your request. Damaged, used, deregistered." } },
  { icon: "FileCheck", title: { ru: "Таможенное оформление", en: "Customs clearance" }, desc: { ru: "Полное сопровождение: документы, СБКТС, таможенная декларация. Растаможка под ключ.", en: "Full support: documents, certification, customs declaration. Turnkey customs clearance." } },
  { icon: "Truck", title: { ru: "Доставка по России", en: "Delivery across Russia" }, desc: { ru: "Логистика от порта до вашего склада. Работаем с Владивостоком, Санкт-Петербургом, Новороссийском.", en: "Logistics from the port to your warehouse. We work with Vladivostok, St. Petersburg and Novorossiysk." } },
  { icon: "Search", title: { ru: "Подбор по запросу", en: "Sourcing on request" }, desc: { ru: "Нужна конкретная марка, модель или год? Ищем точно под ваши требования на аукционах Азии.", en: "Need a specific make, model or year? We search precisely to your requirements at Asian auctions." } },
  { icon: "Warehouse", title: { ru: "Хранение на складе", en: "Warehouse storage" }, desc: { ru: "Временное хранение до вашей готовности принять партию. Охраняемые склады у портов.", en: "Temporary storage until you are ready to receive the batch. Secured warehouses near the ports." } },
  { icon: "ShieldCheck", title: { ru: "Проверка перед покупкой", en: "Pre-purchase inspection" }, desc: { ru: "Инспекция состояния авто, фото и отчёт о комплектности узлов до отправки из страны.", en: "Vehicle condition inspection, photos and a report on component completeness before shipping from the country." } },
];
const STATS = [
  { num: "1 200+", label: { ru: "Авто поставлено", en: "Cars supplied" } }, { num: "8 лет", label: { ru: "На рынке", en: "Years on the market" } },
  { num: "4", label: { ru: "Страны отправки", en: "Source countries" } }, { num: "30–55", label: { ru: "Дней — срок доставки", en: "Days — delivery time" } },
];
const WHY = [
  { icon: "Building2", title: { ru: "Прямые контракты", en: "Direct contracts" }, desc: { ru: "Работаем напрямую с аукционными домами без посредников — ниже цена, быстрее сделка.", en: "We work directly with auction houses without intermediaries — lower prices, faster deals." } },
  { icon: "BarChart3", title: { ru: "Оптовые объёмы", en: "Wholesale volumes" }, desc: { ru: "Ориентированы на B2B: минимальная партия от 3 авто. Чем больше объём — тем выгоднее условия.", en: "Focused on B2B: minimum batch of 3 cars. The larger the volume, the better the terms." } },
  { icon: "ClipboardList", title: { ru: "Прозрачная отчётность", en: "Transparent reporting" }, desc: { ru: "Фото, видео и отчёт на каждом этапе — от аукциона до разгрузки на вашем складе.", en: "Photos, video and a report at every stage — from the auction to unloading at your warehouse." } },
  { icon: "Headphones", title: { ru: "Персональный менеджер", en: "Personal manager" }, desc: { ru: "Один контакт на весь цикл сделки. Знает ваш бизнес и подбирает авто точно под ваш профиль.", en: "One contact for the entire deal cycle. They know your business and source cars to fit your profile." } },
];
const STEPS = [
  { n: "01", title: { ru: "Заявка", en: "Request" }, desc: { ru: "Присылаете список нужных марок, моделей, годов и бюджет.", en: "You send a list of the makes, models, years and budget you need." } },
  { n: "02", title: { ru: "Подбор и торги", en: "Sourcing and bidding" }, desc: { ru: "Участвуем в аукционах. Согласовываем лот с вами до покупки.", en: "We take part in auctions. We confirm the lot with you before purchase." } },
  { n: "03", title: { ru: "Проверка и отгрузка", en: "Inspection and shipping" }, desc: { ru: "Инспектируем авто, грузим в контейнер, оформляем документы.", en: "We inspect the cars, load them into a container and prepare the documents." } },
  { n: "04", title: { ru: "Таможня и доставка", en: "Customs and delivery" }, desc: { ru: "Растаможиваем и доставляем до вашего склада по России.", en: "We clear customs and deliver to your warehouse across Russia." } },
];
const BRANDS = ["Toyota","Lexus","Honda","Nissan","Mazda","Mitsubishi","Subaru","Hyundai","Kia","Ssangyong","BMW","Mercedes-Benz","Audi","Volkswagen"];

const STATUS_COLOR: Record<string, string> = {
  new: "bg-blue-100 text-blue-700", processing: "bg-yellow-100 text-yellow-700",
  auction: "bg-purple-100 text-purple-700", shipped: "bg-indigo-100 text-indigo-700",
  customs: "bg-orange-100 text-orange-700", delivered: "bg-teal-100 text-teal-700", done: "bg-green-100 text-green-700",
};

// ── Status labels (frontend translation by status code) ──
const STATUS_LABEL: Record<Lang, Record<string, string>> = {
  ru: { new: "Новая", processing: "В обработке", auction: "На аукционе", shipped: "Отправлен", customs: "На таможне", delivered: "Доставлен", done: "Завершён" },
  en: { new: "New", processing: "Processing", auction: "At auction", shipped: "Shipped", customs: "At customs", delivered: "Delivered", done: "Completed" },
};

// ── Origin name <-> code map (для перевода поля origin из заявок) ──
const ORIGIN_LABEL: Record<Lang, Record<string, string>> = {
  ru: { "Япония": "Япония", "Корея": "Корея", "Гонконг": "Гонконг", "Китай": "Китай" },
  en: { "Япония": "Japan", "Корея": "Korea", "Гонконг": "Hong Kong", "Китай": "China" },
};

// ── i18n dictionary ──────────────────────────────────────────
const I18N: Record<Lang, Record<string, string>> = {
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

type Page = "home" | "directions" | "services" | "how" | "contacts" | "login" | "register" | "cabinet" | "origin" | "staff_login" | "forgot";
type CabinetTab = "orders" | "active_orders" | "new_order" | "auctions" | "documents" | "profile" | "clients" | "staff_users" | "hot_deals";

// ════════════════════════════════════════════════════════════
export default function Index() {
  const [lang, setLang] = useState<Lang>(() => (localStorage.getItem("pc_lang") as Lang) || "ru");
  const t = (key: string) => I18N[lang][key] || key;
  const changeLang = (l: Lang) => { setLang(l); localStorage.setItem("pc_lang", l); };
  const [page, setPage] = useState<Page>(() => (typeof window !== "undefined" && window.location.hash === "#staff") ? "staff_login" : "home");
  const [originId, setOriginId] = useState<string>("hongkong");
  const [activeAuction, setActiveAuction] = useState<{ name: string; url: string } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  // auth
  const [token, setToken] = useState(() => localStorage.getItem("pc_token") || "");
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  // forms
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [forgotForm, setForgotForm] = useState({ email: "", code: "", password: "" });
  const [forgotStep, setForgotStep] = useState<"email" | "reset">("email");
  const [forgotMsg, setForgotMsg] = useState("");
  const [regForm, setRegForm] = useState({ email: "", password: "", full_name: "", phone: "", company: "", code: "" });
  const [regStep, setRegStep] = useState<"form" | "code">("form");
  const [codeSending, setCodeSending] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", company: "", phone: "", comment: "" });
  const [contactSent, setContactSent] = useState(false);
  // cabinet
  const [cabinetTab, setCabinetTab] = useState<CabinetTab>("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [profileForm, setProfileForm] = useState({ full_name: "", phone: "", company: "", inn: "" });
  const [profileSaved, setProfileSaved] = useState(false);
  const [newOrderForm, setNewOrderForm] = useState({ car_brand: "", car_model: "", car_year: "", quantity: "1", budget: "", origin: "Япония", comment: "" });
  const [newOrderSent, setNewOrderSent] = useState(false);
  // staff: работа с заявкой клиента
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [cars, setCars] = useState<Car[]>([]);
  const [carsLoading, setCarsLoading] = useState(false);
  const [carForm, setCarForm] = useState({ car_brand: "", car_model: "", car_year: "", price: "", mileage: "", description: "", photos: [] as string[], teardown: [] as TeardownItem[] });
  const [carSaving, setCarSaving] = useState(false);
  const [teardownInput, setTeardownInput] = useState("");
  // клиент: сохранение отметок разборного листа
  const [savingTeardown, setSavingTeardown] = useState<number | null>(null);

  const toggleCarFormPart = (name: string) => {
    setCarForm((f) => {
      const exists = f.teardown.find((x) => x.name === name);
      return exists
        ? { ...f, teardown: f.teardown.filter((x) => x.name !== name) }
        : { ...f, teardown: [...f.teardown, { name, needed: false }] };
    });
  };
  const addCustomPart = () => {
    const name = teardownInput.trim();
    if (!name || carForm.teardown.some((x) => x.name === name)) { setTeardownInput(""); return; }
    setCarForm((f) => ({ ...f, teardown: [...f.teardown, { name, needed: false }] }));
    setTeardownInput("");
  };

  const toggleClientPart = async (car: Car, partName: string) => {
    const updated = car.teardown.map((it) => it.name === partName ? { ...it, needed: !it.needed } : it);
    setOrderCars((prev) => {
      const next: Record<number, Car[]> = {};
      for (const k of Object.keys(prev)) {
        next[+k] = prev[+k].map((c) => c.id === car.id ? { ...c, teardown: updated } : c);
      }
      return next;
    });
    setSavingTeardown(car.id);
    await apiCars("PATCH", token, { body: { car_id: car.id, teardown: updated } });
    setSavingTeardown(null);
  };
  // staff: управление сотрудниками
  interface ManagedUser { id: number; email: string; full_name: string; phone: string; company: string; role: string; created_at: string; }
  const [staffUsers, setStaffUsers] = useState<ManagedUser[]>([]);
  const [staffUsersLoading, setStaffUsersLoading] = useState(false);
  const [roleSavingId, setRoleSavingId] = useState<number | null>(null);
  // горячие предложения (Гонконг)
  const emptyDeal = { id: 0, brand: "", model: "", year: "", mileage: "", engine: "", price: "", badge: "", photo: "" };
  const [hotDeals, setHotDeals] = useState<HotDeal[]>([]);
  const [hotDealsLoading, setHotDealsLoading] = useState(false);
  const [dealForm, setDealForm] = useState({ ...emptyDeal });
  const [dealSaving, setDealSaving] = useState(false);
  const [dealDeletingId, setDealDeletingId] = useState<number | null>(null);

  const loadHotDeals = async () => {
    setHotDealsLoading(true);
    const d = await apiHotDeals("GET", { query: "origin=hongkong" });
    setHotDeals(d.deals || []);
    setHotDealsLoading(false);
  };

  const pickDealPhoto = (file: File): Promise<string> =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });

  const editDeal = (d: HotDeal) => {
    setDealForm({ id: d.id, brand: d.brand, model: d.model, year: d.year ? String(d.year) : "", mileage: d.mileage, engine: d.engine, price: d.price, badge: d.badge, photo: d.photo });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const saveDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    setDealSaving(true);
    await apiHotDeals("POST", { token, body: { ...dealForm, origin: "hongkong", year: dealForm.year ? Number(dealForm.year) : null, sort_order: dealForm.id || hotDeals.length + 1 } });
    setDealForm({ ...emptyDeal });
    await loadHotDeals();
    setDealSaving(false);
  };

  const deleteDeal = async (id: number) => {
    setDealDeletingId(id);
    await apiHotDeals("DELETE", { token, query: `id=${id}` });
    await loadHotDeals();
    setDealDeletingId(null);
  };

  const loadStaffUsers = async () => {
    setStaffUsersLoading(true);
    const d = await apiAuth("list_users", {}, token);
    setStaffUsers(d.users || []);
    setStaffUsersLoading(false);
  };

  const toggleUserRole = async (u: ManagedUser) => {
    setRoleSavingId(u.id);
    const newRole = u.role === "staff" ? "client" : "staff";
    await apiAuth("set_role", { user_id: u.id, role: newRole }, token);
    await loadStaffUsers();
    setRoleSavingId(null);
  };

  // ── load user on mount ──
  useEffect(() => {
    if (token) {
      apiAuth("me", {}, token).then((data) => {
        if (data.user) setUser(data.user);
        else { setToken(""); localStorage.removeItem("pc_token"); }
      });
    }
  }, []);

  // ── load hot deals on Hong Kong origin page ──
  useEffect(() => {
    if (page === "origin" && originId === "hongkong") loadHotDeals();
  }, [page, originId]);

  // ── load hot deals in staff cabinet tab ──
  useEffect(() => {
    if (page === "cabinet" && token && user?.role === "staff" && cabinetTab === "hot_deals") loadHotDeals();
  }, [page, cabinetTab, token, user]);

  // ── load orders when cabinet opens ──
  useEffect(() => {
    const needOrders = page === "cabinet" && token && ["orders", "active_orders", "clients"].includes(cabinetTab);
    if (needOrders) {
      setOrdersLoading(true);
      apiOrders("GET", token)
        .then((d) => { setOrders(d.orders || []); })
        .catch(() => { setOrders([]); })
        .finally(() => { setOrdersLoading(false); });
    }
  }, [page, cabinetTab, token]);

  const isStaff = user?.role === "staff";

  useEffect(() => {
    if (page === "cabinet" && token && isStaff && cabinetTab === "staff_users") {
      loadStaffUsers();
    }
  }, [page, cabinetTab, token, isStaff]);

  const loadCars = async (orderId: number) => {
    setCarsLoading(true);
    const d = await apiCars("GET", token, { query: `order_id=${orderId}` });
    setCars(d.cars || []);
    setCarsLoading(false);
  };

  const openOrderCars = (o: Order) => {
    setSelectedOrder(o);
    setCarForm({ car_brand: "", car_model: "", car_year: "", price: "", mileage: "", description: "", photos: [], teardown: [] });
    loadCars(o.id);
  };

  const changeOrderStatus = async (orderId: number, status: string) => {
    await apiOrders("PUT", token, { order_id: orderId, status });
    const d = await apiOrders("GET", token);
    setOrders(d.orders || []);
    if (selectedOrder?.id === orderId) {
      const upd = (d.orders || []).find((x: Order) => x.id === orderId);
      if (upd) setSelectedOrder(upd);
    }
  };

  const handlePhotoSelect = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => setCarForm((f) => ({ ...f, photos: [...f.photos, reader.result as string] }));
      reader.readAsDataURL(file);
    });
  };

  const doAddCar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setCarSaving(true);
    await apiCars("POST", token, { body: {
      order_id: selectedOrder.id,
      car_brand: carForm.car_brand, car_model: carForm.car_model,
      car_year: carForm.car_year ? parseInt(carForm.car_year) : null,
      price: carForm.price ? parseInt(carForm.price) : null,
      mileage: carForm.mileage ? parseInt(carForm.mileage) : null,
      description: carForm.description, photos: carForm.photos, teardown: carForm.teardown,
    } });
    setCarSaving(false);
    setCarForm({ car_brand: "", car_model: "", car_year: "", price: "", mileage: "", description: "", photos: [], teardown: [] });
    loadCars(selectedOrder.id);
    const d = await apiOrders("GET", token);
    setOrders(d.orders || []);
  };

  const doDeleteCar = async (carId: number) => {
    await apiCars("DELETE", token, { query: `car_id=${carId}` });
    if (selectedOrder) loadCars(selectedOrder.id);
  };

  // клиент: раскрытие авто по заявке
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [orderCars, setOrderCars] = useState<Record<number, Car[]>>({});
  const toggleOrderCars = async (orderId: number) => {
    if (expandedOrder === orderId) { setExpandedOrder(null); return; }
    setExpandedOrder(orderId);
    if (!orderCars[orderId]) {
      const d = await apiCars("GET", token, { query: `order_id=${orderId}` });
      setOrderCars((prev) => ({ ...prev, [orderId]: d.cars || [] }));
    }
  };

  // ── fill profile form from user ──
  useEffect(() => {
    if (user) {
      setProfileForm({ full_name: user.full_name, phone: user.phone, company: user.company, inn: user.inn });
      setCabinetTab(user.role === "staff" ? "clients" : "orders");
    }
  }, [user]);

  const nav = (p: Page) => { setPage(p); setMenuOpen(false); setAuthError(""); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const openOrigin = (id: string) => { setOriginId(id); setActiveAuction(null); setPage("origin"); setMenuOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const doLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setAuthLoading(true); setAuthError("");
    const data = await apiAuth("login", loginForm);
    setAuthLoading(false);
    if (data.token) {
      setToken(data.token); localStorage.setItem("pc_token", data.token);
      const me = await apiAuth("me", {}, data.token);
      if (me.user) setUser(me.user);
      nav("cabinet");
    } else setAuthError(data.error || t("err_login"));
  };

  const doForgot = async (e: React.FormEvent) => {
    e.preventDefault(); setAuthLoading(true); setAuthError(""); setForgotMsg("");
    const data = await apiAuth("forgot_password", { email: forgotForm.email });
    setAuthLoading(false);
    if (data.error) { setAuthError(data.error); return; }
    setForgotStep("reset");
    setForgotMsg(data.message || "");
  };

  const doReset = async (e: React.FormEvent) => {
    e.preventDefault(); setAuthLoading(true); setAuthError(""); setForgotMsg("");
    const data = await apiAuth("reset_password", forgotForm);
    setAuthLoading(false);
    if (data.error) { setAuthError(data.error); return; }
    setForgotStep("email");
    setForgotForm({ email: "", code: "", password: "" });
    setLoginForm({ email: "", password: "" });
    nav("login");
    setAuthError("");
    setForgotMsg("");
    alert(data.message || "Пароль изменён");
  };

  const doStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setAuthLoading(true); setAuthError("");
    const data = await apiAuth("login", loginForm);
    if (!data.token) { setAuthLoading(false); setAuthError(data.error || t("err_login")); return; }
    const me = await apiAuth("me", {}, data.token);
    setAuthLoading(false);
    if (me.user && me.user.role === "staff") {
      setToken(data.token); localStorage.setItem("pc_token", data.token);
      setUser(me.user);
      window.location.hash = "";
      nav("cabinet");
    } else {
      await apiAuth("logout", {}, data.token);
      setAuthError(t("err_not_staff"));
    }
  };

  const doSendCode = async (e: React.FormEvent) => {
    e.preventDefault(); setCodeSending(true); setAuthError("");
    if ((regForm.password || "").length < 6) { setAuthError(t("err_pwd_min")); setCodeSending(false); return; }
    const data = await apiAuth("send_code", { phone: regForm.phone });
    setCodeSending(false);
    if (data.message) { setRegStep("code"); }
    else setAuthError(data.error || t("err_send_code"));
  };

  const doRegister = async (e: React.FormEvent) => {
    e.preventDefault(); setAuthLoading(true); setAuthError("");
    const data = await apiAuth("register", regForm);
    setAuthLoading(false);
    if (data.token) {
      setToken(data.token); localStorage.setItem("pc_token", data.token);
      const me = await apiAuth("me", {}, data.token);
      if (me.user) setUser(me.user);
      setRegStep("form");
      nav("cabinet");
    } else setAuthError(data.error || t("err_register"));
  };

  const resetRegStep = () => { setRegStep("form"); setRegForm({ ...regForm, code: "" }); setAuthError(""); };

  const doLogout = async () => {
    await apiAuth("logout", {}, token);
    setToken(""); setUser(null); localStorage.removeItem("pc_token"); nav("home");
  };

  const doSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await apiAuth("update_profile", profileForm, token);
    const me = await apiAuth("me", {}, token);
    if (me.user) setUser(me.user);
    setProfileSaved(true); setTimeout(() => setProfileSaved(false), 3000);
  };

  const doNewOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    await apiOrders("POST", token, { ...newOrderForm, car_year: parseInt(newOrderForm.car_year) || null, quantity: parseInt(newOrderForm.quantity), budget: parseInt(newOrderForm.budget) || null });
    setNewOrderSent(true);
    setNewOrderForm({ car_brand: "", car_model: "", car_year: "", quantity: "1", budget: "", origin: "Япония", comment: "" });
    setTimeout(() => { setNewOrderSent(false); setCabinetTab("orders"); }, 2000);
  };

  const navItems = [
    { id: "home" as Page, label: t("nav_home"), icon: "Home" },
    { id: "directions" as Page, label: t("nav_directions"), icon: "Globe" },
    { id: "services" as Page, label: t("nav_services"), icon: "Wrench" },
    { id: "how" as Page, label: t("nav_how"), icon: "Workflow" },
    { id: "contacts" as Page, label: t("nav_contacts"), icon: "Mail" },
  ];

  const inputCls = "w-full bg-[hsl(220_25%_97%)] border border-[hsl(220_15%_88%)] px-4 py-3 text-sm text-[hsl(var(--navy))] placeholder-[hsl(var(--navy)/0.5)] focus:outline-none focus:border-[hsl(var(--navy)/0.5)] transition-colors rounded-sm";

  return (
    <div className="min-h-screen text-foreground overflow-x-hidden relative">

      {/* ── FULL-PAGE BACKGROUND ── */}
      <div className="fixed inset-0 -z-10 bg-cover bg-center" style={{ backgroundImage: `url(${PAGE_BG})` }} />
      <div className="fixed inset-0 -z-10 bg-[hsl(220_52%_10%/0.55)]" />

      {/* ── ПЛАВАЮЩИЙ ЛОГОТИП С МЕНЮ (десктоп) ── */}
      <div className="hidden md:block fixed top-4 left-5 z-50 group/logo">
        <button onClick={() => nav("home")} className="flex items-center gap-2 rounded-sm overflow-hidden bg-white/90 backdrop-blur-md border border-white/40 shadow-lg pr-3">
          <img src={LOGO} alt="Partcore Logistics" className="h-14 w-14 object-contain" />
          <span className="font-['Montserrat'] font-black text-xl leading-none">
            <span className="navy">PARTCORE</span> <span className="text-[hsl(var(--gold))]">LOGISTICS</span>
          </span>
        </button>

        {/* вертикальное меню-иконки при наведении на логотип */}
        <div className="flex absolute left-2 top-full flex-col gap-2 pt-3 opacity-0 -translate-y-2 pointer-events-none group-hover/logo:opacity-100 group-hover/logo:translate-y-0 group-hover/logo:pointer-events-auto transition-all duration-300 z-50">
          {navItems.map((item, i) => (
            <button key={item.id} onClick={() => nav(item.id)} title={item.label}
              style={{ transitionDelay: `${i * 40}ms` }}
              className={`relative w-11 h-11 flex items-center justify-center rounded-sm backdrop-blur-md border transition-colors group/ic ${page === item.id ? "bg-[hsl(var(--gold))] border-[hsl(var(--gold))] text-white" : "bg-[hsl(220_52%_12%/0.55)] border-white/15 text-white/80 hover:bg-[hsl(var(--gold))] hover:border-[hsl(var(--gold))] hover:text-white"}`}>
              <Icon name={item.icon} size={19} />
              <span className="absolute left-full ml-2 px-2.5 py-1 rounded-sm bg-[hsl(220_52%_12%/0.9)] text-white text-xs font-['Montserrat'] font-semibold whitespace-nowrap opacity-0 group-hover/ic:opacity-100 transition-opacity pointer-events-none">{item.label}</span>
            </button>
          ))}

          {/* язык */}
          <div className="flex flex-col gap-2 mt-1 pt-2 border-t border-white/10" style={{ transitionDelay: "240ms" }}>
            <button onClick={() => changeLang(lang === "ru" ? "en" : "ru")} title={lang === "ru" ? "English" : "Русский"}
              className="w-11 h-11 flex items-center justify-center rounded-sm backdrop-blur-md border border-white/15 bg-[hsl(220_52%_12%/0.55)] text-base hover:border-[hsl(var(--gold))] transition-colors">
              {lang === "ru" ? "🇷🇺" : "🇬🇧"}
            </button>
            {user ? (
              <button onClick={() => nav("cabinet")} title={user.full_name || t("cabinet")}
                className="relative w-11 h-11 flex items-center justify-center rounded-sm backdrop-blur-md border border-white/15 bg-[hsl(220_52%_12%/0.55)] text-white/80 hover:bg-[hsl(var(--gold))] hover:border-[hsl(var(--gold))] hover:text-white transition-colors group/ic">
                <Icon name="User" size={19} />
                <span className="absolute left-full ml-2 px-2.5 py-1 rounded-sm bg-[hsl(220_52%_12%/0.9)] text-white text-xs font-['Montserrat'] font-semibold whitespace-nowrap opacity-0 group-hover/ic:opacity-100 transition-opacity pointer-events-none">{t("cabinet")}</span>
              </button>
            ) : (
              <>
                <button onClick={() => nav("login")} title={t("login")}
                  className="relative w-11 h-11 flex items-center justify-center rounded-sm backdrop-blur-md border border-white/15 bg-[hsl(220_52%_12%/0.55)] text-white/80 hover:bg-[hsl(var(--gold))] hover:border-[hsl(var(--gold))] hover:text-white transition-colors group/ic">
                  <Icon name="LogIn" size={19} />
                  <span className="absolute left-full ml-2 px-2.5 py-1 rounded-sm bg-[hsl(220_52%_12%/0.9)] text-white text-xs font-['Montserrat'] font-semibold whitespace-nowrap opacity-0 group-hover/ic:opacity-100 transition-opacity pointer-events-none">{t("login")}</span>
                </button>
                <button onClick={() => nav("register")} title={t("register")}
                  className="relative w-11 h-11 flex items-center justify-center rounded-sm backdrop-blur-md border border-[hsl(var(--gold))] bg-[hsl(var(--gold))] text-white hover:opacity-90 transition-opacity group/ic">
                  <Icon name="UserPlus" size={19} />
                  <span className="absolute left-full ml-2 px-2.5 py-1 rounded-sm bg-[hsl(220_52%_12%/0.9)] text-white text-xs font-['Montserrat'] font-semibold whitespace-nowrap opacity-0 group-hover/ic:opacity-100 transition-opacity pointer-events-none">{t("register")}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── ВСЕГДА ВИДИМАЯ КНОПКА КАБИНЕТА/ВХОДА (десктоп) ── */}
      <div className="hidden md:flex fixed top-4 right-5 z-50 items-center gap-2">
        {user ? (
          <button onClick={() => nav("cabinet")}
            className="flex items-center gap-2 px-4 h-11 rounded-sm backdrop-blur-md border border-white/15 bg-[hsl(220_52%_12%/0.6)] text-white text-sm font-['Montserrat'] font-semibold hover:bg-[hsl(var(--gold))] hover:border-[hsl(var(--gold))] transition-colors">
            <Icon name="User" size={18} />{user.full_name || t("cabinet")}
          </button>
        ) : (
          <>
            <button onClick={() => nav("login")}
              className="flex items-center gap-2 px-4 h-11 rounded-sm backdrop-blur-md border border-white/15 bg-[hsl(220_52%_12%/0.6)] text-white text-sm font-['Montserrat'] font-semibold hover:bg-[hsl(var(--gold))] hover:border-[hsl(var(--gold))] transition-colors">
              <Icon name="LogIn" size={18} />{t("login")}
            </button>
            <button onClick={() => nav("register")}
              className="flex items-center gap-2 px-4 h-11 rounded-sm border border-[hsl(var(--gold))] bg-[hsl(var(--gold))] text-white text-sm font-['Montserrat'] font-semibold hover:opacity-90 transition-opacity">
              <Icon name="UserPlus" size={18} />{t("register")}
            </button>
          </>
        )}
      </div>

      {/* ── МОБИЛЬНАЯ КНОПКА-МЕНЮ ── */}
      <div className="md:hidden fixed top-4 left-4 right-4 z-50 flex items-center justify-between">
        <button onClick={() => nav("home")} className="flex items-center gap-1.5 rounded-sm overflow-hidden bg-white/90 backdrop-blur-md border border-white/40 pr-2.5">
          <img src={LOGO} alt="Partcore Logistics" className="h-11 w-11 object-contain" />
          <span className="font-['Montserrat'] font-black text-sm leading-none">
            <span className="navy">PARTCORE</span> <span className="text-[hsl(var(--gold))]">LOGISTICS</span>
          </span>
        </button>
        <button className="w-11 h-11 flex items-center justify-center rounded-sm bg-[hsl(220_52%_12%/0.5)] backdrop-blur-md border border-white/10 text-white" onClick={() => setMenuOpen(!menuOpen)}>
          <Icon name={menuOpen ? "X" : "Menu"} size={22} />
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden fixed top-[68px] left-4 right-4 z-50 bg-[hsl(220_52%_12%/0.85)] backdrop-blur-md border border-white/10 rounded-sm px-5 py-4 flex flex-col gap-1 shadow-xl">
          {navItems.map((item) => (
            <button key={item.id} onClick={() => { nav(item.id); setMenuOpen(false); }}
              className={`flex items-center gap-3 text-left px-4 py-3 text-sm font-['Montserrat'] font-semibold rounded-sm ${page === item.id ? "text-[hsl(var(--gold))]" : "text-white/75"}`}>
              <Icon name={item.icon} size={17} />{item.label}
            </button>
          ))}
          <div className="flex items-center gap-2 mt-2 mb-1">
            <button onClick={() => changeLang("ru")}
              className={`flex-1 py-2.5 text-base rounded-sm transition-all border border-white/20 ${lang === "ru" ? "bg-[hsl(36_85%_50%/0.18)] border-[hsl(var(--gold))] opacity-100" : "opacity-50"}`} aria-label="Русский">🇷🇺</button>
            <button onClick={() => changeLang("en")}
              className={`flex-1 py-2.5 text-base rounded-sm transition-all border border-white/20 ${lang === "en" ? "bg-[hsl(36_85%_50%/0.18)] border-[hsl(var(--gold))] opacity-100" : "opacity-50"}`} aria-label="English">🇬🇧</button>
          </div>
          {user ? (
            <button onClick={() => { nav("cabinet"); setMenuOpen(false); }} className="mt-2 py-3 btn-gold rounded-sm flex items-center justify-center gap-2">
              <Icon name="User" size={15} />{user.full_name || t("cabinet")}
            </button>
          ) : (
            <div className="flex gap-2 mt-2">
              <button onClick={() => { nav("login"); setMenuOpen(false); }} className="flex-1 py-3 rounded-sm text-xs font-['Montserrat'] font-bold uppercase tracking-wide text-white border-2 border-white/40 hover:bg-white/10 transition-colors">{t("login")}</button>
              <button onClick={() => { nav("register"); setMenuOpen(false); }} className="flex-1 py-3 btn-gold rounded-sm text-xs">{t("register")}</button>
            </div>
          )}
        </div>
      )}

      <div className="pt-4">

        {/* ════ HOME ════ */}
        {page === "home" && (
          <>
            <section className="relative min-h-[88vh] flex items-center overflow-hidden light-grid">
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${HERO_IMG})` }}>
                <div className="absolute inset-0 bg-gradient-to-r from-white via-white/92 to-white/50" />
              </div>
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[hsl(var(--navy))]" />
              <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 py-20">
                <div className="max-w-3xl flex flex-col items-center text-center">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-9 anim-up d1 w-full">
                    {ORIGINS.map((o) => (
                      <button key={o.id} onClick={() => openOrigin(o.id)} className="text-left card-light rounded-sm p-5 group relative overflow-hidden hover:shadow-lg transition-all cursor-pointer">
                        <img src={`https://flagcdn.com/w640/${o.cc}.png`} alt="" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 pointer-events-none select-none" />
                        <span className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/55 to-white/25 pointer-events-none" />
                        <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-[hsl(var(--gold))] group-hover:w-full transition-all duration-500" />
                        <div className="relative z-10">
                          <h3 className="font-['Montserrat'] font-bold text-sm mb-1 navy flex items-center gap-2 leading-tight"><img src={`https://flagcdn.com/w40/${o.cc}.png`} alt="" className="w-7 h-5 object-cover rounded-sm shadow-sm flex-shrink-0" /><span className="min-w-0">{o.name[lang]}</span></h3>
                          <p className="text-[hsl(var(--navy)/0.68)] text-xs leading-relaxed mb-3">{o.desc[lang]}</p>
                          <div className="flex items-center gap-1 text-xs font-['Montserrat'] font-semibold text-[hsl(var(--navy))] group-hover:gap-2 transition-all">{t("more")} <Icon name="ArrowRight" size={13} /></div>
                        </div>
                      </button>
                    ))}
                  </div>
                  <p className="text-[hsl(var(--navy)/0.72)] text-base leading-relaxed mb-9 anim-up d2">{t("hero_subtitle")}</p>
                  <div className="flex flex-col sm:flex-row gap-3 anim-up d3 justify-center">
                    <button onClick={() => nav("contacts")} className="px-8 py-3.5 btn-navy rounded-sm">{t("send_request")}</button>
                    <button onClick={() => nav("how")} className="px-8 py-3.5 btn-outline rounded-sm">{t("how_we_work")}</button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 mt-12 anim-up d4">
                    {STATS.map(({ num, label }) => (
                      <div key={label.ru} className="border-l-2 border-[hsl(var(--gold))] pl-4">
                        <div className="font-['Montserrat'] font-black text-2xl text-[hsl(var(--navy))] leading-none">{num}</div>
                        <div className="text-[hsl(var(--navy)/0.65)] text-xs mt-1 leading-tight">{label[lang]}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="py-20 px-5 sm:px-8 max-w-7xl mx-auto">
              <div className="mb-12"><div className="section-tag mb-3 !text-white">{t("directions_tag")}</div><h2 className="font-['Montserrat'] font-black text-4xl sm:text-5xl text-white drop-shadow-[0_2px_4px_rgba(25,61,100,0.55)]">{t("from_where")}</h2><div className="divider-navy mt-4" /></div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {ORIGINS.map((o) => (
                  <button key={o.id} onClick={() => openOrigin(o.id)} className="text-left card-light rounded-sm p-7 group relative overflow-hidden hover:shadow-lg transition-all cursor-pointer">
                    <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-[hsl(var(--gold))] group-hover:w-full transition-all duration-500" />
                    <h3 className="font-['Montserrat'] font-bold text-base mb-2 navy flex items-center gap-2 leading-tight"><span className="text-3xl flex-shrink-0">{o.flag}</span><span className="min-w-0">{o.name[lang]}</span></h3>
                    <p className="text-[hsl(var(--navy)/0.68)] text-sm leading-relaxed mb-4">{o.desc[lang]}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-['Montserrat'] font-semibold gold"><Icon name="Package" size={13} />{o.volume[lang]}</div>
                      <div className="flex items-center gap-1 text-xs font-['Montserrat'] font-semibold text-[hsl(var(--navy))] group-hover:gap-2 transition-all">{t("more")} <Icon name="ArrowRight" size={13} /></div>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <section className="py-20 px-5 sm:px-8 bg-[hsl(220_25%_97%)]">
              <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
                  <div><div className="section-tag mb-3">{t("what_we_do")}</div><h2 className="font-['Montserrat'] font-black text-4xl sm:text-5xl">{t("services_title")}</h2><div className="divider-navy mt-4" /></div>
                  <button onClick={() => nav("services")} className="flex items-center gap-2 text-[hsl(var(--gold))] text-sm font-['Montserrat'] font-semibold hover:gap-3 transition-all">{t("more")} <Icon name="ArrowRight" size={15} /></button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {SERVICES.map((s, i) => (
                    <div key={i} className="card-light rounded-sm p-6 group flex gap-4">
                      <div className="w-10 h-10 rounded-sm bg-[hsl(var(--navy)/0.06)] flex items-center justify-center flex-shrink-0 group-hover:bg-[hsl(var(--navy)/0.12)] transition-colors">
                        <Icon name={s.icon} size={18} className="text-[hsl(var(--navy))]" />
                      </div>
                      <div><h3 className="font-['Montserrat'] font-bold text-sm mb-1.5 navy leading-snug">{s.title[lang]}</h3><p className="text-[hsl(var(--navy)/0.68)] text-xs leading-relaxed">{s.desc[lang]}</p></div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="py-20 px-5 sm:px-8 max-w-7xl mx-auto">
              <div className="mb-12"><div className="section-tag mb-3 !text-white">{t("advantages_tag")}</div><h2 className="font-['Montserrat'] font-black text-4xl sm:text-5xl text-white drop-shadow-[0_2px_4px_rgba(25,61,100,0.55)]">{t("why_us")}</h2><div className="divider-navy mt-4" /></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {WHY.map((w, i) => (
                  <div key={i} className="card-light rounded-sm p-6 group flex gap-5">
                    <div className="w-11 h-11 rounded-sm bg-[hsl(var(--gold)/0.1)] flex items-center justify-center flex-shrink-0 group-hover:bg-[hsl(var(--gold)/0.18)] transition-colors">
                      <Icon name={w.icon} size={20} className="text-[hsl(var(--gold))]" />
                    </div>
                    <div><h3 className="font-['Montserrat'] font-bold text-base mb-1.5 navy">{w.title[lang]}</h3><p className="text-[hsl(var(--navy)/0.68)] text-sm leading-relaxed">{w.desc[lang]}</p></div>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-[hsl(var(--navy))] py-20 relative overflow-hidden">
              <div className="absolute inset-0 light-grid opacity-10" />
              <div className="relative max-w-3xl mx-auto px-5 sm:px-8 text-center">
                <div className="section-tag mb-5 justify-center border-[hsl(var(--gold)/0.5)] text-[hsl(var(--gold))]">{t("start_coop_tag")}</div>
                <h2 className="font-['Montserrat'] font-black text-4xl sm:text-5xl text-white mb-4">{t("cta_need_1")}<br /><span className="text-[hsl(var(--gold))]">{t("cta_need_2")}</span></h2>
                <p className="text-white/80 mb-8">{t("cta_subtitle")}</p>
                <button onClick={() => nav("contacts")} className="px-10 py-4 btn-gold rounded-sm">{t("send_request")}</button>
              </div>
            </section>
          </>
        )}

        {/* ════ SERVICES ════ */}
        {page === "services" && (
          <section className="min-h-screen">
            <div className="relative overflow-hidden mb-12">
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${SERVICES_IMG})` }} />
              <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--navy))] via-[hsl(var(--navy)/0.85)] to-[hsl(var(--navy)/0.55)]" />
              <div className="relative max-w-7xl mx-auto px-5 sm:px-8 py-20 sm:py-24">
                <div className="section-tag mb-3 border-[hsl(var(--gold)/0.5)] text-[hsl(var(--gold))]">{t("what_we_do")}</div>
                <h1 className="font-['Montserrat'] font-black text-4xl sm:text-5xl text-white">{t("services_title")}</h1>
                <div className="h-1 w-16 bg-[hsl(var(--gold))] mt-4" />
              </div>
            </div>
            <div className="px-5 sm:px-8 max-w-7xl mx-auto pb-14">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-16">
              {SERVICES.map((s, i) => (
                <div key={i} className="card-light rounded-sm p-7 group flex gap-5">
                  <div className="w-12 h-12 rounded-sm bg-[hsl(var(--navy)/0.06)] flex items-center justify-center flex-shrink-0 group-hover:bg-[hsl(var(--navy)/0.12)] transition-colors">
                    <Icon name={s.icon} size={22} className="text-[hsl(var(--navy))]" />
                  </div>
                  <div><h3 className="font-['Montserrat'] font-bold text-lg mb-2 navy">{s.title[lang]}</h3><p className="text-[hsl(var(--navy)/0.68)] text-sm leading-relaxed">{s.desc[lang]}</p></div>
                </div>
              ))}
            </div>
            <div className="bg-[hsl(220_25%_97%)] rounded-sm p-8 border border-[hsl(var(--gold)/0.3)] text-center">
              <h3 className="font-['Montserrat'] font-bold text-2xl mb-3 navy">{t("custom_service_title")}</h3>
              <p className="text-[hsl(var(--navy)/0.68)] mb-6 text-sm">{t("custom_service_sub")}</p>
              <button onClick={() => nav("contacts")} className="px-8 py-3.5 btn-navy rounded-sm">{t("discuss_task")}</button>
            </div>
            </div>
          </section>
        )}

        {/* ════ HOW ════ */}
        {page === "how" && (
          <section className="min-h-screen">
            <div className="relative overflow-hidden mb-12">
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${HOW_IMG})` }} />
              <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--navy))] via-[hsl(var(--navy)/0.85)] to-[hsl(var(--navy)/0.55)]" />
              <div className="relative max-w-7xl mx-auto px-5 sm:px-8 py-20 sm:py-24">
                <div className="section-tag mb-3 border-[hsl(var(--gold)/0.5)] text-[hsl(var(--gold))]">{t("process_tag")}</div>
                <h1 className="font-['Montserrat'] font-black text-4xl sm:text-5xl text-white">{t("how_we_work_title")}</h1>
                <div className="h-1 w-16 bg-[hsl(var(--gold))] mt-4" />
              </div>
            </div>
            <div className="px-5 sm:px-8 max-w-7xl mx-auto pb-14">
            <div className="relative max-w-2xl">
              <div className="absolute left-6 top-0 bottom-10 w-px bg-[hsl(var(--navy)/0.12)]" />
              <div className="flex flex-col gap-5">
                {STEPS.map((s, i) => (
                  <div key={i} className="relative flex gap-8 group">
                    <div className="flex-shrink-0 w-12 flex justify-center">
                      <div className="w-12 h-12 bg-[hsl(var(--navy))] flex items-center justify-center font-['Montserrat'] font-black text-white text-sm z-10 relative group-hover:bg-[hsl(var(--gold))] transition-colors rounded-sm">{s.n}</div>
                    </div>
                    <div className="flex-1 card-light rounded-sm px-6 py-5 mb-2">
                      <h3 className="font-['Montserrat'] font-bold text-lg mb-1.5 navy">{s.title[lang]}</h3>
                      <p className="text-[hsl(var(--navy)/0.68)] text-sm leading-relaxed">{s.desc[lang]}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-14"><button onClick={() => nav("contacts")} className="px-10 py-4 btn-navy rounded-sm">{t("start_coop")}</button></div>
            </div>
          </section>
        )}

        {/* ════ DIRECTIONS (все направления) ════ */}
        {page === "directions" && (
          <section className="min-h-screen">
            <div className="relative overflow-hidden mb-12">
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${DIRECTIONS_IMG})` }} />
              <div className="absolute inset-0 bg-gradient-to-r from-white/98 via-white/95 to-white/85" />
              <div className="relative max-w-7xl mx-auto px-5 sm:px-8 py-20 sm:py-24">
                <div className="section-tag mb-3">{t("directions_tag")}</div>
                <h1 className="font-['Montserrat'] font-black text-4xl sm:text-5xl navy drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)]">{t("source_countries")}</h1>
                <div className="h-1 w-16 bg-[hsl(var(--gold))] mt-4" />
                <p className="text-[hsl(var(--navy)/0.75)] text-lg leading-relaxed max-w-3xl mt-6">{t("directions_intro")}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-5 sm:px-8 max-w-7xl mx-auto pb-14">
              {ORIGINS.map((o) => (
                <div key={o.id} onClick={() => openOrigin(o.id)}
                  className="card-light rounded-sm p-7 text-left flex flex-col transition-all hover:shadow-lg hover:-translate-y-1 group cursor-pointer">
                  <div className="flex items-center justify-between mb-5">
                    <div className="text-5xl">{o.flag}</div>
                    <Icon name="ArrowRight" size={20} className="text-[hsl(var(--navy)/0.55)] group-hover:text-[hsl(var(--gold))] transition-colors" />
                  </div>
                  <h2 className="font-['Montserrat'] font-black text-2xl navy mb-2">{o.name[lang]}</h2>
                  <p className="text-[hsl(var(--navy)/0.55)] text-sm leading-relaxed mb-5 flex-1">{o.desc[lang]}</p>
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {o.brands.slice(0, 4).map((b) => (
                      <span key={b} className="px-2.5 py-1 bg-[hsl(220_25%_97%)] border border-[hsl(220_15%_88%)] rounded-sm text-xs font-['Montserrat'] font-semibold navy">{b}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 text-[hsl(var(--navy)/0.65)] text-xs font-['Montserrat'] font-semibold uppercase tracking-wide pt-4 border-t border-[hsl(220_15%_90%)] mb-4">
                    <Icon name="Package" size={14} />{o.volume[lang]}
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); nav("contacts"); }}
                    className="w-full py-3 btn-gold rounded-sm">{t("leave_request")}</button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ════ ORIGIN (направление) ════ */}
        {page === "origin" && (() => {
          const o = ORIGINS.find((x) => x.id === originId) || ORIGINS[0];
          return (
            <section className="min-h-screen bg-[hsl(var(--navy))] relative overflow-hidden">
              <div className="absolute inset-0 light-grid opacity-10 pointer-events-none" />
              <div className="relative py-14 px-5 sm:px-8 max-w-7xl mx-auto">
              <button onClick={() => nav("home")} className="flex items-center gap-2 text-white text-sm font-['Montserrat'] font-semibold mb-8 hover:text-white/80 transition-colors">
                <Icon name="ArrowLeft" size={15} />{t("all_directions")}
              </button>

              <div className="flex items-center gap-5 mb-6">
                <div className="text-6xl">{o.flag}</div>
                <div>
                  <div className="section-tag mb-2 !text-white">{t("direction_tag")}</div>
                  <h1 className="font-['Montserrat'] font-black text-4xl sm:text-5xl text-white drop-shadow-[0_2px_4px_rgba(25,61,100,0.55)]">{o.name[lang].toUpperCase()} <span className="align-middle">{o.flag}</span></h1>
                </div>
              </div>
              <div className="divider-navy mb-8" />
              <p className="text-white text-lg leading-relaxed max-w-3xl mb-12 drop-shadow-[0_1px_3px_rgba(25,61,100,0.6)]">{o.intro[lang]}</p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-14">
                {o.facts.map((f) => (
                  <div key={f.title.ru} className="card-light rounded-sm p-5">
                    <div className="w-10 h-10 bg-[hsl(var(--navy)/0.06)] rounded-sm flex items-center justify-center mb-3">
                      <Icon name={f.icon} size={18} className="text-[hsl(var(--navy))]" />
                    </div>
                    <div className="text-[hsl(var(--navy)/0.62)] text-xs font-['Montserrat'] font-semibold uppercase tracking-wide">{f.title[lang]}</div>
                    <div className="font-['Montserrat'] font-bold text-base navy mt-0.5">{f.val[lang]}</div>
                  </div>
                ))}
              </div>

              {o.id === "hongkong" && hotDeals.length > 0 && (
                <div className="mb-14">
                  <div className="flex items-center gap-3 mb-2">
                    <Icon name="Flame" size={24} className="text-[hsl(var(--gold))]" />
                    <h2 className="font-['Montserrat'] font-black text-2xl text-white drop-shadow-[0_1px_3px_rgba(25,61,100,0.6)]">{t("hot_deals_title")}</h2>
                  </div>
                  <p className="text-white/90 text-sm mb-6 max-w-2xl drop-shadow-[0_1px_3px_rgba(25,61,100,0.6)]">{t("hot_deals_sub")}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {hotDeals.map((d) => (
                      <div key={d.id} className="card-light rounded-sm overflow-hidden flex flex-col group">
                        <div className="relative h-40 bg-gradient-to-br from-[hsl(var(--navy))] to-[hsl(var(--navy)/0.7)] flex items-center justify-center overflow-hidden">
                          {d.photo ? (
                            <img src={d.photo} alt={d.model} className="w-full h-full object-cover" />
                          ) : (
                            <Icon name="Car" size={56} className="text-white/15" />
                          )}
                          {d.badge && <span className="absolute top-3 left-3 text-[11px] font-['Montserrat'] font-bold px-2.5 py-1 bg-[hsl(var(--gold))] text-white rounded-sm uppercase tracking-wide">{d.badge}</span>}
                          {d.brand && <span className="absolute top-3 right-3 text-[11px] font-['Montserrat'] font-bold px-2.5 py-1 bg-white/90 navy rounded-sm">{d.brand}</span>}
                        </div>
                        <div className="p-5 flex flex-col flex-1">
                          <h3 className="font-['Montserrat'] font-bold text-lg navy leading-tight mb-3">{d.model}</h3>
                          <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                            <div>
                              <div className="text-[hsl(var(--navy)/0.62)] text-[10px] font-['Montserrat'] font-semibold uppercase tracking-wide">{t("hd_year")}</div>
                              <div className="font-['Montserrat'] font-bold text-sm navy">{d.year || "—"}</div>
                            </div>
                            <div>
                              <div className="text-[hsl(var(--navy)/0.62)] text-[10px] font-['Montserrat'] font-semibold uppercase tracking-wide">{t("hd_mileage")}</div>
                              <div className="font-['Montserrat'] font-bold text-sm navy">{d.mileage || "—"}</div>
                            </div>
                            <div>
                              <div className="text-[hsl(var(--navy)/0.62)] text-[10px] font-['Montserrat'] font-semibold uppercase tracking-wide">{t("hd_engine")}</div>
                              <div className="font-['Montserrat'] font-bold text-sm navy">{d.engine || "—"}</div>
                            </div>
                          </div>
                          <div className="mt-auto pt-4 border-t border-[hsl(220_15%_90%)] flex items-center justify-between gap-3">
                            <span className="font-['Montserrat'] font-black text-lg gold">{d.price}</span>
                            <button onClick={() => nav("contacts")} className="px-4 py-2.5 btn-gold rounded-sm whitespace-nowrap">{t("hd_reserve")}</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {"auctionLinks" in o && o.auctionLinks && (
                <div className="mb-14">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="font-['Montserrat'] font-black text-2xl text-white drop-shadow-[0_1px_3px_rgba(25,61,100,0.6)]">{t("auction_access")}</h2>
                    <span className="text-[10px] font-['Montserrat'] font-bold px-2 py-0.5 bg-[hsl(var(--gold)/0.12)] text-[hsl(var(--gold))] rounded-full uppercase tracking-wide">Live</span>
                  </div>
                  <p className="text-white/90 text-sm mb-6 max-w-2xl drop-shadow-[0_1px_3px_rgba(25,61,100,0.6)]">{t("auction_access_sub")}</p>

                  {!user ? (
                    <div className="card-light rounded-sm p-10 text-center flex flex-col items-center">
                      <div className="w-14 h-14 rounded-full bg-[hsl(var(--navy)/0.06)] flex items-center justify-center mb-4">
                        <Icon name="Lock" size={26} className="text-[hsl(var(--navy)/0.68)]" />
                      </div>
                      <h3 className="font-['Montserrat'] font-bold text-lg navy mb-2">{t("auction_locked_title")}</h3>
                      <p className="text-[hsl(var(--navy)/0.68)] text-sm mb-6 max-w-md">{t("auction_locked_sub")}</p>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button onClick={() => nav("login")} className="px-6 py-3 btn-navy rounded-sm">{t("login")}</button>
                        <button onClick={() => nav("register")} className="px-6 py-3 btn-outline rounded-sm">{t("register")}</button>
                      </div>
                    </div>
                  ) : (
                  <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                    {o.auctionLinks.map((a) => (
                      <div key={a.name} className={`card-light rounded-sm p-4 flex flex-col gap-3 transition-all ${activeAuction?.name === a.name ? "ring-2 ring-[hsl(var(--gold))]" : ""}`}>
                        <div className="flex items-start gap-2">
                          <Icon name="Gavel" size={16} className="text-[hsl(var(--navy))] mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="font-['Montserrat'] font-bold text-sm navy leading-tight">{a.name}</div>
                            <div className="text-[hsl(var(--navy)/0.65)] text-xs mt-1 leading-snug">{a.desc[lang]}</div>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-auto">
                          <button onClick={() => setActiveAuction({ name: a.name, url: a.url })}
                            className="flex-1 py-2 bg-[hsl(var(--navy))] text-white text-xs font-['Montserrat'] font-semibold rounded-sm hover:bg-[hsl(var(--navy)/0.9)] transition-colors">
                            {t("open_here")}
                          </button>
                          <a href={a.url} target="_blank" rel="noopener noreferrer"
                            className="px-3 py-2 border border-[hsl(220_15%_85%)] rounded-sm flex items-center justify-center hover:border-[hsl(var(--navy))] transition-colors" title={t("open_new_tab_title")}>
                            <Icon name="ExternalLink" size={14} className="text-[hsl(var(--navy))]" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>

                  {activeAuction && (
                    <div className="card-light rounded-sm overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3 bg-[hsl(220_25%_97%)] border-b border-[hsl(220_15%_88%)]">
                        <div className="flex items-center gap-2">
                          <Icon name="Globe" size={15} className="text-[hsl(var(--navy))]" />
                          <span className="font-['Montserrat'] font-semibold text-sm navy">{activeAuction.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <a href={activeAuction.url} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs font-['Montserrat'] font-semibold text-[hsl(var(--gold))] hover:underline">
                            {t("in_new_tab")} <Icon name="ExternalLink" size={12} />
                          </a>
                          <button onClick={() => setActiveAuction(null)} className="text-[hsl(var(--navy)/0.62)] hover:text-[hsl(var(--navy))]">
                            <Icon name="X" size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="relative bg-[hsl(220_25%_97%)]">
                        <iframe src={activeAuction.url} title={activeAuction.name} className="w-full h-[600px] border-0" sandbox="allow-same-origin allow-scripts allow-popups allow-forms" />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="bg-white/90 rounded-sm px-5 py-4 text-center max-w-xs pointer-events-auto shadow-lg" style={{ opacity: 0.95 }}>
                            <Icon name="Info" size={20} className="text-[hsl(var(--gold))] mx-auto mb-2" />
                            <p className="text-[hsl(var(--navy)/0.7)] text-xs leading-relaxed mb-3">{t("iframe_warning")}</p>
                            <a href={activeAuction.url} target="_blank" rel="noopener noreferrer"
                              className="inline-block px-4 py-2 bg-[hsl(var(--navy))] text-white text-xs font-['Montserrat'] font-semibold rounded-sm">
                              {t("open_auction")}
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  </>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-14">
                <div>
                  <h2 className="font-['Montserrat'] font-black text-2xl text-white mb-5 drop-shadow-[0_1px_3px_rgba(25,61,100,0.6)]">{t("advantages")}</h2>
                  <div className="flex flex-col gap-3">
                    {o.advantages.map((a, i) => (
                      <div key={i} className="flex items-start gap-3 card-light rounded-sm p-4">
                        <Icon name="CheckCircle" size={18} className="text-[hsl(var(--gold))] flex-shrink-0 mt-0.5" />
                        <span className="text-[hsl(var(--navy)/0.65)] text-sm leading-relaxed">{a[lang]}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-8">
                  <div>
                    <h2 className="font-['Montserrat'] font-black text-2xl text-white mb-5 drop-shadow-[0_1px_3px_rgba(25,61,100,0.6)]">{t("popular_brands")}</h2>
                    <div className="flex flex-wrap gap-2">
                      {o.brands.map((b) => (
                        <span key={b} className="px-4 py-2 bg-[hsl(220_25%_97%)] border border-[hsl(220_15%_88%)] rounded-sm text-sm font-['Montserrat'] font-semibold navy">{b}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h2 className="font-['Montserrat'] font-black text-2xl text-white mb-5 drop-shadow-[0_1px_3px_rgba(25,61,100,0.6)]">{t("auctions_platforms")}</h2>
                    <div className="flex flex-col gap-2">
                      {o.auctions.map((a) => (
                        <div key={a.ru} className="flex items-center gap-3 card-light rounded-sm px-4 py-3">
                          <Icon name="Globe" size={16} className="text-[hsl(var(--navy))]" />
                          <span className="text-sm font-medium navy">{a[lang]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/15 rounded-sm p-8 sm:p-10 text-center relative overflow-hidden backdrop-blur-sm">
                <div className="absolute inset-0 light-grid opacity-10" />
                <div className="relative">
                  <h3 className="font-['Montserrat'] font-black text-2xl sm:text-3xl text-white mb-3">{t("origin_cta_title_pre")}{o.name[lang]}{t("origin_cta_title_post")}</h3>
                  <p className="text-white/80 mb-7 text-sm">{t("origin_cta_sub")}</p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button onClick={() => nav("contacts")} className="px-8 py-3.5 btn-gold rounded-sm">{t("send_request")}</button>
                    <button onClick={() => nav("how")} className="px-8 py-3.5 border border-white/30 text-white rounded-sm font-['Montserrat'] font-semibold hover:bg-white/10 transition-colors">{t("how_we_work")}</button>
                  </div>
                </div>
              </div>
              </div>
            </section>
          );
        })()}

        {/* ════ CONTACTS ════ */}
        {page === "contacts" && (
          <section className="min-h-screen">
            <div className="relative overflow-hidden mb-12">
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${CONTACTS_IMG})` }} />
              <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--navy))] via-[hsl(var(--navy)/0.85)] to-[hsl(var(--navy)/0.55)]" />
              <div className="relative max-w-7xl mx-auto px-5 sm:px-8 py-20 sm:py-24">
                <div className="section-tag mb-3 border-[hsl(var(--gold)/0.5)] text-[hsl(var(--gold))]">{t("contact_tag")}</div>
                <h1 className="font-['Montserrat'] font-black text-4xl sm:text-5xl text-white">{t("leave_request_title")}</h1>
                <div className="h-1 w-16 bg-[hsl(var(--gold))] mt-4" />
              </div>
            </div>
            <div className="px-5 sm:px-8 max-w-7xl mx-auto pb-14">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="card-light rounded-sm p-8">
                {contactSent ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-14 h-14 rounded-sm bg-[hsl(var(--gold)/0.1)] flex items-center justify-center mb-5"><Icon name="CheckCircle" size={30} className="text-[hsl(var(--gold))]" /></div>
                    <h3 className="font-['Montserrat'] font-bold text-2xl mb-2 navy">{t("request_accepted")}</h3>
                    <p className="text-[hsl(var(--navy)/0.68)] text-sm">{t("request_accepted_sub")}</p>
                    <button onClick={() => setContactSent(false)} className="mt-6 text-[hsl(var(--gold))] text-sm hover:underline font-['Montserrat'] font-semibold">{t("send_another")}</button>
                  </div>
                ) : (
                  <form onSubmit={(e) => { e.preventDefault(); setContactSent(true); }} className="flex flex-col gap-5">
                    <div><h2 className="font-['Montserrat'] font-bold text-xl mb-1 navy">{t("supply_request")}</h2><p className="text-[hsl(var(--navy)/0.65)] text-sm">{t("supply_request_sub")}</p></div>
                    {[
                      { key: "name", label: t("contact_person"), placeholder: t("ph_name"), type: "text", required: true },
                      { key: "company", label: t("company_ip"), placeholder: t("ph_company"), type: "text", required: false },
                      { key: "phone", label: t("phone_req"), placeholder: "+7 (___) ___-__-__", type: "tel", required: true },
                    ].map((f) => (
                      <div key={f.key}>
                        <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-widest uppercase mb-2">{f.label}</label>
                        <input required={f.required} type={f.type} placeholder={f.placeholder} value={contactForm[f.key as keyof typeof contactForm]} onChange={(e) => setContactForm({ ...contactForm, [f.key]: e.target.value })} className={inputCls} />
                      </div>
                    ))}
                    <div>
                      <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-widest uppercase mb-2">{t("comment")}</label>
                      <textarea rows={3} value={contactForm.comment} onChange={(e) => setContactForm({ ...contactForm, comment: e.target.value })} placeholder={t("comment_ph")} className={inputCls + " resize-none"} />
                    </div>
                    <button type="submit" className="w-full py-4 btn-navy rounded-sm">{t("send_request")}</button>
                  </form>
                )}
              </div>
              <div className="flex flex-col gap-5">
                <div className="card-light rounded-sm p-6">
                  <h3 className="font-['Montserrat'] font-bold text-base mb-5 navy uppercase tracking-wider">{t("contacts")}</h3>
                  <div className="flex flex-col gap-5">
                    {[{ icon: "Phone", label: t("phone"), val: "+7 (800) 000-00-00", sub: t("phone_sub") }, { icon: "Mail", label: "Email", val: "info@partcore.ru", sub: t("email_sub") }, { icon: "MessageCircle", label: "Telegram / WhatsApp", val: "+7 (900) 000-00-00", sub: t("messenger_sub") }, { icon: "MapPin", label: t("office"), val: t("office_city"), sub: t("office_hours") }].map((c) => (
                      <div key={c.label} className="flex items-start gap-4">
                        <div className="w-9 h-9 bg-[hsl(var(--navy)/0.07)] flex items-center justify-center flex-shrink-0 rounded-sm"><Icon name={c.icon} size={16} className="text-[hsl(var(--navy))]" /></div>
                        <div><div className="text-[hsl(var(--navy)/0.62)] text-xs font-['Montserrat'] font-semibold tracking-wide uppercase">{c.label}</div><div className="text-[hsl(var(--navy))] font-medium text-sm mt-0.5">{c.val}</div><div className="text-[hsl(var(--navy)/0.6)] text-xs">{c.sub}</div></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            </div>
          </section>
        )}

        {/* ════ STAFF LOGIN (скрытая страница #staff) ════ */}
        {page === "staff_login" && (
          <section className="min-h-screen flex items-center justify-center py-14 px-5 bg-[hsl(var(--navy))]">
            <div className="w-full max-w-md">
              <div className="text-center mb-8">
                <div className="w-14 h-14 rounded-full bg-[hsl(var(--gold)/0.15)] flex items-center justify-center mx-auto mb-5">
                  <Icon name="ShieldCheck" size={28} className="text-[hsl(var(--gold))]" />
                </div>
                <h1 className="font-['Montserrat'] font-black text-3xl text-white mb-2">{t("staff_login_title")}</h1>
                <p className="text-white/80 text-sm">{t("staff_login_sub")}</p>
              </div>
              <div className="bg-white rounded-sm p-8 shadow-xl">
                <form onSubmit={doStaffLogin} className="flex flex-col gap-5">
                  {authError && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-sm">{authError}</div>}
                  <div>
                    <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-widest uppercase mb-2">Email *</label>
                    <input required type="email" placeholder="staff@partcore.ru" value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-widest uppercase mb-2">{t("pwd")}</label>
                    <input required type="password" placeholder="••••••••" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} className={inputCls} />
                  </div>
                  <button type="submit" disabled={authLoading} className="w-full py-3.5 btn-navy rounded-sm disabled:opacity-60">
                    {authLoading ? t("logging_in") : t("login")}
                  </button>
                </form>
                <div className="text-center mt-5">
                  <button onClick={() => { window.location.hash = ""; nav("home"); }} className="text-[hsl(var(--navy)/0.62)] text-sm hover:text-[hsl(var(--navy))] font-medium">← {t("nav_home")}</button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ════ LOGIN ════ */}
        {page === "login" && (
          <section className="min-h-screen flex items-center justify-center py-14 px-5">
            <div className="w-full max-w-md">
              <div className="text-center mb-8">
                <img src={LOGO} alt="Partcore" className="h-12 mx-auto mb-6 object-contain" />
                <h1 className="font-['Montserrat'] font-black text-3xl navy mb-2">{t("login_title")}</h1>
                <p className="text-[hsl(var(--navy)/0.68)] text-sm">{t("login_sub")}</p>
              </div>
              <div className="card-light rounded-sm p-8">
                <form onSubmit={doLogin} className="flex flex-col gap-5">
                  {authError && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-sm">{authError}</div>}
                  <div>
                    <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-widest uppercase mb-2">Email *</label>
                    <input required type="email" placeholder="you@example.com" value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-widest uppercase mb-2">{t("pwd")}</label>
                    <input required type="password" placeholder="••••••••" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} className={inputCls} />
                  </div>
                  <button type="submit" disabled={authLoading} className="w-full py-3.5 btn-navy rounded-sm disabled:opacity-60">
                    {authLoading ? t("logging_in") : t("login")}
                  </button>
                </form>
                <div className="text-center mt-4">
                  <button onClick={() => { setForgotStep("email"); setForgotMsg(""); setForgotForm({ email: loginForm.email, code: "", password: "" }); nav("forgot"); }} className="text-sm text-[hsl(var(--navy)/0.68)] hover:text-[hsl(var(--gold))] hover:underline">{t("forgot_pwd")}</button>
                </div>
                <div className="text-center mt-2 text-sm text-[hsl(var(--navy)/0.68)]">
                  {t("no_account")}{" "}
                  <button onClick={() => nav("register")} className="text-[hsl(var(--gold))] font-semibold hover:underline">{t("do_register")}</button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ════ FORGOT PASSWORD ════ */}
        {page === "forgot" && (
          <section className="min-h-screen flex items-center justify-center py-14 px-5">
            <div className="w-full max-w-md">
              <div className="text-center mb-8">
                <img src={LOGO} alt="Partcore" className="h-12 mx-auto mb-6 object-contain" />
                <h1 className="font-['Montserrat'] font-black text-3xl navy mb-2">{t("forgot_title")}</h1>
                <p className="text-[hsl(var(--navy)/0.68)] text-sm">{forgotStep === "email" ? t("forgot_sub") : t("forgot_sub2")}</p>
              </div>
              <div className="card-light rounded-sm p-8">
                {forgotStep === "email" ? (
                  <form onSubmit={doForgot} className="flex flex-col gap-5">
                    {authError && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-sm">{authError}</div>}
                    <div>
                      <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-widest uppercase mb-2">Email *</label>
                      <input required type="email" placeholder="you@example.com" value={forgotForm.email} onChange={(e) => setForgotForm({ ...forgotForm, email: e.target.value })} className={inputCls} />
                    </div>
                    <button type="submit" disabled={authLoading} className="w-full py-3.5 btn-navy rounded-sm disabled:opacity-60">
                      {authLoading ? t("sending") : t("send_code")}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={doReset} className="flex flex-col gap-5">
                    {forgotMsg && <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-sm">{forgotMsg}</div>}
                    {authError && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-sm">{authError}</div>}
                    <div>
                      <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-widest uppercase mb-2">{t("code_from_email")}</label>
                      <input required type="text" inputMode="numeric" placeholder="000000" value={forgotForm.code} onChange={(e) => setForgotForm({ ...forgotForm, code: e.target.value })} className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-widest uppercase mb-2">{t("new_pwd")}</label>
                      <input required type="password" placeholder="••••••••" value={forgotForm.password} onChange={(e) => setForgotForm({ ...forgotForm, password: e.target.value })} className={inputCls} />
                    </div>
                    <button type="submit" disabled={authLoading} className="w-full py-3.5 btn-navy rounded-sm disabled:opacity-60">
                      {authLoading ? t("saving") : t("change_pwd")}
                    </button>
                    <button type="button" onClick={() => { setForgotStep("email"); setAuthError(""); setForgotMsg(""); }} className="text-sm text-[hsl(var(--navy)/0.68)] hover:text-[hsl(var(--gold))] hover:underline">{t("resend_code")}</button>
                  </form>
                )}
                <div className="text-center mt-5 text-sm text-[hsl(var(--navy)/0.68)]">
                  <button onClick={() => nav("login")} className="text-[hsl(var(--gold))] font-semibold hover:underline">{t("back_to_login")}</button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ════ REGISTER ════ */}
        {page === "register" && (
          <section className="min-h-screen flex items-center justify-center py-14 px-5">
            <div className="w-full max-w-md">
              <div className="text-center mb-8">
                <img src={LOGO} alt="Partcore" className="h-12 mx-auto mb-6 object-contain" />
                <h1 className="font-['Montserrat'] font-black text-3xl navy mb-2">{regStep === "code" ? t("code_title") : t("register_title")}</h1>
                <p className="text-[hsl(var(--navy)/0.68)] text-sm">{regStep === "code" ? `${t("code_sub")} ${regForm.phone}` : t("register_sub")}</p>
              </div>
              <div className="card-light rounded-sm p-8">
                {regStep === "form" ? (
                  <form onSubmit={doSendCode} className="flex flex-col gap-4">
                    {authError && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-sm">{authError}</div>}
                    {[
                      { key: "full_name", label: t("your_name"), placeholder: t("ph_name"), type: "text", required: true },
                      { key: "email", label: "Email *", placeholder: "you@example.com", type: "email", required: true },
                      { key: "phone", label: t("phone_req"), placeholder: "+7 (___) ___-__-__", type: "tel", required: true },
                      { key: "company", label: t("company_ip"), placeholder: t("ph_company"), type: "text", required: false },
                      { key: "password", label: t("pwd_min"), placeholder: "••••••••", type: "password", required: true },
                    ].map((f) => (
                      <div key={f.key}>
                        <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-widest uppercase mb-2">{f.label}</label>
                        <input required={f.required} type={f.type} placeholder={f.placeholder} value={regForm[f.key as keyof typeof regForm]} onChange={(e) => setRegForm({ ...regForm, [f.key]: e.target.value })} className={inputCls} />
                      </div>
                    ))}
                    <button type="submit" disabled={codeSending} className="w-full py-3.5 btn-navy rounded-sm disabled:opacity-60 mt-1">
                      {codeSending ? t("sending_code") : t("get_code")}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={doRegister} className="flex flex-col gap-4">
                    {authError && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-sm">{authError}</div>}
                    <div>
                      <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-widest uppercase mb-2">{t("sms_code")}</label>
                      <input required type="text" inputMode="numeric" maxLength={6} placeholder="0000" value={regForm.code}
                        onChange={(e) => setRegForm({ ...regForm, code: e.target.value.replace(/\D/g, "") })}
                        className={inputCls + " text-center tracking-[0.5em] text-lg font-bold"} />
                    </div>
                    <button type="submit" disabled={authLoading} className="w-full py-3.5 btn-navy rounded-sm disabled:opacity-60">
                      {authLoading ? t("registering") : t("confirm")}
                    </button>
                    <div className="flex items-center justify-between text-sm">
                      <button type="button" onClick={resetRegStep} className="text-[hsl(var(--navy)/0.68)] hover:text-[hsl(var(--navy))] font-medium">{t("change_number")}</button>
                      <button type="button" onClick={(e) => doSendCode(e as unknown as React.FormEvent)} disabled={codeSending} className="text-[hsl(var(--gold))] font-semibold hover:underline disabled:opacity-50">{t("resend_code")}</button>
                    </div>
                  </form>
                )}
                <div className="text-center mt-5 text-sm text-[hsl(var(--navy)/0.68)]">
                  {t("have_account")}{" "}
                  <button onClick={() => { resetRegStep(); nav("login"); }} className="text-[hsl(var(--gold))] font-semibold hover:underline">{t("login")}</button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ════ CABINET ════ */}
        {page === "cabinet" && (
          !user ? (
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <Icon name="Lock" size={40} className="mx-auto mb-4 text-[hsl(var(--navy)/0.55)]" />
                <p className="font-['Montserrat'] font-bold navy mb-4">{t("auth_required")}</p>
                <button onClick={() => nav("login")} className="px-6 py-3 btn-navy rounded-sm">{t("login")}</button>
              </div>
            </div>
          ) : (
            <div className="min-h-screen relative">
              <div className="fixed inset-0 -z-10 bg-cover bg-center" style={{ backgroundImage: `url(${HERO_IMG})` }} />
              <div className="fixed inset-0 -z-10 bg-white/85" />
              <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8">
              {/* Cabinet header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                  <div className="section-tag mb-2">{isStaff ? t("staff_cabinet") : t("personal_cabinet")}</div>
                  <h1 className="font-['Montserrat'] font-black text-3xl navy flex items-center gap-3">
                    {user.full_name || user.email}
                    {isStaff && <span className="text-xs px-2.5 py-1 bg-[hsl(var(--gold)/0.12)] text-[hsl(var(--gold))] rounded-full font-['Montserrat'] font-bold uppercase tracking-wide">{t("staff_badge")}</span>}
                  </h1>
                  {user.company && <p className="text-[hsl(var(--navy)/0.65)] text-sm mt-0.5">{user.company}</p>}
                </div>
                <button onClick={doLogout} className="flex items-center gap-2 px-4 py-2 border border-[hsl(220_15%_88%)] text-[hsl(var(--navy)/0.68)] text-sm font-['Montserrat'] font-semibold hover:text-red-600 hover:border-red-200 transition-all rounded-sm">
                  <Icon name="LogOut" size={15} />{t("logout")}
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 flex-wrap mb-8 border-b border-[hsl(220_15%_88%)]">
                {((isStaff ? [
                  { id: "clients", label: t("tab_clients"), icon: "Users" },
                  { id: "hot_deals", label: t("tab_hot_deals"), icon: "Flame" },
                  { id: "staff_users", label: t("tab_staff_users"), icon: "ShieldCheck" },
                  { id: "profile", label: t("tab_profile"), icon: "User" },
                ] : [
                  { id: "orders", label: t("tab_orders"), icon: "ClipboardList" },
                  { id: "active_orders", label: t("tab_active_orders"), icon: "Package" },
                  { id: "new_order", label: t("tab_new_order"), icon: "Plus" },
                  { id: "auctions", label: t("tab_auctions"), icon: "Globe" },
                  { id: "documents", label: t("tab_documents"), icon: "FileText" },
                  { id: "profile", label: t("tab_profile"), icon: "User" },
                ]) as { id: CabinetTab; label: string; icon: string }[]).map((tab) => (
                  <button key={tab.id} onClick={() => { setCabinetTab(tab.id); setSelectedOrder(null); }}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-['Montserrat'] font-semibold border-b-2 transition-all ${cabinetTab === tab.id ? "border-[hsl(var(--navy))] text-[hsl(var(--navy))]" : "border-transparent text-[hsl(var(--navy)/0.65)] hover:text-[hsl(var(--navy))]"}`}>
                    <Icon name={tab.icon} size={15} />{tab.label}
                  </button>
                ))}
              </div>

              {/* ── Мои заявки (новые, на рассмотрении) ── */}
              {cabinetTab === "orders" && (() => {
                const list = orders.filter((o) => o.status === "new");
                return (
                <div>
                  {ordersLoading ? (
                    <div className="flex items-center gap-3 py-16 justify-center text-[hsl(var(--navy)/0.62)]">
                      <Icon name="Loader" size={20} className="animate-spin" />{t("loading_orders")}
                    </div>
                  ) : list.length === 0 ? (
                    <div className="text-center py-16">
                      <Icon name="ClipboardList" size={40} className="mx-auto mb-4 text-[hsl(var(--navy)/0.4)]" />
                      <p className="font-['Montserrat'] font-bold navy mb-2">{t("no_new_orders")}</p>
                      <p className="text-[hsl(var(--navy)/0.65)] text-sm mb-6">{t("no_new_orders_sub")}</p>
                      <button onClick={() => setCabinetTab("new_order")} className="px-6 py-3 btn-navy rounded-sm">{t("create_order")}</button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {list.map((o) => (
                        <div key={o.id} className="card-light rounded-sm p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-[hsl(var(--navy)/0.06)] rounded-sm flex items-center justify-center flex-shrink-0">
                              <Icon name="Car" size={18} className="text-[hsl(var(--navy))]" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-['Montserrat'] font-bold text-sm navy">{o.order_number}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_COLOR[o.status] || "bg-gray-100 text-gray-600"}`}>{STATUS_LABEL[lang][o.status] || o.status_label}</span>
                              </div>
                              <div className="text-[hsl(var(--navy)/0.6)] text-sm mt-0.5">
                                {[o.car_brand, o.car_model, o.car_year].filter(Boolean).join(" ")} · {ORIGIN_LABEL[lang][o.origin] || o.origin}
                              </div>
                              <div className="text-[hsl(var(--navy)/0.6)] text-xs mt-1">
                                {o.quantity} {t("pcs")}{o.budget ? ` · ${t("up_to")} ${o.budget.toLocaleString()} ₽` : ""} · {new Date(o.created_at).toLocaleDateString(lang === "ru" ? "ru" : "en")}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                );
              })()}

              {/* ── Заказы (в работе и завершённые) ── */}
              {cabinetTab === "active_orders" && (() => {
                const list = orders.filter((o) => o.status !== "new");
                return (
                <div>
                  {ordersLoading ? (
                    <div className="flex items-center gap-3 py-16 justify-center text-[hsl(var(--navy)/0.62)]">
                      <Icon name="Loader" size={20} className="animate-spin" />{t("loading_active")}
                    </div>
                  ) : list.length === 0 ? (
                    <div className="text-center py-16">
                      <Icon name="Package" size={40} className="mx-auto mb-4 text-[hsl(var(--navy)/0.4)]" />
                      <p className="font-['Montserrat'] font-bold navy mb-2">{t("no_active_orders")}</p>
                      <p className="text-[hsl(var(--navy)/0.65)] text-sm">{t("no_active_orders_sub")}</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {list.map((o) => {
                        const steps = [
                          { key: "processing", label: t("step_processing") },
                          { key: "auction", label: t("step_auction") },
                          { key: "shipped", label: t("step_shipped") },
                          { key: "customs", label: t("step_customs") },
                          { key: "delivered", label: t("step_delivered") },
                          { key: "done", label: t("step_done") },
                        ];
                        const order = ["processing", "auction", "shipped", "customs", "delivered", "done"];
                        const curIdx = order.indexOf(o.status);
                        return (
                        <div key={o.id} className="card-light rounded-sm p-5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                            <div className="flex items-start gap-4">
                              <div className="w-10 h-10 bg-[hsl(var(--navy)/0.06)] rounded-sm flex items-center justify-center flex-shrink-0">
                                <Icon name="Car" size={18} className="text-[hsl(var(--navy))]" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-['Montserrat'] font-bold text-sm navy">{o.order_number}</span>
                                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_COLOR[o.status] || "bg-gray-100 text-gray-600"}`}>{STATUS_LABEL[lang][o.status] || o.status_label}</span>
                                </div>
                                <div className="text-[hsl(var(--navy)/0.6)] text-sm mt-0.5">
                                  {[o.car_brand, o.car_model, o.car_year].filter(Boolean).join(" ")} · {ORIGIN_LABEL[lang][o.origin] || o.origin}
                                </div>
                                <div className="text-[hsl(var(--navy)/0.6)] text-xs mt-1">
                                  {o.quantity} {t("pcs")}{o.budget ? ` · ${t("up_to")} ${o.budget.toLocaleString()} ₽` : ""} · {new Date(o.created_at).toLocaleDateString(lang)}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 sm:gap-2 pt-4 border-t border-[hsl(220_15%_90%)] overflow-x-auto">
                            {steps.map((s, i) => {
                              const reached = curIdx >= i;
                              const isCurrent = curIdx === i;
                              return (
                                <div key={s.key} className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                                  <div className="flex flex-col items-center gap-1.5">
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${reached ? "bg-[hsl(var(--gold))] text-white" : "bg-[hsl(220_25%_94%)] text-[hsl(var(--navy)/0.55)]"}`}>
                                      {reached ? <Icon name="Check" size={13} /> : <span className="text-[10px] font-bold">{i + 1}</span>}
                                    </div>
                                    <span className={`text-[10px] font-['Montserrat'] font-semibold whitespace-nowrap ${isCurrent ? "text-[hsl(var(--gold))]" : reached ? "text-[hsl(var(--navy))]" : "text-[hsl(var(--navy)/0.6)]"}`}>{s.label}</span>
                                  </div>
                                  {i < steps.length - 1 && <div className={`w-4 sm:w-8 h-0.5 ${curIdx > i ? "bg-[hsl(var(--gold))]" : "bg-[hsl(220_25%_90%)]"}`} />}
                                </div>
                              );
                            })}
                          </div>
                          {!!o.cars_count && (
                            <div className="pt-4 mt-4 border-t border-[hsl(220_15%_90%)]">
                              <button onClick={() => toggleOrderCars(o.id)} className="flex items-center gap-2 text-sm font-['Montserrat'] font-semibold text-[hsl(var(--navy))] hover:text-[hsl(var(--gold))] transition-colors">
                                <Icon name="Car" size={15} />{t("selected_cars")} ({o.cars_count})
                                <Icon name={expandedOrder === o.id ? "ChevronUp" : "ChevronDown"} size={15} />
                              </button>
                              {expandedOrder === o.id && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                  {(orderCars[o.id] || []).map((c) => (
                                    <div key={c.id} className="border border-[hsl(220_15%_88%)] rounded-sm overflow-hidden">
                                      {c.photos.length > 0 && (
                                        <div className="flex gap-1 overflow-x-auto bg-[hsl(220_25%_97%)]">
                                          {c.photos.map((p, i) => (<img key={i} src={p} alt="" className="h-40 w-auto object-cover flex-shrink-0" />))}
                                        </div>
                                      )}
                                      <div className="p-4">
                                        <div className="font-['Montserrat'] font-bold navy">{[c.car_brand, c.car_model, c.car_year].filter(Boolean).join(" ")}</div>
                                        <div className="flex gap-4 text-sm mt-1 text-[hsl(var(--navy)/0.6)]">
                                          {!!c.price && <span className="font-semibold text-[hsl(var(--gold))]">{c.price.toLocaleString()} ₽</span>}
                                          {!!c.mileage && <span>{c.mileage.toLocaleString()} {t("km")}</span>}
                                        </div>
                                        {c.description && <p className="text-[hsl(var(--navy)/0.55)] text-sm mt-2 leading-relaxed">{c.description}</p>}
                                        {c.teardown && c.teardown.length > 0 && (
                                          <div className="mt-3 pt-3 border-t border-[hsl(220_15%_90%)]">
                                            <div className="flex items-center gap-2 mb-2">
                                              <span className="text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold uppercase tracking-wide">{t("teardown_title")}</span>
                                              {savingTeardown === c.id && <Icon name="Loader" size={12} className="animate-spin text-[hsl(var(--navy)/0.62)]" />}
                                            </div>
                                            <p className="text-[hsl(var(--navy)/0.62)] text-xs mb-2">{t("teardown_client_hint")}</p>
                                            <div className="flex flex-col gap-1">
                                              {c.teardown.map((it) => (
                                                <label key={it.name} className="flex items-center gap-2.5 cursor-pointer group/part select-none py-0.5">
                                                  <span className={`w-5 h-5 rounded-sm border flex items-center justify-center flex-shrink-0 transition-colors ${it.needed ? "bg-[hsl(var(--gold))] border-[hsl(var(--gold))]" : "bg-white border-[hsl(220_15%_80%)] group-hover/part:border-[hsl(var(--navy))]"}`}>
                                                    {it.needed && <Icon name="Check" size={13} className="text-white" />}
                                                  </span>
                                                  <input type="checkbox" checked={it.needed} onChange={() => toggleClientPart(c, it.name)} className="hidden" />
                                                  <span className={`text-sm ${it.needed ? "navy font-semibold" : "text-[hsl(var(--navy)/0.6)]"}`}>{it.name}</span>
                                                </label>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                );
              })()}

              {/* ── Заявки клиентов (сотрудник) ── */}
              {cabinetTab === "clients" && (
                <div>
                  {!selectedOrder ? (
                    ordersLoading ? (
                      <div className="flex items-center gap-3 py-16 justify-center text-[hsl(var(--navy)/0.62)]">
                        <Icon name="Loader" size={20} className="animate-spin" />{t("loading_clients")}
                      </div>
                    ) : orders.length === 0 ? (
                      <div className="text-center py-16">
                        <Icon name="Users" size={40} className="mx-auto mb-4 text-[hsl(var(--navy)/0.4)]" />
                        <p className="font-['Montserrat'] font-bold navy mb-2">{t("no_client_orders")}</p>
                        <p className="text-[hsl(var(--navy)/0.65)] text-sm">{t("no_client_orders_sub")}</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {orders.map((o) => (
                          <div key={o.id} onClick={() => openOrderCars(o)}
                            className="card-light rounded-sm p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:shadow-md transition-all">
                            <div className="flex items-start gap-4">
                              <div className="w-10 h-10 bg-[hsl(var(--navy)/0.06)] rounded-sm flex items-center justify-center flex-shrink-0">
                                <Icon name="User" size={18} className="text-[hsl(var(--navy))]" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-['Montserrat'] font-bold text-sm navy">{o.order_number}</span>
                                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_COLOR[o.status] || "bg-gray-100 text-gray-600"}`}>{STATUS_LABEL[lang][o.status] || o.status_label}</span>
                                  {!!o.cars_count && <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-[hsl(var(--gold)/0.12)] text-[hsl(var(--gold))]">{o.cars_count} {t("cars_word")}</span>}
                                </div>
                                <div className="text-[hsl(var(--navy))] text-sm font-semibold mt-1">{o.client_name || o.client_email}{o.client_company ? ` · ${o.client_company}` : ""}</div>
                                <div className="text-[hsl(var(--navy)/0.55)] text-sm mt-0.5">
                                  {t("request_word")} {[o.car_brand, o.car_model, o.car_year].filter(Boolean).join(" ")} · {ORIGIN_LABEL[lang][o.origin] || o.origin} · {o.quantity} {t("pcs")}
                                </div>
                                <div className="text-[hsl(var(--navy)/0.6)] text-xs mt-1">{o.client_phone} · {new Date(o.created_at).toLocaleDateString(lang)}</div>
                              </div>
                            </div>
                            <Icon name="ChevronRight" size={20} className="text-[hsl(var(--navy)/0.55)]" />
                          </div>
                        ))}
                      </div>
                    )
                  ) : (
                    <div>
                      <button onClick={() => setSelectedOrder(null)} className="flex items-center gap-2 text-[hsl(var(--navy)/0.68)] text-sm font-['Montserrat'] font-semibold mb-6 hover:text-[hsl(var(--navy))] transition-colors">
                        <Icon name="ArrowLeft" size={15} />{t("all_client_orders")}
                      </button>

                      {/* Карточка заявки + смена статуса */}
                      <div className="card-light rounded-sm p-6 mb-6">
                        <div className="flex items-center gap-2 flex-wrap mb-3">
                          <span className="font-['Montserrat'] font-black text-xl navy">{selectedOrder.order_number}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_COLOR[selectedOrder.status] || "bg-gray-100 text-gray-600"}`}>{STATUS_LABEL[lang][selectedOrder.status] || selectedOrder.status_label}</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm mb-5">
                          <div><span className="text-[hsl(var(--navy)/0.62)]">{t("client")}</span> <span className="navy font-semibold">{selectedOrder.client_name || "—"}</span></div>
                          <div><span className="text-[hsl(var(--navy)/0.62)]">{t("company_label")}</span> <span className="navy">{selectedOrder.client_company || "—"}</span></div>
                          <div><span className="text-[hsl(var(--navy)/0.62)]">{t("email_label")}</span> <span className="navy">{selectedOrder.client_email || "—"}</span></div>
                          <div><span className="text-[hsl(var(--navy)/0.62)]">{t("phone_label")}</span> <span className="navy">{selectedOrder.client_phone || "—"}</span></div>
                          <div><span className="text-[hsl(var(--navy)/0.62)]">{t("request_label")}</span> <span className="navy">{[selectedOrder.car_brand, selectedOrder.car_model, selectedOrder.car_year].filter(Boolean).join(" ") || "—"}</span></div>
                          <div><span className="text-[hsl(var(--navy)/0.62)]">{t("direction_label")}</span> <span className="navy">{ORIGIN_LABEL[lang][selectedOrder.origin] || selectedOrder.origin} · {selectedOrder.quantity} {t("pcs")}</span></div>
                        </div>
                        {selectedOrder.comment && <div className="text-sm bg-[hsl(220_25%_97%)] rounded-sm p-3 mb-5"><span className="text-[hsl(var(--navy)/0.62)]">{t("client_comment")}</span><span className="navy">{selectedOrder.comment}</span></div>}
                        <div>
                          <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-widest uppercase mb-2">{t("order_status")}</label>
                          <select value={selectedOrder.status} onChange={(e) => changeOrderStatus(selectedOrder.id, e.target.value)} className={inputCls + " max-w-xs"}>
                            <option value="new">{t("st_new")}</option>
                            <option value="processing">{t("st_processing")}</option>
                            <option value="auction">{t("st_auction")}</option>
                            <option value="shipped">{t("st_shipped")}</option>
                            <option value="customs">{t("st_customs")}</option>
                            <option value="delivered">{t("st_delivered")}</option>
                            <option value="done">{t("st_done")}</option>
                          </select>
                        </div>
                      </div>

                      {/* Форма добавления авто */}
                      <form onSubmit={doAddCar} className="card-light rounded-sm p-6 mb-6 flex flex-col gap-4">
                        <h3 className="font-['Montserrat'] font-bold text-lg navy">{t("add_car_title")}</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-wide uppercase mb-2">{t("brand")}</label>
                            <input required placeholder="Toyota" value={carForm.car_brand} onChange={(e) => setCarForm({ ...carForm, car_brand: e.target.value })} className={inputCls} />
                          </div>
                          <div>
                            <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-wide uppercase mb-2">{t("model")}</label>
                            <input placeholder="Camry" value={carForm.car_model} onChange={(e) => setCarForm({ ...carForm, car_model: e.target.value })} className={inputCls} />
                          </div>
                          <div>
                            <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-wide uppercase mb-2">{t("year")}</label>
                            <input placeholder="2019" value={carForm.car_year} onChange={(e) => setCarForm({ ...carForm, car_year: e.target.value })} className={inputCls} />
                          </div>
                          <div>
                            <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-wide uppercase mb-2">{t("price_rub")}</label>
                            <input placeholder="850000" value={carForm.price} onChange={(e) => setCarForm({ ...carForm, price: e.target.value })} className={inputCls} />
                          </div>
                          <div>
                            <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-wide uppercase mb-2">{t("mileage_km")}</label>
                            <input placeholder="65000" value={carForm.mileage} onChange={(e) => setCarForm({ ...carForm, mileage: e.target.value })} className={inputCls} />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-wide uppercase mb-2">{t("description_trim")}</label>
                          <textarea rows={3} placeholder={t("description_ph")} value={carForm.description} onChange={(e) => setCarForm({ ...carForm, description: e.target.value })} className={inputCls} />
                        </div>
                        <div>
                          <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-wide uppercase mb-2">{t("car_photos")}</label>
                          <div className="flex flex-wrap gap-3 items-center">
                            {carForm.photos.map((p, i) => (
                              <div key={i} className="relative w-20 h-20 rounded-sm overflow-hidden border border-[hsl(220_15%_85%)]">
                                <img src={p} alt="" className="w-full h-full object-cover" />
                                <button type="button" onClick={() => setCarForm({ ...carForm, photos: carForm.photos.filter((_, j) => j !== i) })}
                                  className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center"><Icon name="X" size={11} /></button>
                              </div>
                            ))}
                            <label className="w-20 h-20 rounded-sm border-2 border-dashed border-[hsl(220_15%_80%)] flex flex-col items-center justify-center cursor-pointer hover:border-[hsl(var(--navy))] transition-colors text-[hsl(var(--navy)/0.65)]">
                              <Icon name="Plus" size={18} />
                              <span className="text-[10px] mt-1">{t("photo")}</span>
                              <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handlePhotoSelect(e.target.files)} />
                            </label>
                          </div>
                        </div>
                        <div>
                          <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-wide uppercase mb-2">{t("teardown_title")}</label>
                          <p className="text-[hsl(var(--navy)/0.62)] text-xs mb-3">{t("teardown_staff_hint")}</p>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {TEARDOWN_PRESET.map((name) => {
                              const active = carForm.teardown.some((x) => x.name === name);
                              return (
                                <button type="button" key={name} onClick={() => toggleCarFormPart(name)}
                                  className={`text-xs font-['Montserrat'] font-semibold px-3 py-1.5 rounded-full border transition-colors ${active ? "bg-[hsl(var(--navy))] text-white border-[hsl(var(--navy))]" : "bg-white text-[hsl(var(--navy)/0.6)] border-[hsl(220_15%_85%)] hover:border-[hsl(var(--navy))]"}`}>
                                  {active && <Icon name="Check" size={12} className="inline mr-1 -mt-0.5" />}{name}
                                </button>
                              );
                            })}
                          </div>
                          <div className="flex gap-2 mb-3">
                            <input placeholder={t("teardown_add_ph")} value={teardownInput}
                              onChange={(e) => setTeardownInput(e.target.value)}
                              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomPart(); } }}
                              className={inputCls} />
                            <button type="button" onClick={addCustomPart} className="flex-shrink-0 px-4 btn-outline rounded-sm text-sm">{t("teardown_add")}</button>
                          </div>
                          {carForm.teardown.length > 0 && (
                            <div className="flex flex-col gap-1.5">
                              {carForm.teardown.map((it) => (
                                <div key={it.name} className="flex items-center justify-between bg-[hsl(220_25%_97%)] rounded-sm px-3 py-2">
                                  <span className="text-sm navy">{it.name}</span>
                                  <button type="button" onClick={() => toggleCarFormPart(it.name)} className="text-[hsl(var(--navy)/0.6)] hover:text-red-600"><Icon name="X" size={14} /></button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <button type="submit" disabled={carSaving} className="self-start px-6 py-3 btn-navy rounded-sm disabled:opacity-60">
                          {carSaving ? t("saving") : t("add_car")}
                        </button>
                      </form>

                      {/* Список добавленных авто */}
                      <h3 className="font-['Montserrat'] font-bold text-lg navy mb-4">{t("proposed_cars")} ({cars.length})</h3>
                      {carsLoading ? (
                        <div className="flex items-center gap-3 py-10 justify-center text-[hsl(var(--navy)/0.62)]"><Icon name="Loader" size={20} className="animate-spin" />{t("loading")}</div>
                      ) : cars.length === 0 ? (
                        <p className="text-[hsl(var(--navy)/0.65)] text-sm py-6">{t("nothing_added")}</p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {cars.map((c) => (
                            <div key={c.id} className="card-light rounded-sm overflow-hidden">
                              {c.photos.length > 0 && (
                                <div className="flex gap-1 overflow-x-auto bg-[hsl(220_25%_97%)]">
                                  {c.photos.map((p, i) => (<img key={i} src={p} alt="" className="h-40 w-auto object-cover flex-shrink-0" />))}
                                </div>
                              )}
                              <div className="p-5">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="font-['Montserrat'] font-bold navy">{[c.car_brand, c.car_model, c.car_year].filter(Boolean).join(" ")}</div>
                                  <button onClick={() => doDeleteCar(c.id)} className="text-[hsl(var(--navy)/0.6)] hover:text-red-600"><Icon name="Trash2" size={16} /></button>
                                </div>
                                <div className="flex gap-4 text-sm mt-1 text-[hsl(var(--navy)/0.6)]">
                                  {!!c.price && <span className="font-semibold text-[hsl(var(--gold))]">{c.price.toLocaleString()} ₽</span>}
                                  {!!c.mileage && <span>{c.mileage.toLocaleString()} {t("km")}</span>}
                                </div>
                                {c.description && <p className="text-[hsl(var(--navy)/0.55)] text-sm mt-2 leading-relaxed">{c.description}</p>}
                                {c.teardown && c.teardown.length > 0 && (
                                  <div className="mt-3 pt-3 border-t border-[hsl(220_15%_90%)]">
                                    <div className="text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold uppercase tracking-wide mb-2">{t("teardown_title")} · {t("teardown_client_picked")}: {c.teardown.filter((x) => x.needed).length}/{c.teardown.length}</div>
                                    <div className="flex flex-col gap-1">
                                      {c.teardown.map((it) => (
                                        <div key={it.name} className={`flex items-center gap-2 text-sm ${it.needed ? "navy font-semibold" : "text-[hsl(var(--navy)/0.62)]"}`}>
                                          <Icon name={it.needed ? "CheckCircle2" : "Circle"} size={15} className={it.needed ? "text-[hsl(var(--gold))]" : "text-[hsl(var(--navy)/0.25)]"} />{it.name}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ── Новая заявка ── */}
              {cabinetTab === "new_order" && (
                <div className="max-w-lg">
                  {newOrderSent ? (
                    <div className="text-center py-12">
                      <div className="w-14 h-14 rounded-sm bg-[hsl(var(--gold)/0.1)] flex items-center justify-center mb-5 mx-auto"><Icon name="CheckCircle" size={30} className="text-[hsl(var(--gold))]" /></div>
                      <h3 className="font-['Montserrat'] font-bold text-xl navy mb-2">{t("new_order_created")}</h3>
                      <p className="text-[hsl(var(--navy)/0.68)] text-sm">{t("new_order_redirect")}</p>
                    </div>
                  ) : (
                    <form onSubmit={doNewOrder} className="card-light rounded-sm p-7 flex flex-col gap-5">
                      <div><h2 className="font-['Montserrat'] font-bold text-xl navy mb-1">{t("new_order_title")}</h2><p className="text-[hsl(var(--navy)/0.65)] text-sm">{t("new_order_sub")}</p></div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-widest uppercase mb-2">{t("brand")}</label>
                          <input required placeholder="Toyota" value={newOrderForm.car_brand} onChange={(e) => setNewOrderForm({ ...newOrderForm, car_brand: e.target.value })} className={inputCls} />
                        </div>
                        <div>
                          <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-widest uppercase mb-2">{t("model")}</label>
                          <input placeholder="Camry" value={newOrderForm.car_model} onChange={(e) => setNewOrderForm({ ...newOrderForm, car_model: e.target.value })} className={inputCls} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-widest uppercase mb-2">{t("year")}</label>
                          <input placeholder="2018" value={newOrderForm.car_year} onChange={(e) => setNewOrderForm({ ...newOrderForm, car_year: e.target.value })} className={inputCls} />
                        </div>
                        <div>
                          <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-widest uppercase mb-2">{t("qty")}</label>
                          <input type="number" min="1" value={newOrderForm.quantity} onChange={(e) => setNewOrderForm({ ...newOrderForm, quantity: e.target.value })} className={inputCls} />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-widest uppercase mb-2">{t("direction")}</label>
                        <select value={newOrderForm.origin} onChange={(e) => setNewOrderForm({ ...newOrderForm, origin: e.target.value })} className={inputCls}>
                          <option value="Япония">{ORIGIN_LABEL[lang]["Япония"]}</option>
                          <option value="Корея">{ORIGIN_LABEL[lang]["Корея"]}</option>
                          <option value="Гонконг">{ORIGIN_LABEL[lang]["Гонконг"]}</option>
                          <option value="Китай">{ORIGIN_LABEL[lang]["Китай"]}</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-widest uppercase mb-2">{t("budget_unit")}</label>
                        <input placeholder="300000" value={newOrderForm.budget} onChange={(e) => setNewOrderForm({ ...newOrderForm, budget: e.target.value })} className={inputCls} />
                      </div>
                      <div>
                        <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-widest uppercase mb-2">{t("comment")}</label>
                        <textarea rows={3} placeholder={t("comment_req_ph")} value={newOrderForm.comment} onChange={(e) => setNewOrderForm({ ...newOrderForm, comment: e.target.value })} className={inputCls + " resize-none"} />
                      </div>
                      <button type="submit" className="w-full py-3.5 btn-navy rounded-sm">{t("create_order")}</button>
                    </form>
                  )}
                </div>
              )}

              {/* ── Аукционы ── */}
              {cabinetTab === "auctions" && (
                <div>
                  <div className="mb-6">
                    <h2 className="font-['Montserrat'] font-black text-2xl navy mb-2">{t("jp_auctions")}</h2>
                    <p className="text-[hsl(var(--navy)/0.68)] text-sm">{t("jp_auctions_sub")}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { name: "USS Auction", country: "🇯🇵", desc: t("auc_uss"), url: "https://www.uss-auction.jp", tag: t("auc_tag_jp1") },
                      { name: "JU Auction", country: "🇯🇵", desc: t("auc_ju"), url: "https://www.ju-auction.jp", tag: t("auc_tag_crash") },
                      { name: "TAA Auction", country: "🇯🇵", desc: t("auc_taa"), url: "https://www.taa.gr.jp", tag: t("auc_tag_toyota") },
                      { name: "HAA Auction", country: "🇯🇵", desc: t("auc_haa"), url: "https://www.honda.co.jp", tag: t("auc_tag_honda") },
                      { name: "Kcaa Auction", country: "🇰🇷", desc: t("auc_kcaa"), url: "https://www.kcaa.or.kr", tag: t("auc_tag_kr1") },
                      { name: "Manheim Korea", country: "🇰🇷", desc: t("auc_manheim"), url: "https://korea.manheim.com", tag: t("auc_tag_intl") },
                    ].map((a) => (
                      <a key={a.name} href={a.url} target="_blank" rel="noopener noreferrer"
                        className="card-light rounded-sm p-5 flex flex-col gap-3 group hover:shadow-md transition-all">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-xl mr-2">{a.country}</span>
                            <span className="font-['Montserrat'] font-bold text-base navy">{a.name}</span>
                          </div>
                          <span className="text-[10px] font-['Montserrat'] font-bold px-2 py-0.5 bg-[hsl(var(--gold)/0.1)] text-[hsl(var(--gold))] rounded-full whitespace-nowrap">{a.tag}</span>
                        </div>
                        <p className="text-[hsl(var(--navy)/0.68)] text-sm leading-relaxed">{a.desc}</p>
                        <div className="flex items-center gap-1.5 text-[hsl(var(--gold))] text-xs font-['Montserrat'] font-semibold group-hover:gap-2.5 transition-all">
                          {t("go_to_auction")} <Icon name="ExternalLink" size={13} />
                        </div>
                      </a>
                    ))}
                  </div>
                  <div className="mt-6 p-4 bg-[hsl(220_25%_97%)] rounded-sm border border-[hsl(var(--gold)/0.3)] flex items-start gap-3">
                    <Icon name="Info" size={16} className="text-[hsl(var(--gold))] flex-shrink-0 mt-0.5" />
                    <p className="text-[hsl(var(--navy)/0.6)] text-sm">{t("auction_info_pre")}<button onClick={() => setCabinetTab("new_order")} className="text-[hsl(var(--gold))] font-semibold hover:underline">{t("auction_info_link")}</button>{t("auction_info_post")}</p>
                  </div>
                </div>
              )}

              {/* ── Документы ── */}
              {cabinetTab === "documents" && (
                <div>
                  <div className="mb-6"><h2 className="font-['Montserrat'] font-black text-2xl navy mb-2">{t("documents")}</h2><p className="text-[hsl(var(--navy)/0.68)] text-sm">{t("documents_sub")}</p></div>
                  <div className="max-w-lg">
                    <div className="card-light rounded-sm p-8 border-2 border-dashed border-[hsl(220_15%_85%)] text-center mb-5">
                      <Icon name="Upload" size={32} className="mx-auto mb-3 text-[hsl(var(--navy)/0.25)]" />
                      <p className="font-['Montserrat'] font-semibold navy mb-1">{t("upload_document")}</p>
                      <p className="text-[hsl(var(--navy)/0.62)] text-xs mb-4">{t("upload_hint")}</p>
                      <button className="px-5 py-2.5 btn-navy rounded-sm text-xs">{t("choose_file")}</button>
                    </div>
                    <div className="text-center py-8 text-[hsl(var(--navy)/0.6)]">
                      <Icon name="FileText" size={32} className="mx-auto mb-3 opacity-40" />
                      <p className="text-sm">{t("no_documents")}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Горячие предложения (Гонконг) ── */}
              {cabinetTab === "hot_deals" && isStaff && (
                <div className="max-w-4xl">
                  <div className="mb-6">
                    <h2 className="font-['Montserrat'] font-bold text-xl navy mb-1">{t("hde_title")}</h2>
                    <p className="text-[hsl(var(--navy)/0.68)] text-sm">{t("hde_sub")}</p>
                  </div>

                  <form onSubmit={saveDeal} className="card-light rounded-sm p-6 mb-8">
                    <div className="flex items-center gap-2 mb-5">
                      <Icon name={dealForm.id ? "Pencil" : "Plus"} size={18} className="text-[hsl(var(--gold))]" />
                      <h3 className="font-['Montserrat'] font-bold text-base navy">{dealForm.id ? t("hde_form_edit") : t("hde_form_new")}</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-widest uppercase mb-2">{t("hde_brand")}</label>
                        <input required value={dealForm.brand} onChange={(e) => setDealForm({ ...dealForm, brand: e.target.value })} className={inputCls} placeholder="BMW" />
                      </div>
                      <div>
                        <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-widest uppercase mb-2">{t("hde_model")}</label>
                        <input required value={dealForm.model} onChange={(e) => setDealForm({ ...dealForm, model: e.target.value })} className={inputCls} placeholder="X5 xDrive40i" />
                      </div>
                      <div>
                        <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-widest uppercase mb-2">{t("hde_year")}</label>
                        <input type="number" value={dealForm.year} onChange={(e) => setDealForm({ ...dealForm, year: e.target.value })} className={inputCls} placeholder="2021" />
                      </div>
                      <div>
                        <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-widest uppercase mb-2">{t("hde_mileage")}</label>
                        <input value={dealForm.mileage} onChange={(e) => setDealForm({ ...dealForm, mileage: e.target.value })} className={inputCls} placeholder="32 000 км" />
                      </div>
                      <div>
                        <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-widest uppercase mb-2">{t("hde_engine")}</label>
                        <input value={dealForm.engine} onChange={(e) => setDealForm({ ...dealForm, engine: e.target.value })} className={inputCls} placeholder="3.0 бензин" />
                      </div>
                      <div>
                        <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-widest uppercase mb-2">{t("hde_price")}</label>
                        <input value={dealForm.price} onChange={(e) => setDealForm({ ...dealForm, price: e.target.value })} className={inputCls} placeholder="от 4 250 000 ₽" />
                      </div>
                      <div>
                        <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-widest uppercase mb-2">{t("hde_badge")}</label>
                        <input value={dealForm.badge} onChange={(e) => setDealForm({ ...dealForm, badge: e.target.value })} className={inputCls} placeholder="Хит" />
                      </div>
                      <div>
                        <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-widest uppercase mb-2">{t("hde_photo")}</label>
                        <div className="flex items-center gap-3">
                          {dealForm.photo && <img src={dealForm.photo} alt="" className="w-12 h-12 object-cover rounded-sm border border-[hsl(220_15%_88%)]" />}
                          <label className="flex items-center gap-2 px-4 py-2.5 border border-[hsl(220_15%_88%)] rounded-sm text-sm font-['Montserrat'] font-semibold navy cursor-pointer hover:border-[hsl(var(--navy))] transition-colors">
                            <Icon name="Upload" size={15} />{t("hde_upload")}
                            <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                              const f = e.target.files?.[0];
                              if (f) setDealForm({ ...dealForm, photo: await pickDealPhoto(f) });
                            }} />
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-6">
                      <button type="submit" disabled={dealSaving} className="px-6 py-3 btn-gold rounded-sm disabled:opacity-60 flex items-center gap-2">
                        {dealSaving ? <Icon name="Loader" size={15} className="animate-spin" /> : <Icon name={dealForm.id ? "Save" : "Plus"} size={15} />}
                        {dealSaving ? t("hde_saving") : dealForm.id ? t("hde_save") : t("hde_add")}
                      </button>
                      {dealForm.id ? (
                        <button type="button" onClick={() => setDealForm({ ...emptyDeal })} className="px-5 py-3 border border-[hsl(220_15%_88%)] rounded-sm text-sm font-['Montserrat'] font-semibold text-[hsl(var(--navy)/0.6)] hover:text-[hsl(var(--navy))]">{t("hde_cancel")}</button>
                      ) : null}
                    </div>
                  </form>

                  {hotDealsLoading ? (
                    <div className="flex items-center gap-3 py-16 justify-center text-[hsl(var(--navy)/0.62)]">
                      <Icon name="Loader" size={20} className="animate-spin" />{t("hde_loading")}
                    </div>
                  ) : hotDeals.length === 0 ? (
                    <div className="text-center py-16">
                      <Icon name="Flame" size={40} className="mx-auto mb-4 text-[hsl(var(--navy)/0.4)]" />
                      <p className="font-['Montserrat'] font-bold navy">{t("hde_empty")}</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {hotDeals.map((d) => (
                        <div key={d.id} className="card-light rounded-sm p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                          <div className="w-16 h-16 rounded-sm bg-[hsl(220_25%_97%)] flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {d.photo ? <img src={d.photo} alt="" className="w-full h-full object-cover" /> : <Icon name="Car" size={24} className="text-[hsl(var(--navy)/0.55)]" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-['Montserrat'] font-bold text-sm navy">{d.brand} {d.model}</span>
                              {d.badge && <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-[hsl(var(--gold)/0.12)] text-[hsl(var(--gold))]">{d.badge}</span>}
                            </div>
                            <div className="text-[hsl(var(--navy)/0.68)] text-xs mt-1">{[d.year, d.mileage, d.engine].filter(Boolean).join(" · ")}</div>
                            <div className="font-['Montserrat'] font-bold text-sm gold mt-0.5">{d.price}</div>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <button onClick={() => editDeal(d)} className="flex items-center gap-1.5 px-3 py-2 border border-[hsl(220_15%_88%)] rounded-sm text-xs font-['Montserrat'] font-semibold navy hover:border-[hsl(var(--navy))] transition-colors">
                              <Icon name="Pencil" size={14} />{t("hde_edit")}
                            </button>
                            <button onClick={() => deleteDeal(d.id)} disabled={dealDeletingId === d.id} className="flex items-center gap-1.5 px-3 py-2 border border-[hsl(220_15%_88%)] rounded-sm text-xs font-['Montserrat'] font-semibold text-[hsl(var(--navy)/0.6)] hover:text-red-600 hover:border-red-200 transition-colors disabled:opacity-60">
                              {dealDeletingId === d.id ? <Icon name="Loader" size={14} className="animate-spin" /> : <Icon name="Trash2" size={14} />}{t("hde_delete")}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── Управление сотрудниками ── */}
              {cabinetTab === "staff_users" && isStaff && (
                <div className="max-w-3xl">
                  <div className="mb-6">
                    <h2 className="font-['Montserrat'] font-bold text-xl navy mb-1">{t("su_title")}</h2>
                    <p className="text-[hsl(var(--navy)/0.68)] text-sm">{t("su_sub")}</p>
                  </div>
                  {staffUsersLoading ? (
                    <div className="flex items-center gap-3 py-16 justify-center text-[hsl(var(--navy)/0.62)]">
                      <Icon name="Loader" size={20} className="animate-spin" />{t("su_loading")}
                    </div>
                  ) : staffUsers.length === 0 ? (
                    <div className="text-center py-16">
                      <Icon name="Users" size={40} className="mx-auto mb-4 text-[hsl(var(--navy)/0.4)]" />
                      <p className="font-['Montserrat'] font-bold navy">{t("su_empty")}</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {staffUsers.map((u) => {
                        const staffRole = u.role === "staff";
                        const isMe = u.id === user.id;
                        return (
                          <div key={u.id} className="card-light rounded-sm p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-start gap-4 min-w-0">
                              <div className={`w-10 h-10 rounded-sm flex items-center justify-center flex-shrink-0 ${staffRole ? "bg-[hsl(var(--gold)/0.12)]" : "bg-[hsl(var(--navy)/0.06)]"}`}>
                                <Icon name={staffRole ? "ShieldCheck" : "User"} size={18} className={staffRole ? "text-[hsl(var(--gold))]" : "text-[hsl(var(--navy))]"} />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-['Montserrat'] font-bold text-sm navy truncate">{u.full_name || u.email}</span>
                                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${staffRole ? "bg-[hsl(var(--gold)/0.12)] text-[hsl(var(--gold))]" : "bg-gray-100 text-gray-600"}`}>{staffRole ? t("su_role_staff") : t("su_role_client")}</span>
                                  {isMe && <span className="text-xs text-[hsl(var(--navy)/0.6)]">({t("su_you")})</span>}
                                </div>
                                <div className="text-[hsl(var(--navy)/0.6)] text-sm mt-0.5 truncate">{u.email}{u.phone ? ` · ${u.phone}` : ""}</div>
                                <div className="text-[hsl(var(--navy)/0.6)] text-xs mt-1">{u.company ? `${u.company} · ` : ""}{t("su_registered")} {new Date(u.created_at).toLocaleDateString(lang === "ru" ? "ru" : "en")}</div>
                              </div>
                            </div>
                            {!isMe && (
                              <button onClick={() => toggleUserRole(u)} disabled={roleSavingId === u.id}
                                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-['Montserrat'] font-semibold rounded-sm transition-all flex-shrink-0 disabled:opacity-60 ${staffRole ? "border border-[hsl(220_15%_88%)] text-[hsl(var(--navy)/0.6)] hover:text-red-600 hover:border-red-200" : "btn-gold"}`}>
                                {roleSavingId === u.id ? <Icon name="Loader" size={15} className="animate-spin" /> : <Icon name={staffRole ? "UserMinus" : "ShieldCheck"} size={15} />}
                                {staffRole ? t("su_remove_staff") : t("su_make_staff")}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ── Профиль ── */}
              {cabinetTab === "profile" && (
                <div className="max-w-lg">
                  <form onSubmit={doSaveProfile} className="card-light rounded-sm p-7 flex flex-col gap-5">
                    <div><h2 className="font-['Montserrat'] font-bold text-xl navy mb-1">{t("edit_profile")}</h2><p className="text-[hsl(var(--navy)/0.65)] text-sm">Email: {user.email}</p></div>
                    {profileSaved && <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-sm flex items-center gap-2"><Icon name="Check" size={15} />{t("profile_saved")}</div>}
                    {[
                      { key: "full_name", label: t("full_name"), placeholder: t("ph_name") },
                      { key: "phone", label: t("phone"), placeholder: "+7 (___) ___-__-__" },
                      { key: "company", label: t("company_ip"), placeholder: t("ph_company") },
                      { key: "inn", label: t("inn"), placeholder: t("ph_inn") },
                    ].map((f) => (
                      <div key={f.key}>
                        <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-widest uppercase mb-2">{f.label}</label>
                        <input placeholder={f.placeholder} value={profileForm[f.key as keyof typeof profileForm]} onChange={(e) => setProfileForm({ ...profileForm, [f.key]: e.target.value })} className={inputCls} />
                      </div>
                    ))}
                    <button type="submit" className="w-full py-3.5 btn-navy rounded-sm">{t("save_changes")}</button>
                  </form>
                </div>
              )}
              </div>
            </div>
          )
        )}

        {/* FOOTER */}
        <footer className="border-t border-[hsl(220_15%_88%)] py-8 px-5 sm:px-8 mt-8 bg-white">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <button onClick={() => nav("home")}><img src={LOGO} alt="Partcore Logistics" className="h-12 w-12 object-contain" /></button>
            <div className="text-[hsl(var(--navy)/0.6)] text-xs text-center">{t("footer_copy")}</div>
            <div className="flex gap-5 flex-wrap justify-center">
              {navItems.map((item) => (
                <button key={item.id} onClick={() => nav(item.id)} className="text-xs text-[hsl(var(--navy)/0.62)] hover:text-[hsl(var(--navy))] transition-colors font-['Montserrat'] font-medium">{item.label}</button>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
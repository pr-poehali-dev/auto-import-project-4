import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";

const LOGO = "https://cdn.poehali.dev/projects/92e249db-e174-4ab7-8e64-42d927b13e30/bucket/892f391f-a7d5-48a5-92ab-0fda67f800fc.jpg";
const HERO_IMG = "https://cdn.poehali.dev/projects/92e249db-e174-4ab7-8e64-42d927b13e30/files/c8bb52fe-b883-423d-8dc9-08554e20076d.jpg";

const AUTH_URL = "https://functions.poehali.dev/ddb4a7f6-82c2-4cca-8d4c-ed685f8a3c72";
const ORDERS_URL = "https://functions.poehali.dev/d57608b2-729a-4006-a5c2-598ca59a8239";

// ── API helpers ──────────────────────────────────────────────
async function apiAuth(action: string, payload: object = {}, token?: string) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["X-Session-Token"] = token;
  const res = await fetch(AUTH_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({ action, ...payload }),
  });
  return res.json();
}

async function apiOrders(method: "GET" | "POST", token: string, body?: object) {
  const headers: Record<string, string> = { "X-Session-Token": token };
  if (body) headers["Content-Type"] = "application/json";
  const res = await fetch(ORDERS_URL, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

// ── Types ────────────────────────────────────────────────────
interface User { id: number; email: string; phone: string; full_name: string; company: string; inn: string; created_at: string; }
interface Order { id: number; order_number: string; car_brand: string; car_model: string; car_year: number; quantity: number; budget: number; status: string; status_label: string; origin: string; created_at: string; }

const ORIGINS = [
  { flag: "🇯🇵", name: "Япония", desc: "Праворульные авто с аукционов USS, JU, TAA", volume: "от 50 ед./мес." },
  { flag: "🇰🇷", name: "Корея", desc: "Hyundai, Kia, Ssangyong — высокий спрос на запчасти", volume: "от 30 ед./мес." },
  { flag: "🇭🇰", name: "Гонконг", desc: "Европейские и американские марки по доступным ценам", volume: "от 20 ед./мес." },
];
const SERVICES = [
  { icon: "Package", title: "Поставка авто под разборку", desc: "Подбираем автомобили с аукционов и у дилеров под ваш запрос. Битые, с пробегом, снятые с учёта." },
  { icon: "FileCheck", title: "Таможенное оформление", desc: "Полное сопровождение: документы, СБКТС, таможенная декларация. Растаможка под ключ." },
  { icon: "Truck", title: "Доставка по России", desc: "Логистика от порта до вашего склада. Работаем с Владивостоком, Санкт-Петербургом, Новороссийском." },
  { icon: "Search", title: "Подбор по запросу", desc: "Нужна конкретная марка, модель или год? Ищем точно под ваши требования на аукционах Азии." },
  { icon: "Warehouse", title: "Хранение на складе", desc: "Временное хранение до вашей готовности принять партию. Охраняемые склады у портов." },
  { icon: "ShieldCheck", title: "Проверка перед покупкой", desc: "Инспекция состояния авто, фото и отчёт о комплектности узлов до отправки из страны." },
];
const STATS = [
  { num: "1 200+", label: "Авто поставлено" }, { num: "8 лет", label: "На рынке" },
  { num: "3", label: "Страны отправки" }, { num: "40–55", label: "Дней — срок доставки" },
];
const WHY = [
  { icon: "Building2", title: "Прямые контракты", desc: "Работаем напрямую с аукционными домами без посредников — ниже цена, быстрее сделка." },
  { icon: "BarChart3", title: "Оптовые объёмы", desc: "Ориентированы на B2B: минимальная партия от 3 авто. Чем больше объём — тем выгоднее условия." },
  { icon: "ClipboardList", title: "Прозрачная отчётность", desc: "Фото, видео и отчёт на каждом этапе — от аукциона до разгрузки на вашем складе." },
  { icon: "Headphones", title: "Персональный менеджер", desc: "Один контакт на весь цикл сделки. Знает ваш бизнес и подбирает авто точно под ваш профиль." },
];
const STEPS = [
  { n: "01", title: "Заявка", desc: "Присылаете список нужных марок, моделей, годов и бюджет." },
  { n: "02", title: "Подбор и торги", desc: "Участвуем в аукционах. Согласовываем лот с вами до покупки." },
  { n: "03", title: "Проверка и отгрузка", desc: "Инспектируем авто, грузим в контейнер, оформляем документы." },
  { n: "04", title: "Таможня и доставка", desc: "Растаможиваем и доставляем до вашего склада по России." },
];
const BRANDS = ["Toyota","Lexus","Honda","Nissan","Mazda","Mitsubishi","Subaru","Hyundai","Kia","Ssangyong","BMW","Mercedes-Benz","Audi","Volkswagen"];

const STATUS_COLOR: Record<string, string> = {
  new: "bg-blue-100 text-blue-700", processing: "bg-yellow-100 text-yellow-700",
  auction: "bg-purple-100 text-purple-700", shipped: "bg-indigo-100 text-indigo-700",
  customs: "bg-orange-100 text-orange-700", delivered: "bg-teal-100 text-teal-700", done: "bg-green-100 text-green-700",
};

type Page = "home" | "services" | "how" | "contacts" | "login" | "register" | "cabinet";
type CabinetTab = "orders" | "new_order" | "auctions" | "documents" | "profile";

// ════════════════════════════════════════════════════════════
export default function Index() {
  const [page, setPage] = useState<Page>("home");
  const [menuOpen, setMenuOpen] = useState(false);
  // auth
  const [token, setToken] = useState(() => localStorage.getItem("pc_token") || "");
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  // forms
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [regForm, setRegForm] = useState({ email: "", password: "", full_name: "", phone: "", company: "" });
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

  // ── load user on mount ──
  useEffect(() => {
    if (token) {
      apiAuth("me", {}, token).then((data) => {
        if (data.user) setUser(data.user);
        else { setToken(""); localStorage.removeItem("pc_token"); }
      });
    }
  }, []);

  // ── load orders when cabinet opens ──
  useEffect(() => {
    if (page === "cabinet" && cabinetTab === "orders" && token) {
      setOrdersLoading(true);
      apiOrders("GET", token).then((d) => {
        setOrders(d.orders || []);
        setOrdersLoading(false);
      });
    }
  }, [page, cabinetTab, token]);

  // ── fill profile form from user ──
  useEffect(() => {
    if (user) setProfileForm({ full_name: user.full_name, phone: user.phone, company: user.company, inn: user.inn });
  }, [user]);

  const nav = (p: Page) => { setPage(p); setMenuOpen(false); setAuthError(""); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const doLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setAuthLoading(true); setAuthError("");
    const data = await apiAuth("login", loginForm);
    setAuthLoading(false);
    if (data.token) {
      setToken(data.token); localStorage.setItem("pc_token", data.token);
      const me = await apiAuth("me", {}, data.token);
      if (me.user) setUser(me.user);
      nav("cabinet");
    } else setAuthError(data.error || "Ошибка входа");
  };

  const doRegister = async (e: React.FormEvent) => {
    e.preventDefault(); setAuthLoading(true); setAuthError("");
    const data = await apiAuth("register", regForm);
    setAuthLoading(false);
    if (data.token) {
      setToken(data.token); localStorage.setItem("pc_token", data.token);
      const me = await apiAuth("me", {}, data.token);
      if (me.user) setUser(me.user);
      nav("cabinet");
    } else setAuthError(data.error || "Ошибка регистрации");
  };

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
    { id: "home" as Page, label: "Главная" },
    { id: "services" as Page, label: "Услуги" },
    { id: "how" as Page, label: "Как работаем" },
    { id: "contacts" as Page, label: "Контакты" },
  ];

  const inputCls = "w-full bg-[hsl(220_25%_97%)] border border-[hsl(220_15%_88%)] px-4 py-3 text-sm text-[hsl(var(--navy))] placeholder-[hsl(var(--navy)/0.3)] focus:outline-none focus:border-[hsl(var(--navy)/0.5)] transition-colors rounded-sm";

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">

      {/* ── HEADER ── */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white border-b border-[hsl(220_15%_88%)] shadow-sm">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 flex items-center justify-between h-20">
          <button onClick={() => nav("home")}>
            <img src={LOGO} alt="Partcore Logistics" className="h-16 w-48 object-cover object-left" style={{ objectPosition: "10% center", transform: "scale(1.15)", transformOrigin: "left center" }} />
          </button>

          <nav className="hidden md:flex items-center gap-0.5">
            {navItems.map((item) => (
              <button key={item.id} onClick={() => nav(item.id)}
                className={`px-4 py-2 text-sm font-['Montserrat'] font-semibold transition-all rounded-sm ${page === item.id ? "text-[hsl(var(--gold))] bg-[hsl(36_85%_50%/0.07)]" : "text-[hsl(var(--navy)/0.6)] hover:text-[hsl(var(--navy))] hover:bg-[hsl(220_52%_18%/0.05)]"}`}>
                {item.label}
              </button>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <button onClick={() => nav("cabinet")}
                className="flex items-center gap-2 px-4 py-2 btn-navy rounded-sm">
                <Icon name="User" size={15} />
                <span className="max-w-[120px] truncate">{user.full_name || user.email}</span>
              </button>
            ) : (
              <>
                <button onClick={() => nav("login")}
                  className="px-4 py-2 btn-outline rounded-sm text-xs">
                  Войти
                </button>
                <button onClick={() => nav("register")}
                  className="px-4 py-2 btn-navy rounded-sm text-xs">
                  Регистрация
                </button>
              </>
            )}
          </div>

          <button className="md:hidden text-[hsl(var(--navy))]" onClick={() => setMenuOpen(!menuOpen)}>
            <Icon name={menuOpen ? "X" : "Menu"} size={22} />
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-white border-t border-[hsl(220_15%_90%)] px-5 py-4 flex flex-col gap-1">
            {navItems.map((item) => (
              <button key={item.id} onClick={() => nav(item.id)}
                className={`text-left px-4 py-3 text-sm font-['Montserrat'] font-semibold rounded-sm ${page === item.id ? "text-[hsl(var(--gold))]" : "text-[hsl(var(--navy)/0.65)]"}`}>
                {item.label}
              </button>
            ))}
            {user ? (
              <button onClick={() => nav("cabinet")} className="mt-2 py-3 btn-navy rounded-sm flex items-center justify-center gap-2">
                <Icon name="User" size={15} />{user.full_name || "Личный кабинет"}
              </button>
            ) : (
              <div className="flex gap-2 mt-2">
                <button onClick={() => nav("login")} className="flex-1 py-3 btn-outline rounded-sm text-xs">Войти</button>
                <button onClick={() => nav("register")} className="flex-1 py-3 btn-navy rounded-sm text-xs">Регистрация</button>
              </div>
            )}
          </div>
        )}
      </header>

      <div className="pt-20">

        {/* ════ HOME ════ */}
        {page === "home" && (
          <>
            <section className="relative min-h-[88vh] flex items-center overflow-hidden light-grid">
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${HERO_IMG})` }}>
                <div className="absolute inset-0 bg-gradient-to-r from-white via-white/92 to-white/50" />
              </div>
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[hsl(var(--navy))]" />
              <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 py-20">
                <div className="max-w-xl flex flex-col items-center text-center">
                  <div className="section-tag mb-6 anim-up"><span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--gold))] inline-block" />B2B поставки · Япония · Корея · Гонконг</div>
                  <h1 className="font-['Montserrat'] font-black leading-[0.95] mb-5 anim-up d1 navy whitespace-nowrap text-center" style={{ fontSize: "clamp(1.7rem, 4vw, 3.4rem)" }}>
                    ПОСТАВКА<br /><span className="text-[hsl(var(--red))]">МАШИНОКОМПЛЕКТОВ</span>
                  </h1>
                  <p className="text-[hsl(var(--navy)/0.55)] text-base leading-relaxed mb-9 anim-up d2">Partcore Logistics поставляет автомобили с азиатских аукционов для разборщиков и автомагазинов. Опт от 3 авто, полное таможенное сопровождение.</p>
                  <div className="flex flex-col sm:flex-row gap-3 anim-up d3 justify-center">
                    <button onClick={() => nav("contacts")} className="px-8 py-3.5 btn-navy rounded-sm">Отправить заявку</button>
                    <button onClick={() => nav("how")} className="px-8 py-3.5 btn-outline rounded-sm">Как мы работаем</button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 mt-12 anim-up d4">
                    {STATS.map(({ num, label }) => (
                      <div key={label} className="border-l-2 border-[hsl(var(--gold))] pl-4">
                        <div className="font-['Montserrat'] font-black text-2xl text-[hsl(var(--navy))] leading-none">{num}</div>
                        <div className="text-[hsl(var(--navy)/0.45)] text-xs mt-1 leading-tight">{label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="py-20 px-5 sm:px-8 max-w-7xl mx-auto">
              <div className="mb-12"><div className="section-tag mb-3">Направления</div><h2 className="font-['Montserrat'] font-black text-4xl sm:text-5xl">ОТКУДА ВЕЗЁМ</h2><div className="divider-navy mt-4" /></div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {ORIGINS.map((o) => (
                  <div key={o.name} className="card-light rounded-sm p-7 group relative overflow-hidden">
                    <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-[hsl(var(--gold))] group-hover:w-full transition-all duration-500" />
                    <div className="text-4xl mb-4">{o.flag}</div>
                    <h3 className="font-['Montserrat'] font-bold text-xl mb-2 navy">{o.name}</h3>
                    <p className="text-[hsl(var(--navy)/0.5)] text-sm leading-relaxed mb-4">{o.desc}</p>
                    <div className="flex items-center gap-2 text-xs font-['Montserrat'] font-semibold gold"><Icon name="Package" size={13} />{o.volume}</div>
                  </div>
                ))}
              </div>
            </section>

            <section className="py-20 px-5 sm:px-8 bg-[hsl(220_25%_97%)]">
              <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
                  <div><div className="section-tag mb-3">Что мы делаем</div><h2 className="font-['Montserrat'] font-black text-4xl sm:text-5xl">УСЛУГИ</h2><div className="divider-navy mt-4" /></div>
                  <button onClick={() => nav("services")} className="flex items-center gap-2 text-[hsl(var(--gold))] text-sm font-['Montserrat'] font-semibold hover:gap-3 transition-all">Подробнее <Icon name="ArrowRight" size={15} /></button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {SERVICES.map((s, i) => (
                    <div key={i} className="card-light rounded-sm p-6 group flex gap-4">
                      <div className="w-10 h-10 rounded-sm bg-[hsl(var(--navy)/0.06)] flex items-center justify-center flex-shrink-0 group-hover:bg-[hsl(var(--navy)/0.12)] transition-colors">
                        <Icon name={s.icon} size={18} className="text-[hsl(var(--navy))]" />
                      </div>
                      <div><h3 className="font-['Montserrat'] font-bold text-sm mb-1.5 navy leading-snug">{s.title}</h3><p className="text-[hsl(var(--navy)/0.48)] text-xs leading-relaxed">{s.desc}</p></div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="py-20 px-5 sm:px-8 max-w-7xl mx-auto">
              <div className="mb-12"><div className="section-tag mb-3">Преимущества</div><h2 className="font-['Montserrat'] font-black text-4xl sm:text-5xl">ПОЧЕМУ МЫ</h2><div className="divider-navy mt-4" /></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {WHY.map((w, i) => (
                  <div key={i} className="card-light rounded-sm p-6 group flex gap-5">
                    <div className="w-11 h-11 rounded-sm bg-[hsl(var(--gold)/0.1)] flex items-center justify-center flex-shrink-0 group-hover:bg-[hsl(var(--gold)/0.18)] transition-colors">
                      <Icon name={w.icon} size={20} className="text-[hsl(var(--gold))]" />
                    </div>
                    <div><h3 className="font-['Montserrat'] font-bold text-base mb-1.5 navy">{w.title}</h3><p className="text-[hsl(var(--navy)/0.5)] text-sm leading-relaxed">{w.desc}</p></div>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-[hsl(var(--navy))] py-20 relative overflow-hidden">
              <div className="absolute inset-0 light-grid opacity-10" />
              <div className="relative max-w-3xl mx-auto px-5 sm:px-8 text-center">
                <div className="section-tag mb-5 justify-center border-[hsl(var(--gold)/0.5)] text-[hsl(var(--gold))]">Начните сотрудничество</div>
                <h2 className="font-['Montserrat'] font-black text-4xl sm:text-5xl text-white mb-4">НУЖНЫ<br /><span className="text-[hsl(var(--gold))]">КОНТРАКТНЫЕ ЗАПЧАСТИ?</span></h2>
                <p className="text-white/55 mb-8">Оставьте заявку — менеджер свяжется в течение 2 часов</p>
                <button onClick={() => nav("contacts")} className="px-10 py-4 btn-gold rounded-sm">Отправить заявку</button>
              </div>
            </section>
          </>
        )}

        {/* ════ SERVICES ════ */}
        {page === "services" && (
          <section className="min-h-screen py-14 px-5 sm:px-8 max-w-7xl mx-auto">
            <div className="mb-12"><div className="section-tag mb-3">Что мы делаем</div><h1 className="font-['Montserrat'] font-black text-4xl sm:text-5xl">УСЛУГИ</h1><div className="divider-navy mt-4" /></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-16">
              {SERVICES.map((s, i) => (
                <div key={i} className="card-light rounded-sm p-7 group flex gap-5">
                  <div className="w-12 h-12 rounded-sm bg-[hsl(var(--navy)/0.06)] flex items-center justify-center flex-shrink-0 group-hover:bg-[hsl(var(--navy)/0.12)] transition-colors">
                    <Icon name={s.icon} size={22} className="text-[hsl(var(--navy))]" />
                  </div>
                  <div><h3 className="font-['Montserrat'] font-bold text-lg mb-2 navy">{s.title}</h3><p className="text-[hsl(var(--navy)/0.5)] text-sm leading-relaxed">{s.desc}</p></div>
                </div>
              ))}
            </div>
            <div className="bg-[hsl(220_25%_97%)] rounded-sm p-8 border border-[hsl(var(--gold)/0.3)] text-center">
              <h3 className="font-['Montserrat'] font-bold text-2xl mb-3 navy">Нужна индивидуальная услуга?</h3>
              <p className="text-[hsl(var(--navy)/0.5)] mb-6 text-sm">Расскажите о своём запросе — найдём решение под ваш бизнес</p>
              <button onClick={() => nav("contacts")} className="px-8 py-3.5 btn-navy rounded-sm">Обсудить задачу</button>
            </div>
          </section>
        )}

        {/* ════ HOW ════ */}
        {page === "how" && (
          <section className="min-h-screen py-14 px-5 sm:px-8 max-w-7xl mx-auto">
            <div className="mb-14"><div className="section-tag mb-3">Процесс</div><h1 className="font-['Montserrat'] font-black text-4xl sm:text-5xl">КАК МЫ РАБОТАЕМ</h1><div className="divider-navy mt-4" /></div>
            <div className="relative max-w-2xl">
              <div className="absolute left-6 top-0 bottom-10 w-px bg-[hsl(var(--navy)/0.12)]" />
              <div className="flex flex-col gap-5">
                {STEPS.map((s, i) => (
                  <div key={i} className="relative flex gap-8 group">
                    <div className="flex-shrink-0 w-12 flex justify-center">
                      <div className="w-12 h-12 bg-[hsl(var(--navy))] flex items-center justify-center font-['Montserrat'] font-black text-white text-sm z-10 relative group-hover:bg-[hsl(var(--gold))] transition-colors rounded-sm">{s.n}</div>
                    </div>
                    <div className="flex-1 card-light rounded-sm px-6 py-5 mb-2">
                      <h3 className="font-['Montserrat'] font-bold text-lg mb-1.5 navy">{s.title}</h3>
                      <p className="text-[hsl(var(--navy)/0.5)] text-sm leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-14"><button onClick={() => nav("contacts")} className="px-10 py-4 btn-navy rounded-sm">Начать сотрудничество</button></div>
          </section>
        )}

        {/* ════ CONTACTS ════ */}
        {page === "contacts" && (
          <section className="min-h-screen py-14 px-5 sm:px-8 max-w-7xl mx-auto">
            <div className="mb-12"><div className="section-tag mb-3">Связь</div><h1 className="font-['Montserrat'] font-black text-4xl sm:text-5xl">ОСТАВИТЬ ЗАЯВКУ</h1><div className="divider-navy mt-4" /></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="card-light rounded-sm p-8">
                {contactSent ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-14 h-14 rounded-sm bg-[hsl(var(--gold)/0.1)] flex items-center justify-center mb-5"><Icon name="CheckCircle" size={30} className="text-[hsl(var(--gold))]" /></div>
                    <h3 className="font-['Montserrat'] font-bold text-2xl mb-2 navy">Заявка принята!</h3>
                    <p className="text-[hsl(var(--navy)/0.5)] text-sm">Менеджер свяжется с вами в течение 2 рабочих часов</p>
                    <button onClick={() => setContactSent(false)} className="mt-6 text-[hsl(var(--gold))] text-sm hover:underline font-['Montserrat'] font-semibold">Отправить ещё заявку</button>
                  </div>
                ) : (
                  <form onSubmit={(e) => { e.preventDefault(); setContactSent(true); }} className="flex flex-col gap-5">
                    <div><h2 className="font-['Montserrat'] font-bold text-xl mb-1 navy">Заявка на поставку</h2><p className="text-[hsl(var(--navy)/0.45)] text-sm">Для разборщиков и автомагазинов. Ответим за 2 часа.</p></div>
                    {[
                      { key: "name", label: "Контактное лицо *", placeholder: "Иван Петров", type: "text", required: true },
                      { key: "company", label: "Компания / ИП", placeholder: "ООО «АвтоРазбор»", type: "text", required: false },
                      { key: "phone", label: "Телефон *", placeholder: "+7 (___) ___-__-__", type: "tel", required: true },
                    ].map((f) => (
                      <div key={f.key}>
                        <label className="block text-[hsl(var(--navy)/0.5)] text-xs font-['Montserrat'] font-semibold tracking-widest uppercase mb-2">{f.label}</label>
                        <input required={f.required} type={f.type} placeholder={f.placeholder} value={contactForm[f.key as keyof typeof contactForm]} onChange={(e) => setContactForm({ ...contactForm, [f.key]: e.target.value })} className={inputCls} />
                      </div>
                    ))}
                    <div>
                      <label className="block text-[hsl(var(--navy)/0.5)] text-xs font-['Montserrat'] font-semibold tracking-widest uppercase mb-2">Комментарий</label>
                      <textarea rows={3} value={contactForm.comment} onChange={(e) => setContactForm({ ...contactForm, comment: e.target.value })} placeholder="Марки, объём, бюджет..." className={inputCls + " resize-none"} />
                    </div>
                    <button type="submit" className="w-full py-4 btn-navy rounded-sm">Отправить заявку</button>
                  </form>
                )}
              </div>
              <div className="flex flex-col gap-5">
                <div className="card-light rounded-sm p-6">
                  <h3 className="font-['Montserrat'] font-bold text-base mb-5 navy uppercase tracking-wider">Контакты</h3>
                  <div className="flex flex-col gap-5">
                    {[{ icon: "Phone", label: "Телефон", val: "+7 (800) 555-00-00", sub: "Бесплатно по России" }, { icon: "Mail", label: "Email", val: "info@partcore.ru", sub: "Для коммерческих запросов" }, { icon: "MessageCircle", label: "Telegram / WhatsApp", val: "@partcore_log", sub: "Ответим в течение 15 мин" }, { icon: "MapPin", label: "Офис", val: "Москва, Складская ул., 7", sub: "Пн–Пт 9:00–18:00" }].map((c) => (
                      <div key={c.label} className="flex items-start gap-4">
                        <div className="w-9 h-9 bg-[hsl(var(--navy)/0.07)] flex items-center justify-center flex-shrink-0 rounded-sm"><Icon name={c.icon} size={16} className="text-[hsl(var(--navy))]" /></div>
                        <div><div className="text-[hsl(var(--navy)/0.4)] text-xs font-['Montserrat'] font-semibold tracking-wide uppercase">{c.label}</div><div className="text-[hsl(var(--navy))] font-medium text-sm mt-0.5">{c.val}</div><div className="text-[hsl(var(--navy)/0.35)] text-xs">{c.sub}</div></div>
                      </div>
                    ))}
                  </div>
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
                <h1 className="font-['Montserrat'] font-black text-3xl navy mb-2">Вход в кабинет</h1>
                <p className="text-[hsl(var(--navy)/0.5)] text-sm">Введите email и пароль для входа</p>
              </div>
              <div className="card-light rounded-sm p-8">
                <form onSubmit={doLogin} className="flex flex-col gap-5">
                  {authError && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-sm">{authError}</div>}
                  <div>
                    <label className="block text-[hsl(var(--navy)/0.5)] text-xs font-['Montserrat'] font-semibold tracking-widest uppercase mb-2">Email *</label>
                    <input required type="email" placeholder="you@example.com" value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-[hsl(var(--navy)/0.5)] text-xs font-['Montserrat'] font-semibold tracking-widest uppercase mb-2">Пароль *</label>
                    <input required type="password" placeholder="••••••••" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} className={inputCls} />
                  </div>
                  <button type="submit" disabled={authLoading} className="w-full py-3.5 btn-navy rounded-sm disabled:opacity-60">
                    {authLoading ? "Входим..." : "Войти"}
                  </button>
                </form>
                <div className="text-center mt-5 text-sm text-[hsl(var(--navy)/0.5)]">
                  Нет аккаунта?{" "}
                  <button onClick={() => nav("register")} className="text-[hsl(var(--gold))] font-semibold hover:underline">Зарегистрироваться</button>
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
                <h1 className="font-['Montserrat'] font-black text-3xl navy mb-2">Регистрация</h1>
                <p className="text-[hsl(var(--navy)/0.5)] text-sm">Создайте аккаунт для доступа к личному кабинету</p>
              </div>
              <div className="card-light rounded-sm p-8">
                <form onSubmit={doRegister} className="flex flex-col gap-4">
                  {authError && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-sm">{authError}</div>}
                  {[
                    { key: "full_name", label: "Ваше имя *", placeholder: "Иван Петров", type: "text", required: true },
                    { key: "email", label: "Email *", placeholder: "you@example.com", type: "email", required: true },
                    { key: "phone", label: "Телефон", placeholder: "+7 (___) ___-__-__", type: "tel", required: false },
                    { key: "company", label: "Компания / ИП", placeholder: "ООО «АвтоРазбор»", type: "text", required: false },
                    { key: "password", label: "Пароль * (мин. 6 символов)", placeholder: "••••••••", type: "password", required: true },
                  ].map((f) => (
                    <div key={f.key}>
                      <label className="block text-[hsl(var(--navy)/0.5)] text-xs font-['Montserrat'] font-semibold tracking-widest uppercase mb-2">{f.label}</label>
                      <input required={f.required} type={f.type} placeholder={f.placeholder} value={regForm[f.key as keyof typeof regForm]} onChange={(e) => setRegForm({ ...regForm, [f.key]: e.target.value })} className={inputCls} />
                    </div>
                  ))}
                  <button type="submit" disabled={authLoading} className="w-full py-3.5 btn-navy rounded-sm disabled:opacity-60 mt-1">
                    {authLoading ? "Регистрируем..." : "Зарегистрироваться"}
                  </button>
                </form>
                <div className="text-center mt-5 text-sm text-[hsl(var(--navy)/0.5)]">
                  Уже есть аккаунт?{" "}
                  <button onClick={() => nav("login")} className="text-[hsl(var(--gold))] font-semibold hover:underline">Войти</button>
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
                <Icon name="Lock" size={40} className="mx-auto mb-4 text-[hsl(var(--navy)/0.3)]" />
                <p className="font-['Montserrat'] font-bold navy mb-4">Для доступа необходимо войти</p>
                <button onClick={() => nav("login")} className="px-6 py-3 btn-navy rounded-sm">Войти</button>
              </div>
            </div>
          ) : (
            <div className="min-h-screen max-w-7xl mx-auto px-5 sm:px-8 py-8">
              {/* Cabinet header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                  <div className="section-tag mb-2">Личный кабинет</div>
                  <h1 className="font-['Montserrat'] font-black text-3xl navy">
                    {user.full_name || user.email}
                  </h1>
                  {user.company && <p className="text-[hsl(var(--navy)/0.45)] text-sm mt-0.5">{user.company}</p>}
                </div>
                <button onClick={doLogout} className="flex items-center gap-2 px-4 py-2 border border-[hsl(220_15%_88%)] text-[hsl(var(--navy)/0.5)] text-sm font-['Montserrat'] font-semibold hover:text-red-600 hover:border-red-200 transition-all rounded-sm">
                  <Icon name="LogOut" size={15} />Выйти
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 flex-wrap mb-8 border-b border-[hsl(220_15%_88%)]">
                {([
                  { id: "orders", label: "Мои заявки", icon: "ClipboardList" },
                  { id: "new_order", label: "Новая заявка", icon: "Plus" },
                  { id: "auctions", label: "Аукционы", icon: "Globe" },
                  { id: "documents", label: "Документы", icon: "FileText" },
                  { id: "profile", label: "Профиль", icon: "User" },
                ] as { id: CabinetTab; label: string; icon: string }[]).map((t) => (
                  <button key={t.id} onClick={() => setCabinetTab(t.id)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-['Montserrat'] font-semibold border-b-2 transition-all ${cabinetTab === t.id ? "border-[hsl(var(--navy))] text-[hsl(var(--navy))]" : "border-transparent text-[hsl(var(--navy)/0.45)] hover:text-[hsl(var(--navy))]"}`}>
                    <Icon name={t.icon} size={15} />{t.label}
                  </button>
                ))}
              </div>

              {/* ── Мои заявки ── */}
              {cabinetTab === "orders" && (
                <div>
                  {ordersLoading ? (
                    <div className="flex items-center gap-3 py-16 justify-center text-[hsl(var(--navy)/0.4)]">
                      <Icon name="Loader" size={20} className="animate-spin" />Загружаем заявки...
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-16">
                      <Icon name="ClipboardList" size={40} className="mx-auto mb-4 text-[hsl(var(--navy)/0.2)]" />
                      <p className="font-['Montserrat'] font-bold navy mb-2">Заявок пока нет</p>
                      <p className="text-[hsl(var(--navy)/0.45)] text-sm mb-6">Создайте первую заявку на подбор автомобилей</p>
                      <button onClick={() => setCabinetTab("new_order")} className="px-6 py-3 btn-navy rounded-sm">Создать заявку</button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {orders.map((o) => (
                        <div key={o.id} className="card-light rounded-sm p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-[hsl(var(--navy)/0.06)] rounded-sm flex items-center justify-center flex-shrink-0">
                              <Icon name="Car" size={18} className="text-[hsl(var(--navy))]" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-['Montserrat'] font-bold text-sm navy">{o.order_number}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_COLOR[o.status] || "bg-gray-100 text-gray-600"}`}>{o.status_label}</span>
                              </div>
                              <div className="text-[hsl(var(--navy)/0.6)] text-sm mt-0.5">
                                {[o.car_brand, o.car_model, o.car_year].filter(Boolean).join(" ")} · {o.origin}
                              </div>
                              <div className="text-[hsl(var(--navy)/0.35)] text-xs mt-1">
                                {o.quantity} шт.{o.budget ? ` · до ${o.budget.toLocaleString()} ₽` : ""} · {new Date(o.created_at).toLocaleDateString("ru")}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
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
                      <h3 className="font-['Montserrat'] font-bold text-xl navy mb-2">Заявка создана!</h3>
                      <p className="text-[hsl(var(--navy)/0.5)] text-sm">Переходим к списку заявок...</p>
                    </div>
                  ) : (
                    <form onSubmit={doNewOrder} className="card-light rounded-sm p-7 flex flex-col gap-5">
                      <div><h2 className="font-['Montserrat'] font-bold text-xl navy mb-1">Новая заявка на подбор</h2><p className="text-[hsl(var(--navy)/0.45)] text-sm">Укажите параметры — менеджер подберёт варианты</p></div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[hsl(var(--navy)/0.5)] text-xs font-['Montserrat'] font-semibold tracking-widest uppercase mb-2">Марка *</label>
                          <input required placeholder="Toyota" value={newOrderForm.car_brand} onChange={(e) => setNewOrderForm({ ...newOrderForm, car_brand: e.target.value })} className={inputCls} />
                        </div>
                        <div>
                          <label className="block text-[hsl(var(--navy)/0.5)] text-xs font-['Montserrat'] font-semibold tracking-widest uppercase mb-2">Модель</label>
                          <input placeholder="Camry" value={newOrderForm.car_model} onChange={(e) => setNewOrderForm({ ...newOrderForm, car_model: e.target.value })} className={inputCls} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[hsl(var(--navy)/0.5)] text-xs font-['Montserrat'] font-semibold tracking-widest uppercase mb-2">Год</label>
                          <input placeholder="2018" value={newOrderForm.car_year} onChange={(e) => setNewOrderForm({ ...newOrderForm, car_year: e.target.value })} className={inputCls} />
                        </div>
                        <div>
                          <label className="block text-[hsl(var(--navy)/0.5)] text-xs font-['Montserrat'] font-semibold tracking-widest uppercase mb-2">Кол-во шт.</label>
                          <input type="number" min="1" value={newOrderForm.quantity} onChange={(e) => setNewOrderForm({ ...newOrderForm, quantity: e.target.value })} className={inputCls} />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[hsl(var(--navy)/0.5)] text-xs font-['Montserrat'] font-semibold tracking-widest uppercase mb-2">Направление</label>
                        <select value={newOrderForm.origin} onChange={(e) => setNewOrderForm({ ...newOrderForm, origin: e.target.value })} className={inputCls}>
                          <option>Япония</option><option>Корея</option><option>Гонконг</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[hsl(var(--navy)/0.5)] text-xs font-['Montserrat'] font-semibold tracking-widest uppercase mb-2">Бюджет за ед., ₽</label>
                        <input placeholder="300000" value={newOrderForm.budget} onChange={(e) => setNewOrderForm({ ...newOrderForm, budget: e.target.value })} className={inputCls} />
                      </div>
                      <div>
                        <label className="block text-[hsl(var(--navy)/0.5)] text-xs font-['Montserrat'] font-semibold tracking-widest uppercase mb-2">Комментарий</label>
                        <textarea rows={3} placeholder="Доп. требования к комплектации, состоянию..." value={newOrderForm.comment} onChange={(e) => setNewOrderForm({ ...newOrderForm, comment: e.target.value })} className={inputCls + " resize-none"} />
                      </div>
                      <button type="submit" className="w-full py-3.5 btn-navy rounded-sm">Создать заявку</button>
                    </form>
                  )}
                </div>
              )}

              {/* ── Аукционы ── */}
              {cabinetTab === "auctions" && (
                <div>
                  <div className="mb-6">
                    <h2 className="font-['Montserrat'] font-black text-2xl navy mb-2">Японские аукционы</h2>
                    <p className="text-[hsl(var(--navy)/0.5)] text-sm">Прямой доступ к крупнейшим аукционным площадкам Японии и Кореи</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { name: "USS Auction", country: "🇯🇵", desc: "Крупнейший аукцион Японии. Более 20 000 лотов еженедельно.", url: "https://www.uss-auction.jp", tag: "Топ-1 Япония" },
                      { name: "JU Auction", country: "🇯🇵", desc: "Японский аукцион с широким выбором битых и страховых авто.", url: "https://www.ju-auction.jp", tag: "Битые авто" },
                      { name: "TAA Auction", country: "🇯🇵", desc: "Toyota Automobile Auction — официальная площадка Toyota.", url: "https://www.taa.gr.jp", tag: "Toyota Official" },
                      { name: "HAA Auction", country: "🇯🇵", desc: "Honda Auto Auction — специализация на Honda и Acura.", url: "https://www.honda.co.jp", tag: "Honda Official" },
                      { name: "Kcaa Auction", country: "🇰🇷", desc: "Крупнейший аукцион Кореи. Hyundai, Kia, Ssangyong.", url: "https://www.kcaa.or.kr", tag: "Топ-1 Корея" },
                      { name: "Manheim Korea", country: "🇰🇷", desc: "Международная платформа с широкой базой корейских авто.", url: "https://korea.manheim.com", tag: "Международный" },
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
                        <p className="text-[hsl(var(--navy)/0.5)] text-sm leading-relaxed">{a.desc}</p>
                        <div className="flex items-center gap-1.5 text-[hsl(var(--gold))] text-xs font-['Montserrat'] font-semibold group-hover:gap-2.5 transition-all">
                          Перейти на аукцион <Icon name="ExternalLink" size={13} />
                        </div>
                      </a>
                    ))}
                  </div>
                  <div className="mt-6 p-4 bg-[hsl(220_25%_97%)] rounded-sm border border-[hsl(var(--gold)/0.3)] flex items-start gap-3">
                    <Icon name="Info" size={16} className="text-[hsl(var(--gold))] flex-shrink-0 mt-0.5" />
                    <p className="text-[hsl(var(--navy)/0.6)] text-sm">Наши менеджеры могут участвовать в торгах от вашего имени. <button onClick={() => setCabinetTab("new_order")} className="text-[hsl(var(--gold))] font-semibold hover:underline">Создайте заявку</button> — мы найдём нужный лот.</p>
                  </div>
                </div>
              )}

              {/* ── Документы ── */}
              {cabinetTab === "documents" && (
                <div>
                  <div className="mb-6"><h2 className="font-['Montserrat'] font-black text-2xl navy mb-2">Документы</h2><p className="text-[hsl(var(--navy)/0.5)] text-sm">Загрузите необходимые документы для оформления поставки</p></div>
                  <div className="max-w-lg">
                    <div className="card-light rounded-sm p-8 border-2 border-dashed border-[hsl(220_15%_85%)] text-center mb-5">
                      <Icon name="Upload" size={32} className="mx-auto mb-3 text-[hsl(var(--navy)/0.25)]" />
                      <p className="font-['Montserrat'] font-semibold navy mb-1">Загрузить документ</p>
                      <p className="text-[hsl(var(--navy)/0.4)] text-xs mb-4">PDF, JPG, PNG — до 10 МБ</p>
                      <button className="px-5 py-2.5 btn-navy rounded-sm text-xs">Выбрать файл</button>
                    </div>
                    <div className="text-center py-8 text-[hsl(var(--navy)/0.35)]">
                      <Icon name="FileText" size={32} className="mx-auto mb-3 opacity-40" />
                      <p className="text-sm">Документов пока нет</p>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Профиль ── */}
              {cabinetTab === "profile" && (
                <div className="max-w-lg">
                  <form onSubmit={doSaveProfile} className="card-light rounded-sm p-7 flex flex-col gap-5">
                    <div><h2 className="font-['Montserrat'] font-bold text-xl navy mb-1">Редактировать профиль</h2><p className="text-[hsl(var(--navy)/0.45)] text-sm">Email: {user.email}</p></div>
                    {profileSaved && <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-sm flex items-center gap-2"><Icon name="Check" size={15} />Профиль сохранён</div>}
                    {[
                      { key: "full_name", label: "Полное имя", placeholder: "Иван Петров" },
                      { key: "phone", label: "Телефон", placeholder: "+7 (___) ___-__-__" },
                      { key: "company", label: "Компания / ИП", placeholder: "ООО «АвтоРазбор»" },
                      { key: "inn", label: "ИНН", placeholder: "1234567890" },
                    ].map((f) => (
                      <div key={f.key}>
                        <label className="block text-[hsl(var(--navy)/0.5)] text-xs font-['Montserrat'] font-semibold tracking-widest uppercase mb-2">{f.label}</label>
                        <input placeholder={f.placeholder} value={profileForm[f.key as keyof typeof profileForm]} onChange={(e) => setProfileForm({ ...profileForm, [f.key]: e.target.value })} className={inputCls} />
                      </div>
                    ))}
                    <button type="submit" className="w-full py-3.5 btn-navy rounded-sm">Сохранить изменения</button>
                  </form>
                </div>
              )}
            </div>
          )
        )}

        {/* FOOTER */}
        <footer className="border-t border-[hsl(220_15%_88%)] py-8 px-5 sm:px-8 mt-8 bg-white">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <button onClick={() => nav("home")}><img src={LOGO} alt="Partcore Logistics" className="h-10 w-36 object-cover object-left" style={{ objectPosition: "10% center", transform: "scale(1.15)", transformOrigin: "left center" }} /></button>
            <div className="text-[hsl(var(--navy)/0.35)] text-xs text-center">© 2024 Partcore Logistics. Поставка авто под разборку.</div>
            <div className="flex gap-5 flex-wrap justify-center">
              {navItems.map((item) => (
                <button key={item.id} onClick={() => nav(item.id)} className="text-xs text-[hsl(var(--navy)/0.4)] hover:text-[hsl(var(--navy))] transition-colors font-['Montserrat'] font-medium">{item.label}</button>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
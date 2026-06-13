import { useState } from "react";
import Icon from "@/components/ui/icon";

const LOGO = "https://cdn.poehali.dev/projects/92e249db-e174-4ab7-8e64-42d927b13e30/bucket/892f391f-a7d5-48a5-92ab-0fda67f800fc.jpg";
const HERO_IMG = "https://cdn.poehali.dev/projects/92e249db-e174-4ab7-8e64-42d927b13e30/files/c8bb52fe-b883-423d-8dc9-08554e20076d.jpg";

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
  { num: "1 200+", label: "Авто поставлено" },
  { num: "8 лет", label: "На рынке" },
  { num: "3", label: "Страны отправки" },
  { num: "40–55", label: "Дней — срок доставки" },
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

const REVIEWS = [
  { name: "Алексей В.", company: "АвтоРазбор Сибирь", text: "Работаем с Partcore уже 4 года. Стабильные поставки из Японии, ни разу не подвели по срокам. Качество подборки — на уровне.", stars: 5 },
  { name: "Максим Т.", company: "ООО «Запчасти Юг»", text: "Начали с тестовой партии в 5 авто из Кореи. Сейчас берём от 15 штук в месяц. Реальные цены, нет скрытых комиссий.", stars: 5 },
  { name: "Дмитрий Н.", company: "ИП Николаев, Екатеринбург", text: "Подобрали 10 Hyundai по нашему ТЗ за 2 недели. Все с нужными агрегатами. Документы оформили без нашего участия.", stars: 5 },
];

const BRANDS = [
  "Toyota", "Lexus", "Honda", "Nissan", "Mazda", "Mitsubishi", "Subaru",
  "Hyundai", "Kia", "Ssangyong", "BMW", "Mercedes-Benz", "Audi", "Volkswagen",
];

type Page = "home" | "services" | "how" | "reviews" | "contacts";

export default function Index() {
  const [page, setPage] = useState<Page>("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [form, setForm] = useState({ name: "", company: "", phone: "", comment: "" });
  const [sent, setSent] = useState(false);

  const navItems: { id: Page; label: string }[] = [
    { id: "home", label: "Главная" },
    { id: "services", label: "Услуги" },
    { id: "how", label: "Как работаем" },
    { id: "reviews", label: "Отзывы" },
    { id: "contacts", label: "Контакты" },
  ];

  const nav = (p: Page) => {
    setPage(p);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
              <button
                key={item.id}
                onClick={() => nav(item.id)}
                className={`px-4 py-2 text-sm font-['Montserrat'] font-semibold transition-all rounded-sm ${
                  page === item.id
                    ? "text-[hsl(var(--gold))] bg-[hsl(36_85%_50%/0.07)]"
                    : "text-[hsl(var(--navy)/0.6)] hover:text-[hsl(var(--navy))] hover:bg-[hsl(220_52%_18%/0.05)]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <a href="tel:+78005550000" className="text-sm text-[hsl(var(--navy)/0.6)] hover:text-[hsl(var(--navy))] transition-colors font-medium">
              +7 (800) 555-00-00
            </a>
            <button
              onClick={() => nav("contacts")}
              className="px-5 py-2 btn-navy rounded-sm"
            >
              Заявка
            </button>
          </div>

          <button className="md:hidden text-[hsl(var(--navy))]" onClick={() => setMenuOpen(!menuOpen)}>
            <Icon name={menuOpen ? "X" : "Menu"} size={22} />
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-white border-t border-[hsl(220_15%_90%)] px-5 py-4 flex flex-col gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => nav(item.id)}
                className={`text-left px-4 py-3 text-sm font-['Montserrat'] font-semibold rounded-sm ${
                  page === item.id ? "text-[hsl(var(--gold))]" : "text-[hsl(var(--navy)/0.65)]"
                }`}
              >
                {item.label}
              </button>
            ))}
            <button onClick={() => nav("contacts")} className="mt-2 py-3 btn-navy rounded-sm">
              Оставить заявку
            </button>
          </div>
        )}
      </header>

      <div className="pt-20">

        {/* ════ HOME ════ */}
        {page === "home" && (
          <>
            {/* HERO */}
            <section className="relative min-h-[88vh] flex items-center overflow-hidden light-grid">
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${HERO_IMG})` }}>
                <div className="absolute inset-0 bg-gradient-to-r from-white via-white/92 to-white/50" />
              </div>
              {/* Left navy accent */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[hsl(var(--navy))]" />

              <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 py-20">
                <div className="max-w-xl">
                  <div className="section-tag mb-6 anim-up">
                    <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--gold))] inline-block" />
                    B2B поставки · Япония · Корея · Гонконг
                  </div>

                  <h1
                    className="font-['Montserrat'] font-black leading-[0.95] mb-5 anim-up d1 navy"
                    style={{ fontSize: "clamp(2.6rem, 6vw, 4.8rem)" }}
                  >
                    АВТО ПОД<br />
                    <span className="text-[hsl(var(--red))]">РАЗБОРКУ</span><br />
                    ДЛЯ БИЗНЕСА
                  </h1>

                  <p className="text-[hsl(var(--navy)/0.55)] text-base leading-relaxed mb-9 anim-up d2">
                    Partcore Logistics поставляет автомобили с азиатских аукционов
                    для разборщиков и автомагазинов. Опт от 3 авто,
                    полное таможенное сопровождение.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3 anim-up d3">
                    <button onClick={() => nav("contacts")} className="px-8 py-3.5 btn-navy rounded-sm">
                      Отправить заявку
                    </button>
                    <button onClick={() => nav("how")} className="px-8 py-3.5 btn-outline rounded-sm">
                      Как мы работаем
                    </button>
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

            {/* MARQUEE — navy bg */}
            <div className="bg-[hsl(var(--navy))] py-3 overflow-hidden">
              <div className="flex marquee whitespace-nowrap">
                {[...BRANDS, ...BRANDS].map((b, i) => (
                  <span key={i} className="text-white font-['Montserrat'] font-bold text-xs tracking-[0.18em] uppercase px-5">
                    {b} <span className="opacity-30 mx-1">◆</span>
                  </span>
                ))}
              </div>
            </div>

            {/* ORIGINS */}
            <section className="py-20 px-5 sm:px-8 max-w-7xl mx-auto">
              <div className="mb-12">
                <div className="section-tag mb-3">Направления</div>
                <h2 className="font-['Montserrat'] font-black text-4xl sm:text-5xl">ОТКУДА ВЕЗЁМ</h2>
                <div className="divider-navy mt-4" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {ORIGINS.map((o) => (
                  <div key={o.name} className="card-light rounded-sm p-7 group relative overflow-hidden">
                    <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-[hsl(var(--gold))] group-hover:w-full transition-all duration-500" />
                    <div className="text-4xl mb-4">{o.flag}</div>
                    <h3 className="font-['Montserrat'] font-bold text-xl mb-2 navy">{o.name}</h3>
                    <p className="text-[hsl(var(--navy)/0.5)] text-sm leading-relaxed mb-4">{o.desc}</p>
                    <div className="flex items-center gap-2 text-xs font-['Montserrat'] font-semibold gold">
                      <Icon name="Package" size={13} />
                      {o.volume}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* SERVICES */}
            <section className="py-20 px-5 sm:px-8 bg-[hsl(220_25%_97%)]">
              <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
                  <div>
                    <div className="section-tag mb-3">Что мы делаем</div>
                    <h2 className="font-['Montserrat'] font-black text-4xl sm:text-5xl">УСЛУГИ</h2>
                    <div className="divider-navy mt-4" />
                  </div>
                  <button
                    onClick={() => nav("services")}
                    className="flex items-center gap-2 text-[hsl(var(--gold))] text-sm font-['Montserrat'] font-semibold hover:gap-3 transition-all"
                  >
                    Подробнее <Icon name="ArrowRight" size={15} />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {SERVICES.map((s, i) => (
                    <div key={i} className="card-light rounded-sm p-6 group flex gap-4">
                      <div className="w-10 h-10 rounded-sm bg-[hsl(var(--navy)/0.06)] flex items-center justify-center flex-shrink-0 group-hover:bg-[hsl(var(--navy)/0.12)] transition-colors">
                        <Icon name={s.icon} size={18} className="text-[hsl(var(--navy))]" />
                      </div>
                      <div>
                        <h3 className="font-['Montserrat'] font-bold text-sm mb-1.5 navy leading-snug">{s.title}</h3>
                        <p className="text-[hsl(var(--navy)/0.48)] text-xs leading-relaxed">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* WHY */}
            <section className="py-20 px-5 sm:px-8 max-w-7xl mx-auto">
              <div className="mb-12">
                <div className="section-tag mb-3">Преимущества</div>
                <h2 className="font-['Montserrat'] font-black text-4xl sm:text-5xl">ПОЧЕМУ МЫ</h2>
                <div className="divider-navy mt-4" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {WHY.map((w, i) => (
                  <div key={i} className="card-light rounded-sm p-6 group flex gap-5">
                    <div className="w-11 h-11 rounded-sm bg-[hsl(var(--gold)/0.1)] flex items-center justify-center flex-shrink-0 group-hover:bg-[hsl(var(--gold)/0.18)] transition-colors">
                      <Icon name={w.icon} size={20} className="text-[hsl(var(--gold))]" />
                    </div>
                    <div>
                      <h3 className="font-['Montserrat'] font-bold text-base mb-1.5 navy">{w.title}</h3>
                      <p className="text-[hsl(var(--navy)/0.5)] text-sm leading-relaxed">{w.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* CTA */}
            <section className="bg-[hsl(var(--navy))] py-20 relative overflow-hidden">
              <div className="absolute inset-0 light-grid opacity-10" />
              <div className="relative max-w-3xl mx-auto px-5 sm:px-8 text-center">
                <div className="section-tag mb-5 justify-center border-[hsl(var(--gold)/0.5)] text-[hsl(var(--gold))]">
                  Начните сотрудничество
                </div>
                <h2 className="font-['Montserrat'] font-black text-4xl sm:text-5xl text-white mb-4">
                  НУЖНЫ АВТО<br />
                  <span className="text-[hsl(var(--gold))]">ПОД РАЗБОРКУ?</span>
                </h2>
                <p className="text-white/55 mb-8">Оставьте заявку — менеджер свяжется в течение 2 часов</p>
                <button onClick={() => nav("contacts")} className="px-10 py-4 btn-gold rounded-sm">
                  Отправить заявку
                </button>
              </div>
            </section>
          </>
        )}

        {/* ════ SERVICES ════ */}
        {page === "services" && (
          <section className="min-h-screen py-14 px-5 sm:px-8 max-w-7xl mx-auto">
            <div className="mb-12">
              <div className="section-tag mb-3">Что мы делаем</div>
              <h1 className="font-['Montserrat'] font-black text-4xl sm:text-5xl">УСЛУГИ</h1>
              <div className="divider-navy mt-4" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-16">
              {SERVICES.map((s, i) => (
                <div key={i} className="card-light rounded-sm p-7 group flex gap-5">
                  <div className="w-12 h-12 rounded-sm bg-[hsl(var(--navy)/0.06)] flex items-center justify-center flex-shrink-0 group-hover:bg-[hsl(var(--navy)/0.12)] transition-colors">
                    <Icon name={s.icon} size={22} className="text-[hsl(var(--navy))]" />
                  </div>
                  <div>
                    <h3 className="font-['Montserrat'] font-bold text-lg mb-2 navy">{s.title}</h3>
                    <p className="text-[hsl(var(--navy)/0.5)] text-sm leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-[hsl(220_25%_97%)] rounded-sm p-8 border border-[hsl(var(--gold)/0.3)] text-center">
              <h3 className="font-['Montserrat'] font-bold text-2xl mb-3 navy">Нужна индивидуальная услуга?</h3>
              <p className="text-[hsl(var(--navy)/0.5)] mb-6 text-sm">Расскажите о своём запросе — найдём решение под ваш бизнес</p>
              <button onClick={() => nav("contacts")} className="px-8 py-3.5 btn-navy rounded-sm">
                Обсудить задачу
              </button>
            </div>
          </section>
        )}

        {/* ════ HOW ════ */}
        {page === "how" && (
          <section className="min-h-screen py-14 px-5 sm:px-8 max-w-7xl mx-auto">
            <div className="mb-14">
              <div className="section-tag mb-3">Процесс</div>
              <h1 className="font-['Montserrat'] font-black text-4xl sm:text-5xl">КАК МЫ РАБОТАЕМ</h1>
              <div className="divider-navy mt-4" />
            </div>

            <div className="relative max-w-2xl">
              <div className="absolute left-6 top-0 bottom-10 w-px bg-[hsl(var(--navy)/0.12)]" />
              <div className="flex flex-col gap-5">
                {STEPS.map((s, i) => (
                  <div key={i} className="relative flex gap-8 group">
                    <div className="flex-shrink-0 w-12 flex justify-center">
                      <div
                        className="w-12 h-12 bg-[hsl(var(--navy))] flex items-center justify-center font-['Montserrat'] font-black text-white text-sm z-10 relative group-hover:bg-[hsl(var(--gold))] transition-colors"
                        style={{ borderRadius: 2 }}
                      >
                        {s.n}
                      </div>
                    </div>
                    <div className="flex-1 card-light rounded-sm px-6 py-5 mb-2">
                      <h3 className="font-['Montserrat'] font-bold text-lg mb-1.5 navy">{s.title}</h3>
                      <p className="text-[hsl(var(--navy)/0.5)] text-sm leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
              {ORIGINS.map((o) => (
                <div key={o.name} className="card-light rounded-sm p-5 flex items-center gap-4">
                  <span className="text-2xl">{o.flag}</span>
                  <div>
                    <div className="font-['Montserrat'] font-bold text-sm navy">{o.name}</div>
                    <div className="text-[hsl(var(--navy)/0.4)] text-xs mt-0.5">{o.volume}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-14">
              <button onClick={() => nav("contacts")} className="px-10 py-4 btn-navy rounded-sm">
                Начать сотрудничество
              </button>
            </div>
          </section>
        )}

        {/* ════ REVIEWS ════ */}
        {page === "reviews" && (
          <section className="min-h-screen py-14 px-5 sm:px-8 max-w-7xl mx-auto">
            <div className="mb-12">
              <div className="section-tag mb-3">Клиенты</div>
              <h1 className="font-['Montserrat'] font-black text-4xl sm:text-5xl">ОТЗЫВЫ ПАРТНЁРОВ</h1>
              <div className="divider-navy mt-4" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-14">
              {REVIEWS.map((r, i) => (
                <div key={i} className="card-light rounded-sm p-6 flex flex-col gap-4 relative overflow-hidden">
                  <div className="absolute top-0 inset-x-0 h-1 bg-[hsl(var(--gold))]" />
                  <div className="flex gap-0.5 pt-1">
                    {Array.from({ length: r.stars }).map((_, j) => (
                      <span key={j} className="text-[hsl(var(--gold))] text-sm">★</span>
                    ))}
                  </div>
                  <p className="text-[hsl(var(--navy)/0.6)] text-sm leading-relaxed flex-1">«{r.text}»</p>
                  <div>
                    <div className="font-['Montserrat'] font-bold text-sm navy">{r.name}</div>
                    <div className="text-[hsl(var(--navy)/0.38)] text-xs mt-0.5">{r.company}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-[hsl(220_25%_97%)] rounded-sm p-8 border border-[hsl(220_15%_88%)] grid grid-cols-2 sm:grid-cols-4 gap-8 text-center mb-12">
              {STATS.map(({ num, label }) => (
                <div key={label}>
                  <div className="font-['Montserrat'] font-black text-3xl text-[hsl(var(--navy))]">{num}</div>
                  <div className="text-[hsl(var(--navy)/0.4)] text-xs mt-1.5">{label}</div>
                </div>
              ))}
            </div>

            <button onClick={() => nav("contacts")} className="px-10 py-4 btn-navy rounded-sm">
              Стать партнёром
            </button>
          </section>
        )}

        {/* ════ CONTACTS ════ */}
        {page === "contacts" && (
          <section className="min-h-screen py-14 px-5 sm:px-8 max-w-7xl mx-auto">
            <div className="mb-12">
              <div className="section-tag mb-3">Связь</div>
              <h1 className="font-['Montserrat'] font-black text-4xl sm:text-5xl">ОСТАВИТЬ ЗАЯВКУ</h1>
              <div className="divider-navy mt-4" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* FORM */}
              <div className="card-light rounded-sm p-8">
                {sent ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-14 h-14 rounded-sm bg-[hsl(var(--gold)/0.1)] flex items-center justify-center mb-5">
                      <Icon name="CheckCircle" size={30} className="text-[hsl(var(--gold))]" />
                    </div>
                    <h3 className="font-['Montserrat'] font-bold text-2xl mb-2 navy">Заявка принята!</h3>
                    <p className="text-[hsl(var(--navy)/0.5)] text-sm">Менеджер свяжется с вами в течение 2 рабочих часов</p>
                    <button
                      onClick={() => setSent(false)}
                      className="mt-6 text-[hsl(var(--gold))] text-sm hover:underline font-['Montserrat'] font-semibold"
                    >
                      Отправить ещё заявку
                    </button>
                  </div>
                ) : (
                  <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="flex flex-col gap-5">
                    <div>
                      <h2 className="font-['Montserrat'] font-bold text-xl mb-1 navy">Заявка на поставку</h2>
                      <p className="text-[hsl(var(--navy)/0.45)] text-sm">Для разборщиков и автомагазинов. Ответим за 2 часа.</p>
                    </div>

                    {[
                      { key: "name", label: "Контактное лицо *", placeholder: "Иван Петров", type: "text", required: true },
                      { key: "company", label: "Компания / ИП", placeholder: "ООО «АвтоРазбор»", type: "text", required: false },
                      { key: "phone", label: "Телефон *", placeholder: "+7 (___) ___-__-__", type: "tel", required: true },
                    ].map((f) => (
                      <div key={f.key}>
                        <label className="block text-[hsl(var(--navy)/0.5)] text-xs font-['Montserrat'] font-semibold tracking-widest uppercase mb-2">
                          {f.label}
                        </label>
                        <input
                          required={f.required}
                          type={f.type}
                          placeholder={f.placeholder}
                          value={form[f.key as keyof typeof form]}
                          onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                          className="w-full bg-[hsl(220_25%_97%)] border border-[hsl(220_15%_88%)] px-4 py-3 text-sm text-[hsl(var(--navy))] placeholder-[hsl(var(--navy)/0.3)] focus:outline-none focus:border-[hsl(var(--navy)/0.5)] transition-colors"
                          style={{ borderRadius: 2 }}
                        />
                      </div>
                    ))}

                    <div>
                      <label className="block text-[hsl(var(--navy)/0.5)] text-xs font-['Montserrat'] font-semibold tracking-widest uppercase mb-2">
                        Что нужно — марки, объём, бюджет
                      </label>
                      <textarea
                        rows={4}
                        placeholder="Например: Toyota Camry 2018–2021, 10 шт./мес., бюджет до 300 тыс. за ед."
                        value={form.comment}
                        onChange={(e) => setForm({ ...form, comment: e.target.value })}
                        className="w-full bg-[hsl(220_25%_97%)] border border-[hsl(220_15%_88%)] px-4 py-3 text-sm text-[hsl(var(--navy))] placeholder-[hsl(var(--navy)/0.3)] focus:outline-none focus:border-[hsl(var(--navy)/0.5)] transition-colors resize-none"
                        style={{ borderRadius: 2 }}
                      />
                    </div>

                    <button type="submit" className="w-full py-4 btn-navy rounded-sm">
                      Отправить заявку
                    </button>
                    <p className="text-[hsl(var(--navy)/0.3)] text-xs text-center">
                      Нажимая кнопку, вы соглашаетесь на обработку персональных данных
                    </p>
                  </form>
                )}
              </div>

              {/* INFO */}
              <div className="flex flex-col gap-5">
                <div className="card-light rounded-sm p-6">
                  <h3 className="font-['Montserrat'] font-bold text-base mb-5 navy uppercase tracking-wider">Контакты</h3>
                  <div className="flex flex-col gap-5">
                    {[
                      { icon: "Phone", label: "Телефон", val: "+7 (800) 555-00-00", sub: "Бесплатно по России" },
                      { icon: "Mail", label: "Email", val: "info@partcore.ru", sub: "Для коммерческих запросов" },
                      { icon: "MessageCircle", label: "Telegram / WhatsApp", val: "@partcore_log", sub: "Ответим в течение 15 мин" },
                      { icon: "MapPin", label: "Офис", val: "Москва, Складская ул., 7", sub: "Пн–Пт 9:00–18:00" },
                    ].map((c) => (
                      <div key={c.label} className="flex items-start gap-4">
                        <div className="w-9 h-9 bg-[hsl(var(--navy)/0.07)] flex items-center justify-center flex-shrink-0" style={{ borderRadius: 2 }}>
                          <Icon name={c.icon} size={16} className="text-[hsl(var(--navy))]" />
                        </div>
                        <div>
                          <div className="text-[hsl(var(--navy)/0.4)] text-xs font-['Montserrat'] font-semibold tracking-wide uppercase">{c.label}</div>
                          <div className="text-[hsl(var(--navy))] font-medium text-sm mt-0.5">{c.val}</div>
                          <div className="text-[hsl(var(--navy)/0.35)] text-xs">{c.sub}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card-light rounded-sm p-6">
                  <h3 className="font-['Montserrat'] font-bold text-base mb-4 navy uppercase tracking-wider">Направления</h3>
                  <div className="flex flex-col gap-3">
                    {ORIGINS.map((o) => (
                      <div key={o.name} className="flex items-center gap-4 p-3 bg-[hsl(220_25%_97%)] border border-[hsl(220_15%_90%)]" style={{ borderRadius: 2 }}>
                        <span className="text-2xl">{o.flag}</span>
                        <div>
                          <div className="font-['Montserrat'] font-bold text-sm navy">{o.name}</div>
                          <div className="text-[hsl(var(--navy)/0.4)] text-xs mt-0.5">{o.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-start gap-4 p-5 border border-[hsl(var(--gold)/0.35)] bg-[hsl(36_85%_50%/0.04)]" style={{ borderRadius: 2 }}>
                  <Icon name="Clock" size={18} className="text-[hsl(var(--gold))] flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-['Montserrat'] font-bold text-sm navy mb-0.5">Срок ответа — 2 часа</div>
                    <div className="text-[hsl(var(--navy)/0.45)] text-xs">В рабочие дни. Срочно — по телефону.</div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* FOOTER */}
        <footer className="border-t border-[hsl(220_15%_88%)] py-8 px-5 sm:px-8 mt-8 bg-white">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <button onClick={() => nav("home")}>
              <img src={LOGO} alt="Partcore Logistics" className="h-10 w-36 object-cover object-left" style={{ objectPosition: "10% center", transform: "scale(1.15)", transformOrigin: "left center" }} />
            </button>
            <div className="text-[hsl(var(--navy)/0.35)] text-xs text-center">
              © 2024 Partcore Logistics. Поставка авто под разборку.
            </div>
            <div className="flex gap-5 flex-wrap justify-center">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => nav(item.id)}
                  className="text-xs text-[hsl(var(--navy)/0.4)] hover:text-[hsl(var(--navy))] transition-colors font-['Montserrat'] font-medium"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
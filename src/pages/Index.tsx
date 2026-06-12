import { useState } from "react";
import Icon from "@/components/ui/icon";

const HERO_IMG = "https://cdn.poehali.dev/projects/92e249db-e174-4ab7-8e64-42d927b13e30/files/5ec2f13f-03ab-4ca7-ae7e-34b15ddd1b3d.jpg";

const CARS = [
  { id: 1, brand: "Toyota", model: "Land Cruiser 300", year: 2022, price: 7200000, country: "Япония", mileage: 28000, engine: "3.5 V6", transmission: "Автомат", img: HERO_IMG },
  { id: 2, brand: "Lexus", model: "LX 600", year: 2023, price: 9800000, country: "Япония", mileage: 12000, engine: "3.5 V6 Twin-Turbo", transmission: "Автомат", img: HERO_IMG },
  { id: 3, brand: "Honda", model: "Odyssey", year: 2021, price: 3100000, country: "Япония", mileage: 45000, engine: "2.4 i-VTEC", transmission: "Автомат", img: HERO_IMG },
  { id: 4, brand: "Nissan", model: "GT-R", year: 2020, price: 8500000, country: "Япония", mileage: 18000, engine: "3.8 V6 Biturbo", transmission: "Автомат", img: HERO_IMG },
  { id: 5, brand: "Mazda", model: "CX-60", year: 2023, price: 4200000, country: "Япония", mileage: 8000, engine: "2.5 Skyactiv", transmission: "Автомат", img: HERO_IMG },
  { id: 6, brand: "Mercedes", model: "E-Class", year: 2022, price: 6700000, country: "Гонконг", mileage: 31000, engine: "2.0 Turbo", transmission: "Автомат", img: HERO_IMG },
  { id: 7, brand: "BMW", model: "M5 Competition", year: 2021, price: 11200000, country: "Гонконг", mileage: 22000, engine: "4.4 V8 Biturbo", transmission: "Автомат", img: HERO_IMG },
  { id: 8, brand: "Toyota", model: "Alphard", year: 2023, price: 8900000, country: "Япония", mileage: 5000, engine: "2.5 Hybrid", transmission: "Автомат", img: HERO_IMG },
];

const BRANDS = ["Все", "Toyota", "Lexus", "Honda", "Nissan", "Mazda", "Mercedes", "BMW"];
const COUNTRIES = ["Все", "Япония", "Гонконг"];

const REVIEWS = [
  { name: "Александр М.", city: "Москва", text: "Заказывал Toyota Land Cruiser из Японии. Всё прошло чисто — от выбора до постановки на учёт. Машина пришла точно в срок, состояние идеальное.", rating: 5, date: "Март 2024" },
  { name: "Евгений К.", city: "Екатеринбург", text: "Брал Lexus через этих ребят. Честно скажу — сначала сомневался, но результат превзошёл ожидания. Полная растаможка и страховка входили в цену.", rating: 5, date: "Февраль 2024" },
  { name: "Ирина Д.", city: "Новосибирск", text: "Помогли с выбором, объяснили все нюансы пригона из Гонконга. Отличный сервис, буду рекомендовать знакомым. Honda Odyssey — просто мечта для семьи!", rating: 5, date: "Январь 2024" },
  { name: "Дмитрий Р.", city: "Санкт-Петербург", text: "Уже второй автомобиль беру через эту компанию. Mazda CX-60 пришла за 45 дней. Менеджеры всегда на связи, всё прозрачно.", rating: 5, date: "Апрель 2024" },
];

const STEPS = [
  { icon: "MessageCircle", title: "Заявка", desc: "Оставьте заявку — менеджер свяжется в течение часа" },
  { icon: "Search", title: "Подбор", desc: "Подбираем автомобиль по вашим требованиям на аукционах" },
  { icon: "Ship", title: "Доставка", desc: "Организуем доставку, таможенное оформление и ПТС" },
  { icon: "Key", title: "Получение", desc: "Передаём ключи. Готово к постановке на учёт" },
];

const TICKER_ITEMS = ["Toyota", "Lexus", "Honda", "Nissan", "Mazda", "Mitsubishi", "Subaru", "Infiniti", "Acura", "BMW", "Mercedes", "Audi", "Porsche", "Land Rover"];

export default function Index() {
  const [activePage, setActivePage] = useState<"home" | "catalog" | "reviews" | "contacts">("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [filterBrand, setFilterBrand] = useState("Все");
  const [filterCountry, setFilterCountry] = useState("Все");
  const [filterYear, setFilterYear] = useState("Все");
  const [priceMax, setPriceMax] = useState(12000000);
  const [formData, setFormData] = useState({ name: "", phone: "", model: "", comment: "" });
  const [formSent, setFormSent] = useState(false);

  const years = ["Все", "2023", "2022", "2021", "2020"];

  const filteredCars = CARS.filter((car) => {
    if (filterBrand !== "Все" && car.brand !== filterBrand) return false;
    if (filterCountry !== "Все" && car.country !== filterCountry) return false;
    if (filterYear !== "Все" && car.year !== parseInt(filterYear)) return false;
    if (car.price > priceMax) return false;
    return true;
  });

  const navItems = [
    { id: "home", label: "Главная" },
    { id: "catalog", label: "Каталог" },
    { id: "reviews", label: "Отзывы" },
    { id: "contacts", label: "Контакты" },
  ];

  const handleNav = (page: typeof activePage) => {
    setActivePage(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSent(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <button onClick={() => handleNav("home")} className="flex items-center gap-2">
            <div className="w-8 h-8 stripe-accent rounded flex items-center justify-center text-black font-bold text-sm">JP</div>
            <span className="font-['Oswald'] text-xl font-semibold tracking-wider">
              JAPAN<span className="neon-text">CAR</span>
            </span>
          </button>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNav(item.id as typeof activePage)}
                className={`px-4 py-2 text-sm font-medium tracking-wide transition-all rounded ${
                  activePage === item.id
                    ? "text-[hsl(var(--neon))] bg-[hsl(var(--neon)/0.1)]"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => handleNav("contacts")}
              className="ml-4 px-5 py-2 text-sm font-semibold bg-[hsl(var(--neon))] text-black rounded hover:brightness-110 transition-all animate-pulse-neon"
            >
              Заказать авто
            </button>
          </div>

          <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <Icon name={mobileMenuOpen ? "X" : "Menu"} size={22} />
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden glass border-t border-white/5 px-4 py-3 flex flex-col gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNav(item.id as typeof activePage)}
                className={`text-left px-4 py-3 rounded text-sm font-medium ${
                  activePage === item.id ? "text-[hsl(var(--neon))]" : "text-white/70"
                }`}
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => handleNav("contacts")}
              className="mt-2 py-3 text-sm font-semibold bg-[hsl(var(--neon))] text-black rounded"
            >
              Заказать авто
            </button>
          </div>
        )}
      </nav>

      {/* TICKER */}
      <div className="fixed top-16 left-0 right-0 z-40 h-8 bg-[hsl(var(--neon))] overflow-hidden flex items-center">
        <div className="flex animate-ticker whitespace-nowrap">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="text-black font-['Oswald'] font-semibold text-xs tracking-[0.2em] uppercase px-6">
              {item} <span className="opacity-40">◆</span>
            </span>
          ))}
        </div>
      </div>

      <div className="pt-24">
        {/* ============ HOME ============ */}
        {activePage === "home" && (
          <>
            {/* HERO */}
            <section className="relative min-h-[90vh] flex items-center grid-bg overflow-hidden">
              <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${HERO_IMG})` }}>
                <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/20" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
              </div>

              <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-20">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 glass rounded-full text-xs text-[hsl(var(--neon))] mb-6 animate-fade-up">
                    <span className="w-1.5 h-1.5 bg-[hsl(var(--neon))] rounded-full animate-ping inline-block" />
                    Прямые поставки · Япония & Гонконг
                  </div>

                  <h1 className="font-['Oswald'] text-5xl sm:text-7xl font-bold leading-none mb-6 animate-fade-up delay-100">
                    ЯПОНСКОЕ
                    <br />
                    <span className="neon-text">КАЧЕСТВО</span>
                    <br />
                    <span className="text-white/40">К ВАШЕЙ ДВЕРИ</span>
                  </h1>

                  <p className="text-white/60 text-lg sm:text-xl leading-relaxed mb-10 animate-fade-up delay-200 font-light">
                    Подбор, доставка и таможенное оформление автомобилей
                    из Японии и Гонконга. Более 500 успешных сделок.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 animate-fade-up delay-300">
                    <button
                      onClick={() => handleNav("catalog")}
                      className="px-8 py-4 bg-[hsl(var(--neon))] text-black font-['Oswald'] font-semibold text-lg tracking-wider rounded hover:brightness-110 transition-all animate-pulse-neon"
                    >
                      СМОТРЕТЬ КАТАЛОГ
                    </button>
                    <button
                      onClick={() => handleNav("contacts")}
                      className="px-8 py-4 glass text-white font-['Oswald'] font-semibold text-lg tracking-wider rounded border border-white/20 hover:border-[hsl(var(--neon)/0.5)] hover:text-[hsl(var(--neon))] transition-all"
                    >
                      КОНСУЛЬТАЦИЯ
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-8 mt-14 animate-fade-up delay-400">
                    {[["500+", "Сделок"], ["45", "Дней доставки"], ["100%", "Гарантия"], ["5★", "Рейтинг"]].map(([num, label]) => (
                      <div key={label} className="text-center">
                        <div className="font-['Oswald'] text-3xl font-bold neon-text">{num}</div>
                        <div className="text-white/50 text-xs mt-0.5 tracking-wide">{label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* HOW IT WORKS */}
            <section className="py-24 px-4 sm:px-6 max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <div className="text-[hsl(var(--neon))] text-xs font-semibold tracking-[0.3em] uppercase mb-3">Процесс работы</div>
                <h2 className="font-['Oswald'] text-4xl sm:text-5xl font-bold">КАК ЭТО РАБОТАЕТ</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {STEPS.map((step, i) => (
                  <div key={i} className="relative glass rounded-xl p-6 card-hover group border border-white/5">
                    <div className="absolute -top-3 -right-3 w-8 h-8 stripe-accent rounded-full flex items-center justify-center text-black font-['Oswald'] font-bold text-sm">
                      {i + 1}
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-[hsl(var(--neon)/0.1)] flex items-center justify-center mb-4 group-hover:bg-[hsl(var(--neon)/0.2)] transition-colors">
                      <Icon name={step.icon} size={24} className="text-[hsl(var(--neon))]" />
                    </div>
                    <h3 className="font-['Oswald'] text-xl font-semibold mb-2 tracking-wide">{step.title}</h3>
                    <p className="text-white/50 text-sm leading-relaxed">{step.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* FEATURED CARS */}
            <section className="py-16 px-4 sm:px-6 bg-[hsl(220_18%_8%)]">
              <div className="max-w-7xl mx-auto">
                <div className="flex items-end justify-between mb-10">
                  <div>
                    <div className="text-[hsl(var(--neon))] text-xs font-semibold tracking-[0.3em] uppercase mb-2">Горячие предложения</div>
                    <h2 className="font-['Oswald'] text-4xl sm:text-5xl font-bold">ПОПУЛЯРНЫЕ АВТО</h2>
                  </div>
                  <button
                    onClick={() => handleNav("catalog")}
                    className="hidden sm:flex items-center gap-2 text-[hsl(var(--neon))] text-sm hover:gap-3 transition-all"
                  >
                    Весь каталог <Icon name="ArrowRight" size={16} />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {CARS.slice(0, 3).map((car) => (
                    <CarCard key={car.id} car={car} onOrder={() => handleNav("contacts")} />
                  ))}
                </div>
                <button onClick={() => handleNav("catalog")} className="sm:hidden mt-6 w-full py-3 glass border border-white/10 rounded text-[hsl(var(--neon))] text-sm">
                  Весь каталог →
                </button>
              </div>
            </section>

            {/* WHY US */}
            <section className="py-24 px-4 sm:px-6 max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <div className="text-[hsl(var(--neon))] text-xs font-semibold tracking-[0.3em] uppercase mb-3">Наши преимущества</div>
                <h2 className="font-['Oswald'] text-4xl sm:text-5xl font-bold">ПОЧЕМУ ВЫБИРАЮТ НАС</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { icon: "ShieldCheck", title: "Гарантия юридической чистоты", desc: "Проверяем каждый автомобиль по базам CARFAX и аукционным историям" },
                  { icon: "Globe", title: "Доступ к японским аукционам", desc: "USS, JU, TAA — работаем с крупнейшими площадками напрямую" },
                  { icon: "FileText", title: "Полное таможенное оформление", desc: "Берём на себя все документы, СБКТС, ПТС и постановку на учёт" },
                  { icon: "Headphones", title: "Поддержка 24/7", desc: "Менеджер на связи от выбора авто до получения ключей" },
                  { icon: "TrendingDown", title: "Цены без наценок", desc: "Работаем без посредников — экономите до 20% от рыночной цены" },
                  { icon: "Clock", title: "Срок 40–60 дней", desc: "Фиксированные сроки доставки. Держим в курсе на каждом этапе" },
                ].map((item, i) => (
                  <div key={i} className="glass rounded-xl p-6 card-hover group border border-white/5 flex gap-4">
                    <div className="w-11 h-11 rounded-lg bg-[hsl(var(--neon)/0.1)] flex items-center justify-center flex-shrink-0 group-hover:bg-[hsl(var(--neon)/0.2)] transition-colors">
                      <Icon name={item.icon} size={20} className="text-[hsl(var(--neon))]" />
                    </div>
                    <div>
                      <h3 className="font-['Oswald'] text-lg font-semibold mb-1 tracking-wide">{item.title}</h3>
                      <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* CTA BANNER */}
            <section className="relative py-20 overflow-hidden">
              <div className="absolute inset-0 stripe-accent opacity-10" />
              <div className="absolute inset-0 grid-bg" />
              <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
                <h2 className="font-['Oswald'] text-4xl sm:text-6xl font-bold mb-4">
                  ГОТОВЫ НАЙТИ<br />
                  <span className="neon-text">ВАШ АВТОМОБИЛЬ?</span>
                </h2>
                <p className="text-white/60 text-lg mb-8">Оставьте заявку и получите подборку вариантов уже через 24 часа</p>
                <button
                  onClick={() => handleNav("contacts")}
                  className="px-10 py-4 bg-[hsl(var(--neon))] text-black font-['Oswald'] font-bold text-xl tracking-wider rounded hover:brightness-110 transition-all animate-pulse-neon"
                >
                  ОТПРАВИТЬ ЗАЯВКУ
                </button>
              </div>
            </section>
          </>
        )}

        {/* ============ CATALOG ============ */}
        {activePage === "catalog" && (
          <section className="min-h-screen py-10 px-4 sm:px-6 max-w-7xl mx-auto">
            <div className="mb-8">
              <div className="text-[hsl(var(--neon))] text-xs font-semibold tracking-[0.3em] uppercase mb-2">Наш автопарк</div>
              <h1 className="font-['Oswald'] text-4xl sm:text-5xl font-bold">КАТАЛОГ АВТОМОБИЛЕЙ</h1>
            </div>

            {/* FILTERS */}
            <div className="glass rounded-xl p-5 mb-8 border border-white/5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-4">
                <div>
                  <label className="text-white/50 text-xs tracking-widest uppercase block mb-2">Марка</label>
                  <div className="flex flex-wrap gap-1.5">
                    {BRANDS.map((b) => (
                      <button
                        key={b}
                        onClick={() => setFilterBrand(b)}
                        className={`px-3 py-1 text-xs rounded-full border transition-all ${
                          filterBrand === b
                            ? "border-[hsl(var(--neon))] bg-[hsl(var(--neon)/0.15)] text-[hsl(var(--neon))]"
                            : "border-white/10 text-white/50 hover:border-white/30"
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-white/50 text-xs tracking-widest uppercase block mb-2">Страна</label>
                  <div className="flex flex-wrap gap-1.5">
                    {COUNTRIES.map((c) => (
                      <button
                        key={c}
                        onClick={() => setFilterCountry(c)}
                        className={`px-3 py-1 text-xs rounded-full border transition-all ${
                          filterCountry === c
                            ? "border-[hsl(var(--neon))] bg-[hsl(var(--neon)/0.15)] text-[hsl(var(--neon))]"
                            : "border-white/10 text-white/50 hover:border-white/30"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-white/50 text-xs tracking-widest uppercase block mb-2">Год выпуска</label>
                  <div className="flex flex-wrap gap-1.5">
                    {years.map((y) => (
                      <button
                        key={y}
                        onClick={() => setFilterYear(y)}
                        className={`px-3 py-1 text-xs rounded-full border transition-all ${
                          filterYear === y
                            ? "border-[hsl(var(--neon))] bg-[hsl(var(--neon)/0.15)] text-[hsl(var(--neon))]"
                            : "border-white/10 text-white/50 hover:border-white/30"
                        }`}
                      >
                        {y}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-white/50 text-xs tracking-widest uppercase block mb-2">
                    Цена до: {(priceMax / 1000000).toFixed(1)} млн ₽
                  </label>
                  <input
                    type="range"
                    min={1000000}
                    max={12000000}
                    step={100000}
                    value={priceMax}
                    onChange={(e) => setPriceMax(Number(e.target.value))}
                    className="w-full accent-[hsl(var(--neon))]"
                  />
                  <div className="flex justify-between text-white/30 text-xs mt-1">
                    <span>1 млн</span><span>12 млн</span>
                  </div>
                </div>
              </div>
              <div className="text-white/40 text-xs border-t border-white/5 pt-3">
                Найдено: <span className="text-[hsl(var(--neon))] font-semibold">{filteredCars.length}</span> автомобилей
              </div>
            </div>

            {filteredCars.length === 0 ? (
              <div className="text-center py-20 text-white/30">
                <Icon name="Car" size={48} className="mx-auto mb-4 opacity-30" />
                <p className="font-['Oswald'] text-2xl">По вашему запросу ничего не найдено</p>
                <button onClick={() => { setFilterBrand("Все"); setFilterCountry("Все"); setFilterYear("Все"); setPriceMax(12000000); }} className="mt-4 text-[hsl(var(--neon))] text-sm hover:underline">
                  Сбросить фильтры
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCars.map((car) => (
                  <CarCard key={car.id} car={car} onOrder={() => handleNav("contacts")} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* ============ REVIEWS ============ */}
        {activePage === "reviews" && (
          <section className="min-h-screen py-10 px-4 sm:px-6 max-w-7xl mx-auto">
            <div className="mb-12">
              <div className="text-[hsl(var(--neon))] text-xs font-semibold tracking-[0.3em] uppercase mb-2">Клиенты о нас</div>
              <h1 className="font-['Oswald'] text-4xl sm:text-5xl font-bold">ОТЗЫВЫ ПОКУПАТЕЛЕЙ</h1>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-16">
              {REVIEWS.map((review, i) => (
                <div key={i} className="glass rounded-xl p-6 card-hover border border-white/5 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full stripe-accent" />
                  <div className="flex items-start justify-between mb-4 pl-3">
                    <div>
                      <div className="font-['Oswald'] text-lg font-semibold">{review.name}</div>
                      <div className="text-white/40 text-sm">{review.city} · {review.date}</div>
                    </div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: review.rating }).map((_, j) => (
                        <span key={j} className="text-[hsl(var(--neon))] text-sm">★</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-white/65 text-sm leading-relaxed pl-3">"{review.text}"</p>
                </div>
              ))}
            </div>

            <div className="glass rounded-xl p-8 border border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center mb-12">
              {[["4.98", "Рейтинг"], ["500+", "Клиентов"], ["98%", "Довольны"], ["47", "Дней ср. срок"]].map(([num, label]) => (
                <div key={label}>
                  <div className="font-['Oswald'] text-4xl font-bold neon-text">{num}</div>
                  <div className="text-white/40 text-sm mt-1">{label}</div>
                </div>
              ))}
            </div>

            <div className="text-center">
              <button
                onClick={() => handleNav("contacts")}
                className="px-8 py-4 bg-[hsl(var(--neon))] text-black font-['Oswald'] font-semibold text-lg tracking-wider rounded hover:brightness-110 transition-all animate-pulse-neon"
              >
                ЗАКАЗАТЬ АВТОМОБИЛЬ
              </button>
            </div>
          </section>
        )}

        {/* ============ CONTACTS ============ */}
        {activePage === "contacts" && (
          <section className="min-h-screen py-10 px-4 sm:px-6 max-w-7xl mx-auto">
            <div className="mb-10">
              <div className="text-[hsl(var(--neon))] text-xs font-semibold tracking-[0.3em] uppercase mb-2">Свяжитесь с нами</div>
              <h1 className="font-['Oswald'] text-4xl sm:text-5xl font-bold">ЗАКАЗАТЬ АВТОМОБИЛЬ</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="glass rounded-xl p-8 border border-white/5">
                {formSent ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 rounded-full bg-[hsl(var(--neon)/0.15)] flex items-center justify-center mb-4">
                      <Icon name="CheckCircle" size={36} className="text-[hsl(var(--neon))]" />
                    </div>
                    <h3 className="font-['Oswald'] text-2xl font-bold mb-2">Заявка отправлена!</h3>
                    <p className="text-white/50">Наш менеджер свяжется с вами в течение 1 часа</p>
                    <button onClick={() => setFormSent(false)} className="mt-6 text-[hsl(var(--neon))] text-sm hover:underline">
                      Отправить ещё одну заявку
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div>
                      <h2 className="font-['Oswald'] text-2xl font-semibold mb-1">Оставить заявку</h2>
                      <p className="text-white/40 text-sm">Заполните форму и мы свяжемся с вами в течение часа</p>
                    </div>
                    {[
                      { key: "name", label: "Ваше имя *", placeholder: "Александр", type: "text", required: true },
                      { key: "phone", label: "Телефон *", placeholder: "+7 (999) 000-00-00", type: "tel", required: true },
                      { key: "model", label: "Желаемый автомобиль", placeholder: "Toyota Land Cruiser 2022", type: "text", required: false },
                    ].map((field) => (
                      <div key={field.key}>
                        <label className="text-white/50 text-xs tracking-widest uppercase block mb-2">{field.label}</label>
                        <input
                          required={field.required}
                          type={field.type}
                          placeholder={field.placeholder}
                          value={formData[field.key as keyof typeof formData]}
                          onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[hsl(var(--neon))] transition-colors"
                        />
                      </div>
                    ))}
                    <div>
                      <label className="text-white/50 text-xs tracking-widest uppercase block mb-2">Комментарий</label>
                      <textarea
                        rows={3}
                        placeholder="Ваши пожелания по комплектации, цвету, бюджету..."
                        value={formData.comment}
                        onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[hsl(var(--neon))] transition-colors resize-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-4 bg-[hsl(var(--neon))] text-black font-['Oswald'] font-bold text-lg tracking-wider rounded hover:brightness-110 transition-all animate-pulse-neon"
                    >
                      ОТПРАВИТЬ ЗАЯВКУ
                    </button>
                    <p className="text-white/25 text-xs text-center">
                      Нажимая кнопку, вы соглашаетесь с обработкой персональных данных
                    </p>
                  </form>
                )}
              </div>

              <div className="flex flex-col gap-6">
                <div className="glass rounded-xl p-6 border border-white/5">
                  <h3 className="font-['Oswald'] text-xl font-semibold mb-4 tracking-wide">КОНТАКТЫ</h3>
                  <div className="flex flex-col gap-4">
                    {[
                      { icon: "Phone", label: "Телефон", value: "+7 (800) 555-00-00", sub: "Бесплатно по России" },
                      { icon: "MessageCircle", label: "WhatsApp / Telegram", value: "@japancar_ru", sub: "Ответим в течение 15 минут" },
                      { icon: "Mail", label: "Email", value: "info@japancar.ru", sub: "Для документов и запросов" },
                      { icon: "MapPin", label: "Офис", value: "Москва, ул. Садовая, 12", sub: "Пн–Пт 9:00–19:00" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-[hsl(var(--neon)/0.1)] flex items-center justify-center flex-shrink-0">
                          <Icon name={item.icon} size={18} className="text-[hsl(var(--neon))]" />
                        </div>
                        <div>
                          <div className="text-white/40 text-xs tracking-wide">{item.label}</div>
                          <div className="text-white font-medium">{item.value}</div>
                          <div className="text-white/30 text-xs">{item.sub}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass rounded-xl p-6 border border-white/5">
                  <h3 className="font-['Oswald'] text-xl font-semibold mb-4 tracking-wide">НАПРАВЛЕНИЯ</h3>
                  <div className="flex flex-col gap-3">
                    {[
                      { flag: "🇯🇵", country: "Япония", desc: "Аукционы USS, JU, TAA, HAA. Срок 45–55 дней" },
                      { flag: "🇭🇰", country: "Гонконг", desc: "Европейские и американские авто. Срок 40–50 дней" },
                    ].map((dir) => (
                      <div key={dir.country} className="flex items-center gap-4 p-4 rounded-lg bg-white/3 border border-white/5">
                        <span className="text-3xl">{dir.flag}</span>
                        <div>
                          <div className="font-['Oswald'] text-base font-semibold">{dir.country}</div>
                          <div className="text-white/40 text-xs">{dir.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* FOOTER */}
        <footer className="border-t border-white/5 py-10 px-4 sm:px-6 mt-10">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <button onClick={() => handleNav("home")} className="flex items-center gap-2">
              <div className="w-7 h-7 stripe-accent rounded flex items-center justify-center text-black font-bold text-xs">JP</div>
              <span className="font-['Oswald'] text-lg font-semibold tracking-wider">
                JAPAN<span className="neon-text">CAR</span>
              </span>
            </button>
            <div className="text-white/25 text-xs text-center">
              © 2024 JapanCar. Автомобили из Японии и Гонконга.
            </div>
            <div className="flex gap-4 text-xs text-white/30">
              {navItems.map((item) => (
                <button key={item.id} onClick={() => handleNav(item.id as typeof activePage)} className="hover:text-white/60 transition-colors">
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

function CarCard({ car, onOrder }: { car: (typeof CARS)[0]; onOrder: () => void }) {
  return (
    <div className="glass rounded-xl overflow-hidden card-hover border border-white/5 group flex flex-col">
      <div className="relative overflow-hidden aspect-[16/10]">
        <img src={car.img} alt={`${car.brand} ${car.model}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute top-3 left-3">
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${car.country === "Япония" ? "bg-red-500/80 text-white" : "bg-blue-500/80 text-white"}`}>
            {car.country === "Япония" ? "🇯🇵" : "🇭🇰"} {car.country}
          </span>
        </div>
        <div className="absolute bottom-3 right-3">
          <span className="text-xs font-semibold px-2 py-1 rounded-full glass text-white/70">
            {car.mileage.toLocaleString()} км
          </span>
        </div>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <div className="text-white/40 text-xs tracking-wider mb-0.5">{car.year} · {car.engine}</div>
        <h3 className="font-['Oswald'] text-xl font-semibold mb-3">
          {car.brand} <span className="text-white/70">{car.model}</span>
        </h3>
        <div className="flex items-center gap-2 text-xs text-white/40 mb-4">
          <Icon name="Settings" size={12} />
          <span>{car.transmission}</span>
          <span className="text-white/20">·</span>
          <Icon name="Gauge" size={12} />
          <span>{car.engine}</span>
        </div>
        <div className="mt-auto flex items-end justify-between">
          <div>
            <div className="text-white/30 text-xs">Цена от</div>
            <div className="font-['Oswald'] text-2xl font-bold neon-text">
              {(car.price / 1000000).toFixed(1)} млн ₽
            </div>
          </div>
          <button
            onClick={onOrder}
            className="px-4 py-2 bg-[hsl(var(--neon))] text-black text-xs font-['Oswald'] font-semibold tracking-wider rounded hover:brightness-110 transition-all"
          >
            ЗАКАЗАТЬ
          </button>
        </div>
      </div>
    </div>
  );
}

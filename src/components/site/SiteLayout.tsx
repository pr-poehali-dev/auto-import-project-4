import type { ReactNode } from "react";
import Icon from "@/components/ui/icon";
import type { SiteState } from "@/hooks/useSiteState";
import { LOGO, PAGE_BG } from "@/lib/site-data";

export default function SiteLayout({ s, children }: { s: SiteState; children: ReactNode }) {
  const { lang, t, nav, page, user, menuOpen, setMenuOpen, changeLang, navItems } = s;

  return (
    <div className="min-h-screen text-foreground overflow-x-hidden relative">

      {/* ── FULL-PAGE BACKGROUND ── */}
      <div className="fixed inset-0 -z-10 bg-cover bg-center" style={{ backgroundImage: `url(${PAGE_BG})` }} />
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(1200px_600px_at_70%_-10%,hsl(41_74%_56%/0.10),transparent_60%)]" />
      <div className="fixed inset-0 -z-10 bg-[linear-gradient(180deg,hsl(222_47%_6%/0.92),hsl(222_50%_4%/0.96))]" />

      {/* ── ПЛАВАЮЩИЙ ЛОГОТИП С МЕНЮ (десктоп) ── */}
      <div className="hidden md:block fixed top-4 left-5 z-50 group/logo">
        <button onClick={() => nav("home")} className="flex items-center gap-2 rounded-sm overflow-hidden bg-[hsl(222_44%_9%/0.85)] backdrop-blur-md border border-[hsl(var(--gold)/0.3)] shadow-lg pr-3">
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
        <button onClick={() => nav("home")} className="flex items-center gap-1.5 rounded-sm overflow-hidden bg-[hsl(222_44%_9%/0.85)] backdrop-blur-md border border-[hsl(var(--gold)/0.3)] pr-2.5">
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
        {children}

        {/* FOOTER */}
        <footer className="border-t border-[hsl(var(--gold)/0.15)] py-8 px-5 sm:px-8 mt-8 bg-[hsl(222_50%_5%/0.85)] backdrop-blur-sm">
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

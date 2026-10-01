import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { apiAuth, type User } from "@/lib/site-data";
import { setupCrmPwa } from "@/lib/pwa";
import CrmWorkspace, { CRM_TABS, type CrmView } from "@/components/site/crm/CrmWorkspace";
import InstallBanner from "@/components/site/crm/InstallBanner";
import { input, btnGold } from "@/components/site/crm/ui";

const TOKEN_KEY = "pc_token";

const initialView = (): CrmView => {
  const v = new URLSearchParams(window.location.search).get("view");
  return CRM_TABS.some((t) => t.id === v) ? (v as CrmView) : "board";
};

const initialDeal = () => Number(new URLSearchParams(window.location.search).get("deal")) || null;

// Мобильное приложение CRM: отдельный адрес /crm, ставится на телефон как приложение
export default function CrmApp() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || "");
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(!!token);
  const [view, setView] = useState<CrmView>(initialView);
  const [overdue, setOverdue] = useState(0);
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => { setupCrmPwa(); }, []);

  useEffect(() => {
    if (!token) { setChecking(false); return; }
    apiAuth("me", {}, token).then((d) => {
      if (d.user?.role === "staff") setUser(d.user);
      else if (d.user) { setUser(null); setError("Этот вход только для сотрудников"); }
      else { localStorage.removeItem(TOKEN_KEY); setToken(""); }
      setChecking(false);
    });
  }, [token]);

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("view", view);
    url.searchParams.delete("deal");
    url.searchParams.delete("source");
    window.history.replaceState(null, "", url.pathname + url.search);
  }, [view]);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    const d = await apiAuth("login", form);
    if (!d.token) { setLoading(false); setError(d.error || "Неверный email или пароль"); return; }
    const me = await apiAuth("me", {}, d.token);
    setLoading(false);
    if (me.user?.role !== "staff") {
      await apiAuth("logout", {}, d.token);
      setError("Этот вход только для сотрудников");
      return;
    }
    localStorage.setItem(TOKEN_KEY, d.token);
    setToken(d.token); setUser(me.user);
  };

  const logout = async () => {
    setMenuOpen(false);
    await apiAuth("logout", {}, token);
    localStorage.removeItem(TOKEN_KEY);
    setToken(""); setUser(null);
  };

  const shell = "min-h-[100dvh] bg-[hsl(var(--ink))] text-[hsl(var(--navy))]";

  if (checking) {
    return (
      <div className={shell + " flex flex-col items-center justify-center gap-4"}>
        <img src="/crm-icon-192.png" alt="" className="w-20 h-20 rounded-2xl animate-pulse" />
        <p className="text-sm text-[hsl(var(--navy)/0.5)]">Загрузка…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={shell + " flex flex-col pt-[env(safe-area-inset-top)]"}>
        <InstallBanner />
        <div className="flex-1 flex items-center justify-center p-6">
          <form onSubmit={login} className="w-full max-w-sm">
            <img src="/crm-icon-192.png" alt="" className="w-20 h-20 rounded-2xl mx-auto mb-5 shadow-[0_10px_40px_hsl(var(--gold)/0.25)]" />
            <h1 className="font-['Montserrat'] font-black text-2xl text-center mb-1">CRM</h1>
            <p className="text-center text-sm text-[hsl(var(--navy)/0.55)] mb-8">Вход для сотрудников PRIME CARS</p>
            <label className="block text-[11px] uppercase tracking-wide text-[hsl(var(--navy)/0.6)] mb-1.5">Email</label>
            <input type="email" required autoComplete="username" inputMode="email" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} className={input + " !py-3 !text-base mb-4"} />
            <label className="block text-[11px] uppercase tracking-wide text-[hsl(var(--navy)/0.6)] mb-1.5">Пароль</label>
            <input type="password" required autoComplete="current-password" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })} className={input + " !py-3 !text-base mb-5"} />
            {error && <p className="text-sm text-red-400 mb-4 text-center">{error}</p>}
            <button type="submit" disabled={loading} className={btnGold + " w-full !py-3.5 !text-sm"}>
              {loading ? <Icon name="Loader" size={16} className="animate-spin" /> : <Icon name="LogIn" size={16} />}Войти
            </button>
            <a href="/" className="block text-center text-xs text-[hsl(var(--navy)/0.45)] mt-6">Перейти на сайт</a>
          </form>
        </div>
      </div>
    );
  }

  const title = CRM_TABS.find((t) => t.id === view)?.label || "CRM";
  const initials = (user.full_name || user.email).trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className={shell + " crm-app"}>
      <header className="sticky top-0 z-40 bg-[hsl(var(--ink)/0.92)] backdrop-blur-md border-b border-[hsl(var(--gold)/0.12)] pt-[env(safe-area-inset-top)]">
        <div className="h-14 px-4 flex items-center gap-3 max-w-7xl mx-auto">
          <img src="/crm-icon-192.png" alt="" className="w-8 h-8 rounded-lg" />
          <h1 className="font-['Montserrat'] font-bold text-base flex-1 truncate">{title}</h1>
          <nav className="hidden md:flex gap-1">
            {CRM_TABS.map((t) => (
              <button key={t.id} type="button" onClick={() => setView(t.id)}
                className={`relative flex items-center gap-1.5 text-xs font-['Montserrat'] font-bold px-3 py-2 rounded-sm ${view === t.id ? "bg-[hsl(var(--gold))] text-[hsl(222_47%_8%)]" : "text-[hsl(var(--navy)/0.7)] hover:text-[hsl(var(--navy))]"}`}>
                <Icon name={t.icon} size={14} />{t.label}
                {t.id === "tasks" && overdue > 0 && <span className="min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">{overdue}</span>}
              </button>
            ))}
          </nav>
          <div className="relative">
            <button type="button" onClick={() => setMenuOpen((v) => !v)} aria-label="Профиль"
              className="w-9 h-9 rounded-full bg-[hsl(var(--gold)/0.18)] text-[hsl(var(--gold))] text-xs font-bold flex items-center justify-center">{initials}</button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-11 z-50 w-60 bg-[hsl(var(--ink-2))] border border-[hsl(var(--gold)/0.2)] rounded-sm shadow-2xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-[hsl(var(--gold)/0.1)]">
                    <p className="text-sm font-semibold truncate">{user.full_name || user.email}</p>
                    <p className="text-[11px] text-[hsl(var(--navy)/0.5)] truncate">{user.email}</p>
                  </div>
                  <button type="button" onClick={() => { setMenuOpen(false); window.location.reload(); }} className="w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-[hsl(var(--gold)/0.08)]"><Icon name="RefreshCw" size={15} />Обновить</button>
                  <a href="/" className="w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-[hsl(var(--gold)/0.08)]"><Icon name="Globe" size={15} />Открыть сайт</a>
                  <button type="button" onClick={logout} className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10"><Icon name="LogOut" size={15} />Выйти</button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <InstallBanner />

      <main className="max-w-7xl mx-auto px-3 sm:px-5 pt-4 pb-[calc(84px+env(safe-area-inset-bottom))] md:pb-10">
        <CrmWorkspace token={token} view={view} onOverdue={setOverdue} initialDealId={initialDeal()} />
      </main>

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[hsl(var(--ink-2)/0.97)] backdrop-blur-md border-t border-[hsl(var(--gold)/0.15)] pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-4">
          {CRM_TABS.map((t) => {
            const active = view === t.id;
            return (
              <button key={t.id} type="button" onClick={() => { setView(t.id); window.scrollTo({ top: 0 }); }}
                className={`relative flex flex-col items-center gap-1 pt-2.5 pb-2 text-[10px] font-['Montserrat'] font-semibold transition-colors ${active ? "text-[hsl(var(--gold))]" : "text-[hsl(var(--navy)/0.5)]"}`}>
                {active && <span className="absolute top-0 w-8 h-0.5 rounded-full bg-[hsl(var(--gold))]" />}
                <span className="relative">
                  <Icon name={t.icon} size={22} />
                  {t.id === "tasks" && overdue > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">{overdue}</span>
                  )}
                </span>
                {t.label}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

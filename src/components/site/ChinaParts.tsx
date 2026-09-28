import { useState } from "react";
import Icon from "@/components/ui/icon";
import { CHINA_PARTS_CATALOGS, CHINA_PARTS_CATEGORIES, type Lang } from "@/lib/site-data";

interface PartsForm {
  category_id: string; category_title: string; car_brand: string;
  car_model: string; car_year: string; vin: string; parts_text: string; comment: string;
}

interface ChinaPartsProps {
  lang: Lang;
  t: (key: string) => string;
  isAuthed: boolean;
  onLogin: () => void;
  onRegister: () => void;
  inputCls: string;
  form: PartsForm;
  setForm: (f: PartsForm) => void;
  formOpen: boolean;
  saving: boolean;
  sent: boolean;
  onOpen: (categoryId: string, categoryTitle: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

type PartsTab = "catalogs" | "parts";

// Глава «Автозапчасти» на странице направления Китай.
// Содержимое доступно только зарегистрированным клиентам.
export default function ChinaParts({ lang, t, isAuthed, onLogin, onRegister, inputCls,
  form, setForm, formOpen, saving, sent, onOpen, onClose, onSubmit }: ChinaPartsProps) {
  const [tab, setTab] = useState<PartsTab>("catalogs");
  const labelCls = "block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-wide uppercase mb-2";

  const title = (
    <div className="flex items-center gap-3 mb-2">
      <Icon name="Wrench" size={24} className="text-[hsl(var(--gold))]" />
      <h2 className="font-['Montserrat'] font-black text-2xl text-white drop-shadow-[0_1px_3px_rgba(25,61,100,0.6)]">{t("cn_parts_title")}</h2>
    </div>
  );

  // Гость: показываем главу, но вместо содержимого — приглашение войти
  if (!isAuthed) {
    return (
      <div className="mb-14">
        {title}
        <p className="text-white/90 text-sm mb-6 max-w-2xl drop-shadow-[0_1px_3px_rgba(25,61,100,0.6)]">{t("cn_parts_sub")}</p>
        <div className="card-light rounded-sm p-8 sm:p-10 text-center">
          <div className="w-14 h-14 rounded-sm bg-[hsl(var(--navy)/0.06)] flex items-center justify-center mx-auto mb-4">
            <Icon name="Lock" size={24} className="text-[hsl(var(--navy))]" />
          </div>
          <h3 className="font-['Montserrat'] font-bold text-lg navy mb-2">{t("cn_parts_locked")}</h3>
          <p className="text-[hsl(var(--navy)/0.65)] text-sm max-w-md mx-auto mb-6">{t("cn_parts_locked_sub")}</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button type="button" onClick={onLogin}
              className="text-xs font-['Montserrat'] font-bold px-6 py-3 rounded-sm bg-[hsl(var(--gold))] text-[hsl(222_47%_8%)] hover:opacity-90 transition-opacity uppercase tracking-wide">
              {t("login")}
            </button>
            <button type="button" onClick={onRegister}
              className="text-xs font-['Montserrat'] font-bold px-6 py-3 rounded-sm border border-[hsl(var(--gold)/0.4)] navy hover:border-[hsl(var(--gold))] transition-colors uppercase tracking-wide">
              {t("register")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const tabs: { key: PartsTab; label: string; icon: string; count: number }[] = [
    { key: "catalogs", label: t("cn_parts_tab_catalogs"), icon: "BookOpen", count: CHINA_PARTS_CATALOGS.length },
    { key: "parts", label: t("cn_parts_tab_parts"), icon: "Boxes", count: CHINA_PARTS_CATEGORIES.length },
  ];

  return (
    <div className="mb-14">
      {title}
      <p className="text-white/90 text-sm mb-6 max-w-2xl drop-shadow-[0_1px_3px_rgba(25,61,100,0.6)]">{t("cn_parts_sub")}</p>

      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((x) => {
          const active = tab === x.key;
          return (
            <button key={x.key} type="button" onClick={() => setTab(x.key)}
              className={`flex items-center gap-1.5 text-xs font-['Montserrat'] font-bold px-4 py-2 rounded-full border transition-colors ${active ? "bg-[hsl(var(--gold))] text-[hsl(222_47%_8%)] border-[hsl(var(--gold))]" : "bg-[hsl(222_50%_6%/0.55)] text-white/80 border-white/20 hover:border-[hsl(var(--gold)/0.6)]"}`}>
              <Icon name={x.icon} size={13} />{x.label}
              <span className={`px-1.5 rounded-full text-[10px] ${active ? "bg-[hsl(222_47%_8%)/0.15]" : "bg-white/10"}`}>{x.count}</span>
            </button>
          );
        })}
      </div>

      {tab === "catalogs" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {CHINA_PARTS_CATALOGS.map((c) => (
            <a key={c.id} href={c.url} target="_blank" rel="noopener noreferrer"
              className="card-light rounded-sm p-5 flex flex-col group hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[11px] font-['Montserrat'] font-bold px-2.5 py-1 bg-[hsl(var(--navy)/0.06)] navy rounded-sm uppercase tracking-wide">{c.brand}</span>
                <Icon name="ExternalLink" size={15} className="text-[hsl(var(--navy)/0.45)] group-hover:text-[hsl(var(--gold))] transition-colors flex-shrink-0" />
              </div>
              <h3 className="font-['Montserrat'] font-bold text-base navy leading-tight mb-1.5">{c.title[lang]}</h3>
              <p className="text-[hsl(var(--navy)/0.62)] text-sm leading-relaxed">{c.desc[lang]}</p>
            </a>
          ))}
        </div>
      )}

      {tab === "parts" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {CHINA_PARTS_CATEGORIES.map((g) => (
            <div key={g.id} className="card-light rounded-sm p-5 flex flex-col">
              <div className="w-10 h-10 bg-[hsl(var(--navy)/0.06)] rounded-sm flex items-center justify-center mb-3">
                <Icon name={g.icon} size={18} className="text-[hsl(var(--navy))]" />
              </div>
              <h3 className="font-['Montserrat'] font-bold text-base navy leading-tight mb-2">{g.title[lang]}</h3>
              <ul className="flex flex-col gap-1.5 mb-4">
                {g.items.map((it) => (
                  <li key={it.ru} className="flex items-start gap-2 text-sm text-[hsl(var(--navy)/0.68)] leading-snug">
                    <Icon name="Check" size={13} className="text-[hsl(var(--gold))] flex-shrink-0 mt-1" />{it[lang]}
                  </li>
                ))}
              </ul>
              <button type="button" onClick={() => onOpen(g.id, g.title[lang])}
                className="mt-auto w-full flex items-center justify-center gap-1.5 text-[11px] font-['Montserrat'] font-bold px-3 py-2.5 rounded-sm border border-[hsl(var(--gold)/0.4)] navy hover:bg-[hsl(var(--gold))] hover:text-[hsl(222_47%_8%)] hover:border-[hsl(var(--gold))] transition-colors uppercase tracking-wide">
                <Icon name="Search" size={13} />{t("cn_parts_ask")}
              </button>
            </div>
          ))}
        </div>
      )}

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[hsl(222_50%_4%/0.8)] backdrop-blur-sm" onClick={onClose}>
          <div className="card-light rounded-sm w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {sent ? (
              <div className="p-8 text-center">
                <div className="w-14 h-14 rounded-sm bg-green-50 flex items-center justify-center mx-auto mb-4">
                  <Icon name="CircleCheck" size={26} className="text-green-600" />
                </div>
                <h3 className="font-['Montserrat'] font-bold text-lg navy mb-2">{t("cn_parts_sent")}</h3>
                <p className="text-[hsl(var(--navy)/0.65)] text-sm mb-6">{t("cn_parts_sent_sub")}</p>
                <button type="button" onClick={onClose}
                  className="text-xs font-['Montserrat'] font-bold px-6 py-3 rounded-sm bg-[hsl(var(--gold))] text-[hsl(222_47%_8%)] hover:opacity-90 transition-opacity uppercase tracking-wide">
                  {t("close")}
                </button>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="p-6 flex flex-col gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="section-tag mb-1">{t("cn_parts_ask")}</div>
                    <h3 className="font-['Montserrat'] font-bold text-lg navy leading-tight">{form.category_title}</h3>
                  </div>
                  <button type="button" onClick={onClose} className="text-[hsl(var(--navy)/0.5)] hover:text-[hsl(var(--navy))] flex-shrink-0">
                    <Icon name="X" size={20} />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>{t("cn_parts_brand")} *</label>
                    <input required value={form.car_brand} maxLength={64} placeholder="Geely"
                      onChange={(e) => setForm({ ...form, car_brand: e.target.value })} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>{t("cn_parts_model")}</label>
                    <input value={form.car_model} maxLength={64} placeholder="Monjaro"
                      onChange={(e) => setForm({ ...form, car_model: e.target.value })} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>{t("cn_parts_year")}</label>
                    <input value={form.car_year} inputMode="numeric" maxLength={4} placeholder="2023"
                      onChange={(e) => setForm({ ...form, car_year: e.target.value.replace(/\D/g, "") })} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>VIN</label>
                    <input value={form.vin} maxLength={32} placeholder="LB37622Z0..."
                      onChange={(e) => setForm({ ...form, vin: e.target.value.toUpperCase() })}
                      className={inputCls + " font-mono tracking-wide"} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>{t("cn_parts_list")}</label>
                  <textarea value={form.parts_text} rows={3} placeholder={t("cn_parts_list_ph")}
                    onChange={(e) => setForm({ ...form, parts_text: e.target.value })} className={inputCls + " resize-none"} />
                </div>
                <div>
                  <label className={labelCls}>{t("cn_parts_comment")}</label>
                  <textarea value={form.comment} rows={2}
                    onChange={(e) => setForm({ ...form, comment: e.target.value })} className={inputCls + " resize-none"} />
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button type="submit" disabled={saving || !form.car_brand.trim()}
                    className="flex items-center gap-1.5 text-xs font-['Montserrat'] font-bold px-6 py-3 rounded-sm bg-[hsl(var(--gold))] text-[hsl(222_47%_8%)] hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-wide">
                    <Icon name={saving ? "Loader" : "Send"} size={13} className={saving ? "animate-spin" : ""} />{t("cn_parts_submit")}
                  </button>
                  <button type="button" onClick={onClose} disabled={saving}
                    className="text-xs font-['Montserrat'] font-bold px-5 py-3 rounded-sm border border-[hsl(var(--gold)/0.25)] text-[hsl(var(--navy)/0.7)] hover:border-[hsl(var(--gold)/0.6)] transition-colors disabled:opacity-50 uppercase tracking-wide">
                    {t("cancel")}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
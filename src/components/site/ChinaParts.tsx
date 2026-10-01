import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { CHINA_PARTS_CATALOGS, CHINA_PARTS_CATEGORIES, apiPartsSchemes, type Lang, type PartsCatalog } from "@/lib/site-data";
import SchemesViewer from "@/components/site/SchemesViewer";

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
  onOpen: (categoryId: string, categoryTitle: string, prefill?: Partial<PartsForm>) => void;
  token: string;
  onClose: () => void;
  onSubmit: () => void;
}

type PartsTab = "catalogs" | "parts";

// Глава «Автозапчасти» на странице направления Китай.
// Содержимое доступно только зарегистрированным клиентам.
export default function ChinaParts({ lang, t, isAuthed, onLogin, onRegister, inputCls,
  form, setForm, formOpen, saving, sent, onOpen, onClose, onSubmit, token }: ChinaPartsProps) {
  const [tab, setTab] = useState<PartsTab>("catalogs");
  const [schemeCounts, setSchemeCounts] = useState<Record<string, number>>({});
  const [viewer, setViewer] = useState<PartsCatalog | null>(null);

  useEffect(() => {
    if (isAuthed && token) apiPartsSchemes("GET", token).then((d) => setSchemeCounts(d.counts || {}));
  }, [isAuthed, token]);
  const [search, setSearch] = useState("");
  const labelCls = "block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-wide uppercase mb-2";

  // Поиск по марке и модели: ищем вхождение в название бренда или в любую модель
  const q = search.trim().toLowerCase();
  const found = q === ""
    ? CHINA_PARTS_CATALOGS
    : CHINA_PARTS_CATALOGS.filter((c) =>
        c.brand.toLowerCase().includes(q) ||
        c.title[lang].toLowerCase().includes(q) ||
        c.models.some((m) => m.toLowerCase().includes(q)));
  // Если совпали конкретные модели — считаем их, иначе показываем все модели найденных марок
  const modelHits = found.reduce((n, c) => n + c.models.filter((m) => m.toLowerCase().includes(q)).length, 0);
  const matchedModels = modelHits > 0 ? modelHits : found.reduce((n, c) => n + c.models.length, 0);

  // Поиск по группам запчастей: совпадение в названии группы или в конкретном узле
  const foundParts = q === ""
    ? CHINA_PARTS_CATEGORIES
    : CHINA_PARTS_CATEGORIES.filter((g) =>
        g.title[lang].toLowerCase().includes(q) ||
        g.items.some((it) => it[lang].toLowerCase().includes(q)));
  const partHits = foundParts.reduce((n, g) => n + g.items.filter((it) => it[lang].toLowerCase().includes(q)).length, 0);
  const shownParts = partHits > 0 ? partHits : foundParts.reduce((n, g) => n + g.items.length, 0);

  // Подсветка совпадения в названии марки
  const hl = (text: string) => {
    if (q === "") return text;
    const i = text.toLowerCase().indexOf(q);
    if (i === -1) return text;
    return (
      <>{text.slice(0, i)}<mark className="bg-[hsl(var(--gold))] text-[hsl(222_47%_8%)] rounded-sm px-0.5">{text.slice(i, i + q.length)}</mark>{text.slice(i + q.length)}</>
    );
  };

  const title = (
    <div className="flex items-center gap-3 mb-2">
      <Icon name="Wrench" size={24} className="text-[hsl(var(--gold))]" />
      <h2 className="font-['Montserrat'] font-black text-2xl text-[hsl(222_47%_11%)]">{t("cn_parts_title")}</h2>
    </div>
  );

  // Гость: показываем главу, но вместо содержимого — приглашение войти
  if (!isAuthed) {
    return (
      <div className="mb-14">
        {title}
        <p className="text-[hsl(222_30%_28%)] text-sm mb-6 max-w-2xl">{t("cn_parts_sub")}</p>
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
    { key: "catalogs", label: t("cn_parts_tab_catalogs"), icon: "BookOpen", count: tab === "catalogs" ? found.length : CHINA_PARTS_CATALOGS.length },
    { key: "parts", label: t("cn_parts_tab_parts"), icon: "Boxes", count: tab === "parts" ? foundParts.length : CHINA_PARTS_CATEGORIES.length },
  ];

  return (
    <div className="mb-14">
      {title}
      <p className="text-[hsl(222_30%_28%)] text-sm mb-6 max-w-2xl">{t("cn_parts_sub")}</p>

      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((x) => {
          const active = tab === x.key;
          return (
            <button key={x.key} type="button" onClick={() => { setTab(x.key); setSearch(""); }}
              className={`flex items-center gap-1.5 text-xs font-['Montserrat'] font-bold px-4 py-2 rounded-full border transition-colors ${active ? "bg-[hsl(var(--gold))] text-[hsl(222_47%_8%)] border-[hsl(var(--gold))]" : "bg-[hsl(222_47%_11%)] text-white border-[hsl(222_47%_11%)] hover:bg-[hsl(222_47%_18%)]"}`}>
              <Icon name={x.icon} size={13} />{x.label}
              <span className={`px-1.5 rounded-full text-[10px] ${active ? "bg-[hsl(222_47%_8%)/0.15]" : "bg-white/15"}`}>{x.count}</span>
            </button>
          );
        })}
      </div>

      <div className="relative mb-5 max-w-md">
        <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--navy)/0.45)] pointer-events-none" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder={tab === "catalogs" ? t("cn_cat_search_ph") : t("cn_prt_search_ph")}
          className={inputCls + " !pl-10 !pr-10"} />
        {search && (
          <button type="button" onClick={() => setSearch("")} title={t("cn_cat_search_clear")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--navy)/0.45)] hover:text-[hsl(var(--navy))]">
            <Icon name="X" size={15} />
          </button>
        )}
      </div>

      {tab === "catalogs" && (
        <>
          <div className="card-light rounded-sm p-4 mb-5 flex items-start gap-3">
            <Icon name="Info" size={16} className="text-[hsl(var(--gold))] flex-shrink-0 mt-0.5" />
            <p className="text-[hsl(var(--navy)/0.7)] text-sm leading-relaxed">{t("cn_cat_note")}</p>
          </div>

          {search.trim() && (
            <p className="text-[hsl(222_30%_28%)] text-xs font-['Montserrat'] font-semibold mb-4">
              {found.length > 0
                ? `${t("cn_cat_found")}: ${found.length} ${t("cn_cat_of_brands")} · ${matchedModels} ${t("cn_cat_models")}`
                : t("cn_cat_nothing")}
            </p>
          )}

          {found.length === 0 ? (
            <div className="card-light rounded-sm p-8 text-center">
              <Icon name="SearchX" size={34} className="mx-auto mb-3 text-[hsl(var(--navy)/0.4)]" />
              <h3 className="font-['Montserrat'] font-bold text-base navy mb-1.5">{t("cn_cat_nothing")}</h3>
              <p className="text-[hsl(var(--navy)/0.65)] text-sm max-w-sm mx-auto mb-5">{t("cn_cat_nothing_sub")}</p>
              <button type="button" onClick={() => onOpen("catalog-other", `${t("cn_cat_pick")} · ${search.trim()}`)}
                className="text-xs font-['Montserrat'] font-bold px-6 py-3 rounded-sm bg-[hsl(var(--gold))] text-[hsl(222_47%_8%)] hover:opacity-90 transition-opacity uppercase tracking-wide">
                {t("cn_parts_ask")}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {found.map((c) => (
                <div key={c.id} className="card-light rounded-sm p-5 flex flex-col">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-['Montserrat'] font-bold px-2.5 py-1 bg-[hsl(var(--navy)/0.06)] navy rounded-sm uppercase tracking-wide">{hl(c.brand)}</span>
                    <span className="text-[10px] text-[hsl(var(--navy)/0.5)] font-['Montserrat'] font-semibold flex-shrink-0">{c.models.length} {t("cn_cat_models")}</span>
                  </div>
                  <p className="text-[hsl(var(--navy)/0.62)] text-sm leading-relaxed mb-3">{c.desc[lang]}</p>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {c.models.map((m) => {
                      const hit = q !== "" && m.toLowerCase().includes(q);
                      return (
                        <span key={m} className={`text-[10px] font-['Montserrat'] font-semibold px-2 py-0.5 rounded-sm ${hit ? "bg-[hsl(var(--gold))] text-[hsl(222_47%_8%)]" : "bg-[hsl(var(--gold)/0.1)] text-[hsl(var(--navy)/0.78)]"}`}>{m}</span>
                      );
                    })}
                  </div>
                  <div className="mt-auto flex flex-col gap-2">
                    {schemeCounts[c.id] ? (
                      <button type="button" onClick={() => setViewer(c)}
                        className="w-full flex items-center justify-center gap-1.5 text-[11px] font-['Montserrat'] font-bold px-3 py-2.5 rounded-sm bg-[hsl(var(--gold))] text-[hsl(222_47%_8%)] hover:opacity-90 transition-opacity uppercase tracking-wide">
                        <Icon name="Images" size={13} />{t("ps_schemes_btn")}
                        <span className="px-1.5 rounded-full text-[10px] bg-black/15">{schemeCounts[c.id]}</span>
                      </button>
                    ) : null}
                    <button type="button" onClick={() => onOpen(`catalog-${c.id}`, `${t("cn_cat_pick")} · ${c.brand}`)}
                      className="w-full flex items-center justify-center gap-1.5 text-[11px] font-['Montserrat'] font-bold px-3 py-2.5 rounded-sm border border-[hsl(var(--gold)/0.4)] navy hover:bg-[hsl(var(--gold))] hover:text-[hsl(222_47%_8%)] hover:border-[hsl(var(--gold))] transition-colors uppercase tracking-wide">
                      <Icon name="ScanSearch" size={13} />{t("cn_cat_pick")}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === "parts" && search.trim() && (
        <p className="text-[hsl(222_30%_28%)] text-xs font-['Montserrat'] font-semibold mb-4">
          {foundParts.length > 0
            ? `${t("cn_cat_found")}: ${foundParts.length} ${t("cn_prt_of_groups")} · ${shownParts} ${t("cn_prt_units")}`
            : t("cn_prt_nothing")}
        </p>
      )}

      {tab === "parts" && foundParts.length === 0 && (
        <div className="card-light rounded-sm p-8 text-center">
          <Icon name="SearchX" size={34} className="mx-auto mb-3 text-[hsl(var(--navy)/0.4)]" />
          <h3 className="font-['Montserrat'] font-bold text-base navy mb-1.5">{t("cn_prt_nothing")}</h3>
          <p className="text-[hsl(var(--navy)/0.65)] text-sm max-w-sm mx-auto mb-5">{t("cn_prt_nothing_sub")}</p>
          <button type="button" onClick={() => onOpen("parts-other", `${t("cn_parts_ask")} · ${search.trim()}`)}
            className="text-xs font-['Montserrat'] font-bold px-6 py-3 rounded-sm bg-[hsl(var(--gold))] text-[hsl(222_47%_8%)] hover:opacity-90 transition-opacity uppercase tracking-wide">
            {t("cn_parts_ask")}
          </button>
        </div>
      )}

      {tab === "parts" && foundParts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {foundParts.map((g) => (
            <div key={g.id} className="card-light rounded-sm p-5 flex flex-col">
              <div className="w-10 h-10 bg-[hsl(var(--navy)/0.06)] rounded-sm flex items-center justify-center mb-3">
                <Icon name={g.icon} size={18} className="text-[hsl(var(--navy))]" />
              </div>
              <h3 className="font-['Montserrat'] font-bold text-base navy leading-tight mb-2">{hl(g.title[lang])}</h3>
              <ul className="flex flex-col gap-1.5 mb-4">
                {g.items.map((it) => {
                  const hit = q !== "" && it[lang].toLowerCase().includes(q);
                  return (
                    <li key={it.ru} className={`flex items-start gap-2 text-sm leading-snug ${hit ? "navy font-semibold" : "text-[hsl(var(--navy)/0.68)]"}`}>
                      <Icon name="Check" size={13} className="text-[hsl(var(--gold))] flex-shrink-0 mt-1" />{hl(it[lang])}
                    </li>
                  );
                })}
              </ul>
              <button type="button" onClick={() => onOpen(g.id, g.title[lang])}
                className="mt-auto w-full flex items-center justify-center gap-1.5 text-[11px] font-['Montserrat'] font-bold px-3 py-2.5 rounded-sm border border-[hsl(var(--gold)/0.4)] navy hover:bg-[hsl(var(--gold))] hover:text-[hsl(222_47%_8%)] hover:border-[hsl(var(--gold))] transition-colors uppercase tracking-wide">
                <Icon name="Search" size={13} />{t("cn_parts_ask")}
              </button>
            </div>
          ))}
        </div>
      )}

      {viewer && (
        <SchemesViewer catalog={viewer} token={token} t={t} onClose={() => setViewer(null)}
          onRequest={(sc, partsText, model) => {
            setViewer(null);
            onOpen(`scheme-${sc.id}`, `${viewer.brand} · ${sc.title}`, { car_brand: viewer.brand, car_model: model, parts_text: partsText });
          }} />
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
                  <textarea value={form.parts_text} rows={form.parts_text.includes("\n") ? Math.min(10, form.parts_text.split("\n").length + 1) : 3} placeholder={t("cn_parts_list_ph")}
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
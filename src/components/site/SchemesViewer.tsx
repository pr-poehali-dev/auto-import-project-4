import { useEffect, useMemo, useState } from "react";
import Icon from "@/components/ui/icon";
import { apiPartsSchemes, type PartsCatalog, type PartsScheme } from "@/lib/site-data";
import { STOCK_OPTIONS, formatPrice } from "@/lib/parts-schemes";

interface SchemesViewerProps {
  catalog: PartsCatalog;
  token: string;
  t: (key: string) => string;
  onClose: () => void;
  onRequest: (scheme: PartsScheme, partsText: string, model: string) => void;
  initialSchemeId?: number;
  highlightArticle?: string;
}

const normArticle = (v: string) => v.replace(/[^A-Za-z0-9]/g, "").toUpperCase();

// Окно просмотра схем марки: список узлов → схема + таблица артикулов с выбором позиций
export default function SchemesViewer({ catalog, token, t, onClose, onRequest, initialSchemeId, highlightArticle }: SchemesViewerProps) {
  const [list, setList] = useState<PartsScheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [model, setModel] = useState("");
  const [scheme, setScheme] = useState<PartsScheme | null>(null);
  const [schemeLoading, setSchemeLoading] = useState(false);
  const [picked, setPicked] = useState<number[]>([]);
  const [filter, setFilter] = useState("");
  const [zoom, setZoom] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);

  useEffect(() => {
    apiPartsSchemes("GET", token, { query: `catalog_id=${catalog.id}` }).then((d) => {
      setList(d.schemes || []);
      setLoading(false);
    });
  }, [catalog.id, token]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { if (zoom) setZoom(false); else onClose(); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoom, onClose]);

  const models = useMemo(() => Array.from(new Set(list.map((s) => s.model).filter(Boolean))), [list]);
  const shown = model ? list.filter((s) => !s.model || s.model === model) : list;

  const [highlight, setHighlight] = useState(highlightArticle ? normArticle(highlightArticle) : "");

  const open = async (id: number, hl = "") => {
    setSchemeLoading(true); setPicked([]); setFilter(""); setInStockOnly(false); setHighlight(hl);
    const d = await apiPartsSchemes("GET", token, { query: `id=${id}` });
    const sc: PartsScheme | null = d.scheme || null;
    setScheme(sc);
    setSchemeLoading(false);
    if (sc && hl) {
      const idx = (sc.items || []).findIndex((it) => normArticle(it.article) === hl);
      if (idx !== -1) {
        setPicked([idx]);
        setTimeout(() => document.getElementById(`scheme-row-${idx}`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 80);
      }
    }
  };

  useEffect(() => {
    if (initialSchemeId) open(initialSchemeId, highlightArticle ? normArticle(highlightArticle) : "");
  }, [initialSchemeId]);

  const items = scheme?.items || [];
  const q = filter.trim().toLowerCase();
  const rows = items.map((it, i) => ({ it, i }))
    .filter(({ it }) => !q || it.article.toLowerCase().includes(q) || it.name.toLowerCase().includes(q) || it.pos.toLowerCase() === q)
    .filter(({ it }) => !inStockOnly || it.stock === "in_stock");
  const hasPrices = items.some((it) => it.price !== null && it.price !== undefined);
  const hasStock = items.some((it) => it.stock);
  const stockBadge = (v: string) => STOCK_OPTIONS.find((o) => o.value === v && v);
  const pickedItems = picked.map((i) => items[i]).filter(Boolean);
  const pickedSum = pickedItems.reduce((sum, it) => sum + (it.price ?? 0) * it.qty, 0);
  const pickedNoPrice = pickedItems.some((it) => it.price === null || it.price === undefined);

  const toggle = (i: number) => setPicked((p) => (p.includes(i) ? p.filter((x) => x !== i) : [...p, i]));
  const allShownPicked = rows.length > 0 && rows.every(({ i }) => picked.includes(i));
  const toggleAll = () => setPicked((p) => allShownPicked
    ? p.filter((x) => !rows.some(({ i }) => i === x))
    : Array.from(new Set([...p, ...rows.map(({ i }) => i)])));

  const sendRequest = () => {
    if (!scheme) return;
    const text = picked.sort((a, b) => a - b).map((i) => {
      const it = items[i];
      const badge = stockBadge(it.stock);
      return [it.pos && `поз. ${it.pos}`, it.article, it.name, it.qty > 1 && `× ${it.qty}`,
        it.price !== null && it.price !== undefined && formatPrice(it.price), badge && t(badge.key)].filter(Boolean).join(" · ");
    }).join("\n");
    onRequest(scheme, text, scheme.model || model);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-stretch sm:items-center justify-center sm:p-4" onClick={onClose}>
      <div className="card-light w-full max-w-6xl sm:rounded-sm max-h-screen sm:max-h-[94vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-[hsl(var(--gold)/0.15)]">
          <div className="flex items-center gap-3 min-w-0">
            {scheme && (
              <button type="button" onClick={() => setScheme(null)} title={t("ps_back")}
                className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-sm border border-[hsl(var(--gold)/0.25)] navy hover:border-[hsl(var(--gold))]">
                <Icon name="ArrowLeft" size={16} />
              </button>
            )}
            <div className="min-w-0">
              <div className="section-tag mb-0.5">{catalog.brand} · {t("ps_schemes_btn")}</div>
              <h3 className="font-['Montserrat'] font-bold text-lg navy leading-tight truncate">{scheme ? scheme.title : catalog.brand}</h3>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-[hsl(var(--navy)/0.5)] hover:text-[hsl(var(--navy))] flex-shrink-0"><Icon name="X" size={22} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {loading || schemeLoading ? (
            <div className="flex items-center gap-3 py-20 justify-center text-[hsl(var(--navy)/0.62)]">
              <Icon name="Loader" size={20} className="animate-spin" />{t("loading")}
            </div>
          ) : !scheme ? (
            list.length === 0 ? (
              <div className="text-center py-14">
                <Icon name="ImageOff" size={38} className="mx-auto mb-3 text-[hsl(var(--navy)/0.4)]" />
                <p className="font-['Montserrat'] font-bold navy mb-1">{t("ps_no_schemes")}</p>
                <p className="text-[hsl(var(--navy)/0.65)] text-sm max-w-sm mx-auto">{t("ps_no_schemes_sub")}</p>
              </div>
            ) : (
              <>
                {models.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {["", ...models].map((m) => (
                      <button key={m || "all"} type="button" onClick={() => setModel(m)}
                        className={`text-[11px] font-['Montserrat'] font-bold px-3 py-1.5 rounded-sm border transition-colors ${model === m ? "bg-[hsl(var(--gold))] text-[hsl(222_47%_8%)] border-[hsl(var(--gold))]" : "border-[hsl(var(--gold)/0.25)] text-[hsl(var(--navy)/0.75)] hover:border-[hsl(var(--gold))]"}`}>
                        {m || t("ps_all")}
                      </button>
                    ))}
                  </div>
                )}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {shown.map((sc) => (
                    <button key={sc.id} type="button" onClick={() => open(sc.id)}
                      className="text-left border border-[hsl(var(--gold)/0.18)] rounded-sm overflow-hidden hover:border-[hsl(var(--gold))] transition-colors group">
                      <div className="aspect-[4/3] bg-white flex items-center justify-center">
                        {sc.image_url ? <img src={sc.image_url} alt={sc.title} loading="lazy" className="w-full h-full object-contain group-hover:scale-[1.03] transition-transform" />
                          : <Icon name="ImageOff" size={26} className="text-gray-300" />}
                      </div>
                      <div className="p-3">
                        <p className="font-['Montserrat'] font-bold text-sm navy leading-tight mb-0.5">{sc.title}</p>
                        <p className="text-[11px] text-[hsl(var(--navy)/0.55)]">{sc.model || t("ps_all_models")} · {sc.items_count} {t("ps_positions")}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="lg:sticky lg:top-0 self-start">
                {scheme.image_url ? (
                  <button type="button" onClick={() => setZoom(true)} className="relative w-full bg-white border border-[hsl(var(--gold)/0.18)] rounded-sm p-2 cursor-zoom-in group">
                    <img src={scheme.image_url} alt={scheme.title} className="w-full max-h-[62vh] object-contain" />
                    <span className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-sm bg-[hsl(222_47%_11%)] text-white opacity-80 group-hover:opacity-100">
                      <Icon name="ZoomIn" size={12} />{t("ps_zoom")}
                    </span>
                  </button>
                ) : (
                  <div className="aspect-[4/3] bg-white border border-[hsl(var(--gold)/0.18)] rounded-sm flex flex-col items-center justify-center gap-2 text-gray-400 text-sm">
                    <Icon name="ImageOff" size={30} />{t("ps_no_image")}
                  </div>
                )}
              </div>

              <div className="flex flex-col min-w-0">
                <p className="text-xs text-[hsl(var(--navy)/0.65)] mb-3">{t("ps_select_hint")}</p>
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  <div className="relative flex-1 min-w-[200px]">
                    <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--navy)/0.45)]" />
                    <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder={t("ps_filter_ph")}
                      className="w-full bg-transparent border border-[hsl(var(--gold)/0.2)] pl-9 pr-3 py-2 text-sm navy rounded-sm focus:outline-none focus:border-[hsl(var(--gold)/0.6)]" />
                  </div>
                  {hasStock && (
                    <label className="flex items-center gap-2 text-xs font-semibold navy cursor-pointer select-none">
                      <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} className="accent-[hsl(var(--gold))]" />
                      {t("ps_in_stock_only")}
                    </label>
                  )}
                </div>
                <div className="overflow-x-auto border border-[hsl(var(--gold)/0.15)] rounded-sm">
                  <table className="w-full text-sm min-w-[620px]">
                    <thead className="bg-[hsl(222_47%_11%)] text-white text-[10px] uppercase tracking-wide font-['Montserrat']">
                      <tr>
                        <th className="w-9 px-2 py-2"><input type="checkbox" checked={allShownPicked} onChange={toggleAll} className="accent-[hsl(var(--gold))]" /></th>
                        <th className="px-2 py-2 w-12 text-left">{t("ps_pos")}</th>
                        <th className="px-2 py-2 text-left">{t("ps_article")}</th>
                        <th className="px-2 py-2 text-left">{t("ps_name")}</th>
                        <th className="px-2 py-2 w-12 text-center">{t("ps_qty")}</th>
                        {hasPrices && <th className="px-2 py-2 text-right whitespace-nowrap">{t("ps_price")}</th>}
                        {hasStock && <th className="px-2 py-2 text-left">{t("ps_stock")}</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map(({ it, i }) => {
                        const on = picked.includes(i);
                        const hl = !!highlight && normArticle(it.article) === highlight;
                        return (
                          <tr key={i} id={`scheme-row-${i}`} onClick={() => toggle(i)}
                            className={`border-t border-[hsl(var(--gold)/0.08)] cursor-pointer transition-colors ${on ? "bg-[hsl(var(--gold)/0.14)]" : "hover:bg-[hsl(var(--gold)/0.05)]"} ${hl ? "outline outline-2 -outline-offset-2 outline-[hsl(var(--gold))]" : ""}`}>
                            <td className="px-2 py-2 text-center"><input type="checkbox" checked={on} readOnly className="accent-[hsl(var(--gold))] pointer-events-none" /></td>
                            <td className="px-2 py-2 font-bold navy">{it.pos}</td>
                            <td className="px-2 py-2 font-mono text-xs navy whitespace-nowrap">{it.article}</td>
                            <td className="px-2 py-2 text-[hsl(var(--navy)/0.8)]">
                              {it.name}
                              {it.note && <span className="block text-[11px] text-[hsl(var(--navy)/0.5)]">{it.note}</span>}
                            </td>
                            <td className="px-2 py-2 text-center text-[hsl(var(--navy)/0.7)]">{it.qty}</td>
                            {hasPrices && (
                              <td className="px-2 py-2 text-right whitespace-nowrap font-semibold navy">
                                {it.price !== null && it.price !== undefined ? formatPrice(it.price)
                                  : <span className="text-[11px] font-normal text-[hsl(var(--navy)/0.5)]">{t("ps_price_on_request")}</span>}
                              </td>
                            )}
                            {hasStock && (
                              <td className="px-2 py-2">
                                {stockBadge(it.stock)
                                  ? <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-sm whitespace-nowrap ${stockBadge(it.stock)!.cls}`}>{t(stockBadge(it.stock)!.key)}</span>
                                  : <span className="text-[hsl(var(--navy)/0.4)]">—</span>}
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {scheme && (
          <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-[hsl(var(--gold)/0.15)] flex-wrap">
            <div className="flex items-baseline gap-x-4 gap-y-0.5 flex-wrap">
              <span className="text-sm navy font-semibold">{t("ps_selected")}: {picked.length}</span>
              {hasPrices && picked.length > 0 && (
                <span className="text-sm navy">
                  {t("ps_selected_sum")}: <b>{formatPrice(pickedSum)}</b>
                  {pickedNoPrice && <span className="text-[11px] text-[hsl(var(--navy)/0.55)] ml-1.5">({t("ps_price_partial")})</span>}
                </span>
              )}
            </div>
            <button type="button" disabled={picked.length === 0} onClick={sendRequest}
              className="flex items-center gap-2 text-xs font-['Montserrat'] font-bold px-6 py-3 rounded-sm bg-[hsl(var(--gold))] text-[hsl(222_47%_8%)] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-wide">
              <Icon name="Send" size={14} />{t("ps_request_selected")}
            </button>
          </div>
        )}
      </div>

      {zoom && scheme?.image_url && (
        <div className="fixed inset-0 z-[60] bg-black/90 overflow-auto cursor-zoom-out" onClick={(e) => { e.stopPropagation(); setZoom(false); }}>
          <img src={scheme.image_url} alt={scheme.title} className="max-w-none w-[180%] sm:w-[140%] mx-auto my-6 bg-white" />
        </div>
      )}
    </div>
  );
}

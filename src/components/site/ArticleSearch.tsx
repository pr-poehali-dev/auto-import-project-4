import { useState } from "react";
import Icon from "@/components/ui/icon";
import { CHINA_PARTS_CATALOGS, apiPartsSchemes, type ArticleHit } from "@/lib/site-data";
import { STOCK_OPTIONS, formatPrice } from "@/lib/parts-schemes";

interface ArticleSearchProps {
  token: string;
  t: (key: string) => string;
  inputCls: string;
  onOpenScheme: (hit: ArticleHit) => void;
  onRequest: (hit: ArticleHit | null, query: string) => void;
}

// Поиск номера детали по всем загруженным схемам: узел, цена, наличие
export default function ArticleSearch({ token, t, inputCls, onOpenScheme, onRequest }: ArticleSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ArticleHit[] | null>(null);
  const [more, setMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hint, setHint] = useState("");

  const norm = query.replace(/[^A-Za-z0-9]/g, "");

  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    if (norm.length < 3) { setHint(t("as_min")); setResults(null); return; }
    setHint(""); setLoading(true);
    const d = await apiPartsSchemes("GET", token, { query: `article=${encodeURIComponent(query.trim())}` });
    setResults(d.results || []);
    setMore(!!d.more);
    setLoading(false);
  };

  const clear = () => { setQuery(""); setResults(null); setHint(""); setMore(false); };
  const brand = (id: string) => CHINA_PARTS_CATALOGS.find((c) => c.id === id)?.brand || id;
  const badge = (v: string) => STOCK_OPTIONS.find((o) => o.value === v && v);

  return (
    <div className="card-light rounded-sm p-5 mb-6">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-9 h-9 rounded-sm bg-[hsl(var(--gold)/0.15)] flex items-center justify-center flex-shrink-0">
          <Icon name="Barcode" fallback="ScanSearch" size={18} className="text-[hsl(var(--gold))]" />
        </div>
        <div>
          <h3 className="font-['Montserrat'] font-bold text-base navy leading-tight">{t("as_title")}</h3>
          <p className="text-[hsl(var(--navy)/0.62)] text-sm">{t("as_sub")}</p>
        </div>
      </div>

      <form onSubmit={search} className="flex gap-2 max-w-xl">
        <div className="relative flex-1">
          <input value={query} onChange={(e) => { setQuery(e.target.value); setHint(""); }} placeholder={t("as_ph")}
            maxLength={64} className={inputCls + " font-mono !pr-10"} />
          {query && (
            <button type="button" onClick={clear} title={t("cn_cat_search_clear")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--navy)/0.45)] hover:text-[hsl(var(--navy))]">
              <Icon name="X" size={15} />
            </button>
          )}
        </div>
        <button type="submit" disabled={loading}
          className="flex items-center gap-1.5 text-xs font-['Montserrat'] font-bold px-5 rounded-sm bg-[hsl(var(--gold))] text-[hsl(222_47%_8%)] hover:opacity-90 disabled:opacity-60 uppercase tracking-wide">
          {loading ? <Icon name="Loader" size={14} className="animate-spin" /> : <Icon name="Search" size={14} />}
          {t("as_btn")}
        </button>
      </form>
      {hint && <p className="text-xs text-[hsl(var(--gold))] font-semibold mt-2">{hint}</p>}

      {results && !loading && (
        results.length === 0 ? (
          <div className="mt-5 border border-dashed border-[hsl(var(--gold)/0.3)] rounded-sm p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-['Montserrat'] font-bold text-sm navy">{t("as_nothing")}</p>
              <p className="text-[hsl(var(--navy)/0.62)] text-sm">{t("as_nothing_sub")}</p>
            </div>
            <button type="button" onClick={() => onRequest(null, query.trim())}
              className="flex-shrink-0 text-xs font-['Montserrat'] font-bold px-5 py-2.5 rounded-sm bg-[hsl(var(--gold))] text-[hsl(222_47%_8%)] hover:opacity-90 uppercase tracking-wide">
              {t("cn_parts_ask")}
            </button>
          </div>
        ) : (
          <div className="mt-5">
            <p className="text-xs font-['Montserrat'] font-semibold text-[hsl(var(--navy)/0.65)] mb-3">
              {t("as_found")}: {results.length}{more && ` · ${t("as_more")}`}
            </p>
            <div className="flex flex-col gap-2.5">
              {results.map((h, k) => {
                const b = badge(h.stock);
                return (
                  <div key={`${h.scheme_id}-${k}`}
                    className={`flex flex-col md:flex-row md:items-center gap-3 p-3 rounded-sm border ${h.exact ? "border-[hsl(var(--gold)/0.55)] bg-[hsl(var(--gold)/0.06)]" : "border-[hsl(var(--gold)/0.15)]"}`}>
                    <button type="button" onClick={() => onOpenScheme(h)}
                      className="w-16 h-16 flex-shrink-0 bg-white rounded-sm border border-[hsl(var(--gold)/0.15)] flex items-center justify-center overflow-hidden hidden md:flex">
                      {h.image_url ? <img src={h.image_url} alt="" loading="lazy" className="w-full h-full object-contain" />
                        : <Icon name="ImageOff" size={18} className="text-gray-300" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="font-mono font-bold text-sm navy">{h.article}</span>
                        {h.exact && <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-sm bg-[hsl(var(--gold))] text-[hsl(222_47%_8%)]">{t("as_exact")}</span>}
                      </div>
                      <p className="text-sm text-[hsl(var(--navy)/0.8)] leading-snug">{h.name}</p>
                      <p className="text-xs text-[hsl(var(--navy)/0.55)] mt-0.5">
                        {brand(h.catalog_id)}{h.model && ` ${h.model}`} · {h.scheme_title}{h.pos && ` · ${t("as_pos")} ${h.pos}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 md:gap-4 flex-wrap md:flex-nowrap">
                      <div className="text-right min-w-[84px]">
                        {h.price !== null && h.price !== undefined
                          ? <span className="font-['Montserrat'] font-bold text-sm navy whitespace-nowrap">{formatPrice(h.price)}</span>
                          : <span className="text-[11px] text-[hsl(var(--navy)/0.5)]">{t("ps_price_on_request")}</span>}
                      </div>
                      {b ? <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm whitespace-nowrap ${b.cls}`}>{t(b.key)}</span>
                        : <span className="text-[hsl(var(--navy)/0.4)] text-xs w-[70px] text-center">—</span>}
                      <button type="button" onClick={() => onOpenScheme(h)}
                        className="flex items-center gap-1 text-[11px] font-['Montserrat'] font-bold px-3 py-2 rounded-sm border border-[hsl(var(--gold)/0.35)] navy hover:border-[hsl(var(--gold))] whitespace-nowrap">
                        <Icon name="Images" size={12} />{t("as_open")}
                      </button>
                      <button type="button" onClick={() => onRequest(h, query.trim())}
                        className="flex items-center gap-1 text-[11px] font-['Montserrat'] font-bold px-3 py-2 rounded-sm bg-[hsl(var(--gold))] text-[hsl(222_47%_8%)] hover:opacity-90 whitespace-nowrap">
                        <Icon name="Send" size={12} />{t("as_request")}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )
      )}
    </div>
  );
}

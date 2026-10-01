import { useEffect, useRef, useState } from "react";
import * as XLSX from "xlsx";
import Icon from "@/components/ui/icon";
import type { SiteState } from "@/hooks/useSiteState";
import { CHINA_PARTS_CATALOGS, apiPartsSchemes, type PartsScheme, type SchemeItem } from "@/lib/site-data";
import { compressImage, parseSchemeSheet, downloadSchemeTemplate } from "@/lib/parts-schemes";

const emptyRow = (): SchemeItem => ({ pos: "", article: "", name: "", qty: 1, note: "" });

interface Draft { id: number; catalog_id: string; model: string; title: string; image: string; sort_order: string; items: SchemeItem[]; }

// Кабинет сотрудника: загрузка схем узлов и таблиц артикулов по маркам Китая
export default function TabPartsSchemes(s: SiteState) {
  const { cabinetTab, isStaff, token, t, inputCls } = s;
  const [catalogId, setCatalogId] = useState(CHINA_PARTS_CATALOGS[0].id);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [schemes, setSchemes] = useState<PartsScheme[]>([]);
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const imgInput = useRef<HTMLInputElement>(null);
  const xlsInput = useRef<HTMLInputElement>(null);

  const active = cabinetTab === "parts_schemes" && isStaff;
  const catalog = CHINA_PARTS_CATALOGS.find((c) => c.id === catalogId)!;

  const loadList = async (id = catalogId) => {
    setLoading(true);
    const [l, c] = await Promise.all([
      apiPartsSchemes("GET", token, { query: `catalog_id=${id}` }),
      apiPartsSchemes("GET", token),
    ]);
    setSchemes(l.schemes || []);
    setCounts(c.counts || {});
    setLoading(false);
  };

  useEffect(() => { if (active) loadList(catalogId); }, [active, catalogId]);

  if (!active) return null;

  const labelCls = "block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-wide uppercase mb-2";
  const cellCls = "w-full bg-transparent border border-[hsl(var(--gold)/0.15)] px-2 py-1.5 text-sm navy focus:outline-none focus:border-[hsl(var(--gold)/0.55)] rounded-sm";

  const startNew = () => {
    setMsg("");
    setDraft({ id: 0, catalog_id: catalogId, model: "", title: "", image: "", sort_order: String(schemes.length + 1), items: [emptyRow()] });
  };

  const startEdit = async (id: number) => {
    setMsg("");
    const d = await apiPartsSchemes("GET", token, { query: `id=${id}` });
    if (!d.scheme) return;
    const sc: PartsScheme = d.scheme;
    setDraft({ id: sc.id, catalog_id: sc.catalog_id, model: sc.model, title: sc.title, image: sc.image_url,
      sort_order: String(sc.sort_order), items: sc.items && sc.items.length ? sc.items : [emptyRow()] });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = async (id: number) => {
    if (!confirm(t("ps_delete_confirm"))) return;
    await apiPartsSchemes("DELETE", token, { query: `id=${id}` });
    if (draft?.id === id) setDraft(null);
    loadList();
  };

  const pickImage = async (file?: File) => {
    if (!file || !draft) return;
    const data = await compressImage(file);
    setDraft({ ...draft, image: data });
  };

  const importXls = async (file?: File) => {
    if (!file || !draft) return;
    const wb = XLSX.read(await file.arrayBuffer(), { type: "array" });
    const rows = parseSchemeSheet(wb);
    if (rows.length === 0) { setMsg(t("ps_import_fail")); return; }
    setDraft({ ...draft, items: rows });
    setMsg(`${t("ps_imported")}: ${rows.length}`);
  };

  const setRow = (i: number, patch: Partial<SchemeItem>) => {
    if (!draft) return;
    setDraft({ ...draft, items: draft.items.map((r, k) => (k === i ? { ...r, ...patch } : r)) });
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft) return;
    setSaving(true); setMsg("");
    const d = await apiPartsSchemes("POST", token, { body: {
      id: draft.id || undefined, catalog_id: draft.catalog_id, model: draft.model, title: draft.title,
      image: draft.image, sort_order: parseInt(draft.sort_order) || 0,
      items: draft.items.filter((r) => r.article.trim() || r.name.trim()),
    } });
    setSaving(false);
    if (d.error) { setMsg(d.error); return; }
    setDraft(null);
    if (draft.catalog_id !== catalogId) setCatalogId(draft.catalog_id); else loadList();
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-['Montserrat'] font-bold text-xl navy mb-1">{t("ps_title")}</h2>
        <p className="text-[hsl(var(--navy)/0.65)] text-sm max-w-3xl">{t("ps_sub")}</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {CHINA_PARTS_CATALOGS.map((c) => (
          <button key={c.id} type="button" onClick={() => { setCatalogId(c.id); setDraft(null); }}
            className={`flex items-center gap-1.5 text-xs font-['Montserrat'] font-bold px-3 py-2 rounded-sm border transition-colors ${catalogId === c.id ? "bg-[hsl(var(--gold))] text-[hsl(222_47%_8%)] border-[hsl(var(--gold))]" : "border-[hsl(var(--gold)/0.2)] text-[hsl(var(--navy)/0.7)] hover:border-[hsl(var(--gold)/0.6)]"}`}>
            {c.brand}
            {counts[c.id] ? <span className={`px-1.5 rounded-full text-[10px] ${catalogId === c.id ? "bg-black/15" : "bg-[hsl(var(--gold)/0.15)]"}`}>{counts[c.id]}</span> : null}
          </button>
        ))}
      </div>

      {draft && (
        <form onSubmit={save} className="card-light rounded-sm p-5 sm:p-6 mb-8">
          <div className="flex items-center justify-between gap-3 mb-5">
            <h3 className="font-['Montserrat'] font-bold text-lg navy">{draft.id ? t("ps_edit") : t("ps_new")}</h3>
            <button type="button" onClick={() => setDraft(null)} className="text-[hsl(var(--navy)/0.5)] hover:text-[hsl(var(--navy))]"><Icon name="X" size={20} /></button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
            <div>
              <label className={labelCls}>{t("ps_brand")}</label>
              <select value={draft.catalog_id} onChange={(e) => setDraft({ ...draft, catalog_id: e.target.value, model: "" })} className={inputCls}>
                {CHINA_PARTS_CATALOGS.map((c) => <option key={c.id} value={c.id}>{c.brand}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>{t("ps_model")}</label>
              <select value={draft.model} onChange={(e) => setDraft({ ...draft, model: e.target.value })} className={inputCls}>
                <option value="">{t("ps_all_models")}</option>
                {CHINA_PARTS_CATALOGS.find((c) => c.id === draft.catalog_id)?.models.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="md:col-span-1">
              <label className={labelCls}>{t("ps_node")} *</label>
              <input required maxLength={160} value={draft.title} placeholder={t("ps_node_ph")}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>{t("ps_order")}</label>
              <input type="number" value={draft.sort_order} onChange={(e) => setDraft({ ...draft, sort_order: e.target.value })} className={inputCls} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-2">
              <label className={labelCls}>{t("ps_image")}</label>
              <input ref={imgInput} type="file" accept="image/png,image/jpeg,image/webp" className="hidden"
                onChange={(e) => { pickImage(e.target.files?.[0]); e.target.value = ""; }} />
              {draft.image ? (
                <div className="border border-[hsl(var(--gold)/0.2)] rounded-sm bg-white p-2">
                  <img src={draft.image} alt="" className="w-full max-h-[420px] object-contain" />
                  <button type="button" onClick={() => imgInput.current?.click()}
                    className="mt-2 w-full text-xs font-['Montserrat'] font-bold py-2 rounded-sm border border-[hsl(var(--gold)/0.3)] text-[hsl(222_47%_11%)] hover:bg-[hsl(var(--gold)/0.12)]">
                    {t("ps_image_change")}
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => imgInput.current?.click()}
                  className="w-full aspect-[4/3] border-2 border-dashed border-[hsl(var(--gold)/0.3)] rounded-sm flex flex-col items-center justify-center gap-2 text-[hsl(var(--navy)/0.6)] hover:border-[hsl(var(--gold))] transition-colors">
                  <Icon name="ImagePlus" size={30} />
                  <span className="text-sm font-semibold">{t("ps_image_pick")}</span>
                  <span className="text-xs px-6 text-center">{t("ps_image_hint")}</span>
                </button>
              )}
            </div>

            <div className="lg:col-span-3">
              <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                <span className={labelCls + " !mb-0"}>{t("ps_items")} · {draft.items.filter((r) => r.article || r.name).length}</span>
                <div className="flex gap-2 flex-wrap">
                  <input ref={xlsInput} type="file" accept=".xlsx,.xls,.csv" className="hidden"
                    onChange={(e) => { importXls(e.target.files?.[0]); e.target.value = ""; }} />
                  <button type="button" onClick={downloadSchemeTemplate}
                    className="flex items-center gap-1.5 text-[11px] font-['Montserrat'] font-bold px-3 py-2 rounded-sm border border-[hsl(var(--gold)/0.25)] text-[hsl(var(--navy)/0.75)] hover:border-[hsl(var(--gold))]">
                    <Icon name="Download" size={13} />{t("ps_template")}
                  </button>
                  <button type="button" onClick={() => xlsInput.current?.click()}
                    className="flex items-center gap-1.5 text-[11px] font-['Montserrat'] font-bold px-3 py-2 rounded-sm bg-[hsl(var(--gold))] text-[hsl(222_47%_8%)] hover:opacity-90">
                    <Icon name="FileSpreadsheet" size={13} />{t("ps_import")}
                  </button>
                </div>
              </div>
              {msg && <p className="text-xs font-semibold text-[hsl(var(--gold))] mb-2">{msg}</p>}
              <div className="overflow-x-auto max-h-[460px] overflow-y-auto border border-[hsl(var(--gold)/0.15)] rounded-sm">
                <table className="w-full text-sm min-w-[560px]">
                  <thead className="sticky top-0 bg-[hsl(222_47%_11%)] text-white text-[10px] uppercase tracking-wide font-['Montserrat']">
                    <tr>
                      <th className="px-2 py-2 w-14 text-left">{t("ps_pos")}</th>
                      <th className="px-2 py-2 w-36 text-left">{t("ps_article")}</th>
                      <th className="px-2 py-2 text-left">{t("ps_name")}</th>
                      <th className="px-2 py-2 w-16 text-left">{t("ps_qty")}</th>
                      <th className="px-2 py-2 w-32 text-left">{t("ps_note")}</th>
                      <th className="w-8" />
                    </tr>
                  </thead>
                  <tbody>
                    {draft.items.map((r, i) => (
                      <tr key={i} className="border-t border-[hsl(var(--gold)/0.08)]">
                        <td className="p-1"><input value={r.pos} onChange={(e) => setRow(i, { pos: e.target.value })} className={cellCls} /></td>
                        <td className="p-1"><input value={r.article} onChange={(e) => setRow(i, { article: e.target.value })} className={cellCls + " font-mono"} /></td>
                        <td className="p-1"><input value={r.name} onChange={(e) => setRow(i, { name: e.target.value })} className={cellCls} /></td>
                        <td className="p-1"><input type="number" min={1} value={r.qty} onChange={(e) => setRow(i, { qty: Math.max(1, parseInt(e.target.value) || 1) })} className={cellCls} /></td>
                        <td className="p-1"><input value={r.note} onChange={(e) => setRow(i, { note: e.target.value })} className={cellCls} /></td>
                        <td className="p-1 text-center">
                          <button type="button" onClick={() => setDraft({ ...draft, items: draft.items.filter((_, k) => k !== i) })}
                            className="text-[hsl(var(--navy)/0.4)] hover:text-red-500"><Icon name="Trash2" size={14} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button type="button" onClick={() => setDraft({ ...draft, items: [...draft.items, emptyRow()] })}
                className="mt-2 flex items-center gap-1.5 text-xs font-['Montserrat'] font-bold text-[hsl(var(--gold))] hover:opacity-80">
                <Icon name="Plus" size={14} />{t("ps_add_row")}
              </button>
            </div>
          </div>

          <div className="flex gap-3 mt-6 pt-5 border-t border-[hsl(var(--gold)/0.12)]">
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 text-xs font-['Montserrat'] font-bold px-6 py-3 rounded-sm bg-[hsl(var(--gold))] text-[hsl(222_47%_8%)] hover:opacity-90 disabled:opacity-60 uppercase tracking-wide">
              {saving ? <Icon name="Loader" size={14} className="animate-spin" /> : <Icon name="Save" size={14} />}
              {saving ? t("ps_saving") : t("ps_save")}
            </button>
            <button type="button" onClick={() => setDraft(null)}
              className="text-xs font-['Montserrat'] font-bold px-6 py-3 rounded-sm border border-[hsl(var(--gold)/0.25)] text-[hsl(var(--navy)/0.75)] uppercase tracking-wide">
              {t("ps_cancel")}
            </button>
          </div>
        </form>
      )}

      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 className="font-['Montserrat'] font-bold text-base navy">{catalog.brand}</h3>
        {!draft && (
          <button type="button" onClick={startNew}
            className="flex items-center gap-1.5 text-xs font-['Montserrat'] font-bold px-4 py-2.5 rounded-sm bg-[hsl(var(--gold))] text-[hsl(222_47%_8%)] hover:opacity-90 uppercase tracking-wide">
            <Icon name="Plus" size={14} />{t("ps_add")}
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center gap-3 py-12 justify-center text-[hsl(var(--navy)/0.62)]">
          <Icon name="Loader" size={20} className="animate-spin" />{t("loading")}
        </div>
      ) : schemes.length === 0 ? (
        <div className="card-light rounded-sm p-10 text-center">
          <Icon name="ImageOff" size={34} className="mx-auto mb-3 text-[hsl(var(--navy)/0.4)]" />
          <p className="font-['Montserrat'] font-bold navy mb-1">{t("ps_empty_brand")}</p>
          <p className="text-[hsl(var(--navy)/0.65)] text-sm">{t("ps_empty_brand_sub")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {schemes.map((sc) => (
            <div key={sc.id} className="card-light rounded-sm overflow-hidden flex flex-col">
              <div className="aspect-[4/3] bg-white flex items-center justify-center">
                {sc.image_url ? <img src={sc.image_url} alt="" className="w-full h-full object-contain" />
                  : <Icon name="ImageOff" size={28} className="text-gray-300" />}
              </div>
              <div className="p-4 flex flex-col flex-1">
                <p className="font-['Montserrat'] font-bold text-sm navy leading-tight mb-1">{sc.title}</p>
                <p className="text-xs text-[hsl(var(--navy)/0.55)] mb-3">{sc.model || t("ps_all_models")} · {sc.items_count} {t("ps_positions")}</p>
                <div className="mt-auto flex gap-2">
                  <button type="button" onClick={() => startEdit(sc.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-['Montserrat'] font-bold py-2 rounded-sm border border-[hsl(var(--gold)/0.35)] navy hover:bg-[hsl(var(--gold)/0.12)]">
                    <Icon name="Pencil" size={12} />{t("ps_edit")}
                  </button>
                  <button type="button" onClick={() => remove(sc.id)}
                    className="px-3 rounded-sm border border-[hsl(var(--gold)/0.2)] text-[hsl(var(--navy)/0.5)] hover:text-red-500 hover:border-red-300">
                    <Icon name="Trash2" size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

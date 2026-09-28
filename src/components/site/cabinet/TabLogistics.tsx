import Icon from "@/components/ui/icon";
import type { SiteState } from "@/hooks/useSiteState";
import type { TeardownMode } from "@/components/TeardownModeBadge";
import {
  ORIGIN_LABEL,STATUS_COLOR,STATUS_LABEL,detectTeardownMode,groupTeardown,
} from "@/lib/site-data";

export default function TabLogistics(s: SiteState) {
  const {
    addTargetContainer,
    availableCars,
    cabinetTab,
    containerForm,
    containerFormOpen,
    containerSaving,
    containers,
    containersLoading,
    doAddToContainer,
    doCreateContainer,
    doRemoveFromContainer,
    exportContainerPdf,
    exportContainerXlsx,
    exportPackingList,
    exportPackingListXlsx,
    inputCls,
    lang,
    openOrderCars,
    orders,
    ordersLoading,
    pickedCars,
    renderTdBadge,
    setAddTargetContainer,
    setCabinetTab,
    setContainerForm,
    setContainerFormOpen,
    setContainerStatus,
    setTdFilter,
    t,
    tdFilter,
    exportEngineDocXlsx,
    containerPartsSummary,
    openSummaryId,
    toggleContainerSummary,
    teardownCars,
    teardownCarsLoading,
    togglePickedCar,
  } = s;

  return (
    <>
              {/* ── Заявки в работе (сотрудник) ── */}
              {(cabinetTab === "in_work" || cabinetTab === "shipping") && (() => {
                const inWorkStatuses = ["processing", "auction"];
                const shippingStatuses = ["shipped", "customs", "delivered", "done"];
                const wanted = cabinetTab === "in_work" ? inWorkStatuses : shippingStatuses;
                const list = orders.filter((o) => wanted.includes(o.status));
                const emptyKey = cabinetTab === "in_work" ? "in_work_empty" : "shipping_empty";
                const emptySubKey = cabinetTab === "in_work" ? "in_work_empty_sub" : "shipping_empty_sub";
                const emptyIcon = cabinetTab === "in_work" ? "Loader" : "Truck";
                return (
                  <div>
                    <div className="flex items-center gap-2 mb-5">
                      <h2 className="font-['Montserrat'] font-bold text-xl navy">{cabinetTab === "in_work" ? t("tab_in_work") : t("tab_shipping")}</h2>
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-[hsl(var(--gold)/0.12)] text-[hsl(var(--gold))]">{list.length}</span>
                    </div>
                    {ordersLoading ? (
                      <div className="flex items-center gap-3 py-16 justify-center text-[hsl(var(--navy)/0.62)]">
                        <Icon name="Loader" size={20} className="animate-spin" />{t("loading")}
                      </div>
                    ) : list.length === 0 ? (
                      <div className="text-center py-16">
                        <Icon name={emptyIcon} size={40} className="mx-auto mb-4 text-[hsl(var(--navy)/0.4)]" />
                        <p className="font-['Montserrat'] font-bold navy mb-2">{t(emptyKey)}</p>
                        <p className="text-[hsl(var(--navy)/0.65)] text-sm">{t(emptySubKey)}</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {list.map((o) => (
                          <div key={o.id} onClick={() => { openOrderCars(o); setCabinetTab("clients"); }}
                            className="card-light rounded-sm p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:shadow-md transition-all">
                            <div className="flex items-start gap-4">
                              <div className="w-10 h-10 bg-[hsl(var(--navy)/0.06)] rounded-sm flex items-center justify-center flex-shrink-0">
                                <Icon name={cabinetTab === "in_work" ? "Wrench" : "Truck"} size={18} className="text-[hsl(var(--navy))]" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-['Montserrat'] font-bold text-sm navy">{o.order_number}</span>
                                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_COLOR[o.status] || "bg-gray-100 text-gray-600"}`}>{STATUS_LABEL[lang][o.status] || o.status_label}</span>
                                  {!!o.cars_count && <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-[hsl(var(--gold)/0.12)] text-[hsl(var(--gold))]">{o.cars_count} {t("cars_word")}</span>}
                                </div>
                                <div className="text-[hsl(var(--navy))] text-sm font-semibold mt-1">{o.client_name || o.client_email}{o.client_company ? ` · ${o.client_company}` : ""}</div>
                                <div className="text-[hsl(var(--navy)/0.55)] text-sm mt-0.5">
                                  {t("request_word")} {[o.car_brand, o.car_model, o.car_year].filter(Boolean).join(" ")} · {ORIGIN_LABEL[lang][o.origin] || o.origin} · {o.quantity} {t("pcs")}
                                </div>
                                <div className="text-[hsl(var(--navy)/0.6)] text-xs mt-1">{o.client_phone} · {new Date(o.created_at).toLocaleDateString(lang)}</div>
                              </div>
                            </div>
                            <Icon name="ChevronRight" size={20} className="text-[hsl(var(--navy)/0.55)]" />
                          </div>
                        ))}
                      </div>
                    )}

                    {cabinetTab === "shipping" && (
                      <div className="mt-10 pt-8 border-t border-[hsl(var(--gold)/0.15)]">
                        <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
                          <div className="flex items-center gap-2">
                            <Icon name="Container" size={20} className="text-[hsl(var(--navy))]" />
                            <h2 className="font-['Montserrat'] font-bold text-xl navy">{t("containers_title")}</h2>
                            <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-[hsl(var(--gold)/0.12)] text-[hsl(var(--gold))]">{containers.length}</span>
                          </div>
                          {!containerFormOpen && (
                            <button onClick={() => setContainerFormOpen(true)} className="flex items-center gap-2 px-5 py-2.5 btn-navy rounded-sm text-sm">
                              <Icon name="Plus" size={16} />{t("container_new")}
                            </button>
                          )}
                        </div>

                        {containerFormOpen && (
                          <form onSubmit={doCreateContainer} className="card-light rounded-sm p-6 flex flex-col gap-4 mb-6">
                            <div className="flex items-center justify-between">
                              <h3 className="font-['Montserrat'] font-bold text-lg navy">{t("container_new")}</h3>
                              <button type="button" onClick={() => setContainerFormOpen(false)} className="text-[hsl(var(--navy)/0.6)] hover:text-red-600"><Icon name="X" size={18} /></button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-wide uppercase mb-2">{t("container_name")}</label>
                                <input required placeholder="Контейнер №1" value={containerForm.name} onChange={(e) => setContainerForm({ ...containerForm, name: e.target.value })} className={inputCls} />
                              </div>
                              <div>
                                <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-wide uppercase mb-2">{t("container_number")}</label>
                                <input placeholder="MSKU1234567" value={containerForm.container_number} onChange={(e) => setContainerForm({ ...containerForm, container_number: e.target.value.toUpperCase() })} className={inputCls + " font-mono"} />
                              </div>
                              <div>
                                <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-wide uppercase mb-2">{t("direction")}</label>
                                <select value={containerForm.origin} onChange={(e) => setContainerForm({ ...containerForm, origin: e.target.value })} className={inputCls}>
                                  <option value="Япония">{ORIGIN_LABEL[lang]["Япония"]}</option>
                                  <option value="Корея">{ORIGIN_LABEL[lang]["Корея"]}</option>
                                  <option value="Гонконг">{ORIGIN_LABEL[lang]["Гонконг"]}</option>
                                  <option value="Китай">{ORIGIN_LABEL[lang]["Китай"]}</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-wide uppercase mb-2">{t("comment")}</label>
                                <input placeholder="" value={containerForm.comment} onChange={(e) => setContainerForm({ ...containerForm, comment: e.target.value })} className={inputCls} />
                              </div>
                            </div>
                            <button type="submit" disabled={containerSaving} className="self-start px-6 py-3 btn-navy rounded-sm disabled:opacity-60">{containerSaving ? t("saving") : t("container_create")}</button>
                          </form>
                        )}

                        {containersLoading ? (
                          <div className="flex items-center gap-3 py-10 justify-center text-[hsl(var(--navy)/0.62)]"><Icon name="Loader" size={20} className="animate-spin" />{t("loading")}</div>
                        ) : (
                          <>
                            {/* Выбор машинокомплектов из заявок в работе */}
                            <div className="card-light rounded-sm p-5 mb-6">
                              <h3 className="font-['Montserrat'] font-bold navy mb-1">{t("container_pick_title")}</h3>
                              <p className="text-[hsl(var(--navy)/0.62)] text-sm mb-4">{t("container_pick_hint")}</p>
                              {availableCars.length === 0 ? (
                                <p className="text-[hsl(var(--navy)/0.6)] text-sm py-3">{t("container_no_cars")}</p>
                              ) : (
                                <>
                                  <div className="flex flex-col gap-2 mb-4">
                                    {availableCars.map((c) => {
                                      const picked = pickedCars.includes(c.id);
                                      return (
                                        <label key={c.id} className={`flex items-center gap-3 px-3 py-2.5 rounded-sm border cursor-pointer transition-colors ${picked ? "border-[hsl(var(--gold))] bg-[hsl(var(--gold)/0.06)]" : "border-[hsl(var(--gold)/0.15)] hover:border-[hsl(var(--navy))]"}`}>
                                          <span className={`w-5 h-5 rounded-sm border flex items-center justify-center flex-shrink-0 ${picked ? "bg-[hsl(var(--gold))] border-[hsl(var(--gold))]" : "bg-[hsl(222_46%_8%)] border-[hsl(var(--gold)/0.3)]"}`}>
                                            {picked && <Icon name="Check" size={13} className="text-white" />}
                                          </span>
                                          <input type="checkbox" checked={picked} onChange={() => togglePickedCar(c.id)} className="hidden" />
                                          <div className="min-w-0">
                                            <div className="text-sm font-semibold navy">{[c.car_brand, c.car_model, c.car_year].filter(Boolean).join(" ") || "—"}{c.vin && <span className="font-mono text-xs text-[hsl(var(--navy)/0.55)] ml-2">{c.vin}</span>}</div>
                                            <div className="text-xs text-[hsl(var(--navy)/0.55)]">{c.order_number} · {c.client_name || c.client_company || "—"} · {ORIGIN_LABEL[lang][c.origin] || c.origin}</div>
                                          </div>
                                        </label>
                                      );
                                    })}
                                  </div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-sm text-[hsl(var(--navy)/0.65)]">{t("container_picked")}: {pickedCars.length}</span>
                                    <select value={addTargetContainer} onChange={(e) => setAddTargetContainer(e.target.value ? Number(e.target.value) : "")} className={inputCls + " max-w-xs"}>
                                      <option value="">{t("container_choose")}</option>
                                      {containers.map((ct) => (<option key={ct.id} value={ct.id}>{ct.name}{ct.container_number ? ` (${ct.container_number})` : ""}</option>))}
                                    </select>
                                    <button type="button" onClick={doAddToContainer} disabled={!addTargetContainer || pickedCars.length === 0}
                                      className="px-5 py-2.5 btn-navy rounded-sm text-sm disabled:opacity-50">{t("container_add")}</button>
                                  </div>
                                </>
                              )}
                            </div>

                            {/* Список контейнеров */}
                            {containers.length === 0 ? (
                              <div className="text-center py-10 text-[hsl(var(--navy)/0.6)]">
                                <Icon name="Container" size={36} className="mx-auto mb-3 opacity-40" />
                                <p className="text-sm">{t("container_empty")}</p>
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {containers.map((ct) => (
                                  <div key={ct.id} className="card-light rounded-sm p-5">
                                    <div className="flex items-start justify-between gap-3">
                                      <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <span className="font-['Montserrat'] font-bold navy">{ct.name}</span>
                                          <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-[hsl(var(--navy)/0.06)] text-[hsl(var(--navy))]">{ct.status_label}</span>
                                        </div>
                                        {ct.container_number && <div className="text-xs font-mono text-[hsl(var(--navy)/0.6)] mt-0.5">{ct.container_number}</div>}
                                        <div className="text-xs text-[hsl(var(--navy)/0.55)] mt-0.5">{ORIGIN_LABEL[lang][ct.origin] || ct.origin} · {ct.cars.length} {t("cars_word")}</div>
                                      </div>
                                      <div className="flex items-center gap-2 flex-shrink-0">
                                        <button type="button" onClick={() => exportContainerPdf(ct)} title="PDF" className="flex items-center gap-1 text-[11px] font-['Montserrat'] font-bold text-[hsl(var(--navy))] hover:text-[hsl(var(--gold))] transition-colors">
                                          <Icon name="FileDown" size={14} />PDF
                                        </button>
                                        <button type="button" onClick={() => exportContainerXlsx(ct)} title="XLSX" className="flex items-center gap-1 text-[11px] font-['Montserrat'] font-bold text-[hsl(var(--navy))] hover:text-[hsl(var(--gold))] transition-colors">
                                          <Icon name="Sheet" size={14} />XLSX
                                        </button>
                                        <select value={ct.status} onChange={(e) => setContainerStatus(ct.id, e.target.value)} className="text-xs border border-[hsl(var(--gold)/0.18)] rounded-sm px-2 py-1 bg-[hsl(222_46%_8%)] navy">
                                          <option value="collecting">{t("cst_collecting")}</option>
                                          <option value="shipped">{t("cst_shipped")}</option>
                                          <option value="arrived">{t("cst_arrived")}</option>
                                          <option value="done">{t("cst_done")}</option>
                                        </select>
                                      </div>
                                    </div>
                                    {ct.cars.length > 0 ? (
                                      <div className="mt-3 pt-3 border-t border-[hsl(var(--gold)/0.12)] flex flex-col gap-1.5">
                                        {ct.cars.map((c) => (
                                          <div key={c.id} className="flex items-center justify-between gap-2 text-sm">
                                            <span className="navy min-w-0 truncate">{[c.car_brand, c.car_model, c.car_year].filter(Boolean).join(" ") || "—"}<span className="text-[hsl(var(--navy)/0.5)] ml-1">· {c.order_number}</span></span>
                                            <button onClick={() => doRemoveFromContainer(ct.id, c.id)} className="text-[hsl(var(--navy)/0.5)] hover:text-red-600 flex-shrink-0"><Icon name="X" size={14} /></button>
                                          </div>
                                        ))}
                                        {(() => {
                                          const sum = containerPartsSummary(ct.cars);
                                          if (sum.positions === 0) return null;
                                          const open = openSummaryId === ct.id;
                                          return (
                                            <div className="mt-2 pt-2 border-t border-[hsl(var(--gold)/0.12)]">
                                              <button type="button" onClick={() => toggleContainerSummary(ct.id)}
                                                className="w-full flex items-center justify-between gap-2 text-left group">
                                                <span className="flex items-center gap-1.5 text-[11px] font-['Montserrat'] font-bold uppercase tracking-wide text-[hsl(var(--gold))]">
                                                  <Icon name={open ? "ChevronDown" : "ChevronRight"} size={13} />{t("ct_parts_summary")}
                                                </span>
                                                <span className="text-[11px] text-[hsl(var(--navy)/0.6)] flex-shrink-0">
                                                  {sum.positions} {t("ct_sum_pos")} · <span className="font-bold navy">{sum.totalQty}</span> {t("ct_sum_pcs")}
                                                  {sum.neededQty > 0 && <> · <span className="font-bold text-[hsl(var(--gold))]">{sum.neededQty}</span> {t("ct_sum_needed")}</>}
                                                </span>
                                              </button>
                                              {open && (
                                                <div className="mt-2 flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
                                                  {sum.groups.map((g) => (
                                                    <div key={g.group}>
                                                      <div className="flex items-center justify-between gap-2 text-[10px] font-['Montserrat'] font-bold uppercase tracking-wide text-[hsl(var(--navy)/0.5)] mb-0.5">
                                                        <span className="truncate">{g.group}</span>
                                                        <span className="flex-shrink-0">{g.qty} {t("ct_sum_pcs")}</span>
                                                      </div>
                                                      <div className="flex flex-col gap-0.5">
                                                        {g.rows.map((r) => (
                                                          <div key={r.group + r.part} className="flex items-center justify-between gap-2 text-xs">
                                                            <span className="text-[hsl(var(--navy)/0.72)] min-w-0 truncate">{r.part}</span>
                                                            <span className="flex items-center gap-2 flex-shrink-0 font-mono">
                                                              {r.needed > 0 && <span className="text-[hsl(var(--gold))] font-bold">{r.needed}</span>}
                                                              <span className="navy font-semibold">{r.qty}</span>
                                                            </span>
                                                          </div>
                                                        ))}
                                                      </div>
                                                    </div>
                                                  ))}
                                                </div>
                                              )}
                                            </div>
                                          );
                                        })()}
                                      </div>
                                    ) : (
                                      <p className="mt-3 pt-3 border-t border-[hsl(var(--gold)/0.12)] text-xs text-[hsl(var(--navy)/0.55)]">{t("container_no_items")}</p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* ── Разборные листы (сотрудник) ── */}
              {cabinetTab === "teardowns" && (
                <div>
                  {teardownCarsLoading ? (
                    <div className="flex items-center gap-3 py-16 justify-center text-[hsl(var(--navy)/0.62)]">
                      <Icon name="Loader" size={20} className="animate-spin" />{t("loading")}
                    </div>
                  ) : teardownCars.length === 0 ? (
                    <div className="text-center py-16">
                      <Icon name="Wrench" size={40} className="mx-auto mb-4 text-[hsl(var(--navy)/0.4)]" />
                      <p className="font-['Montserrat'] font-bold navy mb-2">{t("teardowns_empty")}</p>
                      <p className="text-[hsl(var(--navy)/0.65)] text-sm">{t("teardowns_empty_sub")}</p>
                    </div>
                  ) : (() => {
                    const tdCounts: Record<string, number> = { all: teardownCars.length };
                    for (const c of teardownCars) {
                      const m = detectTeardownMode(c.teardown || []);
                      if (m) tdCounts[m] = (tdCounts[m] || 0) + 1;
                    }
                    const filterOpts: { key: TeardownMode | "all"; label: string; icon: string }[] = [
                      { key: "all", label: t("td_filter_all"), icon: "LayoutGrid" },
                      { key: "halfcut", label: t("td_badge_halfcut"), icon: "Package" },
                      { key: "full", label: t("td_badge_full"), icon: "ListChecks" },
                      { key: "noskat", label: t("td_badge_noskat"), icon: "CarFront" },
                      { key: "custom", label: t("td_badge_custom"), icon: "Wrench" },
                    ];
                    const visibleCars = tdFilter === "all"
                      ? teardownCars
                      : teardownCars.filter((c) => detectTeardownMode(c.teardown || []) === tdFilter);
                    return (
                    <div>
                      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
                        <div className="flex items-center gap-2">
                          <h2 className="font-['Montserrat'] font-bold text-xl navy">{t("teardowns_all_cars")}</h2>
                          <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-[hsl(var(--gold)/0.12)] text-[hsl(var(--gold))]">{teardownCars.length}</span>
                        </div>
                        {(() => {
                          const inTd = teardownCars.filter((c) => c.order_status === "teardown");
                          const incomplete = inTd.filter((c) => !c.vin || !c.engine_model || !c.engine_number).length;
                          return (
                            <div className="flex items-center gap-2 flex-wrap">
                              {incomplete > 0 && (
                                <span className="flex items-center gap-1.5 text-xs font-['Montserrat'] font-bold px-3 py-2 rounded-sm bg-red-50 border border-red-300 text-red-700">
                                  <Icon name="TriangleAlert" size={14} />{t("td_missing_count")}: {incomplete}
                                </span>
                              )}
                              <button type="button" onClick={exportEngineDocXlsx} disabled={inTd.length === 0}
                                className="flex items-center gap-2 text-xs font-['Montserrat'] font-bold px-4 py-2 rounded-sm bg-[hsl(var(--gold))] text-[hsl(222_47%_8%)] hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed">
                                <Icon name="FileSpreadsheet" size={14} />{t("eng_doc")}
                                <span className="px-1.5 rounded-full text-[10px] bg-[hsl(222_47%_8%)/0.15]">{inTd.length}</span>
                              </button>
                            </div>
                          );
                        })()}
                      </div>
                      <div className="flex flex-wrap gap-2 mb-5">
                        {filterOpts.map((o) => {
                          const cnt = tdCounts[o.key] || 0;
                          const active = tdFilter === o.key;
                          return (
                            <button key={o.key} type="button" onClick={() => setTdFilter(o.key)} disabled={cnt === 0 && o.key !== "all"}
                              className={`flex items-center gap-1.5 text-xs font-['Montserrat'] font-bold px-3 py-1.5 rounded-full border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${active ? "bg-[hsl(var(--gold))] text-[hsl(222_47%_8%)] border-[hsl(var(--gold))]" : "bg-[hsl(222_46%_8%)] text-[hsl(var(--navy)/0.65)] border-[hsl(var(--gold)/0.18)] hover:border-[hsl(var(--gold)/0.5)]"}`}>
                              <Icon name={o.icon} size={13} />{o.label}
                              <span className={`px-1.5 rounded-full text-[10px] ${active ? "bg-[hsl(222_47%_8%)/0.15] text-[hsl(222_47%_8%)]" : "bg-[hsl(var(--gold)/0.12)] text-[hsl(var(--gold))]"}`}>{cnt}</span>
                            </button>
                          );
                        })}
                      </div>
                      {visibleCars.length === 0 ? (
                        <div className="text-center py-14">
                          <Icon name="SearchX" size={36} className="mx-auto mb-3 text-[hsl(var(--navy)/0.4)]" />
                          <p className="text-[hsl(var(--navy)/0.65)] text-sm">{t("td_filter_none")}</p>
                        </div>
                      ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {visibleCars.map((c) => (
                          <div key={c.id} className="card-light rounded-sm overflow-hidden">
                            {c.photos && c.photos.length > 0 && (
                              <img src={c.photos[0]} alt="" className="w-full h-40 object-cover" />
                            )}
                            <div className="p-5">
                              <div className="flex items-start justify-between gap-3">
                                <div className="font-['Montserrat'] font-bold navy">{[c.car_brand, c.car_model, c.car_year].filter(Boolean).join(" ")}</div>
                                <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-[hsl(var(--navy)/0.06)] text-[hsl(var(--navy))] flex-shrink-0">{c.order_number}</span>
                              </div>
                              <div className="text-[hsl(var(--navy)/0.6)] text-sm mt-1">
                                {c.client_name || c.client_email}{c.client_company ? ` · ${c.client_company}` : ""}
                              </div>
                              <div className="flex gap-4 text-sm mt-1 text-[hsl(var(--navy)/0.6)]">
                                {!!c.price && <span className="font-semibold text-[hsl(var(--gold))]">{c.price.toLocaleString()} ₽</span>}
                                {!!c.mileage && <span>{c.mileage.toLocaleString()} {t("km")}</span>}
                              </div>
                              {c.vin && <div className="text-xs mt-1 text-[hsl(var(--navy)/0.62)]">VIN: <span className="font-mono font-semibold navy tracking-wider">{c.vin}</span></div>}
                              {(c.engine_model || c.engine_number) && (
                                <div className="text-xs mt-1 text-[hsl(var(--navy)/0.62)] flex flex-wrap gap-x-3">
                                  {c.engine_model && <span>{t("engine_model")}: <span className="font-mono font-semibold navy">{c.engine_model}</span></span>}
                                  {c.engine_number && <span>{t("engine_number")}: <span className="font-mono font-semibold navy">{c.engine_number}</span></span>}
                                </div>
                              )}
                              {(() => {
                                if (c.order_status !== "teardown") return null;
                                const missing = [
                                  !c.vin && "VIN",
                                  !c.engine_model && t("engine_model"),
                                  !c.engine_number && t("engine_number"),
                                ].filter(Boolean) as string[];
                                if (missing.length === 0) return null;
                                return (
                                  <div className="mt-2 flex items-start gap-2 rounded-sm px-3 py-2 bg-red-50 border border-red-300">
                                    <Icon name="TriangleAlert" size={15} className="text-red-600 flex-shrink-0 mt-0.5" />
                                    <div className="min-w-0">
                                      <div className="text-[11px] font-['Montserrat'] font-bold uppercase tracking-wide text-red-700">{t("td_missing_ids")}</div>
                                      <div className="text-xs text-red-700/90 mt-0.5">{missing.join(", ")}</div>
                                    </div>
                                  </div>
                                );
                              })()}
                              <div className="mt-2">{renderTdBadge(c.teardown)}</div>
                              <div className="mt-3 pt-3 border-t border-[hsl(var(--gold)/0.12)]">
                                <div className="flex items-center justify-between gap-2 mb-2">
                                  <div className="text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold uppercase tracking-wide">{t("teardown_title")} · {t("teardown_client_picked")}: {c.teardown.filter((x) => x.needed).length}/{c.teardown.length}</div>
                                  <div className="flex items-center gap-3 flex-shrink-0">
                                    <button type="button" onClick={() => exportPackingList(c)} className="flex items-center gap-1 text-[11px] font-['Montserrat'] font-bold text-[hsl(var(--navy))] hover:text-[hsl(var(--gold))] transition-colors">
                                      <Icon name="FileDown" size={13} />PDF
                                    </button>
                                    <button type="button" onClick={() => exportPackingListXlsx(c)} className="flex items-center gap-1 text-[11px] font-['Montserrat'] font-bold text-[hsl(var(--navy))] hover:text-[hsl(var(--gold))] transition-colors">
                                      <Icon name="Sheet" size={13} />XLSX
                                    </button>
                                  </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                  {groupTeardown(c.teardown).map((grp) => (
                                    <div key={grp.group}>
                                      <div className="text-[10px] font-['Montserrat'] font-bold uppercase tracking-wide text-[hsl(var(--navy)/0.5)] mb-0.5">{grp.group}</div>
                                      <div className="flex flex-col gap-1">
                                        {grp.items.map((it) => (
                                          <div key={it.name} className={`flex items-center gap-2 text-sm ${it.needed ? "navy font-semibold" : "text-[hsl(var(--navy)/0.62)]"}`}>
                                            <Icon name={it.needed ? "CheckCircle2" : "Circle"} size={15} className={it.needed ? "text-[hsl(var(--gold))]" : "text-[hsl(var(--navy)/0.25)]"} />{it.part}{it.qty > 1 && <span className="text-[hsl(var(--gold))] font-semibold">× {it.qty}</span>}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      )}
                    </div>
                    );
                  })()}
                </div>
              )}

    </>
  );
}
import Icon from "@/components/ui/icon";
import type { SiteState } from "@/hooks/useSiteState";
import {
  ORIGIN_LABEL,STATUS_COLOR,STATUS_LABEL,groupTeardown,
} from "@/lib/site-data";

export default function TabOrders(s: SiteState) {
  const {
    cabinetTab,
    expandedOrder,
    lang,
    orderCars,
    orders,
    ordersLoading,
    renderTdBadge,
    savingTeardown,
    setCabinetTab,
    t,
    toggleClientPart,
    toggleOrderCars,
  } = s;

  return (
    <>
              {cabinetTab === "orders" && (() => {
                const list = orders.filter((o) => o.status === "new");
                return (
                <div>
                  {ordersLoading ? (
                    <div className="flex items-center gap-3 py-16 justify-center text-[hsl(var(--navy)/0.62)]">
                      <Icon name="Loader" size={20} className="animate-spin" />{t("loading_orders")}
                    </div>
                  ) : list.length === 0 ? (
                    <div className="text-center py-16">
                      <Icon name="ClipboardList" size={40} className="mx-auto mb-4 text-[hsl(var(--navy)/0.4)]" />
                      <p className="font-['Montserrat'] font-bold navy mb-2">{t("no_new_orders")}</p>
                      <p className="text-[hsl(var(--navy)/0.65)] text-sm mb-6">{t("no_new_orders_sub")}</p>
                      <button onClick={() => setCabinetTab("new_order")} className="px-6 py-3 btn-navy rounded-sm">{t("create_order")}</button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {list.map((o) => (
                        <div key={o.id} className="card-light rounded-sm p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-[hsl(var(--navy)/0.06)] rounded-sm flex items-center justify-center flex-shrink-0">
                              <Icon name="Car" size={18} className="text-[hsl(var(--navy))]" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-['Montserrat'] font-bold text-sm navy">{o.order_number}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_COLOR[o.status] || "bg-gray-100 text-gray-600"}`}>{STATUS_LABEL[lang][o.status] || o.status_label}</span>
                              </div>
                              <div className="text-[hsl(var(--navy)/0.6)] text-sm mt-0.5">
                                {[o.car_brand, o.car_model, o.car_year].filter(Boolean).join(" ")} · {ORIGIN_LABEL[lang][o.origin] || o.origin}
                              </div>
                              <div className="text-[hsl(var(--navy)/0.6)] text-xs mt-1">
                                {o.quantity} {t("pcs")}{o.budget ? ` · ${t("up_to")} ${o.budget.toLocaleString()} ₽` : ""} · {new Date(o.created_at).toLocaleDateString(lang === "ru" ? "ru" : "en")}
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

              {/* ── Заказы (в работе и завершённые) ── */}
              {cabinetTab === "active_orders" && (() => {
                const list = orders.filter((o) => o.status !== "new");
                return (
                <div>
                  {ordersLoading ? (
                    <div className="flex items-center gap-3 py-16 justify-center text-[hsl(var(--navy)/0.62)]">
                      <Icon name="Loader" size={20} className="animate-spin" />{t("loading_active")}
                    </div>
                  ) : list.length === 0 ? (
                    <div className="text-center py-16">
                      <Icon name="Package" size={40} className="mx-auto mb-4 text-[hsl(var(--navy)/0.4)]" />
                      <p className="font-['Montserrat'] font-bold navy mb-2">{t("no_active_orders")}</p>
                      <p className="text-[hsl(var(--navy)/0.65)] text-sm">{t("no_active_orders_sub")}</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {list.map((o) => {
                        const steps = [
                          { key: "processing", label: t("step_processing") },
                          { key: "auction", label: t("step_auction") },
                          { key: "shipped", label: t("step_shipped") },
                          { key: "customs", label: t("step_customs") },
                          { key: "delivered", label: t("step_delivered") },
                          { key: "done", label: t("step_done") },
                        ];
                        const order = ["processing", "auction", "shipped", "customs", "delivered", "done"];
                        const curIdx = order.indexOf(o.status);
                        return (
                        <div key={o.id} className="card-light rounded-sm p-5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                            <div className="flex items-start gap-4">
                              <div className="w-10 h-10 bg-[hsl(var(--navy)/0.06)] rounded-sm flex items-center justify-center flex-shrink-0">
                                <Icon name="Car" size={18} className="text-[hsl(var(--navy))]" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-['Montserrat'] font-bold text-sm navy">{o.order_number}</span>
                                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_COLOR[o.status] || "bg-gray-100 text-gray-600"}`}>{STATUS_LABEL[lang][o.status] || o.status_label}</span>
                                </div>
                                <div className="text-[hsl(var(--navy)/0.6)] text-sm mt-0.5">
                                  {[o.car_brand, o.car_model, o.car_year].filter(Boolean).join(" ")} · {ORIGIN_LABEL[lang][o.origin] || o.origin}
                                </div>
                                <div className="text-[hsl(var(--navy)/0.6)] text-xs mt-1">
                                  {o.quantity} {t("pcs")}{o.budget ? ` · ${t("up_to")} ${o.budget.toLocaleString()} ₽` : ""} · {new Date(o.created_at).toLocaleDateString(lang)}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 sm:gap-2 pt-4 border-t border-[hsl(var(--gold)/0.12)] overflow-x-auto">
                            {steps.map((s, i) => {
                              const reached = curIdx >= i;
                              const isCurrent = curIdx === i;
                              return (
                                <div key={s.key} className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                                  <div className="flex flex-col items-center gap-1.5">
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${reached ? "bg-[hsl(var(--gold))] text-white" : "bg-[hsl(222_30%_18%)] text-[hsl(var(--navy)/0.55)]"}`}>
                                      {reached ? <Icon name="Check" size={13} /> : <span className="text-[10px] font-bold">{i + 1}</span>}
                                    </div>
                                    <span className={`text-[10px] font-['Montserrat'] font-semibold whitespace-nowrap ${isCurrent ? "text-[hsl(var(--gold))]" : reached ? "text-[hsl(var(--navy))]" : "text-[hsl(var(--navy)/0.6)]"}`}>{s.label}</span>
                                  </div>
                                  {i < steps.length - 1 && <div className={`w-4 sm:w-8 h-0.5 ${curIdx > i ? "bg-[hsl(var(--gold))]" : "bg-[hsl(222_28%_22%)]"}`} />}
                                </div>
                              );
                            })}
                          </div>
                          {!!o.cars_count && (
                            <div className="pt-4 mt-4 border-t border-[hsl(var(--gold)/0.12)]">
                              <button onClick={() => toggleOrderCars(o.id)} className="flex items-center gap-2 text-sm font-['Montserrat'] font-semibold text-[hsl(var(--navy))] hover:text-[hsl(var(--gold))] transition-colors">
                                <Icon name="Car" size={15} />{t("selected_cars")} ({o.cars_count})
                                <Icon name={expandedOrder === o.id ? "ChevronUp" : "ChevronDown"} size={15} />
                              </button>
                              {expandedOrder === o.id && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                  {(orderCars[o.id] || []).map((c) => (
                                    <div key={c.id} className="border border-[hsl(var(--gold)/0.15)] rounded-sm overflow-hidden">
                                      {c.photos.length > 0 && (
                                        <div className="flex gap-1 overflow-x-auto bg-[hsl(222_44%_9%/0.5)]">
                                          {c.photos.map((p, i) => (<img key={i} src={p} alt="" className="h-40 w-auto object-cover flex-shrink-0" />))}
                                        </div>
                                      )}
                                      <div className="p-4">
                                        <div className="font-['Montserrat'] font-bold navy">{[c.car_brand, c.car_model, c.car_year].filter(Boolean).join(" ")}</div>
                                        <div className="flex gap-4 text-sm mt-1 text-[hsl(var(--navy)/0.6)]">
                                          {!!c.price && <span className="font-semibold text-[hsl(var(--gold))]">{c.price.toLocaleString()} ₽</span>}
                                          {!!c.mileage && <span>{c.mileage.toLocaleString()} {t("km")}</span>}
                                        </div>
                                        {c.description && <p className="text-[hsl(var(--navy)/0.55)] text-sm mt-2 leading-relaxed">{c.description}</p>}
                                        {c.teardown && c.teardown.length > 0 && (
                                          <div className="mt-3 pt-3 border-t border-[hsl(var(--gold)/0.12)]">
                                            <div className="flex items-center gap-2 mb-2">
                                              <span className="text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold uppercase tracking-wide">{t("teardown_title")}</span>
                                              {renderTdBadge(c.teardown, "xs")}
                                              {savingTeardown === c.id && <Icon name="Loader" size={12} className="animate-spin text-[hsl(var(--navy)/0.62)]" />}
                                            </div>
                                            <p className="text-[hsl(var(--navy)/0.62)] text-xs mb-2">{t("teardown_client_hint")}</p>
                                            <div className="flex flex-col gap-2.5">
                                              {groupTeardown(c.teardown).map((grp) => (
                                                <div key={grp.group}>
                                                  <div className="text-[10px] font-['Montserrat'] font-bold uppercase tracking-wide text-[hsl(var(--navy)/0.5)] mb-1">{grp.group}</div>
                                                  <div className="flex flex-col gap-1 pl-1">
                                                    {grp.items.map((it) => (
                                                      <label key={it.name} className="flex items-center gap-2.5 cursor-pointer group/part select-none py-0.5">
                                                        <span className={`w-5 h-5 rounded-sm border flex items-center justify-center flex-shrink-0 transition-colors ${it.needed ? "bg-[hsl(var(--gold))] border-[hsl(var(--gold))]" : "bg-[hsl(222_46%_8%)] border-[hsl(var(--gold)/0.3)] group-hover/part:border-[hsl(var(--navy))]"}`}>
                                                          {it.needed && <Icon name="Check" size={13} className="text-white" />}
                                                        </span>
                                                        <input type="checkbox" checked={it.needed} onChange={() => toggleClientPart(c, it.name)} className="hidden" />
                                                        <span className={`text-sm ${it.needed ? "navy font-semibold" : "text-[hsl(var(--navy)/0.6)]"}`}>{it.part}</span>
                                                      </label>
                                                    ))}
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                );
              })()}

    </>
  );
}

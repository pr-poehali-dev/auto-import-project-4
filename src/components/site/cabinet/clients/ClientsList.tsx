import Icon from "@/components/ui/icon";
import type { SiteState } from "@/hooks/useSiteState";
import { ORIGIN_LABEL,STATUS_COLOR,STATUS_LABEL } from "@/lib/site-data";

export default function ClientsList(s: SiteState) {
  const {
    clientsList,
    doStaffCreateClient,
    doStaffCreateOrder,
    inputCls,
    lang,
    openOrderCars,
    openStaffClientForm,
    openStaffOrderForm,
    orders,
    ordersLoading,
    setStaffClientForm,
    setStaffClientOpen,
    setStaffOrderForm,
    setStaffOrderOpen,
    staffClientDone,
    staffClientError,
    staffClientForm,
    staffClientOpen,
    staffClientSaving,
    staffOrderForm,
    staffOrderOpen,
    staffOrderSaving,
    t,
  } = s;

  return (
    <>
                      {/* Создание клиента */}
                      <div className="mb-6">
                        {staffClientDone && (
                          <div className="mb-4 flex items-center gap-2 bg-[hsl(var(--gold)/0.12)] border border-[hsl(var(--gold)/0.4)] text-[hsl(var(--gold))] text-sm px-4 py-3 rounded-sm">
                            <Icon name="Check" size={15} />{t("staff_client_created")}
                          </div>
                        )}
                        {!staffClientOpen ? (
                          <button onClick={openStaffClientForm} className="flex items-center gap-2 px-5 py-3 btn-outline rounded-sm text-sm">
                            <Icon name="UserPlus" size={16} />{t("staff_create_client")}
                          </button>
                        ) : (
                          <form onSubmit={doStaffCreateClient} className="card-light rounded-sm p-6 flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                              <h3 className="font-['Montserrat'] font-bold text-lg navy">{t("staff_create_client")}</h3>
                              <button type="button" onClick={() => setStaffClientOpen(false)} className="text-[hsl(var(--navy)/0.6)] hover:text-red-600"><Icon name="X" size={18} /></button>
                            </div>
                            {staffClientError && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-sm">{staffClientError}</div>}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-wide uppercase mb-2">{t("full_name")}</label>
                                <input placeholder={t("ph_name")} value={staffClientForm.full_name} onChange={(e) => setStaffClientForm({ ...staffClientForm, full_name: e.target.value })} className={inputCls} />
                              </div>
                              <div>
                                <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-wide uppercase mb-2">Email *</label>
                                <input required type="email" placeholder="client@mail.ru" value={staffClientForm.email} onChange={(e) => setStaffClientForm({ ...staffClientForm, email: e.target.value })} className={inputCls} />
                              </div>
                              <div>
                                <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-wide uppercase mb-2">{t("phone")}</label>
                                <input placeholder="+7 (___) ___-__-__" value={staffClientForm.phone} onChange={(e) => setStaffClientForm({ ...staffClientForm, phone: e.target.value })} className={inputCls} />
                              </div>
                              <div>
                                <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-wide uppercase mb-2">{t("company_ip")}</label>
                                <input placeholder={t("ph_company")} value={staffClientForm.company} onChange={(e) => setStaffClientForm({ ...staffClientForm, company: e.target.value })} className={inputCls} />
                              </div>
                              <div>
                                <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-wide uppercase mb-2">{t("inn")}</label>
                                <input placeholder={t("ph_inn")} value={staffClientForm.inn} onChange={(e) => setStaffClientForm({ ...staffClientForm, inn: e.target.value })} className={inputCls} />
                              </div>
                              <div>
                                <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-wide uppercase mb-2">{t("staff_client_password")}</label>
                                <input type="text" placeholder={t("staff_client_password_ph")} value={staffClientForm.password} onChange={(e) => setStaffClientForm({ ...staffClientForm, password: e.target.value })} className={inputCls} />
                              </div>
                            </div>
                            <button type="submit" disabled={staffClientSaving} className="py-3 btn-navy rounded-sm disabled:opacity-60">{staffClientSaving ? t("loading") : t("staff_create_client")}</button>
                          </form>
                        )}
                      </div>

                      {/* Создание заявки клиенту */}
                      <div className="mb-6">
                        {!staffOrderOpen ? (
                          <button onClick={openStaffOrderForm} className="flex items-center gap-2 px-5 py-3 btn-navy rounded-sm text-sm">
                            <Icon name="Plus" size={16} />{t("staff_create_order")}
                          </button>
                        ) : (
                          <form onSubmit={doStaffCreateOrder} className="card-light rounded-sm p-6 flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                              <h3 className="font-['Montserrat'] font-bold text-lg navy">{t("staff_create_order")}</h3>
                              <button type="button" onClick={() => setStaffOrderOpen(false)} className="text-[hsl(var(--navy)/0.6)] hover:text-red-600"><Icon name="X" size={18} /></button>
                            </div>
                            <div>
                              <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-wide uppercase mb-2">{t("staff_pick_client")}</label>
                              <select required value={staffOrderForm.client_id} onChange={(e) => setStaffOrderForm({ ...staffOrderForm, client_id: e.target.value })} className={inputCls}>
                                <option value="">{t("staff_pick_client_ph")}</option>
                                {clientsList.map((c) => (
                                  <option key={c.id} value={c.id}>{(c.full_name || c.email)}{c.company ? ` · ${c.company}` : ""}</option>
                                ))}
                              </select>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-wide uppercase mb-2">{t("brand")}</label>
                                <input required placeholder="Toyota" value={staffOrderForm.car_brand} onChange={(e) => setStaffOrderForm({ ...staffOrderForm, car_brand: e.target.value })} className={inputCls} />
                              </div>
                              <div>
                                <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-wide uppercase mb-2">{t("model")}</label>
                                <input placeholder="Camry" value={staffOrderForm.car_model} onChange={(e) => setStaffOrderForm({ ...staffOrderForm, car_model: e.target.value })} className={inputCls} />
                              </div>
                              <div>
                                <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-wide uppercase mb-2">{t("year")}</label>
                                <input placeholder="2019" value={staffOrderForm.car_year} onChange={(e) => setStaffOrderForm({ ...staffOrderForm, car_year: e.target.value })} className={inputCls} />
                              </div>
                              <div>
                                <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-wide uppercase mb-2">{t("qty")}</label>
                                <input type="number" min="1" value={staffOrderForm.quantity} onChange={(e) => setStaffOrderForm({ ...staffOrderForm, quantity: e.target.value })} className={inputCls} />
                              </div>
                              <div>
                                <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-wide uppercase mb-2">{t("budget_unit")}</label>
                                <input placeholder="300000" value={staffOrderForm.budget} onChange={(e) => setStaffOrderForm({ ...staffOrderForm, budget: e.target.value })} className={inputCls} />
                              </div>
                              <div>
                                <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-wide uppercase mb-2">{t("direction")}</label>
                                <select value={staffOrderForm.origin} onChange={(e) => setStaffOrderForm({ ...staffOrderForm, origin: e.target.value })} className={inputCls}>
                                  <option value="Япония">{ORIGIN_LABEL[lang]["Япония"]}</option>
                                  <option value="Корея">{ORIGIN_LABEL[lang]["Корея"]}</option>
                                  <option value="Гонконг">{ORIGIN_LABEL[lang]["Гонконг"]}</option>
                                  <option value="Китай">{ORIGIN_LABEL[lang]["Китай"]}</option>
                                </select>
                              </div>
                            </div>
                            <div>
                              <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-wide uppercase mb-2">{t("comment")}</label>
                              <textarea rows={2} placeholder={t("comment_req_ph")} value={staffOrderForm.comment} onChange={(e) => setStaffOrderForm({ ...staffOrderForm, comment: e.target.value })} className={inputCls + " resize-none"} />
                            </div>
                            <button type="submit" disabled={staffOrderSaving} className="py-3 btn-navy rounded-sm disabled:opacity-60">{staffOrderSaving ? t("loading") : t("create_order")}</button>
                          </form>
                        )}
                      </div>
                    {ordersLoading ? (
                      <div className="flex items-center gap-3 py-16 justify-center text-[hsl(var(--navy)/0.62)]">
                        <Icon name="Loader" size={20} className="animate-spin" />{t("loading_clients")}
                      </div>
                    ) : orders.length === 0 ? (
                      <div className="text-center py-16">
                        <Icon name="Users" size={40} className="mx-auto mb-4 text-[hsl(var(--navy)/0.4)]" />
                        <p className="font-['Montserrat'] font-bold navy mb-2">{t("no_client_orders")}</p>
                        <p className="text-[hsl(var(--navy)/0.65)] text-sm">{t("no_client_orders_sub")}</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {orders.map((o) => (
                          <div key={o.id} onClick={() => openOrderCars(o)}
                            className="card-light rounded-sm p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:shadow-md transition-all">
                            <div className="flex items-start gap-4">
                              <div className="w-10 h-10 bg-[hsl(var(--navy)/0.06)] rounded-sm flex items-center justify-center flex-shrink-0">
                                <Icon name="User" size={18} className="text-[hsl(var(--navy))]" />
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
    </>
  );
}

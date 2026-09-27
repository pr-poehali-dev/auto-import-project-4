import Icon from "@/components/ui/icon";
import type { SiteState } from "@/hooks/useSiteState";
import {
  ORIGIN_LABEL,STATUS_COLOR,STATUS_LABEL,TEARDOWN_GROUPS,groupTeardown,joinTd,splitTd,
} from "@/lib/site-data";

export default function TabClients(s: SiteState) {
  const {
    addCustomPart,
    cabinetTab,
    carForm,
    carSaving,
    cars,
    carsLoading,
    changeOrderStatus,
    clearTeardown,
    clientsList,
    doAddCar,
    doDeleteCar,
    doStaffCreateClient,
    doStaffCreateOrder,
    exportPackingList,
    exportPackingListXlsx,
    handlePhotoSelect,
    inputCls,
    lang,
    openOrderCars,
    openStaffClientForm,
    openStaffOrderForm,
    orders,
    ordersLoading,
    renderTdBadge,
    selectFullTeardown,
    selectHalfcutTeardown,
    selectNoskatTeardown,
    selectedOrder,
    setCarForm,
    setPartQty,
    setSelectedOrder,
    setStaffClientForm,
    setStaffClientOpen,
    setStaffOrderForm,
    setStaffOrderOpen,
    setTeardownInput,
    staffClientDone,
    staffClientError,
    staffClientForm,
    staffClientOpen,
    staffClientSaving,
    staffOrderForm,
    staffOrderOpen,
    staffOrderSaving,
    t,
    teardownInput,
    toggleCarFormGroup,
    toggleCarFormPart,
  } = s;

  return (
    <>
              {/* ── Заявки клиентов (сотрудник) ── */}
              {cabinetTab === "clients" && (
                <div>
                  {!selectedOrder ? (
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
                  ) : (
                    <div>
                      <button onClick={() => setSelectedOrder(null)} className="flex items-center gap-2 text-[hsl(var(--navy)/0.68)] text-sm font-['Montserrat'] font-semibold mb-6 hover:text-[hsl(var(--navy))] transition-colors">
                        <Icon name="ArrowLeft" size={15} />{t("all_client_orders")}
                      </button>

                      {/* Карточка заявки + смена статуса */}
                      <div className="card-light rounded-sm p-6 mb-6">
                        <div className="flex items-center gap-2 flex-wrap mb-3">
                          <span className="font-['Montserrat'] font-black text-xl navy">{selectedOrder.order_number}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_COLOR[selectedOrder.status] || "bg-gray-100 text-gray-600"}`}>{STATUS_LABEL[lang][selectedOrder.status] || selectedOrder.status_label}</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm mb-5">
                          <div><span className="text-[hsl(var(--navy)/0.62)]">{t("client")}</span> <span className="navy font-semibold">{selectedOrder.client_name || "—"}</span></div>
                          <div><span className="text-[hsl(var(--navy)/0.62)]">{t("company_label")}</span> <span className="navy">{selectedOrder.client_company || "—"}</span></div>
                          <div><span className="text-[hsl(var(--navy)/0.62)]">{t("email_label")}</span> <span className="navy">{selectedOrder.client_email || "—"}</span></div>
                          <div><span className="text-[hsl(var(--navy)/0.62)]">{t("phone_label")}</span> <span className="navy">{selectedOrder.client_phone || "—"}</span></div>
                          <div><span className="text-[hsl(var(--navy)/0.62)]">{t("request_label")}</span> <span className="navy">{[selectedOrder.car_brand, selectedOrder.car_model, selectedOrder.car_year].filter(Boolean).join(" ") || "—"}</span></div>
                          <div><span className="text-[hsl(var(--navy)/0.62)]">{t("direction_label")}</span> <span className="navy">{ORIGIN_LABEL[lang][selectedOrder.origin] || selectedOrder.origin} · {selectedOrder.quantity} {t("pcs")}</span></div>
                        </div>
                        {selectedOrder.comment && <div className="text-sm bg-[hsl(222_44%_9%/0.5)] rounded-sm p-3 mb-5"><span className="text-[hsl(var(--navy)/0.62)]">{t("client_comment")}</span><span className="navy">{selectedOrder.comment}</span></div>}
                        <div>
                          <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-widest uppercase mb-2">{t("order_status")}</label>
                          <select value={selectedOrder.status} onChange={(e) => changeOrderStatus(selectedOrder.id, e.target.value)} className={inputCls + " max-w-xs"}>
                            <option value="new">{t("st_new")}</option>
                            <option value="processing">{t("st_processing")}</option>
                            <option value="auction">{t("st_auction")}</option>
                            <option value="shipped">{t("st_shipped")}</option>
                            <option value="customs">{t("st_customs")}</option>
                            <option value="delivered">{t("st_delivered")}</option>
                            <option value="done">{t("st_done")}</option>
                          </select>
                        </div>
                      </div>

                      {/* Форма добавления авто */}
                      <form onSubmit={doAddCar} className="card-light rounded-sm p-6 mb-6 flex flex-col gap-4">
                        <h3 className="font-['Montserrat'] font-bold text-lg navy">{t("add_car_title")}</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-wide uppercase mb-2">{t("brand")}</label>
                            <input required placeholder="Toyota" value={carForm.car_brand} onChange={(e) => setCarForm({ ...carForm, car_brand: e.target.value })} className={inputCls} />
                          </div>
                          <div>
                            <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-wide uppercase mb-2">{t("model")}</label>
                            <input placeholder="Camry" value={carForm.car_model} onChange={(e) => setCarForm({ ...carForm, car_model: e.target.value })} className={inputCls} />
                          </div>
                          <div>
                            <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-wide uppercase mb-2">{t("year")}</label>
                            <input placeholder="2019" value={carForm.car_year} onChange={(e) => setCarForm({ ...carForm, car_year: e.target.value })} className={inputCls} />
                          </div>
                          <div>
                            <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-wide uppercase mb-2">{t("price_rub")}</label>
                            <input placeholder="850000" value={carForm.price} onChange={(e) => setCarForm({ ...carForm, price: e.target.value })} className={inputCls} />
                          </div>
                          <div>
                            <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-wide uppercase mb-2">{t("mileage_km")}</label>
                            <input placeholder="65000" value={carForm.mileage} onChange={(e) => setCarForm({ ...carForm, mileage: e.target.value })} className={inputCls} />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-wide uppercase mb-2">{t("vin")}</label>
                          <input placeholder="JTDBR32E720012345" value={carForm.vin} maxLength={32}
                            onChange={(e) => setCarForm({ ...carForm, vin: e.target.value.toUpperCase() })}
                            className={inputCls + " font-mono tracking-wider"} />
                        </div>
                        <div>
                          <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-wide uppercase mb-2">{t("description_trim")}</label>
                          <textarea rows={3} placeholder={t("description_ph")} value={carForm.description} onChange={(e) => setCarForm({ ...carForm, description: e.target.value })} className={inputCls} />
                        </div>
                        <div>
                          <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-wide uppercase mb-2">{t("car_photos")}</label>
                          <div className="flex flex-wrap gap-3 items-center">
                            {carForm.photos.map((p, i) => (
                              <div key={i} className="relative w-20 h-20 rounded-sm overflow-hidden border border-[hsl(var(--gold)/0.18)]">
                                <img src={p} alt="" className="w-full h-full object-cover" />
                                <button type="button" onClick={() => setCarForm({ ...carForm, photos: carForm.photos.filter((_, j) => j !== i) })}
                                  className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center"><Icon name="X" size={11} /></button>
                              </div>
                            ))}
                            <label className="w-20 h-20 rounded-sm border-2 border-dashed border-[hsl(var(--gold)/0.2)] flex flex-col items-center justify-center cursor-pointer hover:border-[hsl(var(--navy))] transition-colors text-[hsl(var(--navy)/0.65)]">
                              <Icon name="Plus" size={18} />
                              <span className="text-[10px] mt-1">{t("photo")}</span>
                              <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handlePhotoSelect(e.target.files)} />
                            </label>
                          </div>
                        </div>
                        <div>
                          <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-wide uppercase mb-2">{t("teardown_title")}</label>
                          <p className="text-[hsl(var(--navy)/0.62)] text-xs mb-3">{t("teardown_staff_hint")}</p>
                          <div className="flex flex-wrap gap-2 mb-3">
                            <button type="button" onClick={selectHalfcutTeardown} title={t("td_mode_halfcut_hint")}
                              className="flex items-center gap-1.5 text-xs font-['Montserrat'] font-semibold px-3 py-1.5 rounded-sm bg-[hsl(var(--gold))] text-[hsl(222_47%_8%)] hover:opacity-90 transition-opacity">
                              <Icon name="Package" size={13} />{t("td_mode_halfcut")}
                            </button>
                            <button type="button" onClick={selectFullTeardown} title={t("td_mode_full_hint")}
                              className="flex items-center gap-1.5 text-xs font-['Montserrat'] font-semibold px-3 py-1.5 rounded-sm bg-[hsl(var(--gold))] text-[hsl(222_47%_8%)] hover:opacity-90 transition-opacity">
                              <Icon name="ListChecks" size={13} />{t("td_mode_full")}
                            </button>
                            <button type="button" onClick={selectNoskatTeardown} title={t("td_mode_noskat_hint")}
                              className="flex items-center gap-1.5 text-xs font-['Montserrat'] font-semibold px-3 py-1.5 rounded-sm bg-[hsl(var(--gold))] text-[hsl(222_47%_8%)] hover:opacity-90 transition-opacity">
                              <Icon name="CarFront" size={13} />{t("td_mode_noskat")}
                            </button>
                            <button type="button" onClick={clearTeardown}
                              className="flex items-center gap-1.5 text-xs font-['Montserrat'] font-semibold px-3 py-1.5 rounded-sm border border-[hsl(var(--gold)/0.18)] text-[hsl(var(--navy)/0.65)] hover:border-red-300 hover:text-red-600 transition-colors">
                              <Icon name="Eraser" size={13} />{t("td_clear_all")}
                            </button>
                          </div>
                          <div className="flex flex-col gap-4 mb-3">
                            {TEARDOWN_GROUPS.map((grp) => {
                              const groupNames = grp.parts.map((p) => joinTd(grp.group, p));
                              const allActive = groupNames.every((n) => carForm.teardown.some((x) => x.name === n));
                              return (
                                <div key={grp.group} className="bg-[hsl(222_44%_9%/0.6)] border border-[hsl(var(--gold)/0.15)] rounded-sm p-3">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-['Montserrat'] font-bold uppercase tracking-wide navy">{grp.group}</span>
                                    <button type="button" onClick={() => toggleCarFormGroup(groupNames, !allActive)}
                                      className="text-[11px] font-['Montserrat'] font-semibold text-[hsl(var(--navy)/0.6)] hover:text-[hsl(var(--navy))]">
                                      {allActive ? t("td_clear_group") : t("td_all_group")}
                                    </button>
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    {grp.parts.map((part) => {
                                      const name = joinTd(grp.group, part);
                                      const active = carForm.teardown.some((x) => x.name === name);
                                      return (
                                        <button type="button" key={name} onClick={() => toggleCarFormPart(name)}
                                          className={`text-xs font-['Montserrat'] font-semibold px-3 py-1.5 rounded-full border transition-colors ${active ? "bg-[hsl(var(--gold))] text-[hsl(222_47%_8%)] border-[hsl(var(--gold))]" : "bg-[hsl(222_46%_8%)] text-[hsl(var(--navy)/0.6)] border-[hsl(var(--gold)/0.18)] hover:border-[hsl(var(--gold)/0.5)]"}`}>
                                          {active && <Icon name="Check" size={12} className="inline mr-1 -mt-0.5" />}{part}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          <div className="flex gap-2 mb-3">
                            <input placeholder={t("teardown_add_ph")} value={teardownInput}
                              onChange={(e) => setTeardownInput(e.target.value)}
                              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomPart(); } }}
                              className={inputCls} />
                            <button type="button" onClick={addCustomPart} className="flex-shrink-0 px-4 btn-outline rounded-sm text-sm">{t("teardown_add")}</button>
                          </div>
                          {carForm.teardown.length > 0 && (
                            <div className="flex flex-col gap-1.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <div className="text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold uppercase tracking-wide">{t("td_selected")}: {carForm.teardown.length}</div>
                                {renderTdBadge(carForm.teardown, "xs")}
                              </div>
                              {carForm.teardown.map((it) => {
                                const sp = splitTd(it.name);
                                const q = it.qty || 1;
                                return (
                                  <div key={it.name} className="flex items-center justify-between gap-2 bg-[hsl(222_44%_9%/0.5)] rounded-sm px-3 py-2">
                                    <span className="text-sm navy min-w-0 truncate"><span className="text-[hsl(var(--navy)/0.5)]">{sp.group} · </span>{sp.part}</span>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                      <div className="flex items-center border border-[hsl(var(--gold)/0.18)] rounded-sm bg-[hsl(222_46%_8%)]">
                                        <button type="button" onClick={() => setPartQty(it.name, q - 1)} className="w-7 h-7 flex items-center justify-center text-[hsl(var(--navy)/0.6)] hover:text-[hsl(var(--navy))]"><Icon name="Minus" size={13} /></button>
                                        <span className="w-7 text-center text-sm font-semibold navy">{q}</span>
                                        <button type="button" onClick={() => setPartQty(it.name, q + 1)} className="w-7 h-7 flex items-center justify-center text-[hsl(var(--navy)/0.6)] hover:text-[hsl(var(--navy))]"><Icon name="Plus" size={13} /></button>
                                      </div>
                                      <button type="button" onClick={() => toggleCarFormPart(it.name)} className="text-[hsl(var(--navy)/0.6)] hover:text-red-600"><Icon name="X" size={14} /></button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                        <button type="submit" disabled={carSaving} className="self-start px-6 py-3 btn-navy rounded-sm disabled:opacity-60">
                          {carSaving ? t("saving") : t("add_car")}
                        </button>
                      </form>

                      {/* Список добавленных авто */}
                      <h3 className="font-['Montserrat'] font-bold text-lg navy mb-4">{t("proposed_cars")} ({cars.length})</h3>
                      {carsLoading ? (
                        <div className="flex items-center gap-3 py-10 justify-center text-[hsl(var(--navy)/0.62)]"><Icon name="Loader" size={20} className="animate-spin" />{t("loading")}</div>
                      ) : cars.length === 0 ? (
                        <p className="text-[hsl(var(--navy)/0.65)] text-sm py-6">{t("nothing_added")}</p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {cars.map((c) => (
                            <div key={c.id} className="card-light rounded-sm overflow-hidden">
                              {c.photos.length > 0 && (
                                <div className="flex gap-1 overflow-x-auto bg-[hsl(222_44%_9%/0.5)]">
                                  {c.photos.map((p, i) => (<img key={i} src={p} alt="" className="h-40 w-auto object-cover flex-shrink-0" />))}
                                </div>
                              )}
                              <div className="p-5">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="font-['Montserrat'] font-bold navy">{[c.car_brand, c.car_model, c.car_year].filter(Boolean).join(" ")}</div>
                                  <button onClick={() => doDeleteCar(c.id)} className="text-[hsl(var(--navy)/0.6)] hover:text-red-600"><Icon name="Trash2" size={16} /></button>
                                </div>
                                <div className="flex gap-4 text-sm mt-1 text-[hsl(var(--navy)/0.6)]">
                                  {!!c.price && <span className="font-semibold text-[hsl(var(--gold))]">{c.price.toLocaleString()} ₽</span>}
                                  {!!c.mileage && <span>{c.mileage.toLocaleString()} {t("km")}</span>}
                                </div>
                                {c.vin && <div className="text-xs mt-1 text-[hsl(var(--navy)/0.62)]">VIN: <span className="font-mono font-semibold navy tracking-wider">{c.vin}</span></div>}
                                {c.description && <p className="text-[hsl(var(--navy)/0.55)] text-sm mt-2 leading-relaxed">{c.description}</p>}
                                {c.teardown && c.teardown.length > 0 && (
                                  <div className="mt-3 pt-3 border-t border-[hsl(var(--gold)/0.12)]">
                                    <div className="flex items-center justify-between gap-2 mb-2">
                                      <div className="flex items-center gap-2 flex-wrap min-w-0">
                                        <div className="text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold uppercase tracking-wide">{t("teardown_title")} · {t("teardown_client_picked")}: {c.teardown.filter((x) => x.needed).length}/{c.teardown.length}</div>
                                        {renderTdBadge(c.teardown, "xs")}
                                      </div>
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
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

    </>
  );
}

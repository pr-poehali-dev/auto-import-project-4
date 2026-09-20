import Icon from "@/components/ui/icon";
import type { SiteState } from "@/hooks/useSiteState";
import type { TeardownMode } from "@/components/TeardownModeBadge";
import {
  ORIGIN_LABEL, STATUS_COLOR, STATUS_LABEL, TEARDOWN_GROUPS, HERO_IMG,
  detectTeardownMode, groupTeardown, joinTd, splitTd,
  type CabinetTab,
} from "@/lib/site-data";

export default function CabinetPage(s: SiteState) {
  const {
    addCustomPart,
    addTargetContainer,
    availableCars,
    cabinetTab,
    carForm,
    carSaving,
    cars,
    carsLoading,
    changeOrderStatus,
    clearTeardown,
    clientsList,
    containerForm,
    containerFormOpen,
    containerSaving,
    containers,
    containersLoading,
    dealDeletingId,
    dealForm,
    dealSaving,
    deleteDeal,
    doAddCar,
    doAddToContainer,
    doCreateContainer,
    doDeleteCar,
    doLogout,
    doNewOrder,
    doRemoveFromContainer,
    doSaveProfile,
    doStaffCreateClient,
    doStaffCreateOrder,
    editDeal,
    emptyDeal,
    expandedOrder,
    exportContainerPdf,
    exportContainerXlsx,
    exportPackingList,
    exportPackingListXlsx,
    handlePhotoSelect,
    hotDeals,
    hotDealsLoading,
    inputCls,
    isStaff,
    lang,
    nav,
    newOrderForm,
    newOrderSent,
    openOrderCars,
    openStaffClientForm,
    openStaffOrderForm,
    orderCars,
    orders,
    ordersLoading,
    page,
    pickDealPhoto,
    pickedCars,
    profileForm,
    profileSaved,
    renderTdBadge,
    roleSavingId,
    saveDeal,
    savingTeardown,
    selectFullTeardown,
    selectHalfcutTeardown,
    selectNoskatTeardown,
    selectedOrder,
    setAddTargetContainer,
    setCabinetTab,
    setCarForm,
    setContainerForm,
    setContainerFormOpen,
    setContainerStatus,
    setDealForm,
    setNewOrderForm,
    setPartQty,
    setProfileForm,
    setSelectedOrder,
    setStaffClientForm,
    setStaffClientOpen,
    setStaffOrderForm,
    setStaffOrderOpen,
    setTdFilter,
    setTeardownInput,
    staffClientDone,
    staffClientError,
    staffClientForm,
    staffClientOpen,
    staffClientSaving,
    staffOrderForm,
    staffOrderOpen,
    staffOrderSaving,
    staffUsers,
    staffUsersLoading,
    t,
    tdFilter,
    teardownCars,
    teardownCarsLoading,
    teardownInput,
    toggleCarFormGroup,
    toggleCarFormPart,
    toggleClientPart,
    toggleOrderCars,
    togglePickedCar,
    toggleUserRole,
    user,
  } = s;

  return (
    <>
        {/* ════ CABINET ════ */}
        {page === "cabinet" && (
          !user ? (
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <Icon name="Lock" size={40} className="mx-auto mb-4 text-[hsl(var(--navy)/0.55)]" />
                <p className="font-['Montserrat'] font-bold navy mb-4">{t("auth_required")}</p>
                <button onClick={() => nav("login")} className="px-6 py-3 btn-navy rounded-sm">{t("login")}</button>
              </div>
            </div>
          ) : (
            <div className="min-h-screen relative">
              <div className="fixed inset-0 -z-10 bg-cover bg-center" style={{ backgroundImage: `url(${HERO_IMG})` }} />
              <div className="fixed inset-0 -z-10 bg-[linear-gradient(180deg,hsl(222_47%_6%/0.94),hsl(222_50%_4%/0.97))]" />
              <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8">
              {/* Cabinet header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                  <div className="section-tag mb-2">{isStaff ? t("staff_cabinet") : t("personal_cabinet")}</div>
                  <h1 className="font-['Montserrat'] font-black text-3xl navy flex items-center gap-3">
                    {user.full_name || user.email}
                    {isStaff && <span className="text-xs px-2.5 py-1 bg-[hsl(var(--gold)/0.12)] text-[hsl(var(--gold))] rounded-full font-['Montserrat'] font-bold uppercase tracking-wide">{t("staff_badge")}</span>}
                  </h1>
                  {user.company && <p className="text-[hsl(var(--navy)/0.65)] text-sm mt-0.5">{user.company}</p>}
                </div>
                <button onClick={doLogout} className="flex items-center gap-2 px-4 py-2 border border-[hsl(var(--gold)/0.15)] text-[hsl(var(--navy)/0.68)] text-sm font-['Montserrat'] font-semibold hover:text-red-600 hover:border-red-200 transition-all rounded-sm">
                  <Icon name="LogOut" size={15} />{t("logout")}
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 flex-wrap mb-8 border-b border-[hsl(var(--gold)/0.15)]">
                {((isStaff ? [
                  { id: "clients", label: t("tab_clients"), icon: "Users" },
                  { id: "in_work", label: t("tab_in_work"), icon: "Loader" },
                  { id: "shipping", label: t("tab_shipping"), icon: "Truck" },
                  { id: "teardowns", label: t("tab_teardowns"), icon: "Wrench" },
                  { id: "hot_deals", label: t("tab_hot_deals"), icon: "Flame" },
                  { id: "staff_users", label: t("tab_staff_users"), icon: "ShieldCheck" },
                  { id: "profile", label: t("tab_profile"), icon: "User" },
                ] : [
                  { id: "orders", label: t("tab_orders"), icon: "ClipboardList" },
                  { id: "active_orders", label: t("tab_active_orders"), icon: "Package" },
                  { id: "new_order", label: t("tab_new_order"), icon: "Plus" },
                  { id: "auctions", label: t("tab_auctions"), icon: "Globe" },
                  { id: "documents", label: t("tab_documents"), icon: "FileText" },
                  { id: "profile", label: t("tab_profile"), icon: "User" },
                ]) as { id: CabinetTab; label: string; icon: string }[]).map((tab) => (
                  <button key={tab.id} onClick={() => { setCabinetTab(tab.id); setSelectedOrder(null); }}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-['Montserrat'] font-semibold border-b-2 transition-all ${cabinetTab === tab.id ? "border-[hsl(var(--gold))] text-[hsl(var(--gold))]" : "border-transparent text-[hsl(var(--navy)/0.6)] hover:text-[hsl(var(--navy))]"}`}>
                    <Icon name={tab.icon} size={15} />{tab.label}
                  </button>
                ))}
              </div>

              {/* ── Мои заявки (новые, на рассмотрении) ── */}
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
                      <div className="flex items-center gap-2 mb-4">
                        <h2 className="font-['Montserrat'] font-bold text-xl navy">{t("teardowns_all_cars")}</h2>
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-[hsl(var(--gold)/0.12)] text-[hsl(var(--gold))]">{teardownCars.length}</span>
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

              {/* ── Новая заявка ── */}
              {cabinetTab === "new_order" && (
                <div className="max-w-lg">
                  {newOrderSent ? (
                    <div className="text-center py-12">
                      <div className="w-14 h-14 rounded-sm bg-[hsl(var(--gold)/0.1)] flex items-center justify-center mb-5 mx-auto"><Icon name="CheckCircle" size={30} className="text-[hsl(var(--gold))]" /></div>
                      <h3 className="font-['Montserrat'] font-bold text-xl navy mb-2">{t("new_order_created")}</h3>
                      <p className="text-[hsl(var(--navy)/0.68)] text-sm">{t("new_order_redirect")}</p>
                    </div>
                  ) : (
                    <form onSubmit={doNewOrder} className="card-light rounded-sm p-7 flex flex-col gap-5">
                      <div><h2 className="font-['Montserrat'] font-bold text-xl navy mb-1">{t("new_order_title")}</h2><p className="text-[hsl(var(--navy)/0.65)] text-sm">{t("new_order_sub")}</p></div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-widest uppercase mb-2">{t("brand")}</label>
                          <input required placeholder="Toyota" value={newOrderForm.car_brand} onChange={(e) => setNewOrderForm({ ...newOrderForm, car_brand: e.target.value })} className={inputCls} />
                        </div>
                        <div>
                          <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-widest uppercase mb-2">{t("model")}</label>
                          <input placeholder="Camry" value={newOrderForm.car_model} onChange={(e) => setNewOrderForm({ ...newOrderForm, car_model: e.target.value })} className={inputCls} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-widest uppercase mb-2">{t("year")}</label>
                          <input placeholder="2018" value={newOrderForm.car_year} onChange={(e) => setNewOrderForm({ ...newOrderForm, car_year: e.target.value })} className={inputCls} />
                        </div>
                        <div>
                          <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-widest uppercase mb-2">{t("qty")}</label>
                          <input type="number" min="1" value={newOrderForm.quantity} onChange={(e) => setNewOrderForm({ ...newOrderForm, quantity: e.target.value })} className={inputCls} />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-widest uppercase mb-2">{t("direction")}</label>
                        <select value={newOrderForm.origin} onChange={(e) => setNewOrderForm({ ...newOrderForm, origin: e.target.value })} className={inputCls}>
                          <option value="Япония">{ORIGIN_LABEL[lang]["Япония"]}</option>
                          <option value="Корея">{ORIGIN_LABEL[lang]["Корея"]}</option>
                          <option value="Гонконг">{ORIGIN_LABEL[lang]["Гонконг"]}</option>
                          <option value="Китай">{ORIGIN_LABEL[lang]["Китай"]}</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-widest uppercase mb-2">{t("budget_unit")}</label>
                        <input placeholder="300000" value={newOrderForm.budget} onChange={(e) => setNewOrderForm({ ...newOrderForm, budget: e.target.value })} className={inputCls} />
                      </div>
                      <div>
                        <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-widest uppercase mb-2">{t("comment")}</label>
                        <textarea rows={3} placeholder={t("comment_req_ph")} value={newOrderForm.comment} onChange={(e) => setNewOrderForm({ ...newOrderForm, comment: e.target.value })} className={inputCls + " resize-none"} />
                      </div>
                      <button type="submit" className="w-full py-3.5 btn-navy rounded-sm">{t("create_order")}</button>
                    </form>
                  )}
                </div>
              )}

              {/* ── Аукционы ── */}
              {cabinetTab === "auctions" && (
                <div>
                  <div className="mb-6">
                    <h2 className="font-['Montserrat'] font-black text-2xl navy mb-2">{t("jp_auctions")}</h2>
                    <p className="text-[hsl(var(--navy)/0.68)] text-sm">{t("jp_auctions_sub")}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { name: "USS Auction", country: "🇯🇵", desc: t("auc_uss"), url: "https://www.uss-auction.jp", tag: t("auc_tag_jp1") },
                      { name: "JU Auction", country: "🇯🇵", desc: t("auc_ju"), url: "https://www.ju-auction.jp", tag: t("auc_tag_crash") },
                      { name: "TAA Auction", country: "🇯🇵", desc: t("auc_taa"), url: "https://www.taa.gr.jp", tag: t("auc_tag_toyota") },
                      { name: "HAA Auction", country: "🇯🇵", desc: t("auc_haa"), url: "https://www.honda.co.jp", tag: t("auc_tag_honda") },
                      { name: "Kcaa Auction", country: "🇰🇷", desc: t("auc_kcaa"), url: "https://www.kcaa.or.kr", tag: t("auc_tag_kr1") },
                      { name: "Manheim Korea", country: "🇰🇷", desc: t("auc_manheim"), url: "https://korea.manheim.com", tag: t("auc_tag_intl") },
                    ].map((a) => (
                      <a key={a.name} href={a.url} target="_blank" rel="noopener noreferrer"
                        className="card-light rounded-sm p-5 flex flex-col gap-3 group hover:shadow-md transition-all">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-xl mr-2">{a.country}</span>
                            <span className="font-['Montserrat'] font-bold text-base navy">{a.name}</span>
                          </div>
                          <span className="text-[10px] font-['Montserrat'] font-bold px-2 py-0.5 bg-[hsl(var(--gold)/0.1)] text-[hsl(var(--gold))] rounded-full whitespace-nowrap">{a.tag}</span>
                        </div>
                        <p className="text-[hsl(var(--navy)/0.68)] text-sm leading-relaxed">{a.desc}</p>
                        <div className="flex items-center gap-1.5 text-[hsl(var(--gold))] text-xs font-['Montserrat'] font-semibold group-hover:gap-2.5 transition-all">
                          {t("go_to_auction")} <Icon name="ExternalLink" size={13} />
                        </div>
                      </a>
                    ))}
                  </div>
                  <div className="mt-6 p-4 bg-[hsl(222_44%_9%/0.5)] rounded-sm border border-[hsl(var(--gold)/0.3)] flex items-start gap-3">
                    <Icon name="Info" size={16} className="text-[hsl(var(--gold))] flex-shrink-0 mt-0.5" />
                    <p className="text-[hsl(var(--navy)/0.6)] text-sm">{t("auction_info_pre")}<button onClick={() => setCabinetTab("new_order")} className="text-[hsl(var(--gold))] font-semibold hover:underline">{t("auction_info_link")}</button>{t("auction_info_post")}</p>
                  </div>
                </div>
              )}

              {/* ── Документы ── */}
              {cabinetTab === "documents" && (
                <div>
                  <div className="mb-6"><h2 className="font-['Montserrat'] font-black text-2xl navy mb-2">{t("documents")}</h2><p className="text-[hsl(var(--navy)/0.68)] text-sm">{t("documents_sub")}</p></div>
                  <div className="max-w-lg">
                    <div className="card-light rounded-sm p-8 border-2 border-dashed border-[hsl(var(--gold)/0.18)] text-center mb-5">
                      <Icon name="Upload" size={32} className="mx-auto mb-3 text-[hsl(var(--navy)/0.25)]" />
                      <p className="font-['Montserrat'] font-semibold navy mb-1">{t("upload_document")}</p>
                      <p className="text-[hsl(var(--navy)/0.62)] text-xs mb-4">{t("upload_hint")}</p>
                      <button className="px-5 py-2.5 btn-navy rounded-sm text-xs">{t("choose_file")}</button>
                    </div>
                    <div className="text-center py-8 text-[hsl(var(--navy)/0.6)]">
                      <Icon name="FileText" size={32} className="mx-auto mb-3 opacity-40" />
                      <p className="text-sm">{t("no_documents")}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Горячие предложения (Гонконг) ── */}
              {cabinetTab === "hot_deals" && isStaff && (
                <div className="max-w-4xl">
                  <div className="mb-6">
                    <h2 className="font-['Montserrat'] font-bold text-xl navy mb-1">{t("hde_title")}</h2>
                    <p className="text-[hsl(var(--navy)/0.68)] text-sm">{t("hde_sub")}</p>
                  </div>

                  <form onSubmit={saveDeal} className="card-light rounded-sm p-6 mb-8">
                    <div className="flex items-center gap-2 mb-5">
                      <Icon name={dealForm.id ? "Pencil" : "Plus"} size={18} className="text-[hsl(var(--gold))]" />
                      <h3 className="font-['Montserrat'] font-bold text-base navy">{dealForm.id ? t("hde_form_edit") : t("hde_form_new")}</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-widest uppercase mb-2">{t("hde_brand")}</label>
                        <input required value={dealForm.brand} onChange={(e) => setDealForm({ ...dealForm, brand: e.target.value })} className={inputCls} placeholder="BMW" />
                      </div>
                      <div>
                        <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-widest uppercase mb-2">{t("hde_model")}</label>
                        <input required value={dealForm.model} onChange={(e) => setDealForm({ ...dealForm, model: e.target.value })} className={inputCls} placeholder="X5 xDrive40i" />
                      </div>
                      <div>
                        <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-widest uppercase mb-2">{t("hde_year")}</label>
                        <input type="number" value={dealForm.year} onChange={(e) => setDealForm({ ...dealForm, year: e.target.value })} className={inputCls} placeholder="2021" />
                      </div>
                      <div>
                        <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-widest uppercase mb-2">{t("hde_mileage")}</label>
                        <input value={dealForm.mileage} onChange={(e) => setDealForm({ ...dealForm, mileage: e.target.value })} className={inputCls} placeholder="32 000 км" />
                      </div>
                      <div>
                        <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-widest uppercase mb-2">{t("hde_engine")}</label>
                        <input value={dealForm.engine} onChange={(e) => setDealForm({ ...dealForm, engine: e.target.value })} className={inputCls} placeholder="3.0 бензин" />
                      </div>
                      <div>
                        <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-widest uppercase mb-2">{t("hde_price")}</label>
                        <input value={dealForm.price} onChange={(e) => setDealForm({ ...dealForm, price: e.target.value })} className={inputCls} placeholder="от 4 250 000 ₽" />
                      </div>
                      <div>
                        <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-widest uppercase mb-2">{t("hde_badge")}</label>
                        <input value={dealForm.badge} onChange={(e) => setDealForm({ ...dealForm, badge: e.target.value })} className={inputCls} placeholder="Хит" />
                      </div>
                      <div>
                        <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-widest uppercase mb-2">{t("hde_photo")}</label>
                        <div className="flex items-center gap-3">
                          {dealForm.photo && <img src={dealForm.photo} alt="" className="w-12 h-12 object-cover rounded-sm border border-[hsl(var(--gold)/0.15)]" />}
                          <label className="flex items-center gap-2 px-4 py-2.5 border border-[hsl(var(--gold)/0.15)] rounded-sm text-sm font-['Montserrat'] font-semibold navy cursor-pointer hover:border-[hsl(var(--navy))] transition-colors">
                            <Icon name="Upload" size={15} />{t("hde_upload")}
                            <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                              const f = e.target.files?.[0];
                              if (f) setDealForm({ ...dealForm, photo: await pickDealPhoto(f) });
                            }} />
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-6">
                      <button type="submit" disabled={dealSaving} className="px-6 py-3 btn-gold rounded-sm disabled:opacity-60 flex items-center gap-2">
                        {dealSaving ? <Icon name="Loader" size={15} className="animate-spin" /> : <Icon name={dealForm.id ? "Save" : "Plus"} size={15} />}
                        {dealSaving ? t("hde_saving") : dealForm.id ? t("hde_save") : t("hde_add")}
                      </button>
                      {dealForm.id ? (
                        <button type="button" onClick={() => setDealForm({ ...emptyDeal })} className="px-5 py-3 border border-[hsl(var(--gold)/0.15)] rounded-sm text-sm font-['Montserrat'] font-semibold text-[hsl(var(--navy)/0.6)] hover:text-[hsl(var(--navy))]">{t("hde_cancel")}</button>
                      ) : null}
                    </div>
                  </form>

                  {hotDealsLoading ? (
                    <div className="flex items-center gap-3 py-16 justify-center text-[hsl(var(--navy)/0.62)]">
                      <Icon name="Loader" size={20} className="animate-spin" />{t("hde_loading")}
                    </div>
                  ) : hotDeals.length === 0 ? (
                    <div className="text-center py-16">
                      <Icon name="Flame" size={40} className="mx-auto mb-4 text-[hsl(var(--navy)/0.4)]" />
                      <p className="font-['Montserrat'] font-bold navy">{t("hde_empty")}</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {hotDeals.map((d) => (
                        <div key={d.id} className="card-light rounded-sm p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                          <div className="w-16 h-16 rounded-sm bg-[hsl(222_44%_9%/0.5)] flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {d.photo ? <img src={d.photo} alt="" className="w-full h-full object-cover" /> : <Icon name="Car" size={24} className="text-[hsl(var(--navy)/0.55)]" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-['Montserrat'] font-bold text-sm navy">{d.brand} {d.model}</span>
                              {d.badge && <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-[hsl(var(--gold)/0.12)] text-[hsl(var(--gold))]">{d.badge}</span>}
                            </div>
                            <div className="text-[hsl(var(--navy)/0.68)] text-xs mt-1">{[d.year, d.mileage, d.engine].filter(Boolean).join(" · ")}</div>
                            <div className="font-['Montserrat'] font-bold text-sm gold mt-0.5">{d.price}</div>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <button onClick={() => editDeal(d)} className="flex items-center gap-1.5 px-3 py-2 border border-[hsl(var(--gold)/0.15)] rounded-sm text-xs font-['Montserrat'] font-semibold navy hover:border-[hsl(var(--navy))] transition-colors">
                              <Icon name="Pencil" size={14} />{t("hde_edit")}
                            </button>
                            <button onClick={() => deleteDeal(d.id)} disabled={dealDeletingId === d.id} className="flex items-center gap-1.5 px-3 py-2 border border-[hsl(var(--gold)/0.15)] rounded-sm text-xs font-['Montserrat'] font-semibold text-[hsl(var(--navy)/0.6)] hover:text-red-600 hover:border-red-200 transition-colors disabled:opacity-60">
                              {dealDeletingId === d.id ? <Icon name="Loader" size={14} className="animate-spin" /> : <Icon name="Trash2" size={14} />}{t("hde_delete")}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── Управление сотрудниками ── */}
              {cabinetTab === "staff_users" && isStaff && (
                <div className="max-w-3xl">
                  <div className="mb-6">
                    <h2 className="font-['Montserrat'] font-bold text-xl navy mb-1">{t("su_title")}</h2>
                    <p className="text-[hsl(var(--navy)/0.68)] text-sm">{t("su_sub")}</p>
                  </div>
                  {staffUsersLoading ? (
                    <div className="flex items-center gap-3 py-16 justify-center text-[hsl(var(--navy)/0.62)]">
                      <Icon name="Loader" size={20} className="animate-spin" />{t("su_loading")}
                    </div>
                  ) : staffUsers.length === 0 ? (
                    <div className="text-center py-16">
                      <Icon name="Users" size={40} className="mx-auto mb-4 text-[hsl(var(--navy)/0.4)]" />
                      <p className="font-['Montserrat'] font-bold navy">{t("su_empty")}</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {staffUsers.map((u) => {
                        const staffRole = u.role === "staff";
                        const isMe = u.id === user.id;
                        return (
                          <div key={u.id} className="card-light rounded-sm p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-start gap-4 min-w-0">
                              <div className={`w-10 h-10 rounded-sm flex items-center justify-center flex-shrink-0 ${staffRole ? "bg-[hsl(var(--gold)/0.12)]" : "bg-[hsl(var(--navy)/0.06)]"}`}>
                                <Icon name={staffRole ? "ShieldCheck" : "User"} size={18} className={staffRole ? "text-[hsl(var(--gold))]" : "text-[hsl(var(--navy))]"} />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-['Montserrat'] font-bold text-sm navy truncate">{u.full_name || u.email}</span>
                                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${staffRole ? "bg-[hsl(var(--gold)/0.12)] text-[hsl(var(--gold))]" : "bg-gray-100 text-gray-600"}`}>{staffRole ? t("su_role_staff") : t("su_role_client")}</span>
                                  {isMe && <span className="text-xs text-[hsl(var(--navy)/0.6)]">({t("su_you")})</span>}
                                </div>
                                <div className="text-[hsl(var(--navy)/0.6)] text-sm mt-0.5 truncate">{u.email}{u.phone ? ` · ${u.phone}` : ""}</div>
                                <div className="text-[hsl(var(--navy)/0.6)] text-xs mt-1">{u.company ? `${u.company} · ` : ""}{t("su_registered")} {new Date(u.created_at).toLocaleDateString(lang === "ru" ? "ru" : "en")}</div>
                              </div>
                            </div>
                            {!isMe && (
                              <button onClick={() => toggleUserRole(u)} disabled={roleSavingId === u.id}
                                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-['Montserrat'] font-semibold rounded-sm transition-all flex-shrink-0 disabled:opacity-60 ${staffRole ? "border border-[hsl(var(--gold)/0.15)] text-[hsl(var(--navy)/0.6)] hover:text-red-600 hover:border-red-200" : "btn-gold"}`}>
                                {roleSavingId === u.id ? <Icon name="Loader" size={15} className="animate-spin" /> : <Icon name={staffRole ? "UserMinus" : "ShieldCheck"} size={15} />}
                                {staffRole ? t("su_remove_staff") : t("su_make_staff")}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ── Профиль ── */}
              {cabinetTab === "profile" && (
                <div className="max-w-lg">
                  <form onSubmit={doSaveProfile} className="card-light rounded-sm p-7 flex flex-col gap-5">
                    <div><h2 className="font-['Montserrat'] font-bold text-xl navy mb-1">{t("edit_profile")}</h2><p className="text-[hsl(var(--navy)/0.65)] text-sm">Email: {user.email}</p></div>
                    {profileSaved && <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-sm flex items-center gap-2"><Icon name="Check" size={15} />{t("profile_saved")}</div>}
                    {[
                      { key: "full_name", label: t("full_name"), placeholder: t("ph_name") },
                      { key: "phone", label: t("phone"), placeholder: "+7 (___) ___-__-__" },
                      { key: "company", label: t("company_ip"), placeholder: t("ph_company") },
                      { key: "inn", label: t("inn"), placeholder: t("ph_inn") },
                    ].map((f) => (
                      <div key={f.key}>
                        <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-widest uppercase mb-2">{f.label}</label>
                        <input placeholder={f.placeholder} value={profileForm[f.key as keyof typeof profileForm]} onChange={(e) => setProfileForm({ ...profileForm, [f.key]: e.target.value })} className={inputCls} />
                      </div>
                    ))}
                    <button type="submit" className="w-full py-3.5 btn-navy rounded-sm">{t("save_changes")}</button>
                  </form>
                </div>
              )}
              </div>
            </div>
          )
        )}
    </>
  );
}
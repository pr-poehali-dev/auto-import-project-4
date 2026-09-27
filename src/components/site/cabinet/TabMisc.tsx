import Icon from "@/components/ui/icon";
import type { SiteState } from "@/hooks/useSiteState";
import {
  ORIGIN_LABEL,
} from "@/lib/site-data";

export default function TabMisc(s: SiteState) {
  const {
    cabinetTab,
    dealDeletingId,
    dealForm,
    dealSaving,
    deleteDeal,
    doNewOrder,
    doSaveProfile,
    editDeal,
    emptyDeal,
    hotDeals,
    hotDealsLoading,
    inputCls,
    isStaff,
    lang,
    newOrderForm,
    newOrderSent,
    pickDealPhoto,
    profileForm,
    profileSaved,
    roleSavingId,
    saveDeal,
    setCabinetTab,
    setDealForm,
    setNewOrderForm,
    setProfileForm,
    staffUsers,
    staffUsersLoading,
    t,
    toggleUserRole,
    user,
  } = s;

  if (!user) return null;

  return (
    <>
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
    </>
  );
}
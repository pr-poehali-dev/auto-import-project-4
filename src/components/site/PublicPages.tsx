import Icon from "@/components/ui/icon";
import type { SiteState } from "@/hooks/useSiteState";
import {
  ORIGINS, SERVICES, STATS, WHY, STEPS,
  LOGO, HERO_IMG, DIRECTIONS_IMG, SERVICES_IMG, HOW_IMG, CONTACTS_IMG,
} from "@/lib/site-data";

export default function PublicPages(s: SiteState) {
  const {
    lang, t, nav, page, user, inputCls,
    originId, activeAuction, setActiveAuction, openOrigin,
    contactForm, setContactForm, contactSent, setContactSent,
    loginForm, setLoginForm, authError, authLoading, doLogin, doStaffLogin,
    forgotForm, setForgotForm, forgotStep, setForgotStep, forgotMsg, setForgotMsg,
    setAuthError, doForgot, doReset,
    regForm, setRegForm, regStep, doRegister, doSendCode, codeSending, resetRegStep,
    hotDeals,
  } = s;

  return (
    <>
        {/* ════ HOME ════ */}
        {page === "home" && (
          <>
            <section className="relative min-h-[88vh] flex items-center overflow-hidden light-grid">
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${HERO_IMG})` }}>
                <div className="absolute inset-0 bg-gradient-to-b from-[hsl(222_50%_5%/0.72)] via-[hsl(222_50%_5%/0.86)] to-[hsl(222_50%_4%/0.95)]" />
                <div className="absolute inset-0 bg-[radial-gradient(900px_500px_at_50%_120%,hsl(41_74%_56%/0.12),transparent_65%)]" />
              </div>
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[hsl(var(--gold))]" />
              <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 py-20">
                <div className="max-w-3xl flex flex-col items-center text-center">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-9 anim-up d1 w-full">
                    {ORIGINS.map((o) => (
                      <button key={o.id} onClick={() => openOrigin(o.id)} className="text-left card-light rounded-sm p-5 group relative overflow-hidden hover:shadow-lg transition-all cursor-pointer">
                        <img src={`https://flagcdn.com/w640/${o.cc}.png`} alt="" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 pointer-events-none select-none" />
                        <span className="absolute inset-0 bg-gradient-to-t from-[hsl(222_46%_9%/0.94)] via-[hsl(222_46%_10%/0.78)] to-[hsl(222_46%_12%/0.5)] pointer-events-none" />
                        <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-[hsl(var(--gold))] group-hover:w-full transition-all duration-500" />
                        <div className="relative z-10">
                          <h3 className="font-['Montserrat'] font-bold text-sm mb-1 navy flex items-center gap-2 leading-tight"><img src={`https://flagcdn.com/w40/${o.cc}.png`} alt="" className="w-7 h-5 object-cover rounded-sm shadow-sm flex-shrink-0" /><span className="min-w-0">{o.name[lang]}</span></h3>
                          <p className="text-[hsl(var(--navy)/0.68)] text-xs leading-relaxed mb-3">{o.desc[lang]}</p>
                          <div className="flex items-center gap-1 text-xs font-['Montserrat'] font-semibold text-[hsl(var(--navy))] group-hover:gap-2 transition-all">{t("more")} <Icon name="ArrowRight" size={13} /></div>
                        </div>
                      </button>
                    ))}
                  </div>
                  <p className="text-[hsl(var(--navy)/0.72)] text-base leading-relaxed mb-9 anim-up d2">{t("hero_subtitle")}</p>
                  <div className="flex flex-col sm:flex-row gap-3 anim-up d3 justify-center">
                    <button onClick={() => nav("contacts")} className="px-8 py-3.5 btn-navy rounded-sm">{t("send_request")}</button>
                    <button onClick={() => nav("how")} className="px-8 py-3.5 btn-outline rounded-sm">{t("how_we_work")}</button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 mt-12 anim-up d4">
                    {STATS.map(({ num, label }) => (
                      <div key={label.ru} className="border-l-2 border-[hsl(var(--gold))] pl-4">
                        <div className="font-['Montserrat'] font-black text-2xl text-[hsl(var(--navy))] leading-none">{num}</div>
                        <div className="text-[hsl(var(--navy)/0.65)] text-xs mt-1 leading-tight">{label[lang]}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="py-20 px-5 sm:px-8 max-w-7xl mx-auto">
              <div className="mb-12"><div className="section-tag mb-3 !text-white">{t("directions_tag")}</div><h2 className="font-['Montserrat'] font-black text-4xl sm:text-5xl text-white drop-shadow-[0_2px_4px_rgba(25,61,100,0.55)]">{t("from_where")}</h2><div className="divider-navy mt-4" /></div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {ORIGINS.map((o) => (
                  <button key={o.id} onClick={() => openOrigin(o.id)} className="text-left card-light rounded-sm p-7 group relative overflow-hidden hover:shadow-lg transition-all cursor-pointer">
                    <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-[hsl(var(--gold))] group-hover:w-full transition-all duration-500" />
                    <h3 className="font-['Montserrat'] font-bold text-base mb-2 navy flex items-center gap-2 leading-tight"><span className="text-3xl flex-shrink-0">{o.flag}</span><span className="min-w-0">{o.name[lang]}</span></h3>
                    <p className="text-[hsl(var(--navy)/0.68)] text-sm leading-relaxed mb-4">{o.desc[lang]}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-['Montserrat'] font-semibold gold"><Icon name="Package" size={13} />{o.volume[lang]}</div>
                      <div className="flex items-center gap-1 text-xs font-['Montserrat'] font-semibold text-[hsl(var(--navy))] group-hover:gap-2 transition-all">{t("more")} <Icon name="ArrowRight" size={13} /></div>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <section className="py-20 px-5 sm:px-8 bg-[hsl(222_44%_9%/0.5)]">
              <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
                  <div><div className="section-tag mb-3">{t("what_we_do")}</div><h2 className="font-['Montserrat'] font-black text-4xl sm:text-5xl">{t("services_title")}</h2><div className="divider-navy mt-4" /></div>
                  <button onClick={() => nav("services")} className="flex items-center gap-2 text-[hsl(var(--gold))] text-sm font-['Montserrat'] font-semibold hover:gap-3 transition-all">{t("more")} <Icon name="ArrowRight" size={15} /></button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {SERVICES.map((s, i) => (
                    <div key={i} className="card-light rounded-sm p-6 group flex gap-4">
                      <div className="w-10 h-10 rounded-sm bg-[hsl(var(--navy)/0.06)] flex items-center justify-center flex-shrink-0 group-hover:bg-[hsl(var(--navy)/0.12)] transition-colors">
                        <Icon name={s.icon} size={18} className="text-[hsl(var(--navy))]" />
                      </div>
                      <div><h3 className="font-['Montserrat'] font-bold text-sm mb-1.5 navy leading-snug">{s.title[lang]}</h3><p className="text-[hsl(var(--navy)/0.68)] text-xs leading-relaxed">{s.desc[lang]}</p></div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="py-20 px-5 sm:px-8 max-w-7xl mx-auto">
              <div className="mb-12"><div className="section-tag mb-3 !text-white">{t("advantages_tag")}</div><h2 className="font-['Montserrat'] font-black text-4xl sm:text-5xl text-white drop-shadow-[0_2px_4px_rgba(25,61,100,0.55)]">{t("why_us")}</h2><div className="divider-navy mt-4" /></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {WHY.map((w, i) => (
                  <div key={i} className="card-light rounded-sm p-6 group flex gap-5">
                    <div className="w-11 h-11 rounded-sm bg-[hsl(var(--gold)/0.1)] flex items-center justify-center flex-shrink-0 group-hover:bg-[hsl(var(--gold)/0.18)] transition-colors">
                      <Icon name={w.icon} size={20} className="text-[hsl(var(--gold))]" />
                    </div>
                    <div><h3 className="font-['Montserrat'] font-bold text-base mb-1.5 navy">{w.title[lang]}</h3><p className="text-[hsl(var(--navy)/0.68)] text-sm leading-relaxed">{w.desc[lang]}</p></div>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-[hsl(var(--navy))] py-20 relative overflow-hidden">
              <div className="absolute inset-0 light-grid opacity-10" />
              <div className="relative max-w-3xl mx-auto px-5 sm:px-8 text-center">
                <div className="section-tag mb-5 justify-center border-[hsl(var(--gold)/0.5)] text-[hsl(var(--gold))]">{t("start_coop_tag")}</div>
                <h2 className="font-['Montserrat'] font-black text-4xl sm:text-5xl text-white mb-4">{t("cta_need_1")}<br /><span className="text-[hsl(var(--gold))]">{t("cta_need_2")}</span></h2>
                <p className="text-white/80 mb-8">{t("cta_subtitle")}</p>
                <button onClick={() => nav("contacts")} className="px-10 py-4 btn-gold rounded-sm">{t("send_request")}</button>
              </div>
            </section>
          </>
        )}

        {/* ════ SERVICES ════ */}
        {page === "services" && (
          <section className="min-h-screen">
            <div className="relative overflow-hidden mb-12">
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${SERVICES_IMG})` }} />
              <div className="absolute inset-0 bg-gradient-to-r from-[hsl(222_50%_5%/0.94)] via-[hsl(222_50%_6%/0.82)] to-[hsl(222_50%_7%/0.55)]" />
              <div className="relative max-w-7xl mx-auto px-5 sm:px-8 py-20 sm:py-24">
                <div className="section-tag mb-3 border-[hsl(var(--gold)/0.5)] text-[hsl(var(--gold))]">{t("what_we_do")}</div>
                <h1 className="font-['Montserrat'] font-black text-4xl sm:text-5xl text-white">{t("services_title")}</h1>
                <div className="h-1 w-16 bg-[hsl(var(--gold))] mt-4" />
              </div>
            </div>
            <div className="px-5 sm:px-8 max-w-7xl mx-auto pb-14">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-16">
              {SERVICES.map((s, i) => (
                <div key={i} className="card-light rounded-sm p-7 group flex gap-5">
                  <div className="w-12 h-12 rounded-sm bg-[hsl(var(--navy)/0.06)] flex items-center justify-center flex-shrink-0 group-hover:bg-[hsl(var(--navy)/0.12)] transition-colors">
                    <Icon name={s.icon} size={22} className="text-[hsl(var(--navy))]" />
                  </div>
                  <div><h3 className="font-['Montserrat'] font-bold text-lg mb-2 navy">{s.title[lang]}</h3><p className="text-[hsl(var(--navy)/0.68)] text-sm leading-relaxed">{s.desc[lang]}</p></div>
                </div>
              ))}
            </div>
            <div className="bg-[hsl(222_44%_9%/0.5)] rounded-sm p-8 border border-[hsl(var(--gold)/0.3)] text-center">
              <h3 className="font-['Montserrat'] font-bold text-2xl mb-3 navy">{t("custom_service_title")}</h3>
              <p className="text-[hsl(var(--navy)/0.68)] mb-6 text-sm">{t("custom_service_sub")}</p>
              <button onClick={() => nav("contacts")} className="px-8 py-3.5 btn-navy rounded-sm">{t("discuss_task")}</button>
            </div>
            </div>
          </section>
        )}

        {/* ════ HOW ════ */}
        {page === "how" && (
          <section className="min-h-screen">
            <div className="relative overflow-hidden mb-12">
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${HOW_IMG})` }} />
              <div className="absolute inset-0 bg-gradient-to-r from-[hsl(222_50%_5%/0.94)] via-[hsl(222_50%_6%/0.82)] to-[hsl(222_50%_7%/0.55)]" />
              <div className="relative max-w-7xl mx-auto px-5 sm:px-8 py-20 sm:py-24">
                <div className="section-tag mb-3 border-[hsl(var(--gold)/0.5)] text-[hsl(var(--gold))]">{t("process_tag")}</div>
                <h1 className="font-['Montserrat'] font-black text-4xl sm:text-5xl text-white">{t("how_we_work_title")}</h1>
                <div className="h-1 w-16 bg-[hsl(var(--gold))] mt-4" />
              </div>
            </div>
            <div className="px-5 sm:px-8 max-w-7xl mx-auto pb-14">
            <div className="relative max-w-2xl">
              <div className="absolute left-6 top-0 bottom-10 w-px bg-[hsl(var(--navy)/0.12)]" />
              <div className="flex flex-col gap-5">
                {STEPS.map((s, i) => (
                  <div key={i} className="relative flex gap-8 group">
                    <div className="flex-shrink-0 w-12 flex justify-center">
                      <div className="w-12 h-12 bg-[hsl(var(--navy))] flex items-center justify-center font-['Montserrat'] font-black text-white text-sm z-10 relative group-hover:bg-[hsl(var(--gold))] transition-colors rounded-sm">{s.n}</div>
                    </div>
                    <div className="flex-1 card-light rounded-sm px-6 py-5 mb-2">
                      <h3 className="font-['Montserrat'] font-bold text-lg mb-1.5 navy">{s.title[lang]}</h3>
                      <p className="text-[hsl(var(--navy)/0.68)] text-sm leading-relaxed">{s.desc[lang]}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-14"><button onClick={() => nav("contacts")} className="px-10 py-4 btn-navy rounded-sm">{t("start_coop")}</button></div>
            </div>
          </section>
        )}

        {/* ════ DIRECTIONS (все направления) ════ */}
        {page === "directions" && (
          <section className="min-h-screen">
            <div className="relative overflow-hidden mb-12">
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${DIRECTIONS_IMG})` }} />
              <div className="absolute inset-0 bg-gradient-to-r from-[hsl(222_50%_5%/0.94)] via-[hsl(222_50%_6%/0.82)] to-[hsl(222_50%_7%/0.55)]" />
              <div className="relative max-w-7xl mx-auto px-5 sm:px-8 py-20 sm:py-24">
                <div className="section-tag mb-3">{t("directions_tag")}</div>
                <h1 className="font-['Montserrat'] font-black text-4xl sm:text-5xl text-white">{t("source_countries")}</h1>
                <div className="h-1 w-16 bg-[hsl(var(--gold))] mt-4" />
                <p className="text-[hsl(var(--navy)/0.75)] text-lg leading-relaxed max-w-3xl mt-6">{t("directions_intro")}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-5 sm:px-8 max-w-7xl mx-auto pb-14">
              {ORIGINS.map((o) => (
                <div key={o.id} onClick={() => openOrigin(o.id)}
                  className="card-light rounded-sm p-7 text-left flex flex-col transition-all hover:shadow-lg hover:-translate-y-1 group cursor-pointer">
                  <div className="flex items-center justify-between mb-5">
                    <div className="text-5xl">{o.flag}</div>
                    <Icon name="ArrowRight" size={20} className="text-[hsl(var(--navy)/0.55)] group-hover:text-[hsl(var(--gold))] transition-colors" />
                  </div>
                  <h2 className="font-['Montserrat'] font-black text-2xl navy mb-2">{o.name[lang]}</h2>
                  <p className="text-[hsl(var(--navy)/0.55)] text-sm leading-relaxed mb-5 flex-1">{o.desc[lang]}</p>
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {o.brands.slice(0, 4).map((b) => (
                      <span key={b} className="px-2.5 py-1 bg-[hsl(222_44%_9%/0.5)] border border-[hsl(var(--gold)/0.15)] rounded-sm text-xs font-['Montserrat'] font-semibold navy">{b}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 text-[hsl(var(--navy)/0.65)] text-xs font-['Montserrat'] font-semibold uppercase tracking-wide pt-4 border-t border-[hsl(var(--gold)/0.12)] mb-4">
                    <Icon name="Package" size={14} />{o.volume[lang]}
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); nav("contacts"); }}
                    className="w-full py-3 btn-gold rounded-sm">{t("leave_request")}</button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ════ ORIGIN (направление) ════ */}
        {page === "origin" && (() => {
          const o = ORIGINS.find((x) => x.id === originId) || ORIGINS[0];
          return (
            <section className="min-h-screen bg-[hsl(var(--navy))] relative overflow-hidden">
              <div className="absolute inset-0 light-grid opacity-10 pointer-events-none" />
              <div className="relative py-14 px-5 sm:px-8 max-w-7xl mx-auto">
              <button onClick={() => nav("home")} className="flex items-center gap-2 text-white text-sm font-['Montserrat'] font-semibold mb-8 hover:text-white/80 transition-colors">
                <Icon name="ArrowLeft" size={15} />{t("all_directions")}
              </button>

              <div className="flex items-center gap-5 mb-6">
                <div className="text-6xl">{o.flag}</div>
                <div>
                  <div className="section-tag mb-2 !text-white">{t("direction_tag")}</div>
                  <h1 className="font-['Montserrat'] font-black text-4xl sm:text-5xl text-white drop-shadow-[0_2px_4px_rgba(25,61,100,0.55)]">{o.name[lang].toUpperCase()} <span className="align-middle">{o.flag}</span></h1>
                </div>
              </div>
              <div className="divider-navy mb-8" />
              <p className="text-white text-lg leading-relaxed max-w-3xl mb-12 drop-shadow-[0_1px_3px_rgba(25,61,100,0.6)]">{o.intro[lang]}</p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-14">
                {o.facts.map((f) => (
                  <div key={f.title.ru} className="card-light rounded-sm p-5">
                    <div className="w-10 h-10 bg-[hsl(var(--navy)/0.06)] rounded-sm flex items-center justify-center mb-3">
                      <Icon name={f.icon} size={18} className="text-[hsl(var(--navy))]" />
                    </div>
                    <div className="text-[hsl(var(--navy)/0.62)] text-xs font-['Montserrat'] font-semibold uppercase tracking-wide">{f.title[lang]}</div>
                    <div className="font-['Montserrat'] font-bold text-base navy mt-0.5">{f.val[lang]}</div>
                  </div>
                ))}
              </div>

              {o.id === "hongkong" && hotDeals.length > 0 && (
                <div className="mb-14">
                  <div className="flex items-center gap-3 mb-2">
                    <Icon name="Flame" size={24} className="text-[hsl(var(--gold))]" />
                    <h2 className="font-['Montserrat'] font-black text-2xl text-white drop-shadow-[0_1px_3px_rgba(25,61,100,0.6)]">{t("hot_deals_title")}</h2>
                  </div>
                  <p className="text-white/90 text-sm mb-6 max-w-2xl drop-shadow-[0_1px_3px_rgba(25,61,100,0.6)]">{t("hot_deals_sub")}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {hotDeals.map((d) => (
                      <div key={d.id} className="card-light rounded-sm overflow-hidden flex flex-col group">
                        <div className="relative h-40 bg-gradient-to-br from-[hsl(var(--navy))] to-[hsl(var(--navy)/0.7)] flex items-center justify-center overflow-hidden">
                          {d.photo ? (
                            <img src={d.photo} alt={d.model} className="w-full h-full object-cover" />
                          ) : (
                            <Icon name="Car" size={56} className="text-white/15" />
                          )}
                          {d.badge && <span className="absolute top-3 left-3 text-[11px] font-['Montserrat'] font-bold px-2.5 py-1 bg-[hsl(var(--gold))] text-white rounded-sm uppercase tracking-wide">{d.badge}</span>}
                          {d.brand && <span className="absolute top-3 right-3 text-[11px] font-['Montserrat'] font-bold px-2.5 py-1 bg-[hsl(222_50%_6%/0.85)] backdrop-blur-sm border border-[hsl(var(--gold)/0.25)] navy rounded-sm">{d.brand}</span>}
                        </div>
                        <div className="p-5 flex flex-col flex-1">
                          <h3 className="font-['Montserrat'] font-bold text-lg navy leading-tight mb-3">{d.model}</h3>
                          <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                            <div>
                              <div className="text-[hsl(var(--navy)/0.62)] text-[10px] font-['Montserrat'] font-semibold uppercase tracking-wide">{t("hd_year")}</div>
                              <div className="font-['Montserrat'] font-bold text-sm navy">{d.year || "—"}</div>
                            </div>
                            <div>
                              <div className="text-[hsl(var(--navy)/0.62)] text-[10px] font-['Montserrat'] font-semibold uppercase tracking-wide">{t("hd_mileage")}</div>
                              <div className="font-['Montserrat'] font-bold text-sm navy">{d.mileage || "—"}</div>
                            </div>
                            <div>
                              <div className="text-[hsl(var(--navy)/0.62)] text-[10px] font-['Montserrat'] font-semibold uppercase tracking-wide">{t("hd_engine")}</div>
                              <div className="font-['Montserrat'] font-bold text-sm navy">{d.engine || "—"}</div>
                            </div>
                          </div>
                          <div className="mt-auto pt-4 border-t border-[hsl(var(--gold)/0.12)] flex items-center justify-between gap-3">
                            <span className="font-['Montserrat'] font-black text-lg gold">{d.price}</span>
                            <button onClick={() => nav("contacts")} className="px-4 py-2.5 btn-gold rounded-sm whitespace-nowrap">{t("hd_reserve")}</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {"auctionLinks" in o && o.auctionLinks && (
                <div className="mb-14">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="font-['Montserrat'] font-black text-2xl text-white drop-shadow-[0_1px_3px_rgba(25,61,100,0.6)]">{t("auction_access")}</h2>
                    <span className="text-[10px] font-['Montserrat'] font-bold px-2 py-0.5 bg-[hsl(var(--gold)/0.12)] text-[hsl(var(--gold))] rounded-full uppercase tracking-wide">Live</span>
                  </div>
                  <p className="text-white/90 text-sm mb-6 max-w-2xl drop-shadow-[0_1px_3px_rgba(25,61,100,0.6)]">{t("auction_access_sub")}</p>

                  {!user ? (
                    <div className="card-light rounded-sm p-10 text-center flex flex-col items-center">
                      <div className="w-14 h-14 rounded-full bg-[hsl(var(--navy)/0.06)] flex items-center justify-center mb-4">
                        <Icon name="Lock" size={26} className="text-[hsl(var(--navy)/0.68)]" />
                      </div>
                      <h3 className="font-['Montserrat'] font-bold text-lg navy mb-2">{t("auction_locked_title")}</h3>
                      <p className="text-[hsl(var(--navy)/0.68)] text-sm mb-6 max-w-md">{t("auction_locked_sub")}</p>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button onClick={() => nav("login")} className="px-6 py-3 btn-navy rounded-sm">{t("login")}</button>
                        <button onClick={() => nav("register")} className="px-6 py-3 btn-outline rounded-sm">{t("register")}</button>
                      </div>
                    </div>
                  ) : (
                  <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                    {o.auctionLinks.map((a) => (
                      <div key={a.name} className={`card-light rounded-sm p-4 flex flex-col gap-3 transition-all ${activeAuction?.name === a.name ? "ring-2 ring-[hsl(var(--gold))]" : ""}`}>
                        <div className="flex items-start gap-2">
                          <Icon name="Gavel" size={16} className="text-[hsl(var(--navy))] mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="font-['Montserrat'] font-bold text-sm navy leading-tight">{a.name}</div>
                            <div className="text-[hsl(var(--navy)/0.65)] text-xs mt-1 leading-snug">{a.desc[lang]}</div>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-auto">
                          <button onClick={() => setActiveAuction({ name: a.name, url: a.url })}
                            className="flex-1 py-2 bg-[hsl(var(--navy))] text-white text-xs font-['Montserrat'] font-semibold rounded-sm hover:bg-[hsl(var(--navy)/0.9)] transition-colors">
                            {t("open_here")}
                          </button>
                          <a href={a.url} target="_blank" rel="noopener noreferrer"
                            className="px-3 py-2 border border-[hsl(var(--gold)/0.18)] rounded-sm flex items-center justify-center hover:border-[hsl(var(--navy))] transition-colors" title={t("open_new_tab_title")}>
                            <Icon name="ExternalLink" size={14} className="text-[hsl(var(--navy))]" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>

                  {activeAuction && (
                    <div className="card-light rounded-sm overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3 bg-[hsl(222_44%_9%/0.5)] border-b border-[hsl(var(--gold)/0.15)]">
                        <div className="flex items-center gap-2">
                          <Icon name="Globe" size={15} className="text-[hsl(var(--navy))]" />
                          <span className="font-['Montserrat'] font-semibold text-sm navy">{activeAuction.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <a href={activeAuction.url} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs font-['Montserrat'] font-semibold text-[hsl(var(--gold))] hover:underline">
                            {t("in_new_tab")} <Icon name="ExternalLink" size={12} />
                          </a>
                          <button onClick={() => setActiveAuction(null)} className="text-[hsl(var(--navy)/0.62)] hover:text-[hsl(var(--navy))]">
                            <Icon name="X" size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="relative bg-[hsl(222_44%_9%/0.5)]">
                        <iframe src={activeAuction.url} title={activeAuction.name} className="w-full h-[600px] border-0" sandbox="allow-same-origin allow-scripts allow-popups allow-forms" />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="card-light rounded-sm px-5 py-4 text-center max-w-xs pointer-events-auto shadow-lg" style={{ opacity: 0.97 }}>
                            <Icon name="Info" size={20} className="text-[hsl(var(--gold))] mx-auto mb-2" />
                            <p className="text-[hsl(var(--navy)/0.7)] text-xs leading-relaxed mb-3">{t("iframe_warning")}</p>
                            <a href={activeAuction.url} target="_blank" rel="noopener noreferrer"
                              className="inline-block px-4 py-2 bg-[hsl(var(--navy))] text-white text-xs font-['Montserrat'] font-semibold rounded-sm">
                              {t("open_auction")}
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  </>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-14">
                <div>
                  <h2 className="font-['Montserrat'] font-black text-2xl text-white mb-5 drop-shadow-[0_1px_3px_rgba(25,61,100,0.6)]">{t("advantages")}</h2>
                  <div className="flex flex-col gap-3">
                    {o.advantages.map((a, i) => (
                      <div key={i} className="flex items-start gap-3 card-light rounded-sm p-4">
                        <Icon name="CheckCircle" size={18} className="text-[hsl(var(--gold))] flex-shrink-0 mt-0.5" />
                        <span className="text-[hsl(var(--navy)/0.65)] text-sm leading-relaxed">{a[lang]}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-8">
                  <div>
                    <h2 className="font-['Montserrat'] font-black text-2xl text-white mb-5 drop-shadow-[0_1px_3px_rgba(25,61,100,0.6)]">{t("popular_brands")}</h2>
                    <div className="flex flex-wrap gap-2">
                      {o.brands.map((b) => (
                        <span key={b} className="px-4 py-2 bg-[hsl(222_44%_9%/0.5)] border border-[hsl(var(--gold)/0.15)] rounded-sm text-sm font-['Montserrat'] font-semibold navy">{b}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h2 className="font-['Montserrat'] font-black text-2xl text-white mb-5 drop-shadow-[0_1px_3px_rgba(25,61,100,0.6)]">{t("auctions_platforms")}</h2>
                    <div className="flex flex-col gap-2">
                      {o.auctions.map((a) => (
                        <div key={a.ru} className="flex items-center gap-3 card-light rounded-sm px-4 py-3">
                          <Icon name="Globe" size={16} className="text-[hsl(var(--navy))]" />
                          <span className="text-sm font-medium navy">{a[lang]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/15 rounded-sm p-8 sm:p-10 text-center relative overflow-hidden backdrop-blur-sm">
                <div className="absolute inset-0 light-grid opacity-10" />
                <div className="relative">
                  <h3 className="font-['Montserrat'] font-black text-2xl sm:text-3xl text-white mb-3">{t("origin_cta_title_pre")}{o.name[lang]}{t("origin_cta_title_post")}</h3>
                  <p className="text-white/80 mb-7 text-sm">{t("origin_cta_sub")}</p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button onClick={() => nav("contacts")} className="px-8 py-3.5 btn-gold rounded-sm">{t("send_request")}</button>
                    <button onClick={() => nav("how")} className="px-8 py-3.5 border border-white/30 text-white rounded-sm font-['Montserrat'] font-semibold hover:bg-white/10 transition-colors">{t("how_we_work")}</button>
                  </div>
                </div>
              </div>
              </div>
            </section>
          );
        })()}

        {/* ════ CONTACTS ════ */}
        {page === "contacts" && (
          <section className="min-h-screen">
            <div className="relative overflow-hidden mb-12">
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${CONTACTS_IMG})` }} />
              <div className="absolute inset-0 bg-gradient-to-r from-[hsl(222_50%_5%/0.94)] via-[hsl(222_50%_6%/0.82)] to-[hsl(222_50%_7%/0.55)]" />
              <div className="relative max-w-7xl mx-auto px-5 sm:px-8 py-20 sm:py-24">
                <div className="section-tag mb-3 border-[hsl(var(--gold)/0.5)] text-[hsl(var(--gold))]">{t("contact_tag")}</div>
                <h1 className="font-['Montserrat'] font-black text-4xl sm:text-5xl text-white">{t("leave_request_title")}</h1>
                <div className="h-1 w-16 bg-[hsl(var(--gold))] mt-4" />
              </div>
            </div>
            <div className="px-5 sm:px-8 max-w-7xl mx-auto pb-14">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="card-light rounded-sm p-8">
                {contactSent ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-14 h-14 rounded-sm bg-[hsl(var(--gold)/0.1)] flex items-center justify-center mb-5"><Icon name="CheckCircle" size={30} className="text-[hsl(var(--gold))]" /></div>
                    <h3 className="font-['Montserrat'] font-bold text-2xl mb-2 navy">{t("request_accepted")}</h3>
                    <p className="text-[hsl(var(--navy)/0.68)] text-sm">{t("request_accepted_sub")}</p>
                    <button onClick={() => setContactSent(false)} className="mt-6 text-[hsl(var(--gold))] text-sm hover:underline font-['Montserrat'] font-semibold">{t("send_another")}</button>
                  </div>
                ) : (
                  <form onSubmit={(e) => { e.preventDefault(); setContactSent(true); }} className="flex flex-col gap-5">
                    <div><h2 className="font-['Montserrat'] font-bold text-xl mb-1 navy">{t("supply_request")}</h2><p className="text-[hsl(var(--navy)/0.65)] text-sm">{t("supply_request_sub")}</p></div>
                    {[
                      { key: "name", label: t("contact_person"), placeholder: t("ph_name"), type: "text", required: true },
                      { key: "company", label: t("company_ip"), placeholder: t("ph_company"), type: "text", required: false },
                      { key: "phone", label: t("phone_req"), placeholder: "+7 (___) ___-__-__", type: "tel", required: true },
                    ].map((f) => (
                      <div key={f.key}>
                        <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-widest uppercase mb-2">{f.label}</label>
                        <input required={f.required} type={f.type} placeholder={f.placeholder} value={contactForm[f.key as keyof typeof contactForm]} onChange={(e) => setContactForm({ ...contactForm, [f.key]: e.target.value })} className={inputCls} />
                      </div>
                    ))}
                    <div>
                      <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-widest uppercase mb-2">{t("comment")}</label>
                      <textarea rows={3} value={contactForm.comment} onChange={(e) => setContactForm({ ...contactForm, comment: e.target.value })} placeholder={t("comment_ph")} className={inputCls + " resize-none"} />
                    </div>
                    <button type="submit" className="w-full py-4 btn-navy rounded-sm">{t("send_request")}</button>
                  </form>
                )}
              </div>
              <div className="flex flex-col gap-5">
                <div className="card-light rounded-sm p-6">
                  <h3 className="font-['Montserrat'] font-bold text-base mb-5 navy uppercase tracking-wider">{t("contacts")}</h3>
                  <div className="flex flex-col gap-5">
                    {[{ icon: "Phone", label: t("phone"), val: "+7 (800) 000-00-00", sub: t("phone_sub") }, { icon: "Mail", label: "Email", val: "info@partcore.ru", sub: t("email_sub") }, { icon: "MessageCircle", label: "Telegram / WhatsApp", val: "+7 (900) 000-00-00", sub: t("messenger_sub") }, { icon: "MapPin", label: t("office"), val: t("office_city"), sub: t("office_hours") }].map((c) => (
                      <div key={c.label} className="flex items-start gap-4">
                        <div className="w-9 h-9 bg-[hsl(var(--navy)/0.07)] flex items-center justify-center flex-shrink-0 rounded-sm"><Icon name={c.icon} size={16} className="text-[hsl(var(--navy))]" /></div>
                        <div><div className="text-[hsl(var(--navy)/0.62)] text-xs font-['Montserrat'] font-semibold tracking-wide uppercase">{c.label}</div><div className="text-[hsl(var(--navy))] font-medium text-sm mt-0.5">{c.val}</div><div className="text-[hsl(var(--navy)/0.6)] text-xs">{c.sub}</div></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            </div>
          </section>
        )}

        {/* ════ STAFF LOGIN (скрытая страница #staff) ════ */}
        {page === "staff_login" && (
          <section className="min-h-screen flex items-center justify-center py-14 px-5 bg-[hsl(var(--navy))]">
            <div className="w-full max-w-md">
              <div className="text-center mb-8">
                <div className="w-14 h-14 rounded-full bg-[hsl(var(--gold)/0.15)] flex items-center justify-center mx-auto mb-5">
                  <Icon name="ShieldCheck" size={28} className="text-[hsl(var(--gold))]" />
                </div>
                <h1 className="font-['Montserrat'] font-black text-3xl text-white mb-2">{t("staff_login_title")}</h1>
                <p className="text-white/80 text-sm">{t("staff_login_sub")}</p>
              </div>
              <div className="card-light rounded-sm p-8 shadow-xl">
                <form onSubmit={doStaffLogin} className="flex flex-col gap-5">
                  {authError && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-sm">{authError}</div>}
                  <div>
                    <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-widest uppercase mb-2">Email *</label>
                    <input required type="email" placeholder="staff@partcore.ru" value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-widest uppercase mb-2">{t("pwd")}</label>
                    <input required type="password" placeholder="••••••••" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} className={inputCls} />
                  </div>
                  <button type="submit" disabled={authLoading} className="w-full py-3.5 btn-navy rounded-sm disabled:opacity-60">
                    {authLoading ? t("logging_in") : t("login")}
                  </button>
                </form>
                <div className="text-center mt-5">
                  <button onClick={() => { window.location.hash = ""; nav("home"); }} className="text-[hsl(var(--navy)/0.62)] text-sm hover:text-[hsl(var(--navy))] font-medium">← {t("nav_home")}</button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ════ LOGIN ════ */}
        {page === "login" && (
          <section className="min-h-screen flex items-center justify-center py-14 px-5">
            <div className="w-full max-w-md">
              <div className="text-center mb-8">
                <img src={LOGO} alt="Partcore" className="h-12 mx-auto mb-6 object-contain" />
                <h1 className="font-['Montserrat'] font-black text-3xl navy mb-2">{t("login_title")}</h1>
                <p className="text-[hsl(var(--navy)/0.68)] text-sm">{t("login_sub")}</p>
              </div>
              <div className="card-light rounded-sm p-8">
                <form onSubmit={doLogin} className="flex flex-col gap-5">
                  {authError && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-sm">{authError}</div>}
                  <div>
                    <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-widest uppercase mb-2">Email *</label>
                    <input required type="email" placeholder="you@example.com" value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-widest uppercase mb-2">{t("pwd")}</label>
                    <input required type="password" placeholder="••••••••" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} className={inputCls} />
                  </div>
                  <button type="submit" disabled={authLoading} className="w-full py-3.5 btn-navy rounded-sm disabled:opacity-60">
                    {authLoading ? t("logging_in") : t("login")}
                  </button>
                </form>
                <div className="text-center mt-4">
                  <button onClick={() => { setForgotStep("email"); setForgotMsg(""); setForgotForm({ email: loginForm.email, code: "", password: "" }); nav("forgot"); }} className="text-sm text-[hsl(var(--navy)/0.68)] hover:text-[hsl(var(--gold))] hover:underline">{t("forgot_pwd")}</button>
                </div>
                <div className="text-center mt-2 text-sm text-[hsl(var(--navy)/0.68)]">
                  {t("no_account")}{" "}
                  <button onClick={() => nav("register")} className="text-[hsl(var(--gold))] font-semibold hover:underline">{t("do_register")}</button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ════ FORGOT PASSWORD ════ */}
        {page === "forgot" && (
          <section className="min-h-screen flex items-center justify-center py-14 px-5">
            <div className="w-full max-w-md">
              <div className="text-center mb-8">
                <img src={LOGO} alt="Partcore" className="h-12 mx-auto mb-6 object-contain" />
                <h1 className="font-['Montserrat'] font-black text-3xl navy mb-2">{t("forgot_title")}</h1>
                <p className="text-[hsl(var(--navy)/0.68)] text-sm">{forgotStep === "email" ? t("forgot_sub") : t("forgot_sub2")}</p>
              </div>
              <div className="card-light rounded-sm p-8">
                {forgotStep === "email" ? (
                  <form onSubmit={doForgot} className="flex flex-col gap-5">
                    {authError && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-sm">{authError}</div>}
                    <div>
                      <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-widest uppercase mb-2">Email *</label>
                      <input required type="email" placeholder="you@example.com" value={forgotForm.email} onChange={(e) => setForgotForm({ ...forgotForm, email: e.target.value })} className={inputCls} />
                    </div>
                    <button type="submit" disabled={authLoading} className="w-full py-3.5 btn-navy rounded-sm disabled:opacity-60">
                      {authLoading ? t("sending") : t("send_code")}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={doReset} className="flex flex-col gap-5">
                    {forgotMsg && <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-sm">{forgotMsg}</div>}
                    {authError && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-sm">{authError}</div>}
                    <div>
                      <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-widest uppercase mb-2">{t("code_from_email")}</label>
                      <input required type="text" inputMode="numeric" placeholder="000000" value={forgotForm.code} onChange={(e) => setForgotForm({ ...forgotForm, code: e.target.value })} className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-widest uppercase mb-2">{t("new_pwd")}</label>
                      <input required type="password" placeholder="••••••••" value={forgotForm.password} onChange={(e) => setForgotForm({ ...forgotForm, password: e.target.value })} className={inputCls} />
                    </div>
                    <button type="submit" disabled={authLoading} className="w-full py-3.5 btn-navy rounded-sm disabled:opacity-60">
                      {authLoading ? t("saving") : t("change_pwd")}
                    </button>
                    <button type="button" onClick={() => { setForgotStep("email"); setAuthError(""); setForgotMsg(""); }} className="text-sm text-[hsl(var(--navy)/0.68)] hover:text-[hsl(var(--gold))] hover:underline">{t("resend_code")}</button>
                  </form>
                )}
                <div className="text-center mt-5 text-sm text-[hsl(var(--navy)/0.68)]">
                  <button onClick={() => nav("login")} className="text-[hsl(var(--gold))] font-semibold hover:underline">{t("back_to_login")}</button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ════ REGISTER ════ */}
        {page === "register" && (
          <section className="min-h-screen flex items-center justify-center py-14 px-5">
            <div className="w-full max-w-md">
              <div className="text-center mb-8">
                <img src={LOGO} alt="Partcore" className="h-12 mx-auto mb-6 object-contain" />
                <h1 className="font-['Montserrat'] font-black text-3xl navy mb-2">{regStep === "code" ? t("code_title") : t("register_title")}</h1>
                <p className="text-[hsl(var(--navy)/0.68)] text-sm">{regStep === "code" ? `${t("code_sub")} ${regForm.phone}` : t("register_sub")}</p>
              </div>
              <div className="card-light rounded-sm p-8">
                {regStep === "form" ? (
                  <form onSubmit={doSendCode} className="flex flex-col gap-4">
                    {authError && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-sm">{authError}</div>}
                    {[
                      { key: "full_name", label: t("your_name"), placeholder: t("ph_name"), type: "text", required: true },
                      { key: "email", label: "Email *", placeholder: "you@example.com", type: "email", required: true },
                      { key: "phone", label: t("phone_req"), placeholder: "+7 (___) ___-__-__", type: "tel", required: true },
                      { key: "company", label: t("company_ip"), placeholder: t("ph_company"), type: "text", required: false },
                      { key: "password", label: t("pwd_min"), placeholder: "••••••••", type: "password", required: true },
                    ].map((f) => (
                      <div key={f.key}>
                        <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-widest uppercase mb-2">{f.label}</label>
                        <input required={f.required} type={f.type} placeholder={f.placeholder} value={regForm[f.key as keyof typeof regForm]} onChange={(e) => setRegForm({ ...regForm, [f.key]: e.target.value })} className={inputCls} />
                      </div>
                    ))}
                    <button type="submit" disabled={codeSending} className="w-full py-3.5 btn-navy rounded-sm disabled:opacity-60 mt-1">
                      {codeSending ? t("sending_code") : t("get_code")}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={doRegister} className="flex flex-col gap-4">
                    {authError && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-sm">{authError}</div>}
                    <div>
                      <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-widest uppercase mb-2">{t("sms_code")}</label>
                      <input required type="text" inputMode="numeric" maxLength={6} placeholder="0000" value={regForm.code}
                        onChange={(e) => setRegForm({ ...regForm, code: e.target.value.replace(/\D/g, "") })}
                        className={inputCls + " text-center tracking-[0.5em] text-lg font-bold"} />
                    </div>
                    <button type="submit" disabled={authLoading} className="w-full py-3.5 btn-navy rounded-sm disabled:opacity-60">
                      {authLoading ? t("registering") : t("confirm")}
                    </button>
                    <div className="flex items-center justify-between text-sm">
                      <button type="button" onClick={resetRegStep} className="text-[hsl(var(--navy)/0.68)] hover:text-[hsl(var(--navy))] font-medium">{t("change_number")}</button>
                      <button type="button" onClick={(e) => doSendCode(e as unknown as React.FormEvent)} disabled={codeSending} className="text-[hsl(var(--gold))] font-semibold hover:underline disabled:opacity-50">{t("resend_code")}</button>
                    </div>
                  </form>
                )}
                <div className="text-center mt-5 text-sm text-[hsl(var(--navy)/0.68)]">
                  {t("have_account")}{" "}
                  <button onClick={() => { resetRegStep(); nav("login"); }} className="text-[hsl(var(--gold))] font-semibold hover:underline">{t("login")}</button>
                </div>
              </div>
            </div>
          </section>
        )}

    </>
  );
}
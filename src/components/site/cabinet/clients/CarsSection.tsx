import Icon from "@/components/ui/icon";
import type { SiteState } from "@/hooks/useSiteState";
import { TEARDOWN_GROUPS,groupTeardown,joinTd,splitTd } from "@/lib/site-data";

export default function CarsSection(s: SiteState) {
  const {
    addCustomPart,
    carForm,
    carSaving,
    cars,
    carsLoading,
    clearTeardown,
    doAddCar,
    doDeleteCar,
    exportPackingList,
    exportPackingListXlsx,
    handlePhotoSelect,
    inputCls,
    renderTdBadge,
    selectFullTeardown,
    selectHalfcutTeardown,
    selectNoskatTeardown,
    setCarForm,
    setPartQty,
    setTeardownInput,
    t,
    teardownInput,
    toggleCarFormGroup,
    toggleCarFormPart,
  } = s;

  return (
    <>
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
    </>
  );
}

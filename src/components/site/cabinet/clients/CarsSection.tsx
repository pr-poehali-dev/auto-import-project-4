import Icon from "@/components/ui/icon";
import type { SiteState } from "@/hooks/useSiteState";
import { groupTeardown } from "@/lib/site-data";
import TeardownForm from "@/components/site/cabinet/clients/TeardownForm";

export default function CarsSection(s: SiteState) {
  const {
    carForm,
    carSaving,
    cars,
    carsLoading,
    doAddCar,
    doDeleteCar,
    exportPackingList,
    exportPackingListXlsx,
    exportPackingListTemplateXlsx,
    editCarId,
    editCarForm,
    editCarSaving,
    setEditCarForm,
    startEditCar,
    cancelEditCar,
    saveEditCar,
    printTeardownSheet,
    handlePhotoSelect,
    inputCls,
    renderTdBadge,
    setCarForm,
    t,
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-wide uppercase mb-2">{t("engine_model")}</label>
                            <input placeholder="2AR-FE" value={carForm.engine_model} maxLength={64}
                              onChange={(e) => setCarForm({ ...carForm, engine_model: e.target.value })}
                              className={inputCls + " font-mono tracking-wide"} />
                          </div>
                          <div>
                            <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-wide uppercase mb-2">{t("engine_number")}</label>
                            <input placeholder="2AR-1234567" value={carForm.engine_number} maxLength={64}
                              onChange={(e) => setCarForm({ ...carForm, engine_number: e.target.value.toUpperCase() })}
                              className={inputCls + " font-mono tracking-wide"} />
                          </div>
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
                        <TeardownForm {...s} />
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
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    <button onClick={() => startEditCar(c)} title={t("car_edit")} className="text-[hsl(var(--navy)/0.6)] hover:text-[hsl(var(--gold))]"><Icon name="Pencil" size={15} /></button>
                                    <button onClick={() => doDeleteCar(c.id)} className="text-[hsl(var(--navy)/0.6)] hover:text-red-600"><Icon name="Trash2" size={16} /></button>
                                  </div>
                                </div>
                                {editCarId === c.id && (
                                  <div className="mt-3 p-3 rounded-sm bg-[hsl(var(--gold)/0.06)] border border-[hsl(var(--gold)/0.25)] flex flex-col gap-3">
                                    <div className="text-[11px] font-['Montserrat'] font-bold uppercase tracking-wide text-[hsl(var(--gold))]">{t("car_edit_ids")}</div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                      <div>
                                        <label className="block text-[10px] font-['Montserrat'] font-semibold uppercase tracking-wide text-[hsl(var(--navy)/0.62)] mb-1">VIN</label>
                                        <input value={editCarForm.vin} maxLength={32} placeholder="WBAJA12080BJ18903"
                                          onChange={(e) => setEditCarForm({ ...editCarForm, vin: e.target.value.toUpperCase() })}
                                          className={inputCls + " font-mono text-sm tracking-wider"} />
                                      </div>
                                      <div>
                                        <label className="block text-[10px] font-['Montserrat'] font-semibold uppercase tracking-wide text-[hsl(var(--navy)/0.62)] mb-1">{t("engine_model")}</label>
                                        <input value={editCarForm.engine_model} maxLength={64} placeholder="B48B20B"
                                          onChange={(e) => setEditCarForm({ ...editCarForm, engine_model: e.target.value })}
                                          className={inputCls + " font-mono text-sm"} />
                                      </div>
                                      <div>
                                        <label className="block text-[10px] font-['Montserrat'] font-semibold uppercase tracking-wide text-[hsl(var(--navy)/0.62)] mb-1">{t("engine_number")}</label>
                                        <input value={editCarForm.engine_number} maxLength={64} placeholder="B48-7729341"
                                          onChange={(e) => setEditCarForm({ ...editCarForm, engine_number: e.target.value.toUpperCase() })}
                                          className={inputCls + " font-mono text-sm"} />
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <button type="button" onClick={saveEditCar} disabled={editCarSaving}
                                        className="flex items-center gap-1.5 text-xs font-['Montserrat'] font-bold px-4 py-2 rounded-sm bg-[hsl(var(--gold))] text-[hsl(222_47%_8%)] hover:opacity-90 transition-opacity disabled:opacity-50">
                                        <Icon name={editCarSaving ? "Loader" : "Check"} size={13} className={editCarSaving ? "animate-spin" : ""} />{t("save")}
                                      </button>
                                      <button type="button" onClick={cancelEditCar} disabled={editCarSaving}
                                        className="text-xs font-['Montserrat'] font-bold px-4 py-2 rounded-sm border border-[hsl(var(--gold)/0.25)] text-[hsl(var(--navy)/0.7)] hover:border-[hsl(var(--gold)/0.6)] transition-colors disabled:opacity-50">
                                        {t("cancel")}
                                      </button>
                                    </div>
                                  </div>
                                )}
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
                                {c.description && <p className="text-[hsl(var(--navy)/0.55)] text-sm mt-2 leading-relaxed">{c.description}</p>}
                                {c.teardown && c.teardown.length > 0 && (
                                  <div className="mt-3 pt-3 border-t border-[hsl(var(--gold)/0.12)]">
                                    <div className="flex items-center justify-between gap-2 mb-2">
                                      <div className="flex items-center gap-2 flex-wrap min-w-0">
                                        <div className="text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold uppercase tracking-wide">{t("teardown_title")} · {t("teardown_client_picked")}: {c.teardown.filter((x) => x.needed).length}/{c.teardown.length}</div>
                                        {renderTdBadge(c.teardown, "xs")}
                                      </div>
                                      <div className="flex items-center gap-3 flex-shrink-0">
                                        <button type="button" onClick={() => printTeardownSheet(c)} className="flex items-center gap-1 text-[11px] font-['Montserrat'] font-bold text-[hsl(var(--navy))] hover:text-[hsl(var(--gold))] transition-colors">
                                          <Icon name="Printer" size={13} />{t("td_print")}
                                        </button>
                                        <button type="button" onClick={() => exportPackingList(c)} className="flex items-center gap-1 text-[11px] font-['Montserrat'] font-bold text-[hsl(var(--navy))] hover:text-[hsl(var(--gold))] transition-colors">
                                          <Icon name="FileDown" size={13} />PDF
                                        </button>
                                        <button type="button" onClick={() => exportPackingListXlsx(c)} className="flex items-center gap-1 text-[11px] font-['Montserrat'] font-bold text-[hsl(var(--navy))] hover:text-[hsl(var(--gold))] transition-colors">
                                          <Icon name="Sheet" size={13} />XLSX
                                        </button>
                                        <button type="button" onClick={() => exportPackingListTemplateXlsx(c)} disabled={!c.teardown.some((x) => x.needed)} className="flex items-center gap-1 text-[11px] font-['Montserrat'] font-bold text-[hsl(var(--gold))] hover:text-[hsl(var(--navy))] transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-[hsl(var(--gold))]">
                                          <Icon name="Download" size={13} />{t("pl_download")}
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
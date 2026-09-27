import Icon from "@/components/ui/icon";
import type { SiteState } from "@/hooks/useSiteState";
import { TEARDOWN_GROUPS,joinTd,splitTd } from "@/lib/site-data";

export default function TeardownForm(s: SiteState) {
  const {
    addCustomPart,
    carForm,
    clearTeardown,
    inputCls,
    renderTdBadge,
    selectFullTeardown,
    selectHalfcutTeardown,
    selectNoskatTeardown,
    setPartQty,
    setTeardownInput,
    t,
    teardownInput,
    toggleCarFormGroup,
    toggleCarFormPart,
  } = s;

  return (
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
  );
}

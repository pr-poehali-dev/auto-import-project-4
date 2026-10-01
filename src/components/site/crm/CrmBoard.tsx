import { useEffect, useMemo, useState } from "react";
import Icon from "@/components/ui/icon";
import { STAGES, SOURCE_LABELS, crmGet, crmPost, money, daysSince, isOverdue, fmtDate, type Deal, type Stage, type StaffMember } from "@/lib/crm";
import { panel, input, btnGold, btnGhost, muted } from "./ui";
import NewDealDialog from "./NewDealDialog";

interface Props {
  token: string;
  staff: StaffMember[];
  me: number;
  onOpenDeal: (id: number) => void;
  reloadKey: number;
}

// Воронка: колонки по этапам, карточки перетаскиваются между колонками
export default function CrmBoard({ token, staff, me, onOpenDeal, reloadKey }: Props) {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [manager, setManager] = useState("");
  const [source, setSource] = useState("");
  const [q, setQ] = useState("");
  const [query, setQuery] = useState("");
  const [dragId, setDragId] = useState<number | null>(null);
  const [overStage, setOverStage] = useState<Stage | null>(null);
  const [lostFor, setLostFor] = useState<Deal | null>(null);
  const [lostReason, setLostReason] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [mobileStage, setMobileStage] = useState<Stage>("new");

  const load = async () => {
    const d = await crmGet(token, { view: "board", manager, source, q: query });
    if (d.error) setError(d.error); else { setDeals(d.deals || []); setError(""); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [manager, source, query, reloadKey]);
  useEffect(() => { const id = setTimeout(() => setQuery(q.trim()), 350); return () => clearTimeout(id); }, [q]);

  const byStage = useMemo(() => {
    const m: Record<string, Deal[]> = {};
    STAGES.forEach((s) => { m[s.id] = []; });
    deals.forEach((d) => { (m[d.stage] ||= []).push(d); });
    return m;
  }, [deals]);

  const move = async (deal: Deal, stage: Stage, reason = "") => {
    if (deal.stage === stage) return;
    if (stage === "lost" && !reason) { setLostFor(deal); setLostReason(""); return; }
    const prev = deals;
    setDeals(deals.map((d) => (d.id === deal.id ? { ...d, stage, manager_id: d.manager_id ?? me } : d)));
    const r = await crmPost(token, { action: "move", deal_id: deal.id, stage, lost_reason: reason });
    if (r.error) { setDeals(prev); setError(r.error); return; }
    setDeals((cur) => cur.map((d) => (d.id === deal.id ? r.deal : d)));
  };

  const onDrop = (stage: Stage) => {
    const deal = deals.find((d) => d.id === dragId);
    setDragId(null); setOverStage(null);
    if (deal) move(deal, stage);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-full sm:min-w-[220px] max-w-sm">
          <Icon name="Search" size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${muted}`} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Клиент, телефон, авто, № сделки" className={input + " pl-9"} />
        </div>
        <select value={manager} onChange={(e) => setManager(e.target.value)} className={input + " w-auto flex-1 sm:flex-none"}>
          <option value="">Все менеджеры</option>
          <option value="me">Мои сделки</option>
          <option value="none">Без ответственного</option>
          {staff.filter((s) => s.id !== me).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select value={source} onChange={(e) => setSource(e.target.value)} className={input + " w-auto flex-1 sm:flex-none"}>
          <option value="">Все источники</option>
          {Object.entries(SOURCE_LABELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <button type="button" onClick={() => setCreating(true)} className={btnGold + " ml-auto hidden md:inline-flex"}>
          <Icon name="Plus" size={14} />Новая сделка
        </button>
        <button type="button" onClick={() => setCreating(true)} aria-label="Новая сделка"
          className="md:hidden fixed right-4 bottom-[calc(80px+env(safe-area-inset-bottom))] z-30 w-14 h-14 rounded-full bg-[hsl(var(--gold))] text-[hsl(222_47%_8%)] shadow-[0_8px_30px_hsl(var(--gold)/0.4)] flex items-center justify-center">
          <Icon name="Plus" size={26} />
        </button>
      </div>
      {error && <p className="text-sm text-red-400 mb-3">{error}</p>}

      {loading ? (
        <div className={`flex items-center gap-3 py-20 justify-center ${muted}`}><Icon name="Loader" size={20} className="animate-spin" />Загружаем воронку…</div>
      ) : (
        <>
        <div className="md:hidden">
          <div className="flex gap-1.5 overflow-x-auto pb-2 -mx-3 px-3 no-scrollbar">
            {STAGES.map((st) => {
              const n = (byStage[st.id] || []).length;
              const on = mobileStage === st.id;
              return (
                <button key={st.id} type="button" onClick={() => setMobileStage(st.id)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold border transition-colors ${on ? "text-[hsl(222_47%_8%)] border-transparent" : "navy border-[hsl(var(--gold)/0.2)]"}`}
                  style={on ? { background: st.color } : undefined}>
                  {!on && <span className="w-1.5 h-1.5 rounded-full" style={{ background: st.color }} />}
                  {st.label}
                  <span className={`text-[10px] font-bold px-1.5 rounded-full ${on ? "bg-black/15" : "bg-[hsl(var(--navy)/0.1)]"}`}>{n}</span>
                </button>
              );
            })}
          </div>
          {(() => {
            const list = byStage[mobileStage] || [];
            const sum = list.reduce((a, d) => a + (d.amount || 0), 0);
            return (
              <>
                {sum > 0 && <p className={`text-xs ${muted} mb-2 px-0.5`}>Сумма на этапе: <b className="navy">{money(sum)}</b></p>}
                {list.length === 0 ? (
                  <p className={`text-center text-sm ${muted} py-14`}>На этом этапе сделок нет</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {list.map((d) => <DealCard key={d.id} d={d} dragging={false} onDragStart={() => undefined} onDragEnd={() => undefined}
                      onOpen={() => onOpenDeal(d.id)} onMove={(s) => move(d, s)} />)}
                  </div>
                )}
              </>
            );
          })()}
        </div>
        <div className="hidden md:flex gap-3 overflow-x-auto pb-4 -mx-1 px-1 snap-x">
          {STAGES.map((st) => {
            const list = byStage[st.id] || [];
            const sum = list.reduce((a, d) => a + (d.amount || 0), 0);
            return (
              <div key={st.id}
                onDragOver={(e) => { e.preventDefault(); setOverStage(st.id); }}
                onDragLeave={() => setOverStage((s) => (s === st.id ? null : s))}
                onDrop={() => onDrop(st.id)}
                className={`snap-start flex-shrink-0 w-[272px] rounded-sm flex flex-col transition-colors ${overStage === st.id && dragId ? "bg-[hsl(var(--gold)/0.1)]" : "bg-[hsl(222_40%_9%/0.6)]"}`}>
                <div className="px-3 pt-3 pb-2 border-t-2" style={{ borderColor: st.color }}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-['Montserrat'] font-bold text-xs uppercase tracking-wide navy">{st.label}</span>
                    <span className="text-[11px] font-bold px-1.5 rounded-full bg-[hsl(var(--navy)/0.1)] navy">{list.length}</span>
                  </div>
                  <p className={`text-[11px] ${muted} mt-0.5`}>{sum ? money(sum) : "\u00a0"}</p>
                </div>
                <div className="flex flex-col gap-2 px-2 pb-3 min-h-[120px] max-h-[68vh] overflow-y-auto">
                  {list.map((d) => <DealCard key={d.id} d={d} dragging={dragId === d.id}
                    onDragStart={() => setDragId(d.id)} onDragEnd={() => { setDragId(null); setOverStage(null); }}
                    onOpen={() => onOpenDeal(d.id)} onMove={(s) => move(d, s)} />)}
                  {(st.id === "won" || st.id === "lost") && list.length > 0 && (
                    <p className={`text-[10px] text-center ${muted} pt-1`}>за последние 30 дней</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        </>
      )}

      {lostFor && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setLostFor(null)}>
          <form className={panel + " w-full max-w-md p-5"} onClick={(e) => e.stopPropagation()}
            onSubmit={(e) => { e.preventDefault(); const d = lostFor; setLostFor(null); move(d, "lost", lostReason.trim()); }}>
            <h3 className="font-['Montserrat'] font-bold navy mb-1">Причина отказа</h3>
            <p className={`text-sm ${muted} mb-3`}>{lostFor.title}</p>
            <textarea required autoFocus rows={3} value={lostReason} onChange={(e) => setLostReason(e.target.value)}
              placeholder="Дорого, купил у других, передумал…" className={input + " resize-none mb-3"} />
            <div className="flex flex-wrap gap-1.5 mb-4">
              {["Дорого", "Долгий срок", "Купил у других", "Нет нужной позиции", "Не выходит на связь"].map((r) => (
                <button key={r} type="button" onClick={() => setLostReason(r)} className="text-[11px] px-2 py-1 rounded-sm border border-[hsl(var(--gold)/0.2)] navy hover:border-[hsl(var(--gold))]">{r}</button>
              ))}
            </div>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setLostFor(null)} className={btnGhost}>Отмена</button>
              <button type="submit" className={btnGold}>Перевести в «Отказ»</button>
            </div>
          </form>
        </div>
      )}

      {creating && (
        <NewDealDialog token={token} staff={staff} me={me} onClose={() => setCreating(false)}
          onCreated={(id) => { setCreating(false); load(); onOpenDeal(id); }} />
      )}
    </div>
  );
}

function DealCard({ d, dragging, onDragStart, onDragEnd, onOpen, onMove }: {
  d: Deal; dragging: boolean; onDragStart: () => void; onDragEnd: () => void; onOpen: () => void; onMove: (s: Stage) => void;
}) {
  const src = SOURCE_LABELS[d.source_type] || SOURCE_LABELS.manual;
  const stale = d.stage !== "won" && d.stage !== "lost" ? daysSince(d.stage_changed_at) : 0;
  const overdue = isOverdue(d.next_task_at);
  return (
    <div draggable={!("ontouchstart" in window)} onDragStart={(e) => { e.dataTransfer.effectAllowed = "move"; onDragStart(); }} onDragEnd={onDragEnd}
      onClick={onOpen}
      className={`group bg-[hsl(var(--ink-2))] border rounded-sm p-3 cursor-pointer select-none transition-all hover:border-[hsl(var(--gold)/0.5)] ${dragging ? "opacity-40" : ""} ${d.manager_id ? "border-[hsl(var(--gold)/0.12)]" : "border-dashed border-[hsl(var(--gold)/0.35)]"}`}>
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <span className={`flex items-center gap-1 text-[10px] ${muted}`}><Icon name={src.icon} size={11} />№{d.id}</span>
        {stale >= 3 && <span title="Дней на этом этапе" className="text-[10px] font-bold px-1.5 rounded-sm bg-amber-500/15 text-amber-400">{stale} дн.</span>}
      </div>
      <p className="text-sm font-semibold navy leading-snug mb-1 line-clamp-2">{d.title}</p>
      {d.client_name && <p className={`text-xs ${muted} truncate`}>{d.client_name}{d.client_company && ` · ${d.client_company}`}</p>}
      <div className="flex items-center justify-between gap-2 mt-2">
        <span className="text-xs font-bold text-[hsl(var(--gold))]">{d.amount ? money(d.amount) : ""}</span>
        <div className="flex items-center gap-2">
          {d.open_tasks > 0 && (
            <span title={d.next_task_at ? `Ближайшая: ${fmtDate(d.next_task_at)}` : ""}
              className={`flex items-center gap-0.5 text-[10px] font-bold ${overdue ? "text-red-400" : muted}`}>
              <Icon name={overdue ? "AlarmClock" : "CircleCheck"} size={11} />{d.open_tasks}
            </span>
          )}
          <span title={d.manager_name || "Без ответственного"}
            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${d.manager_id ? "bg-[hsl(var(--gold)/0.18)] text-[hsl(var(--gold))]" : "bg-[hsl(var(--navy)/0.08)] " + muted}`}>
            {d.manager_name ? d.manager_name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase() : "?"}
          </span>
        </div>
      </div>
      <select value={d.stage} onClick={(e) => e.stopPropagation()} onChange={(e) => onMove(e.target.value as Stage)}
        className="md:hidden mt-2 w-full text-[11px] bg-transparent border border-[hsl(var(--gold)/0.2)] rounded-sm px-2 py-1 navy">
        {STAGES.map((s) => <option key={s.id} value={s.id} className="bg-[hsl(var(--ink-2))]">{s.label}</option>)}
      </select>
    </div>
  );
}

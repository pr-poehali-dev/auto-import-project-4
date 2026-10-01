import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { STAGES, SOURCE_LABELS, stageOf, crmGet, crmPost, money, fmtDate, type Deal, type CrmEvent, type CrmTask, type Stage, type StaffMember } from "@/lib/crm";
import { panel, input, label, btnGold, btnGhost, muted } from "./ui";
import TaskList from "./TaskList";

interface Props {
  token: string;
  dealId: number;
  staff: StaffMember[];
  me: number;
  onClose: () => void;
  onChanged: () => void;
  onOpenClient: (id: number) => void;
}

const EVENT_ICONS: Record<string, string> = {
  comment: "MessageSquare", stage: "ArrowRightLeft", manager: "UserCheck", amount: "Banknote", task: "ListChecks", system: "Info",
};

const SOURCE_FIELDS: Record<string, [string, string][]> = {
  order: [["order_number", "Номер заявки"], ["car_brand", "Марка"], ["car_model", "Модель"], ["car_year", "Год"], ["quantity", "Количество"], ["budget", "Бюджет"], ["origin", "Направление"], ["comment", "Комментарий клиента"]],
  parts: [["category_title", "Раздел"], ["car_brand", "Марка"], ["car_model", "Модель"], ["car_year", "Год"], ["vin", "VIN"], ["parts_text", "Позиции"], ["comment", "Комментарий клиента"]],
};

// Боковая карточка сделки
export default function DealPanel({ token, dealId, staff, me, onClose, onChanged, onOpenClient }: Props) {
  const [deal, setDeal] = useState<Deal | null>(null);
  const [source, setSource] = useState<Record<string, unknown> | null>(null);
  const [events, setEvents] = useState<CrmEvent[]>([]);
  const [tasks, setTasks] = useState<CrmTask[]>([]);
  const [comment, setComment] = useState("");
  const [amount, setAmount] = useState("");
  const [editTitle, setEditTitle] = useState<string | null>(null);
  const [lostReason, setLostReason] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [historyFilter, setHistoryFilter] = useState<"all" | "comment">("all");

  const load = async () => {
    const d = await crmGet(token, { view: "deal", id: dealId });
    if (d.error) { setError(d.error); return; }
    setDeal(d.deal); setSource(d.source); setEvents(d.events || []); setTasks(d.tasks || []);
    setAmount(d.deal.amount != null ? String(d.deal.amount) : "");
  };

  useEffect(() => { setDeal(null); load(); }, [dealId]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const post = async (body: object) => {
    setBusy(true); setError("");
    const r = await crmPost(token, { deal_id: dealId, ...body });
    setBusy(false);
    if (r.error) { setError(r.error); return false; }
    await load(); onChanged();
    return true;
  };

  const moveTo = (stage: Stage) => {
    if (!deal || stage === deal.stage) return;
    if (stage === "lost") { setLostReason(""); return; }
    post({ action: "move", stage });
  };

  const saveAmount = () => {
    const v = amount.replace(/\s/g, "");
    if ((deal?.amount ?? "") === (v ? Number(v) : "")) return;
    post({ action: "update", amount: v ? Number(v) : null });
  };

  const sendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    if (await post({ action: "comment", text: comment.trim() })) setComment("");
  };

  const shownEvents = historyFilter === "comment" ? events.filter((e) => e.kind === "comment") : events;
  const src = deal ? SOURCE_LABELS[deal.source_type] || SOURCE_LABELS.manual : null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex justify-end" onClick={onClose}>
      <div className="w-full max-w-2xl h-[100dvh] bg-[hsl(var(--ink))] border-l border-[hsl(var(--gold)/0.2)] overflow-y-auto overscroll-contain pb-[env(safe-area-inset-bottom)]" onClick={(e) => e.stopPropagation()}>
        {!deal ? (
          <div className={`flex items-center gap-3 py-24 justify-center ${muted}`}>
            {error ? <span className="text-red-400">{error}</span> : <><Icon name="Loader" size={20} className="animate-spin" />Загружаем сделку…</>}
          </div>
        ) : (
          <>
            <div className="sticky top-0 z-10 bg-[hsl(var(--ink))] border-b border-[hsl(var(--gold)/0.15)] px-4 sm:px-5 py-4 pt-[calc(16px+env(safe-area-inset-top))]">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className={`flex items-center gap-1.5 text-[11px] ${muted} mb-1`}>
                    <Icon name={src!.icon} size={12} />Сделка №{deal.id} · {src!.label} · создана {fmtDate(deal.created_at)}
                  </p>
                  {editTitle === null ? (
                    <h2 onClick={() => setEditTitle(deal.title)} title="Изменить название"
                      className="font-['Montserrat'] font-bold text-lg navy leading-snug cursor-text hover:text-[hsl(var(--gold))]">{deal.title}</h2>
                  ) : (
                    <form onSubmit={async (e) => { e.preventDefault(); if (await post({ action: "update", title: editTitle })) setEditTitle(null); }} className="flex gap-2">
                      <input autoFocus value={editTitle} onChange={(e) => setEditTitle(e.target.value)} maxLength={255} className={input} />
                      <button type="submit" className={btnGold + " !py-2"}><Icon name="Check" size={14} /></button>
                      <button type="button" onClick={() => setEditTitle(null)} className={btnGhost + " !py-2"}><Icon name="X" size={14} /></button>
                    </form>
                  )}
                </div>
                <button type="button" onClick={onClose} aria-label="Закрыть" className={muted + " hover:text-[hsl(var(--navy))] -m-2 p-2"}><Icon name="X" size={24} /></button>
              </div>

              <div className="flex gap-1 mt-3 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
                {STAGES.map((s) => {
                  const active = s.id === deal.stage;
                  const idx = STAGES.findIndex((x) => x.id === deal.stage);
                  const passed = deal.stage !== "lost" && STAGES.findIndex((x) => x.id === s.id) < idx && s.id !== "lost";
                  return (
                    <button key={s.id} type="button" disabled={busy} onClick={() => moveTo(s.id)}
                      className={`flex-shrink-0 text-[11px] sm:text-[10px] font-['Montserrat'] font-bold px-3 sm:px-2.5 py-2 sm:py-1.5 rounded-sm transition-colors ${active ? "text-[hsl(222_47%_8%)]" : passed ? "navy bg-[hsl(var(--navy)/0.1)]" : muted + " bg-[hsl(var(--navy)/0.04)] hover:bg-[hsl(var(--navy)/0.1)]"}`}
                      style={active ? { background: s.color } : undefined}>
                      {s.label}
                    </button>
                  );
                })}
              </div>
              {deal.stage === "lost" && deal.lost_reason && <p className="text-xs text-red-400 mt-2">Причина отказа: {deal.lost_reason}</p>}
              {lostReason !== null && (
                <form className="mt-3 flex gap-2" onSubmit={async (e) => { e.preventDefault(); if (await post({ action: "move", stage: "lost", lost_reason: lostReason.trim() })) setLostReason(null); }}>
                  <input autoFocus required value={lostReason} onChange={(e) => setLostReason(e.target.value)} placeholder="Причина отказа" className={input} />
                  <button type="submit" className={btnGold + " !py-2 whitespace-nowrap"}>В отказ</button>
                  <button type="button" onClick={() => setLostReason(null)} className={btnGhost + " !py-2"}><Icon name="X" size={14} /></button>
                </form>
              )}
              {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
            </div>

            <div className="p-4 sm:p-5 flex flex-col gap-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className={label}>Сумма сделки, ₽</label>
                  <input inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))}
                    onBlur={saveAmount} onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
                    placeholder="Не указана" className={input} />
                  {deal.amount != null && <p className={`text-[11px] ${muted} mt-1`}>{money(deal.amount)}</p>}
                </div>
                <div>
                  <label className={label}>Ответственный</label>
                  <select value={deal.manager_id ?? ""} disabled={busy} onChange={(e) => post({ action: "update", manager_id: e.target.value ? Number(e.target.value) : null })} className={input}>
                    <option value="">Не назначен</option>
                    {staff.map((s) => <option key={s.id} value={s.id}>{s.name}{s.id === me ? " (я)" : ""}</option>)}
                  </select>
                  {deal.manager_id !== me && (
                    <button type="button" onClick={() => post({ action: "update", manager_id: me })} className="text-[11px] text-[hsl(var(--gold))] mt-1 hover:underline">Взять себе</button>
                  )}
                </div>
                <div>
                  <label className={label}>На этапе</label>
                  <p className="text-sm navy py-2">{stageOf(deal.stage).label}</p>
                  <p className={`text-[11px] ${muted}`}>с {fmtDate(deal.stage_changed_at)}</p>
                </div>
              </div>

              <section className={panel + " p-4"}>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3 className="font-['Montserrat'] font-bold text-sm navy flex items-center gap-2"><Icon name="User" size={15} />Клиент</h3>
                  {deal.client_id && (
                    <button type="button" onClick={() => onOpenClient(deal.client_id!)} className="text-xs text-[hsl(var(--gold))] hover:underline flex items-center gap-1">
                      Карточка клиента<Icon name="ArrowRight" size={12} />
                    </button>
                  )}
                </div>
                {deal.client_name || deal.client_phone ? (
                  <div className="text-sm">
                    <p className="navy font-semibold">{deal.client_name || "—"}{deal.client_company && <span className={`font-normal ${muted}`}> · {deal.client_company}</span>}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                      {deal.client_phone && <a href={`tel:${deal.client_phone.replace(/[^\d+]/g, "")}`} className="flex items-center gap-1 text-[hsl(var(--gold))] hover:underline"><Icon name="Phone" size={12} />{deal.client_phone}</a>}
                      {deal.client_email && <a href={`mailto:${deal.client_email}`} className="flex items-center gap-1 text-[hsl(var(--gold))] hover:underline"><Icon name="Mail" size={12} />{deal.client_email}</a>}
                    </div>
                  </div>
                ) : <p className={`text-sm ${muted}`}>Не указан</p>}
              </section>

              {source && SOURCE_FIELDS[deal.source_type] && (
                <section className={panel + " p-4"}>
                  <h3 className="font-['Montserrat'] font-bold text-sm navy flex items-center gap-2 mb-2"><Icon name="FileText" size={15} />Данные заявки</h3>
                  <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
                    {SOURCE_FIELDS[deal.source_type].filter(([k]) => source[k] !== null && source[k] !== "" && source[k] !== undefined).map(([k, l]) => (
                      <div key={k} className="contents">
                        <dt className={muted}>{l}</dt>
                        <dd className={`navy whitespace-pre-line break-words ${k === "vin" ? "font-mono" : ""}`}>{k === "budget" ? money(source[k] as number) : String(source[k])}</dd>
                      </div>
                    ))}
                  </dl>
                </section>
              )}

              <section className={panel + " p-4"}>
                <h3 className="font-['Montserrat'] font-bold text-sm navy flex items-center gap-2 mb-3"><Icon name="ListChecks" size={15} />Задачи</h3>
                <TaskList token={token} tasks={tasks} staff={staff} me={me} dealId={deal.id} onChanged={() => { load(); onChanged(); }} />
              </section>

              <section className={panel + " p-4"}>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <h3 className="font-['Montserrat'] font-bold text-sm navy flex items-center gap-2"><Icon name="History" size={15} />Комментарии и история</h3>
                  <div className="flex gap-1">
                    {([["all", "Всё"], ["comment", "Комментарии"]] as const).map(([k, l]) => (
                      <button key={k} type="button" onClick={() => setHistoryFilter(k)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-sm ${historyFilter === k ? "bg-[hsl(var(--gold))] text-[hsl(222_47%_8%)]" : muted + " border border-[hsl(var(--gold)/0.2)]"}`}>{l}</button>
                    ))}
                  </div>
                </div>
                <form onSubmit={sendComment} className="mb-4">
                  <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={2}
                    onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) sendComment(e); }}
                    placeholder="Внутренний комментарий — клиент его не видит. Ctrl+Enter — отправить" className={input + " resize-y mb-2"} />
                  <button type="submit" disabled={busy || !comment.trim()} className={btnGold + " !py-2"}><Icon name="Send" size={13} />Добавить</button>
                </form>
                <div className="flex flex-col">
                  {shownEvents.length === 0 && <p className={`text-sm ${muted}`}>Пока пусто</p>}
                  {shownEvents.map((e) => (
                    <div key={e.id} className="flex gap-3 py-2 border-t border-[hsl(var(--gold)/0.08)] first:border-t-0">
                      <div className={`w-7 h-7 flex-shrink-0 rounded-full flex items-center justify-center ${e.kind === "comment" ? "bg-[hsl(var(--gold)/0.15)] text-[hsl(var(--gold))]" : "bg-[hsl(var(--navy)/0.06)] " + muted}`}>
                        <Icon name={EVENT_ICONS[e.kind] || "Info"} size={13} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-[11px] ${muted}`}>{e.author || "Система"} · {fmtDate(e.created_at)}</p>
                        <p className={`text-sm whitespace-pre-line break-words ${e.kind === "comment" ? "navy" : "text-[hsl(var(--navy)/0.75)]"}`}>
                          {e.text.replace(/ \(из Telegram\)$/, "")}
                          {e.text.endsWith("(из Telegram)") && (
                            <span className="inline-flex items-center gap-0.5 ml-1.5 align-middle text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-sm bg-sky-500/15 text-sky-400">
                              <Icon name="Send" size={9} />Telegram
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
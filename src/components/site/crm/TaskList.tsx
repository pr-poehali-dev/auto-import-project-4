import { useState } from "react";
import Icon from "@/components/ui/icon";
import { crmPost, fmtDate, isOverdue, localToIso, presetDue, type CrmTask, type StaffMember } from "@/lib/crm";
import { input, btnGold, muted } from "./ui";

interface Props {
  token: string;
  tasks: CrmTask[];
  staff: StaffMember[];
  me: number;
  dealId?: number;
  clientId?: number;
  showContext?: boolean;
  allowAdd?: boolean;
  onChanged: () => void;
}

// Список задач с быстрым добавлением: «Перезвонить завтра в 11:00»
export default function TaskList({ token, tasks, staff, me, dealId, clientId, showContext, allowAdd = true, onChanged }: Props) {
  const [title, setTitle] = useState("");
  const [due, setDue] = useState(presetDue("tomorrow"));
  const [assignee, setAssignee] = useState(String(me));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true); setError("");
    const r = await crmPost(token, { action: "task_add", deal_id: dealId, client_id: clientId, title: title.trim(),
      due_at: localToIso(due), assignee_id: Number(assignee) });
    setSaving(false);
    if (r.error) { setError(r.error); return; }
    setTitle(""); setDue(presetDue("tomorrow"));
    onChanged();
  };

  const toggle = async (t: CrmTask) => { await crmPost(token, { action: "task_done", task_id: t.id, done: !t.done }); onChanged(); };
  const remove = async (t: CrmTask) => {
    if (!confirm(`Удалить задачу «${t.title}»?`)) return;
    await crmPost(token, { action: "task_delete", task_id: t.id }); onChanged();
  };

  return (
    <div>
      {allowAdd && (
        <form onSubmit={add} className="mb-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={255} placeholder="Перезвонить, отправить счёт, уточнить VIN…" className={input + " mb-2"} />
          <div className="flex flex-wrap gap-2 items-center">
            <input type="datetime-local" value={due} onChange={(e) => setDue(e.target.value)} required className={input + " w-auto [color-scheme:dark]"} />
            <div className="flex gap-1">
              {([["1h", "Через час"], ["tomorrow", "Завтра 11:00"], ["3d", "Через 3 дня"]] as const).map(([k, l]) => (
                <button key={k} type="button" onClick={() => setDue(presetDue(k))}
                  className="text-[10px] px-2 py-1.5 rounded-sm border border-[hsl(var(--gold)/0.2)] navy hover:border-[hsl(var(--gold))]">{l}</button>
              ))}
            </div>
            <select value={assignee} onChange={(e) => setAssignee(e.target.value)} className={input + " w-auto"}>
              {staff.map((s) => <option key={s.id} value={s.id}>{s.id === me ? "Мне" : s.name}</option>)}
            </select>
            <button type="submit" disabled={saving || !title.trim()} className={btnGold + " !py-2"}>
              {saving ? <Icon name="Loader" size={13} className="animate-spin" /> : <Icon name="Plus" size={13} />}Задача
            </button>
          </div>
          {error && <p className="text-xs text-red-400 mt-1.5">{error}</p>}
        </form>
      )}

      {tasks.length === 0 ? (
        <p className={`text-sm ${muted} py-2`}>Задач нет</p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {tasks.map((t) => {
            const late = !t.done && isOverdue(t.due_at);
            return (
              <div key={t.id} className={`group flex items-start gap-2.5 px-3 py-2 rounded-sm border ${late ? "border-red-500/40 bg-red-500/5" : "border-[hsl(var(--gold)/0.1)]"}`}>
                <button type="button" onClick={() => toggle(t)} title={t.done ? "Вернуть в работу" : "Выполнено"}
                  className={`mt-0.5 w-4 h-4 flex-shrink-0 rounded-sm border flex items-center justify-center ${t.done ? "bg-green-600 border-green-600" : "border-[hsl(var(--gold)/0.5)] hover:border-[hsl(var(--gold))]"}`}>
                  {t.done && <Icon name="Check" size={11} className="text-white" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm leading-snug ${t.done ? "line-through " + muted : "navy"}`}>{t.title}</p>
                  <p className={`text-[11px] ${late ? "text-red-400 font-semibold" : muted}`}>
                    {late && "Просрочено · "}{fmtDate(t.due_at)} · {t.assignee_id === me ? "мне" : t.assignee_name}
                    {showContext && (t.deal_title || t.client_name) && <span className={muted}> · {t.deal_id ? `№${t.deal_id} ${t.deal_title}` : t.client_name}</span>}
                  </p>
                </div>
                <button type="button" onClick={() => remove(t)} className={`opacity-0 group-hover:opacity-100 ${muted} hover:text-red-400`}><Icon name="Trash2" size={13} /></button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

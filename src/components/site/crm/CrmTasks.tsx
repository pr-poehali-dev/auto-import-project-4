import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { crmGet, crmPost, type CrmTask, type StaffMember } from "@/lib/crm";
import { panel, input, btnGold, muted } from "./ui";
import TaskList from "./TaskList";

interface Props {
  token: string;
  staff: StaffMember[];
  me: number;
  myTelegram: string;
  onTelegramSaved: (v: string) => void;
  onOpenDeal: (id: number) => void;
  reloadKey: number;
}

// Задачи сотрудника + личный чат Telegram для напоминаний
export default function CrmTasks({ token, staff, me, myTelegram, onTelegramSaved, onOpenDeal, reloadKey }: Props) {
  const [scope, setScope] = useState<"mine" | "all" | "done">("mine");
  const [tasks, setTasks] = useState<CrmTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [tg, setTg] = useState(myTelegram);
  const [tgMsg, setTgMsg] = useState("");

  const load = async () => {
    const d = await crmGet(token, { view: "tasks", scope });
    setTasks(d.tasks || []); setLoading(false);
  };
  useEffect(() => { setLoading(true); load(); }, [scope, reloadKey]);
  useEffect(() => { setTg(myTelegram); }, [myTelegram]);

  const saveTg = async (e: React.FormEvent) => {
    e.preventDefault();
    setTgMsg("Сохраняем…");
    const r = await crmPost(token, { action: "my_telegram", chat_id: tg.trim() });
    if (r.error) { setTgMsg(r.error); return; }
    onTelegramSaved(r.chat_id);
    setTgMsg(!r.chat_id ? "Личный чат отключён — напоминания будут приходить в общий чат сотрудников."
      : r.test_sent ? "Готово! Проверьте Telegram — бот прислал тестовое сообщение."
      : "Сохранено, но бот не смог написать. Убедитесь, что вы нажали /start у бота, и что ключ бота добавлен.");
  };

  const groups: [string, CrmTask[]][] = scope === "done" ? [["Выполнено за 14 дней", tasks]] : (() => {
    const now = new Date();
    const endToday = new Date(now); endToday.setHours(23, 59, 59, 999);
    const endWeek = new Date(endToday); endWeek.setDate(endWeek.getDate() + 7);
    const g: Record<string, CrmTask[]> = { "Просрочено": [], "Сегодня": [], "На неделе": [], "Позже": [] };
    tasks.forEach((t) => {
      const d = new Date(t.due_at);
      if (d < now) g["Просрочено"].push(t);
      else if (d <= endToday) g["Сегодня"].push(t);
      else if (d <= endWeek) g["На неделе"].push(t);
      else g["Позже"].push(t);
    });
    return Object.entries(g).filter(([, v]) => v.length > 0);
  })();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2">
        <div className="flex gap-1 mb-4">
          {([["mine", "Мои"], ["all", "Все открытые"], ["done", "Выполненные"]] as const).map(([k, l]) => (
            <button key={k} type="button" onClick={() => setScope(k)}
              className={`text-xs font-['Montserrat'] font-bold px-3 py-2 rounded-sm ${scope === k ? "bg-[hsl(var(--gold))] text-[hsl(222_47%_8%)]" : muted + " border border-[hsl(var(--gold)/0.2)]"}`}>{l}</button>
          ))}
        </div>
        {loading ? (
          <div className={`flex items-center gap-3 py-16 justify-center ${muted}`}><Icon name="Loader" size={20} className="animate-spin" />Загружаем…</div>
        ) : groups.length === 0 ? (
          <div className={panel + " p-10 text-center"}>
            <Icon name="PartyPopper" fallback="CircleCheck" size={32} className="mx-auto mb-2 text-[hsl(var(--gold))]" />
            <p className="navy font-semibold">Задач нет</p>
            <p className={`text-sm ${muted}`}>Задачи создаются в карточке сделки или клиента</p>
          </div>
        ) : groups.map(([title, list]) => (
          <section key={title} className="mb-5">
            <h3 className={`font-['Montserrat'] font-bold text-xs uppercase tracking-wide mb-2 ${title === "Просрочено" ? "text-red-400" : "navy"}`}>{title} · {list.length}</h3>
            <TaskList token={token} tasks={list} staff={staff} me={me} showContext allowAdd={false} onChanged={load} />
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {Array.from(new Set(list.filter((t) => t.deal_id).map((t) => t.deal_id!))).slice(0, 12).map((id) => (
                <button key={id} type="button" onClick={() => onOpenDeal(id)} className="text-[10px] px-2 py-0.5 rounded-sm border border-[hsl(var(--gold)/0.2)] text-[hsl(var(--gold))] hover:border-[hsl(var(--gold))]">Сделка №{id}</button>
              ))}
            </div>
          </section>
        ))}
      </div>

      <aside className={panel + " p-4 h-fit"}>
        <h3 className="font-['Montserrat'] font-bold text-sm navy flex items-center gap-2 mb-2"><Icon name="Send" size={15} />Напоминания в Telegram</h3>
        <p className={`text-xs ${muted} mb-3 leading-relaxed`}>
          Когда наступает срок задачи, бот присылает напоминание. Укажите свой личный чат — иначе напоминания придут в общий чат сотрудников с пометкой, кому задача.
        </p>
        <ol className={`text-xs ${muted} list-decimal pl-4 mb-3 space-y-1`}>
          <li>Откройте бота компании в Telegram и нажмите <b className="navy">/start</b></li>
          <li>Напишите боту <b className="navy">@userinfobot</b> — он пришлёт ваш ID</li>
          <li>Вставьте ID сюда</li>
        </ol>
        <form onSubmit={saveTg} className="flex gap-2">
          <input value={tg} onChange={(e) => setTg(e.target.value.replace(/[^\d-]/g, ""))} placeholder="123456789" className={input + " font-mono"} />
          <button type="submit" className={btnGold + " !py-2"}>Сохранить</button>
        </form>
        {tgMsg && <p className="text-xs text-[hsl(var(--gold))] mt-2">{tgMsg}</p>}
      </aside>
    </div>
  );
}

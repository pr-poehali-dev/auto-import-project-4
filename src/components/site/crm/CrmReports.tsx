import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { crmGet, money, SOURCE_LABELS } from "@/lib/crm";
import { panel, input, muted } from "./ui";

interface Report {
  totals: { created: number; won: number; lost: number; won_amount: number; open_now: number; open_amount: number; avg_days: number | null };
  by_manager: { manager_id: number | null; name: string; created: number; won: number; lost: number; won_amount: number; open_now: number }[];
  by_source: { source: string; created: number; won: number }[];
  funnel: { stage: string; label: string; count: number; amount: number }[];
  daily: { day: string; created: number }[];
  overdue_tasks: number;
}

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const PRESETS: { id: string; label: string; range: () => [string, string] }[] = [
  { id: "week", label: "7 дней", range: () => { const t = new Date(); const f = new Date(); f.setDate(t.getDate() - 6); return [iso(f), iso(t)]; } },
  { id: "month", label: "Этот месяц", range: () => { const t = new Date(); return [iso(new Date(t.getFullYear(), t.getMonth(), 1)), iso(t)]; } },
  { id: "prev", label: "Прошлый месяц", range: () => { const t = new Date(); return [iso(new Date(t.getFullYear(), t.getMonth() - 1, 1)), iso(new Date(t.getFullYear(), t.getMonth(), 0))]; } },
  { id: "quarter", label: "90 дней", range: () => { const t = new Date(); const f = new Date(); f.setDate(t.getDate() - 89); return [iso(f), iso(t)]; } },
  { id: "year", label: "Этот год", range: () => { const t = new Date(); return [iso(new Date(t.getFullYear(), 0, 1)), iso(t)]; } },
];

const pct = (a: number, b: number) => (b ? `${Math.round((a / b) * 100)}%` : "—");

// Отчёты по продажам за период
export default function CrmReports({ token, reloadKey }: { token: string; reloadKey: number }) {
  const [preset, setPreset] = useState("month");
  const [[from, to], setRange] = useState<[string, string]>(PRESETS[1].range());
  const [data, setData] = useState<Report | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!from || !to) return;
    setData(null); setError("");
    crmGet(token, { view: "report", from, to }).then((d) => { if (d.error) setError(d.error); else setData(d); });
  }, [from, to, token, reloadKey]);

  const t = data?.totals;
  const closed = t ? t.won + t.lost : 0;
  const maxDaily = Math.max(1, ...(data?.daily.map((d) => d.created) || [1]));
  const maxFunnel = Math.max(1, ...(data?.funnel.map((f) => f.count) || [1]));

  const days: { day: string; created: number }[] = [];
  if (data) {
    const map = Object.fromEntries(data.daily.map((d) => [d.day, d.created]));
    const start = new Date(from + "T00:00:00"); const end = new Date(to + "T00:00:00");
    const total = Math.round((end.getTime() - start.getTime()) / 86400000) + 1;
    if (total <= 120) for (let i = 0; i < total; i++) { const d = new Date(start); d.setDate(d.getDate() + i); days.push({ day: iso(d), created: map[iso(d)] || 0 }); }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-5">
        {PRESETS.map((p) => (
          <button key={p.id} type="button" onClick={() => { setPreset(p.id); setRange(p.range()); }}
            className={`text-xs font-['Montserrat'] font-bold px-3 py-2 rounded-sm ${preset === p.id ? "bg-[hsl(var(--gold))] text-[hsl(222_47%_8%)]" : muted + " border border-[hsl(var(--gold)/0.2)]"}`}>{p.label}</button>
        ))}
        <div className="flex items-center gap-1.5 ml-auto">
          <input type="date" value={from} max={to} onChange={(e) => { setPreset(""); setRange([e.target.value, to]); }} className={input + " w-auto [color-scheme:dark]"} />
          <span className={muted}>—</span>
          <input type="date" value={to} min={from} onChange={(e) => { setPreset(""); setRange([from, e.target.value]); }} className={input + " w-auto [color-scheme:dark]"} />
        </div>
      </div>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
      {!data || !t ? (
        !error && <div className={`flex items-center gap-3 py-20 justify-center ${muted}`}><Icon name="Loader" size={20} className="animate-spin" />Считаем…</div>
      ) : (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {[
              ["Новых сделок", String(t.created), "Inbox", ""],
              ["Успешных", String(t.won), "Trophy", `Отказов: ${t.lost}`],
              ["Конверсия", pct(t.won, closed), "Percent", "из закрытых за период"],
              ["Выручка", money(t.won_amount), "Banknote", t.won ? `Средний чек ${money(Math.round(Number(t.won_amount) / t.won))}` : ""],
              ["В работе сейчас", String(t.open_now), "Loader", money(t.open_amount)],
            ].map(([l, v, i, sub]) => (
              <div key={l} className={panel + " p-4"}>
                <p className={`text-[10px] uppercase tracking-wide ${muted} flex items-center gap-1.5`}><Icon name={i} size={12} />{l}</p>
                <p className="font-['Montserrat'] font-black text-xl navy mt-1">{v}</p>
                {sub && <p className={`text-[11px] ${muted} mt-0.5`}>{sub}</p>}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-4 text-xs">
            {t.avg_days != null && <span className={muted}><Icon name="Timer" size={12} className="inline mr-1" />Средний срок сделки: <b className="navy">{Number(t.avg_days).toFixed(1)} дн.</b></span>}
            {data.overdue_tasks > 0 && <span className="text-red-400"><Icon name="AlarmClock" size={12} className="inline mr-1" />Просроченных задач: <b>{data.overdue_tasks}</b></span>}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <section className={panel + " p-4"}>
              <h3 className="font-['Montserrat'] font-bold text-sm navy mb-3">Воронка сейчас</h3>
              <div className="flex flex-col gap-2">
                {data.funnel.map((f) => (
                  <div key={f.stage}>
                    <div className="flex justify-between text-xs mb-1"><span className="navy">{f.label}</span><span className={muted}>{f.count} · {money(f.amount)}</span></div>
                    <div className="h-2 rounded-full bg-[hsl(var(--navy)/0.06)] overflow-hidden">
                      <div className="h-full rounded-full bg-[hsl(var(--gold))]" style={{ width: `${(f.count / maxFunnel) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className={panel + " p-4"}>
              <h3 className="font-['Montserrat'] font-bold text-sm navy mb-3">Источники заявок за период</h3>
              {data.by_source.length === 0 ? <p className={`text-sm ${muted}`}>Нет данных</p> : (
                <div className="flex flex-col gap-2">
                  {data.by_source.map((s) => (
                    <div key={s.source} className="flex items-center justify-between gap-3 py-1.5 border-t border-[hsl(var(--gold)/0.08)] first:border-t-0">
                      <span className="flex items-center gap-2 text-sm navy"><Icon name={SOURCE_LABELS[s.source]?.icon || "Circle"} size={14} />{SOURCE_LABELS[s.source]?.label || s.source}</span>
                      <span className={`text-xs ${muted}`}>{s.created} шт. · успешных {s.won} ({pct(s.won, s.created)})</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {days.length > 1 && (
            <section className={panel + " p-4"}>
              <h3 className="font-['Montserrat'] font-bold text-sm navy mb-3">Новые сделки по дням</h3>
              <div className="flex items-end gap-[2px] h-32">
                {days.map((d) => (
                  <div key={d.day} title={`${d.day.split("-").reverse().join(".")}: ${d.created}`} className="flex-1 h-full flex flex-col justify-end group">
                    <div className="w-full rounded-t-sm bg-[hsl(var(--gold)/0.75)] group-hover:bg-[hsl(var(--gold))] min-h-[2px]"
                      style={{ height: `${(d.created / maxDaily) * 100}%`, opacity: d.created ? 1 : 0.25 }} />
                  </div>
                ))}
              </div>
              <div className={`flex justify-between text-[10px] ${muted} mt-1`}>
                <span>{days[0].day.split("-").reverse().join(".")}</span><span>{days[days.length - 1].day.split("-").reverse().join(".")}</span>
              </div>
            </section>
          )}

          <section className={panel + " overflow-x-auto"}>
            <h3 className="font-['Montserrat'] font-bold text-sm navy px-4 pt-4 mb-2">Менеджеры</h3>
            {data.by_manager.length === 0 ? <p className={`text-sm ${muted} px-4 pb-4`}>Нет данных</p> : (
              <table className="w-full text-sm min-w-[620px]">
                <thead className={`text-[10px] uppercase tracking-wide ${muted}`}>
                  <tr>
                    <th className="text-left px-4 py-2">Менеджер</th><th className="text-center px-3 py-2">Новых</th>
                    <th className="text-center px-3 py-2">Успешных</th><th className="text-center px-3 py-2">Отказов</th>
                    <th className="text-center px-3 py-2">Конверсия</th><th className="text-right px-3 py-2">Выручка</th>
                    <th className="text-center px-4 py-2">В работе</th>
                  </tr>
                </thead>
                <tbody>
                  {data.by_manager.map((m) => (
                    <tr key={m.manager_id ?? "none"} className="border-t border-[hsl(var(--gold)/0.08)]">
                      <td className={`px-4 py-2.5 ${m.manager_id ? "navy font-semibold" : muted + " italic"}`}>{m.name}</td>
                      <td className="text-center px-3 navy">{m.created}</td>
                      <td className="text-center px-3 text-green-500 font-semibold">{m.won}</td>
                      <td className={`text-center px-3 ${muted}`}>{m.lost}</td>
                      <td className="text-center px-3 navy">{pct(m.won, m.won + m.lost)}</td>
                      <td className="text-right px-3 text-[hsl(var(--gold))] font-bold whitespace-nowrap">{Number(m.won_amount) ? money(m.won_amount) : "—"}</td>
                      <td className="text-center px-4 navy">{m.open_now}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

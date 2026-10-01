import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { crmGet, money, fmtDate, type CrmClient } from "@/lib/crm";
import { panel, input, muted } from "./ui";

// База клиентов CRM
export default function CrmClients({ token, onOpenClient, reloadKey }: { token: string; onOpenClient: (id: number) => void; reloadKey: number }) {
  const [clients, setClients] = useState<CrmClient[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = setTimeout(async () => {
      const d = await crmGet(token, { view: "clients", q: q.trim() });
      setClients(d.clients || []); setLoading(false);
    }, 300);
    return () => clearTimeout(id);
  }, [q, token, reloadKey]);

  return (
    <div>
      <div className="relative sm:max-w-sm mb-4">
        <Icon name="Search" size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${muted}`} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Имя, компания, телефон, email, ИНН" className={input + " pl-9"} />
      </div>
      {loading ? (
        <div className={`flex items-center gap-3 py-16 justify-center ${muted}`}><Icon name="Loader" size={20} className="animate-spin" />Загружаем…</div>
      ) : clients.length === 0 ? (
        <p className={`text-center py-16 ${muted}`}>Клиенты не найдены</p>
      ) : (
        <>
        <div className="md:hidden flex flex-col gap-2">
          {clients.map((c) => (
            <button key={c.id} type="button" onClick={() => onOpenClient(c.id)} className={panel + " p-3 text-left flex items-center gap-3 active:bg-[hsl(var(--gold)/0.06)]"}>
              <span className="w-10 h-10 flex-shrink-0 rounded-full bg-[hsl(var(--gold)/0.15)] text-[hsl(var(--gold))] text-xs font-bold flex items-center justify-center">
                {c.name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
              </span>
              <span className="flex-1 min-w-0">
                <span className="block navy font-semibold text-sm truncate">{c.name}</span>
                <span className={`block text-xs ${muted} truncate`}>{[c.company, c.phone].filter(Boolean).join(" · ") || c.email}</span>
              </span>
              <span className="text-right flex-shrink-0">
                {c.deals_open > 0 && <span className="block text-[11px] font-bold text-[hsl(var(--gold))]">{c.deals_open} в работе</span>}
                {Number(c.won_amount) > 0 && <span className={`block text-[11px] ${muted}`}>{money(c.won_amount)}</span>}
              </span>
            </button>
          ))}
        </div>
        <div className={panel + " overflow-x-auto hidden md:block"}>
          <table className="w-full text-sm min-w-[720px]">
            <thead className={`text-[10px] uppercase tracking-wide ${muted} border-b border-[hsl(var(--gold)/0.12)]`}>
              <tr>
                <th className="text-left px-4 py-3">Клиент</th>
                <th className="text-left px-4 py-3">Контакты</th>
                <th className="text-center px-4 py-3">Сделки</th>
                <th className="text-right px-4 py-3">Принёс</th>
                <th className="text-right px-4 py-3">Активность</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id} onClick={() => onOpenClient(c.id)} className="border-t border-[hsl(var(--gold)/0.06)] cursor-pointer hover:bg-[hsl(var(--gold)/0.05)]">
                  <td className="px-4 py-3">
                    <p className="navy font-semibold">{c.name}</p>
                    {c.company && <p className={`text-xs ${muted}`}>{c.company}</p>}
                  </td>
                  <td className={`px-4 py-3 text-xs ${muted}`}>{c.phone && <p>{c.phone}</p>}<p>{c.email}</p></td>
                  <td className="px-4 py-3 text-center navy">
                    {c.deals_open > 0 && <span className="text-[hsl(var(--gold))] font-bold">{c.deals_open}</span>}
                    {c.deals_open > 0 && " / "}{c.deals_total}
                  </td>
                  <td className="px-4 py-3 text-right navy whitespace-nowrap">{Number(c.won_amount) ? money(c.won_amount) : "—"}</td>
                  <td className={`px-4 py-3 text-right text-xs ${muted} whitespace-nowrap`}>{c.last_activity ? fmtDate(c.last_activity, false) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}
    </div>
  );
}

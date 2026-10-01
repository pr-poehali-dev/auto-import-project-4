import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { stageOf, crmGet, money, fmtDate, type Deal, type CrmTask, type StaffMember } from "@/lib/crm";
import { panel, btnGold, muted } from "./ui";
import TaskList from "./TaskList";
import NewDealDialog from "./NewDealDialog";

interface ClientData {
  client: { id: number; email: string; phone: string; full_name: string; company: string; inn: string; created_at: string; phone_verified: boolean };
  stats: { deals_total: number; deals_open: number; deals_won: number; won_amount: number; orders: number; parts_requests: number; cars: number; documents: number };
  deals: Deal[];
  orders: { id: number; order_number: string; car_brand: string; car_model: string; car_year: number; budget: number; status: string; created_at: string }[];
  parts_requests: { id: number; category_title: string; car_brand: string; car_model: string; vin: string; status: string; created_at: string }[];
  cars: { id: number; car_brand: string; car_model: string; car_year: number; vin: string; price: number; order_number: string }[];
  tasks: CrmTask[];
}

interface Props {
  token: string;
  clientId: number;
  staff: StaffMember[];
  me: number;
  onClose: () => void;
  onOpenDeal: (id: number) => void;
}

// Карточка клиента: вся история в одном месте
export default function ClientPanel({ token, clientId, staff, me, onClose, onOpenDeal }: Props) {
  const [data, setData] = useState<ClientData | null>(null);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  const load = async () => {
    const d = await crmGet(token, { view: "client", id: clientId });
    if (d.error) setError(d.error); else setData(d);
  };
  useEffect(() => { setData(null); load(); }, [clientId]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && !creating) onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, creating]);

  const c = data?.client;
  const st = data?.stats;
  const name = c ? c.full_name || c.email : "";

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex justify-end" onClick={onClose}>
      <div className="w-full max-w-3xl h-[100dvh] bg-[hsl(var(--ink))] border-l border-[hsl(var(--gold)/0.2)] overflow-y-auto overscroll-contain pb-[env(safe-area-inset-bottom)]" onClick={(e) => e.stopPropagation()}>
        {!data || !c || !st ? (
          <div className={`flex items-center gap-3 py-24 justify-center ${muted}`}>
            {error ? <span className="text-red-400">{error}</span> : <><Icon name="Loader" size={20} className="animate-spin" />Загружаем клиента…</>}
          </div>
        ) : (
          <>
            <div className="sticky top-0 z-10 bg-[hsl(var(--ink))] border-b border-[hsl(var(--gold)/0.15)] px-4 sm:px-5 py-4 pt-[calc(16px+env(safe-area-inset-top))] flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 flex-shrink-0 rounded-full bg-[hsl(var(--gold)/0.15)] text-[hsl(var(--gold))] flex items-center justify-center font-['Montserrat'] font-black">
                  {name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h2 className="font-['Montserrat'] font-bold text-lg navy leading-tight truncate">{name}</h2>
                  <p className={`text-xs ${muted}`}>{c.company}{c.inn && ` · ИНН ${c.inn}`}{(c.company || c.inn) && " · "}клиент с {fmtDate(c.created_at, false)}</p>
                  <div className="flex flex-wrap gap-x-4 mt-1 text-sm">
                    {c.phone && <a href={`tel:${c.phone.replace(/[^\d+]/g, "")}`} className="flex items-center gap-1 text-[hsl(var(--gold))] hover:underline"><Icon name="Phone" size={12} />{c.phone}{c.phone_verified && <Icon name="BadgeCheck" size={12} className="text-green-500" />}</a>}
                    <a href={`mailto:${c.email}`} className="flex items-center gap-1 text-[hsl(var(--gold))] hover:underline"><Icon name="Mail" size={12} />{c.email}</a>
                  </div>
                </div>
              </div>
              <button type="button" onClick={onClose} className={muted + " hover:text-[hsl(var(--navy))]"}><Icon name="X" size={22} /></button>
            </div>

            <div className="p-4 sm:p-5 flex flex-col gap-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  ["Принесено денег", money(st.won_amount), "Banknote"],
                  ["Сделки", `${st.deals_open} откр. / ${st.deals_total}`, "KanbanSquare"],
                  ["Успешных", String(st.deals_won), "Trophy"],
                  ["Машины / док-ты", `${st.cars} / ${st.documents}`, "Car"],
                ].map(([l, v, i]) => (
                  <div key={l} className={panel + " p-3"}>
                    <p className={`text-[10px] uppercase tracking-wide ${muted} flex items-center gap-1`}><Icon name={i} size={11} />{l}</p>
                    <p className="font-['Montserrat'] font-bold navy mt-1">{v}</p>
                  </div>
                ))}
              </div>

              <section className={panel + " p-4"}>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <h3 className="font-['Montserrat'] font-bold text-sm navy flex items-center gap-2"><Icon name="KanbanSquare" size={15} />Сделки</h3>
                  <button type="button" onClick={() => setCreating(true)} className={btnGold + " !py-1.5 !px-3"}><Icon name="Plus" size={13} />Сделка</button>
                </div>
                {data.deals.length === 0 ? <p className={`text-sm ${muted}`}>Сделок нет</p> : (
                  <div className="flex flex-col gap-1.5">
                    {data.deals.map((d) => {
                      const s = stageOf(d.stage);
                      return (
                        <button key={d.id} type="button" onClick={() => onOpenDeal(d.id)}
                          className="flex items-center gap-3 px-3 py-2 rounded-sm border border-[hsl(var(--gold)/0.1)] hover:border-[hsl(var(--gold)/0.5)] text-left">
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
                          <span className="flex-1 min-w-0">
                            <span className="block text-sm navy truncate">{d.title}</span>
                            <span className={`block text-[11px] ${muted}`}>№{d.id} · {s.label} · {fmtDate(d.created_at, false)}{d.manager_name && ` · ${d.manager_name}`}</span>
                          </span>
                          <span className="text-xs font-bold text-[hsl(var(--gold))] whitespace-nowrap">{d.amount ? money(d.amount) : ""}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </section>

              <section className={panel + " p-4"}>
                <h3 className="font-['Montserrat'] font-bold text-sm navy flex items-center gap-2 mb-3"><Icon name="ListChecks" size={15} />Задачи по клиенту</h3>
                <TaskList token={token} tasks={data.tasks} staff={staff} me={me} clientId={c.id} showContext onChanged={load} />
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <section className={panel + " p-4"}>
                  <h3 className="font-['Montserrat'] font-bold text-sm navy flex items-center gap-2 mb-2"><Icon name="ClipboardList" size={15} />Заявки на авто · {st.orders}</h3>
                  {data.orders.length === 0 ? <p className={`text-sm ${muted}`}>Нет</p> : data.orders.map((o) => (
                    <div key={o.id} className="py-1.5 border-t border-[hsl(var(--gold)/0.08)] first:border-t-0 text-sm">
                      <p className="navy">{[o.car_brand, o.car_model, o.car_year].filter(Boolean).join(" ")} <span className={muted}>· {o.order_number}</span></p>
                      <p className={`text-[11px] ${muted}`}>{fmtDate(o.created_at, false)}{o.budget ? ` · бюджет ${money(o.budget)}` : ""}</p>
                    </div>
                  ))}
                </section>
                <section className={panel + " p-4"}>
                  <h3 className="font-['Montserrat'] font-bold text-sm navy flex items-center gap-2 mb-2"><Icon name="Wrench" size={15} />Запросы запчастей · {st.parts_requests}</h3>
                  {data.parts_requests.length === 0 ? <p className={`text-sm ${muted}`}>Нет</p> : data.parts_requests.map((r) => (
                    <div key={r.id} className="py-1.5 border-t border-[hsl(var(--gold)/0.08)] first:border-t-0 text-sm">
                      <p className="navy">{r.category_title}</p>
                      <p className={`text-[11px] ${muted}`}>{[r.car_brand, r.car_model].filter(Boolean).join(" ")}{r.vin && ` · ${r.vin}`} · {fmtDate(r.created_at, false)}</p>
                    </div>
                  ))}
                </section>
              </div>

              {data.cars.length > 0 && (
                <section className={panel + " p-4"}>
                  <h3 className="font-['Montserrat'] font-bold text-sm navy flex items-center gap-2 mb-2"><Icon name="Car" size={15} />Машины клиента</h3>
                  {data.cars.map((car) => (
                    <div key={car.id} className="flex justify-between gap-3 py-1.5 border-t border-[hsl(var(--gold)/0.08)] first:border-t-0 text-sm">
                      <span className="navy">{[car.car_brand, car.car_model, car.car_year].filter(Boolean).join(" ")}{car.vin && <span className={`font-mono text-xs ${muted}`}> · {car.vin}</span>}</span>
                      <span className={`text-xs ${muted} whitespace-nowrap`}>{car.order_number}{car.price ? ` · ${money(car.price)}` : ""}</span>
                    </div>
                  ))}
                </section>
              )}
            </div>
          </>
        )}
      </div>
      {creating && c && (
        <div onClick={(e) => e.stopPropagation()}>
          <NewDealDialog token={token} staff={staff} me={me} presetClient={{ id: c.id, name }}
            onClose={() => setCreating(false)} onCreated={(id) => { setCreating(false); load(); onOpenDeal(id); }} />
        </div>
      )}
    </div>
  );
}

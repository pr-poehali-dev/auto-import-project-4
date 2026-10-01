import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { STAGES, crmGet, crmPost, type CrmClient, type StaffMember } from "@/lib/crm";
import { panel, input, label, btnGold, btnGhost, muted } from "./ui";

interface Props {
  token: string;
  staff: StaffMember[];
  me: number;
  presetClient?: { id: number; name: string };
  onClose: () => void;
  onCreated: (id: number) => void;
}

// Ручное создание сделки: звонок, мессенджер, повторное обращение
export default function NewDealDialog({ token, staff, me, presetClient, onClose, onCreated }: Props) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [stage, setStage] = useState("new");
  const [managerId, setManagerId] = useState(String(me));
  const [client, setClient] = useState<{ id: number; name: string } | null>(presetClient || null);
  const [clientQ, setClientQ] = useState("");
  const [found, setFound] = useState<CrmClient[]>([]);
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (client || clientQ.trim().length < 2) { setFound([]); return; }
    const id = setTimeout(() => crmGet(token, { view: "clients", q: clientQ.trim() }).then((d) => setFound((d.clients || []).slice(0, 6))), 300);
    return () => clearTimeout(id);
  }, [clientQ, client, token]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError("");
    const r = await crmPost(token, {
      action: "create", title, stage, manager_id: Number(managerId) || null,
      amount: amount ? Number(amount.replace(/\s/g, "")) : null,
      client_id: client?.id, contact_name: client ? "" : contactName, contact_phone: client ? "" : contactPhone,
    });
    setSaving(false);
    if (r.error) { setError(r.error); return; }
    onCreated(r.id);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <form onSubmit={submit} className={panel + " w-full max-w-lg p-5 max-h-[92vh] overflow-y-auto"} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-['Montserrat'] font-bold text-lg navy">Новая сделка</h3>
          <button type="button" onClick={onClose} className={muted + " hover:text-[hsl(var(--navy))]"}><Icon name="X" size={20} /></button>
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <label className={label}>Что нужно клиенту *</label>
            <input required autoFocus value={title} onChange={(e) => setTitle(e.target.value)} maxLength={255}
              placeholder="Toyota Camry 2021 под ключ / Фары Haval Jolion" className={input} />
          </div>

          <div>
            <label className={label}>Клиент</label>
            {client ? (
              <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-sm border border-[hsl(var(--gold)/0.3)] bg-[hsl(var(--gold)/0.06)]">
                <span className="text-sm navy font-semibold">{client.name}</span>
                {!presetClient && <button type="button" onClick={() => setClient(null)} className={muted}><Icon name="X" size={14} /></button>}
              </div>
            ) : (
              <>
                <input value={clientQ} onChange={(e) => setClientQ(e.target.value)} placeholder="Поиск зарегистрированного клиента" className={input} />
                {found.length > 0 && (
                  <div className="mt-1 border border-[hsl(var(--gold)/0.18)] rounded-sm divide-y divide-[hsl(var(--gold)/0.08)]">
                    {found.map((c) => (
                      <button key={c.id} type="button" onClick={() => { setClient({ id: c.id, name: c.name }); setClientQ(""); }}
                        className="w-full text-left px-3 py-2 hover:bg-[hsl(var(--gold)/0.08)]">
                        <span className="text-sm navy">{c.name}</span>
                        <span className={`block text-[11px] ${muted}`}>{[c.company, c.phone, c.email].filter(Boolean).join(" · ")}</span>
                      </button>
                    ))}
                  </div>
                )}
                <p className={`text-[11px] ${muted} mt-2 mb-1.5`}>Клиент не зарегистрирован — укажите контакт:</p>
                <div className="grid grid-cols-2 gap-2">
                  <input value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Имя" className={input} />
                  <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="Телефон" className={input} />
                </div>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className={label}>Сумма, ₽</label>
              <input inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d\s]/g, ""))} placeholder="0" className={input} />
            </div>
            <div>
              <label className={label}>Этап</label>
              <select value={stage} onChange={(e) => setStage(e.target.value)} className={input}>
                {STAGES.filter((s) => s.id !== "lost").map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className={label}>Ответственный</label>
              <select value={managerId} onChange={(e) => setManagerId(e.target.value)} className={input}>
                <option value="">Не назначен</option>
                {staff.map((s) => <option key={s.id} value={s.id}>{s.name}{s.id === me ? " (я)" : ""}</option>)}
              </select>
            </div>
          </div>
        </div>

        {error && <p className="text-sm text-red-400 mt-3">{error}</p>}
        <div className="flex gap-2 justify-end mt-5">
          <button type="button" onClick={onClose} className={btnGhost}>Отмена</button>
          <button type="submit" disabled={saving} className={btnGold}>
            {saving ? <Icon name="Loader" size={14} className="animate-spin" /> : <Icon name="Plus" size={14} />}Создать
          </button>
        </div>
      </form>
    </div>
  );
}

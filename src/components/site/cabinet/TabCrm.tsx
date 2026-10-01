import { useCallback, useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import type { SiteState } from "@/hooks/useSiteState";
import { crmGet, crmPost, type StaffMember } from "@/lib/crm";
import CrmBoard from "@/components/site/crm/CrmBoard";
import CrmClients from "@/components/site/crm/CrmClients";
import CrmTasks from "@/components/site/crm/CrmTasks";
import CrmReports from "@/components/site/crm/CrmReports";
import DealPanel from "@/components/site/crm/DealPanel";
import ClientPanel from "@/components/site/crm/ClientPanel";

type View = "board" | "clients" | "tasks" | "reports";

// CRM сотрудника: воронка, клиенты, задачи, отчёты
export default function TabCrm(s: SiteState) {
  const { cabinetTab, isStaff, token } = s;
  const active = cabinetTab === "crm" && isStaff;
  const [view, setView] = useState<View>("board");
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [me, setMe] = useState(0);
  const [myTelegram, setMyTelegram] = useState("");
  const [overdue, setOverdue] = useState(0);
  const [dealId, setDealId] = useState<number | null>(null);
  const [clientId, setClientId] = useState<number | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    if (!active) return;
    crmGet(token, { view: "staff" }).then((d) => {
      if (d.error) return;
      setStaff(d.staff || []); setMe(d.me); setMyTelegram(d.my_telegram || "");
    });
  }, [active, token]);

  useEffect(() => {
    if (!active) return;
    const tick = () => {
      crmPost(token, { action: "remind" });
      crmGet(token, { view: "tasks", scope: "mine" }).then((d) => setOverdue(d.my_overdue || 0));
    };
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [active, token, reloadKey]);

  if (!active) return null;

  const tabs: { id: View; label: string; icon: string; badge?: number }[] = [
    { id: "board", label: "Воронка", icon: "KanbanSquare" },
    { id: "clients", label: "Клиенты", icon: "Contact" },
    { id: "tasks", label: "Задачи", icon: "ListChecks", badge: overdue },
    { id: "reports", label: "Отчёты", icon: "BarChart3" },
  ];

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-5">
        {tabs.map((t) => (
          <button key={t.id} type="button" onClick={() => setView(t.id)}
            className={`relative flex items-center gap-1.5 text-xs font-['Montserrat'] font-bold px-4 py-2.5 rounded-sm transition-colors ${view === t.id ? "bg-[hsl(var(--gold))] text-[hsl(222_47%_8%)]" : "text-[hsl(var(--navy)/0.7)] border border-[hsl(var(--gold)/0.2)] hover:border-[hsl(var(--gold)/0.6)]"}`}>
            <Icon name={t.icon} size={14} />{t.label}
            {!!t.badge && <span className="ml-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center" title="Просроченные задачи">{t.badge}</span>}
          </button>
        ))}
      </div>

      {me > 0 && view === "board" && <CrmBoard token={token} staff={staff} me={me} onOpenDeal={setDealId} reloadKey={reloadKey} />}
      {me > 0 && view === "clients" && <CrmClients token={token} onOpenClient={setClientId} reloadKey={reloadKey} />}
      {me > 0 && view === "tasks" && <CrmTasks token={token} staff={staff} me={me} myTelegram={myTelegram} onTelegramSaved={setMyTelegram} onOpenDeal={setDealId} reloadKey={reloadKey} />}
      {me > 0 && view === "reports" && <CrmReports token={token} reloadKey={reloadKey} />}
      {me === 0 && <div className="flex items-center gap-3 py-20 justify-center text-[hsl(var(--navy)/0.55)]"><Icon name="Loader" size={20} className="animate-spin" />Загружаем CRM…</div>}

      {clientId !== null && (
        <ClientPanel token={token} clientId={clientId} staff={staff} me={me}
          onClose={() => { setClientId(null); reload(); }} onOpenDeal={(id) => setDealId(id)} />
      )}
      {dealId !== null && (
        <DealPanel token={token} dealId={dealId} staff={staff} me={me}
          onClose={() => setDealId(null)} onChanged={reload}
          onOpenClient={(id) => { setDealId(null); setClientId(id); }} />
      )}
    </div>
  );
}

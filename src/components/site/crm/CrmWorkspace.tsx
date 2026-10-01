import { useCallback, useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { crmGet, crmPost, type StaffMember } from "@/lib/crm";
import CrmBoard from "./CrmBoard";
import CrmClients from "./CrmClients";
import CrmTasks from "./CrmTasks";
import CrmReports from "./CrmReports";
import DealPanel from "./DealPanel";
import ClientPanel from "./ClientPanel";

export type CrmView = "board" | "clients" | "tasks" | "reports";

export const CRM_TABS: { id: CrmView; label: string; icon: string }[] = [
  { id: "board", label: "Воронка", icon: "KanbanSquare" },
  { id: "clients", label: "Клиенты", icon: "Contact" },
  { id: "tasks", label: "Задачи", icon: "ListChecks" },
  { id: "reports", label: "Отчёты", icon: "BarChart3" },
];

interface Props {
  token: string;
  view: CrmView;
  onOverdue?: (n: number) => void;
  initialDealId?: number | null;
}

// Общее рабочее место CRM: используется в кабинете на сайте и в мобильном приложении
export default function CrmWorkspace({ token, view, onOverdue, initialDealId }: Props) {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [me, setMe] = useState(0);
  const [myTelegram, setMyTelegram] = useState("");
  const [dealId, setDealId] = useState<number | null>(initialDealId ?? null);
  const [clientId, setClientId] = useState<number | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [error, setError] = useState("");
  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    crmGet(token, { view: "staff" }).then((d) => {
      if (d.error) { setError(d.error); return; }
      setStaff(d.staff || []); setMe(d.me); setMyTelegram(d.my_telegram || "");
    });
  }, [token]);

  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === "hidden") return;
      crmPost(token, { action: "remind" });
      crmGet(token, { view: "tasks", scope: "mine" }).then((d) => onOverdue?.(d.my_overdue || 0));
    };
    tick();
    const id = setInterval(tick, 60000);
    document.addEventListener("visibilitychange", tick);
    return () => { clearInterval(id); document.removeEventListener("visibilitychange", tick); };
  }, [token, reloadKey]);

  if (error) return <p className="text-center py-20 text-red-400">{error}</p>;
  if (me === 0) {
    return <div className="flex items-center gap-3 py-20 justify-center text-[hsl(var(--navy)/0.55)]"><Icon name="Loader" size={20} className="animate-spin" />Загружаем CRM…</div>;
  }

  return (
    <>
      {view === "board" && <CrmBoard token={token} staff={staff} me={me} onOpenDeal={setDealId} reloadKey={reloadKey} />}
      {view === "clients" && <CrmClients token={token} onOpenClient={setClientId} reloadKey={reloadKey} />}
      {view === "tasks" && <CrmTasks token={token} staff={staff} me={me} myTelegram={myTelegram} onTelegramSaved={setMyTelegram} onOpenDeal={setDealId} reloadKey={reloadKey} />}
      {view === "reports" && <CrmReports token={token} reloadKey={reloadKey} />}

      {clientId !== null && (
        <ClientPanel token={token} clientId={clientId} staff={staff} me={me}
          onClose={() => { setClientId(null); reload(); }} onOpenDeal={(id) => setDealId(id)} />
      )}
      {dealId !== null && (
        <DealPanel token={token} dealId={dealId} staff={staff} me={me}
          onClose={() => setDealId(null)} onChanged={reload}
          onOpenClient={(id) => { setDealId(null); setClientId(id); }} />
      )}
    </>
  );
}

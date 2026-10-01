import { useState } from "react";
import Icon from "@/components/ui/icon";
import type { SiteState } from "@/hooks/useSiteState";
import CrmWorkspace, { CRM_TABS, type CrmView } from "@/components/site/crm/CrmWorkspace";

// CRM сотрудника в кабинете на сайте
export default function TabCrm(s: SiteState) {
  const { cabinetTab, isStaff, token } = s;
  const [view, setView] = useState<CrmView>("board");
  const [overdue, setOverdue] = useState(0);
  if (cabinetTab !== "crm" || !isStaff) return null;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1.5 mb-5">
        {CRM_TABS.map((t) => (
          <button key={t.id} type="button" onClick={() => setView(t.id)}
            className={`relative flex items-center gap-1.5 text-xs font-['Montserrat'] font-bold px-4 py-2.5 rounded-sm transition-colors ${view === t.id ? "bg-[hsl(var(--gold))] text-[hsl(222_47%_8%)]" : "text-[hsl(var(--navy)/0.7)] border border-[hsl(var(--gold)/0.2)] hover:border-[hsl(var(--gold)/0.6)]"}`}>
            <Icon name={t.icon} size={14} />{t.label}
            {t.id === "tasks" && overdue > 0 && <span className="ml-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center" title="Просроченные задачи">{overdue}</span>}
          </button>
        ))}
        <a href="/crm" className="ml-auto flex items-center gap-1.5 text-xs text-[hsl(var(--gold))] hover:underline">
          <Icon name="Smartphone" size={14} />CRM на телефоне
        </a>
      </div>
      <CrmWorkspace token={token} view={view} onOverdue={setOverdue} />
    </div>
  );
}

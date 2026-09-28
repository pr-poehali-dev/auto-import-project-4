import Icon from "@/components/ui/icon";
import type { SiteState } from "@/hooks/useSiteState";

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  processing: "bg-yellow-100 text-yellow-700",
  answered: "bg-teal-100 text-teal-700",
  closed: "bg-green-100 text-green-700",
};

// Вкладка «Запросы запчастей»: сотрудник видит все, клиент — свои
export default function TabPartsRequests(s: SiteState) {
  const { cabinetTab, partsRequests, partsReqLoading, setPartsRequestStatus, isStaff, t } = s;
  if (cabinetTab !== "parts_requests") return null;

  if (partsReqLoading) {
    return (
      <div className="flex items-center gap-3 py-16 justify-center text-[hsl(var(--navy)/0.62)]">
        <Icon name="Loader" size={20} className="animate-spin" />{t("loading")}
      </div>
    );
  }

  if (partsRequests.length === 0) {
    return (
      <div className="text-center py-16">
        <Icon name="PackageSearch" size={40} className="mx-auto mb-4 text-[hsl(var(--navy)/0.4)]" />
        <p className="font-['Montserrat'] font-bold navy mb-2">{t("pr_empty")}</p>
        <p className="text-[hsl(var(--navy)/0.65)] text-sm">{t("pr_empty_sub")}</p>
      </div>
    );
  }

  const newCount = partsRequests.filter((r) => r.status === "new").length;

  return (
    <div>
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <h2 className="font-['Montserrat'] font-bold text-xl navy">{t("tab_parts_requests")}</h2>
        <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-[hsl(var(--gold)/0.12)] text-[hsl(var(--gold))]">{partsRequests.length}</span>
        {newCount > 0 && (
          <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-blue-100 text-blue-700">{t("pr_new")}: {newCount}</span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {partsRequests.map((r) => (
          <div key={r.id} className="card-light rounded-sm p-5">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="min-w-0">
                <div className="font-['Montserrat'] font-bold navy leading-tight">{r.category_title}</div>
                <div className="text-sm text-[hsl(var(--navy)/0.62)] mt-0.5">
                  {[r.car_brand, r.car_model, r.car_year].filter(Boolean).join(" ")}
                </div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${STATUS_COLORS[r.status] || "bg-gray-100 text-gray-600"}`}>
                {r.status_label}
              </span>
            </div>

            {r.vin && (
              <div className="text-xs text-[hsl(var(--navy)/0.62)]">
                VIN: <span className="font-mono font-semibold navy tracking-wide">{r.vin}</span>
              </div>
            )}

            {r.parts_text && (
              <div className="mt-2 pt-2 border-t border-[hsl(var(--gold)/0.12)]">
                <div className="text-[10px] font-['Montserrat'] font-bold uppercase tracking-wide text-[hsl(var(--navy)/0.5)] mb-0.5">{t("cn_parts_list")}</div>
                <p className="text-sm text-[hsl(var(--navy)/0.72)] leading-relaxed whitespace-pre-line">{r.parts_text}</p>
              </div>
            )}

            {r.comment && (
              <p className="text-sm text-[hsl(var(--navy)/0.55)] mt-2 leading-relaxed whitespace-pre-line">{r.comment}</p>
            )}

            {isStaff && (
              <div className="mt-3 pt-3 border-t border-[hsl(var(--gold)/0.12)] flex flex-col gap-2">
                <div className="text-sm navy font-semibold">{r.client_name || r.client_email}</div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[hsl(var(--navy)/0.62)]">
                  {r.client_company && <span>{r.client_company}</span>}
                  {r.client_phone && <a href={`tel:${r.client_phone}`} className="hover:text-[hsl(var(--gold))]">{r.client_phone}</a>}
                  {r.client_email && <a href={`mailto:${r.client_email}`} className="hover:text-[hsl(var(--gold))]">{r.client_email}</a>}
                </div>
                <select value={r.status} onChange={(e) => setPartsRequestStatus(r.id, e.target.value)}
                  className="text-xs border border-[hsl(var(--gold)/0.18)] rounded-sm px-2 py-1.5 bg-[hsl(222_46%_8%)] navy max-w-[200px]">
                  <option value="new">{t("prst_new")}</option>
                  <option value="processing">{t("prst_processing")}</option>
                  <option value="answered">{t("prst_answered")}</option>
                  <option value="closed">{t("prst_closed")}</option>
                </select>
              </div>
            )}

            <div className="mt-2 text-[11px] text-[hsl(var(--navy)/0.5)]">
              {new Date(r.created_at).toLocaleString("ru-RU", { dateStyle: "short", timeStyle: "short" })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

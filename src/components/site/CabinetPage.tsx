import Icon from "@/components/ui/icon";
import type { SiteState } from "@/hooks/useSiteState";
import { HERO_IMG, type CabinetTab } from "@/lib/site-data";
import TabOrders from "@/components/site/cabinet/TabOrders";
import TabClients from "@/components/site/cabinet/TabClients";
import TabLogistics from "@/components/site/cabinet/TabLogistics";
import TabPartsRequests from "@/components/site/cabinet/TabPartsRequests";
import TabMisc from "@/components/site/cabinet/TabMisc";

export default function CabinetPage(s: SiteState) {
  const { t, nav, page, user, isStaff, doLogout, cabinetTab, setCabinetTab, setSelectedOrder } = s;

  return (
    <>
        {/* ════ CABINET ════ */}
        {page === "cabinet" && (
          !user ? (
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <Icon name="Lock" size={40} className="mx-auto mb-4 text-[hsl(var(--navy)/0.55)]" />
                <p className="font-['Montserrat'] font-bold navy mb-4">{t("auth_required")}</p>
                <button onClick={() => nav("login")} className="px-6 py-3 btn-navy rounded-sm">{t("login")}</button>
              </div>
            </div>
          ) : (
            <div className="min-h-screen relative">
              <div className="fixed inset-0 -z-10 bg-cover bg-center" style={{ backgroundImage: `url(${HERO_IMG})` }} />
              <div className="fixed inset-0 -z-10 bg-[linear-gradient(180deg,hsl(222_47%_6%/0.94),hsl(222_50%_4%/0.97))]" />
              <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8">
              {/* Cabinet header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                  <div className="section-tag mb-2">{isStaff ? t("staff_cabinet") : t("personal_cabinet")}</div>
                  <h1 className="font-['Montserrat'] font-black text-3xl navy flex items-center gap-3">
                    {user.full_name || user.email}
                    {isStaff && <span className="text-xs px-2.5 py-1 bg-[hsl(var(--gold)/0.12)] text-[hsl(var(--gold))] rounded-full font-['Montserrat'] font-bold uppercase tracking-wide">{t("staff_badge")}</span>}
                  </h1>
                  {user.company && <p className="text-[hsl(var(--navy)/0.65)] text-sm mt-0.5">{user.company}</p>}
                </div>
                <button onClick={doLogout} className="flex items-center gap-2 px-4 py-2 border border-[hsl(var(--gold)/0.15)] text-[hsl(var(--navy)/0.68)] text-sm font-['Montserrat'] font-semibold hover:text-red-600 hover:border-red-200 transition-all rounded-sm">
                  <Icon name="LogOut" size={15} />{t("logout")}
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 flex-wrap mb-8 border-b border-[hsl(var(--gold)/0.15)]">
                {((isStaff ? [
                  { id: "clients", label: t("tab_clients"), icon: "Users" },
                  { id: "in_work", label: t("tab_in_work"), icon: "Loader" },
                  { id: "shipping", label: t("tab_shipping"), icon: "Truck" },
                  { id: "teardowns", label: t("tab_teardowns"), icon: "Wrench" },
                  { id: "parts_requests", label: t("tab_parts_requests"), icon: "PackageSearch" },
                  { id: "hot_deals", label: t("tab_hot_deals"), icon: "Flame" },
                  { id: "staff_users", label: t("tab_staff_users"), icon: "ShieldCheck" },
                  { id: "profile", label: t("tab_profile"), icon: "User" },
                ] : [
                  { id: "orders", label: t("tab_orders"), icon: "ClipboardList" },
                  { id: "active_orders", label: t("tab_active_orders"), icon: "Package" },
                  { id: "new_order", label: t("tab_new_order"), icon: "Plus" },
                  { id: "auctions", label: t("tab_auctions"), icon: "Globe" },
                  { id: "parts_requests", label: t("tab_parts_requests"), icon: "PackageSearch" },
                  { id: "documents", label: t("tab_documents"), icon: "FileText" },
                  { id: "profile", label: t("tab_profile"), icon: "User" },
                ]) as { id: CabinetTab; label: string; icon: string }[]).map((tab) => (
                  <button key={tab.id} onClick={() => { setCabinetTab(tab.id); setSelectedOrder(null); }}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-['Montserrat'] font-semibold border-b-2 transition-all ${cabinetTab === tab.id ? "border-[hsl(var(--gold))] text-[hsl(var(--gold))]" : "border-transparent text-[hsl(var(--navy)/0.6)] hover:text-[hsl(var(--navy))]"}`}>
                    <Icon name={tab.icon} size={15} />{tab.label}
                  </button>
                ))}
              </div>

              {/* ── Мои заявки (новые, на рассмотрении) ── */}
              <TabOrders {...s} />
              <TabClients {...s} />
              <TabLogistics {...s} />
              <TabMisc {...s} />
              <TabPartsRequests {...s} />
              </div>
            </div>
          )
        )}
    </>
  );
}

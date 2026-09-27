import Icon from "@/components/ui/icon";
import type { SiteState } from "@/hooks/useSiteState";
import ClientsList from "@/components/site/cabinet/clients/ClientsList";
import OrderDetailCard from "@/components/site/cabinet/clients/OrderDetailCard";
import CarsSection from "@/components/site/cabinet/clients/CarsSection";

export default function TabClients(s: SiteState) {
  const { cabinetTab, selectedOrder, setSelectedOrder, t } = s;

  return (
    <>
              {/* ── Заявки клиентов (сотрудник) ── */}
              {cabinetTab === "clients" && (
                <div>
                  {!selectedOrder ? (
                    <ClientsList {...s} />
                  ) : (
                    <div>
                      <button onClick={() => setSelectedOrder(null)} className="flex items-center gap-2 text-[hsl(var(--navy)/0.68)] text-sm font-['Montserrat'] font-semibold mb-6 hover:text-[hsl(var(--navy))] transition-colors">
                        <Icon name="ArrowLeft" size={15} />{t("all_client_orders")}
                      </button>

                      <OrderDetailCard {...s} />
                      <CarsSection {...s} />
                    </div>
                  )}
                </div>
              )}

    </>
  );
}

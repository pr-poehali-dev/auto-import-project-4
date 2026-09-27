import Icon from "@/components/ui/icon";
import type { SiteState } from "@/hooks/useSiteState";
import { ORIGIN_LABEL,STATUS_COLOR,STATUS_LABEL } from "@/lib/site-data";

export default function OrderDetailCard(s: SiteState) {
  const {
    changeOrderStatus,
    inputCls,
    lang,
    selectedOrder,
    setSelectedOrder,
    t,
  } = s;

  if (!selectedOrder) return null;

  return (
    <>
                      <button onClick={() => setSelectedOrder(null)} className="flex items-center gap-2 text-[hsl(var(--navy)/0.68)] text-sm font-['Montserrat'] font-semibold mb-6 hover:text-[hsl(var(--navy))] transition-colors">
                        <Icon name="ArrowLeft" size={15} />{t("all_client_orders")}
                      </button>

                      {/* Карточка заявки + смена статуса */}
                      <div className="card-light rounded-sm p-6 mb-6">
                        <div className="flex items-center gap-2 flex-wrap mb-3">
                          <span className="font-['Montserrat'] font-black text-xl navy">{selectedOrder.order_number}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_COLOR[selectedOrder.status] || "bg-gray-100 text-gray-600"}`}>{STATUS_LABEL[lang][selectedOrder.status] || selectedOrder.status_label}</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm mb-5">
                          <div><span className="text-[hsl(var(--navy)/0.62)]">{t("client")}</span> <span className="navy font-semibold">{selectedOrder.client_name || "—"}</span></div>
                          <div><span className="text-[hsl(var(--navy)/0.62)]">{t("company_label")}</span> <span className="navy">{selectedOrder.client_company || "—"}</span></div>
                          <div><span className="text-[hsl(var(--navy)/0.62)]">{t("email_label")}</span> <span className="navy">{selectedOrder.client_email || "—"}</span></div>
                          <div><span className="text-[hsl(var(--navy)/0.62)]">{t("phone_label")}</span> <span className="navy">{selectedOrder.client_phone || "—"}</span></div>
                          <div><span className="text-[hsl(var(--navy)/0.62)]">{t("request_label")}</span> <span className="navy">{[selectedOrder.car_brand, selectedOrder.car_model, selectedOrder.car_year].filter(Boolean).join(" ") || "—"}</span></div>
                          <div><span className="text-[hsl(var(--navy)/0.62)]">{t("direction_label")}</span> <span className="navy">{ORIGIN_LABEL[lang][selectedOrder.origin] || selectedOrder.origin} · {selectedOrder.quantity} {t("pcs")}</span></div>
                        </div>
                        {selectedOrder.comment && <div className="text-sm bg-[hsl(222_44%_9%/0.5)] rounded-sm p-3 mb-5"><span className="text-[hsl(var(--navy)/0.62)]">{t("client_comment")}</span><span className="navy">{selectedOrder.comment}</span></div>}
                        <div>
                          <label className="block text-[hsl(var(--navy)/0.68)] text-xs font-['Montserrat'] font-semibold tracking-widest uppercase mb-2">{t("order_status")}</label>
                          <select value={selectedOrder.status} onChange={(e) => changeOrderStatus(selectedOrder.id, e.target.value)} className={inputCls + " max-w-xs"}>
                            <option value="new">{t("st_new")}</option>
                            <option value="processing">{t("st_processing")}</option>
                            <option value="auction">{t("st_auction")}</option>
                            <option value="shipped">{t("st_shipped")}</option>
                            <option value="customs">{t("st_customs")}</option>
                            <option value="delivered">{t("st_delivered")}</option>
                            <option value="done">{t("st_done")}</option>
                          </select>
                        </div>
                      </div>

    </>
  );
}

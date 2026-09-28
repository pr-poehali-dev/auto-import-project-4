import { useState, useEffect } from "react";
import TeardownModeBadge, { type TeardownMode } from "@/components/TeardownModeBadge";
import { writeXlsxWithFreeze } from "@/lib/xlsx-export";
import {
  LOGO, COMPANY_NAME, I18N, ORIGIN_LABEL, STATUS_LABEL,
  TD_SEP, TD_FULL, TD_HALFCUT, TD_NOSKAT, TEARDOWN_PRESET,
  splitTd, joinTd, detectTeardownMode, groupTeardown, defaultQty,
  apiAuth, apiCars, apiContainers, apiHotDeals, apiOrders,
  type User, type Order, type Car, type TeardownItem, type HotDeal,
  type Lang, type Page, type CabinetTab,
} from "@/lib/site-data";

export function useSiteState() {
  const [lang, setLang] = useState<Lang>(() => (localStorage.getItem("pc_lang") as Lang) || "ru");
  const t = (key: string) => I18N[lang][key] || key;
  const changeLang = (l: Lang) => { setLang(l); localStorage.setItem("pc_lang", l); };
  const [page, setPage] = useState<Page>(() => (typeof window !== "undefined" && window.location.hash === "#staff") ? "staff_login" : "home");
  const [originId, setOriginId] = useState<string>("hongkong");
  const [activeAuction, setActiveAuction] = useState<{ name: string; url: string } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  // auth
  const [token, setToken] = useState(() => localStorage.getItem("pc_token") || "");
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  // forms
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [forgotForm, setForgotForm] = useState({ email: "", code: "", password: "" });
  const [forgotStep, setForgotStep] = useState<"email" | "reset">("email");
  const [forgotMsg, setForgotMsg] = useState("");
  const [regForm, setRegForm] = useState({ email: "", password: "", full_name: "", phone: "", company: "", code: "" });
  const [regStep, setRegStep] = useState<"form" | "code">("form");
  const [codeSending, setCodeSending] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", company: "", phone: "", comment: "" });
  const [contactSent, setContactSent] = useState(false);
  // cabinet
  const [cabinetTab, setCabinetTab] = useState<CabinetTab>("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [profileForm, setProfileForm] = useState({ full_name: "", phone: "", company: "", inn: "" });
  const [profileSaved, setProfileSaved] = useState(false);
  const [newOrderForm, setNewOrderForm] = useState({ car_brand: "", car_model: "", car_year: "", quantity: "1", budget: "", origin: "Япония", comment: "" });
  const [newOrderSent, setNewOrderSent] = useState(false);
  // staff: работа с заявкой клиента
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [cars, setCars] = useState<Car[]>([]);
  const [carsLoading, setCarsLoading] = useState(false);
  const [editCarId, setEditCarId] = useState<number | null>(null);
  const [editCarForm, setEditCarForm] = useState({ vin: "", engine_model: "", engine_number: "" });
  const [editCarSaving, setEditCarSaving] = useState(false);
  const [carForm, setCarForm] = useState({ car_brand: "", car_model: "", car_year: "", vin: "", engine_model: "", engine_number: "", price: "", mileage: "", description: "", photos: [] as string[], teardown: [] as TeardownItem[] });
  const [carSaving, setCarSaving] = useState(false);
  const [teardownInput, setTeardownInput] = useState("");
  // клиент: сохранение отметок разборного листа
  const [savingTeardown, setSavingTeardown] = useState<number | null>(null);
  // сотрудник: все авто с разборными листами
  interface TeardownCar extends Car { order_id: number; order_number: string; client_name: string; client_email: string; client_company: string; }
  const [teardownCars, setTeardownCars] = useState<TeardownCar[]>([]);
  const [teardownCarsLoading, setTeardownCarsLoading] = useState(false);
  const [tdFilter, setTdFilter] = useState<TeardownMode | "all">("all");
  // фильтр «только машины в разбор с незаполненными VIN / данными ДВС»
  const [tdMissingOnly, setTdMissingOnly] = useState(false);
  const isMissingIds = (c: { order_status?: string; vin?: string; engine_model?: string; engine_number?: string }) =>
    c.order_status === "teardown" && (!c.vin || !c.engine_model || !c.engine_number);
  const toggleTdMissingOnly = () => setTdMissingOnly((v) => !v);
  // сотрудник: контейнеры (сборка машинокомплектов)
  interface ContainerCar { id: number; car_brand: string; car_model: string; car_year: number; vin: string; order_number: string; client_name: string; client_company: string; origin: string; status: string; engine_model?: string; engine_number?: string; teardown?: TeardownItem[]; }
  interface Container { id: number; name: string; container_number: string; origin: string; status: string; status_label: string; comment: string; created_at: string; cars: ContainerCar[]; }
  const [containers, setContainers] = useState<Container[]>([]);
  const [availableCars, setAvailableCars] = useState<ContainerCar[]>([]);
  const [containersLoading, setContainersLoading] = useState(false);
  const [containerForm, setContainerForm] = useState({ name: "", container_number: "", origin: "Япония", comment: "" });
  const [containerFormOpen, setContainerFormOpen] = useState(false);
  const [containerSaving, setContainerSaving] = useState(false);
  const [pickedCars, setPickedCars] = useState<number[]>([]);
  const [addTargetContainer, setAddTargetContainer] = useState<number | "">("");
  // сотрудник: создание заявки клиенту
  const [staffOrderOpen, setStaffOrderOpen] = useState(false);
  const [staffOrderForm, setStaffOrderForm] = useState({ client_id: "", car_brand: "", car_model: "", car_year: "", quantity: "1", budget: "", origin: "Япония", comment: "" });
  const [staffOrderSaving, setStaffOrderSaving] = useState(false);
  const [clientsList, setClientsList] = useState<{ id: number; full_name: string; email: string; company: string }[]>([]);
  // сотрудник: создание клиента
  const [staffClientOpen, setStaffClientOpen] = useState(false);
  const [staffClientForm, setStaffClientForm] = useState({ full_name: "", email: "", phone: "", company: "", inn: "", password: "" });
  const [staffClientSaving, setStaffClientSaving] = useState(false);
  const [staffClientError, setStaffClientError] = useState("");
  const [staffClientDone, setStaffClientDone] = useState(false);

  const tdModeLabel = (mode: TeardownMode) =>
    mode === "halfcut" ? t("td_badge_halfcut")
      : mode === "full" ? t("td_badge_full")
      : mode === "noskat" ? t("td_badge_noskat")
      : t("td_badge_custom");

  const renderTdBadge = (items: TeardownItem[] | undefined, size: "sm" | "xs" = "sm") => {
    const mode = detectTeardownMode(items || []);
    if (!mode) return null;
    return <TeardownModeBadge mode={mode} label={tdModeLabel(mode)} size={size} />;
  };

  const toggleCarFormPart = (name: string) => {
    setCarForm((f) => {
      const exists = f.teardown.find((x) => x.name === name);
      return exists
        ? { ...f, teardown: f.teardown.filter((x) => x.name !== name) }
        : { ...f, teardown: [...f.teardown, { name, needed: false, qty: defaultQty(name) }] };
    });
  };
  const setPartQty = (name: string, qty: number) => {
    setCarForm((f) => ({ ...f, teardown: f.teardown.map((x) => x.name === name ? { ...x, qty: Math.max(1, qty) } : x) }));
  };
  const toggleCarFormGroup = (names: string[], select: boolean) => {
    setCarForm((f) => {
      if (select) {
        const missing = names.filter((n) => !f.teardown.some((x) => x.name === n));
        return { ...f, teardown: [...f.teardown, ...missing.map((n) => ({ name: n, needed: false, qty: defaultQty(n) }))] };
      }
      return { ...f, teardown: f.teardown.filter((x) => !names.includes(x.name)) };
    });
  };
  const applyTeardownPreset = (preset: string[]) => {
    setCarForm((f) => {
      const custom = f.teardown.filter((x) => !TEARDOWN_PRESET.includes(x.name));
      return { ...f, teardown: [...preset.map((name) => ({ name, needed: false, qty: defaultQty(name) })), ...custom] };
    });
  };
  const selectHalfcutTeardown = () => applyTeardownPreset(TD_HALFCUT);
  const selectFullTeardown = () => applyTeardownPreset(TD_FULL);
  const selectNoskatTeardown = () => applyTeardownPreset(TD_NOSKAT);
  const clearTeardown = () => setCarForm((f) => ({ ...f, teardown: [] }));
  const addCustomPart = () => {
    const raw = teardownInput.trim();
    if (!raw) { setTeardownInput(""); return; }
    const name = raw.includes(TD_SEP) ? raw : joinTd("Другое", raw);
    if (carForm.teardown.some((x) => x.name === name)) { setTeardownInput(""); return; }
    setCarForm((f) => ({ ...f, teardown: [...f.teardown, { name, needed: false, qty: 1 }] }));
    setTeardownInput("");
  };

  const toggleClientPart = async (car: Car, partName: string) => {
    const updated = car.teardown.map((it) => it.name === partName ? { ...it, needed: !it.needed } : it);
    setOrderCars((prev) => {
      const next: Record<number, Car[]> = {};
      for (const k of Object.keys(prev)) {
        next[+k] = prev[+k].map((c) => c.id === car.id ? { ...c, teardown: updated } : c);
      }
      return next;
    });
    setSavingTeardown(car.id);
    await apiCars("PATCH", token, { body: { car_id: car.id, teardown: updated } });
    setSavingTeardown(null);
  };
  // staff: управление сотрудниками
  interface ManagedUser { id: number; email: string; full_name: string; phone: string; company: string; role: string; created_at: string; }
  const [staffUsers, setStaffUsers] = useState<ManagedUser[]>([]);
  const [staffUsersLoading, setStaffUsersLoading] = useState(false);
  const [roleSavingId, setRoleSavingId] = useState<number | null>(null);
  // горячие предложения (Гонконг)
  const emptyDeal = { id: 0, brand: "", model: "", year: "", mileage: "", engine: "", price: "", badge: "", photo: "" };
  const [hotDeals, setHotDeals] = useState<HotDeal[]>([]);
  const [hotDealsLoading, setHotDealsLoading] = useState(false);
  const [dealForm, setDealForm] = useState({ ...emptyDeal });
  const [dealSaving, setDealSaving] = useState(false);
  const [dealDeletingId, setDealDeletingId] = useState<number | null>(null);

  const loadHotDeals = async () => {
    setHotDealsLoading(true);
    const d = await apiHotDeals("GET", { query: "origin=hongkong" });
    setHotDeals(d.deals || []);
    setHotDealsLoading(false);
  };

  const pickDealPhoto = (file: File): Promise<string> =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });

  const editDeal = (d: HotDeal) => {
    setDealForm({ id: d.id, brand: d.brand, model: d.model, year: d.year ? String(d.year) : "", mileage: d.mileage, engine: d.engine, price: d.price, badge: d.badge, photo: d.photo });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const saveDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    setDealSaving(true);
    await apiHotDeals("POST", { token, body: { ...dealForm, origin: "hongkong", year: dealForm.year ? Number(dealForm.year) : null, sort_order: dealForm.id || hotDeals.length + 1 } });
    setDealForm({ ...emptyDeal });
    await loadHotDeals();
    setDealSaving(false);
  };

  const deleteDeal = async (id: number) => {
    setDealDeletingId(id);
    await apiHotDeals("DELETE", { token, query: `id=${id}` });
    await loadHotDeals();
    setDealDeletingId(null);
  };

  const loadStaffUsers = async () => {
    setStaffUsersLoading(true);
    const d = await apiAuth("list_users", {}, token);
    setStaffUsers(d.users || []);
    setStaffUsersLoading(false);
  };

  const toggleUserRole = async (u: ManagedUser) => {
    setRoleSavingId(u.id);
    const newRole = u.role === "staff" ? "client" : "staff";
    await apiAuth("set_role", { user_id: u.id, role: newRole }, token);
    await loadStaffUsers();
    setRoleSavingId(null);
  };

  // ── load user on mount ──
  useEffect(() => {
    if (token) {
      apiAuth("me", {}, token).then((data) => {
        if (data.user) setUser(data.user);
        else { setToken(""); localStorage.removeItem("pc_token"); }
      });
    }
  }, []);

  // ── load hot deals on Hong Kong origin page ──
  useEffect(() => {
    if (page === "origin" && originId === "hongkong") loadHotDeals();
  }, [page, originId]);

  // ── load hot deals in staff cabinet tab ──
  useEffect(() => {
    if (page === "cabinet" && token && user?.role === "staff" && cabinetTab === "hot_deals") loadHotDeals();
  }, [page, cabinetTab, token, user]);

  // ── load orders when cabinet opens ──
  useEffect(() => {
    const needOrders = page === "cabinet" && token && ["orders", "active_orders", "clients", "in_work", "shipping"].includes(cabinetTab);
    if (needOrders) {
      setOrdersLoading(true);
      apiOrders("GET", token)
        .then((d) => { setOrders(d.orders || []); })
        .catch(() => { setOrders([]); })
        .finally(() => { setOrdersLoading(false); });
    }
  }, [page, cabinetTab, token]);

  const isStaff = user?.role === "staff";

  useEffect(() => {
    if (page === "cabinet" && token && isStaff && cabinetTab === "staff_users") {
      loadStaffUsers();
    }
  }, [page, cabinetTab, token, isStaff]);

  useEffect(() => {
    if (page === "cabinet" && token && isStaff && cabinetTab === "teardowns") {
      loadTeardownCars();
    }
  }, [page, cabinetTab, token, isStaff]);

  useEffect(() => {
    if (page === "cabinet" && token && isStaff && cabinetTab === "shipping") {
      loadContainers();
    }
  }, [page, cabinetTab, token, isStaff]);

  const loadContainers = async () => {
    setContainersLoading(true);
    const [c, a] = await Promise.all([
      apiContainers("GET", token),
      apiContainers("GET", token, { query: "available=1" }),
    ]);
    setContainers(c.containers || []);
    setAvailableCars(a.cars || []);
    setContainersLoading(false);
  };

  const doCreateContainer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!containerForm.name.trim()) return;
    setContainerSaving(true);
    await apiContainers("POST", token, { body: { action: "create", ...containerForm } });
    setContainerForm({ name: "", container_number: "", origin: "Япония", comment: "" });
    setContainerFormOpen(false);
    setContainerSaving(false);
    await loadContainers();
  };

  const togglePickedCar = (id: number) => {
    setPickedCars((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const doAddToContainer = async () => {
    if (!addTargetContainer || pickedCars.length === 0) return;
    await apiContainers("POST", token, { body: { action: "add", container_id: addTargetContainer, car_ids: pickedCars } });
    setPickedCars([]);
    setAddTargetContainer("");
    await loadContainers();
  };

  const doRemoveFromContainer = async (containerId: number, carId: number) => {
    await apiContainers("POST", token, { body: { action: "remove", container_id: containerId, car_id: carId } });
    await loadContainers();
  };

  const setContainerStatus = async (containerId: number, status: string) => {
    await apiContainers("PUT", token, { body: { container_id: containerId, status } });
    await loadContainers();
  };

  const loadCars = async (orderId: number) => {
    setCarsLoading(true);
    const d = await apiCars("GET", token, { query: `order_id=${orderId}` });
    setCars(d.cars || []);
    setCarsLoading(false);
  };

  const loadTeardownCars = async () => {
    setTeardownCarsLoading(true);
    const d = await apiCars("GET", token, { query: "all=1" });
    const all: TeardownCar[] = d.cars || [];
    setTeardownCars(all.filter((c) => c.teardown && c.teardown.length > 0));
    setTeardownCarsLoading(false);
  };

  const openOrderCars = (o: Order) => {
    setSelectedOrder(o);
    setCarForm({ car_brand: "", car_model: "", car_year: "", vin: "", engine_model: "", engine_number: "", price: "", mileage: "", description: "", photos: [], teardown: [] });
    loadCars(o.id);
  };

  const changeOrderStatus = async (orderId: number, status: string) => {
    await apiOrders("PUT", token, { order_id: orderId, status });
    const d = await apiOrders("GET", token);
    setOrders(d.orders || []);
    if (selectedOrder?.id === orderId) {
      const upd = (d.orders || []).find((x: Order) => x.id === orderId);
      if (upd) setSelectedOrder(upd);
    }
  };

  const handlePhotoSelect = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => setCarForm((f) => ({ ...f, photos: [...f.photos, reader.result as string] }));
      reader.readAsDataURL(file);
    });
  };

  const doAddCar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setCarSaving(true);
    await apiCars("POST", token, { body: {
      order_id: selectedOrder.id,
      car_brand: carForm.car_brand, car_model: carForm.car_model,
      car_year: carForm.car_year ? parseInt(carForm.car_year) : null,
      vin: carForm.vin,
      engine_model: carForm.engine_model, engine_number: carForm.engine_number,
      price: carForm.price ? parseInt(carForm.price) : null,
      mileage: carForm.mileage ? parseInt(carForm.mileage) : null,
      description: carForm.description, photos: carForm.photos, teardown: carForm.teardown,
    } });
    setCarSaving(false);
    setCarForm({ car_brand: "", car_model: "", car_year: "", vin: "", engine_model: "", engine_number: "", price: "", mileage: "", description: "", photos: [], teardown: [] });
    loadCars(selectedOrder.id);
    const d = await apiOrders("GET", token);
    setOrders(d.orders || []);
  };

  const doDeleteCar = async (carId: number) => {
    await apiCars("DELETE", token, { query: `car_id=${carId}` });
    if (selectedOrder) loadCars(selectedOrder.id);
  };

  // Дописать идентификаторы машины (VIN, модель и номер ДВС) после добавления
  const startEditCar = (car: Car) => {
    setEditCarId(car.id);
    setEditCarForm({
      vin: car.vin || "",
      engine_model: car.engine_model || "",
      engine_number: car.engine_number || "",
    });
  };
  const cancelEditCar = () => { setEditCarId(null); setEditCarSaving(false); };
  const saveEditCar = async () => {
    if (!editCarId) return;
    setEditCarSaving(true);
    const d = await apiCars("PATCH", token, { body: {
      car_id: editCarId,
      vin: editCarForm.vin,
      engine_model: editCarForm.engine_model,
      engine_number: editCarForm.engine_number,
    } });
    setEditCarSaving(false);
    if (d.error) { alert(d.error); return; }
    const patch = <T extends Car>(c: T): T => c.id === editCarId
      ? { ...c, vin: d.vin ?? c.vin, engine_model: d.engine_model ?? c.engine_model, engine_number: d.engine_number ?? c.engine_number }
      : c;
    setCars((prev) => prev.map(patch));
    setTeardownCars((prev) => prev.map(patch));
    setEditCarId(null);
  };

  // Печать разборного листа: группы узлов, отметки клиента, количество
  const printTeardownSheet = (car: Car & { order_number?: string; client_name?: string; client_company?: string }) => {
    const esc = (v: unknown) => String(v ?? "").replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" } as Record<string, string>)[ch]);
    const items = car.teardown || [];
    const groups = groupTeardown(items);
    const mode = detectTeardownMode(items);
    const carTitle = [car.car_brand, car.car_model, car.car_year].filter(Boolean).join(" ");
    const dateStr = new Date().toLocaleDateString(lang === "ru" ? "ru-RU" : "en-GB");
    const totalQty = items.reduce((sum, it) => sum + (it.qty || 1), 0);
    const neededCount = items.filter((it) => it.needed).length;

    let n = 0;
    const body = groups.map((grp) => {
      const gQty = grp.items.reduce((sum, it) => sum + (it.qty || 1), 0);
      const gNeeded = grp.items.filter((it) => it.needed).length;
      const rows = grp.items.map((it) => {
        n += 1;
        return `<tr class="${it.needed ? "on" : ""}">
          <td class="c num">${n}</td>
          <td class="part">${esc(it.part)}</td>
          <td class="c qty">${it.qty || 1}</td>
          <td class="c mark">${it.needed ? '<span class="tick">✓</span>' : '<span class="box"></span>'}</td>
        </tr>`;
      }).join("");
      return `<tbody class="grp">
        <tr class="ghead">
          <td colspan="2"><span class="gname">${esc(grp.group)}</span></td>
          <td class="c gqty">${gQty}</td>
          <td class="c gcnt">${gNeeded}/${grp.items.length}</td>
        </tr>
        ${rows}
      </tbody>`;
    }).join("");

    const meta = [
      [t("td_print_car"), carTitle || "—"],
      ["VIN", car.vin || "—"],
      [t("td_print_mileage"), car.mileage ? car.mileage.toLocaleString("ru-RU") + " км" : "—"],
      [t("td_print_mode"), mode ? tdModeLabel(mode) : "—"],
      [t("td_print_client"), car.client_name || car.client_company || "—"],
      [t("td_print_order"), car.order_number ? String(car.order_number) : "—"],
    ].map(([k, v]) => `<div><b>${esc(k)}:</b> <span>${esc(v)}</span></div>`).join("");

    const html = `<!doctype html><html lang="${lang}"><head><meta charset="utf-8">
<title>${esc(t("td_print_title"))} — ${esc(carTitle)}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:"Segoe UI",Arial,sans-serif;color:#141a2e;background:#fff;padding:28px 32px;font-size:12.5px;line-height:1.45}
  .head{display:flex;justify-content:space-between;align-items:flex-start;gap:20px;padding-bottom:14px;border-bottom:3px solid #141a2e}
  .brand{display:flex;align-items:center;gap:13px}
  .brand img{height:50px;width:50px;object-fit:contain;border-radius:5px}
  .title{font-size:21px;font-weight:800;letter-spacing:.6px;text-transform:uppercase}
  .sub{color:#6b7280;font-size:11.5px;margin-top:3px}
  .stamp{text-align:right;font-size:11.5px;color:#6b7280;white-space:nowrap}
  .stamp .big{font-size:15px;font-weight:800;color:#141a2e;letter-spacing:.4px}
  .meta{display:grid;grid-template-columns:1fr 1fr 1fr;gap:7px 26px;margin:16px 0 6px}
  .meta div{font-size:12.5px}
  .meta b{color:#6b7280;font-weight:600}
  .sum{display:flex;gap:10px;margin:14px 0 4px;flex-wrap:wrap}
  .chip{border:1px solid #d7dbe4;border-radius:5px;padding:7px 13px;background:#f7f8fb}
  .chip .k{display:block;font-size:10px;text-transform:uppercase;letter-spacing:.6px;color:#6b7280;font-weight:700}
  .chip .v{font-size:16px;font-weight:800}
  table{width:100%;border-collapse:collapse;margin-top:12px}
  th{background:#141a2e;color:#fff;font-size:10.5px;text-transform:uppercase;letter-spacing:.7px;padding:8px 9px;text-align:left;font-weight:700}
  td{border-bottom:1px solid #e3e6ed;padding:6px 9px;vertical-align:middle}
  td.c,th.c{text-align:center}
  .num{color:#9aa1b0;font-size:11px;width:34px}
  .qty{width:62px;font-weight:700}
  .mark{width:92px}
  .ghead td{background:#eef0f5;border-top:2px solid #141a2e;border-bottom:1px solid #d7dbe4;padding:7px 9px}
  .gname{font-weight:800;text-transform:uppercase;letter-spacing:.5px;font-size:11.5px}
  .gqty,.gcnt{font-size:11px;color:#4b5565;font-weight:700}
  tr.on .part{font-weight:700}
  tr.on td{background:#fffaf0}
  .tick{display:inline-block;width:17px;height:17px;line-height:16px;border-radius:3px;background:#141a2e;color:#f0b542;font-weight:800;font-size:12px}
  .box{display:inline-block;width:15px;height:15px;border:1.5px solid #b6bcc9;border-radius:3px}
  tfoot td{background:#141a2e;color:#fff;font-weight:800;padding:9px;border:0}
  .sign{margin-top:30px;display:flex;justify-content:space-between;gap:36px;color:#6b7280;font-size:11.5px}
  .sign div{flex:1}
  .line{margin-top:26px;border-top:1px solid #9aa1b0;padding-top:5px}
  .empty{padding:26px;text-align:center;color:#6b7280}
  @page{margin:12mm}
  @media print{body{padding:0}.grp{break-inside:auto}tr{break-inside:avoid}.ghead{break-after:avoid}}
</style></head><body>
<div class="head">
  <div class="brand">
    <img src="${LOGO}" alt="" />
    <div>
      <div class="title">${esc(t("td_print_title"))}</div>
      <div class="sub">${esc(COMPANY_NAME)}</div>
    </div>
  </div>
  <div class="stamp">
    <div class="big">${esc(carTitle || "—")}</div>
    <div>${esc(t("td_print_date"))}: ${esc(dateStr)}</div>
    ${car.order_number ? `<div>${esc(t("td_print_order"))}: ${esc(car.order_number)}</div>` : ""}
  </div>
</div>
<div class="meta">${meta}</div>
<div class="sum">
  <div class="chip"><span class="k">${esc(t("td_print_positions"))}</span><span class="v">${items.length}</span></div>
  <div class="chip"><span class="k">${esc(t("td_print_qty"))}</span><span class="v">${totalQty}</span></div>
  <div class="chip"><span class="k">${esc(t("td_print_picked_only"))}</span><span class="v">${neededCount}</span></div>
</div>
${items.length === 0 ? `<div class="empty">${esc(t("td_print_empty"))}</div>` : `
<table>
  <thead><tr>
    <th class="c">№</th>
    <th>${esc(t("td_print_part"))}</th>
    <th class="c">${esc(t("td_print_qty"))}</th>
    <th class="c">${esc(t("td_print_needed"))}</th>
  </tr></thead>
  ${body}
  <tfoot><tr>
    <td colspan="2" style="text-align:right">${esc(t("td_print_total"))}:</td>
    <td class="c">${totalQty}</td>
    <td class="c">${neededCount}/${items.length}</td>
  </tr></tfoot>
</table>`}
<div class="sign">
  <div class="line">${esc(t("td_print_sign_staff"))}</div>
  <div class="line">${esc(t("td_print_sign_client"))}</div>
</div>
<script>window.onload=function(){setTimeout(function(){window.print();},350);};</script>
</body></html>`;

    const w = window.open("", "_blank");
    if (!w) { alert(t("pdf_popup_blocked")); return; }
    w.document.open();
    w.document.write(html);
    w.document.close();
  };

  // Экспорт разборного листа в PDF (бланк packing list) через печать браузера
  const exportPackingList = (car: Car) => {
    const esc = (s: string) => (s || "").replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" } as Record<string, string>)[ch]);
    const carTitle = [car.car_brand, car.car_model, car.car_year].filter(Boolean).join(" ");
    const dateStr = new Date().toLocaleDateString("ru-RU");
    const items = (car.teardown || []);
    const tdMode = detectTeardownMode(items);
    let totalQty = 0;
    let idx = 0;
    const rows = items.map((it) => {
      const sp = splitTd(it.name);
      const q = it.qty || 1;
      totalQty += q;
      idx += 1;
      return `<tr>
        <td class="c">${idx}</td>
        <td>${esc(sp.group)}</td>
        <td>${esc(sp.part)}</td>
        <td class="c">${q}</td>
        <td class="c">${it.needed ? "✓" : ""}</td>
      </tr>`;
    }).join("");

    const html = `<!doctype html><html lang="ru"><head><meta charset="utf-8">
      <title>Packing List ${esc(carTitle)}</title>
      <style>
        * { box-sizing: border-box; }
        body { font-family: Arial, sans-serif; color: #1a2238; margin: 32px; font-size: 13px; }
        .head { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #1a2238; padding-bottom: 14px; margin-bottom: 18px; }
        .title { font-size: 24px; font-weight: 800; letter-spacing: 1px; }
        .sub { color: #6b7280; font-size: 12px; margin-top: 4px; }
        .meta { margin: 16px 0; display: grid; grid-template-columns: 1fr 1fr; gap: 6px 24px; }
        .meta div { font-size: 13px; }
        .meta b { color: #6b7280; font-weight: 600; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #c9ced8; padding: 7px 9px; text-align: left; }
        th { background: #1a2238; color: #fff; font-size: 12px; text-transform: uppercase; letter-spacing: .5px; }
        td.c, th.c { text-align: center; }
        tfoot td { font-weight: 800; background: #f1f3f7; }
        .foot { margin-top: 28px; display: flex; justify-content: space-between; color: #6b7280; font-size: 12px; }
        @media print { body { margin: 12mm; } }
      </style></head><body>
      <div class="head">
        <div style="display:flex;align-items:center;gap:14px">
          <img src="${LOGO}" alt="" style="height:52px;width:auto;border-radius:4px" />
          <div><div class="title">PACKING LIST</div><div class="sub">${esc(COMPANY_NAME)} · Упаковочный / разборный лист</div></div>
        </div>
        <div style="text-align:right"><div class="sub">Дата: ${dateStr}</div><div class="sub">№ ${esc(car.order_number ? String(car.order_number) : String(car.id))}</div></div>
      </div>
      <div class="meta">
        <div><b>Автомобиль:</b> ${esc(carTitle) || "—"}</div>
        <div><b>VIN:</b> ${esc(car.vin || "—")}</div>
        <div><b>Год:</b> ${car.car_year || "—"}</div>
        <div><b>Пробег:</b> ${car.mileage ? car.mileage.toLocaleString("ru-RU") + " км" : "—"}</div>
        <div><b>Тип разбора:</b> ${esc(tdMode ? tdModeLabel(tdMode) : "—")}</div>
      </div>
      <table>
        <thead><tr><th class="c">№</th><th>Группа</th><th>Наименование детали</th><th class="c">Кол-во</th><th class="c">Нужно клиенту</th></tr></thead>
        <tbody>${rows || `<tr><td colspan="5" class="c">Список пуст</td></tr>`}</tbody>
        <tfoot><tr><td colspan="3" style="text-align:right">ИТОГО позиций / штук:</td><td class="c">${items.length} / ${totalQty}</td><td></td></tr></tfoot>
      </table>
      <div class="foot"><div>Подпись отправителя: __________________</div><div>Подпись получателя: __________________</div></div>
      <script>window.onload = function(){ setTimeout(function(){ window.print(); }, 300); };</script>
      </body></html>`;

    const w = window.open("", "_blank");
    if (!w) { alert(t("pdf_popup_blocked")); return; }
    w.document.open();
    w.document.write(html);
    w.document.close();
  };

  // Экспорт разборного листа в XLSX
  const exportPackingListXlsx = async (car: Car) => {
    const XLSX = await import("xlsx");
    const carTitle = [car.car_brand, car.car_model, car.car_year].filter(Boolean).join(" ");
    const items = car.teardown || [];
    const tdMode = detectTeardownMode(items);
    const dateStr = new Date().toLocaleDateString("ru-RU");

    const head: (string | number)[][] = [
      ["PACKING LIST", "", "", "", ""],
      [COMPANY_NAME + " · Упаковочный / разборный лист", "", "", "", ""],
      ["", "", "", "", ""],
      ["Дата:", dateStr, "", "Заявка №:", car.order_number ? String(car.order_number) : String(car.id)],
      ["Автомобиль:", carTitle || "—", "", "VIN:", car.vin || "—"],
      ["Год:", car.car_year || "—", "", "Пробег:", car.mileage ? `${car.mileage.toLocaleString("ru-RU")} км` : "—"],
      ["Тип разбора:", tdMode ? tdModeLabel(tdMode) : "—", "", "", ""],
      ["", "", "", "", ""],
      ["№", "Группа", "Наименование детали", "Кол-во", "Нужно клиенту"],
    ];

    let totalQty = 0;
    const rows = items.map((it, i) => {
      const sp = splitTd(it.name);
      const q = it.qty || 1;
      totalQty += q;
      return [i + 1, sp.group, sp.part, q, it.needed ? "✓" : ""];
    });

    const foot: (string | number)[][] = [
      ["", "", "ИТОГО позиций / штук:", `${items.length} / ${totalQty}`, ""],
    ];

    const ws = XLSX.utils.aoa_to_sheet([...head, ...rows, ...foot]);
    ws["!cols"] = [{ wch: 6 }, { wch: 26 }, { wch: 38 }, { wch: 10 }, { wch: 16 }];
    ws["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 4 } },
    ];
    const headerRow = head.length;
    ws["!autofilter"] = { ref: `A${headerRow}:E${headerRow + Math.max(rows.length, 1)}` };

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Разборный лист");
    const safe = (carTitle || "car").replace(/[^\wа-яА-Я0-9-]+/g, "_");
    await writeXlsxWithFreeze(wb, `packing_list_${safe}.xlsx`, [{ sheetIndex: 0, rows: headerRow }]);
  };

  // Упаковочный лист в формате присланного шаблона: список отмеченных деталей + итог
  const exportPackingListTemplateXlsx = async (car: Car) => {
    const XLSX = await import("xlsx");
    const picked = (car.teardown || []).filter((x) => x.needed);
    if (picked.length === 0) { alert(t("pl_nothing_picked")); return; }

    const rows: (string | number)[][] = [];
    for (const grp of groupTeardown(picked)) {
      for (const it of grp.items) {
        rows.push([it.qty > 1 ? `${it.part} × ${it.qty}` : it.part, ""]);
      }
    }
    const totalQty = picked.reduce((s, x) => s + (x.qty || 1), 0);
    rows.push(["Общее количество деталей", totalQty]);

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws["!cols"] = [{ wch: 46 }, { wch: 10 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Упаковочный лист RU");
    const carTitle = [car.car_brand, car.car_model, car.car_year].filter(Boolean).join(" ");
    const safe = (carTitle || "car").replace(/[^\wа-яА-Я0-9-]+/g, "_");
    XLSX.writeFile(wb, `packing_list_RU_${safe}.xlsx`);
  };

  // Строки документа по номерным агрегатам (ДВС) — только заявки в статусе «В разбор»
  const engineDocRows = (list: { car_brand: string; car_model: string; car_year: number; vin?: string; engine_model?: string; engine_number?: string; order_number?: string; client_name?: string; client_company?: string }[]) =>
    list.map((c, i) => [
      i + 1,
      [c.car_brand, c.car_model].filter(Boolean).join(" ") || "—",
      c.car_year || "—",
      c.vin || "—",
      c.engine_model || "—",
      c.engine_number || "—",
      c.order_number || "—",
      c.client_name || c.client_company || "—",
    ]);
  const ENGINE_DOC_HEAD = ["№", "Модель автомобиля", "Год выпуска", "VIN номер", "Модель ДВС", "Номер ДВС", "Заявка", "Клиент"];
  const ENGINE_DOC_COLS = [{ wch: 6 }, { wch: 28 }, { wch: 13 }, { wch: 22 }, { wch: 18 }, { wch: 22 }, { wch: 14 }, { wch: 24 }];

  // Отдельный документ по номерным агрегатам из заявок «В разбор»
  const exportEngineDocXlsx = async () => {
    const XLSX = await import("xlsx");
    const list = teardownCars.filter((c) => c.order_status === "teardown");
    if (list.length === 0) { alert(t("eng_doc_empty")); return; }
    const dateStr = new Date().toLocaleDateString("ru-RU");

    const head: (string | number)[][] = [
      ["НОМЕРНЫЕ АГРЕГАТЫ · ДВС"],
      [`${COMPANY_NAME} · Сведения о номерных агрегатах`],
      [],
      ["Дата:", dateStr, "", "Статус заявок:", STATUS_LABEL[lang].teardown],
      ["Машинокомплектов:", list.length],
      [],
      ENGINE_DOC_HEAD,
    ];
    const rows = engineDocRows(list);
    const aoa = [...head, ...rows, [], ["", "ИТОГО агрегатов:", list.length]];

    const ws = XLSX.utils.aoa_to_sheet(aoa);
    ws["!cols"] = ENGINE_DOC_COLS;
    ws["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } },
    ];
    const hr = head.length;
    ws["!autofilter"] = { ref: `A${hr}:H${hr + rows.length}` };

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Номерные агрегаты");
    await writeXlsxWithFreeze(wb, `engine_units_${dateStr.replace(/\./g, "-")}.xlsx`, [{ sheetIndex: 0, rows: hr }]);
  };

  // ── Сопоставление разборных листов контейнера: суммирование деталей ──
  // Складывает одинаковые узлы всех машинокомплектов: сколько всего и сколько нужно клиенту
  const containerPartsSummary = (cars: { teardown?: TeardownItem[] }[]) => {
    const agg = new Map<string, { group: string; part: string; qty: number; needed: number; cars: number }>();
    for (const c of cars) {
      for (const it of (c.teardown || [])) {
        const q = it.qty || 1;
        const row = agg.get(it.name);
        if (row) {
          row.qty += q;
          row.cars += 1;
          if (it.needed) row.needed += q;
        } else {
          const sp = splitTd(it.name);
          agg.set(it.name, { group: sp.group, part: sp.part, qty: q, needed: it.needed ? q : 0, cars: 1 });
        }
      }
    }
    const rows = Array.from(agg.values()).sort(
      (a, b) => a.group.localeCompare(b.group, "ru") || a.part.localeCompare(b.part, "ru")
    );
    const groups: { group: string; rows: typeof rows; qty: number; needed: number }[] = [];
    for (const r of rows) {
      let g = groups.find((x) => x.group === r.group);
      if (!g) { g = { group: r.group, rows: [], qty: 0, needed: 0 }; groups.push(g); }
      g.rows.push(r);
      g.qty += r.qty;
      g.needed += r.needed;
    }
    return {
      rows, groups,
      positions: rows.length,
      totalQty: rows.reduce((s, r) => s + r.qty, 0),
      neededQty: rows.reduce((s, r) => s + r.needed, 0),
      neededPositions: rows.filter((r) => r.needed > 0).length,
    };
  };
  const [openSummaryId, setOpenSummaryId] = useState<number | null>(null);
  const toggleContainerSummary = (id: number) => setOpenSummaryId((v) => (v === id ? null : id));

  // Экспорт упаковочного листа контейнера в XLSX (машинокомплекты + VIN + детали)
  const exportContainerXlsx = async (ct: Container) => {
    const XLSX = await import("xlsx");
    const dateStr = new Date().toLocaleDateString("ru-RU");
    const wb = XLSX.utils.book_new();

    // ── Лист 1: Контейнер и машинокомплекты ──
    const carRows = ct.cars.map((c, i) => [
      i + 1,
      [c.car_brand, c.car_model, c.car_year].filter(Boolean).join(" ") || "—",
      c.vin || "—",
      c.order_number || "—",
      c.client_name || "—",
      c.client_company || "—",
      (c.teardown || []).length,
    ]);
    const s1: (string | number)[][] = [
      ["CONTAINER PACKING LIST"],
      [`${COMPANY_NAME} · Упаковочный лист контейнера`],
      [],
      ["Дата:", dateStr, "", "Контейнер:", ct.name || "—"],
      ["Номер контейнера:", ct.container_number || "—", "", "Направление:", ORIGIN_LABEL[lang][ct.origin] || ct.origin || "—"],
      ["Статус:", ct.status_label || "—", "", "Машинокомплектов:", ct.cars.length],
      [],
      ["МАШИНОКОМПЛЕКТЫ В КОНТЕЙНЕРЕ"],
      ["№", "Машинокомплект", "VIN", "Заявка", "Клиент", "Компания", "Позиций"],
      ...(carRows.length ? carRows : [["—", "Контейнер пуст", "", "", "", "", ""]]),
      [],
      ["", "", "", "", "", "ИТОГО:", ct.cars.length],
    ];
    const ws1 = XLSX.utils.aoa_to_sheet(s1);
    ws1["!cols"] = [{ wch: 6 }, { wch: 30 }, { wch: 22 }, { wch: 14 }, { wch: 24 }, { wch: 22 }, { wch: 10 }];
    ws1["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } },
      { s: { r: 7, c: 0 }, e: { r: 7, c: 6 } },
    ];
    XLSX.utils.book_append_sheet(wb, ws1, "Контейнер");

    // ── Лист 2: Сводный список запчастей (сопоставление разборных листов) ──
    const sum = containerPartsSummary(ct.cars);
    const partRows = sum.rows.map((p, i) => [i + 1, p.group, p.part, p.qty, p.needed, p.cars]);
    const s2: (string | number)[][] = [
      ["№", "Группа", "Наименование детали", "Кол-во (всего)", "Нужно клиенту", "В машинах"],
      ...(partRows.length ? partRows : [["—", "Нет деталей в разборных листах", "", "", "", ""]]),
      [],
      ["", "ИТОГО позиций:", sum.positions, sum.totalQty, sum.neededQty, ct.cars.length],
    ];
    const ws2 = XLSX.utils.aoa_to_sheet(s2);
    ws2["!cols"] = [{ wch: 6 }, { wch: 28 }, { wch: 42 }, { wch: 16 }, { wch: 15 }, { wch: 11 }];
    const s2DataRows = partRows.length || 1;
    ws2["!autofilter"] = { ref: `A1:F${s2DataRows + 1}` };
    XLSX.utils.book_append_sheet(wb, ws2, "Сводный список");

    // ── Лист 3: Детали по каждому авто ──
    const s3: (string | number)[][] = [
      ["Машинокомплект", "VIN", "Заявка", "Тип разбора", "Группа", "Наименование детали", "Кол-во", "Нужно клиенту"],
    ];
    for (const c of ct.cars) {
      const title = [c.car_brand, c.car_model, c.car_year].filter(Boolean).join(" ") || "—";
      const items = c.teardown || [];
      const mode = detectTeardownMode(items);
      const modeLabel = mode ? tdModeLabel(mode) : "—";
      if (items.length === 0) {
        s3.push([title, c.vin || "—", c.order_number || "—", modeLabel, "—", "Разборный лист пуст", "", ""]);
        continue;
      }
      for (const it of items) {
        const sp = splitTd(it.name);
        s3.push([title, c.vin || "—", c.order_number || "—", modeLabel, sp.group, sp.part, it.qty || 1, it.needed ? "✓" : ""]);
      }
    }
    const ws3 = XLSX.utils.aoa_to_sheet(s3);
    ws3["!cols"] = [{ wch: 28 }, { wch: 20 }, { wch: 12 }, { wch: 18 }, { wch: 26 }, { wch: 38 }, { wch: 9 }, { wch: 14 }];
    ws3["!autofilter"] = { ref: `A1:H${Math.max(s3.length, 2)}` };
    XLSX.utils.book_append_sheet(wb, ws3, "Детали по авто");

    // ── Лист 4: Номерные агрегаты (ДВС) — машины из заявок «В разбор» ──
    const engCars = ct.cars.filter((c) => c.status === "teardown");
    const engHead: (string | number)[][] = [
      ["НОМЕРНЫЕ АГРЕГАТЫ · ДВС"],
      [`${COMPANY_NAME} · Сведения о номерных агрегатах`],
      [],
      ["Дата:", dateStr, "", "Контейнер:", ct.container_number || ct.name || "—"],
      ["Статус заявок:", STATUS_LABEL[lang].teardown, "", "Агрегатов:", engCars.length],
      [],
      ENGINE_DOC_HEAD,
    ];
    const engRows = engineDocRows(engCars);
    const s4 = [
      ...engHead,
      ...(engRows.length ? engRows : [["—", "Нет машин в статусе «В разбор»", "", "", "", "", "", ""]]),
      [],
      ["", "ИТОГО агрегатов:", engCars.length],
    ];
    const ws4 = XLSX.utils.aoa_to_sheet(s4);
    ws4["!cols"] = ENGINE_DOC_COLS;
    ws4["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } },
    ];
    const engHr = engHead.length;
    ws4["!autofilter"] = { ref: `A${engHr}:H${engHr + Math.max(engRows.length, 1)}` };
    XLSX.utils.book_append_sheet(wb, ws4, "Номерные агрегаты");

    const safe = (ct.container_number || ct.name || "container").replace(/[^\wа-яА-Я0-9-]+/g, "_");
    await writeXlsxWithFreeze(wb, `container_packing_list_${safe}.xlsx`, [
      { sheetIndex: 1, rows: 1 },
      { sheetIndex: 2, rows: 1 },
      { sheetIndex: 3, rows: engHr },
    ]);
  };

  // Экспорт упаковочного листа контейнера в PDF (все машинокомплекты + VIN)
  const exportContainerPdf = (ct: Container) => {
    const esc = (s: string) => (s || "").replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" } as Record<string, string>)[ch]);
    const dateStr = new Date().toLocaleDateString("ru-RU");

    // Машинокомплекты в контейнере
    const carRows = ct.cars.map((c, i) => `<tr>
        <td class="c">${i + 1}</td>
        <td>${esc([c.car_brand, c.car_model, c.car_year].filter(Boolean).join(" ")) || "—"}</td>
        <td class="mono">${esc(c.vin || "—")}</td>
        <td>${esc(c.order_number || "—")}</td>
      </tr>`).join("");

    // Сводный список запчастей по всем машинам контейнера (суммарное количество по детали)
    const agg = new Map<string, { group: string; part: string; qty: number }>();
    for (const c of ct.cars) {
      for (const it of (c.teardown || [])) {
        const sp = splitTd(it.name);
        const q = it.qty || 1;
        const prev = agg.get(it.name);
        if (prev) prev.qty += q;
        else agg.set(it.name, { group: sp.group, part: sp.part, qty: q });
      }
    }
    const parts = Array.from(agg.values()).sort((a, b) => a.group.localeCompare(b.group, "ru") || a.part.localeCompare(b.part, "ru"));
    let totalParts = 0;
    const partRows = parts.map((p, i) => {
      totalParts += p.qty;
      return `<tr>
        <td class="c">${i + 1}</td>
        <td>${esc(p.group)}</td>
        <td>${esc(p.part)}</td>
        <td class="c">${p.qty}</td>
      </tr>`;
    }).join("");

    const html = `<!doctype html><html lang="ru"><head><meta charset="utf-8">
      <title>Container ${esc(ct.name)}</title>
      <style>
        * { box-sizing: border-box; }
        body { font-family: Arial, sans-serif; color: #1a2238; margin: 32px; font-size: 13px; }
        .head { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #1a2238; padding-bottom: 14px; margin-bottom: 18px; }
        .title { font-size: 24px; font-weight: 800; letter-spacing: 1px; }
        .sub { color: #6b7280; font-size: 12px; margin-top: 4px; }
        .meta { margin: 16px 0; display: grid; grid-template-columns: 1fr 1fr; gap: 6px 24px; }
        .meta div { font-size: 13px; }
        .meta b { color: #6b7280; font-weight: 600; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #c9ced8; padding: 7px 9px; text-align: left; }
        th { background: #1a2238; color: #fff; font-size: 12px; text-transform: uppercase; letter-spacing: .5px; }
        td.c, th.c { text-align: center; }
        td.mono { font-family: 'Courier New', monospace; letter-spacing: .5px; }
        tfoot td { font-weight: 800; background: #f1f3f7; }
        .foot { margin-top: 28px; display: flex; justify-content: space-between; color: #6b7280; font-size: 12px; }
        .sect { font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: .5px; margin: 26px 0 4px; }
        @media print { body { margin: 12mm; } }
      </style></head><body>
      <div class="head">
        <div style="display:flex;align-items:center;gap:14px">
          <img src="${LOGO}" alt="" style="height:52px;width:auto;border-radius:4px" />
          <div><div class="title">CONTAINER PACKING LIST</div><div class="sub">${esc(COMPANY_NAME)} · Упаковочный лист контейнера</div></div>
        </div>
        <div style="text-align:right"><div class="sub">Дата: ${dateStr}</div></div>
      </div>
      <div class="meta">
        <div><b>Контейнер:</b> ${esc(ct.name) || "—"}</div>
        <div><b>Номер контейнера:</b> ${esc(ct.container_number || "—")}</div>
        <div><b>Направление:</b> ${esc(ORIGIN_LABEL[lang][ct.origin] || ct.origin || "—")}</div>
        <div><b>Статус:</b> ${esc(ct.status_label || "—")}</div>
      </div>

      <div class="sect">Сводный список запчастей</div>
      <table>
        <thead><tr><th class="c">№</th><th>Группа</th><th>Наименование детали</th><th class="c">Кол-во (всего)</th></tr></thead>
        <tbody>${partRows || `<tr><td colspan="4" class="c">Нет деталей в разборных листах</td></tr>`}</tbody>
        <tfoot><tr><td colspan="2" style="text-align:right">ИТОГО позиций / деталей:</td><td class="c">${parts.length}</td><td class="c">${totalParts}</td></tr></tfoot>
      </table>

      <div class="sect">Машинокомплекты в контейнере</div>
      <table>
        <thead><tr><th class="c">№</th><th>Машинокомплект</th><th>VIN</th><th>Заявка</th></tr></thead>
        <tbody>${carRows || `<tr><td colspan="4" class="c">Контейнер пуст</td></tr>`}</tbody>
        <tfoot><tr><td colspan="3" style="text-align:right">ИТОГО машинокомплектов:</td><td class="c">${ct.cars.length}</td></tr></tfoot>
      </table>
      <div class="foot"><div>Подпись отправителя: __________________</div><div>Подпись получателя: __________________</div></div>
      <script>window.onload = function(){ setTimeout(function(){ window.print(); }, 300); };</script>
      </body></html>`;

    const w = window.open("", "_blank");
    if (!w) { alert(t("pdf_popup_blocked")); return; }
    w.document.open();
    w.document.write(html);
    w.document.close();
  };

  // клиент: раскрытие авто по заявке
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [orderCars, setOrderCars] = useState<Record<number, Car[]>>({});
  const toggleOrderCars = async (orderId: number) => {
    if (expandedOrder === orderId) { setExpandedOrder(null); return; }
    setExpandedOrder(orderId);
    if (!orderCars[orderId]) {
      const d = await apiCars("GET", token, { query: `order_id=${orderId}` });
      setOrderCars((prev) => ({ ...prev, [orderId]: d.cars || [] }));
    }
  };

  // ── fill profile form from user ──
  useEffect(() => {
    if (user) {
      setProfileForm({ full_name: user.full_name, phone: user.phone, company: user.company, inn: user.inn });
      setCabinetTab(user.role === "staff" ? "clients" : "orders");
    }
  }, [user]);

  const nav = (p: Page) => { setPage(p); setMenuOpen(false); setAuthError(""); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const openOrigin = (id: string) => { setOriginId(id); setActiveAuction(null); setPage("origin"); setMenuOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const doLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setAuthLoading(true); setAuthError("");
    const data = await apiAuth("login", loginForm);
    setAuthLoading(false);
    if (data.token) {
      setToken(data.token); localStorage.setItem("pc_token", data.token);
      const me = await apiAuth("me", {}, data.token);
      if (me.user) setUser(me.user);
      nav("cabinet");
    } else setAuthError(data.error || t("err_login"));
  };

  const doForgot = async (e: React.FormEvent) => {
    e.preventDefault(); setAuthLoading(true); setAuthError(""); setForgotMsg("");
    const data = await apiAuth("forgot_password", { email: forgotForm.email });
    setAuthLoading(false);
    if (data.error) { setAuthError(data.error); return; }
    setForgotStep("reset");
    setForgotMsg(data.message || "");
  };

  const doReset = async (e: React.FormEvent) => {
    e.preventDefault(); setAuthLoading(true); setAuthError(""); setForgotMsg("");
    const data = await apiAuth("reset_password", forgotForm);
    setAuthLoading(false);
    if (data.error) { setAuthError(data.error); return; }
    setForgotStep("email");
    setForgotForm({ email: "", code: "", password: "" });
    setLoginForm({ email: "", password: "" });
    nav("login");
    setAuthError("");
    setForgotMsg("");
    alert(data.message || "Пароль изменён");
  };

  const doStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setAuthLoading(true); setAuthError("");
    const data = await apiAuth("login", loginForm);
    if (!data.token) { setAuthLoading(false); setAuthError(data.error || t("err_login")); return; }
    const me = await apiAuth("me", {}, data.token);
    setAuthLoading(false);
    if (me.user && me.user.role === "staff") {
      setToken(data.token); localStorage.setItem("pc_token", data.token);
      setUser(me.user);
      window.location.hash = "";
      nav("cabinet");
    } else {
      await apiAuth("logout", {}, data.token);
      setAuthError(t("err_not_staff"));
    }
  };

  const doSendCode = async (e: React.FormEvent) => {
    e.preventDefault(); setCodeSending(true); setAuthError("");
    if ((regForm.password || "").length < 6) { setAuthError(t("err_pwd_min")); setCodeSending(false); return; }
    const data = await apiAuth("send_code", { phone: regForm.phone });
    setCodeSending(false);
    if (data.message) { setRegStep("code"); }
    else setAuthError(data.error || t("err_send_code"));
  };

  const doRegister = async (e: React.FormEvent) => {
    e.preventDefault(); setAuthLoading(true); setAuthError("");
    const data = await apiAuth("register", regForm);
    setAuthLoading(false);
    if (data.token) {
      setToken(data.token); localStorage.setItem("pc_token", data.token);
      const me = await apiAuth("me", {}, data.token);
      if (me.user) setUser(me.user);
      setRegStep("form");
      nav("cabinet");
    } else setAuthError(data.error || t("err_register"));
  };

  const resetRegStep = () => { setRegStep("form"); setRegForm({ ...regForm, code: "" }); setAuthError(""); };

  const doLogout = async () => {
    await apiAuth("logout", {}, token);
    setToken(""); setUser(null); localStorage.removeItem("pc_token"); nav("home");
  };

  const doSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await apiAuth("update_profile", profileForm, token);
    const me = await apiAuth("me", {}, token);
    if (me.user) setUser(me.user);
    setProfileSaved(true); setTimeout(() => setProfileSaved(false), 3000);
  };

  const doNewOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    await apiOrders("POST", token, { ...newOrderForm, car_year: parseInt(newOrderForm.car_year) || null, quantity: parseInt(newOrderForm.quantity), budget: parseInt(newOrderForm.budget) || null });
    setNewOrderSent(true);
    setNewOrderForm({ car_brand: "", car_model: "", car_year: "", quantity: "1", budget: "", origin: "Япония", comment: "" });
    setTimeout(() => { setNewOrderSent(false); setCabinetTab("orders"); }, 2000);
  };

  const loadClientsList = async () => {
    const d = await apiAuth("list_users", {}, token);
    const clients = (d.users || []).filter((u: ManagedUser) => u.role !== "staff");
    setClientsList(clients.map((u: ManagedUser) => ({ id: u.id, full_name: u.full_name, email: u.email, company: u.company })));
  };

  const openStaffClientForm = () => {
    setStaffClientOpen(true);
    setStaffOrderOpen(false);
    setStaffClientError("");
    setStaffClientForm({ full_name: "", email: "", phone: "", company: "", inn: "", password: "" });
  };

  const doStaffCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setStaffClientError("");
    setStaffClientSaving(true);
    const d = await apiAuth("create_client", staffClientForm, token);
    setStaffClientSaving(false);
    if (d.error) { setStaffClientError(d.error); return; }
    await loadClientsList();
    setStaffClientOpen(false);
    setStaffClientDone(true);
    setTimeout(() => setStaffClientDone(false), 3000);
    if (d.id) {
      setStaffOrderForm({ client_id: String(d.id), car_brand: "", car_model: "", car_year: "", quantity: "1", budget: "", origin: "Япония", comment: "" });
      setStaffOrderOpen(true);
    }
  };

  const openStaffOrderForm = () => {
    setStaffOrderOpen(true);
    setStaffOrderForm({ client_id: "", car_brand: "", car_model: "", car_year: "", quantity: "1", budget: "", origin: "Япония", comment: "" });
    if (clientsList.length === 0) loadClientsList();
  };

  const doStaffCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffOrderForm.client_id) return;
    setStaffOrderSaving(true);
    await apiOrders("POST", token, {
      client_id: parseInt(staffOrderForm.client_id),
      car_brand: staffOrderForm.car_brand, car_model: staffOrderForm.car_model,
      car_year: parseInt(staffOrderForm.car_year) || null,
      quantity: parseInt(staffOrderForm.quantity), budget: parseInt(staffOrderForm.budget) || null,
      origin: staffOrderForm.origin, comment: staffOrderForm.comment,
    });
    const d = await apiOrders("GET", token);
    setOrders(d.orders || []);
    setStaffOrderSaving(false);
    setStaffOrderOpen(false);
  };

  const navItems = [
    { id: "home" as Page, label: t("nav_home"), icon: "Home" },
    { id: "directions" as Page, label: t("nav_directions"), icon: "Globe" },
    { id: "services" as Page, label: t("nav_services"), icon: "Wrench" },
    { id: "how" as Page, label: t("nav_how"), icon: "Workflow" },
    { id: "contacts" as Page, label: t("nav_contacts"), icon: "Mail" },
  ];

  const inputCls = "w-full bg-[hsl(222_46%_8%/0.7)] border border-[hsl(var(--gold)/0.18)] px-4 py-3 text-sm text-[hsl(var(--navy))] placeholder-[hsl(var(--navy)/0.4)] focus:outline-none focus:border-[hsl(var(--gold)/0.55)] focus:ring-1 focus:ring-[hsl(var(--gold)/0.3)] transition-colors rounded-sm";

  return {
    activeAuction,
    addCustomPart,
    addTargetContainer,
    applyTeardownPreset,
    authError,
    authLoading,
    availableCars,
    cabinetTab,
    carForm,
    carSaving,
    cars,
    carsLoading,
    changeLang,
    changeOrderStatus,
    clearTeardown,
    clientsList,
    codeSending,
    contactForm,
    contactSent,
    containerForm,
    containerFormOpen,
    containerSaving,
    containers,
    containersLoading,
    dealDeletingId,
    dealForm,
    dealSaving,
    deleteDeal,
    doAddCar,
    doAddToContainer,
    doCreateContainer,
    doDeleteCar,
    doForgot,
    doLogin,
    doLogout,
    doNewOrder,
    doRegister,
    doRemoveFromContainer,
    doReset,
    doSaveProfile,
    doSendCode,
    doStaffCreateClient,
    doStaffCreateOrder,
    doStaffLogin,
    editDeal,
    emptyDeal,
    expandedOrder,
    exportContainerPdf,
    exportContainerXlsx,
    exportPackingList,
    exportPackingListXlsx,
    exportPackingListTemplateXlsx,
    exportEngineDocXlsx,
    containerPartsSummary,
    tdMissingOnly,
    toggleTdMissingOnly,
    isMissingIds,
    openSummaryId,
    toggleContainerSummary,
    editCarId,
    editCarForm,
    editCarSaving,
    setEditCarForm,
    startEditCar,
    cancelEditCar,
    saveEditCar,
    printTeardownSheet,
    forgotForm,
    forgotMsg,
    forgotStep,
    handlePhotoSelect,
    hotDeals,
    hotDealsLoading,
    inputCls,
    isStaff,
    lang,
    loadCars,
    loadClientsList,
    loadContainers,
    loadHotDeals,
    loadStaffUsers,
    loadTeardownCars,
    loginForm,
    menuOpen,
    nav,
    navItems,
    newOrderForm,
    newOrderSent,
    openOrderCars,
    openOrigin,
    openStaffClientForm,
    openStaffOrderForm,
    orderCars,
    orders,
    ordersLoading,
    originId,
    page,
    pickDealPhoto,
    pickedCars,
    profileForm,
    profileSaved,
    regForm,
    regStep,
    renderTdBadge,
    resetRegStep,
    roleSavingId,
    saveDeal,
    savingTeardown,
    selectFullTeardown,
    selectHalfcutTeardown,
    selectNoskatTeardown,
    selectedOrder,
    setActiveAuction,
    setAddTargetContainer,
    setAuthError,
    setAuthLoading,
    setAvailableCars,
    setCabinetTab,
    setCarForm,
    setCarSaving,
    setCars,
    setCarsLoading,
    setClientsList,
    setCodeSending,
    setContactForm,
    setContactSent,
    setContainerForm,
    setContainerFormOpen,
    setContainerSaving,
    setContainerStatus,
    setContainers,
    setContainersLoading,
    setDealDeletingId,
    setDealForm,
    setDealSaving,
    setExpandedOrder,
    setForgotForm,
    setForgotMsg,
    setForgotStep,
    setHotDeals,
    setHotDealsLoading,
    setLang,
    setLoginForm,
    setMenuOpen,
    setNewOrderForm,
    setNewOrderSent,
    setOrderCars,
    setOrders,
    setOrdersLoading,
    setOriginId,
    setPage,
    setPartQty,
    setPickedCars,
    setProfileForm,
    setProfileSaved,
    setRegForm,
    setRegStep,
    setRoleSavingId,
    setSavingTeardown,
    setSelectedOrder,
    setStaffClientDone,
    setStaffClientError,
    setStaffClientForm,
    setStaffClientOpen,
    setStaffClientSaving,
    setStaffOrderForm,
    setStaffOrderOpen,
    setStaffOrderSaving,
    setStaffUsers,
    setStaffUsersLoading,
    setTdFilter,
    setTeardownCars,
    setTeardownCarsLoading,
    setTeardownInput,
    setToken,
    setUser,
    staffClientDone,
    staffClientError,
    staffClientForm,
    staffClientOpen,
    staffClientSaving,
    staffOrderForm,
    staffOrderOpen,
    staffOrderSaving,
    staffUsers,
    staffUsersLoading,
    t,
    tdFilter,
    tdModeLabel,
    teardownCars,
    teardownCarsLoading,
    teardownInput,
    toggleCarFormGroup,
    toggleCarFormPart,
    toggleClientPart,
    toggleOrderCars,
    togglePickedCar,
    toggleUserRole,
    token,
    user,
  };
}

export type SiteState = ReturnType<typeof useSiteState>;
import { useState, useEffect } from "react";
import TeardownModeBadge, { type TeardownMode } from "@/components/TeardownModeBadge";
import { writeXlsxWithFreeze } from "@/lib/xlsx-export";
import {
  LOGO, COMPANY_NAME, I18N, ORIGIN_LABEL,
  TD_SEP, TD_FULL, TD_HALFCUT, TD_NOSKAT, TEARDOWN_PRESET,
  splitTd, joinTd, detectTeardownMode,
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
  const [carForm, setCarForm] = useState({ car_brand: "", car_model: "", car_year: "", vin: "", price: "", mileage: "", description: "", photos: [] as string[], teardown: [] as TeardownItem[] });
  const [carSaving, setCarSaving] = useState(false);
  const [teardownInput, setTeardownInput] = useState("");
  // клиент: сохранение отметок разборного листа
  const [savingTeardown, setSavingTeardown] = useState<number | null>(null);
  // сотрудник: все авто с разборными листами
  interface TeardownCar extends Car { order_id: number; order_number: string; client_name: string; client_email: string; client_company: string; }
  const [teardownCars, setTeardownCars] = useState<TeardownCar[]>([]);
  const [teardownCarsLoading, setTeardownCarsLoading] = useState(false);
  const [tdFilter, setTdFilter] = useState<TeardownMode | "all">("all");
  // сотрудник: контейнеры (сборка машинокомплектов)
  interface ContainerCar { id: number; car_brand: string; car_model: string; car_year: number; vin: string; order_number: string; client_name: string; client_company: string; origin: string; status: string; teardown?: TeardownItem[]; }
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
        : { ...f, teardown: [...f.teardown, { name, needed: false, qty: 1 }] };
    });
  };
  const setPartQty = (name: string, qty: number) => {
    setCarForm((f) => ({ ...f, teardown: f.teardown.map((x) => x.name === name ? { ...x, qty: Math.max(1, qty) } : x) }));
  };
  const toggleCarFormGroup = (names: string[], select: boolean) => {
    setCarForm((f) => {
      if (select) {
        const missing = names.filter((n) => !f.teardown.some((x) => x.name === n));
        return { ...f, teardown: [...f.teardown, ...missing.map((n) => ({ name: n, needed: false, qty: 1 }))] };
      }
      return { ...f, teardown: f.teardown.filter((x) => !names.includes(x.name)) };
    });
  };
  const applyTeardownPreset = (preset: string[]) => {
    setCarForm((f) => {
      const custom = f.teardown.filter((x) => !TEARDOWN_PRESET.includes(x.name));
      return { ...f, teardown: [...preset.map((name) => ({ name, needed: false, qty: 1 })), ...custom] };
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
    setCarForm({ car_brand: "", car_model: "", car_year: "", vin: "", price: "", mileage: "", description: "", photos: [], teardown: [] });
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
      price: carForm.price ? parseInt(carForm.price) : null,
      mileage: carForm.mileage ? parseInt(carForm.mileage) : null,
      description: carForm.description, photos: carForm.photos, teardown: carForm.teardown,
    } });
    setCarSaving(false);
    setCarForm({ car_brand: "", car_model: "", car_year: "", vin: "", price: "", mileage: "", description: "", photos: [], teardown: [] });
    loadCars(selectedOrder.id);
    const d = await apiOrders("GET", token);
    setOrders(d.orders || []);
  };

  const doDeleteCar = async (carId: number) => {
    await apiCars("DELETE", token, { query: `car_id=${carId}` });
    if (selectedOrder) loadCars(selectedOrder.id);
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

    // ── Лист 2: Сводный список запчастей ──
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
    const parts = Array.from(agg.values()).sort(
      (a, b) => a.group.localeCompare(b.group, "ru") || a.part.localeCompare(b.part, "ru")
    );
    let totalParts = 0;
    const partRows = parts.map((p, i) => { totalParts += p.qty; return [i + 1, p.group, p.part, p.qty]; });
    const s2: (string | number)[][] = [
      ["№", "Группа", "Наименование детали", "Кол-во (всего)"],
      ...(partRows.length ? partRows : [["—", "Нет деталей в разборных листах", "", ""]]),
      [],
      ["", "ИТОГО позиций:", parts.length, totalParts],
    ];
    const ws2 = XLSX.utils.aoa_to_sheet(s2);
    ws2["!cols"] = [{ wch: 6 }, { wch: 28 }, { wch: 42 }, { wch: 16 }];
    const s2DataRows = partRows.length || 1;
    ws2["!autofilter"] = { ref: `A1:D${s2DataRows + 1}` };
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

    const safe = (ct.container_number || ct.name || "container").replace(/[^\wа-яА-Я0-9-]+/g, "_");
    await writeXlsxWithFreeze(wb, `container_packing_list_${safe}.xlsx`, [
      { sheetIndex: 1, rows: 1 },
      { sheetIndex: 2, rows: 1 },
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

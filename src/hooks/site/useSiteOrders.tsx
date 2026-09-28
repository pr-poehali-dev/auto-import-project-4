import { useState, useEffect } from "react";
import {
  TD_SEP, TD_FULL, TD_HALFCUT, TD_NOSKAT, TEARDOWN_PRESET,
  joinTd, defaultQty,
  apiCars, apiOrders, apiAuth,
  type Order, type Car, type TeardownItem, type CabinetTab,
} from "@/lib/site-data";
import type { ManagedUser } from "@/hooks/site/useSiteStaff";

export interface TeardownCar extends Car {
  order_id: number; order_number: string; client_name: string;
  client_email: string; client_company: string;
}

interface OrdersDeps {
  token: string;
  page: string;
  cabinetTab: CabinetTab;
  setCabinetTab: (t: CabinetTab) => void;
  teardownCars: TeardownCar[];
  setTeardownCars: (cars: TeardownCar[]) => void;
  isMissingIds: (c: { order_status?: string; vin?: string; engine_model?: string; engine_number?: string }) => boolean;
}

// Заявки, автомобили и разборные листы: списки, формы,
// добавление машин и правка идентификаторов.
export function useSiteOrders({ token, page, cabinetTab, setCabinetTab, teardownCars, setTeardownCars, isMissingIds }: OrdersDeps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
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
  const [savingTeardown, setSavingTeardown] = useState<number | null>(null);
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

  const loadCars = async (orderId: number) => {
    setCarsLoading(true);
    const d = await apiCars("GET", token, { query: `order_id=${orderId}` });
    setCars(d.cars || []);
    setCarsLoading(false);
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
    const updated = teardownCars.map(patch);
    setTeardownCars(updated);

    // Автопереход к следующей машине «В разбор» без VIN / данных ДВС
    const savedIdx = updated.findIndex((c) => c.id === editCarId);
    if (cabinetTab === "teardowns" && savedIdx !== -1) {
      const after = updated.slice(savedIdx + 1).find(isMissingIds);
      const next = after || updated.slice(0, savedIdx).find(isMissingIds);
      if (next) { startEditCar(next); return; }
    }
    setEditCarId(null);
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
  return {
    orders, setOrders, ordersLoading, setOrdersLoading,
    newOrderForm, setNewOrderForm, newOrderSent, setNewOrderSent,
    selectedOrder, setSelectedOrder,
    cars, setCars, carsLoading, setCarsLoading,
    editCarId, editCarForm, setEditCarForm, editCarSaving,
    carForm, setCarForm, carSaving, setCarSaving,
    teardownInput, setTeardownInput,
    savingTeardown, setSavingTeardown,
    staffOrderOpen, setStaffOrderOpen, staffOrderForm, setStaffOrderForm,
    staffOrderSaving, setStaffOrderSaving,
    clientsList, setClientsList,
    staffClientOpen, setStaffClientOpen, staffClientForm, setStaffClientForm,
    staffClientSaving, setStaffClientSaving,
    staffClientError, setStaffClientError, staffClientDone, setStaffClientDone,
    toggleCarFormPart, setPartQty, toggleCarFormGroup, applyTeardownPreset,
    selectHalfcutTeardown, selectFullTeardown, selectNoskatTeardown,
    clearTeardown, addCustomPart, toggleClientPart,
    loadCars, openOrderCars, changeOrderStatus, handlePhotoSelect,
    doAddCar, doDeleteCar, startEditCar, cancelEditCar, saveEditCar,
    expandedOrder, setExpandedOrder, orderCars, setOrderCars, toggleOrderCars,
    doNewOrder, loadClientsList, openStaffClientForm, doStaffCreateClient,
    openStaffOrderForm, doStaffCreateOrder,
  };
}

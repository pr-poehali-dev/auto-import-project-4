import { useState, useEffect } from "react";
import {
  apiAuth, apiCars, apiContainers, apiHotDeals, apiPartsRequests,
  type User, type Car, type TeardownItem, type HotDeal, type PartsRequest,
  type Page, type CabinetTab,
} from "@/lib/site-data";
import type { TeardownMode } from "@/components/TeardownModeBadge";

export interface ManagedUser {
  id: number; email: string; full_name: string; phone: string;
  company: string; role: string; created_at: string;
}

interface StaffDeps {
  token: string;
  user: User | null;
  isStaff: boolean;
  page: Page;
  originId: string;
  cabinetTab: CabinetTab;
}

// Рабочие данные сотрудника: разборные листы, контейнеры,
// горячие предложения, управление пользователями и запросы запчастей.
export function useSiteStaff({ token, user, isStaff, page, originId, cabinetTab }: StaffDeps) {
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

  // ── Запросы наличия автозапчастей ──
  const [partsRequests, setPartsRequests] = useState<PartsRequest[]>([]);
  const [partsReqLoading, setPartsReqLoading] = useState(false);
  const emptyPartsForm = { category_id: "", category_title: "", car_brand: "", car_model: "", car_year: "", vin: "", parts_text: "", comment: "" };
  const [partsForm, setPartsForm] = useState({ ...emptyPartsForm });
  const [partsFormOpen, setPartsFormOpen] = useState(false);
  const [partsSaving, setPartsSaving] = useState(false);
  const [partsSent, setPartsSent] = useState(false);

  const loadPartsRequests = async () => {
    setPartsReqLoading(true);
    const d = await apiPartsRequests("GET", token);
    setPartsRequests(d.requests || []);
    setPartsReqLoading(false);
  };

  useEffect(() => {
    if (page === "cabinet" && token && cabinetTab === "parts_requests") {
      loadPartsRequests();
    }
  }, [page, cabinetTab, token]);

  // Открыть форму запроса по конкретной группе запчастей
  const openPartsRequest = (categoryId: string, categoryTitle: string, prefill: Partial<typeof emptyPartsForm> = {}) => {
    setPartsForm({ ...emptyPartsForm, ...prefill, category_id: categoryId, category_title: categoryTitle });
    setPartsSent(false);
    setPartsFormOpen(true);
  };
  const closePartsRequest = () => { setPartsFormOpen(false); setPartsSent(false); };

  const submitPartsRequest = async () => {
    if (!partsForm.car_brand.trim()) return;
    setPartsSaving(true);
    const d = await apiPartsRequests("POST", token, { body: {
      origin: "china",
      category_id: partsForm.category_id,
      category_title: partsForm.category_title,
      car_brand: partsForm.car_brand,
      car_model: partsForm.car_model,
      car_year: partsForm.car_year ? parseInt(partsForm.car_year) : null,
      vin: partsForm.vin,
      parts_text: partsForm.parts_text,
      comment: partsForm.comment,
    } });
    setPartsSaving(false);
    if (d.error) { alert(d.error); return; }
    setPartsSent(true);
  };

  const setPartsRequestStatus = async (id: number, status: string) => {
    const d = await apiPartsRequests("PATCH", token, { body: { request_id: id, status } });
    if (d.error) { alert(d.error); return; }
    setPartsRequests((prev) => prev.map((r) => r.id === id
      ? { ...r, status, status_label: d.status_label || status } : r));
  };

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

  const loadTeardownCars = async () => {
    setTeardownCarsLoading(true);
    const d = await apiCars("GET", token, { query: "all=1" });
    const all: TeardownCar[] = d.cars || [];
    setTeardownCars(all.filter((c) => c.teardown && c.teardown.length > 0));
    setTeardownCarsLoading(false);
  };
  // ── load hot deals on Hong Kong origin page ──
  useEffect(() => {
    if (page === "origin" && originId === "hongkong") loadHotDeals();
  }, [page, originId]);

  // ── load hot deals in staff cabinet tab ──
  useEffect(() => {
    if (page === "cabinet" && token && user?.role === "staff" && cabinetTab === "hot_deals") loadHotDeals();
  }, [page, cabinetTab, token, user]);

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

  return {
    teardownCars, setTeardownCars, teardownCarsLoading, setTeardownCarsLoading,
    tdFilter, setTdFilter,
    tdMissingOnly, toggleTdMissingOnly, isMissingIds,
    containers, setContainers, availableCars, setAvailableCars,
    containersLoading, setContainersLoading,
    containerForm, setContainerForm, containerFormOpen, setContainerFormOpen,
    containerSaving, setContainerSaving,
    pickedCars, setPickedCars, addTargetContainer, setAddTargetContainer,
    staffUsers, setStaffUsers, staffUsersLoading, setStaffUsersLoading,
    roleSavingId, setRoleSavingId,
    emptyDeal, hotDeals, setHotDeals, hotDealsLoading, setHotDealsLoading,
    dealForm, setDealForm, dealSaving, setDealSaving,
    dealDeletingId, setDealDeletingId,
    loadHotDeals, pickDealPhoto, editDeal, saveDeal, deleteDeal,
    loadStaffUsers, toggleUserRole,
    partsRequests, partsReqLoading, partsForm, setPartsForm,
    partsFormOpen, partsSaving, partsSent,
    loadPartsRequests, openPartsRequest, closePartsRequest,
    submitPartsRequest, setPartsRequestStatus,
    loadContainers, doCreateContainer, togglePickedCar, doAddToContainer,
    doRemoveFromContainer, setContainerStatus,
    loadTeardownCars,
  };
}

import { useState, useEffect } from "react";
import TeardownModeBadge, { type TeardownMode } from "@/components/TeardownModeBadge";
import {
  I18N, detectTeardownMode,
  apiAuth,
  type User, type TeardownItem,
  type Lang, type Page, type CabinetTab,
} from "@/lib/site-data";
import { useSiteStaff } from "@/hooks/site/useSiteStaff";
import { useSiteOrders } from "@/hooks/site/useSiteOrders";
import { useSiteDocuments } from "@/hooks/site/useSiteDocuments";

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
  const [cabinetTab, setCabinetTab] = useState<CabinetTab>("orders");
  const [profileForm, setProfileForm] = useState({ full_name: "", phone: "", company: "", inn: "" });
  const [profileSaved, setProfileSaved] = useState(false);

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

  // ── load user on mount ──
  useEffect(() => {
    if (token) {
      apiAuth("me", {}, token).then((data) => {
        if (data.user) setUser(data.user);
        else { setToken(""); localStorage.removeItem("pc_token"); }
      });
    }
  }, []);

  const isStaff = user?.role === "staff";

  // ── Рабочие данные сотрудника ──
  const staff = useSiteStaff({ token, user, isStaff, page, originId, cabinetTab });
  const {
    teardownCars, setTeardownCars, teardownCarsLoading, setTeardownCarsLoading,
    tdFilter, setTdFilter, tdMissingOnly, toggleTdMissingOnly, isMissingIds,
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
    openPartsRequest, closePartsRequest, submitPartsRequest, setPartsRequestStatus,
    loadContainers, doCreateContainer, togglePickedCar, doAddToContainer,
    doRemoveFromContainer, setContainerStatus, loadTeardownCars,
  } = staff;

  // ── Заявки, автомобили и разборные листы ──
  const orders_ = useSiteOrders({
    token, page, cabinetTab, setCabinetTab,
    teardownCars, setTeardownCars, isMissingIds,
  });
  const {
    orders, setOrders, ordersLoading, setOrdersLoading,
    newOrderForm, setNewOrderForm, newOrderSent, setNewOrderSent,
    selectedOrder, setSelectedOrder,
    cars, setCars, carsLoading, setCarsLoading,
    editCarId, editCarForm, setEditCarForm, editCarSaving,
    carForm, setCarForm, carSaving, setCarSaving,
    teardownInput, setTeardownInput, savingTeardown, setSavingTeardown,
    staffOrderOpen, setStaffOrderOpen, staffOrderForm, setStaffOrderForm,
    staffOrderSaving, setStaffOrderSaving, clientsList, setClientsList,
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
  } = orders_;

  // ── Печать и выгрузка документов ──
  const {
    printTeardownSheet, exportPackingList, exportPackingListXlsx,
    exportPackingListTemplateXlsx, exportEngineDocXlsx,
    containerPartsSummary, openSummaryId, toggleContainerSummary,
    exportContainerXlsx, exportContainerPdf,
  } = useSiteDocuments({ lang, t, user, tdModeLabel, teardownCars });


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
    partsRequests,
    partsReqLoading,
    partsForm,
    setPartsForm,
    partsFormOpen,
    partsSaving,
    partsSent,
    openPartsRequest,
    closePartsRequest,
    submitPartsRequest,
    setPartsRequestStatus,
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
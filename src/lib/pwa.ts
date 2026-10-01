// Подключение «приложения» CRM: manifest, иконки, цвет панели, сервис-воркер.
// Делается только на странице /crm, чтобы основной сайт не предлагал установку.

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

let deferred: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferred = e as BeforeInstallPromptEvent;
    listeners.forEach((l) => l());
  });
  window.addEventListener("appinstalled", () => {
    deferred = null;
    listeners.forEach((l) => l());
  });
}

const setTag = (selector: string, create: () => HTMLElement, attrs: Record<string, string>) => {
  let el = document.head.querySelector(selector) as HTMLElement | null;
  if (!el) { el = create(); document.head.appendChild(el); }
  Object.entries(attrs).forEach(([k, v]) => el!.setAttribute(k, v));
};

export function setupCrmPwa() {
  setTag('link[rel="manifest"]', () => document.createElement("link"), { rel: "manifest", href: "/crm-manifest.webmanifest" });
  setTag('link[rel="apple-touch-icon"]', () => document.createElement("link"), { rel: "apple-touch-icon", href: "/crm-apple-touch-icon.png" });
  setTag('meta[name="theme-color"]', () => document.createElement("meta"), { name: "theme-color", content: "#0b1120" });
  setTag('meta[name="apple-mobile-web-app-capable"]', () => document.createElement("meta"), { name: "apple-mobile-web-app-capable", content: "yes" });
  setTag('meta[name="mobile-web-app-capable"]', () => document.createElement("meta"), { name: "mobile-web-app-capable", content: "yes" });
  setTag('meta[name="apple-mobile-web-app-status-bar-style"]', () => document.createElement("meta"), { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" });
  setTag('meta[name="apple-mobile-web-app-title"]', () => document.createElement("meta"), { name: "apple-mobile-web-app-title", content: "CRM" });
  const vp = document.head.querySelector('meta[name="viewport"]');
  if (vp) vp.setAttribute("content", "width=device-width, initial-scale=1, viewport-fit=cover");
  document.title = "CRM · PRIME CARS";

  if ("serviceWorker" in navigator && window.isSecureContext) {
    navigator.serviceWorker.register("/crm-sw.js", { scope: "/crm" }).catch(() => undefined);
  }
}

export const isStandalone = () =>
  window.matchMedia?.("(display-mode: standalone)").matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true;

export const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

export const canPromptInstall = () => !!deferred;

export async function promptInstall(): Promise<boolean> {
  if (!deferred) return false;
  await deferred.prompt();
  const { outcome } = await deferred.userChoice;
  deferred = null;
  listeners.forEach((l) => l());
  return outcome === "accepted";
}

export function onInstallChange(cb: () => void) {
  listeners.add(cb);
  return () => { listeners.delete(cb); };
}

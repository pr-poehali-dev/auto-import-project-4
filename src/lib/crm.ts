import { safeJson } from "@/lib/site-data";

export const CRM_URL = "https://functions.poehali.dev/e739599c-75bb-49e9-bfd3-d18cfe5fb9f7";

export async function crmGet(token: string, params: Record<string, string | number | undefined>) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== "") qs.set(k, String(v)); });
  const res = await fetch(`${CRM_URL}?${qs.toString()}`, { headers: { "X-Session-Token": token } });
  return safeJson(res);
}

export async function crmPost(token: string, body: object) {
  const res = await fetch(CRM_URL, {
    method: "POST",
    headers: { "X-Session-Token": token, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return safeJson(res);
}

export type Stage = "new" | "in_work" | "offer" | "payment" | "delivery" | "won" | "lost";

export const STAGES: { id: Stage; label: string; color: string }[] = [
  { id: "new", label: "Новая", color: "hsl(210 80% 55%)" },
  { id: "in_work", label: "В работе", color: "hsl(45 90% 50%)" },
  { id: "offer", label: "Предложение отправлено", color: "hsl(270 60% 60%)" },
  { id: "payment", label: "Оплата", color: "hsl(25 90% 55%)" },
  { id: "delivery", label: "Доставка", color: "hsl(190 70% 45%)" },
  { id: "won", label: "Завершена", color: "hsl(145 60% 42%)" },
  { id: "lost", label: "Отказ", color: "hsl(0 0% 55%)" },
];
export const stageOf = (id: string) => STAGES.find((s) => s.id === id) || STAGES[0];

export const SOURCE_LABELS: Record<string, { label: string; icon: string }> = {
  order: { label: "Заявка на авто", icon: "Car" },
  parts: { label: "Запрос запчастей", icon: "Wrench" },
  manual: { label: "Вручную", icon: "PenLine" },
};

export interface Deal {
  id: number; source_type: string; source_id: number | null; client_id: number | null;
  title: string; stage: Stage; manager_id: number | null; amount: number | null; lost_reason: string;
  created_at: string; updated_at: string; stage_changed_at: string; closed_at: string | null;
  client_name: string; client_company: string; client_phone: string; client_email: string;
  manager_name: string; open_tasks: number; next_task_at: string | null;
}
export interface CrmEvent { id: number; kind: string; text: string; created_at: string; author: string; }
export interface CrmTask {
  id: number; deal_id: number | null; client_id: number | null; assignee_id: number | null;
  title: string; due_at: string; done: boolean; done_at: string | null; created_at: string;
  assignee_name: string; deal_title: string; client_name: string;
}
export interface StaffMember { id: number; name: string; }
export interface CrmClient {
  id: number; name: string; company: string; phone: string; email: string; created_at: string;
  deals_total: number; deals_open: number; won_amount: number; last_activity: string | null;
}

export const money = (v: number | string | null | undefined) =>
  v === null || v === undefined || v === "" ? "—" : `${Number(v).toLocaleString("ru-RU")} ₽`;

export const fmtDate = (v: string | null | undefined, withTime = true) => {
  if (!v) return "";
  const d = new Date(v);
  return d.toLocaleString("ru-RU", withTime
    ? { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" }
    : { day: "2-digit", month: "2-digit", year: "numeric" });
};

export const daysSince = (v: string) => Math.floor((Date.now() - new Date(v).getTime()) / 86400000);

export const isOverdue = (v: string | null | undefined) => !!v && new Date(v).getTime() < Date.now();

// datetime-local → ISO с часовым поясом браузера, чтобы сервер сохранил точное время
export const localToIso = (v: string) => (v ? new Date(v).toISOString() : "");

export const presetDue = (kind: "1h" | "tomorrow" | "3d") => {
  const d = new Date();
  if (kind === "1h") d.setHours(d.getHours() + 1, d.getMinutes(), 0, 0);
  if (kind === "tomorrow") { d.setDate(d.getDate() + 1); d.setHours(11, 0, 0, 0); }
  if (kind === "3d") { d.setDate(d.getDate() + 3); d.setHours(11, 0, 0, 0); }
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

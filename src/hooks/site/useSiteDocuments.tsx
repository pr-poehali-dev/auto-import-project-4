import { useState } from "react";
import { writeXlsxWithFreeze } from "@/lib/xlsx-export";
import {
  LOGO, ORIGIN_LABEL, STATUS_LABEL,
  splitTd, detectTeardownMode, groupTeardown,
  type User, type Car, type TeardownItem, type Lang,
} from "@/lib/site-data";
import type { TeardownMode } from "@/components/TeardownModeBadge";

interface ContainerCar {
  id: number; car_brand: string; car_model: string; car_year: number; vin: string;
  order_number: string; client_name: string; client_company: string; origin: string;
  status: string; engine_model?: string; engine_number?: string; teardown?: TeardownItem[];
}
interface Container {
  id: number; name: string; container_number: string; origin: string; status: string;
  status_label: string; comment: string; created_at: string; cars: ContainerCar[];
}
type TeardownCarLike = Car & { order_number?: string; client_name?: string; client_company?: string; order_status?: string };

interface DocumentsDeps {
  lang: Lang;
  t: (key: string) => string;
  user: User | null;
  tdModeLabel: (mode: TeardownMode) => string;
  teardownCars: TeardownCarLike[];
}

// Печать и выгрузка документов: разборные листы, упаковочные листы,
// номерные агрегаты и упаковочный лист контейнера.
export function useSiteDocuments({ lang, t, user, tdModeLabel, teardownCars }: DocumentsDeps) {
  // Печать разборного листа: сплошной список деталей, отметки клиента, количество
  const printTeardownSheet = (car: Car & { order_number?: string; client_name?: string; client_company?: string }) => {
    const esc = (v: unknown) => String(v ?? "").replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" } as Record<string, string>)[ch]);
    const items = car.teardown || [];
    const groups = groupTeardown(items);
    const mode = detectTeardownMode(items);
    const carTitle = [car.car_brand, car.car_model, car.car_year].filter(Boolean).join(" ");
    const dateStr = new Date().toLocaleDateString(lang === "ru" ? "ru-RU" : "en-GB");
    const totalQty = items.reduce((sum, it) => sum + (it.qty || 1), 0);
    const neededCount = items.filter((it) => it.needed).length;

    const body = `<tbody>${groups.flatMap((grp) => grp.items).map((it, i) => `<tr class="${it.needed ? "on" : ""}">
          <td class="c num">${i + 1}</td>
          <td class="part">${esc(it.part)}</td>
          <td class="c qty">${it.qty || 1}</td>
          <td class="c mark">${it.needed ? '<span class="tick">✓</span>' : '<span class="box"></span>'}</td>
        </tr>`).join("")}</tbody>`;

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
  @media print{body{padding:0}tr{break-inside:avoid}}
</style></head><body>
<div class="head">
  <div class="brand">
    <img src="${LOGO}" alt="" />
    <div>
      <div class="title">${esc(t("td_print_title"))}</div>
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
          <div><div class="title">PACKING LIST</div><div class="sub">Упаковочный / разборный лист</div></div>
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
        <thead><tr><th class="c">№</th><th>Наименование детали</th><th class="c">Кол-во</th><th class="c">Нужно клиенту</th></tr></thead>
        <tbody>${rows || `<tr><td colspan="4" class="c">Список пуст</td></tr>`}</tbody>
        <tfoot><tr><td colspan="2" style="text-align:right">ИТОГО позиций / штук:</td><td class="c">${items.length} / ${totalQty}</td><td></td></tr></tfoot>
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

  // Экспорт разборного листа в Word — такой же вид, как у PDF
  const exportPackingListDocx = async (car: Car) => {
    const { downloadTeardownDocx } = await import("@/lib/teardown-docx");
    const items = car.teardown || [];
    const tdMode = detectTeardownMode(items);
    const carTitle = [car.car_brand, car.car_model, car.car_year].filter(Boolean).join(" ");
    const safe = (carTitle || "car").replace(/[^\p{L}\p{N}]+/gu, "_");
    await downloadTeardownDocx({
      logoUrl: LOGO,
      number: car.order_number ? String(car.order_number) : String(car.id),
      date: new Date().toLocaleDateString("ru-RU"),
      carTitle,
      vin: car.vin || "",
      year: car.car_year ? String(car.car_year) : "",
      mileage: car.mileage ? `${car.mileage.toLocaleString("ru-RU")} км` : "",
      mode: tdMode ? tdModeLabel(tdMode) : "",
      rows: items.map((it) => ({ part: splitTd(it.name).part, qty: it.qty || 1, needed: !!it.needed })),
      fileName: `Packing_list_${safe}${car.vin ? "_" + car.vin : ""}.docx`,
    });
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
      ["Упаковочный / разборный лист", "", "", "", ""],
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
  // Блок подписей и печати под таблицей номерных агрегатов
  const engineDocSignRows = (): (string | number)[][] => [
    [],
    ["Данные о номерных агрегатах сверены с номерами на автомобилях."],
    [],
    ["Сведения составил:", "", "", "", "Проверил:"],
    ["должность, Ф.И.О.", "", "", "", "должность, Ф.И.О."],
    [],
    ["Подпись:", "______________________", "", "", "Подпись:", "______________________"],
    [],
    ["Дата:", "____ . ____ . 20____", "", "", "Дата:", "____ . ____ . 20____"],
    [],
    ["М.П.", "", "", "", "", ""],
  ];

  // Отдельный документ по номерным агрегатам из заявок «В разбор»
  const exportEngineDocXlsx = async () => {
    const XLSX = await import("xlsx");
    const list = teardownCars.filter((c) => c.order_status === "teardown");
    if (list.length === 0) { alert(t("eng_doc_empty")); return; }
    const dateStr = new Date().toLocaleDateString("ru-RU");

    const head: (string | number)[][] = [
      ["НОМЕРНЫЕ АГРЕГАТЫ · ДВС"],
      ["Сведения о номерных агрегатах"],
      [],
      ["Дата:", dateStr, "", "Статус заявок:", STATUS_LABEL[lang].teardown],
      ["Машинокомплектов:", list.length],
      [],
      ENGINE_DOC_HEAD,
    ];
    const rows = engineDocRows(list);
    const sign = engineDocSignRows();
    if (user?.full_name) sign[3][1] = user.full_name;
    const aoa = [...head, ...rows, [], ["", "ИТОГО агрегатов:", list.length], ...sign];

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
      ["Упаковочный лист контейнера"],
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
      ["Сведения о номерных агрегатах"],
      [],
      ["Дата:", dateStr, "", "Контейнер:", ct.container_number || ct.name || "—"],
      ["Статус заявок:", STATUS_LABEL[lang].teardown, "", "Агрегатов:", engCars.length],
      [],
      ENGINE_DOC_HEAD,
    ];
    const engRows = engineDocRows(engCars);
    const engSign = engineDocSignRows();
    if (user?.full_name) engSign[3][1] = user.full_name;
    const s4 = [
      ...engHead,
      ...(engRows.length ? engRows : [["—", "Нет машин в статусе «В разбор»", "", "", "", "", "", ""]]),
      [],
      ["", "ИТОГО агрегатов:", engCars.length],
      ...engSign,
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
          <div><div class="title">CONTAINER PACKING LIST</div><div class="sub">Упаковочный лист контейнера</div></div>
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
  return {
    printTeardownSheet,
    exportPackingList,
    exportPackingListXlsx,
    exportPackingListDocx,
    exportPackingListTemplateXlsx,
    exportEngineDocXlsx,
    containerPartsSummary,
    openSummaryId,
    toggleContainerSummary,
    exportContainerXlsx,
    exportContainerPdf,
  };
}
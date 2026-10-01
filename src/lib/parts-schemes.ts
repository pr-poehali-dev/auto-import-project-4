import * as XLSX from "xlsx";
import type { SchemeItem, StockStatus } from "@/lib/site-data";

// Сжимаем схему до разумного размера: тонкие линии чертежа сохраняются,
// а файл укладывается в лимит запроса к серверу.
export const compressImage = (file: File, maxSide = 2000): Promise<string> =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
        if (scale === 1 && file.size < 1_500_000) { resolve(src); return; }
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.88));
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  });

export const STOCK_OPTIONS: { value: StockStatus; key: string; cls: string }[] = [
  { value: "", key: "ps_stock_none", cls: "" },
  { value: "in_stock", key: "ps_stock_in", cls: "bg-green-100 text-green-700" },
  { value: "on_order", key: "ps_stock_order", cls: "bg-amber-100 text-amber-700" },
  { value: "out", key: "ps_stock_out", cls: "bg-gray-200 text-gray-600" },
];

export const formatPrice = (v: number | null | undefined) =>
  v === null || v === undefined ? "" : `${v.toLocaleString("ru-RU")} ₽`;

// «12 500 руб.», «12500,00», «3,400», «1.234,50», «₽3 400» → целые рубли; пусто и мусор → null.
// Запятая или точка перед ровно тремя цифрами — разделитель тысяч, иначе — копейки.
export const parsePrice = (v: unknown): number | null => {
  let txt = String(v ?? "").replace(/[\s\u00a0]/g, "");
  if (!txt || txt.startsWith("-")) return null;
  txt = txt.replace(/[^\d.,]/g, "");
  if (!txt) return null;
  const lastSep = Math.max(txt.lastIndexOf(","), txt.lastIndexOf("."));
  if (txt.includes(",") && txt.includes(".")) {
    txt = txt.slice(0, lastSep).replace(/[.,]/g, "") + "." + txt.slice(lastSep + 1);
  } else if (/^\d{1,3}([.,]\d{3})+$/.test(txt)) {
    txt = txt.replace(/[.,]/g, "");
  } else {
    txt = txt.replace(",", ".");
  }
  const num = parseFloat(txt);
  return Number.isFinite(num) ? Math.round(num) : null;
};

// «В наличии», «есть», «in stock», «да» → in_stock; «под заказ», «order» → on_order; «нет», «out» → out
export const parseStock = (v: unknown): StockStatus => {
  const s = String(v ?? "").toLowerCase().trim();
  if (!s) return "";
  if (/заказ|order|ожида|транзит|wait/.test(s)) return "on_order";
  if (/^нет|out|отсутств|^no$|^0$/.test(s)) return "out";
  if (/налич|есть|in stock|stock|^да$|^yes$|склад|^\d+$/.test(s)) return "in_stock";
  return "";
};

// Варианты заголовков колонок: русские, английские и китайские из типовых каталогов
const COLS: Record<keyof SchemeItem, string[]> = {
  pos: ["поз", "позиция", "№", "no", "pos", "position", "ref", "item", "序号", "位置"],
  article: ["артикул", "номер", "каталожный", "oem", "part", "partno", "part number", "number", "article", "零件号", "编号"],
  name: ["наименование", "название", "деталь", "описание", "name", "description", "desc", "名称"],
  qty: ["кол", "количество", "шт", "qty", "quantity", "数量"],
  note: ["примечание", "комментарий", "прим", "note", "remark", "comment", "备注"],
  price: ["цена", "стоимость", "руб", "price", "cost", "价格"],
  stock: ["наличие", "остаток", "склад", "stock", "availability", "status", "库存"],
};

const norm = (v: unknown) => String(v ?? "").toLowerCase().replace(/[.\s_-]+/g, " ").trim();

const detect = (header: unknown[]): Partial<Record<keyof SchemeItem, number>> => {
  const map: Partial<Record<keyof SchemeItem, number>> = {};
  const cells = header.map(norm);
  (Object.keys(COLS) as (keyof SchemeItem)[]).forEach((key) => {
    const idx = cells.findIndex((c, i) => c && !Object.values(map).includes(i) && COLS[key].some((w) => c === w || c.startsWith(w) || c.endsWith(" " + w)));
    if (idx !== -1) map[key] = idx;
  });
  return map;
};

// Читаем первый лист: ищем строку заголовков в первых 10 строках
export const parseSchemeSheet = (wb: XLSX.WorkBook): SchemeItem[] => {
  const sheet = wb.Sheets[wb.SheetNames[0]];
  if (!sheet) return [];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: "", raw: false });
  let headerIdx = -1;
  let map: Partial<Record<keyof SchemeItem, number>> = {};
  for (let i = 0; i < Math.min(rows.length, 10); i++) {
    const m = detect(rows[i] || []);
    if (m.article !== undefined || m.name !== undefined) { headerIdx = i; map = m; break; }
  }
  if (headerIdx === -1) return [];
  const get = (r: unknown[], k: keyof SchemeItem) => (map[k] === undefined ? "" : String(r[map[k]!] ?? "").trim());
  return rows.slice(headerIdx + 1)
    .map((r) => ({
      pos: get(r, "pos"),
      article: get(r, "article"),
      name: get(r, "name"),
      qty: Math.max(1, parseInt(get(r, "qty")) || 1),
      note: get(r, "note"),
      price: parsePrice(get(r, "price")),
      stock: parseStock(get(r, "stock")),
    }))
    .filter((r) => r.article || r.name);
};

export const downloadSchemeTemplate = () => {
  const ws = XLSX.utils.aoa_to_sheet([
    ["Поз.", "Артикул", "Наименование", "Кол-во", "Цена", "Наличие", "Примечание"],
    ["1", "", "", 1, "", "В наличии", ""],
    ["2", "", "", 1, "", "Под заказ", ""],
  ]);
  ws["!cols"] = [{ wch: 7 }, { wch: 22 }, { wch: 44 }, { wch: 9 }, { wch: 12 }, { wch: 14 }, { wch: 26 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Артикулы");
  XLSX.writeFile(wb, "shablon_artikulov.xlsx");
};

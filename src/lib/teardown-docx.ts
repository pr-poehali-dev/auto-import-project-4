import {
  AlignmentType, BorderStyle, Document, ImageRun, Packer, Paragraph, ShadingType,
  Table, TableCell, TableLayoutType, TableRow, TextRun, VerticalAlign, WidthType,
} from "docx";

// Word-документы (разборный лист, упаковочный лист контейнера) — оформление повторяет PDF

const NAVY = "1A2238";
const GREY = "6B7280";
const LINE = "C9CED8";
const FOOT_BG = "F1F3F7";
const FONT = "Arial";
const PAGE_W = 10466;
const HALF = PAGE_W / 2;

type Align = (typeof AlignmentType)[keyof typeof AlignmentType];

const cellBorder = { style: BorderStyle.SINGLE, size: 4, color: LINE };
const borders = { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder };
const none = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: none, bottom: none, left: none, right: none, insideHorizontal: none, insideVertical: none };
const thickBottom = { top: none, left: none, right: none, bottom: { style: BorderStyle.SINGLE, size: 24, color: NAVY } };

const txt = (text: string, o: { bold?: boolean; color?: string; size?: number; mono?: boolean } = {}) =>
  new TextRun({ text, font: o.mono ? "Courier New" : FONT, bold: o.bold, color: o.color ?? NAVY, size: o.size ?? 20 });

const p = (runs: TextRun[] | TextRun, align: Align = AlignmentType.LEFT) =>
  new Paragraph({ alignment: align, children: Array.isArray(runs) ? runs : [runs] });

const cell = (children: Paragraph[], width: number, o: { fill?: string; span?: number } = {}) =>
  new TableCell({
    children, columnSpan: o.span, verticalAlign: VerticalAlign.CENTER,
    width: { size: width, type: WidthType.DXA },
    borders,
    shading: o.fill ? { type: ShadingType.CLEAR, color: "auto", fill: o.fill } : undefined,
    margins: { top: 90, bottom: 90, left: 130, right: 130 },
  });

const gap = (after: number) => new Paragraph({ spacing: { after }, children: [] });

async function loadLogo(url: string) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    const type = (res.headers.get("content-type") || "").includes("png") ? "png" : "jpg";
    return new ImageRun({ type, data: buf, transformation: { width: 52, height: 52 } });
  } catch {
    return null;
  }
}

async function header(logoUrl: string, title: string, subtitle: string, right: string[]) {
  const logo = await loadLogo(logoUrl);
  const leftW = 6800;
  const rightW = PAGE_W - leftW;
  return new Table({
    layout: TableLayoutType.FIXED,
    width: { size: PAGE_W, type: WidthType.DXA },
    columnWidths: [leftW, rightW],
    borders: noBorders,
    rows: [new TableRow({ children: [
      new TableCell({
        width: { size: leftW, type: WidthType.DXA }, borders: thickBottom,
        verticalAlign: VerticalAlign.CENTER, margins: { bottom: 200 },
        children: [new Table({
          layout: TableLayoutType.FIXED,
          width: { size: leftW, type: WidthType.DXA },
          columnWidths: logo ? [1000, leftW - 1000] : [leftW],
          borders: noBorders,
          rows: [new TableRow({ children: [
            ...(logo ? [new TableCell({ width: { size: 1000, type: WidthType.DXA }, borders: noBorders, verticalAlign: VerticalAlign.CENTER, children: [new Paragraph({ children: [logo] })] })] : []),
            new TableCell({
              width: { size: logo ? leftW - 1000 : leftW, type: WidthType.DXA }, borders: noBorders, verticalAlign: VerticalAlign.CENTER,
              children: [p(txt(title, { bold: true, size: 36 })), p(txt(subtitle, { color: GREY, size: 18 }))],
            }),
          ] })],
        })],
      }),
      new TableCell({
        width: { size: rightW, type: WidthType.DXA }, borders: thickBottom,
        verticalAlign: VerticalAlign.TOP, margins: { bottom: 200 },
        children: right.map((r) => p(txt(r, { color: GREY, size: 18 }), AlignmentType.RIGHT)),
      }),
    ] })],
  });
}

function meta(pairs: [string, string][]) {
  const list = pairs.length % 2 ? [...pairs, ["", ""] as [string, string]] : pairs;
  const rows: TableRow[] = [];
  for (let i = 0; i < list.length; i += 2) {
    rows.push(new TableRow({ children: list.slice(i, i + 2).map(([k, v]) => new TableCell({
      width: { size: HALF, type: WidthType.DXA }, borders: noBorders, margins: { top: 50, bottom: 50 },
      children: [p(k ? [txt(`${k}: `, { color: GREY, bold: true }), txt(v || "—")] : [txt("")])],
    })) }));
  }
  return new Table({ layout: TableLayoutType.FIXED, width: { size: PAGE_W, type: WidthType.DXA }, columnWidths: [HALF, HALF], borders: noBorders, rows });
}

interface Col { title: string; width: number; center?: boolean; mono?: boolean; bold?: boolean }

function dataTable(cols: Col[], rows: string[][], empty: string, foot: { label: string; span: number; values: string[] }) {
  const widths = cols.map((c) => c.width);
  const head = new TableRow({ tableHeader: true, children: cols.map((c) =>
    cell([p(txt(c.title.toUpperCase(), { bold: true, color: "FFFFFF", size: 18 }), c.center ? AlignmentType.CENTER : AlignmentType.LEFT)], c.width, { fill: NAVY })) });
  const body = rows.length
    ? rows.map((r) => new TableRow({ cantSplit: true, children: r.map((v, i) =>
        cell([p(txt(v, { mono: cols[i].mono, bold: cols[i].bold }), cols[i].center ? AlignmentType.CENTER : AlignmentType.LEFT)], cols[i].width)) }))
    : [new TableRow({ children: [cell([p(txt(empty, { color: GREY }), AlignmentType.CENTER)], PAGE_W, { span: cols.length })] })];
  const spanW = widths.slice(0, foot.span).reduce((a, b) => a + b, 0);
  const footer = new TableRow({ children: [
    cell([p(txt(foot.label, { bold: true }), AlignmentType.RIGHT)], spanW, { span: foot.span, fill: FOOT_BG }),
    ...foot.values.map((v, i) => cell([p(txt(v, { bold: true }), AlignmentType.CENTER)], widths[foot.span + i], { fill: FOOT_BG })),
  ] });
  return new Table({ layout: TableLayoutType.FIXED, width: { size: PAGE_W, type: WidthType.DXA }, columnWidths: widths, rows: [head, ...body, footer] });
}

const section = (title: string) =>
  new Paragraph({ spacing: { before: 360, after: 120 }, children: [txt(title.toUpperCase(), { bold: true, size: 24 })] });

function signs() {
  return new Table({
    layout: TableLayoutType.FIXED, width: { size: PAGE_W, type: WidthType.DXA }, columnWidths: [HALF, HALF], borders: noBorders,
    rows: [new TableRow({ children: [
      new TableCell({ width: { size: HALF, type: WidthType.DXA }, borders: noBorders, children: [p(txt("Подпись отправителя: __________________", { color: GREY, size: 18 }))] }),
      new TableCell({ width: { size: HALF, type: WidthType.DXA }, borders: noBorders, children: [p(txt("Подпись получателя: __________________", { color: GREY, size: 18 }), AlignmentType.RIGHT)] }),
    ] })],
  });
}

async function save(children: (Paragraph | Table)[], fileName: string) {
  const doc = new Document({
    styles: { default: { document: { run: { font: FONT, size: 20, color: NAVY } } } },
    sections: [{
      properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 720, bottom: 720, left: 720, right: 720 } } },
      children,
    }],
  });
  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

// ── Разборный лист ──
export interface TeardownDocxData {
  logoUrl: string;
  number: string;
  date: string;
  carTitle: string;
  vin: string;
  year: string;
  mileage: string;
  mode: string;
  rows: { part: string; qty: number; needed: boolean }[];
  fileName: string;
}

export async function downloadTeardownDocx(d: TeardownDocxData) {
  const totalQty = d.rows.reduce((s, r) => s + r.qty, 0);
  await save([
    await header(d.logoUrl, "PACKING LIST", "Упаковочный / разборный лист", [`Дата: ${d.date}`, `№ ${d.number}`]),
    gap(160),
    meta([["Автомобиль", d.carTitle], ["VIN", d.vin], ["Год", d.year], ["Пробег", d.mileage], ["Тип разбора", d.mode]]),
    gap(160),
    dataTable(
      [
        { title: "№", width: 700, center: true },
        { title: "Наименование детали", width: 6366 },
        { title: "Кол-во", width: 1500, center: true },
        { title: "Нужно клиенту", width: 1900, center: true, bold: true },
      ],
      d.rows.map((r, i) => [String(i + 1), r.part, String(r.qty), r.needed ? "✓" : ""]),
      "Список пуст",
      { label: "ИТОГО позиций / штук:", span: 2, values: [`${d.rows.length} / ${totalQty}`, ""] },
    ),
    gap(500),
    signs(),
  ], d.fileName);
}

// ── Упаковочный лист контейнера ──
export interface ContainerDocxData {
  logoUrl: string;
  date: string;
  name: string;
  number: string;
  origin: string;
  status: string;
  parts: { group: string; part: string; qty: number }[];
  cars: { title: string; vin: string; order: string }[];
  fileName: string;
}

export async function downloadContainerDocx(d: ContainerDocxData) {
  const totalParts = d.parts.reduce((s, r) => s + r.qty, 0);
  await save([
    await header(d.logoUrl, "CONTAINER PACKING LIST", "Упаковочный лист контейнера", [`Дата: ${d.date}`]),
    gap(160),
    meta([["Контейнер", d.name], ["Номер контейнера", d.number], ["Направление", d.origin], ["Статус", d.status]]),
    section("Сводный список запчастей"),
    dataTable(
      [
        { title: "№", width: 700, center: true },
        { title: "Группа", width: 2600 },
        { title: "Наименование детали", width: 5166 },
        { title: "Кол-во (всего)", width: 2000, center: true },
      ],
      d.parts.map((r, i) => [String(i + 1), r.group, r.part, String(r.qty)]),
      "Нет деталей в разборных листах",
      { label: "ИТОГО позиций / деталей:", span: 2, values: [String(d.parts.length), String(totalParts)] },
    ),
    section("Машинокомплекты в контейнере"),
    dataTable(
      [
        { title: "№", width: 700, center: true },
        { title: "Машинокомплект", width: 4166 },
        { title: "VIN", width: 3400, mono: true },
        { title: "Заявка", width: 2200 },
      ],
      d.cars.map((c, i) => [String(i + 1), c.title || "—", c.vin || "—", c.order || "—"]),
      "Контейнер пуст",
      { label: "ИТОГО машинокомплектов:", span: 3, values: [String(d.cars.length)] },
    ),
    gap(500),
    signs(),
  ], d.fileName);
}

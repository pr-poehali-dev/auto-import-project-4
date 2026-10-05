import {
  AlignmentType, BorderStyle, Document, ImageRun, Packer, Paragraph, ShadingType,
  Table, TableCell, TableLayoutType, TableRow, TextRun, VerticalAlign, WidthType,
} from "docx";

// Разборный лист в Word — оформление повторяет PDF-версию
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

const NAVY = "1A2238";
const GREY = "6B7280";
const LINE = "C9CED8";
const FOOT_BG = "F1F3F7";
const FONT = "Arial";
const PAGE_W = 10466;
const COLS = [700, 6366, 1500, 1900];

const cellBorder = { style: BorderStyle.SINGLE, size: 4, color: LINE };
const borders = { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder };
const none = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: none, bottom: none, left: none, right: none, insideHorizontal: none, insideVertical: none };

const txt = (text: string, o: { bold?: boolean; color?: string; size?: number } = {}) =>
  new TextRun({ text, font: FONT, bold: o.bold, color: o.color ?? NAVY, size: o.size ?? 20 });

const cell = (children: Paragraph[], width: number, o: { fill?: string; span?: number; borders?: object } = {}) =>
  new TableCell({
    children, columnSpan: o.span, verticalAlign: VerticalAlign.CENTER,
    width: { size: width, type: WidthType.DXA },
    borders: o.borders ?? borders,
    shading: o.fill ? { type: ShadingType.CLEAR, color: "auto", fill: o.fill } : undefined,
    margins: { top: 90, bottom: 90, left: 130, right: 130 },
  });

const p = (runs: TextRun[] | TextRun, align: (typeof AlignmentType)[keyof typeof AlignmentType] = AlignmentType.LEFT) =>
  new Paragraph({ alignment: align, children: Array.isArray(runs) ? runs : [runs] });

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

export async function downloadTeardownDocx(d: TeardownDocxData) {
  const logo = await loadLogo(d.logoUrl);
  const leftW = 6800;
  const rightW = PAGE_W - leftW;

  const header = new Table({
    layout: TableLayoutType.FIXED,
    width: { size: PAGE_W, type: WidthType.DXA },
    columnWidths: [leftW, rightW],
    borders: { ...noBorders, bottom: { style: BorderStyle.SINGLE, size: 24, color: NAVY } },
    rows: [new TableRow({ children: [
      new TableCell({
        width: { size: leftW, type: WidthType.DXA },
        borders: { top: none, left: none, right: none, bottom: { style: BorderStyle.SINGLE, size: 24, color: NAVY } },
        verticalAlign: VerticalAlign.CENTER,
        margins: { bottom: 200 },
        children: [new Table({
          layout: TableLayoutType.FIXED,
          width: { size: leftW, type: WidthType.DXA },
          columnWidths: logo ? [1000, leftW - 1000] : [leftW],
          borders: noBorders,
          rows: [new TableRow({ children: [
            ...(logo ? [new TableCell({ width: { size: 1000, type: WidthType.DXA }, borders: noBorders, verticalAlign: VerticalAlign.CENTER, children: [new Paragraph({ children: [logo] })] })] : []),
            new TableCell({
              width: { size: logo ? leftW - 1000 : leftW, type: WidthType.DXA }, borders: noBorders, verticalAlign: VerticalAlign.CENTER,
              children: [
                p(txt("PACKING LIST", { bold: true, size: 36 })),
                p(txt("Упаковочный / разборный лист", { color: GREY, size: 18 })),
              ],
            }),
          ] })],
        })],
      }),
      new TableCell({
        width: { size: rightW, type: WidthType.DXA },
        borders: { top: none, left: none, right: none, bottom: { style: BorderStyle.SINGLE, size: 24, color: NAVY } },
        verticalAlign: VerticalAlign.TOP,
        margins: { bottom: 200 },
        children: [
          p(txt(`Дата: ${d.date}`, { color: GREY, size: 18 }), AlignmentType.RIGHT),
          p(txt(`№ ${d.number}`, { color: GREY, size: 18 }), AlignmentType.RIGHT),
        ],
      }),
    ] })],
  });

  const metaPairs: [string, string][] = [
    ["Автомобиль", d.carTitle || "—"], ["VIN", d.vin || "—"],
    ["Год", d.year || "—"], ["Пробег", d.mileage || "—"],
    ["Тип разбора", d.mode || "—"], ["", ""],
  ];
  const half = PAGE_W / 2;
  const metaRows: TableRow[] = [];
  for (let i = 0; i < metaPairs.length; i += 2) {
    metaRows.push(new TableRow({ children: metaPairs.slice(i, i + 2).map(([k, v]) => new TableCell({
      width: { size: half, type: WidthType.DXA }, borders: noBorders,
      margins: { top: 50, bottom: 50 },
      children: [p(k ? [txt(`${k}: `, { color: GREY, bold: true }), txt(v)] : [txt("")])],
    })) }));
  }
  const meta = new Table({
    layout: TableLayoutType.FIXED,
    width: { size: PAGE_W, type: WidthType.DXA },
    columnWidths: [half, half], borders: noBorders, rows: metaRows,
  });

  const headCell = (text: string, w: number, center = true) =>
    cell([p(txt(text.toUpperCase(), { bold: true, color: "FFFFFF", size: 18 }), center ? AlignmentType.CENTER : AlignmentType.LEFT)], w, { fill: NAVY });

  const totalQty = d.rows.reduce((s, r) => s + r.qty, 0);
  const bodyRows = d.rows.length
    ? d.rows.map((r, i) => new TableRow({ cantSplit: true, children: [
        cell([p(txt(String(i + 1)), AlignmentType.CENTER)], COLS[0]),
        cell([p(txt(r.part))], COLS[1]),
        cell([p(txt(String(r.qty)), AlignmentType.CENTER)], COLS[2]),
        cell([p(txt(r.needed ? "✓" : "", { bold: true }), AlignmentType.CENTER)], COLS[3]),
      ] }))
    : [new TableRow({ children: [cell([p(txt("Список пуст", { color: GREY }), AlignmentType.CENTER)], PAGE_W, { span: 4 })] })];

  const table = new Table({
    layout: TableLayoutType.FIXED,
    width: { size: PAGE_W, type: WidthType.DXA },
    columnWidths: COLS,
    rows: [
      new TableRow({ tableHeader: true, children: [
        headCell("№", COLS[0]), headCell("Наименование детали", COLS[1], false),
        headCell("Кол-во", COLS[2]), headCell("Нужно клиенту", COLS[3]),
      ] }),
      ...bodyRows,
      new TableRow({ children: [
        cell([p(txt("ИТОГО позиций / штук:", { bold: true }), AlignmentType.RIGHT)], COLS[0] + COLS[1], { span: 2, fill: FOOT_BG }),
        cell([p(txt(`${d.rows.length} / ${totalQty}`, { bold: true }), AlignmentType.CENTER)], COLS[2], { fill: FOOT_BG }),
        cell([p(txt(""))], COLS[3], { fill: FOOT_BG }),
      ] }),
    ],
  });

  const signs = new Table({
    layout: TableLayoutType.FIXED,
    width: { size: PAGE_W, type: WidthType.DXA },
    columnWidths: [half, half], borders: noBorders,
    rows: [new TableRow({ children: [
      new TableCell({ width: { size: half, type: WidthType.DXA }, borders: noBorders, children: [p(txt("Подпись отправителя: __________________", { color: GREY, size: 18 }))] }),
      new TableCell({ width: { size: half, type: WidthType.DXA }, borders: noBorders, children: [p(txt("Подпись получателя: __________________", { color: GREY, size: 18 }), AlignmentType.RIGHT)] }),
    ] })],
  });

  const gap = (after: number) => new Paragraph({ spacing: { after }, children: [] });

  const doc = new Document({
    styles: { default: { document: { run: { font: FONT, size: 20, color: NAVY } } } },
    sections: [{
      properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 720, bottom: 720, left: 720, right: 720 } } },
      children: [header, gap(160), meta, gap(160), table, gap(500), signs],
    }],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = d.fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

import type { WorkBook } from "xlsx";

// Лист книги, для которого нужно закрепить строки (freeze panes).
// xlsx (SheetJS CE) не умеет записывать pane, поэтому дописываем его в XML напрямую.
export interface FreezeSpec {
  sheetIndex: number;
  rows: number;
}

const addFreezePane = (xml: string, rows: number): string => {
  if (xml.includes("<pane ")) return xml;
  const pane =
    `<pane ySplit="${rows}" topLeftCell="A${rows + 1}" activePane="bottomLeft" state="frozen"/>` +
    `<selection pane="bottomLeft" activeCell="A${rows + 1}" sqref="A${rows + 1}"/>`;

  if (xml.includes("<sheetViews>")) {
    return xml.replace(/(<sheetView[^>]*?)(\/>|>)/, (_m, open: string, close: string) =>
      close === "/>" ? `${open}>${pane}</sheetView>` : `${open}>${pane}`
    );
  }
  return xml.replace(
    /(<worksheet[^>]*>)/,
    `$1<sheetViews><sheetView workbookViewId="0">${pane}</sheetView></sheetViews>`
  );
};

/**
 * Записывает книгу в файл, добавляя закрепление шапки на указанных листах.
 * Если что-то пойдёт не так — сохраняет обычный файл без закрепления.
 */
export const writeXlsxWithFreeze = async (
  wb: WorkBook,
  fileName: string,
  freeze: FreezeSpec[] = []
): Promise<void> => {
  const XLSX = await import("xlsx");

  const download = (data: BlobPart) => {
    const blob = new Blob([data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  const raw: ArrayBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });

  if (freeze.length === 0) {
    download(raw);
    return;
  }

  try {
    const { unzipSync, zipSync, strToU8, strFromU8 } = await import("fflate");
    const files = unzipSync(new Uint8Array(raw));
    for (const f of freeze) {
      const path = `xl/worksheets/sheet${f.sheetIndex + 1}.xml`;
      const src = files[path];
      if (!src || f.rows <= 0) continue;
      files[path] = strToU8(addFreezePane(strFromU8(src), f.rows));
    }
    download(zipSync(files));
  } catch {
    download(raw);
  }
};

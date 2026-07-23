export type CsvCellValue = string | number | null | undefined;

const CSV_BOM = "\uFEFF";

/** Escape a single CSV field, quoting when it contains comma/quote/newline. */
export function escapeCsvField(value: CsvCellValue): string {
  if (value === null || value === undefined) return "";
  const text = String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function toCsvRow(cells: CsvCellValue[]): string {
  return cells.map(escapeCsvField).join(",");
}

export interface CsvSection {
  title: string;
  headers: string[];
  rows: CsvCellValue[][];
}

/**
 * Build a multi-section CSV document.
 * Prepends a UTF-8 BOM so spreadsheet apps (e.g. Excel) render Chinese correctly.
 */
export function buildCsv(sections: CsvSection[]): string {
  const lines: string[] = [];
  sections.forEach((section, index) => {
    if (index > 0) lines.push("");
    lines.push(toCsvRow([section.title]));
    lines.push(toCsvRow(section.headers));
    for (const row of section.rows) {
      lines.push(toCsvRow(row));
    }
  });
  return CSV_BOM + lines.join("\r\n");
}

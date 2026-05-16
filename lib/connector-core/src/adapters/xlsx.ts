/**
 * XLSX import adapter (SheetJS / xlsx).
 *
 * Accepts a Buffer containing an Excel file (.xlsx, .xls, .xlsm) and returns
 * an array of RawEventRow objects keyed by the header row values.
 *
 * Features:
 *  - Auto-detects the first non-empty header row
 *  - Handles merged cells in headers (propagates value to the right)
 *  - Converts Date serial values to ISO strings
 *  - Skips completely empty rows
 */

import type { RawEventRow } from "../types.js";

export interface XlsxAdapterOptions {
  /** Sheet name or index. Default: first sheet */
  sheet?: string | number;
  /** Row index (0-based) containing headers. Default: auto-detect */
  headerRow?: number;
  /** Maximum rows to parse (0 = unlimited). Default: 0 */
  maxRows?: number;
  /** Date output format: "iso" (default) or "local" */
  dateFormat?: "iso" | "local";
}

// Lazy-load xlsx so it doesn't fail at import time in environments without it
async function loadXlsx() {
  try {
    const mod = await import("xlsx");
    return mod.default ?? mod;
  } catch {
    throw new Error(
      "xlsx package not installed — run: pnpm add xlsx in the consuming package",
    );
  }
}

// ── Excel serial date → ISO string ───────────────────────────────────────────

function serialDateToIso(serial: number): string {
  // Excel's epoch: Dec 30, 1899. Adjust for the infamous 1900 leap-year bug.
  const ms = (serial - 25569) * 86400 * 1000;
  return new Date(ms).toISOString().slice(0, 10);
}

// ── Main parse function ───────────────────────────────────────────────────────

export async function parseXlsx(
  buffer: Buffer,
  options: XlsxAdapterOptions = {},
): Promise<RawEventRow[]> {
  const XLSX = await loadXlsx();

  const workbook = XLSX.read(buffer, {
    type: "buffer",
    cellDates: false, // we handle date conversion manually
    raw: false,
    dateNF: "yyyy-mm-dd",
  });

  const sheetName =
    typeof options.sheet === "string"
      ? options.sheet
      : workbook.SheetNames[options.sheet ?? 0]!;

  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    throw new Error(`Sheet "${sheetName}" not found in workbook`);
  }

  // Convert to row-major array of arrays
  const rawRows: unknown[][] = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: "",
    blankrows: true,
  });

  if (rawRows.length === 0) return [];

  // Detect header row: first row where > 30% of cells are non-empty strings
  let headerRowIdx = options.headerRow ?? -1;
  if (headerRowIdx === -1) {
    for (let i = 0; i < Math.min(10, rawRows.length); i++) {
      const row = rawRows[i] ?? [];
      const filled = row.filter((c) => typeof c === "string" && c.trim()).length;
      if (filled > 0 && filled / row.length > 0.3) {
        headerRowIdx = i;
        break;
      }
    }
    if (headerRowIdx === -1) headerRowIdx = 0;
  }

  const headerRow = rawRows[headerRowIdx] ?? [];
  // Propagate merged-cell headers: blank cell inherits last non-blank header
  const headers: string[] = [];
  let lastHeader = "";
  for (const cell of headerRow) {
    const h = typeof cell === "string" ? cell.trim() : String(cell ?? "");
    if (h) {
      lastHeader = h;
      headers.push(h);
    } else {
      headers.push(lastHeader ? `${lastHeader}_cont` : "");
    }
  }

  const dataStart = headerRowIdx + 1;
  const maxRows = options.maxRows ?? 0;
  const results: RawEventRow[] = [];

  for (let i = dataStart; i < rawRows.length; i++) {
    if (maxRows > 0 && results.length >= maxRows) break;

    const rawRow = rawRows[i] ?? [];
    // Skip fully blank rows
    if (rawRow.every((c) => c === "" || c === null || c === undefined)) continue;

    const row: RawEventRow = {};
    headers.forEach((header, idx) => {
      if (!header) return;
      const cell = rawRow[idx];
      if (cell === null || cell === undefined || cell === "") {
        row[header] = "";
      } else if (typeof cell === "number") {
        // Heuristic: Excel date serials are typically 30000–50000
        if (cell > 30000 && cell < 60000 && Number.isInteger(cell)) {
          row[header] = serialDateToIso(cell);
        } else {
          row[header] = cell;
        }
      } else {
        row[header] = String(cell).trim();
      }
    });
    results.push(row);
  }

  return results;
}

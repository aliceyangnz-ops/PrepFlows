/**
 * CSV import adapter.
 *
 * Accepts raw CSV string content (with or without a header row) and
 * returns an array of RawEventRow objects keyed by header name.
 *
 * Features:
 *  - Handles quoted fields (including embedded commas and newlines)
 *  - Trims whitespace from keys and values
 *  - Skips blank rows
 *  - Supports comma, semicolon, and tab delimiters (auto-detected)
 */

import type { RawEventRow } from "../types.js";

export interface CsvAdapterOptions {
  /** Delimiter — auto-detected from first line if not provided */
  delimiter?: "," | ";" | "\t";
  /** Row index (0-based) containing headers. Default: 0 */
  headerRow?: number;
  /** Row index to start reading data. Default: headerRow + 1 */
  dataStartRow?: number;
  /** Maximum rows to parse (0 = unlimited). Default: 0 */
  maxRows?: number;
}

// ── CSV tokenizer ─────────────────────────────────────────────────────────────

function detectDelimiter(firstLine: string): "," | ";" | "\t" {
  const tabs   = (firstLine.match(/\t/g) ?? []).length;
  const semis  = (firstLine.match(/;/g)  ?? []).length;
  const commas = (firstLine.match(/,/g)  ?? []).length;
  if (tabs >= semis && tabs >= commas) return "\t";
  if (semis > commas) return ";";
  return ",";
}

function tokenizeLine(line: string, delimiter: string): string[] {
  const tokens: string[] = [];
  let cur = "";
  let inQuote = false;
  let i = 0;
  while (i < line.length) {
    const ch = line[i]!;
    if (ch === '"') {
      if (inQuote && line[i + 1] === '"') {
        // escaped quote
        cur += '"';
        i += 2;
      } else {
        inQuote = !inQuote;
        i++;
      }
    } else if (!inQuote && line.startsWith(delimiter, i)) {
      tokens.push(cur.trim());
      cur = "";
      i += delimiter.length;
    } else {
      cur += ch;
      i++;
    }
  }
  tokens.push(cur.trim());
  return tokens;
}

// ── Main parse function ───────────────────────────────────────────────────────

export function parseCsv(
  content: string,
  options: CsvAdapterOptions = {},
): RawEventRow[] {
  const lines = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  if (lines.length === 0) return [];

  const headerRowIdx  = options.headerRow     ?? 0;
  const dataStartIdx  = options.dataStartRow  ?? headerRowIdx + 1;
  const maxRows       = options.maxRows       ?? 0;
  const delimiter     = options.delimiter     ?? detectDelimiter(lines[0] ?? "");

  const headerLine = lines[headerRowIdx];
  if (!headerLine) return [];
  const headers = tokenizeLine(headerLine, delimiter).map((h) => h.trim());

  const results: RawEventRow[] = [];

  for (let i = dataStartIdx; i < lines.length; i++) {
    if (maxRows > 0 && results.length >= maxRows) break;
    const line = lines[i]?.trim() ?? "";
    if (!line) continue;

    const values = tokenizeLine(line, delimiter);
    const row: RawEventRow = {};
    headers.forEach((header, idx) => {
      if (header) row[header] = values[idx] ?? "";
    });
    results.push(row);
  }

  return results;
}

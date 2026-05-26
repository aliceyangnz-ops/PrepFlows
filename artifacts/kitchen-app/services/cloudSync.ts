/**
 * Cloud Sync Service
 *
 * Bridges the local AsyncStorage KitchenContext with the PostgreSQL database
 * via the API server. Handles:
 *  - Pulling newly imported functions from the cloud
 *  - Polling for real-time updates
 *  - Posting parse requests and confirming imports
 */

import { Platform } from "react-native";
import type { KitchenFunction } from "@/context/KitchenContext";

const BASE_URL = (() => {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    return `${window.location.protocol}//${window.location.host}/api`;
  }
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  if (domain) return `https://${domain}/api`;
  return "http://localhost:5000/api";
})();

// ─── Types ─────────────────────────────────────────────────────────────────

export interface ColumnMappingDetail {
  canonical: string;
  label: string;
  header: string | null;
  confidence: number;
  method: "exact" | "alias" | "smart" | "fuzzy" | "override" | "unmatched";
  alternatives: Array<{ header: string; score: number }>;
}

export interface ImportParseRequest {
  rows: Record<string, unknown>[];
  filename: string;
  uploadedBy?: string;
  columnOverrides?: Record<string, string>;
}

export interface ImportParseResult {
  jobId: string;
  filename: string;
  sourceSystem: string;
  columnMapping: Record<string, string>;
  columnMappingDetails: ColumnMappingDetail[];
  totalRows: number;
  validRows: number;
  errors: Array<{ row: number; field: string; message: string }>;
  warnings: Array<{ row: number; field: string; message: string }>;
  preview: Array<Record<string, unknown>>;
}

export interface ImportConfirmResult {
  jobId: string;
  imported: number;
  failed: number;
  errors: Array<{ row: number; field: string; message: string }>;
  importedIds: string[];
}

export interface ImportHistoryItem {
  id: string;
  status: string;
  fileName: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: string;
  completedAt: string | null;
  totalRows: number;
  importedRows: number;
  failedRows: number;
  sourceSystem: string;
  errors: Array<{ row: number; field: string; message: string }>;
  warnings: Array<{ row: number; field: string; message: string }>;
}

// ─── Cloud function shape (from DB) → KitchenFunction ─────────────────────

function dbRowToKitchenFunction(row: Record<string, unknown>): KitchenFunction {
  return {
    id:                   String(row.id || ""),
    name:                 String(row.name || ""),
    room:                 String(row.room || ""),
    floor:                String(row.floor || ""),
    functionType:         (row.functionType || row.function_type || "A-la-carte") as KitchenFunction["functionType"],
    date:                 row.date ? String(row.date) : undefined,
    startTime:            String(row.startTime || row.start_time || "09:00"),
    endTime:              String(row.endTime   || row.end_time   || "17:00"),
    guestCount:           Number(row.guestCount || row.guest_count || 0),
    status:               (row.status || "upcoming") as KitchenFunction["status"],
    menu:                 Array.isArray(row.menu) ? (row.menu as string[]) : [],
    dietaryRequirements:  Array.isArray(row.dietaryRequirements || row.dietary_requirements)
                            ? ((row.dietaryRequirements || row.dietary_requirements) as KitchenFunction["dietaryRequirements"])
                            : [],
    serviceTimes:         (row.serviceTimes || row.service_times) as KitchenFunction["serviceTimes"],
    serviceEvents:        Array.isArray(row.serviceEvents || row.service_events)
                            ? ((row.serviceEvents || row.service_events) as KitchenFunction["serviceEvents"])
                            : [],
    teamIds:              Array.isArray(row.teamIds || row.team_ids)
                            ? ((row.teamIds || row.team_ids) as string[])
                            : [],
    timeline:             Array.isArray(row.timeline) ? (row.timeline as KitchenFunction["timeline"]) : [],
    chefInCharge:         row.chefInCharge || row.chef_in_charge ? String(row.chefInCharge || row.chef_in_charge) : undefined,
  };
}

// ─── API helpers ───────────────────────────────────────────────────────────

async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error: string }).error || `API error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error: string }).error || `API error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ─── Public API ────────────────────────────────────────────────────────────

/**
 * Send parsed rows to the server for validation and job creation.
 */
export async function parseImport(req: ImportParseRequest): Promise<ImportParseResult> {
  return apiPost<ImportParseResult>("/import/parse", req);
}

/**
 * Confirm an import job — writes functions to the database.
 */
export async function confirmImport(
  jobId: string,
  rows: Record<string, unknown>[],
  uploadedBy?: string,
): Promise<ImportConfirmResult> {
  return apiPost<ImportConfirmResult>(`/import/confirm/${jobId}`, { rows, uploadedBy });
}

/**
 * Fetch import history log.
 */
export async function fetchImportHistory(): Promise<ImportHistoryItem[]> {
  return apiGet<ImportHistoryItem[]>("/import/history");
}

/**
 * Fetch all cloud functions and convert to KitchenFunction shape.
 */
export async function fetchCloudFunctions(): Promise<KitchenFunction[]> {
  const rows = await apiGet<Record<string, unknown>[]>("/functions");
  return rows.map(dbRowToKitchenFunction);
}

/**
 * Fetch cloud functions created after a timestamp (for polling).
 */
export async function fetchFunctionsSince(sinceMs: number): Promise<KitchenFunction[]> {
  const rows = await apiGet<Record<string, unknown>[]>(`/functions/since/${sinceMs}`);
  return rows.map(dbRowToKitchenFunction);
}

// ─── AI Parse ──────────────────────────────────────────────────────────────

export interface ParsedFunctionData {
  name: string;
  room: string;
  floor: string;
  date: string;
  functionType: string;
  startTime: string;
  endTime: string;
  guestCount: number;
  menu: string[];
  serviceEvents: Array<{ time: string; label: string }>;
  dietaryRequirements: Array<{ name: string; count: number; note: string }>;
  specialRequirements: string[];
  prepItems: Array<{ team: string; dish: string; quantity: string; deadline: string }>;
  confidence: Record<string, number>;
  aiUsed: boolean;
}

/**
 * Parse free-form text (paste from email, booking brief, etc.) into structured function data.
 */
export async function parseAIText(content: string): Promise<ParsedFunctionData> {
  return apiPost<ParsedFunctionData>("/import/ai-parse", { content, type: "text" });
}

/**
 * Parse a base64-encoded image (document scan or photo) into structured function data.
 * Requires AI vision to be enabled on the server; returns partial data otherwise.
 */
export async function parseAIImage(base64: string, mimeType: string): Promise<ParsedFunctionData> {
  return apiPost<ParsedFunctionData>("/import/ai-parse", { content: base64, type: "image_base64", mimeType });
}

/**
 * Upload a document (Word/PDF/Excel) as base64 for server-side text extraction and parsing.
 */
export async function parseDocument(base64: string, filename: string, mimeType: string): Promise<ParsedFunctionData> {
  return apiPost<ParsedFunctionData>("/import/parse-document-base64", { base64, filename, mimeType });
}

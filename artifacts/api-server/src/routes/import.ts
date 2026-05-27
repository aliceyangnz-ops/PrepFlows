import { Router, type IRouter, type Request, type Response } from "express";
import { db, importJobsTable, kitchenFunctionsTable } from "@workspace/db";
import { eq, desc, gte } from "drizzle-orm";
import {
  autoMapColumns,
  scoreColumnMapping,
  detectSourceSystem,
  mapRawRow,
  validateRow,
  convertRowToFunction,
  type ColumnMappingDetail,
  type ValidationError,
  type ValidationWarning,
} from "../services/importParser.js";

const router: IRouter = Router();

/**
 * POST /api/import/parse
 * Body: { rows: Record<string,unknown>[], filename: string, uploadedBy?: string }
 *
 * Accepts pre-parsed rows (XLSX parsing happens client-side — the app converts
 * the spreadsheet to JSON rows and posts them here for validation + job creation).
 *
 * Returns: import job record + preview of parsed events + column mapping
 */
router.post("/import/parse", async (req: Request, res: Response) => {
  const {
    rows,
    filename,
    uploadedBy = "unknown",
    columnOverrides,
  } = req.body as {
    rows: Record<string, unknown>[];
    filename: string;
    uploadedBy?: string;
    columnOverrides?: Record<string, string>;
  };

  if (!Array.isArray(rows) || rows.length === 0) {
    res.status(400).json({ error: "No rows provided" });
    return;
  }

  const headers = Object.keys(rows[0] || {});
  const columnMappingDetails: ColumnMappingDetail[] = scoreColumnMapping(
    headers,
    columnOverrides,
  );
  const columnMapping = autoMapColumns(headers, columnOverrides);
  const sourceSystem = detectSourceSystem(filename || "", headers);

  const seenNames = new Set<string>();
  const allErrors: ValidationError[] = [];
  const allWarnings: ValidationWarning[] = [];
  const parsedRows = rows.map((raw, i) => {
    const parsed = mapRawRow(raw, columnMapping);
    const { errors, warnings } = validateRow(parsed, i + 1, seenNames);
    allErrors.push(...errors);
    allWarnings.push(...warnings);
    if (parsed.name) seenNames.add(parsed.name.trim().toLowerCase());
    return parsed;
  });

  const [job] = await db
    .insert(importJobsTable)
    .values({
      fileName: filename || "upload.xlsx",
      fileSize: 0,
      uploadedBy,
      status: "pending",
      totalRows: rows.length,
      importedRows: 0,
      failedRows: allErrors.length,
      sourceSystem,
      columnMapping,
      errors: allErrors,
      warnings: allWarnings,
      rawPreview: rows.slice(0, 5) as Record<string, unknown>[],
    })
    .returning();

  res.json({
    jobId: job.id,
    filename,
    sourceSystem,
    columnMapping,
    columnMappingDetails,
    totalRows: rows.length,
    validRows: rows.length - allErrors.filter((e) => e.field === "name").length,
    errors: allErrors,
    warnings: allWarnings,
    preview: parsedRows.slice(0, 5),
  });
});

/**
 * POST /api/import/confirm/:jobId
 * Executes the actual import — writes kitchen functions to the database.
 */
router.post("/import/confirm/:jobId", async (req: Request, res: Response) => {
  const jobIdParam = req.params["jobId"];
  const jobId = Array.isArray(jobIdParam) ? jobIdParam[0] : jobIdParam;

  const { rows, uploadedBy = "unknown" } = req.body as {
    rows: Record<string, unknown>[];
    uploadedBy?: string;
  };

  if (!jobId) {
    res.status(400).json({ error: "jobId is required" });
    return;
  }

  const [job] = await db
    .select()
    .from(importJobsTable)
    .where(eq(importJobsTable.id, jobId));

  if (!job) {
    res.status(404).json({ error: "Import job not found" });
    return;
  }

  await db
    .update(importJobsTable)
    .set({ status: "processing" })
    .where(eq(importJobsTable.id, jobId));

  const columnMapping = (job.columnMapping as Record<string, string>) || {};
  const sourceSystem = job.sourceSystem as ReturnType<
    typeof detectSourceSystem
  >;

  let imported = 0;
  let failed = 0;
  const errors: ValidationError[] = [];
  const importedIds: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const raw = rows[i];
    if (!raw) continue;
    const parsed = mapRawRow(raw, columnMapping);

    if (!parsed.name || parsed.name === "(Unnamed Event)") {
      failed++;
      errors.push({
        row: i + 1,
        field: "name",
        message: "Row skipped — no event name",
      });
      continue;
    }

    try {
      const fn = convertRowToFunction(parsed, jobId, sourceSystem);
      await db.insert(kitchenFunctionsTable).values({
        ...fn,
        importJobId: jobId,
        sourceSystem,
      });
      importedIds.push(fn.id);
      imported++;
    } catch (err) {
      failed++;
      errors.push({
        row: i + 1,
        field: "general",
        message: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  await db
    .update(importJobsTable)
    .set({
      status: failed === rows.length ? "failed" : "completed",
      completedAt: new Date(),
      importedRows: imported,
      failedRows: failed,
      errors,
    })
    .where(eq(importJobsTable.id, jobId));

  res.json({ jobId, imported, failed, errors, importedIds });
});

/**
 * GET /api/import/history
 */
router.get("/import/history", async (_req: Request, res: Response) => {
  const history = await db
    .select()
    .from(importJobsTable)
    .orderBy(desc(importJobsTable.uploadedAt))
    .limit(50);
  res.json(history);
});

/**
 * GET /api/import/history/:jobId
 */
router.get("/import/history/:jobId", async (req: Request, res: Response) => {
  const jobIdParam = req.params["jobId"];
  const jobId = Array.isArray(jobIdParam) ? jobIdParam[0] : jobIdParam;

  const [job] = await db
    .select()
    .from(importJobsTable)
    .where(eq(importJobsTable.id, jobId));

  if (!job) {
    res.status(404).json({ error: "Import job not found" });
    return;
  }
  res.json(job);
});

/**
 * GET /api/functions
 * All kitchen functions — used by the app to sync cloud state into local context.
 */
router.get("/functions", async (_req: Request, res: Response) => {
  const functions = await db
    .select()
    .from(kitchenFunctionsTable)
    .orderBy(desc(kitchenFunctionsTable.createdAt));
  res.json(functions);
});

/**
 * GET /api/functions/since/:timestamp
 * Functions created after a unix timestamp (ms) — used for real-time polling.
 */
router.get(
  "/functions/since/:timestamp",
  async (req: Request, res: Response) => {
    const tsParam = req.params["timestamp"];
    const ts = parseInt(
      Array.isArray(tsParam) ? (tsParam[0] ?? "0") : tsParam,
      10,
    );
    if (isNaN(ts)) {
      res.status(400).json({ error: "Invalid timestamp" });
      return;
    }

    const since = new Date(ts);
    const functions = await db
      .select()
      .from(kitchenFunctionsTable)
      .where(gte(kitchenFunctionsTable.createdAt, since))
      .orderBy(desc(kitchenFunctionsTable.createdAt));

    res.json(functions);
  },
);

export default router;

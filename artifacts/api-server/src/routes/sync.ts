/**
 * /api/sync — trigger syncs, query records, and stream SSE events.
 *
 * POST   /api/sync/:connectorId          — trigger a manual file-import sync
 * GET    /api/sync/records               — paginated sync history
 * GET    /api/sync/records/:id           — single sync record
 * GET    /api/sync/events                — SSE stream for real-time updates
 * DELETE /api/sync/records/:id           — delete one record
 */

import { Router } from "express";
import { desc, eq } from "drizzle-orm";
import { db, syncRecordsTable } from "@workspace/db";
import { parseCsv, parseJson, parseXlsx } from "@workspace/connector-core";
import { addSseSubscriber, broadcastSseEvent, runSync } from "../services/syncEngine.js";

const router = Router();

// ── SSE stream ────────────────────────────────────────────────────────────────

router.get("/sync/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  // Initial ping so the client knows the connection is live
  res.write(`: ping\n\n`);

  addSseSubscriber(res);

  // Keep-alive heartbeat every 30 s
  const heartbeat = setInterval(() => {
    try {
      res.write(`: heartbeat\n\n`);
    } catch {
      clearInterval(heartbeat);
    }
  }, 30_000);

  req.on("close", () => clearInterval(heartbeat));
});

// ── Trigger manual sync ───────────────────────────────────────────────────────

router.post("/sync/:connectorId", async (req, res) => {
  const { connectorId } = req.params as { connectorId: string };
  const contentType = (req.headers["content-type"] ?? "").toLowerCase();

  try {
    let rows;

    if (contentType.includes("text/csv") || contentType.includes("text/plain")) {
      // CSV upload
      const body = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
      rows = parseCsv(body);
    } else if (
      contentType.includes("application/vnd.openxmlformats") ||
      contentType.includes("application/vnd.ms-excel") ||
      contentType.includes("application/octet-stream")
    ) {
      // XLSX upload (raw buffer via body-parser limit increase)
      const buffer = req.body instanceof Buffer ? req.body : Buffer.from(req.body as string, "binary");
      rows = await parseXlsx(buffer);
    } else {
      // JSON payload
      rows = parseJson(req.body, {});
    }

    if (!rows || rows.length === 0) {
      return res.status(400).json({ error: "No data rows found in request body" });
    }

    const result = await runSync({ connectorConfigId: connectorId, rows, trigger: "manual" });
    return res.json(result);
  } catch (err) {
    req.log.error({ err }, "sync trigger failed");
    const msg = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: msg });
  }
});

// ── Sync records ──────────────────────────────────────────────────────────────

router.get("/sync/records", async (req, res) => {
  try {
    const limit  = Math.min(Number(req.query["limit"] ?? 50), 200);
    const offset = Number(req.query["offset"] ?? 0);
    const connectorId = req.query["connectorId"] as string | undefined;

    const query = db
      .select()
      .from(syncRecordsTable)
      .orderBy(desc(syncRecordsTable.startedAt))
      .limit(limit)
      .offset(offset);

    if (connectorId) {
      query.where(eq(syncRecordsTable.connectorConfigId, connectorId));
    }

    const records = await query;
    return res.json({ records, limit, offset });
  } catch (err) {
    req.log.error({ err }, "list sync records failed");
    return res.status(500).json({ error: "Failed to list sync records" });
  }
});

router.get("/sync/records/:id", async (req, res) => {
  try {
    const [record] = await db
      .select()
      .from(syncRecordsTable)
      .where(eq(syncRecordsTable.id, req.params.id!))
      .limit(1);
    if (!record) return res.status(404).json({ error: "Not found" });
    return res.json({ record });
  } catch (err) {
    req.log.error({ err }, "get sync record failed");
    return res.status(500).json({ error: "Failed to get sync record" });
  }
});

router.delete("/sync/records/:id", async (req, res) => {
  try {
    await db.delete(syncRecordsTable).where(eq(syncRecordsTable.id, req.params.id!));
    return res.json({ deleted: true });
  } catch (err) {
    req.log.error({ err }, "delete sync record failed");
    return res.status(500).json({ error: "Failed to delete sync record" });
  }
});

// ── Broadcast test event (dev only) ──────────────────────────────────────────

router.post("/sync/broadcast-test", (req, res) => {
  if (process.env["NODE_ENV"] === "production") {
    return res.status(404).json({ error: "Not found" });
  }
  broadcastSseEvent({
    type: "sync_started",
    message: "Test event from server",
    timestamp: new Date().toISOString(),
  });
  return res.json({ sent: true });
});

export default router;

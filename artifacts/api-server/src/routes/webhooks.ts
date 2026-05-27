/**
 * /api/webhooks — incoming webhook listener for all connector types.
 *
 * POST /api/webhooks/:source/:token
 *
 * Each connector config has a unique webhookPath like:
 *   /api/webhooks/moments/abc12345
 *
 * Verification flow:
 *  1. Look up the connector config by source + token suffix
 *  2. If webhookSecret is set, verify the HMAC signature
 *  3. Log the raw payload to webhook_events
 *  4. Parse rows using the connector's parseWebhookPayload()
 *  5. Run the sync engine
 *  6. Return 200 immediately (respond fast so PMS retries don't trigger)
 */

import { Router } from "express";
import { and, eq, like } from "drizzle-orm";
import { db, connectorConfigsTable } from "@workspace/db";
import { getConnector, type ConnectorSource } from "@workspace/connector-core";
import {
  runSync,
  logWebhookEvent,
  markWebhookProcessed,
  broadcastSseEvent,
} from "../services/syncEngine.js";
import { logger } from "../lib/logger.js";

const router = Router();

// ── Main webhook handler ──────────────────────────────────────────────────────

router.post("/webhooks/:source/:token", async (req, res) => {
  const { source, token } = req.params as { source: string; token: string };

  // Validate source
  const validSources: ConnectorSource[] = [
    "moments",
    "delphi",
    "opera",
    "ivvy",
    "tripleseat",
    "priava",
  ];
  if (!validSources.includes(source as ConnectorSource)) {
    return res.status(404).json({ error: "Unknown source" });
  }

  const webhookPath = `/api/webhooks/${source}/${token}`;

  try {
    // Find the connector config for this path
    const [config] = await db
      .select()
      .from(connectorConfigsTable)
      .where(
        and(
          eq(connectorConfigsTable.source, source as ConnectorSource),
          like(connectorConfigsTable.webhookPath, `%${token}`),
        ),
      )
      .limit(1);

    if (!config) {
      logger.warn({ source, token }, "webhook: no connector found for path");
      // Return 200 to prevent retries from PMS systems
      return res.status(200).json({ received: true });
    }

    const connector = getConnector(config.source as ConnectorSource);

    // Verify signature if secret is configured
    if (config.webhookSecret && connector.webhookSignatureHeader) {
      const sigHeader = connector.webhookSignatureHeader.toLowerCase();
      const signature = req.headers[sigHeader] as string | undefined;
      const rawBody = JSON.stringify(req.body);

      if (!signature) {
        logger.warn(
          { source, configId: config.id },
          "webhook: missing signature header",
        );
        return res.status(401).json({ error: "Missing signature" });
      }

      const valid = connector.verifyWebhookSignature(
        rawBody,
        signature,
        config.webhookSecret,
      );
      if (!valid) {
        logger.warn(
          { source, configId: config.id },
          "webhook: invalid signature",
        );
        return res.status(401).json({ error: "Invalid signature" });
      }
    }

    // Log the raw payload
    const headers: Record<string, string> = {};
    for (const [k, v] of Object.entries(req.headers)) {
      if (typeof v === "string") headers[k] = v;
    }
    const webhookEventId = await logWebhookEvent({
      connectorConfigId: config.id,
      source: config.source as ConnectorSource,
      payload: req.body as Record<string, unknown>,
      headers,
    });

    // Broadcast webhook received event
    broadcastSseEvent({
      type: "webhook_received",
      connectorConfigId: config.id,
      connectorName: config.name,
      source: config.source as ConnectorSource,
      message: `Webhook received from ${connector.displayName}`,
      timestamp: new Date().toISOString(),
    });

    // Respond immediately — process async
    res.status(200).json({ received: true });

    // Parse and sync
    try {
      const result = connector.parseWebhookPayload(headers, req.body);
      if (result && result.rows.length > 0) {
        await runSync({
          connectorConfigId: config.id,
          rows: result.rows,
          trigger: "webhook",
        });
        await markWebhookProcessed(webhookEventId);
      } else {
        await markWebhookProcessed(webhookEventId);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await markWebhookProcessed(webhookEventId, message);
      logger.error({ err, webhookEventId }, "webhook processing failed");
    }

    return;
  } catch (err) {
    logger.error({ err, source, token }, "webhook handler error");
    return res.status(500).json({ error: "Internal error" });
  }
});

// ── List recent webhook events ────────────────────────────────────────────────

import { desc } from "drizzle-orm";
import { webhookEventsTable } from "@workspace/db";

router.get("/webhooks/events", async (req, res) => {
  try {
    const limit = Math.min(Number(req.query["limit"] ?? 50), 200);
    const events = await db
      .select()
      .from(webhookEventsTable)
      .orderBy(desc(webhookEventsTable.receivedAt))
      .limit(limit);
    return res.json({ events });
  } catch (err) {
    req.log.error({ err }, "list webhook events failed");
    return res.status(500).json({ error: "Failed to list webhook events" });
  }
});

export default router;

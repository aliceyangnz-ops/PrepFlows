import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "path";
import { existsSync } from "fs";
import { fileURLToPath } from "url";
import router from "./routes/index.js";
import { WebhookHandlers } from "./webhookHandlers.js";
import { logger } from "./lib/logger.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app: Express = express();

// ── Stripe webhook — MUST be registered before express.json() ────────────────
// Stripe signature verification requires the raw Buffer body.
app.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const signature = req.headers["stripe-signature"];
    if (!signature) {
      res.status(400).json({ error: "Missing stripe-signature header" });
      return;
    }
    const sig = Array.isArray(signature) ? signature[0] : signature;

    try {
      await WebhookHandlers.processWebhook(req.body as Buffer, sig);
      res.status(200).json({ received: true });
    } catch (err: any) {
      logger.error({ err }, "Stripe webhook error");
      res.status(400).json({ error: "Webhook processing failed" });
    }
  },
);

// ── General middleware (after webhook) ───────────────────────────────────────
app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

// ── Serve sync-dashboard static files ────────────────────────────────────────
const dashboardDist = path.resolve(
  __dirname,
  "../../../artifacts/sync-dashboard/dist/public",
);
if (existsSync(dashboardDist)) {
  app.use("/sync-dashboard", express.static(dashboardDist));
  app.get(["/sync-dashboard", "/sync-dashboard/*path"], (_req, res) => {
    res.sendFile(path.join(dashboardDist, "index.html"));
  });
  logger.info({ dashboardDist }, "Serving sync-dashboard static files");
} else {
  logger.warn(
    { dashboardDist },
    "sync-dashboard dist not found — dashboard will not be served",
  );
}

export default app;

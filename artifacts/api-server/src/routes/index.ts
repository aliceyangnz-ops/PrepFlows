import { Router, type IRouter } from "express";
import healthRouter     from "./health.js";
import importRouter     from "./import.js";
import connectorsRouter from "./connectors.js";
import syncRouter       from "./sync.js";
import webhooksRouter   from "./webhooks.js";
import stripeRouter     from "./stripe.js";
import authRouter       from "./auth.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(importRouter);
router.use(connectorsRouter);
router.use(syncRouter);
router.use(webhooksRouter);
router.use(stripeRouter);
router.use(authRouter);

export default router;

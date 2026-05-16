import { Router, type IRouter } from "express";
import healthRouter    from "./health.js";
import importRouter    from "./import.js";
import connectorsRouter from "./connectors.js";
import syncRouter      from "./sync.js";
import webhooksRouter  from "./webhooks.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(importRouter);
router.use(connectorsRouter);
router.use(syncRouter);
router.use(webhooksRouter);

export default router;

import { Router } from "express";

import { createHealthRouter } from "./modules/health/health.routes.js";
import type { ReadinessCheck } from "./modules/health/health.service.js";

export function createApiRouter(readinessCheck: ReadinessCheck): Router {
  const router = Router();

  router.use("/health", createHealthRouter(readinessCheck));

  return router;
}

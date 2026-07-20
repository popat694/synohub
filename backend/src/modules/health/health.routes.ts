import { Router } from "express";

import { HealthController } from "./health.controller.js";
import { HealthService, type ReadinessCheck } from "./health.service.js";

export function createHealthRouter(readinessCheck: ReadinessCheck): Router {
  const router = Router();
  const controller = new HealthController(new HealthService(readinessCheck));

  router.get("/", controller.getLiveness);
  router.get("/ready", controller.getReadiness);

  return router;
}

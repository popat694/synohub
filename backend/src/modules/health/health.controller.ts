import type { Request, Response } from "express";

import { HealthService } from "./health.service.js";

export class HealthController {
  public constructor(private readonly healthService: HealthService) {}

  getLiveness = (_request: Request, response: Response): void => {
    response.status(200).json({ data: this.healthService.getLiveness() });
  };

  getReadiness = async (_request: Request, response: Response): Promise<void> => {
    try {
      const readiness = await this.healthService.getReadiness();
      response.status(200).json({ data: readiness });
    } catch {
      response.status(503).json({
        error: {
          code: "SERVICE_UNAVAILABLE",
          message: "Database is unavailable",
        },
      });
    }
  };
}

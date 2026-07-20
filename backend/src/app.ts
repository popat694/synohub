import { randomUUID } from "node:crypto";
import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import type { DestinationStream } from "pino";
import { pinoHttp } from "pino-http";

import { errorMiddleware } from "./common/middleware/error.middleware.js";
import { notFoundMiddleware } from "./common/middleware/not-found.middleware.js";
import { requestIdMiddleware } from "./common/middleware/request-id.middleware.js";
import type { ReadinessCheck } from "./modules/health/health.service.js";
import { createApiRouter } from "./routes.js";

export interface AppOptions {
  corsOrigin?: string;
  enableLogging?: boolean;
  logStream?: DestinationStream;
  readinessCheck?: ReadinessCheck;
}

export function createApp(options: AppOptions = {}): Express {
  const app = express();

  app.disable("x-powered-by");
  app.use(requestIdMiddleware);
  app.use(helmet());
  app.use(cors({ origin: options.corsOrigin ?? "http://localhost:5173" }));
  if (options.enableLogging ?? false) {
    const loggerOptions = {
      genReqId: (request: { headers: Record<string, string | string[] | undefined> }) => {
        const requestId = request.headers["x-request-id"];
        return (Array.isArray(requestId) ? requestId[0] : requestId) ?? randomUUID();
      },
      redact: {
        paths: [
          "req.headers.authorization",
          "req.headers.cookie",
          "req.headers.x-api-key",
          "res.headers.set-cookie",
        ],
        censor: "[Redacted]",
      },
    };
    app.use(
      options.logStream
        ? pinoHttp(loggerOptions, options.logStream)
        : pinoHttp(loggerOptions),
    );
  }
  app.use(express.json({ limit: "1mb" }));

  const readinessCheck =
    options.readinessCheck ??
    (() => Promise.reject(new Error("Database readiness check is not configured")));

  app.use("/api/v1", createApiRouter(readinessCheck));
  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}

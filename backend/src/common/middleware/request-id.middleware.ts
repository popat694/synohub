import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

const requestIdPattern = /^[A-Za-z0-9._:-]{1,128}$/;

export function requestIdMiddleware(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  const suppliedRequestId = request.header("x-request-id")?.trim();
  const requestId =
    suppliedRequestId && requestIdPattern.test(suppliedRequestId)
      ? suppliedRequestId
      : randomUUID();
  request.headers["x-request-id"] = requestId;
  response.setHeader("x-request-id", requestId);
  next();
}

import { PassThrough } from "node:stream";
import request from "supertest";
import { describe, expect, it } from "vitest";

import { createApp } from "../src/app.js";

describe("SynoHub API", () => {
  it("reports application liveness without requiring the database", async () => {
    const response = await request(createApp()).get("/api/v1/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      data: {
        service: "synohub-api",
        status: "ok",
      },
    });
    expect(response.headers["x-request-id"]).toBeTypeOf("string");
  });

  it("redacts credentials and correlates the response request ID with logs", async () => {
    const logStream = new PassThrough();
    const chunks: string[] = [];
    logStream.on("data", (chunk: Buffer) => chunks.push(chunk.toString()));

    const response = await request(
      createApp({ enableLogging: true, logStream }),
    )
      .get("/api/v1/health")
      .set("x-request-id", "trace-123")
      .set("authorization", "Bearer top-secret")
      .set("cookie", "session=private");

    await new Promise((resolve) => setImmediate(resolve));
    const log = JSON.parse(chunks.join("").trim()) as {
      req: { headers: Record<string, string>; id: string };
    };

    expect(response.headers["x-request-id"]).toBe("trace-123");
    expect(log.req.id).toBe("trace-123");
    expect(log.req.headers.authorization).toBe("[Redacted]");
    expect(log.req.headers.cookie).toBe("[Redacted]");
  });

  it("replaces unsafe client-supplied request IDs", async () => {
    const response = await request(createApp())
      .get("/api/v1/health")
      .set("x-request-id", "unsafe request id with spaces");

    expect(response.headers["x-request-id"]).not.toBe("unsafe request id with spaces");
    expect(response.headers["x-request-id"]).toMatch(/^[A-Za-z0-9._:-]{1,128}$/);
  });

  it("reports readiness when the database is reachable", async () => {
    const response = await request(
      createApp({ readinessCheck: () => Promise.resolve() }),
    ).get("/api/v1/health/ready");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      data: {
        database: "up",
        service: "synohub-api",
        status: "ready",
      },
    });
  });

  it("reports service unavailability when the database is unreachable", async () => {
    const response = await request(
      createApp({
        readinessCheck: () => Promise.reject(new Error("database unavailable")),
      }),
    ).get("/api/v1/health/ready");

    expect(response.status).toBe(503);
    expect(response.body).toEqual({
      error: {
        code: "SERVICE_UNAVAILABLE",
        message: "Database is unavailable",
      },
    });
  });

  it("returns 400 for malformed JSON", async () => {
    const response = await request(createApp())
      .post("/api/v1/health")
      .set("content-type", "application/json")
      .send('{"invalid"');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: {
        code: "INVALID_JSON",
        message: "Request body contains invalid JSON",
      },
    });
  });

  it("returns 413 when a JSON body exceeds the configured limit", async () => {
    const response = await request(createApp())
      .post("/api/v1/health")
      .send({ value: "x".repeat(1_100_000) });

    expect(response.status).toBe(413);
    expect(response.body).toEqual({
      error: {
        code: "PAYLOAD_TOO_LARGE",
        message: "Request body exceeds the 1mb limit",
      },
    });
  });

  it("returns a consistent JSON response for unknown routes", async () => {
    const response = await request(createApp()).get("/api/v1/does-not-exist");

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
      error: {
        code: "ROUTE_NOT_FOUND",
        message: "Route not found",
      },
    });
  });
});

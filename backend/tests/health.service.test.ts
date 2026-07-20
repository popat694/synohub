import { afterEach, describe, expect, it, vi } from "vitest";

import { HealthService } from "../src/modules/health/health.service.js";

describe("HealthService readiness checks", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("caches a successful database readiness check", async () => {
    const readinessCheck = vi.fn(() => Promise.resolve());
    const service = new HealthService(readinessCheck, { cacheTtlMs: 5_000 });

    await service.getReadiness();
    await service.getReadiness();

    expect(readinessCheck).toHaveBeenCalledTimes(1);
  });

  it("shares one in-flight database check across concurrent requests", async () => {
    let resolveCheck: (() => void) | undefined;
    const readinessCheck = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveCheck = resolve;
        }),
    );
    const service = new HealthService(readinessCheck);

    const first = service.getReadiness();
    const second = service.getReadiness();
    resolveCheck?.();

    await Promise.all([first, second]);
    expect(readinessCheck).toHaveBeenCalledTimes(1);
  });

  it("times out responses without starting duplicate underlying checks", async () => {
    vi.useFakeTimers();
    const readinessCheck = vi.fn(() => new Promise<void>(() => undefined));
    const service = new HealthService(readinessCheck, { timeoutMs: 100 });

    for (let attempt = 0; attempt < 3; attempt += 1) {
      const readiness = service.getReadiness();
      const expectation = expect(readiness).rejects.toThrow(
        "Database readiness check timed out",
      );
      await vi.advanceTimersByTimeAsync(101);
      await expectation;
    }

    expect(readinessCheck).toHaveBeenCalledTimes(1);
  });
});

import { afterEach, describe, expect, it, vi } from "vitest";

import { createShutdownHandler } from "../src/common/shutdown.js";

describe("graceful shutdown", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("closes HTTP and database resources only once", async () => {
    let closeCallback: ((error?: Error) => void) | undefined;
    const server = {
      close: vi.fn((callback: (error?: Error) => void) => {
        closeCallback = callback;
      }),
      closeAllConnections: vi.fn(),
    };
    const database = { close: vi.fn(() => Promise.resolve()) };
    const shutdown = createShutdownHandler({ database, server });

    shutdown("SIGTERM");
    shutdown("SIGINT");
    closeCallback?.();
    await new Promise((resolve) => setImmediate(resolve));

    expect(server.close).toHaveBeenCalledTimes(1);
    expect(database.close).toHaveBeenCalledTimes(1);
  });

  it("forces lingering connections closed after the grace deadline", async () => {
    vi.useFakeTimers();
    const server = {
      close: vi.fn(() => undefined),
      closeAllConnections: vi.fn(),
    };
    const database = { close: vi.fn(() => Promise.resolve()) };
    const setExitCode = vi.fn();
    const forceExit = vi.fn();
    const shutdown = createShutdownHandler({
      database,
      server,
      forceExit,
      onError: vi.fn(),
      setExitCode,
      timeoutMs: 100,
    });

    shutdown("SIGTERM");
    await vi.advanceTimersByTimeAsync(101);

    expect(server.closeAllConnections).toHaveBeenCalledTimes(1);
    expect(database.close).toHaveBeenCalledTimes(1);
    expect(setExitCode).toHaveBeenCalledWith(1);
    expect(forceExit).toHaveBeenCalledWith(1);
  });

  it("forces exit when database shutdown does not settle before the deadline", async () => {
    vi.useFakeTimers();
    let closeCallback: ((error?: Error) => void) | undefined;
    const server = {
      close: vi.fn((callback: (error?: Error) => void) => {
        closeCallback = callback;
      }),
      closeAllConnections: vi.fn(),
    };
    const database = { close: vi.fn(() => new Promise<void>(() => undefined)) };
    const forceExit = vi.fn();
    const shutdown = createShutdownHandler({
      database,
      server,
      forceExit,
      onError: vi.fn(),
      setExitCode: vi.fn(),
      timeoutMs: 100,
    });

    shutdown("SIGTERM");
    closeCallback?.();
    await vi.advanceTimersByTimeAsync(101);

    expect(database.close).toHaveBeenCalledTimes(1);
    expect(server.closeAllConnections).toHaveBeenCalledTimes(1);
    expect(forceExit).toHaveBeenCalledWith(1);
  });
});

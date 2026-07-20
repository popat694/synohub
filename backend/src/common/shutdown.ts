interface HttpServer {
  close(callback: (error?: Error) => void): void;
  closeAllConnections(): void;
}

interface DatabaseConnection {
  close(): Promise<void>;
}

interface ShutdownOptions {
  database: DatabaseConnection;
  server: HttpServer;
  timeoutMs?: number;
  forceExit?: (code: number) => void;
  onError?: (message: string, error: unknown) => void;
  setExitCode?: (code: number) => void;
}

export function createShutdownHandler(options: ShutdownOptions) {
  const timeoutMs = options.timeoutMs ?? 10_000;
  const forceExit = options.forceExit ?? ((code: number) => process.exit(code));
  const onError = options.onError ?? console.error;
  const setExitCode = options.setExitCode ?? ((code: number) => {
    process.exitCode = code;
  });
  let databaseClosePromise: Promise<void> | undefined;
  let isComplete = false;
  let isFinalizing = false;
  let isShuttingDown = false;

  return (signal: string): void => {
    if (isShuttingDown) {
      return;
    }
    isShuttingDown = true;
    console.info(`${signal} received; shutting down SynoHub API`);

    const deadline = setTimeout(() => {
      if (isComplete) {
        return;
      }

      isComplete = true;
      const error = new Error(`Shutdown exceeded ${timeoutMs}ms grace period`);
      options.server.closeAllConnections();
      onError("Forced shutdown after grace period", error);
      setExitCode(1);
      void closeDatabase();
      forceExit(1);
    }, timeoutMs);
    deadline.unref();

    options.server.close((error?: Error) => {
      void finalize(error);
    });

    function closeDatabase(): Promise<void> {
      databaseClosePromise ??= options.database.close().catch((databaseError: unknown) => {
        onError("Database shutdown failed", databaseError);
        setExitCode(1);
      });
      return databaseClosePromise;
    }

    async function finalize(httpError?: Error): Promise<void> {
      if (isComplete || isFinalizing) {
        return;
      }
      isFinalizing = true;

      if (httpError) {
        onError("HTTP server shutdown failed", httpError);
        setExitCode(1);
      }

      await closeDatabase();
      if (isComplete) {
        return;
      }

      isComplete = true;
      clearTimeout(deadline);
    }
  };
}

export type ReadinessCheck = () => Promise<void>;

interface HealthServiceOptions {
  cacheTtlMs?: number;
  timeoutMs?: number;
  now?: () => number;
}

interface ReadinessStatus {
  database: "up";
  service: string;
  status: "ready";
}

export class HealthService {
  private readonly cacheTtlMs: number;
  private readonly timeoutMs: number;
  private readonly now: () => number;
  private inFlightCheck: Promise<void> | undefined;
  private lastSuccessfulCheckAt: number | undefined;

  public constructor(
    private readonly readinessCheck: ReadinessCheck,
    options: HealthServiceOptions = {},
  ) {
    this.cacheTtlMs = options.cacheTtlMs ?? 5_000;
    this.timeoutMs = options.timeoutMs ?? 2_000;
    this.now = options.now ?? Date.now;
  }

  getLiveness(): { service: string; status: "ok" } {
    return {
      service: "synohub-api",
      status: "ok",
    };
  }

  async getReadiness(): Promise<ReadinessStatus> {
    if (
      this.lastSuccessfulCheckAt !== undefined &&
      this.now() - this.lastSuccessfulCheckAt < this.cacheTtlMs
    ) {
      return this.readyStatus();
    }

    await this.runReadinessCheck();
    return this.readyStatus();
  }

  private async runReadinessCheck(): Promise<void> {
    if (!this.inFlightCheck) {
      const underlyingCheck = this.readinessCheck();
      this.inFlightCheck = underlyingCheck;
      void underlyingCheck.then(
        () => {
          this.lastSuccessfulCheckAt = this.now();
          if (this.inFlightCheck === underlyingCheck) {
            this.inFlightCheck = undefined;
          }
        },
        () => {
          if (this.inFlightCheck === underlyingCheck) {
            this.inFlightCheck = undefined;
          }
        },
      );
    }

    await this.waitForCheckWithTimeout(this.inFlightCheck);
  }

  private waitForCheckWithTimeout(check: Promise<void>): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Database readiness check timed out"));
      }, this.timeoutMs);

      check.then(resolve, reject).finally(() => clearTimeout(timeout));
    });
  }

  private readyStatus(): ReadinessStatus {
    return {
      database: "up",
      service: "synohub-api",
      status: "ready",
    };
  }
}

import { describe, expect, it } from "vitest";

import { parseEnvironment } from "../src/config/environment.js";

describe("environment configuration", () => {
  it("parses a valid MySQL configuration", () => {
    const config = parseEnvironment({
      NODE_ENV: "test",
      PORT: "4000",
      DB_HOST: "localhost",
      DB_PORT: "3306",
      DB_NAME: "synohub_test",
      DB_USER: "synohub",
      DB_PASSWORD: "secret",
      CORS_ORIGIN: "http://localhost:5173",
    });

    expect(config.port).toBe(4000);
    expect(config.database.dialect).toBe("mysql");
    expect(config.database.name).toBe("synohub_test");
  });

  it("rejects missing database credentials", () => {
    expect(() => parseEnvironment({ NODE_ENV: "test" })).toThrow(
      "Invalid environment configuration",
    );
  });

  it("rejects an empty database password", () => {
    expect(() =>
      parseEnvironment({
        NODE_ENV: "test",
        DB_HOST: "localhost",
        DB_NAME: "synohub_test",
        DB_USER: "synohub",
        DB_PASSWORD: "",
      }),
    ).toThrow("Invalid environment configuration");
  });
});

import { describe, expect, it } from "vitest";
import { Sequelize } from "sequelize";

import { createDatabase } from "../src/database/sequelize.js";

describe("Sequelize database adapter", () => {
  it("creates a MySQL Sequelize client from application configuration", async () => {
    const database = createDatabase({
      dialect: "mysql",
      host: "127.0.0.1",
      port: 3306,
      name: "synohub_test",
      username: "synohub",
      password: "secret",
    });

    expect(database).toBeInstanceOf(Sequelize);
    expect(database.getDialect()).toBe("mysql");

    await database.close();
  });
});

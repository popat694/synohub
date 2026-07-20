import { Sequelize } from "sequelize";

import type { Environment } from "../config/environment.js";

export type DatabaseConfig = Environment["database"];

export function createDatabase(config: DatabaseConfig): Sequelize {
  return new Sequelize(config.name, config.username, config.password, {
    dialect: config.dialect,
    host: config.host,
    port: config.port,
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30_000,
      idle: 10_000,
    },
    define: {
      underscored: true,
      timestamps: true,
    },
  });
}

import "dotenv/config";

import { createApp } from "./app.js";
import { createShutdownHandler } from "./common/shutdown.js";
import { parseEnvironment } from "./config/environment.js";
import { createDatabase } from "./database/sequelize.js";

const environment = parseEnvironment(process.env);
const database = createDatabase(environment.database);
const app = createApp({
  corsOrigin: environment.corsOrigin,
  enableLogging: true,
  readinessCheck: async () => database.authenticate(),
});

await database.authenticate();

const server = app.listen(environment.port, () => {
  console.info(`SynoHub API listening on port ${environment.port}`);
});

const shutdown = createShutdownHandler({ database, server });

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));

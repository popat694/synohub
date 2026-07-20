import { z } from "zod";

const environmentSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().max(65_535).default(4000),
  DB_HOST: z.string().trim().min(1),
  DB_PORT: z.coerce.number().int().positive().max(65_535).default(3306),
  DB_NAME: z.string().trim().min(1),
  DB_USER: z.string().trim().min(1),
  DB_PASSWORD: z.string().min(1),
  CORS_ORIGIN: z.string().trim().url().default("http://localhost:5173"),
});

export interface Environment {
  nodeEnv: "development" | "test" | "production";
  port: number;
  corsOrigin: string;
  database: {
    dialect: "mysql";
    host: string;
    port: number;
    name: string;
    username: string;
    password: string;
  };
}

export function parseEnvironment(source: NodeJS.ProcessEnv): Environment {
  const result = environmentSchema.safeParse(source);

  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid environment configuration: ${details}`);
  }

  return {
    nodeEnv: result.data.NODE_ENV,
    port: result.data.PORT,
    corsOrigin: result.data.CORS_ORIGIN,
    database: {
      dialect: "mysql",
      host: result.data.DB_HOST,
      port: result.data.DB_PORT,
      name: result.data.DB_NAME,
      username: result.data.DB_USER,
      password: result.data.DB_PASSWORD,
    },
  };
}

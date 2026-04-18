import "dotenv/config";

type NodeEnv = "development" | "test" | "production";

type AppEnv = {
  databaseUrl: string;
  nodeEnv: NodeEnv;
  port: number;
  jwtSecret: string;
  jwtExpiresIn: string;
  corsOrigins: string[];
  frontendUrl: string;
  recommendationServiceUrl: string;
  recommendationServiceTimeoutMs: number;
};

const required = (name: string): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

const optional = (name: string, fallback: string): string => {
  return process.env[name] ?? fallback;
};

const parseNodeEnv = (value: string): NodeEnv => {
  if (value === "development" || value === "test" || value === "production") {
    return value;
  }

  throw new Error(`Invalid NODE_ENV value: ${value}`);
};

const parsePositiveInteger = (value: string, name: string, max = Number.MAX_SAFE_INTEGER): number => {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0 || parsed > max) {
    throw new Error(`Invalid ${name} value: ${value}`);
  }

  return parsed;
};

const parseOrigins = (value: string): string[] => {
  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
};

export const env: AppEnv = {
  databaseUrl: required("DATABASE_URL"),
  nodeEnv: parseNodeEnv(optional("NODE_ENV", "development")),
  port: parsePositiveInteger(optional("PORT", "4000"), "PORT", 65535),
  jwtSecret: required("JWT_SECRET"),
  jwtExpiresIn: optional("JWT_EXPIRES_IN", "7d"),
  corsOrigins: parseOrigins(optional("CORS_ORIGIN", "http://localhost:3000")),
  frontendUrl: optional("FRONTEND_URL", "http://localhost:3000"),
  recommendationServiceUrl: optional("RECOMMENDATION_SERVICE_URL", "http://localhost:8000"),
  recommendationServiceTimeoutMs: parsePositiveInteger(
    optional("RECOMMENDATION_SERVICE_TIMEOUT_MS", "3000"),
    "RECOMMENDATION_SERVICE_TIMEOUT_MS",
  ),
};

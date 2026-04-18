import { prisma } from "../lib/prisma.js";

export type HealthStatus = {
  status: "ok";
  uptime: number;
  timestamp: string;
  database: "connected";
};

export const getHealthStatus = async (): Promise<HealthStatus> => {
  await prisma.$queryRaw`SELECT 1`;

  return {
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: "connected",
  };
};

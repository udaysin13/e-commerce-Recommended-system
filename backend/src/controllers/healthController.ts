import type { RequestHandler } from "express";
import { getHealthStatus } from "../services/healthService.js";
import { httpStatus } from "../utils/httpStatus.js";

export const healthCheck: RequestHandler = async (_req, res) => {
  const health = await getHealthStatus();

  res.status(httpStatus.ok).json({
    success: true,
    data: health,
  });
};

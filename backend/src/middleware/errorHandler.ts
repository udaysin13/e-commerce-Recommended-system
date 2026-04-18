import type { ErrorRequestHandler } from "express";
import { env } from "../lib/env.js";
import { httpStatus } from "../utils/httpStatus.js";
import { isHttpError } from "../utils/httpError.js";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const statusCode = isHttpError(error)
    ? error.statusCode
    : httpStatus.internalServerError;

  const message = isHttpError(error)
    ? error.message
    : "Unexpected server error";

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(isHttpError(error) && error.details ? { details: error.details } : {}),
      ...(env.nodeEnv === "development" ? { stack: error.stack } : {}),
    },
  });
};

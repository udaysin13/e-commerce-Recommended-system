import type { RequestHandler } from "express";
import { verifyAccessToken } from "../lib/jwt.js";
import { HttpError } from "../utils/httpError.js";
import { httpStatus } from "../utils/httpStatus.js";

export const requireAuth: RequestHandler = (req, _res, next) => {
  const authorization = req.headers.authorization;
  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : undefined;

  if (!token) {
    next(new HttpError(httpStatus.unauthorized, "Authentication token is required."));
    return;
  }

  try {
    const payload = verifyAccessToken(token);

    req.auth = {
      userId: payload.sub,
      role: payload.role,
    };

    next();
  } catch {
    next(new HttpError(httpStatus.unauthorized, "Invalid or expired authentication token."));
  }
};

export const optionalAuth: RequestHandler = (req, _res, next) => {
  const authorization = req.headers.authorization;
  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : undefined;

  if (!token) {
    next();
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    req.auth = {
      userId: payload.sub,
      role: payload.role,
    };
  } catch {
    req.auth = undefined;
  }

  next();
};

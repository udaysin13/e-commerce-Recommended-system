import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import { env } from "./env.js";
import type { AuthTokenPayload } from "../types/auth.js";

export const signAccessToken = (payload: AuthTokenPayload): string => {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"],
  });
};

export const verifyAccessToken = (token: string): AuthTokenPayload => {
  const payload = jwt.verify(token, env.jwtSecret);

  if (
    typeof payload !== "object" ||
    payload === null ||
    typeof payload.sub !== "string" ||
    typeof payload.role !== "string"
  ) {
    throw new Error("Invalid token payload.");
  }

  return {
    sub: payload.sub,
    role: payload.role as AuthTokenPayload["role"],
  };
};

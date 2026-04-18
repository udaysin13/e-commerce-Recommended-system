import type { RequestHandler } from "express";
import { getCurrentUser, login, signup } from "../services/authService.js";
import { validateLoginInput, validateSignupInput } from "../validators/auth.validation.js";
import { HttpError } from "../utils/httpError.js";
import { httpStatus } from "../utils/httpStatus.js";

export const signupController: RequestHandler = async (req, res) => {
  const input = validateSignupInput(req.body);
  const result = await signup(input);

  res.status(httpStatus.created).json({
    success: true,
    data: result,
  });
};

export const loginController: RequestHandler = async (req, res) => {
  const input = validateLoginInput(req.body);
  const result = await login(input);

  res.status(httpStatus.ok).json({
    success: true,
    data: result,
  });
};

export const meController: RequestHandler = async (req, res) => {
  if (!req.auth) {
    throw new HttpError(httpStatus.unauthorized, "Authentication is required.");
  }

  const user = await getCurrentUser(req.auth.userId);

  res.status(httpStatus.ok).json({
    success: true,
    data: {
      user,
    },
  });
};

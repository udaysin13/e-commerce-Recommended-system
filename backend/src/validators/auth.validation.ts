import type { LoginInput, SignupInput } from "../types/auth.js";
import { HttpError } from "../utils/httpError.js";
import { httpStatus } from "../utils/httpStatus.js";
import { normalizeEmail, normalizeOptionalName } from "../utils/normalize.js";

type ValidationIssue = {
  field: string;
  message: string;
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const getString = (body: Record<string, unknown>, field: string): string | undefined => {
  const value = body[field];
  return typeof value === "string" ? value : undefined;
};

const assertValid = (issues: ValidationIssue[]) => {
  if (issues.length > 0) {
    throw new HttpError(httpStatus.badRequest, "Validation failed.", issues);
  }
};

const validateEmail = (email: string | undefined, issues: ValidationIssue[]) => {
  if (!email) {
    issues.push({ field: "email", message: "Email is required." });
    return;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email)) {
    issues.push({ field: "email", message: "Email must be valid." });
  }
};

const validatePassword = (password: string | undefined, issues: ValidationIssue[]) => {
  if (!password) {
    issues.push({ field: "password", message: "Password is required." });
    return;
  }

  if (password.length < 8) {
    issues.push({ field: "password", message: "Password must be at least 8 characters." });
  }

  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    issues.push({
      field: "password",
      message: "Password must include at least one letter and one number.",
    });
  }
};

export const validateSignupInput = (body: unknown): SignupInput => {
  if (!isRecord(body)) {
    throw new HttpError(httpStatus.badRequest, "Request body must be a JSON object.");
  }

  const issues: ValidationIssue[] = [];
  const email = normalizeEmail(getString(body, "email") ?? "");
  const password = getString(body, "password");
  const firstName = normalizeOptionalName(getString(body, "firstName"));
  const lastName = normalizeOptionalName(getString(body, "lastName"));

  validateEmail(email, issues);
  validatePassword(password, issues);

  assertValid(issues);

  return {
    email,
    password: password as string,
    ...(firstName ? { firstName } : {}),
    ...(lastName ? { lastName } : {}),
  };
};

export const validateLoginInput = (body: unknown): LoginInput => {
  if (!isRecord(body)) {
    throw new HttpError(httpStatus.badRequest, "Request body must be a JSON object.");
  }

  const issues: ValidationIssue[] = [];
  const email = normalizeEmail(getString(body, "email") ?? "");
  const password = getString(body, "password");

  validateEmail(email, issues);

  if (!password) {
    issues.push({ field: "password", message: "Password is required." });
  }

  assertValid(issues);

  return {
    email,
    password: password as string,
  };
};

import { HttpError } from "./httpError.js";
import { httpStatus } from "./httpStatus.js";

export type QueryValue = unknown;

export const getSingleQueryValue = (
  value: QueryValue,
  field: string,
): string | undefined => {
  if (Array.isArray(value)) {
    throw new HttpError(httpStatus.badRequest, `${field} must be provided only once.`);
  }

  if (value !== undefined && typeof value !== "string") {
    throw new HttpError(httpStatus.badRequest, `${field} must be a string.`);
  }

  const normalized = value?.trim();
  return normalized ? normalized : undefined;
};

export const parsePositiveIntegerQuery = (
  value: QueryValue,
  field: string,
  fallback: number,
  options: { min?: number; max?: number } = {},
): number => {
  const raw = getSingleQueryValue(value, field);

  if (!raw) {
    return fallback;
  }

  const parsed = Number(raw);
  const min = options.min ?? 1;
  const max = options.max;

  if (!Number.isInteger(parsed) || parsed < min || (max !== undefined && parsed > max)) {
    const maxMessage = max === undefined ? "" : ` and at most ${max}`;
    throw new HttpError(httpStatus.badRequest, `${field} must be at least ${min}${maxMessage}.`);
  }

  return parsed;
};

export const parseEnumQuery = <T extends string>(
  value: QueryValue,
  field: string,
  allowedValues: readonly T[],
  fallback: T,
): T => {
  const raw = getSingleQueryValue(value, field);

  if (!raw) {
    return fallback;
  }

  if (!allowedValues.includes(raw as T)) {
    throw new HttpError(
      httpStatus.badRequest,
      `${field} must be one of: ${allowedValues.join(", ")}.`,
    );
  }

  return raw as T;
};

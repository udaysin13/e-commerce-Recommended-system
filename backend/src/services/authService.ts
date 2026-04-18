import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { signAccessToken } from "../lib/jwt.js";
import type { AuthResult, AuthUser, LoginInput, SignupInput } from "../types/auth.js";
import { HttpError } from "../utils/httpError.js";
import { httpStatus } from "../utils/httpStatus.js";

const PASSWORD_SALT_ROUNDS = 12;

const userSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} as const;

const buildAuthResult = (user: AuthUser): AuthResult => {
  return {
    user,
    token: signAccessToken({
      sub: user.id,
      role: user.role,
    }),
  };
};

export const signup = async (input: SignupInput): Promise<AuthResult> => {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true },
  });

  if (existingUser) {
    throw new HttpError(httpStatus.conflict, "An account with this email already exists.");
  }

  const passwordHash = await bcrypt.hash(input.password, PASSWORD_SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
    },
    select: userSelect,
  });

  return buildAuthResult(user);
};

export const login = async (input: LoginInput): Promise<AuthResult> => {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    select: {
      ...userSelect,
      passwordHash: true,
      isActive: true,
    },
  });

  if (!user) {
    throw new HttpError(httpStatus.unauthorized, "Invalid email or password.");
  }

  if (!user.isActive) {
    throw new HttpError(httpStatus.forbidden, "This account is disabled.");
  }

  const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);

  if (!isPasswordValid) {
    throw new HttpError(httpStatus.unauthorized, "Invalid email or password.");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
    select: { id: true },
  });

  const { passwordHash: _passwordHash, isActive: _isActive, ...safeUser } = user;

  return buildAuthResult(safeUser);
};

export const getCurrentUser = async (userId: string): Promise<AuthUser> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      ...userSelect,
      isActive: true,
    },
  });

  if (!user || !user.isActive) {
    throw new HttpError(httpStatus.unauthorized, "Authenticated user was not found.");
  }

  const { isActive: _isActive, ...safeUser } = user;
  return safeUser;
};

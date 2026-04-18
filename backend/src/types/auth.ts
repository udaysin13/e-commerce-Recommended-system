import type { UserRole } from "../generated/prisma/enums.js";

export type AuthUser = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
};

export type AuthTokenPayload = {
  sub: string;
  role: UserRole;
};

export type SignupInput = {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type AuthResult = {
  user: AuthUser;
  token: string;
};

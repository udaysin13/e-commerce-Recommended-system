export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:4000";

export const AUTH_TOKEN_KEY = "authToken";
export const AUTH_USER_KEY = "user";

export type AuthUser = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
};

export type AuthResponse = {
  success: boolean;
  data: {
    user: AuthUser;
    token: string;
  };
  error?: {
    message?: string;
  };
};

export const getDisplayName = (user: AuthUser | null) => {
  if (!user) return "";

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return fullName || user.email;
};

export const getInitials = (user: AuthUser | null) => {
  if (!user) return "RC";

  const parts = [user.firstName, user.lastName].filter(Boolean);
  if (parts.length > 0) {
    return parts
      .map((part) => part![0]?.toUpperCase() ?? "")
      .join("")
      .slice(0, 2);
  }

  return user.email.slice(0, 2).toUpperCase();
};

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  API_BASE_URL,
  AUTH_TOKEN_KEY,
  AUTH_USER_KEY,
  type AuthUser,
  getDisplayName,
} from "@/lib/auth";

type ToastTone = "success" | "error" | "info";

type ToastState = {
  id: number;
  message: string;
  tone: ToastTone;
} | null;

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: { user: AuthUser; token: string; message?: string }) => void;
  signup: (payload: { user: AuthUser; token: string; message?: string }) => void;
  logout: (message?: string) => void;
  refreshUser: () => Promise<AuthUser | null>;
  showToast: (message: string, tone?: ToastTone) => void;
  displayName: string;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const readStoredUser = () => {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(AUTH_USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
};

const readStoredToken = () => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(AUTH_TOKEN_KEY);
};

const persistSession = (user: AuthUser, token: string) => {
  window.localStorage.setItem(AUTH_TOKEN_KEY, token);
  window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
};

const clearSession = () => {
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  window.localStorage.removeItem(AUTH_USER_KEY);
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<ToastState>(null);
  const toastTimeoutRef = useRef<number | null>(null);

  const dismissToast = useCallback(() => {
    setToast(null);
    if (toastTimeoutRef.current !== null) {
      window.clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = null;
    }
  }, []);

  const showToast = useCallback(
    (message: string, tone: ToastTone = "info") => {
      const nextToast = {
        id: Date.now(),
        message,
        tone,
      };
      setToast(nextToast);

      if (toastTimeoutRef.current !== null) {
        window.clearTimeout(toastTimeoutRef.current);
      }

      toastTimeoutRef.current = window.setTimeout(() => {
        setToast((current) => (current?.id === nextToast.id ? null : current));
        toastTimeoutRef.current = null;
      }, 3000);
    },
    [],
  );

  const logout = useCallback(
    (message = "Logged out successfully") => {
      clearSession();
      setUser(null);
      setToken(null);
      showToast(message, "info");
    },
    [showToast],
  );

  const refreshUser = useCallback(async () => {
    const currentToken = readStoredToken();
    const storedUser = readStoredUser();

    if (!currentToken) {
      setUser(null);
      setToken(null);
      return null;
    }

    if (storedUser) {
      setUser(storedUser);
    }
    setToken(currentToken);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Session expired");
      }

      const json = (await response.json()) as {
        success: boolean;
        data: { user: AuthUser };
      };

      setUser(json.data.user);
      window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(json.data.user));
      return json.data.user;
    } catch {
      clearSession();
      setUser(null);
      setToken(null);
      return null;
    }
  }, []);

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      const storedUser = readStoredUser();
      const storedToken = readStoredToken();

      if (storedUser) setUser(storedUser);
      if (storedToken) setToken(storedToken);

      if (storedToken) {
        await refreshUser();
      }

      if (active) {
        setIsLoading(false);
      }
    };

    void bootstrap();

    return () => {
      active = false;
      if (toastTimeoutRef.current !== null) {
        window.clearTimeout(toastTimeoutRef.current);
      }
    };
  }, [refreshUser]);

  const login = useCallback(
    ({ user: nextUser, token: nextToken, message = "Login successful. Welcome back." }: {
      user: AuthUser;
      token: string;
      message?: string;
    }) => {
      persistSession(nextUser, nextToken);
      setUser(nextUser);
      setToken(nextToken);
      showToast(message, "success");
    },
    [showToast],
  );

  const signup = useCallback(
    ({ user: nextUser, token: nextToken, message = "Account created successfully." }: {
      user: AuthUser;
      token: string;
      message?: string;
    }) => {
      persistSession(nextUser, nextToken);
      setUser(nextUser);
      setToken(nextToken);
      showToast(message, "success");
    },
    [showToast],
  );

  const displayName = getDisplayName(user);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      isLoading,
      login,
      signup,
      logout,
      refreshUser,
      showToast,
      displayName,
    }),
    [displayName, isLoading, login, logout, refreshUser, showToast, signup, token, user],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      {toast ? (
        <div className="pointer-events-none fixed right-4 top-4 z-[60] max-w-sm">
          <div
            className={`rounded border px-4 py-3 text-sm font-semibold shadow-lg transition ${
              toast.tone === "success"
                ? "border-green-200 bg-green-50 text-green-900"
                : toast.tone === "error"
                  ? "border-red-200 bg-red-50 text-red-800"
                  : "border-line bg-white text-ink"
            }`}
            role="status"
            aria-live="polite"
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5">{toast.message}</span>
              <button
                type="button"
                onClick={dismissToast}
                className="pointer-events-auto ml-auto text-xs font-bold opacity-70 transition hover:opacity-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

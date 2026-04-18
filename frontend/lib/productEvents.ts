"use client";

import { API_BASE_URL } from "@/lib/auth";

const SESSION_KEY = "productSessionId";

const getSessionId = () => {
  if (typeof window === "undefined") return undefined;

  const existing = window.localStorage.getItem(SESSION_KEY);
  if (existing) return existing;

  const next = crypto.randomUUID();
  window.localStorage.setItem(SESSION_KEY, next);
  return next;
};

const postEvent = async (path: "/events/view" | "/events/click", productId: string) => {
  const token =
    typeof window !== "undefined" ? window.localStorage.getItem("authToken") : null;

  try {
    await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        productId,
        sessionId: getSessionId(),
        metadata: {
          referrer:
            typeof document !== "undefined" ? document.referrer || undefined : undefined,
        },
      }),
      keepalive: true,
    });
  } catch {
    // Best-effort analytics should never block product browsing.
  }
};

export const trackProductViewEvent = async (productId: string) => {
  await postEvent("/events/view", productId);
};

export const trackProductClickEvent = async (productId: string) => {
  await postEvent("/events/click", productId);
};

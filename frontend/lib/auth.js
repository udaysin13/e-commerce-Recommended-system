export function getCurrentUser() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const storedUser = window.localStorage.getItem("shopwise-user");
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
}

export function getCurrentUserId(fallbackUserId = 1) {
  return getCurrentUser()?.id || fallbackUserId;
}

export function isAuthenticated() {
  if (typeof window === "undefined") {
    return false;
  }

  return Boolean(window.localStorage.getItem("shopwise-token"));
}

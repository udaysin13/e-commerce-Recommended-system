const DEFAULT_API_URL = "http://localhost:5000";

function getConfiguredApiUrl() {
  return (process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL).replace(/\/+$/, "");
}

export function getApiBaseUrl() {
  const configuredUrl = getConfiguredApiUrl();
  return configuredUrl.endsWith("/api") ? configuredUrl : `${configuredUrl}/api`;
}

export function getApiOriginUrl() {
  const configuredUrl = getConfiguredApiUrl();
  return configuredUrl.endsWith("/api") ? configuredUrl.slice(0, -4) : configuredUrl;
}

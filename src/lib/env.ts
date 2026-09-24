/**
 * Centralized environment configuration helper.
 * Retrieves application URLs dynamically from environment variables
 * without hardcoding or vendor-specific (e.g. Vercel) fallbacks.
 */

export function getAppUrl(): string {
  const envUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL;
  if (envUrl) {
    try {
      return new URL(envUrl).origin;
    } catch {
      return envUrl.replace(/\/+$/, "");
    }
  }
  return "http://localhost:4000";
}

export function getCorsAllowedOrigin(): string {
  return process.env.CORS_ALLOWED_ORIGIN || getAppUrl();
}

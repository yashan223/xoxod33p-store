/**
 * Centralized environment configuration helper.
 * Retrieves application URLs dynamically from environment variables
 * without hardcoding or vendor-specific (e.g. Vercel) fallbacks.
 */

export function getAppUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL;
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

/**
 * Returns the public origin/base URL for incoming requests,
 * taking into account reverse proxy headers (X-Forwarded-Host / X-Forwarded-Proto).
 * Prevents redirects to internal localhost/127.0.0.1 addresses.
 */
export function getRequestBaseUrl(request?: Request): string {
  if (request) {
    const forwardedHost = request.headers.get("x-forwarded-host");
    const host = forwardedHost || request.headers.get("host");
    const proto =
      request.headers.get("x-forwarded-proto") ||
      (host?.includes("localhost") ? "http" : "https");

    if (host && !host.startsWith("127.0.0.1") && !host.startsWith("localhost")) {
      return `${proto}://${host}`;
    }
  }
  return getAppUrl();
}

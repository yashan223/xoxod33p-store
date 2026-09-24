export const siteName = "XOXOD33P STORE";
export const siteTagline = "COD4 servers, mods and operator support";
export const siteDescription =
  "Buy private Call of Duty 4 servers, custom mods, and one-time setup services. Browse the catalog, pay securely with Payments.lk, and get direct operator support.";
export const siteKeywords = [
  "COD4 server",
  "Call of Duty 4 hosting",
  "COD4 server hosting",
  "COD4 mods",
  "COD4 mod pack",
  "Promod server",
  "game server Sri Lanka",
  "private COD4 server",
];

const configuredSiteUrl =
  process.env.NEXT_PUBLIC_APP_URL ??
  process.env.APP_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const siteUrl = (() => {
  try {
    return new URL(configuredSiteUrl).origin;
  } catch {
    return "http://localhost:3000";
  }
})();

export function absoluteUrl(path = "/") {
  try {
    return new URL(path, siteUrl).toString();
  } catch {
    return siteUrl;
  }
}

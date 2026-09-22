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

const configuredSiteUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.APP_URL;

export const siteUrl = (() => {
  if (!configuredSiteUrl) {
    throw new Error(
      "Missing site URL: set NEXT_PUBLIC_APP_URL (or APP_URL) to the public origin, e.g. https://example.com",
    );
  }
  try {
    return new URL(configuredSiteUrl).origin;
  } catch {
    throw new Error(
      `Invalid site URL "${configuredSiteUrl}": set NEXT_PUBLIC_APP_URL (or APP_URL) to a valid absolute origin, e.g. https://example.com`,
    );
  }
})();

export function absoluteUrl(path = "/") {
  try {
    return new URL(path, siteUrl).toString();
  } catch {
    return siteUrl;
  }
}

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

import { getAppUrl } from "./env";

export const siteUrl = getAppUrl();

export function absoluteUrl(path = "/") {
  try {
    return new URL(path, siteUrl).toString();
  } catch {
    return siteUrl;
  }
}

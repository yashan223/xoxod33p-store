import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth/session";

function valuesFromEnv(value: string | undefined) {
  return new Set((value ?? "").split(",").map((item) => item.trim()).filter(Boolean));
}

export function isConfiguredAdminEmail(email: string) {
  const configuredEmails = valuesFromEnv(process.env.ADMIN_EMAILS);
  const allowedEmails = configuredEmails.size > 0 ? configuredEmails : valuesFromEnv(process.env.ADMIN_DEFAULT_EMAIL);
  return allowedEmails.has(email.trim().toLowerCase());
}

export async function isAdminUser() {
  const user = await getCurrentUser();
  if (!user) return false;
  const allowedUserIds = valuesFromEnv(process.env.ADMIN_USER_IDS);
  return allowedUserIds.has(user.id) || isConfiguredAdminEmail(user.email);
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in?redirect_url=/admin");

  const allowedUserIds = valuesFromEnv(process.env.ADMIN_USER_IDS);
  const emailMatches = isConfiguredAdminEmail(user.email);

  if (!allowedUserIds.has(user.id) && !emailMatches) redirect("/");
  return user;
}

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth/session";

function valuesFromEnv(value: string | undefined) {
  return new Set((value ?? "").split(",").map((item) => item.trim()).filter(Boolean));
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in?redirect_url=/admin");

  const allowedUserIds = valuesFromEnv(process.env.ADMIN_USER_IDS);
  const allowedEmails = valuesFromEnv(process.env.ADMIN_EMAILS).size > 0
    ? valuesFromEnv(process.env.ADMIN_EMAILS)
    : valuesFromEnv(process.env.ADMIN_DEFAULT_EMAIL);
  const emailMatches = allowedEmails.has(user.email);

  if (!allowedUserIds.has(user.id) && !emailMatches) redirect("/");
  return user;
}

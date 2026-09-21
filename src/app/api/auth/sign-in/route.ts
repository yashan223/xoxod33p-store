import { NextResponse } from "next/server";
import { isConfiguredAdminEmail } from "@/server/auth/admin";
import { authenticateUser } from "@/server/auth/users";
import { createSession } from "@/server/auth/session";
import { enforceRateLimit } from "@/server/rate-limit";

export async function POST(request: Request) {
  const limited = enforceRateLimit(request, "sign-in", { limit: 10, windowMs: 5 * 60_000 });
  if (limited) return limited;

  const body = await request.json() as { email?: string; password?: string; redirectTo?: string; rememberMe?: boolean };
  const user = await authenticateUser(body.email ?? "", body.password ?? "");
  if (!user) return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
  if (!user.emailVerified) return NextResponse.json({ error: "Verify your email before signing in.", code: "EMAIL_NOT_VERIFIED" }, { status: 403 });

  await createSession(user.id, body.rememberMe === true);
  const redirectTo = body.redirectTo?.startsWith("/") ? body.redirectTo : isConfiguredAdminEmail(user.email) ? "/admin" : "/#catalog";
  return NextResponse.json({ redirectTo });
}

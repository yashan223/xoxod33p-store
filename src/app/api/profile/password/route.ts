import { NextResponse } from "next/server";
import { createSession, getCurrentUser } from "@/server/auth/session";
import { changeUserPassword } from "@/server/auth/users";
import { enforceRateLimit } from "@/server/rate-limit";

export async function PATCH(request: Request) {
  const limited = enforceRateLimit(request, "profile-password", {
    limit: 10,
    windowMs: 15 * 60_000,
  });
  if (limited) return limited;

  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const body = (await request.json().catch(() => null)) as {
    currentPassword?: unknown;
    newPassword?: unknown;
  } | null;
  if (typeof body?.currentPassword !== "string" || typeof body.newPassword !== "string")
    return NextResponse.json({ error: "Enter your current and new passwords." }, { status: 400 });
  if (body.newPassword.length < 8)
    return NextResponse.json(
      { error: "The new password must be at least 8 characters." },
      { status: 400 },
    );
  if (body.currentPassword === body.newPassword)
    return NextResponse.json({ error: "The new password must be different." }, { status: 400 });

  const changed = await changeUserPassword(user.id, body.currentPassword, body.newPassword);
  if (!changed)
    return NextResponse.json({ error: "Your current password is incorrect." }, { status: 400 });

  await createSession(user.id);
  return NextResponse.json({ ok: true });
}

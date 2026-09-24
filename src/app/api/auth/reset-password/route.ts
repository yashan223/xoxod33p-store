import { NextResponse } from "next/server";
import { resetPassword } from "@/server/auth/users";
import { enforceRateLimit } from "@/server/rate-limit";

export async function POST(request: Request) {
  const limited = enforceRateLimit(request, "reset-password", { limit: 10, windowMs: 15 * 60_000 });
  if (limited) return limited;

  const body = (await request.json()) as { token?: string; password?: string };
  if (!body.token || !body.password || body.password.length < 8) {
    return NextResponse.json(
      { error: "Use a valid reset link and a password of at least 8 characters." },
      { status: 400 },
    );
  }
  const updated = await resetPassword(body.token, body.password);
  if (!updated)
    return NextResponse.json(
      { error: "This reset link is invalid or has expired." },
      { status: 400 },
    );
  return NextResponse.json({ message: "Password updated. You can sign in now." });
}

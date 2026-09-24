import { NextResponse } from "next/server";
import { findUserByEmail, updateVerificationToken } from "@/server/auth/users";
import { sendVerificationEmail } from "@/server/auth/mail";
import { enforceRateLimit } from "@/server/rate-limit";

export async function POST(request: Request) {
  const limited = enforceRateLimit(request, "resend-verification", {
    limit: 5,
    windowMs: 15 * 60_000,
  });
  if (limited) return limited;

  const body = (await request.json()) as { email?: string };
  const email = body.email?.trim().toLowerCase();
  const user = email ? await findUserByEmail(email) : null;
  if (!user || user.emailVerified)
    return NextResponse.json({
      message: "If the account exists, a verification email is on its way.",
    });

  try {
    const token = await updateVerificationToken(user.id);
    await sendVerificationEmail({ email: user.email, firstName: user.firstName, token });
  } catch (error) {
    console.error("Unable to resend verification email", error);
  }
  return NextResponse.json({
    message: "If the account exists, a verification email is on its way.",
  });
}

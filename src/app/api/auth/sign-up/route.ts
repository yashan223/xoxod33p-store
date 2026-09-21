import { NextResponse } from "next/server";
import { createUser, findUserByEmail } from "@/server/auth/users";
import { sendVerificationEmail } from "@/server/auth/mail";
import { enforceRateLimit } from "@/server/rate-limit";

export async function POST(request: Request) {
  const limited = enforceRateLimit(request, "sign-up", { limit: 5, windowMs: 10 * 60_000 });
  if (limited) return limited;

  const body = await request.json() as { email?: string; password?: string; firstName?: string; country?: string; acceptedTerms?: boolean };
  const email = body.email?.trim().toLowerCase();
  const password = body.password ?? "";
  if (!email || !email.includes("@") || password.length < 8 || body.acceptedTerms !== true) {
    return NextResponse.json({ error: "Use a valid email and a password of at least 8 characters." }, { status: 400 });
  }

  if (await findUserByEmail(email)) {
    return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
  }

  try {
    const { user, verificationToken } = await createUser({ email, password, firstName: body.firstName, country: body.country });
    await sendVerificationEmail({ email: user.email, firstName: user.firstName, token: verificationToken });
    return NextResponse.json({ message: "Check your email to verify your account." }, { status: 201 });
  } catch (error) {
    console.error("Unable to create account", error);
    return NextResponse.json({ error: "We could not create your account right now." }, { status: 500 });
  }
}

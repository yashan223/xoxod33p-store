import { NextResponse } from "next/server";
import { createPasswordResetToken } from "@/server/auth/users";
import { sendPasswordResetEmail } from "@/server/auth/mail";

const genericMessage = "If an account exists for that email, a reset link is on its way.";

export async function POST(request: Request) {
  const body = await request.json() as { email?: string };
  const email = body.email?.trim().toLowerCase();
  if (!email || !email.includes("@")) return NextResponse.json({ message: genericMessage });

  try {
    const reset = await createPasswordResetToken(email);
    if (reset) await sendPasswordResetEmail({ email: reset.user.email, firstName: reset.user.firstName, token: reset.token });
  } catch (error) {
    console.error("Unable to send password reset email", error);
  }
  return NextResponse.json({ message: genericMessage });
}

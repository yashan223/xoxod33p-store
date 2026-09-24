import { NextResponse } from "next/server";
import { getCurrentUser } from "@/server/auth/session";
import { updateUserProfile } from "@/server/auth/users";

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const body = (await request.json()) as { firstName?: unknown; country?: unknown };
  if (body.firstName !== undefined && typeof body.firstName !== "string")
    return NextResponse.json({ error: "Invalid name." }, { status: 400 });
  if (body.country !== undefined && typeof body.country !== "string")
    return NextResponse.json({ error: "Invalid country." }, { status: 400 });

  const updatedUser = await updateUserProfile(user.id, {
    firstName: body.firstName as string | undefined,
    country: body.country as string | undefined,
  });
  if (!updatedUser) return NextResponse.json({ error: "User not found." }, { status: 404 });
  return NextResponse.json({
    user: {
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      country: updatedUser.country,
    },
  });
}

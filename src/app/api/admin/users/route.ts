import { NextResponse } from "next/server";
import { requireAdmin } from "@/server/auth/admin";
import { deleteUser } from "@/server/auth/users";

export async function DELETE(request: Request) {
  const admin = await requireAdmin();
  const body = await request.json().catch(() => null) as { id?: unknown } | null;
  const userId = typeof body?.id === "string" ? body.id : "";

  if (!userId) return NextResponse.json({ error: "A user id is required." }, { status: 400 });
  if (userId === admin.id) return NextResponse.json({ error: "You cannot delete your own admin account." }, { status: 400 });

  const deleted = await deleteUser(userId);
  if (!deleted) return NextResponse.json({ error: "User not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
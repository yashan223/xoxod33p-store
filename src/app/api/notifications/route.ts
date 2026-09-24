import { NextResponse } from "next/server";
import { getCurrentUser } from "@/server/auth/session";
import { isAdminUser } from "@/server/auth/admin";
import { listMessageNotifications, markMessageNotificationsRead } from "@/server/orders/orders";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ notifications: [] }, { status: 401 });
  const isAdmin = await isAdminUser();
  const notifications = await listMessageNotifications({ userId: user.id, isAdmin });
  return NextResponse.json({ notifications });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const isAdmin = await isAdminUser();
  const body = (await request.json()) as { keys?: string[] };
  const keys = Array.isArray(body.keys)
    ? body.keys.filter((key): key is string => typeof key === "string").slice(0, 50)
    : [];
  await markMessageNotificationsRead({ userId: user.id, isAdmin, keys });
  return NextResponse.json({ updated: true });
}

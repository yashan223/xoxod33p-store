import { NextResponse } from "next/server";
import { requireAdmin } from "@/server/auth/admin";
import { listOrders } from "@/server/orders/orders";

export async function GET() {
  await requireAdmin();
  return NextResponse.json({ orders: await listOrders() });
}

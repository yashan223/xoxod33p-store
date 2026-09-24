import { NextResponse } from "next/server";
import { requireAdmin } from "@/server/auth/admin";
import { addOrderMessage, getOrderForAdmin, updateOrderStatus } from "@/server/orders/orders";

type RouteContext = { params: Promise<{ id: string }> };

type OrderStatus = "requested" | "accepted" | "in_progress" | "completed" | "cancelled";

export async function GET(_request: Request, context: RouteContext) {
  await requireAdmin();
  const { id } = await context.params;
  const order = await getOrderForAdmin(id);
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
  return NextResponse.json({ order });
}

export async function PATCH(request: Request, context: RouteContext) {
  const admin = await requireAdmin();
  const { id } = await context.params;
  const body = (await request.json()) as { status?: OrderStatus; message?: string };
  if (
    body.status &&
    !["requested", "accepted", "in_progress", "completed", "cancelled"].includes(body.status)
  ) {
    return NextResponse.json({ error: "Invalid order status." }, { status: 400 });
  }
  if (body.status && !(await updateOrderStatus(id, body.status, admin.id))) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }
  let message = null;
  if (body.message?.trim()) {
    message = await addOrderMessage(id, admin.id, "admin", body.message.trim());
  }
  return NextResponse.json({ updated: true, message });
}

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/server/auth/session";
import { addOrderMessage, getOrderForUser } from "@/server/orders/orders";
import { enforceRateLimit } from "@/server/rate-limit";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const { id } = await context.params;
  const order = await getOrderForUser(id, user.id);
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
  return NextResponse.json({ order });
}

export async function POST(request: Request, context: RouteContext) {
  const limited = enforceRateLimit(request, "order-messages", { limit: 20, windowMs: 60_000 });
  if (limited) return limited;

  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const { id } = await context.params;
  const order = await getOrderForUser(id, user.id);
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
  const body = (await request.json()) as { message?: string };
  const message = body.message?.trim();
  if (!message || message.length > 2000)
    return NextResponse.json(
      { error: "Message must be between 1 and 2000 characters." },
      { status: 400 },
    );
  const created = await addOrderMessage(id, user.id, "customer", message);
  return NextResponse.json({ message: created }, { status: 201 });
}

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/server/auth/session";
import { createOrder } from "@/server/orders/orders";

type OrderRequest = { orderId?: string; items?: { productId?: unknown; quantity?: unknown }[] };

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in before requesting a server." }, { status: 401 });

  const body = await request.json().catch(() => null) as OrderRequest | null;
  const orderId = body?.orderId?.trim();
  if (!orderId || !/^[a-zA-Z0-9_-]{3,80}$/.test(orderId)) return NextResponse.json({ error: "A valid orderId is required." }, { status: 400 });
  if (!Array.isArray(body?.items) || body.items.length === 0 || body.items.length > 10) return NextResponse.json({ error: "Provide between 1 and 10 request items." }, { status: 400 });

  const items = body.items.map((item) => ({ productId: typeof item.productId === "string" ? item.productId : "", quantity: typeof item.quantity === "number" ? item.quantity : 1 }));
  if (items.some((item) => !item.productId || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99)) return NextResponse.json({ error: "One or more request items are invalid." }, { status: 400 });

  try {
    const order = await createOrder(user, { orderId, items });
    return NextResponse.json({ orderId: order.id }, { status: 201 });
  } catch (error) {
    console.error("Order request creation failed", error);
    return NextResponse.json({ error: "Unable to submit the server request." }, { status: 400 });
  }
}
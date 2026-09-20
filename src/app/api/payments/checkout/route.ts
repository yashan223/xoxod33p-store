import { NextResponse } from "next/server";
import { getPaymentLineItems } from "@/server/payments/catalog";
import { getPaymentsLkClient, getPaymentsReturnUrl } from "@/server/payments/payments-lk";
import { getCurrentUser } from "@/server/auth/session";
import { getOrderForUser } from "@/server/orders/orders";

export const runtime = "nodejs";

type CheckoutItem = {
  productId: string;
  quantity?: number;
};

type CheckoutRequest = {
  orderId?: string;
};

export async function POST(request: Request) {
  let body: CheckoutRequest;

  try {
    body = (await request.json()) as CheckoutRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const orderId = body.orderId?.trim();

  if (!orderId || !/^[a-zA-Z0-9_-]{3,80}$/.test(orderId)) {
    return NextResponse.json({ error: "A valid orderId is required." }, { status: 400 });
  }

  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in before placing an order." }, { status: 401 });
  const order = await getOrderForUser(orderId, user.id);
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
  if (order.status !== "accepted") return NextResponse.json({ error: "This order must be accepted before payment." }, { status: 409 });
  if (order.paymentStatus === "paid") return NextResponse.json({ error: "This order has already been paid." }, { status: 409 });

  try {
    const lineItems = await getPaymentLineItems(order.items.map(({ productId, quantity }) => ({ productId, quantity })));
    const checkout = await getPaymentsLkClient().checkouts.create(
      {
        lineItems,
        reference: orderId,
        successUrl: getPaymentsReturnUrl(`${process.env.PAYMENTS_LK_SUCCESS_PATH ?? "/checkout/success"}?order=${orderId}`),
        cancelUrl: getPaymentsReturnUrl(process.env.PAYMENTS_LK_CANCEL_PATH ?? "/cart"),
      },
      { idempotencyKey: `order-${orderId}` },
    );

    return NextResponse.json({ checkoutId: checkout.id, url: checkout.url });
  } catch (error) {
    console.error("Payments.lk checkout creation failed", error);
    return NextResponse.json({ error: "Unable to create the payment checkout." }, { status: 502 });
  }
}

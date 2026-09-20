import { NextResponse } from "next/server";
import { getPaymentLineItems } from "@/server/payments/catalog";
import { getPaymentsLkClient, getPaymentsReturnUrl } from "@/server/payments/payments-lk";
import { getCurrentUser } from "@/server/auth/session";
import { createOrder } from "@/server/orders/orders";

export const runtime = "nodejs";

type CheckoutItem = {
  productId: string;
  quantity?: number;
};

type CheckoutRequest = {
  orderId?: string;
  items?: CheckoutItem[];
};

export async function POST(request: Request) {
  let body: CheckoutRequest;

  try {
    body = (await request.json()) as CheckoutRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const orderId = body.orderId?.trim();
  const items = body.items;

  if (!orderId || !/^[a-zA-Z0-9_-]{3,80}$/.test(orderId)) {
    return NextResponse.json({ error: "A valid orderId is required." }, { status: 400 });
  }

  if (!Array.isArray(items) || items.length === 0 || items.length > 10) {
    return NextResponse.json({ error: "Provide between 1 and 10 checkout items." }, { status: 400 });
  }

  const validatedItems: { productId: string; quantity: number }[] = [];

  for (const item of items) {
    const quantity = item.quantity ?? 1;

    if (typeof item.productId !== "string" || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      return NextResponse.json({ error: "One or more checkout items are invalid." }, { status: 400 });
    }

    validatedItems.push({ productId: item.productId, quantity });
  }

  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in before placing an order." }, { status: 401 });

  try {
    await createOrder(user, { orderId, items: validatedItems });
    const lineItems = await getPaymentLineItems(validatedItems);
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

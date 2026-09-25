import { NextResponse } from "next/server";
import { getCurrentUser } from "@/server/auth/session";
import { isUserAdmin } from "@/server/auth/admin";
import { createServerRenewalCheckout } from "@/server/subscriptions/servers";
import { enforceRateLimit } from "@/server/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const limited = enforceRateLimit(request, "server-renew", { limit: 10, windowMs: 5 * 60_000 });
  if (limited) return limited;

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Please sign in to renew your server." }, { status: 401 });
  }

  if (isUserAdmin(user)) {
    return NextResponse.json(
      { error: "Admins cannot renew servers as customers." },
      { status: 403 },
    );
  }

  let body: { subscriptionId?: string };
  try {
    body = (await request.json()) as { subscriptionId?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const subscriptionId = body.subscriptionId?.trim();
  if (!subscriptionId) {
    return NextResponse.json({ error: "subscriptionId is required." }, { status: 400 });
  }

  try {
    const result = await createServerRenewalCheckout({
      subscriptionId,
      userId: user.id,
      userEmail: user.email,
    });

    return NextResponse.json({ url: result.checkoutUrl, orderId: result.orderId });
  } catch (error) {
    console.error("Server renewal checkout failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to initiate renewal." },
      { status: 400 },
    );
  }
}

import Link from "next/link";
import { getCurrentUser } from "@/server/auth/session";
import { getOrderForUser, markOrderPaid } from "@/server/orders/orders";
import { getPaymentsLkClient } from "@/server/payments/payments-lk";

type PageProps = { searchParams: Promise<{ order?: string; checkout?: string; status?: string }> };

export default async function CheckoutSuccessPage({ searchParams }: PageProps) {
  const { order, checkout, status } = await searchParams;
  const user = await getCurrentUser();
  let paymentConfirmed = false;

  if (user && order && checkout && status === "succeeded") {
    const currentOrder = await getOrderForUser(order, user.id);
    if (currentOrder) {
      try {
        const checkoutRecord = await getPaymentsLkClient().checkouts.retrieve(checkout);
        const payment = checkoutRecord.payment;
        const expectedAmountCents = currentOrder.items.reduce((total, item) => total + item.unitPrice * item.quantity * 100, 0);
        if (payment.status === "succeeded" && payment.reference === order && payment.amountCents === expectedAmountCents) {
          paymentConfirmed = await markOrderPaid(order, payment.id, payment.amountCents);
          if (!paymentConfirmed) paymentConfirmed = (await getOrderForUser(order, user.id))?.paymentStatus === "paid";
        }
      } catch (error) {
        console.error("Unable to confirm Payments.lk checkout", error);
      }
    }
  }

  const title = paymentConfirmed ? "Payment confirmed." : status === "failed" || status === "canceled" ? "Payment was not completed." : "Payment is being confirmed.";
  const message = paymentConfirmed ? "Your order is paid. An operator will continue delivery through your order chat." : "We are waiting for payment confirmation. Your order status will update when Payments.lk confirms the transaction.";
  return <main className="checkout-result"><span className="section-kicker">{paymentConfirmed ? "Payment received" : "Payment status"}</span><h1>{title}</h1><p>{message}</p>{order && <Link className="ui-button ui-button-default" href={`/orders/${encodeURIComponent(order)}`}>Open order chat</Link>}</main>;
}

import Link from "next/link";

type PageProps = { searchParams: Promise<{ order?: string }> };

export default async function CheckoutSuccessPage({ searchParams }: PageProps) {
  const { order } = await searchParams;
  return <main className="checkout-result"><span className="section-kicker">Payment received</span><h1>Your request is in the queue.</h1><p>An operator will review the order and continue delivery through your order chat.</p>{order && <Link className="ui-button ui-button-default" href={`/orders/${encodeURIComponent(order)}`}>Open order chat</Link>}</main>;
}

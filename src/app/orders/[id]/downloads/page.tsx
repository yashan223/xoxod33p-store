import Link from "next/link";
import { notFound } from "next/navigation";
import { getActiveProductsByIds } from "@/server/catalog/products";
import { requireUser } from "@/server/auth/session";
import { getOrderForUser } from "@/server/orders/orders";

type PageProps = { params: Promise<{ id: string }> };

export default async function OrderDownloadsPage({ params }: PageProps) {
  const user = await requireUser();
  const { id } = await params;
  const order = await getOrderForUser(id, user.id);
  if (!order) notFound();
  const products = await getActiveProductsByIds(order.items.map((item) => item.productId));
  const productsById = new Map(products.map((product) => [product.id, product]));
  const downloadableItems = order.items.filter((item) => productsById.get(item.productId)?.type === "mod");

  return <main className="downloads-page"><div className="downloads-heading"><Link className="back-link" href={`/orders/${order.id}`}>Back to order chat</Link><span className="section-kicker">Paid downloads</span><h1>Your tools, ready when you are.</h1><p>Download mods and tools purchased with order {order.id}. Payment unlocks files for this account only.</p></div><section className="download-list">{order.paymentStatus !== "paid" ? <p className="download-pending">Pay for the accepted order in the chat to unlock downloads.</p> : downloadableItems.length === 0 ? <p className="download-pending">This order contains services only. Continue in the order chat for delivery.</p> : downloadableItems.map((item) => { const product = productsById.get(item.productId); return <div className="download-item" key={item.productId}><div><strong>{item.name}</strong><span>{product?.meta ?? "Purchased product"}</span></div>{product?.downloadKey ? <a className="ui-button ui-button-default" href={`/api/orders/${order.id}/downloads/${item.productId}`}>Download mod</a> : <span className="download-pending">File being prepared</span>}</div>; })}</section></main>;
}

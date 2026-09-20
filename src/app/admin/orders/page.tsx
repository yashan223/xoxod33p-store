import Link from "next/link";
import { requireAdmin } from "@/server/auth/admin";
import { listOrders } from "@/server/orders/orders";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  await requireAdmin();
  const orders = await listOrders();
  return <main className="admin-page"><div className="admin-page-heading"><div><span className="admin-kicker">Fulfillment queue</span><h1>Customer orders</h1><p>Accept requests, share delivery details, and keep every conversation logged.</p></div><span className="admin-date">{orders.length} ORDERS</span></div><section className="admin-panel order-table-panel"><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Order</th><th>Customer</th><th>Payment</th><th>Status</th><th>Updated</th></tr></thead><tbody>{orders.map((order) => <tr key={order.id}><td><Link className="admin-order-link" href={`/admin/orders/${order.id}`}>{order.id}</Link><small>{order.items.map((item) => `${item.name} x${item.quantity}`).join(", ")}</small></td><td>{order.email}</td><td>{order.paymentStatus}</td><td><span className="admin-status active">{order.status.replace("_", " ")}</span></td><td>{new Date(order.updatedAt).toLocaleDateString("en-LK")}</td></tr>)}</tbody></table>{orders.length === 0 && <p className="admin-empty">No customer orders yet.</p>}</div></section></main>;
}

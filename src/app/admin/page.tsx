import { Package, Server, ShoppingCart, Wrench, Cable } from "lucide-react";
import { getAdminOverview } from "@/server/admin/overview";
import { listOrders } from "@/server/orders/orders";

export default async function AdminDashboardPage() {
  const [overview, orders] = await Promise.all([getAdminOverview(), listOrders()]);

  return (
    <main className="admin-page">
      <section className="admin-stat-grid"><div className="admin-stat"><Package size={18} /><span>Active products</span><strong>{overview.activeProducts}</strong><small>{overview.totalProducts} total records</small></div><div className="admin-stat"><Server size={18} /><span>Server plans</span><strong>{overview.serverProducts}</strong><small>Available to customers</small></div><div className="admin-stat"><Wrench size={18} /><span>Mods & tools</span><strong>{overview.modProducts}</strong><small>Downloadable catalog items</small></div><div className="admin-stat"><Cable size={18} /><span>Services</span><strong>{overview.serviceProducts}</strong><small>Remote setup work</small></div><div className="admin-stat"><ShoppingCart size={18} /><span>Orders</span><strong>{overview.totalOrders}</strong><small>All-time records</small></div></section>
      <section className="admin-panel admin-activity-panel"><div className="admin-panel-header"><div><span className="admin-kicker">Customer activity</span><h2>Recent activity</h2></div><span className="admin-panel-meta">{orders.length} total orders</span></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Order</th><th>Customer</th><th>Payment</th><th>Status</th><th>Updated</th></tr></thead><tbody>{orders.slice(0, 8).map((order) => <tr key={order.id}><td><a className="admin-order-link" href={`/admin/orders/${order.id}`}>{order.id}</a><small>{order.items.map((item) => `${item.name} x${item.quantity}`).join(", ")}</small></td><td>{order.email}</td><td>{order.paymentStatus}</td><td><span className="admin-status active">{order.status.replace("_", " ")}</span></td><td>{new Date(order.updatedAt).toLocaleDateString("en-LK")}</td></tr>)}</tbody></table>{orders.length === 0 && <p className="admin-empty">No customer activity yet.</p>}</div></section>
    </main>
  );
}

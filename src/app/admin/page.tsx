import { Package, Server, ShoppingCart, Wrench, Cable } from "lucide-react";
import { getAdminOverview, getAdminProducts } from "@/server/admin/overview";

export default async function AdminDashboardPage() {
  const [overview, products] = await Promise.all([getAdminOverview(), getAdminProducts()]);

  return (
    <main className="admin-page"><div className="admin-page-heading"><div><span className="admin-kicker">Overview</span><h1>Good morning, operator.</h1><p>Keep the catalog current and stay close to every customer order.</p></div><span className="admin-date">LIVE DATABASE</span></div>
      <section className="admin-stat-grid"><div className="admin-stat"><Package size={18} /><span>Active products</span><strong>{overview.activeProducts}</strong><small>{overview.totalProducts} total records</small></div><div className="admin-stat"><Server size={18} /><span>Server plans</span><strong>{overview.serverProducts}</strong><small>Available to customers</small></div><div className="admin-stat"><Wrench size={18} /><span>Mods & tools</span><strong>{overview.modProducts}</strong><small>Downloadable catalog items</small></div><div className="admin-stat"><Cable size={18} /><span>Services</span><strong>{overview.serviceProducts}</strong><small>Remote setup work</small></div><div className="admin-stat"><ShoppingCart size={18} /><span>Orders</span><strong>{overview.totalOrders}</strong><small>All-time records</small></div></section>
      <section className="admin-panel"><div className="admin-panel-header"><div><span className="admin-kicker">Catalog</span><h2>Current products</h2></div><span className="admin-panel-meta">MongoDB / products</span></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Product</th><th>Type</th><th>Price</th><th>Status</th><th>Updated</th></tr></thead><tbody>{products.map((product) => <tr key={product.id}><td><strong>{product.name}</strong><small>{product.description}</small></td><td>{product.type === "server" ? "Server" : product.type === "service" ? "Service" : "Mod / tool"}</td><td>Rs. {product.price.toLocaleString("en-LK")}</td><td><span className={product.active ? "admin-status active" : "admin-status"}>{product.active ? "Active" : "Hidden"}</span></td><td>{product.updatedAt ? new Date(product.updatedAt).toLocaleDateString("en-LK") : "-"}</td></tr>)}</tbody></table>{products.length === 0 && <p className="admin-empty">No products found. Add products from the admin tools.</p>}</div></section>
    </main>
  );
}

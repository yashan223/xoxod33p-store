import Link from "next/link";
import { requireAdmin } from "@/server/auth/admin";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await requireAdmin();

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link className="admin-brand" href="/admin"><span className="brand-mark">X</span><span><strong>xoxod33p</strong><small>ADMIN CONSOLE</small></span></Link>
        <nav className="admin-nav" aria-label="Admin navigation"><Link className="active" href="/admin">Overview</Link><Link href="/admin/products">Products</Link><Link href="/admin/orders">Orders</Link><Link href="/admin/users">Users</Link><Link href="/admin/support">Support</Link></nav>
        <Link className="admin-store-link" href="/">Back to store <span>↗</span></Link>
      </aside>
      <div className="admin-content"><header className="admin-topbar"><div><span className="admin-kicker">Workspace</span><strong>Store operations</strong></div><div className="admin-user"><span>{user.firstName ?? user.email}</span><form action="/api/auth/sign-out" method="post"><button className="admin-sign-out" type="submit">Sign out</button></form></div></header>{children}</div>
    </div>
  );
}

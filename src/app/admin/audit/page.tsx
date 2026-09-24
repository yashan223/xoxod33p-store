import { requireAdmin } from "@/server/auth/admin";
import { listAuditLogs } from "@/server/admin/audit";
import { AuditLogViewer } from "@/components/admin/audit-log-viewer";

export const dynamic = "force-dynamic";

export default async function AdminAuditPage() {
  await requireAdmin();
  const logs = await listAuditLogs(100);

  return (
    <main className="admin-page">
      <div className="admin-page-heading">
        <div>
          <span className="admin-kicker">Security & Governance</span>
          <h1>Audit trail</h1>
          <p>
            Real-time records of administrative actions, catalog modifications, and customer
            account changes.
          </p>
        </div>
        <span className="admin-date">{logs.length} EVENTS</span>
      </div>
      <AuditLogViewer logs={logs} isDashboardView={false} />
    </main>
  );
}

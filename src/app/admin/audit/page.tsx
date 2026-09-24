import { requireAdmin } from "@/server/auth/admin";
import { listAuditLogs } from "@/server/admin/audit";
import { AuditLogViewer } from "@/components/admin/audit-log-viewer";

export const dynamic = "force-dynamic";

export default async function AdminAuditPage() {
  await requireAdmin();
  const logs = await listAuditLogs(100);

  return (
    <main className="admin-page">
      <AuditLogViewer logs={logs} isDashboardView={false} />
    </main>
  );
}

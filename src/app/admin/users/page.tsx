import { requireAdmin } from "@/server/auth/admin";
import { listAdminUsers } from "@/server/auth/users";
import { UserManagement } from "@/components/admin/user-management";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  await requireAdmin();
  const users = await listAdminUsers();

  return (
    <main className="admin-page">
      <div className="admin-page-heading">
        <div><span className="admin-kicker">Customer accounts</span><h1>User management</h1><p>Review account activity and remove accounts that should no longer have access.</p></div>
        <span className="admin-date">{users.length} USERS</span>
      </div>
      <UserManagement users={users.map((user) => ({ ...user, createdAt: user.createdAt.toISOString(), updatedAt: user.updatedAt.toISOString() }))} />
    </main>
  );
}
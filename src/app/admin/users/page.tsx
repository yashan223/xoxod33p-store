import { requireAdmin } from "@/server/auth/admin";
import { listAdminUsers } from "@/server/auth/users";
import { UserManagement } from "@/components/admin/user-management";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  await requireAdmin();
  const users = await listAdminUsers();

  return (
    <main className="admin-page">
      <UserManagement
        users={users.map((user) => ({
          ...user,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        }))}
      />
    </main>
  );
}

"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";

type AdminUserView = {
  id: string;
  email: string;
  firstName?: string;
  country?: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
};

export function UserManagement({ users: initialUsers }: { users: AdminUserView[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function handleDelete(user: AdminUserView) {
    if (!window.confirm(`Delete ${user.email}? This also signs the user out of every device.`)) return;
    setPendingId(user.id);
    try {
      const response = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null) as { error?: string } | null;
        throw new Error(body?.error ?? "Unable to delete user.");
      }
      setUsers((currentUsers) => currentUsers.filter((currentUser) => currentUser.id !== user.id));
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Unable to delete user.");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <section className="admin-panel">
      <div className="admin-panel-header"><div><span className="admin-kicker">Accounts</span><h2>Registered users</h2></div><span className="admin-panel-meta">MongoDB / users</span></div>
      <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>User</th><th>Country</th><th>Verification</th><th>Joined</th><th aria-label="Actions" /></tr></thead><tbody>{users.map((user) => <tr key={user.id}><td><strong>{user.firstName || "Unnamed customer"}</strong><small>{user.email}</small></td><td>{user.country || "-"}</td><td><span className={user.emailVerified ? "admin-status active" : "admin-status"}>{user.emailVerified ? "Verified" : "Pending"}</span></td><td>{new Date(user.createdAt).toLocaleDateString("en-LK")}</td><td className="admin-table-action"><button className="admin-action-button" type="button" onClick={() => void handleDelete(user)} disabled={pendingId === user.id} aria-label={`Delete ${user.email}`} title="Delete user"><Trash2 size={15} /></button></td></tr>)}</tbody></table>{users.length === 0 && <p className="admin-empty">No customer accounts yet.</p>}</div>
    </section>
  );
}
import { requireAdmin } from "@/server/auth/admin";
import {
  listAllServerSubscriptions,
  syncExistingPaidServers,
} from "@/server/subscriptions/servers";
import { ServerSubscriptionManager } from "@/components/admin/server-subscription-manager";

export const dynamic = "force-dynamic";

export default async function AdminSubscriptionsPage() {
  await requireAdmin();
  await syncExistingPaidServers().catch(() => {});
  const subscriptions = await listAllServerSubscriptions();

  return (
    <main className="admin-page">
      <ServerSubscriptionManager subscriptions={subscriptions} />
    </main>
  );
}

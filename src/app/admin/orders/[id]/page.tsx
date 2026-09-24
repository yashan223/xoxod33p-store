import { notFound } from "next/navigation";
import { OrderChat } from "@/components/orders/order-chat";
import { requireAdmin } from "@/server/auth/admin";
import { getOrderForAdmin } from "@/server/orders/orders";

type PageProps = { params: Promise<{ id: string }> };

export default async function AdminOrderPage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;
  const order = await getOrderForAdmin(id);
  if (!order) notFound();
  return (
    <main className="admin-page">
      <OrderChat admin order={JSON.parse(JSON.stringify(order))} />
    </main>
  );
}

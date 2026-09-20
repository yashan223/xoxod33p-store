import { requireAdmin } from "@/server/auth/admin";
import { getAdminProducts } from "@/server/admin/overview";
import { ProductManager } from "@/components/admin/product-manager";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  await requireAdmin();
  const products = await getAdminProducts();

  return <main className="admin-page"><ProductManager products={products} /></main>;
}
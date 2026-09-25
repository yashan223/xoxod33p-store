import { Storefront } from "@/components/store/storefront";
import { getActiveProducts } from "@/server/catalog/products";
import { getCurrentUser } from "@/server/auth/session";
import { isAdminUser } from "@/server/auth/admin";
import type { Product } from "@/types/product";

export const dynamic = "force-dynamic";

export default async function Home() {
  let products: Product[] = [];
  const currentUser = await getCurrentUser();
  const isAdmin = await isAdminUser();

  try {
    products = await getActiveProducts();
  } catch (error) {
    console.error("Unable to load products from MongoDB", error);
  }

  return <Storefront products={products} currentUser={currentUser} isAdmin={isAdmin} />;
}

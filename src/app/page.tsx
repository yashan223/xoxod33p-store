import { Storefront } from "@/components/store/storefront";
import { getActiveProducts } from "@/server/catalog/products";
import type { Product } from "@/types/product";

export const dynamic = "force-dynamic";

export default async function Home() {
  let products: Product[] = [];

  try {
    products = await getActiveProducts();
  } catch (error) {
    console.error("Unable to load products from MongoDB", error);
  }

  return <Storefront products={products} />;
}

import { getDatabase } from "@/server/db/mongodb";
import type { Product } from "@/types/product";

type ProductDocument = Product & { createdAt?: Date; updatedAt?: Date };

export async function getAdminOverview() {
  const database = await getDatabase();
  const products = database.collection<ProductDocument>("products");
  const orders = database.collection("orders");
  const [totalProducts, activeProducts, serverProducts, modProducts, serviceProducts, totalOrders] = await Promise.all([
    products.countDocuments(),
    products.countDocuments({ active: true }),
    products.countDocuments({ type: "server", active: true }),
    products.countDocuments({ type: "mod", active: true }),
    products.countDocuments({ type: "service", active: true }),
    orders.countDocuments(),
  ]);

  return { totalProducts, activeProducts, serverProducts, modProducts, serviceProducts, totalOrders };
}

export async function getAdminProducts() {
  const database = await getDatabase();
  const products = await database.collection<ProductDocument>("products").find({}).sort({ updatedAt: -1 }).toArray();
  return products.map(({ _id, createdAt, updatedAt, ...product }) => ({
    ...product,
    id: product.id || _id.toString(),
    createdAt: createdAt?.toISOString(),
    updatedAt: updatedAt?.toISOString(),
  }));
}

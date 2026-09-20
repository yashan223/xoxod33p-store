import type { Product } from "@/types/product";
import { getDatabase } from "@/server/db/mongodb";

type ProductDocument = Omit<Product, "createdAt" | "updatedAt"> & {
  createdAt?: Date;
  updatedAt?: Date;
};

export async function getActiveProducts(): Promise<Product[]> {
  const database = await getDatabase();
  const records = await database
    .collection<ProductDocument>("products")
    .find({ active: true })
    .sort({ type: 1, createdAt: -1 })
    .toArray();

  return records.map(({ _id, createdAt, updatedAt, ...product }) => ({
    ...product,
    id: product.id || _id.toString(),
    createdAt: createdAt?.toISOString(),
    updatedAt: updatedAt?.toISOString(),
  }));
}

export async function getActiveProductsByIds(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return [];

  const database = await getDatabase();
  const records = await database
    .collection<ProductDocument>("products")
    .find({ id: { $in: ids }, active: true })
    .toArray();

  return records.map(({ _id, createdAt, updatedAt, ...product }) => ({
    ...product,
    id: product.id || _id.toString(),
    createdAt: createdAt?.toISOString(),
    updatedAt: updatedAt?.toISOString(),
  }));
}

export async function getActiveProductById(id: string): Promise<Product | null> {
  const products = await getActiveProductsByIds([id]);
  return products[0] ?? null;
}

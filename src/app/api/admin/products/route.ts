import { NextResponse } from "next/server";
import { requireAdmin } from "@/server/auth/admin";
import { getDatabase } from "@/server/db/mongodb";
import type { Product, ProductType } from "@/types/product";

type ProductRecord = Omit<Product, "createdAt" | "updatedAt"> & { createdAt: Date; updatedAt: Date };

const productTypes: ProductType[] = ["server", "mod", "service"];

function productInput(body: Record<string, unknown>) {
  const type = body.type;
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const description = typeof body.description === "string" ? body.description.trim() : "";
  const meta = typeof body.meta === "string" ? body.meta.trim() : "";
  const price = typeof body.price === "number" ? body.price : Number(body.price);
  if (!name || !description || !meta || !productTypes.includes(type as ProductType) || !Number.isInteger(price) || price < 0) return null;
  return { type: type as ProductType, name, description, meta, price, accent: typeof body.accent === "string" && body.accent.trim() ? body.accent.trim() : "slate", imageUrl: typeof body.imageUrl === "string" ? body.imageUrl.trim() : "", active: body.active !== false, available: body.available !== false };
}

export async function POST(request: Request) {
  await requireAdmin();
  const input = productInput(await request.json() as Record<string, unknown>);
  if (!input) return NextResponse.json({ error: "Enter a valid name, type, description, specification, and price." }, { status: 400 });
  const now = new Date();
  const id = `${input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${Date.now().toString(36)}`;
  const product: ProductRecord = { id, ...input, createdAt: now, updatedAt: now };
  await (await getDatabase()).collection("products").insertOne(product);
  return NextResponse.json({ product: { ...product, createdAt: now.toISOString(), updatedAt: now.toISOString() } }, { status: 201 });
}
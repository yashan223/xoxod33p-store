import { NextResponse } from "next/server";
import { requireAdmin } from "@/server/auth/admin";
import { getDatabase } from "@/server/db/mongodb";
import { productTypes, type ProductType } from "@/types/product";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  await requireAdmin();
  const { id } = await context.params;
  const body = await request.json() as Record<string, unknown>;
  const allowed = ["name", "description", "meta", "price", "type", "accent", "active", "available", "tag"];
  const update = Object.fromEntries(Object.entries(body).filter(([key, value]) => allowed.includes(key) && value !== undefined));
  if (Object.keys(update).length === 0) return NextResponse.json({ error: "No valid product fields to update." }, { status: 400 });
  for (const field of ["name", "description", "meta"] as const) {
    if (field in update) {
      const value = update[field];
      if (typeof value !== "string" || !value.trim()) return NextResponse.json({ error: "Enter valid product details." }, { status: 400 });
      update[field] = value.trim();
    }
  }
  if (update.type !== undefined && !productTypes.includes(update.type as ProductType)) return NextResponse.json({ error: "Enter a valid product type." }, { status: 400 });
  if (update.price !== undefined) {
    update.price = Number(update.price);
    if (!Number.isInteger(update.price) || Number(update.price) < 0) return NextResponse.json({ error: "Enter a valid price." }, { status: 400 });
  }
  const result = await (await getDatabase()).collection("products").updateOne({ id }, { $set: { ...update, updatedAt: new Date() } });
  if (result.matchedCount === 0) return NextResponse.json({ error: "Product not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, context: RouteContext) {
  await requireAdmin();
  const { id } = await context.params;
  const result = await (await getDatabase()).collection("products").deleteOne({ id });
  if (result.deletedCount === 0) return NextResponse.json({ error: "Product not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
import { NextResponse } from "next/server";
import { requireAdmin } from "@/server/auth/admin";
import { getDatabase } from "@/server/db/mongodb";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  await requireAdmin();
  const { id } = await context.params;
  const body = await request.json() as Record<string, unknown>;
  const allowed = ["name", "description", "meta", "price", "type", "accent", "imageUrl", "active", "tag"];
  const update = Object.fromEntries(Object.entries(body).filter(([key, value]) => allowed.includes(key) && value !== undefined));
  if (typeof update.name === "string") update.name = update.name.trim();
  if (typeof update.description === "string") update.description = update.description.trim();
  if (typeof update.meta === "string") update.meta = update.meta.trim();
  if (update.price !== undefined) update.price = Number(update.price);
  if (!update.name || !update.description || !update.meta || !Number.isInteger(update.price) || Number(update.price) < 0) return NextResponse.json({ error: "Enter valid product details." }, { status: 400 });
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
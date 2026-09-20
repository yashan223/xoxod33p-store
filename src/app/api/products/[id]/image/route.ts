import { NextResponse } from "next/server";
import { getDatabase } from "@/server/db/mongodb";
import { readProductFile } from "@/server/storage/private-files";

type RouteContext = { params: Promise<{ id: string }> };

export const runtime = "nodejs";

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const product = await (await getDatabase()).collection<{ imageKey?: string; imageContentType?: string }>("products").findOne({ id }, { projection: { imageKey: 1, imageContentType: 1 } });
  if (!product?.imageKey) return new NextResponse("Image not found.", { status: 404 });

  try {
    const image = await readProductFile(product.imageKey);
    return new NextResponse(image, { headers: { "Content-Type": product.imageContentType ?? "application/octet-stream", "Cache-Control": "public, max-age=3600" } });
  } catch {
    return new NextResponse("Image not found.", { status: 404 });
  }
}

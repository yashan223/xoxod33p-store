import { NextResponse } from "next/server";
import { getDatabase } from "@/server/db/mongodb";
import { readProductFile } from "@/server/storage/private-files";

type RouteContext = { params: Promise<{ id: string }> };

export const runtime = "nodejs";

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const product = await (
    await getDatabase()
  )
    .collection<{ imageKey?: string; imageContentType?: string }>("products")
    .findOne({ id }, { projection: { imageKey: 1, imageContentType: 1 } });
  if (!product?.imageKey) return new NextResponse("Image not found.", { status: 404 });

  try {
    const image = await readProductFile(product.imageKey);
    const contentType =
      product.imageContentType &&
      /^image\/(png|jpe?g|webp|gif|svg\+xml|avif)$/i.test(product.imageContentType)
        ? product.imageContentType
        : "application/octet-stream";

    return new NextResponse(image, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'; sandbox",
      },
    });
  } catch {
    return new NextResponse("Image not found.", { status: 404 });
  }
}

import { NextResponse } from "next/server";
import { requireAdmin } from "@/server/auth/admin";
import { getDatabase } from "@/server/db/mongodb";
import { uploadProductFile } from "@/server/storage/private-files";

type RouteContext = { params: Promise<{ id: string }> };

export const runtime = "nodejs";

export async function POST(request: Request, context: RouteContext) {
  const admin = await requireAdmin();
  const { id } = await context.params;
  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Attach a file." }, { status: 400 });
  if (file.size === 0 || file.size > 500 * 1024 * 1024) return NextResponse.json({ error: "File must be between 1 byte and 500 MB." }, { status: 400 });

  const database = await getDatabase();
  const product = await database.collection("products").findOne({ id });
  if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 });

  try {
    const uploaded = await uploadProductFile(id, file);
    await database.collection("products").updateOne({ id }, { $set: { downloadKey: uploaded.key, downloadName: uploaded.fileName, updatedAt: new Date() } });
    console.info("Private product file uploaded", { productId: id, fileName: uploaded.fileName, adminId: admin.id });
    return NextResponse.json({ uploaded: true, fileName: uploaded.fileName });
  } catch (error) {
    console.error("Private product upload failed", error);
    return NextResponse.json({ error: "Unable to store the private product file." }, { status: 502 });
  }
}

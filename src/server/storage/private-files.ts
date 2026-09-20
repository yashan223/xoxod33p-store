import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, join, relative, resolve, sep } from "node:path";
import { randomBytes } from "node:crypto";

function getFilesRoot() {
  return resolve(process.env.PRODUCT_FILES_ROOT ?? join(process.cwd(), ".private-product-files"));
}

function safeFileName(fileName: string) {
  return basename(fileName).replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120) || "download";
}

function safeProductId(productId: string) {
  return productId.replace(/[^a-zA-Z0-9_-]/g, "_");
}

function assertInsideRoot(filePath: string) {
  const root = getFilesRoot();
  const resolvedPath = resolve(filePath);
  const pathFromRoot = relative(root, resolvedPath);
  if (pathFromRoot === ".." || pathFromRoot.startsWith(`..${sep}`) || resolve(root) === resolvedPath) throw new Error("Invalid private file path.");
}

export async function uploadProductFile(productId: string, file: File) {
  const root = getFilesRoot();
  const directory = join(root, "products", safeProductId(productId));
  await mkdir(directory, { recursive: true });
  const fileName = `${randomBytes(16).toString("hex")}-${safeFileName(file.name)}`;
  const filePath = join(directory, fileName);
  assertInsideRoot(filePath);
  await writeFile(filePath, Buffer.from(await file.arrayBuffer()), { flag: "wx" });
  return { key: relative(root, filePath), fileName: safeFileName(file.name), contentType: file.type || "application/octet-stream" };
}

export async function readProductFile(key: string) {
  const root = getFilesRoot();
  const filePath = resolve(root, key);
  assertInsideRoot(filePath);
  return readFile(filePath);
}

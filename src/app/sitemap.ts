import type { MetadataRoute } from "next";
import { getActiveProducts } from "@/server/catalog/products";
import { absoluteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const routes: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/terms"), lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: absoluteUrl("/refund-policy"), lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  try {
    const products = await getActiveProducts();
    routes.push(
      ...products.map((product) => ({
        url: absoluteUrl(`/products/${product.id}`),
        lastModified: product.updatedAt ? new Date(product.updatedAt) : now,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
    );
  } catch (error) {
    console.error("Unable to build product sitemap entries", error);
  }

  return routes;
}

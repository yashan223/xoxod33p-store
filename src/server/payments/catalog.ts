import { getActiveProductsByIds } from "@/server/catalog/products";

export async function getPaymentLineItems(items: { productId: string; quantity: number }[]) {
  const uniqueIds = [...new Set(items.map((item) => item.productId))];
  const products = await getActiveProductsByIds(uniqueIds);
  const productsById = new Map(products.map((product) => [product.id, product]));

  return items.map(({ productId, quantity }) => {
    const product = productsById.get(productId);
    if (!product) throw new Error("One or more products are unavailable.");

    return {
      name: product.name,
      description: product.description,
      unitAmountCents: product.price * 100,
      quantity,
    };
  });
}

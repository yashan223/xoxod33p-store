export const productTypes = ["server", "mod", "service"] as const;

export type ProductType = (typeof productTypes)[number];

export type Product = {
  id: string;
  type: ProductType;
  name: string;
  description: string;
  price: number;
  meta: string;
  tag?: string;
  accent: string;
  imageUrl?: string;
  imageKey?: string;
  imageContentType?: string;
  active: boolean;
  available?: boolean;
  downloadKey?: string;
  downloadName?: string;
  createdAt?: string;
  updatedAt?: string;
};

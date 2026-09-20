export type ProductType = "server" | "mod" | "service";

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
  active: boolean;
  available?: boolean;
  downloadKey?: string;
  downloadName?: string;
  createdAt?: string;
  updatedAt?: string;
};

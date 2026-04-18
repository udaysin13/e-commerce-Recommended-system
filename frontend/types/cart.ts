import type { Product } from "./product";

export type CartItem = {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  product: Pick<
    Product,
    "id" | "name" | "slug" | "sku" | "brand" | "price" | "currency" | "imageUrl" | "stockQuantity" | "category"
  >;
};

export type Cart = {
  id: string;
  status: string;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
};

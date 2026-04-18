export type AddCartItemInput = {
  productId: string;
  quantity: number;
};

export type UpdateCartItemInput = {
  quantity: number;
};

export type CartProductResponse = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  brand: string | null;
  price: number;
  currency: string;
  imageUrl: string | null;
  stockQuantity: number;
  category: {
    id: string;
    name: string;
    slug: string;
  };
};

export type CartItemResponse = {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  createdAt: Date;
  updatedAt: Date;
  product: CartProductResponse;
};

export type CartResponse = {
  id: string;
  status: string;
  items: CartItemResponse[];
  itemCount: number;
  subtotal: number;
  createdAt: Date;
  updatedAt: Date;
};

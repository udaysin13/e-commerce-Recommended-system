import { z } from "zod"

export const productSortValues = [
  "Newest",
  "Price low-high",
  "Price high-low",
  "Category",
] as const

export const productQuerySchema = z.object({
  q: z.string().default(""),
  category: z.string().default("All"),
  sort: z.enum(productSortValues).default("Newest"),
})

export const productInputSchema = z.object({
  category: z.string().trim().min(1, "Category is required."),
  kind: z.string().trim().min(1, "Type is required."),
  name: z.string().trim().min(1, "Display name is required."),
  imageUrl: z.string().trim().default("/placeholder.jpg"),
  images: z.array(z.string().trim().min(1, "Image URL cannot be empty.")).default([]),
  price: z.coerce.number().finite().positive("Price must be a positive number."),
  description: z.string().trim().max(1200, "Description must be 1200 characters or fewer.").optional().default(""),
  inStock: z.coerce.number().int().min(0, "Stock cannot be negative.").max(99999, "Stock is too large.").optional().default(0),
})

export const productIdSchema = z.string().min(1, "Invalid product id.")
export const orderIdSchema = z.string().min(1, "Invalid order id.")

export const adminLoginSchema = z.object({
  username: z.string().trim().min(1, "Username is required."),
  password: z.string().min(1, "Password is required."),
})

export const userSignupSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  email: z.string().trim().email("Invalid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
})

export const userLoginSchema = z.object({
  email: z.string().trim().email("Invalid email address."),
  password: z.string().min(1, "Password is required."),
})

export const cartItemSchema = z.object({
  productId: z.string().trim().min(1, "Product id is required."),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1."),
})

export const cartMutationSchema = cartItemSchema

export const cartDeleteSchema = z.object({
  productId: z.string().trim().min(1, "Product id is required."),
})

export const cartReplaceSchema = z.object({
  items: z.array(cartItemSchema).max(100, "Too many cart items."),
})

export const cartActionSchema = z.object({
  action: z.literal("clear"),
})

export const wishlistToggleSchema = z.object({
  productId: z.string().trim().min(1, "Product id is required."),
})

export const wishlistReplaceSchema = z.object({
  items: z.array(z.string().trim().min(1, "Product id is required.")).max(100, "Too many wishlist items."),
})

export const shippingAddressSchema = z.object({
  name: z.string().trim().min(1, "Shipping name is required."),
  line1: z.string().trim().min(1, "Address line 1 is required."),
  line2: z.string().trim().optional().default(""),
  city: z.string().trim().min(1, "City is required."),
  state: z.string().trim().optional().default(""),
  postalCode: z.string().trim().min(1, "Postal code is required."),
  country: z.string().trim().min(1, "Country is required."),
  paymentMethod: z.enum(["cod", "card"]),
})

export const orderCreateSchema = z.object({
  items: z.array(cartItemSchema).min(1, "At least one order item is required.").max(100, "Too many order items."),
  shippingAddress: shippingAddressSchema,
})

export const reorderSchema = z.object({
  orderId: orderIdSchema,
})

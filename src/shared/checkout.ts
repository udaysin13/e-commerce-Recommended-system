import { z } from "zod"

export const checkoutPaymentMethodValues = ["COD", "ONLINE"] as const

export const checkoutOrderSchema = z.object({
  productId: z.string().uuid("Invalid product."),
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(100, "Name is too long."),
  address: z.string().trim().min(10, "Address must be at least 10 characters.").max(250, "Address is too long."),
  city: z.string().trim().min(2, "City must be at least 2 characters.").max(100, "City is too long."),
  pincode: z.string().trim().regex(/^\d{6}$/, "Pincode must be exactly 6 digits."),
  paymentMethod: z.enum(checkoutPaymentMethodValues, {
    message: "Please select a valid payment method.",
  }),
})

export type CheckoutOrderInput = z.infer<typeof checkoutOrderSchema>
export type CheckoutPaymentMethod = (typeof checkoutPaymentMethodValues)[number]

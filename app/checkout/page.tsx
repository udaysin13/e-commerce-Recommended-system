import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { z } from "zod"
import { CheckoutForm } from "@/src/components/checkout/checkout-form"
import { StorefrontFooter } from "@/src/components/storefront/storefront-footer"
import { StorefrontSubnav } from "@/src/components/storefront/storefront-subnav"
import { getSessionCookieName, getSessionUserFromToken } from "@/src/server/auth/user-auth"
import { getProductById } from "@/src/server/services/data-source"

const checkoutSearchParamsSchema = z.object({
  productId: z.string().uuid("Invalid product."),
})

type CheckoutPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get(getSessionCookieName())?.value
  const currentUser = await getSessionUserFromToken(sessionToken)
  if (!currentUser) {
    redirect("/")
  }

  const resolvedSearchParams = await searchParams
  const parsedSearchParams = checkoutSearchParamsSchema.safeParse({
    productId: typeof resolvedSearchParams.productId === "string" ? resolvedSearchParams.productId : undefined,
  })

  if (!parsedSearchParams.success) {
    redirect("/")
  }

  const product = await getProductById(parsedSearchParams.data.productId)
  if (!product) {
    redirect("/")
  }

  return (
    <div className="min-h-screen">
      <StorefrontSubnav
        title="Secure checkout"
        subtitle="Complete your order with a distraction-free flow, trust signals, and a clear summary at every step."
      />
      <main className="page-shell py-8">
        <CheckoutForm product={product} />
      </main>
      <StorefrontFooter />
    </div>
  )
}

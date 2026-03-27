import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { z } from "zod"
import { CheckoutForm } from "@/src/components/checkout/checkout-form"
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
    <main className="min-h-screen bg-[linear-gradient(180deg,#f5f8fd_0%,#eef3f9_100%)] px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <CheckoutForm product={product} />
      </div>
    </main>
  )
}

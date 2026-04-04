import Link from "next/link"
import { notFound } from "next/navigation"
import { CreditCard, ShieldCheck, ShoppingCart, Star, Truck } from "lucide-react"
import { ProductImage } from "@/src/components/products/product-image"
import { StorefrontFooter } from "@/src/components/storefront/storefront-footer"
import { ProductViewTracker } from "@/src/components/storefront/product-view-tracker"
import { StorefrontSubnav } from "@/src/components/storefront/storefront-subnav"
import { getProductById } from "@/src/server/services/data-source"
import { getPrimaryProductImage, getResolvedProductImages } from "@/src/shared/product-images"

type ProductDetailPageProps = {
  params: Promise<{ id: string }>
}

const reviewQuotes = [
  "Looks polished, ships fast, and feels much more premium than the price suggests.",
  "A strong everyday purchase with clear value, solid finish, and reliable delivery updates.",
  "The redesigned detail flow makes comparison and checkout feel much more trustworthy.",
]

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params
  const product = await getProductById(id)
  if (!product) notFound()

  const primaryImage = getPrimaryProductImage(product)
  const galleryImages = getResolvedProductImages(product)
  const rating = product.ratingAvg ?? 4.7
  const ratingCount = product.ratingCount ?? 412
  const originalPrice = Math.round(product.price * 1.18)

  return (
    <div className="min-h-screen">
      <ProductViewTracker productId={product.id} />
      <StorefrontSubnav
        title={product.name}
        subtitle="Detailed product information, gallery-first browsing, stronger trust blocks, and cleaner checkout handoff."
      />

      <main className="page-shell py-8">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="space-y-4">
            <div className="surface-panel overflow-hidden rounded-[2rem] p-4">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.16),transparent_55%),linear-gradient(180deg,rgba(15,23,42,0.98),rgba(2,6,23,0.95))]">
                <ProductImage
                  src={primaryImage}
                  alt={product.name}
                  fill
                  unoptimized={primaryImage.startsWith("data:image/")}
                  className="p-6"
                  sizes="(max-width: 1024px) 100vw, 55vw"
                />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {galleryImages.slice(0, 4).map((image, index) => (
                  <div key={`${product.id}-thumb-${index}`} className="relative aspect-[4/5] overflow-hidden rounded-[1rem] bg-[linear-gradient(180deg,rgba(15,23,42,0.98),rgba(2,6,23,0.95))]">
                    <ProductImage
                      src={image}
                      alt={`${product.name} preview ${index + 1}`}
                      fill
                      unoptimized={image.startsWith("data:image/")}
                      className="p-3"
                      sizes="25vw"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {[
                { title: "Fast shipping", copy: "Priority dispatch on best-performing products.", icon: Truck },
                { title: "Secure payment", copy: "Protected checkout across COD and online flows.", icon: CreditCard },
                { title: "Purchase protection", copy: "Clear returns, refunds, and order support.", icon: ShieldCheck },
              ].map((item) => (
                <div key={item.title} className="surface-panel rounded-[1.5rem] p-5">
                  <item.icon className="h-10 w-10 rounded-2xl bg-blue-500/15 p-2 text-blue-300" />
                  <h2 className="mt-4 text-lg font-bold text-white">{item.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{item.copy}</p>
                </div>
              ))}
            </div>
          </section>

          <aside className="space-y-5">
            <div className="surface-panel rounded-[2rem] p-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="market-chip">{product.category}</span>
                <span className="market-chip border-orange-400/20 bg-orange-500/10 text-orange-100">Best value</span>
              </div>

              <h1 className="mt-4 text-4xl font-black tracking-tight text-white">{product.name}</h1>
              <p className="mt-2 text-base text-slate-300">{product.kind}</p>

              <div className="mt-5 flex items-center gap-3">
                <div className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  {rating.toFixed(1)}
                </div>
                <span className="text-sm text-slate-400">{ratingCount} ratings</span>
              </div>

              <div className="mt-6 rounded-[1.4rem] bg-white/[0.04] p-5">
                <div className="flex items-end gap-3">
                  <p className="text-4xl font-black text-white">Rs. {product.price.toLocaleString("en-IN")}</p>
                  <p className="pb-1 text-lg text-slate-500 line-through">Rs. {originalPrice.toLocaleString("en-IN")}</p>
                </div>
                <p className="mt-2 text-sm font-semibold text-emerald-300">Inclusive of current marketplace discount</p>
              </div>

              <p className="mt-6 text-sm leading-7 text-slate-300">
                {product.description ??
                  "A polished product detail flow with stronger trust markers, more readable content density, and better visual guidance toward checkout."}
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={`/checkout?productId=${encodeURIComponent(product.id)}`}
                  className="market-button-primary flex-1"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Buy now
                </Link>
                <Link href="/cart" className="market-button-secondary flex-1">
                  Add via cart
                </Link>
              </div>
            </div>

            <div className="surface-panel rounded-[2rem] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-300">Customer feedback</p>
              <div className="mt-4 space-y-3">
                {reviewQuotes.map((quote) => (
                  <div key={quote} className="rounded-[1.2rem] border border-white/10 bg-white/[0.04] p-4">
                    <div className="flex items-center gap-1 text-amber-400">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star key={index} className="h-3.5 w-3.5 fill-current" />
                      ))}
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-300">{quote}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>

      <StorefrontFooter />
    </div>
  )
}

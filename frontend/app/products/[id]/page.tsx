import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductPageTracker } from "@/components/ProductPageTracker";
import { ProductStatsPanel } from "@/components/ProductStatsPanel";
import { RecommendationSection } from "@/components/RecommendationSection";
import { formatCurrency, formatRating } from "@/lib/format";
import { getProductById, getProducts } from "@/lib/api";
import {
  getProductRecommendations,
  recommendedProductsToProducts,
} from "@/lib/recommendationsApi";
import { BuyNowButton } from "@/components/BuyNowButton";
import { AddToCartButton } from "@/components/AddToCartButton";

type ProductDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  const recommendations = await getProducts({
    category: product.category.slug,
    limit: 3,
    sortBy: "rating",
    sortOrder: "desc",
  });
  const productRecommendations = await getProductRecommendations(product.id, 3);
  const recommendedProducts = recommendedProductsToProducts(productRecommendations);

  return (
    <>
      <ProductPageTracker productId={product.id} />
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="overflow-hidden rounded border border-line bg-white">
          <img
            src={product.imageUrl ?? "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80"}
            alt={product.name}
            className="aspect-[4/3] h-full w-full object-cover"
          />
        </div>

        <div className="flex flex-col justify-center">
          <Link href="/products" className="mb-5 text-sm font-bold text-teal hover:text-ink">
            Back to products
          </Link>
          <p className="text-sm font-semibold uppercase text-coral">{product.category.name}</p>
          <h1 className="mt-3 text-4xl font-bold leading-tight text-ink">{product.name}</h1>
          <div className="mt-5">
            <ProductStatsPanel product={product} emphasized />
          </div>
          <p className="mt-4 text-base leading-7 text-ink/68">{product.description}</p>

          <div className="mt-6 grid gap-3 border-y border-line py-5 sm:grid-cols-3">
            <div>
              <p className="text-xs font-semibold uppercase text-ink/50">Price</p>
              <p className="mt-1 text-xl font-bold text-ink">
                {formatCurrency(product.price, product.currency)}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-ink/50">Rating</p>
              <p className="mt-1 text-xl font-bold text-ink">{formatRating(product.averageRating)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-ink/50">Stock</p>
              <p className="mt-1 text-xl font-bold text-ink">{product.stockQuantity}</p>
            </div>
          </div>

          <div className="mt-6 flex gap-3 sm:flex-row">
            <BuyNowButton productId={product.id} quantity={1} />
            <AddToCartButton productId={product.id} quantity={1} />
          </div>
        </div>
      </section>

      <RecommendationSection
        title="More from this category"
        products={
          recommendedProducts.length > 0
            ? recommendedProducts
            : recommendations.items.filter((item) => item.id !== product.id)
        }
      />
    </>
  );
}

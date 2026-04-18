import Link from "next/link";
import { Reveal } from "@/components/Motion";
import { HeroSection } from "@/components/HeroSection";
import { ProductGrid } from "@/components/ProductGrid";
import { RecommendationSection } from "@/components/RecommendationSection";
import { getProducts } from "@/lib/api";
import {
  getHomeRecommendations,
  recommendedProductsToProducts,
} from "@/lib/recommendationsApi";

export default async function HomePage() {
  const [featuredProducts, trendingProducts, homeRecommendations] = await Promise.all([
    getProducts({ limit: 6, sortBy: "rating", sortOrder: "desc" }),
    getProducts({ limit: 3, sortBy: "newest", sortOrder: "desc" }),
    getHomeRecommendations("demo-user", 3),
  ]);
  const recommendedProducts = recommendedProductsToProducts(homeRecommendations);

  return (
    <>
      <HeroSection />

      <Reveal className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <Reveal delay={0.05}>
            <p className="text-sm font-semibold uppercase text-teal">Featured products</p>
            <h2 className="mt-2 text-2xl font-bold text-ink">Top picks from the catalog</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/65">
              High-rated products across electronics, fashion, footwear, home and kitchen, beauty, sports and fitness, books, and accessories.
            </p>
          </Reveal>
          <Reveal delay={0.12}>
            <Link href="/products" className="text-sm font-bold text-teal hover:text-ink">
              Browse all products
            </Link>
          </Reveal>
        </div>
        <ProductGrid
          products={featuredProducts.items}
          animationKey={`featured-${featuredProducts.items.map((product) => product.id).join("|")}`}
        />
      </Reveal>

      <RecommendationSection
        eyebrow="Trending"
        title="Popular with shoppers now"
        products={trendingProducts.items}
      />

      <RecommendationSection
        eyebrow="Recommended"
        title="Picked for the demo shopper"
        products={
          recommendedProducts.length > 0
            ? recommendedProducts
            : featuredProducts.items.slice().reverse()
        }
      />
    </>
  );
}

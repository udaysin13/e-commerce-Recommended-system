import Link from "next/link";
import { Reveal } from "@/components/Motion";
import { HeroSection } from "@/components/HeroSection";
import { ProductGrid } from "@/components/ProductGrid";
import { RecommendationLab } from "@/components/RecommendationLab";
import { RecommendationSection } from "@/components/RecommendationSection";
import { SeasonalSpotlightSection } from "@/components/SeasonalSpotlightSection";
import { getProducts } from "@/lib/api";
import { getSeasonalRecommendations } from "@/lib/recommendationsApi";

export default async function HomePage() {
  const [featuredProducts, trendingProducts, seasonal] = await Promise.all([
    getProducts({ limit: 6, sortBy: "rating", sortOrder: "desc" }),
    getProducts({ limit: 3, sortBy: "newest", sortOrder: "desc" }),
    getSeasonalRecommendations(),
  ]);

  return (
    <>
      <HeroSection />

      {seasonal ? (
        <Reveal className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
          <div className="rounded border border-line bg-white px-5 py-4 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase text-teal">
                  Seasonal Context
                </p>
                <p className="mt-1 text-sm text-ink/65">
                  Current season: <span className="font-bold text-ink">{seasonal.currentSeason}</span>
                  {seasonal.activeFestival
                    ? ` • ${seasonal.activeFestival.name} in ${seasonal.activeFestival.countdownDays} day${seasonal.activeFestival.countdownDays === 1 ? "" : "s"}`
                    : ""}
                </p>
              </div>
              {seasonal.activeFestival ? (
                <div className="rounded bg-mist px-4 py-3 text-sm">
                  <p className="font-bold text-ink">
                    {seasonal.activeFestival.icon} {seasonal.activeFestival.name}
                  </p>
                  <p className="mt-1 text-ink/60">{seasonal.activeFestival.tagline}</p>
                </div>
              ) : null}
            </div>
          </div>
        </Reveal>
      ) : null}

      {seasonal?.sections.map((section) => (
        <SeasonalSpotlightSection
          key={section.id}
          section={section}
          activeFestival={seasonal.activeFestival}
        />
      ))}

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

      <RecommendationLab
        kind="home"
        eyebrow="Recommendation Studio"
        title="Explainable recommendations tuned to the shopper"
        description="Switch between Personalized and Explore modes, then reshape the ranking with value, premium, trending, or new-arrival moods. Each card carries a short reason so the model feels understandable instead of mysterious."
      />
    </>
  );
}

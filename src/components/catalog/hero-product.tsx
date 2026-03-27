import Image from "next/image"
import { Star, Heart, ArrowRight } from "lucide-react"

const generateHeroImage = () => {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='800' viewBox='0 0 800 800'>
    <defs>
      <linearGradient id='heroGrad' x1='0%' y1='0%' x2='100%' y2='100%'>
        <stop offset='0%' style='stop-color:hsl(140, 75%, 60%);stop-opacity:1' />
        <stop offset='100%' style='stop-color:hsl(100, 80%, 50%);stop-opacity:0.9' />
      </linearGradient>
    </defs>
    <rect width='800' height='800' fill='url(#heroGrad)'/>
    <circle cx='150' cy='150' r='120' fill='rgba(255,255,255,0.2)'/>
    <circle cx='700' cy='150' r='100' fill='rgba(255,255,255,0.15)'/>
    <circle cx='750' cy='700' r='140' fill='rgba(255,255,255,0.18)'/>
    <g transform='translate(200, 250)'>
      <rect x='0' y='0' width='400' height='300' rx='30' fill='rgba(255,255,255,0.9)' stroke='rgba(255,255,255,0.5)' stroke-width='2'/>
      <circle cx='200' cy='100' r='80' fill='hsl(140, 75%, 55%)' opacity='0.8'/>
      <path d='M 150 140 Q 200 180 250 140' fill='none' stroke='rgba(255,255,255,0.8)' stroke-width='3' stroke-linecap='round'/>
      <rect x='170' y='200' width='60' height='80' rx='5' fill='hsl(100, 80%, 45%)' opacity='0.9'/>
      <text x='200' y='320' font-size='18' font-family='Arial' font-weight='bold' text-anchor='middle' fill='hsl(140, 75%, 50%)'>Premium Planter</text>
    </g>
    <text x='400' y='650' font-size='48' font-family='Arial' font-weight='bold' text-anchor='middle' fill='rgba(255,255,255,0.95)'>Green Living Starts Here</text>
  </svg>`

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

export function HeroProduct() {
  return (
    <section className="overflow-hidden rounded-2xl border border-border/60 bg-card">
      <div className="grid items-center gap-0 md:grid-cols-2">
        {/* Image */}
        <div className="relative aspect-square bg-secondary/40 md:aspect-auto md:h-full">
          <Image
            src={generateHeroImage()}
            alt="Premium Ceramic Plant Planter - Terra Green Elite"
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            unoptimized
          />
          <div className="absolute top-5 left-5">
            <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
              Bestseller
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-col justify-center p-8 md:p-12 lg:p-16">
          <div className="flex items-center gap-2 pb-4">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i < 5 ? "fill-foreground text-foreground" : "fill-muted text-muted"}`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">4.9 (3,421 reviews)</span>
          </div>

          <p className="pb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Featured Collection
          </p>
          <h1 className="pb-4 text-3xl font-bold tracking-tight text-foreground text-balance lg:text-4xl">
            Terra Green Elite Ceramic Planter
          </h1>
          <p className="pb-8 text-base leading-relaxed text-muted-foreground text-pretty">
            Premium ceramic construction with superior drainage system, weather-resistant design, and eco-friendly materials. Perfect for indoor plants, succulents, and herbs. Add natural beauty to any space.
          </p>

          <div className="flex items-baseline gap-3 pb-8">
            <span className="text-4xl font-bold tracking-tight text-foreground">$45</span>
            <span className="text-lg text-muted-foreground line-through">$65</span>
            <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-foreground">
              Save 31%
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98]">
              Add to Bag
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-border text-muted-foreground transition-all hover:border-foreground/20 hover:text-foreground"
              aria-label="Add to wishlist"
            >
              <Heart className="h-[18px] w-[18px]" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-8">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              In Stock
            </span>
            <span className="text-xs text-muted-foreground">Free Shipping</span>
            <span className="text-xs text-muted-foreground">60-Day Returns</span>
          </div>
        </div>
      </div>
    </section>
  )
}

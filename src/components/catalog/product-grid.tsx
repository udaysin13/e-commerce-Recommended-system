"use client"

import Image from "next/image"
import { Heart, Star } from "lucide-react"
import { useState } from "react"

interface Product {
  id: number
  name: string
  price: number
  originalPrice?: number
  image: string
  rating: number
  reviews: number
  badge?: string
}

function ProductCard({ product }: { product: Product }) {
  const [liked, setLiked] = useState(false)

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/[0.04]">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-secondary/40">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        <button
          onClick={() => setLiked(!liked)}
          className={`absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full transition-all ${
            liked
              ? "bg-primary text-primary-foreground"
              : "bg-background/80 text-muted-foreground backdrop-blur-sm hover:text-foreground"
          }`}
          aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={`h-3.5 w-3.5 ${liked ? "fill-current" : ""}`} />
        </button>
        {product.badge && (
          <span className="absolute top-3 left-3 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
            {product.badge}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-1 pb-2">
          <Star className="h-3 w-3 fill-foreground text-foreground" />
          <span className="text-xs font-medium text-foreground">{product.rating}</span>
          <span className="text-xs text-muted-foreground">({product.reviews})</span>
        </div>
        <h3 className="pb-3 text-sm font-semibold leading-snug text-foreground text-pretty">
          {product.name}
        </h3>
        <div className="mt-auto flex items-baseline gap-2">
          <span className="text-lg font-bold tracking-tight text-foreground">
            ${product.price}
          </span>
          {product.originalPrice && (
            <span className="text-xs text-muted-foreground line-through">
              ${product.originalPrice}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

const generatePlaceholderImage = (productId: number, category: string, productName: string) => {
  const colors = [
    { bg: "hsl(220, 90%, 75%)", accent: "hsl(220, 95%, 60%)" },
    { bg: "hsl(280, 85%, 75%)", accent: "hsl(280, 95%, 60%)" },
    { bg: "hsl(340, 80%, 75%)", accent: "hsl(340, 95%, 60%)" },
    { bg: "hsl(30, 95%, 75%)", accent: "hsl(30, 100%, 55%)" },
    { bg: "hsl(140, 75%, 75%)", accent: "hsl(140, 85%, 50%)" },
    { bg: "hsl(45, 95%, 75%)", accent: "hsl(45, 100%, 55%)" },
  ]
  const color = colors[productId % colors.length]

  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'>
    <defs>
      <linearGradient id='grad${productId}' x1='0%' y1='0%' x2='100%' y2='100%'>
        <stop offset='0%' style='stop-color:${color.bg};stop-opacity:1' />
        <stop offset='100%' style='stop-color:${color.accent};stop-opacity:0.8' />
      </linearGradient>
    </defs>
    <rect width='400' height='400' fill='url(#grad${productId})'/>
    <circle cx='100' cy='100' r='80' fill='rgba(255,255,255,0.3)'/>
    <circle cx='320' cy='80' r='60' fill='rgba(255,255,255,0.2)'/>
    <circle cx='350' cy='320' r='90' fill='rgba(255,255,255,0.25)'/>
    <rect x='50' y='150' width='300' height='100' rx='15' fill='rgba(255,255,255,0.4)'/>
    <text x='200' y='200' font-size='24' font-family='Arial, sans-serif' font-weight='bold' text-anchor='middle' fill='#1a1a2e'>${category}</text>
    <text x='200' y='240' font-size='14' font-family='Arial, sans-serif' text-anchor='middle' fill='#16213e'>${productName.substring(0, 20)}</text>
    <text x='200' y='340' font-size='12' font-family='Arial, sans-serif' text-anchor='middle' fill='#0f3460'>ID: ${productId}</text>
  </svg>`

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

const products: Product[] = [
  {
    id: 1,
    name: "Building Blocks Deluxe Set",
    price: 29,
    originalPrice: 45,
    image: generatePlaceholderImage(1, "Toys", "Building Blocks"),
    rating: 4.8,
    reviews: 1249,
    badge: "Best Seller",
  },
  {
    id: 2,
    name: "Silicone Phone Cover Pro",
    price: 15,
    image: generatePlaceholderImage(2, "Phone Covers", "Silicone Cover"),
    rating: 4.6,
    reviews: 876,
  },
  {
    id: 3,
    name: "Mountain Cycle - Alloy Frame",
    price: 249,
    originalPrice: 349,
    image: generatePlaceholderImage(3, "Cycles", "Mountain Cycle"),
    rating: 4.7,
    reviews: 634,
    badge: "New",
  },
  {
    id: 4,
    name: "Cotton T-Shirt Classic",
    price: 19,
    image: generatePlaceholderImage(4, "Clothes", "Cotton T-Shirt"),
    rating: 4.5,
    reviews: 412,
  },
  {
    id: 5,
    name: "Ceramic Terrace Planter",
    price: 34,
    originalPrice: 49,
    image: generatePlaceholderImage(5, "Plant Buckets", "Terrace Planter"),
    rating: 4.4,
    reviews: 958,
  },
  {
    id: 6,
    name: "Premium Chef Knife Set",
    price: 79,
    image: generatePlaceholderImage(6, "Kitchen Tools", "Chef Knife"),
    rating: 4.9,
    reviews: 2103,
    badge: "Top Rated",
  },
  {
    id: 7,
    name: "MagSafe Phone Cover Ultra",
    price: 25,
    originalPrice: 35,
    image: generatePlaceholderImage(7, "Phone Covers", "MagSafe Cover"),
    rating: 4.3,
    reviews: 547,
  },
  {
    id: 8,
    name: "Denim Jacket Premium",
    price: 89,
    image: generatePlaceholderImage(8, "Clothes", "Denim Jacket"),
    rating: 4.6,
    reviews: 389,
  },
]

export function ProductGrid() {
  return (
    <section>
      <div className="flex items-baseline justify-between pb-8">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Customers Also Viewed
          </h2>
          <p className="pt-1 text-sm text-muted-foreground">
            Based on your browsing history and preferences
          </p>
        </div>
        <button className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block">
          View all
        </button>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}

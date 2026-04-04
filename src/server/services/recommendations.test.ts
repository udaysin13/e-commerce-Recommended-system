import assert from "node:assert/strict"
import type { CatalogProduct } from "../../shared/catalog-types"
import type { RecommendationContext } from "../../shared/recommendation-schema"
import { buildRecommendationPage } from "./recommendations"

const sampleProducts: CatalogProduct[] = [
  {
    id: "1",
    category: "Shoes",
    kind: "Running Sneakers",
    name: "Sprint One",
    imageUrl: "/placeholder.jpg",
    images: ["/placeholder.jpg"],
    price: 2100,
    ratingAvg: 4.7,
    ratingCount: 240,
  },
  {
    id: "2",
    category: "Shoes",
    kind: "Trail Sneakers",
    name: "Trail Motion",
    imageUrl: "/placeholder.jpg",
    images: ["/placeholder.jpg"],
    price: 2400,
    ratingAvg: 4.6,
    ratingCount: 180,
  },
  {
    id: "3",
    category: "Audio",
    kind: "Wireless Earbuds",
    name: "Quiet Beat",
    imageUrl: "/placeholder.jpg",
    images: ["/placeholder.jpg"],
    price: 3200,
    ratingAvg: 4.8,
    ratingCount: 420,
  },
  {
    id: "4",
    category: "Audio",
    kind: "Bluetooth Speaker",
    name: "Room Pulse",
    imageUrl: "/placeholder.jpg",
    images: ["/placeholder.jpg"],
    price: 2900,
    ratingAvg: 4.5,
    ratingCount: 120,
  },
  {
    id: "5",
    category: "Computers",
    kind: "Laptop Stand",
    name: "Desk Rise",
    imageUrl: "/placeholder.jpg",
    images: ["/placeholder.jpg"],
    price: 1800,
    ratingAvg: 4.4,
    ratingCount: 98,
  },
]

const coldStartContext: RecommendationContext = {
  query: "",
  selectedCategory: "All",
  sort: "Newest",
  recentSearches: [],
  viewedIds: [],
  wishlistIds: [],
  cartIds: [],
}

function runTests() {
  const coldStartPage = buildRecommendationPage(sampleProducts, coldStartContext)
  assert.equal(coldStartPage.firstTimeUser, true)
  assert.ok(coldStartPage.sections.length >= 5)
  assert.ok(coldStartPage.sections[0].items.length > 0)
  assert.match(coldStartPage.sections[0].items[0].reason.label, /Popular|Because/)

  const personalized = buildRecommendationPage(sampleProducts, {
    ...coldStartContext,
    query: "sneakers",
    recentSearches: ["sneakers"],
    viewedIds: ["1"],
  })
  assert.equal(personalized.firstTimeUser, false)
  assert.match(personalized.sections[0].items[0].reason.label, /searched "sneakers"|viewed/i)
  assert.ok(
    personalized.sections.some((section) =>
      section.items.some((item) => item.reason.type === "viewed_product" || item.reason.type === "recent_search"),
    ),
  )

  const deduped = buildRecommendationPage(sampleProducts, {
    ...coldStartContext,
    recentSearches: ["audio"],
    viewedIds: ["3"],
    wishlistIds: ["4"],
  })
  const ids = deduped.sections.flatMap((section) => section.items.map((item) => item.id))
  assert.equal(new Set(ids).size, ids.length)

  console.log("recommendations.test.ts: all assertions passed")
}

runTests()

import type { CatalogProduct } from "@/src/shared/catalog-types"

export const DEFAULT_PRODUCT_IMAGE = "/placeholder.jpg"

const PRODUCT_FAMILY_IMAGE_MAP: Record<string, string> = {
  "Aero Works": "/images/hero-product.jpg",
  "Velvet Deck": "/images/product-1.jpg",
  "Nova Point": "/images/product-2.jpg",
  "Orbit Vault": "/images/product-3.jpg",
  "Lush Studio": "/images/product-4.jpg",
  "Metro Nest": "/images/product-5.jpg",
  "Crest Mode": "/images/product-6.jpg",
  "Echo Lane": "/images/product-7.jpg",
  "Prime Craft": "/images/product-8.jpg",
}

const PLACEHOLDER_PALETTES = [
  ["#1d4ed8", "#3b82f6", "#dbeafe"],
  ["#ff6b00", "#fb923c", "#ffedd5"],
  ["#0f766e", "#14b8a6", "#ccfbf1"],
  ["#7c3aed", "#a855f7", "#f3e8ff"],
  ["#be123c", "#f43f5e", "#ffe4e6"],
  ["#2563eb", "#38bdf8", "#e0f2fe"],
]

function encodeSvg(svg: string) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

function normalizeText(value?: string | null) {
  return value?.trim() ?? ""
}

function getProductFamilyName(name?: string | null) {
  const trimmed = normalizeText(name)
  if (!trimmed) return ""
  return trimmed.replace(/\s+\d+$/, "")
}

function normalizeProductKey(product: Partial<Pick<CatalogProduct, "id" | "name" | "kind" | "category">>) {
  return [product.id, product.name, product.kind, product.category].filter(Boolean).join("|")
}

function getProductSeed(product: Partial<Pick<CatalogProduct, "id" | "name" | "kind" | "category">>) {
  return normalizeProductKey(product).split("").reduce((total, char) => total + char.charCodeAt(0), 0)
}

function getGeneratedProductPlaceholder(
  product: Partial<Pick<CatalogProduct, "id" | "name" | "kind" | "category">>,
) {
  const seed = getProductSeed(product)
  const [primary, secondary, tint] = PLACEHOLDER_PALETTES[seed % PLACEHOLDER_PALETTES.length]
  const category = normalizeText(product.category) || "Marketplace"
  const kind = normalizeText(product.kind) || "Featured item"
  const name = normalizeText(product.name) || "FluxCart item"
  const badge = `${8 + (seed % 17)}% OFF`
  const shortName = name.length > 22 ? `${name.slice(0, 22)}…` : name

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900" fill="none">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${primary}" />
          <stop offset="100%" stop-color="#0B0F19" />
        </linearGradient>
        <linearGradient id="card" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#FFFFFF" />
          <stop offset="100%" stop-color="${tint}" />
        </linearGradient>
      </defs>
      <rect width="1200" height="900" rx="54" fill="url(#bg)" />
      <circle cx="1010" cy="170" r="160" fill="${secondary}" fill-opacity="0.18" />
      <circle cx="170" cy="760" r="180" fill="${secondary}" fill-opacity="0.16" />
      <rect x="90" y="88" width="1020" height="724" rx="42" fill="#0F172A" fill-opacity="0.18" stroke="rgba(255,255,255,0.12)" />
      <rect x="150" y="166" width="900" height="500" rx="36" fill="url(#card)" />
      <rect x="206" y="222" width="168" height="46" rx="23" fill="${secondary}" />
      <text x="290" y="252" text-anchor="middle" font-size="24" font-family="Arial, sans-serif" font-weight="700" fill="#FFFFFF">${badge}</text>
      <text x="206" y="356" font-size="34" font-family="Arial, sans-serif" font-weight="700" fill="#334155">${category}</text>
      <text x="206" y="450" font-size="72" font-family="Arial, sans-serif" font-weight="800" fill="#0F172A">${shortName}</text>
      <text x="206" y="520" font-size="34" font-family="Arial, sans-serif" font-weight="500" fill="#475569">${kind}</text>
      <rect x="206" y="572" width="280" height="18" rx="9" fill="${secondary}" fill-opacity="0.22" />
      <rect x="206" y="612" width="220" height="18" rx="9" fill="${secondary}" fill-opacity="0.16" />
      <rect x="720" y="262" width="228" height="228" rx="46" fill="${secondary}" fill-opacity="0.15" />
      <path d="M788 340h93c34 0 62 28 62 62v24c0 34-28 62-62 62h-93c-34 0-62-28-62-62v-24c0-34 28-62 62-62Z" fill="${secondary}" fill-opacity="0.72" />
      <circle cx="834" cy="414" r="58" fill="#FFFFFF" fill-opacity="0.65" />
      <path d="M780 722h278" stroke="rgba(255,255,255,0.45)" stroke-width="8" stroke-linecap="round" />
      <path d="M190 722h164" stroke="rgba(255,255,255,0.25)" stroke-width="8" stroke-linecap="round" />
    </svg>
  `

  return encodeSvg(svg)
}

function isSupportedImage(value: string) {
  return value.startsWith("/") || value.startsWith("data:image/") || value.startsWith("https://") || value.startsWith("http://")
}

export function normalizeImageUrl(value?: string | null) {
  const trimmed = normalizeText(value)
  if (!trimmed) return DEFAULT_PRODUCT_IMAGE
  if (isSupportedImage(trimmed)) return trimmed
  return DEFAULT_PRODUCT_IMAGE
}

export function normalizeProductImages(images?: string[] | null) {
  if (!Array.isArray(images)) return []
  return images
    .map((image) => normalizeImageUrl(image))
    .filter((image, index, array) => image && array.indexOf(image) === index)
}

function isLocalProductAsset(image: string) {
  return image.startsWith("/images/") || image.startsWith("/uploads/products/")
}

function getFallbackProductImage(
  product: Partial<Pick<CatalogProduct, "id" | "name" | "kind" | "category" | "slug">>,
) {
  const familyName = getProductFamilyName(product.name)
  const local = PRODUCT_FAMILY_IMAGE_MAP[familyName]
  if (local) return local
  return getGeneratedProductPlaceholder(product)
}

export function getResolvedProductImages(
  product: Partial<Pick<CatalogProduct, "id" | "name" | "kind" | "category" | "slug" | "imageUrl" | "images">>,
) {
  const normalizedImageUrl = normalizeImageUrl(product.imageUrl)
  const gallery = normalizeProductImages(product.images)
  const resolvedGallery = [normalizedImageUrl, ...gallery]
    .filter((image) => image && image !== DEFAULT_PRODUCT_IMAGE)
    .filter((image, index, array) => array.indexOf(image) === index)

  if (resolvedGallery.length > 0) {
    return resolvedGallery
  }

  return [getFallbackProductImage(product)]
}

export function getPrimaryProductImage(
  product: Partial<Pick<CatalogProduct, "id" | "name" | "kind" | "category" | "slug" | "imageUrl" | "images">>,
) {
  return getResolvedProductImages(product)[0] ?? DEFAULT_PRODUCT_IMAGE
}

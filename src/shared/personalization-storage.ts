const CART_KEY = "fluxcart-demo-cart"
const WISHLIST_KEY = "fluxcart-demo-wishlist"
const RECENT_SEARCHES_KEY = "fluxcart-recent-searches"
const RECENT_VIEWS_KEY = "fluxcart-recent-views"

function isBrowser() {
  return typeof window !== "undefined"
}

function readJsonArray<T>(key: string): T[] {
  if (!isBrowser()) return []
  const raw = window.localStorage.getItem(key)
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as T[]) : []
  } catch {
    return []
  }
}

function writeJsonArray<T>(key: string, value: T[]) {
  if (!isBrowser()) return
  window.localStorage.setItem(key, JSON.stringify(value))
}

export function getStoredCartItems<T>() {
  return readJsonArray<T>(CART_KEY)
}

export function setStoredCartItems<T>(items: T[]) {
  writeJsonArray(CART_KEY, items)
}

export function getStoredWishlistIds() {
  return readJsonArray<string>(WISHLIST_KEY)
}

export function setStoredWishlistIds(items: string[]) {
  writeJsonArray(WISHLIST_KEY, items)
}

export function getStoredRecentSearches() {
  return readJsonArray<string>(RECENT_SEARCHES_KEY)
}

export function setStoredRecentSearches(items: string[]) {
  writeJsonArray(RECENT_SEARCHES_KEY, items.slice(0, 8))
}

export function pushRecentSearch(search: string) {
  const value = search.trim()
  if (!value) return
  const next = [value, ...getStoredRecentSearches().filter((item) => item.toLowerCase() !== value.toLowerCase())].slice(0, 8)
  setStoredRecentSearches(next)
}

export function getStoredRecentViews() {
  return readJsonArray<string>(RECENT_VIEWS_KEY)
}

export function setStoredRecentViews(items: string[]) {
  writeJsonArray(RECENT_VIEWS_KEY, items.slice(0, 12))
}

export function pushRecentView(productId: string) {
  const value = productId.trim()
  if (!value) return
  const next = [value, ...getStoredRecentViews().filter((item) => item !== value)].slice(0, 12)
  setStoredRecentViews(next)
}

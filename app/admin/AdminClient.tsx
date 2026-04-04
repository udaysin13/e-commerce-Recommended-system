"use client"

import Image from "next/image"
import { FormEvent, useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react"
import { Box, ImagePlus, LoaderCircle, PackageSearch, Search, UploadCloud } from "lucide-react"
import type { CatalogProduct } from "@/src/shared/catalog-types"
import { DEFAULT_PRODUCT_IMAGE, getPrimaryProductImage } from "@/src/shared/product-images"

type ProductsApiResponse = {
  items: CatalogProduct[]
  categories: string[]
}

type ProductFormState = {
  category: string
  kind: string
  name: string
  imageUrl: string
  images: string[]
  price: string
  description: string
  inStock: string
}

type BulkSyncResult = {
  updatedCount: number
  updatedProducts: Array<{
    id: string
    slug?: string
    name: string
    imageUrl: string
  }>
  unmatchedFiles: Array<{
    filename: string
    slug: string
    imageUrl: string
  }>
  invalidFiles: Array<{
    filename: string
    error: string
  }>
}

const blankForm: ProductFormState = {
  category: "",
  kind: "",
  name: "",
  imageUrl: "",
  images: [],
  price: "",
  description: "",
  inStock: "0",
}

function formatSlugPreview(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, "-")
}

export default function AdminPage() {
  const [items, setItems] = useState<CatalogProduct[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [form, setForm] = useState<ProductFormState>(blankForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [statusText, setStatusText] = useState("")
  const [errorText, setErrorText] = useState("")
  const [localPreviewUrl, setLocalPreviewUrl] = useState("")
  const [isBulkSyncing, setIsBulkSyncing] = useState(false)
  const [bulkSyncResult, setBulkSyncResult] = useState<BulkSyncResult | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("All")
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const bulkFileInputRef = useRef<HTMLInputElement | null>(null)
  const deferredSearchTerm = useDeferredValue(searchTerm)

  const fetchProducts = useCallback(async () => {
    setIsLoading(true)
    setErrorText("")
    try {
      const response = await fetch("/api/products?sort=Newest")
      if (!response.ok) throw new Error("Failed to load")
      const payload = (await response.json()) as ProductsApiResponse
      setItems(payload.items)
      setCategories(payload.categories)
    } catch {
      setErrorText("Could not load products.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchProducts()
  }, [fetchProducts])

  useEffect(() => {
    return () => {
      if (localPreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(localPreviewUrl)
      }
    }
  }, [localPreviewUrl])

  const primaryPreviewImage = localPreviewUrl || form.imageUrl || DEFAULT_PRODUCT_IMAGE
  const filteredItems = useMemo(() => {
    const normalizedQuery = deferredSearchTerm.trim().toLowerCase()

    return items.filter((item) => {
      const matchesCategory = categoryFilter === "All" || item.category === categoryFilter
      const matchesQuery =
        normalizedQuery.length === 0 ||
        item.name.toLowerCase().includes(normalizedQuery) ||
        item.kind.toLowerCase().includes(normalizedQuery) ||
        item.category.toLowerCase().includes(normalizedQuery) ||
        item.id.toLowerCase().includes(normalizedQuery) ||
        item.slug?.toLowerCase().includes(normalizedQuery)

      return matchesCategory && matchesQuery
    })
  }, [categoryFilter, deferredSearchTerm, items])
  const topPreviewItems = useMemo(() => filteredItems.slice(0, 12), [filteredItems])
  const inventoryStats = useMemo(() => {
    const totalProducts = items.length
    const totalUnits = items.reduce((sum, item) => sum + (item.inStock ?? 0), 0)
    const lowStockCount = items.filter((item) => (item.inStock ?? 0) > 0 && (item.inStock ?? 0) <= 5).length
    const outOfStockCount = items.filter((item) => (item.inStock ?? 0) === 0).length

    return { totalProducts, totalUnits, lowStockCount, outOfStockCount }
  }, [items])

  const resetForm = () => {
    setForm(blankForm)
    setEditingId(null)
    setErrorText("")
    setStatusText("")
    setBulkSyncResult(null)
    if (localPreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(localPreviewUrl)
    }
    setLocalPreviewUrl("")
  }

  const startEdit = (item: CatalogProduct) => {
    if (localPreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(localPreviewUrl)
    }

    setEditingId(item.id)
    setLocalPreviewUrl("")
    setForm({
      category: item.category,
      kind: item.kind,
      name: item.name,
      imageUrl: item.imageUrl,
      images: item.images,
      price: String(item.price),
      description: item.description ?? "",
      inStock: String(item.inStock ?? 0),
    })
    setStatusText("")
    setErrorText("")
  }

  const handleFileUpload = async (file: File) => {
    setIsUploading(true)
    setErrorText("")
    setStatusText("")

    if (localPreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(localPreviewUrl)
    }
    setLocalPreviewUrl(URL.createObjectURL(file))

    try {
      const body = new FormData()
      body.append("file", file)

      const response = await fetch("/api/uploads", {
        method: "POST",
        body,
      })

      const payload = (await response.json()) as { error?: string; imageUrl?: string }
      if (!response.ok || !payload.imageUrl) {
        throw new Error(payload.error ?? "Upload failed.")
      }

      setForm((prev) => ({
        ...prev,
        imageUrl: payload.imageUrl ?? DEFAULT_PRODUCT_IMAGE,
        images: payload.imageUrl ? [payload.imageUrl] : [DEFAULT_PRODUCT_IMAGE],
      }))
      setStatusText("Image uploaded successfully.")
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : "Upload failed.")
      setForm((prev) => ({ ...prev, imageUrl: "", images: [] }))
    } finally {
      setIsUploading(false)
    }
  }

  const handleBulkImageSync = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    setIsBulkSyncing(true)
    setErrorText("")
    setStatusText("")
    setBulkSyncResult(null)

    try {
      const body = new FormData()
      Array.from(files).forEach((file) => {
        body.append("files", file)
      })

      const response = await fetch("/api/admin/product-images/sync", {
        method: "POST",
        body,
      })

      const payload = (await response.json()) as BulkSyncResult & { error?: string }
      if (!response.ok) {
        throw new Error(payload.error ?? "Bulk image sync failed.")
      }

      setBulkSyncResult(payload)
      setStatusText(
        payload.updatedCount > 0
          ? `Synced ${payload.updatedCount} product image${payload.updatedCount === 1 ? "" : "s"}.`
          : "No products were updated."
      )
      await fetchProducts()
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : "Bulk image sync failed.")
    } finally {
      setIsBulkSyncing(false)
    }
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSaving(true)
    setStatusText("")
    setErrorText("")

    try {
      const payload = {
        category: form.category.trim(),
        kind: form.kind.trim(),
        name: form.name.trim(),
        imageUrl: form.imageUrl.trim() || DEFAULT_PRODUCT_IMAGE,
        images: (form.images.length > 0 ? form.images : [form.imageUrl || DEFAULT_PRODUCT_IMAGE]).map((image) =>
          image.trim(),
        ),
        price: Number(form.price),
        description: form.description.trim(),
        inStock: Number(form.inStock),
      }

      const url = editingId ? `/api/products/${editingId}` : "/api/products"
      const method = editingId ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const body = (await response.json()) as { error?: string }
      if (!response.ok) {
        throw new Error(body.error ?? "Save failed")
      }

      setStatusText(editingId ? "Product updated." : "Product created.")
      resetForm()
      await fetchProducts()
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : "Operation failed.")
    } finally {
      setIsSaving(false)
    }
  }

  const onDelete = async (id: string) => {
    const shouldDelete = window.confirm("Delete this product?")
    if (!shouldDelete) return
    setErrorText("")
    setStatusText("")

    try {
      const response = await fetch(`/api/products/${id}`, { method: "DELETE" })
      const body = (await response.json()) as { error?: string }
      if (!response.ok) {
        throw new Error(body.error ?? "Delete failed")
      }
      setStatusText("Product deleted.")
      if (editingId === id) resetForm()
      await fetchProducts()
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : "Delete failed.")
    }
  }

  const onLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" })
    window.location.href = "/admin-login"
  }

  return (
    <main className="min-h-screen bg-[#f3f6fb] px-2 py-3 text-[#142438] sm:px-4 sm:py-6">
      <div className="mx-auto grid max-w-[1500px] gap-6 xl:grid-cols-[420px_1fr]">
        <section className="rounded-2xl border border-[#d4deec] bg-white p-3.5 shadow-[0_8px_24px_rgba(8,20,42,0.06)] sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-xl font-black sm:text-2xl">Admin Products</h1>
            <button
              type="button"
              onClick={() => void onLogout()}
              className="w-full rounded-lg border border-[#cfd9e7] px-3 py-2 text-sm font-semibold sm:w-auto sm:py-1.5"
            >
              Logout
            </button>
          </div>
          <p className="mt-1 text-sm text-[#506178]">
            Upload product images, preview them instantly, and save only the final image URL.
          </p>

          {editingId ? (
            <div className="mt-4 flex flex-col gap-3 rounded-xl border border-[#cfe0f2] bg-[#eef5fd] px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
              <div>
                <p className="text-sm font-semibold text-[#173656]">Editing an existing product</p>
                <p className="text-xs text-[#5b708a]">Click New Product to clear the previous item before adding another one.</p>
              </div>
              <button
                type="button"
                onClick={resetForm}
                className="w-full rounded-lg border border-[#bfd2e7] bg-white px-3 py-2 text-sm font-semibold text-[#173656] sm:w-auto"
              >
                New Product
              </button>
            </div>
          ) : null}

          <div className="mt-5 rounded-2xl border border-[#d8e1ef] bg-[#f7faff] p-3 sm:p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-[#142438]">Bulk image sync</p>
                <p className="text-xs text-[#60748e]">
                  Upload many files at once. Each filename should match a product slug, like
                  `nova-point-183.jpg`.
                </p>
              </div>
              <button
                type="button"
                onClick={() => bulkFileInputRef.current?.click()}
                disabled={isBulkSyncing}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#c9d6e8] bg-white px-3 py-2 text-sm font-semibold text-[#193d63] disabled:opacity-60 sm:w-auto"
              >
                {isBulkSyncing ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                Bulk Upload
              </button>
            </div>

            <input
              ref={bulkFileInputRef}
              type="file"
              multiple
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="hidden"
              onChange={(event) => {
                void handleBulkImageSync(event.target.files)
                event.currentTarget.value = ""
              }}
            />

            {bulkSyncResult ? (
              <div className="mt-4 space-y-3 rounded-xl border border-[#d9e2ee] bg-white p-3">
                <p className="text-sm font-semibold text-[#142438]">
                  Updated products: {bulkSyncResult.updatedCount}
                </p>

                {bulkSyncResult.unmatchedFiles.length > 0 ? (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#60748e]">
                      Unmatched filenames
                    </p>
                    <div className="mt-2 space-y-1 text-xs text-[#506178]">
                      {bulkSyncResult.unmatchedFiles.slice(0, 6).map((file) => (
                        <p key={`${file.filename}-${file.slug}`}>
                          {file.filename} {"->"} no product with slug `{file.slug}`
                        </p>
                      ))}
                    </div>
                  </div>
                ) : null}

                {bulkSyncResult.invalidFiles.length > 0 ? (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#60748e]">
                      Invalid files
                    </p>
                    <div className="mt-2 space-y-1 text-xs text-[#506178]">
                      {bulkSyncResult.invalidFiles.slice(0, 6).map((file) => (
                        <p key={`${file.filename}-${file.error}`}>
                          {file.filename} {"->"} {file.error}
                        </p>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          <form onSubmit={onSubmit} className="mt-5 space-y-4">
            <div className="overflow-hidden rounded-2xl border border-[#d8e1ef] bg-[#f7faff]">
              <div className="relative aspect-[4/5] bg-[radial-gradient(circle_at_top,rgba(25,61,99,0.10),transparent_55%),linear-gradient(180deg,#f7faff_0%,#edf3fb_100%)]">
                {localPreviewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={localPreviewUrl}
                    alt={form.name || "Product preview"}
                    className="h-full w-full object-contain p-5"
                  />
                ) : (
                  <Image
                    src={primaryPreviewImage}
                    alt={form.name || "Product preview"}
                    fill
                    unoptimized={primaryPreviewImage.startsWith("data:image/")}
                    className="object-contain p-5"
                  />
                )}
              </div>
              <div className="space-y-3 p-3 sm:p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#142438]">Image Preview</p>
                    <p className="text-xs text-[#60748e]">JPEG, PNG, WebP, or GIF up to 5 MB.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#193d63] px-3 py-2 text-sm font-semibold text-white disabled:opacity-60 sm:w-auto"
                  >
                    {isUploading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                    Upload
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0]
                    if (file) {
                      void handleFileUpload(file)
                    }
                    event.currentTarget.value = ""
                  }}
                />

                <label className="block">
                  <span className="mb-1 block text-sm font-semibold">Image URL</span>
                  <input
                    value={form.imageUrl}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        imageUrl: event.target.value,
                        images: event.target.value ? [event.target.value] : [],
                      }))
                    }
                    placeholder="/uploads/products/example.jpg"
                    className="w-full rounded-lg border border-[#cfd9e7] px-3 py-2 text-sm outline-none"
                  />
                </label>
              </div>
            </div>

            <label className="block">
              <span className="mb-1 block text-sm font-semibold">Category</span>
              <input
                value={form.category}
                onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
                list="category-list"
                className="w-full rounded-lg border border-[#cfd9e7] px-3 py-2 text-sm outline-none"
                required
              />
              <datalist id="category-list">
                {categories.map((category) => (
                  <option key={category} value={category} />
                ))}
              </datalist>
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-semibold">Type</span>
              <input
                value={form.kind}
                onChange={(event) => setForm((prev) => ({ ...prev, kind: event.target.value }))}
                className="w-full rounded-lg border border-[#cfd9e7] px-3 py-2 text-sm outline-none"
                required
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-semibold">Display name</span>
              <input
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                className="w-full rounded-lg border border-[#cfd9e7] px-3 py-2 text-sm outline-none"
                required
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-semibold">Price</span>
              <input
                value={form.price}
                onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
                type="number"
                min="1"
                className="w-full rounded-lg border border-[#cfd9e7] px-3 py-2 text-sm outline-none"
                required
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-semibold">Stock quantity</span>
              <input
                value={form.inStock}
                onChange={(event) => setForm((prev) => ({ ...prev, inStock: event.target.value }))}
                type="number"
                min="0"
                className="w-full rounded-lg border border-[#cfd9e7] px-3 py-2 text-sm outline-none"
                required
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-semibold">Description</span>
              <textarea
                value={form.description}
                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                rows={4}
                maxLength={1200}
                placeholder="Add a short product summary that also appears nicely on the detail page."
                className="w-full rounded-lg border border-[#cfd9e7] px-3 py-2 text-sm outline-none"
              />
              <div className="mt-1 flex items-center justify-between gap-3 text-xs text-[#60748e]">
                <span className="max-w-[70%]">Helpful for the storefront product detail page.</span>
                <span>{form.description.length}/1200</span>
              </div>
            </label>

            <div className="rounded-xl border border-[#d8e1ef] bg-[#f7faff] p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <Box className="h-4 w-4 text-[#33567d]" />
                <p className="text-sm font-semibold text-[#173656]">Product slug preview</p>
              </div>
              <p className="mt-2 text-sm text-[#506178]">
                {form.name.trim()
                  ? formatSlugPreview(form.name)
                  : "Slug will be generated from the product name after you type it."}
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-1 sm:flex-row">
              <button
                type="submit"
                disabled={isSaving || isUploading}
                className="rounded-lg bg-[#193d63] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {isSaving ? "Saving..." : editingId ? "Update Product" : "Create Product"}
              </button>
              {editingId ? (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-[#cfd9e7] px-4 py-2 text-sm font-semibold"
                >
                  Cancel Edit
                </button>
              ) : null}
            </div>
          </form>

          {statusText ? <p className="mt-3 text-sm font-semibold text-[#1a6b3f]">{statusText}</p> : null}
          {errorText ? <p className="mt-3 text-sm font-semibold text-[#9a2d2d]">{errorText}</p> : null}
        </section>

        <section className="rounded-2xl border border-[#d4deec] bg-white p-3.5 shadow-[0_8px_24px_rgba(8,20,42,0.06)] sm:p-5">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-[#d9e2ee] bg-[#f8fbff] p-3.5 sm:p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#60748e]">Products</p>
              <p className="mt-3 text-2xl font-black text-[#142438] sm:text-3xl">{inventoryStats.totalProducts}</p>
              <p className="mt-1 text-sm text-[#60748e]">Total products in catalog</p>
            </div>
            <div className="rounded-2xl border border-[#d9e2ee] bg-[#f8fbff] p-3.5 sm:p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#60748e]">Units In Stock</p>
              <p className="mt-3 text-2xl font-black text-[#142438] sm:text-3xl">{inventoryStats.totalUnits}</p>
              <p className="mt-1 text-sm text-[#60748e]">Combined quantity across products</p>
            </div>
            <div className="rounded-2xl border border-[#f0d7b5] bg-[#fff8ee] p-3.5 sm:p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9a5d18]">Low Stock</p>
              <p className="mt-3 text-2xl font-black text-[#7f4a12] sm:text-3xl">{inventoryStats.lowStockCount}</p>
              <p className="mt-1 text-sm text-[#9a6a34]">Products with 1 to 5 units left</p>
            </div>
            <div className="rounded-2xl border border-[#edc7c7] bg-[#fff5f5] p-3.5 sm:p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9a2d2d]">Out Of Stock</p>
              <p className="mt-3 text-2xl font-black text-[#7e2323] sm:text-3xl">{inventoryStats.outOfStockCount}</p>
              <p className="mt-1 text-sm text-[#9f5f5f]">Products that need restocking</p>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-black sm:text-xl">Products ({filteredItems.length})</h2>
              <p className="text-sm text-[#60748e]">Search, filter, and jump into edits faster.</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("")
                  setCategoryFilter("All")
                }}
                className="rounded-lg border border-[#cfd9e7] px-3 py-2 text-sm font-semibold"
              >
                Clear Filters
              </button>
              <button
                type="button"
                onClick={() => void fetchProducts()}
                className="rounded-lg border border-[#cfd9e7] px-3 py-2 text-sm font-semibold"
              >
                Refresh
              </button>
            </div>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-[1.3fr_0.7fr]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b7c92]" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by name, type, category, slug, or id"
                className="w-full rounded-xl border border-[#cfd9e7] px-10 py-3 text-sm outline-none"
              />
            </label>

            <label className="block">
              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                className="w-full rounded-xl border border-[#cfd9e7] px-3 py-3 text-sm outline-none"
              >
                <option value="All">All categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {isLoading ? (
            <div className="mt-4 rounded-lg border border-[#e2e8f1] bg-[#f7faff] p-4 text-sm text-[#4b5f78]">
              Loading products...
            </div>
          ) : (
            <>
              <div className="mt-4 grid gap-3 xl:hidden">
                {filteredItems.map((item) => (
                  <article key={item.id} className="overflow-hidden rounded-xl border border-[#d9e2ee]">
                    <div className="relative aspect-square bg-[radial-gradient(circle_at_top,rgba(25,61,99,0.10),transparent_55%),linear-gradient(180deg,#f7faff_0%,#edf3fb_100%)] sm:aspect-[4/5]">
                      <Image
                        src={getPrimaryProductImage(item)}
                        alt={item.name}
                        fill
                        unoptimized={getPrimaryProductImage(item).startsWith("data:image/")}
                        className="object-contain p-4"
                      />
                    </div>
                    <div className="space-y-3 p-3">
                      <div>
                        <p className="line-clamp-2 text-sm font-bold">{item.name}</p>
                        <p className="text-xs text-[#51647e]">
                          {item.category} | {item.kind}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 text-[11px] font-semibold">
                        <span className="rounded-full bg-[#edf3fb] px-2 py-1 text-[#33567d]">
                          Stock: {item.inStock ?? 0}
                        </span>
                        <span className="rounded-full bg-[#eef7ef] px-2 py-1 text-[#29603a]">
                          {item.slug ?? "no-slug"}
                        </span>
                      </div>
                      <div className="grid gap-2 text-sm text-[#51647e]">
                        <p className="truncate">ID: {item.id}</p>
                        <p>Price: Rs. {item.price}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(item)}
                          className="flex-1 rounded-md border border-[#b8c9df] px-3 py-2 text-xs font-semibold"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void onDelete(item.id)}
                          className="flex-1 rounded-md border border-[#e0bcbc] px-3 py-2 text-xs font-semibold text-[#8c2f2f]"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <div className="mt-4 hidden gap-3 xl:grid xl:grid-cols-4">
                {topPreviewItems.map((item) => (
                  <article key={item.id} className="overflow-hidden rounded-xl border border-[#d9e2ee]">
                    <div className="relative aspect-[4/5] bg-[radial-gradient(circle_at_top,rgba(25,61,99,0.10),transparent_55%),linear-gradient(180deg,#f7faff_0%,#edf3fb_100%)]">
                      <Image
                        src={getPrimaryProductImage(item)}
                        alt={item.name}
                        fill
                        unoptimized={getPrimaryProductImage(item).startsWith("data:image/")}
                        className="object-contain p-4"
                      />
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-bold">{item.name}</p>
                      <p className="text-xs text-[#51647e]">
                        {item.category} | {item.kind}
                      </p>
                      <p className="mt-1 text-sm font-semibold">Rs. {item.price}</p>
                      <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-semibold">
                        <span className="rounded-full bg-[#edf3fb] px-2 py-1 text-[#33567d]">
                          Stock: {item.inStock ?? 0}
                        </span>
                        <span className="rounded-full bg-[#eef7ef] px-2 py-1 text-[#29603a]">
                          {item.slug ?? "no-slug"}
                        </span>
                      </div>
                      <div className="mt-2 flex gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(item)}
                          className="rounded-md border border-[#b8c9df] px-2 py-1 text-xs font-semibold"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void onDelete(item.id)}
                          className="rounded-md border border-[#e0bcbc] px-2 py-1 text-xs font-semibold text-[#8c2f2f]"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <div className="mt-5 hidden max-h-[540px] overflow-auto rounded-lg border border-[#d9e2ee] xl:block">
                <table className="w-full min-w-[980px] text-left text-sm">
                  <thead className="sticky top-0 bg-[#eff4fb]">
                    <tr>
                      <th className="px-3 py-2">Preview</th>
                      <th className="px-3 py-2">ID</th>
                      <th className="px-3 py-2">Name</th>
                      <th className="px-3 py-2">Category</th>
                      <th className="px-3 py-2">Type</th>
                      <th className="px-3 py-2">Price</th>
                      <th className="px-3 py-2">Stock</th>
                      <th className="px-3 py-2">Slug</th>
                      <th className="px-3 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((item) => (
                      <tr key={item.id} className="border-t border-[#edf2f8]">
                        <td className="px-3 py-2">
                          <div className="relative h-14 w-14 overflow-hidden rounded-lg bg-[linear-gradient(180deg,#f7faff_0%,#edf3fb_100%)]">
                            <Image
                              src={getPrimaryProductImage(item)}
                              alt={item.name}
                              fill
                              unoptimized={getPrimaryProductImage(item).startsWith("data:image/")}
                              className="object-contain p-1.5"
                            />
                          </div>
                        </td>
                        <td className="px-3 py-2">{item.id}</td>
                        <td className="px-3 py-2">{item.name}</td>
                        <td className="px-3 py-2">{item.category}</td>
                        <td className="px-3 py-2">{item.kind}</td>
                        <td className="px-3 py-2">Rs. {item.price}</td>
                        <td className="px-3 py-2">
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                              (item.inStock ?? 0) === 0
                                ? "bg-[#fff1f1] text-[#9a2d2d]"
                                : (item.inStock ?? 0) <= 5
                                  ? "bg-[#fff4e7] text-[#9a5d18]"
                                  : "bg-[#edf7ef] text-[#2a6a3c]"
                            }`}
                          >
                            {item.inStock ?? 0}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-[#51647e]">{item.slug ?? "-"}</td>
                        <td className="px-3 py-2">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => startEdit(item)}
                              className="rounded-md border border-[#b8c9df] px-2 py-1 text-xs font-semibold"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => void onDelete(item.id)}
                              className="rounded-md border border-[#e0bcbc] px-2 py-1 text-xs font-semibold text-[#8c2f2f]"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredItems.length === 0 ? (
                <div className="mt-8 rounded-2xl border border-dashed border-[#d9e2ee] bg-[#f8fbff] p-8 text-center">
                  {items.length === 0 ? (
                    <>
                      <ImagePlus className="mx-auto h-10 w-10 text-[#7e90a7]" />
                      <p className="mt-3 text-sm font-semibold text-[#344861]">No products yet</p>
                    </>
                  ) : (
                    <>
                      <PackageSearch className="mx-auto h-10 w-10 text-[#7e90a7]" />
                      <p className="mt-3 text-sm font-semibold text-[#344861]">No products match these filters</p>
                      <p className="mt-1 text-sm text-[#60748e]">Try another category or clear the search text.</p>
                    </>
                  )}
                </div>
              ) : null}
            </>
          )}
        </section>
      </div>
    </main>
  )
}

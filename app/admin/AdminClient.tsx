"use client"

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react"
import type { CatalogProduct } from "@/src/shared/catalog-types"

type ProductsApiResponse = {
  items: CatalogProduct[]
  categories: string[]
}

type ProductFormState = {
  category: string
  kind: string
  name: string
  image: string
  price: string
}

const blankForm: ProductFormState = {
  category: "",
  kind: "",
  name: "",
  image: "",
  price: "",
}

export default function AdminPage() {
  const [items, setItems] = useState<CatalogProduct[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [form, setForm] = useState<ProductFormState>(blankForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [statusText, setStatusText] = useState("")
  const [errorText, setErrorText] = useState("")

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

  const topPreview = useMemo(() => items.slice(0, 12), [items])

  const resetForm = () => {
    setForm(blankForm)
    setEditingId(null)
  }

  const startEdit = (item: CatalogProduct) => {
    setEditingId(item.id)
    setForm({
      category: item.category,
      kind: item.kind,
      name: item.name,
      image: item.image,
      price: String(item.price),
    })
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
        image: form.image.trim(),
        price: Number(form.price),
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
    <main className="min-h-screen bg-[#f3f6fb] px-4 py-6 text-[#142438]">
      <div className="mx-auto grid max-w-[1500px] gap-6 lg:grid-cols-[380px_1fr]">
        <section className="rounded-2xl border border-[#d4deec] bg-white p-5 shadow-[0_8px_24px_rgba(8,20,42,0.06)]">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-2xl font-black">Admin Products</h1>
            <button
              type="button"
              onClick={() => void onLogout()}
              className="rounded-lg border border-[#cfd9e7] px-3 py-1.5 text-sm font-semibold"
            >
              Logout
            </button>
          </div>
          <p className="mt-1 text-sm text-[#506178]">Create, edit, and delete products in `data/products.json`.</p>

          <form onSubmit={onSubmit} className="mt-5 space-y-3">
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
              <span className="mb-1 block text-sm font-semibold">Image URL / data URI</span>
              <textarea
                value={form.image}
                onChange={(event) => setForm((prev) => ({ ...prev, image: event.target.value }))}
                className="h-20 w-full rounded-lg border border-[#cfd9e7] px-3 py-2 text-sm outline-none"
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

            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={isSaving}
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

        <section className="rounded-2xl border border-[#d4deec] bg-white p-5 shadow-[0_8px_24px_rgba(8,20,42,0.06)]">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-black">Products ({items.length})</h2>
            <button
              type="button"
              onClick={() => void fetchProducts()}
              className="rounded-lg border border-[#cfd9e7] px-3 py-1.5 text-sm font-semibold"
            >
              Refresh
            </button>
          </div>

          {isLoading ? (
            <div className="mt-4 rounded-lg border border-[#e2e8f1] bg-[#f7faff] p-4 text-sm text-[#4b5f78]">
              Loading products...
            </div>
          ) : (
            <>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {topPreview.map((item) => (
                  <article key={item.id} className="rounded-xl border border-[#d9e2ee] p-3">
                    <p className="text-sm font-bold">{item.name}</p>
                    <p className="text-xs text-[#51647e]">{item.category} | {item.kind}</p>
                    <p className="mt-1 text-sm font-semibold">Rs. {item.price}</p>
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
                  </article>
                ))}
              </div>

              <div className="mt-5 max-h-[540px] overflow-auto rounded-lg border border-[#d9e2ee]">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="sticky top-0 bg-[#eff4fb]">
                    <tr>
                      <th className="px-3 py-2">ID</th>
                      <th className="px-3 py-2">Name</th>
                      <th className="px-3 py-2">Category</th>
                      <th className="px-3 py-2">Type</th>
                      <th className="px-3 py-2">Price</th>
                      <th className="px-3 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className="border-t border-[#edf2f8]">
                        <td className="px-3 py-2">{item.id}</td>
                        <td className="px-3 py-2">{item.name}</td>
                        <td className="px-3 py-2">{item.category}</td>
                        <td className="px-3 py-2">{item.kind}</td>
                        <td className="px-3 py-2">Rs. {item.price}</td>
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
            </>
          )}
        </section>
      </div>
    </main>
  )
}


import { NextRequest, NextResponse } from "next/server"
import { getAdminCookieName, verifyAdminSessionToken } from "@/src/server/auth/admin-auth"
import { parseJsonBody, serverErrorResponse } from "@/src/server/http/json"
import { deleteProduct, getProductById, updateProduct } from "@/src/server/services/data-source"
import type { ProductInput } from "@/src/server/services/products-store"
import { productIdSchema, productInputSchema } from "@/src/server/validation/api-schemas"

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const parsedId = productIdSchema.safeParse(id)
    if (!parsedId.success) {
      return NextResponse.json({ error: parsedId.error.issues[0]?.message ?? "Invalid product id." }, { status: 400 })
    }

    const product = await getProductById(parsedId.data)
    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 })
    }

    return NextResponse.json({ item: product })
  } catch (error) {
    return serverErrorResponse(error)
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const token = request.cookies.get(getAdminCookieName())?.value
    if (!verifyAdminSessionToken(token)) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
    }

    const { id } = await context.params
    const parsedId = productIdSchema.safeParse(id)
    if (!parsedId.success) {
      return NextResponse.json({ error: parsedId.error.issues[0]?.message ?? "Invalid product id." }, { status: 400 })
    }

    const parsedBody = await parseJsonBody(request, productInputSchema)
    if (!parsedBody.ok) return parsedBody.response

    const payload: ProductInput = {
      ...parsedBody.data,
      imageUrl: parsedBody.data.imageUrl ?? "/placeholder.jpg",
      images: parsedBody.data.images ?? [],
    }

    const updated = await updateProduct(parsedId.data, payload)
    if (!updated) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 })
    }

    return NextResponse.json({ item: updated })
  } catch (error) {
    return serverErrorResponse(error)
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const token = request.cookies.get(getAdminCookieName())?.value
    if (!verifyAdminSessionToken(token)) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
    }

    const { id } = await context.params
    const parsedId = productIdSchema.safeParse(id)
    if (!parsedId.success) {
      return NextResponse.json({ error: parsedId.error.issues[0]?.message ?? "Invalid product id." }, { status: 400 })
    }

    const existing = await getProductById(parsedId.data)
    if (!existing) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 })
    }

    await deleteProduct(parsedId.data)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return serverErrorResponse(error)
  }
}

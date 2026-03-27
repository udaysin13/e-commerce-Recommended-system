import { NextRequest, NextResponse } from "next/server"
import { getAdminCookieName, verifyAdminSessionToken } from "@/src/server/auth/admin-auth"
import { parseJsonBody, serverErrorResponse } from "@/src/server/http/json"
import { createProduct, queryProducts } from "@/src/server/services/data-source"
import { productInputSchema, productQuerySchema } from "@/src/server/validation/api-schemas"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const parsedQuery = productQuerySchema.safeParse({
      q: searchParams.get("q") ?? "",
      category: searchParams.get("category") ?? "All",
      sort: searchParams.get("sort") ?? "Newest",
    })
    if (!parsedQuery.success) {
      return NextResponse.json({ error: parsedQuery.error.issues[0]?.message ?? "Invalid query." }, { status: 400 })
    }

    const { q, category, sort } = parsedQuery.data
    const payload = await queryProducts({ q, category, sort })
    return NextResponse.json(payload)
  } catch (error) {
    return serverErrorResponse(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get(getAdminCookieName())?.value
    if (!verifyAdminSessionToken(token)) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
    }

    const parsedBody = await parseJsonBody(request, productInputSchema)
    if (!parsedBody.ok) return parsedBody.response

    const created = await createProduct(parsedBody.data)
    return NextResponse.json({ item: created }, { status: 201 })
  } catch (error) {
    return serverErrorResponse(error)
  }
}

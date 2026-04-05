import { NextRequest, NextResponse } from "next/server"
import { serverErrorResponse } from "@/src/server/http/json"
import { getSimilarProducts } from "@/src/server/services/hybrid-recommendations"
import { recommendationQuerySchema } from "@/src/server/validation/api-schemas"

type RouteContext = {
  params: Promise<{ productId: string }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { productId } = await context.params
    const { searchParams } = new URL(request.url)
    const parsedQuery = recommendationQuerySchema.safeParse({
      limit: searchParams.get("limit") ?? 4,
    })

    if (!parsedQuery.success) {
      return NextResponse.json(
        { error: parsedQuery.error.issues[0]?.message ?? "Invalid similarity query." },
        { status: 400 },
      )
    }

    const items = await getSimilarProducts(productId, parsedQuery.data.limit)
    return NextResponse.json({
      items,
      strategy: "Content-based filtering using shared category and similar price band.",
    })
  } catch (error) {
    return serverErrorResponse(error)
  }
}

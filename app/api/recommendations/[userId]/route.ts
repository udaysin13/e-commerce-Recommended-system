import { NextRequest, NextResponse } from "next/server"
import { serverErrorResponse } from "@/src/server/http/json"
import {
  getHybridRecommendations,
  getRecommendationInsights,
} from "@/src/server/services/hybrid-recommendations"
import { recommendationQuerySchema } from "@/src/server/validation/api-schemas"

type RouteContext = {
  params: Promise<{ userId: string }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { userId } = await context.params
    const { searchParams } = new URL(request.url)
    const parsedQuery = recommendationQuerySchema.safeParse({
      limit: searchParams.get("limit") ?? 6,
    })

    if (!parsedQuery.success) {
      return NextResponse.json(
        { error: parsedQuery.error.issues[0]?.message ?? "Invalid recommendation query." },
        { status: 400 },
      )
    }

    const [items, insights] = await Promise.all([
      getHybridRecommendations(userId, parsedQuery.data.limit),
      getRecommendationInsights(userId),
    ])

    return NextResponse.json({
      items,
      insights,
      algorithm: {
        contentBased: "Matches products by category and price range.",
        collaborative: "Looks at products bought by similar users.",
        hybrid: "Blends both lists, removes duplicates, and stores ranked results.",
      },
    })
  } catch (error) {
    return serverErrorResponse(error)
  }
}

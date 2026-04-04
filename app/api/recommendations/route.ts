import { NextRequest, NextResponse } from "next/server"
import { recommendationContextSchema, recommendationPageSchema } from "@/src/shared/recommendation-schema"
import { serverErrorResponse } from "@/src/server/http/json"
import { getRecommendationPage } from "@/src/server/services/recommendations"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const parsedContext = recommendationContextSchema.safeParse(body)

    if (!parsedContext.success) {
      return NextResponse.json(
        { error: parsedContext.error.issues[0]?.message ?? "Invalid recommendation context." },
        { status: 400 },
      )
    }

    const payload = await getRecommendationPage(parsedContext.data)
    const validatedPayload = recommendationPageSchema.safeParse(payload)

    if (!validatedPayload.success) {
      return NextResponse.json({ error: "Recommendation payload validation failed." }, { status: 500 })
    }

    return NextResponse.json(validatedPayload.data)
  } catch (error) {
    return serverErrorResponse(error)
  }
}

import { NextRequest, NextResponse } from "next/server"
import { getSessionUser } from "@/src/server/auth/user-auth"
import { parseJsonBody, serverErrorResponse } from "@/src/server/http/json"
import { trackProductView } from "@/src/server/services/hybrid-recommendations"
import { productViewSchema } from "@/src/server/validation/api-schemas"

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
    }

    const parsedBody = await parseJsonBody(request, productViewSchema)
    if (!parsedBody.ok) return parsedBody.response

    await trackProductView(user.id, parsedBody.data.productId)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return serverErrorResponse(error)
  }
}

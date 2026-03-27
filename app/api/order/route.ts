import { NextRequest, NextResponse } from "next/server"
import { getSessionUser } from "@/src/server/auth/user-auth"
import { parseJsonBody, serverErrorResponse } from "@/src/server/http/json"
import { createBuyNowOrder } from "@/src/server/services/buy-now-order"
import { checkoutOrderSchema } from "@/src/shared/checkout"

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
    }

    const parsedBody = await parseJsonBody(request, checkoutOrderSchema)
    if (!parsedBody.ok) return parsedBody.response

    const order = await createBuyNowOrder(user.id, parsedBody.data)
    return NextResponse.json({ order }, { status: 201 })
  } catch (error) {
    return serverErrorResponse(error)
  }
}

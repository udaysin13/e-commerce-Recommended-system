import { NextRequest, NextResponse } from "next/server"
import { getSessionUser } from "@/src/server/auth/user-auth"
import { serverErrorResponse } from "@/src/server/http/json"
import { getOrderById } from "@/src/server/services/orders"
import { orderIdSchema } from "@/src/server/validation/api-schemas"

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser(request)
    if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 })

    const { id } = await context.params
    const parsedId = orderIdSchema.safeParse(id)
    if (!parsedId.success) {
      return NextResponse.json({ error: parsedId.error.issues[0]?.message ?? "Invalid order id." }, { status: 400 })
    }

    const order = await getOrderById(user.id, parsedId.data)
    if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 })

    return NextResponse.json({ order })
  } catch (error) {
    return serverErrorResponse(error)
  }
}

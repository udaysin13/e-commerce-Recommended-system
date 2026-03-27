import { NextRequest, NextResponse } from "next/server"
import { getSessionUser } from "@/src/server/auth/user-auth"
import { parseJsonBody, serverErrorResponse } from "@/src/server/http/json"
import { mergeCartItems } from "@/src/server/services/cart"
import { getOrderById } from "@/src/server/services/orders"
import { reorderSchema } from "@/src/server/validation/api-schemas"

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser(request)
    if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 })

    const parsedBody = await parseJsonBody(request, reorderSchema)
    if (!parsedBody.ok) return parsedBody.response

    const order = await getOrderById(user.id, parsedBody.data.orderId)
    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 })
    }

    const itemsToMerge = order.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    }))

    const updatedCart = await mergeCartItems(user.id, itemsToMerge)
    return NextResponse.json({ items: updatedCart })
  } catch (error) {
    return serverErrorResponse(error)
  }
}

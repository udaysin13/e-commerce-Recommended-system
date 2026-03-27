import { NextRequest, NextResponse } from "next/server"
import { getSessionUser } from "@/src/server/auth/user-auth"
import { serverErrorResponse } from "@/src/server/http/json"
import { clearCart } from "@/src/server/services/cart"
import { createOrder, getOrders } from "@/src/server/services/orders"
import { parseJsonBody } from "@/src/server/http/json"
import { orderCreateSchema } from "@/src/server/validation/api-schemas"

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser(request)
    if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 })

    const orders = await getOrders(user.id)
    return NextResponse.json({ orders })
  } catch (error) {
    return serverErrorResponse(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser(request)
    if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 })

    const parsedBody = await parseJsonBody(request, orderCreateSchema)
    if (!parsedBody.ok) return parsedBody.response

    const order = await createOrder(user.id, parsedBody.data.items, parsedBody.data.shippingAddress)
    await clearCart(user.id)
    return NextResponse.json({ order })
  } catch (error) {
    return serverErrorResponse(error)
  }
}

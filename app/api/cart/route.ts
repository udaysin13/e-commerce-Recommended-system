import { NextRequest, NextResponse } from "next/server"
import { getSessionUser } from "@/src/server/auth/user-auth"
import { parseJsonBody, serverErrorResponse } from "@/src/server/http/json"
import { addOrUpdateCartItem, clearCart, getCartItems, removeCartItem, setCartItems } from "@/src/server/services/cart"
import {
  cartActionSchema,
  cartDeleteSchema,
  cartMutationSchema,
  cartReplaceSchema,
} from "@/src/server/validation/api-schemas"

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser(request)
    if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 })

    const items = await getCartItems(user.id)
    return NextResponse.json({ items })
  } catch (error) {
    return serverErrorResponse(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser(request)
    if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 })

    const parsedBody = await parseJsonBody(request, cartMutationSchema)
    if (!parsedBody.ok) return parsedBody.response

    const items = await addOrUpdateCartItem(user.id, parsedBody.data.productId, parsedBody.data.quantity)
    return NextResponse.json({ items })
  } catch (error) {
    return serverErrorResponse(error)
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getSessionUser(request)
    if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 })

    const parsedBody = await parseJsonBody(request, cartDeleteSchema)
    if (!parsedBody.ok) return parsedBody.response

    const items = await removeCartItem(user.id, parsedBody.data.productId)
    return NextResponse.json({ items })
  } catch (error) {
    return serverErrorResponse(error)
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getSessionUser(request)
    if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 })

    const parsedBody = await parseJsonBody(request, cartReplaceSchema)
    if (!parsedBody.ok) return parsedBody.response

    const updatedItems = await setCartItems(user.id, parsedBody.data.items)
    return NextResponse.json({ items: updatedItems })
  } catch (error) {
    return serverErrorResponse(error)
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getSessionUser(request)
    if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 })

    const parsedBody = await parseJsonBody(request, cartActionSchema)
    if (!parsedBody.ok) return parsedBody.response

    const items = await clearCart(user.id)
    return NextResponse.json({ items })
  } catch (error) {
    return serverErrorResponse(error)
  }
}

import { NextRequest, NextResponse } from "next/server"
import { getSessionUser } from "@/src/server/auth/user-auth"
import { parseJsonBody, serverErrorResponse } from "@/src/server/http/json"
import { getWishlistItems, setWishlistItems, toggleWishlistItem } from "@/src/server/services/wishlist"
import { wishlistReplaceSchema, wishlistToggleSchema } from "@/src/server/validation/api-schemas"

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser(request)
    if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 })

    const items = await getWishlistItems(user.id)
    return NextResponse.json({ items })
  } catch (error) {
    return serverErrorResponse(error)
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getSessionUser(request)
    if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 })

    const parsedBody = await parseJsonBody(request, wishlistReplaceSchema)
    if (!parsedBody.ok) return parsedBody.response

    const updatedItems = await setWishlistItems(user.id, parsedBody.data.items)
    return NextResponse.json({ items: updatedItems })
  } catch (error) {
    return serverErrorResponse(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser(request)
    if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 })

    const parsedBody = await parseJsonBody(request, wishlistToggleSchema)
    if (!parsedBody.ok) return parsedBody.response

    const items = await toggleWishlistItem(user.id, parsedBody.data.productId)
    return NextResponse.json({ items })
  } catch (error) {
    return serverErrorResponse(error)
  }
}

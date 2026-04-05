import { NextRequest, NextResponse } from "next/server"
import { serverErrorResponse } from "@/src/server/http/json"
import { getProductById } from "@/src/server/services/data-source"
import { productIdSchema } from "@/src/server/validation/api-schemas"

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const parsedId = productIdSchema.safeParse(id)
    if (!parsedId.success) {
      return NextResponse.json({ error: parsedId.error.issues[0]?.message ?? "Invalid product id." }, { status: 400 })
    }

    const item = await getProductById(parsedId.data)
    if (!item) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 })
    }

    return NextResponse.json({ item })
  } catch (error) {
    return serverErrorResponse(error)
  }
}

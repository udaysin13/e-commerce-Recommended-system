import { NextRequest, NextResponse } from "next/server"
import { getAdminCookieName, verifyAdminSessionToken } from "@/src/server/auth/admin-auth"
import { serverErrorResponse } from "@/src/server/http/json"
import { saveProductImage } from "@/src/server/uploads"

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get(getAdminCookieName())?.value
    if (!verifyAdminSessionToken(token)) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file")

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Please attach an image file." }, { status: 400 })
    }

    const uploaded = await saveProductImage(file)
    return NextResponse.json(uploaded, { status: 201 })
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return serverErrorResponse(error)
  }
}

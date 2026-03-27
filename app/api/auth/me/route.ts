import { NextRequest, NextResponse } from "next/server"
import { getSessionUser } from "@/src/server/auth/user-auth"
import { serverErrorResponse } from "@/src/server/http/json"

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser(request)
    return NextResponse.json({ user })
  } catch (error) {
    return serverErrorResponse(error)
  }
}

import bcrypt from "bcryptjs"
import { NextRequest, NextResponse } from "next/server"
import { createSessionToken, setSessionCookie } from "@/src/server/auth/user-auth"
import { prisma } from "@/src/server/db/prisma"
import { parseJsonBody, serverErrorResponse } from "@/src/server/http/json"
import { userLoginSchema } from "@/src/server/validation/api-schemas"

export async function POST(request: NextRequest) {
  try {
    const parsed = await parseJsonBody(request, userLoginSchema, "Invalid data.")
    if (!parsed.ok) return parsed.response

    const { email, password } = parsed.data

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, passwordHash: true, role: true },
    })

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 })
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash)
    if (!passwordMatches) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 })
    }

    const token = createSessionToken({ userId: user.id, role: user.role })
    const response = NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } })
    setSessionCookie(response, token)
    return response
  } catch (error) {
    return serverErrorResponse(error)
  }
}

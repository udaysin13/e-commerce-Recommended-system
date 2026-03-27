import bcrypt from "bcryptjs"
import { NextRequest, NextResponse } from "next/server"
import { createSessionToken, setSessionCookie } from "@/src/server/auth/user-auth"
import { prisma } from "@/src/server/db/prisma"
import { parseJsonBody, serverErrorResponse } from "@/src/server/http/json"
import { userSignupSchema } from "@/src/server/validation/api-schemas"

export async function POST(request: NextRequest) {
  try {
    const parsed = await parseJsonBody(request, userSignupSchema, "Invalid data.")
    if (!parsed.ok) return parsed.response

    const { name, email, password } = parsed.data

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: "Email already in use." }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "USER",
      },
      select: { id: true, name: true, email: true, role: true },
    })

    const token = createSessionToken({ userId: user.id, role: user.role })
    const response = NextResponse.json({ user })
    setSessionCookie(response, token)
    return response
  } catch (error) {
    return serverErrorResponse(error)
  }
}

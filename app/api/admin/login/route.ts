import bcrypt from "bcryptjs"
import { NextRequest, NextResponse } from "next/server"
import {
  createAdminSessionToken,
  getAdminCookieName,
  getAdminCookieOptions,
} from "@/src/server/auth/admin-auth"
import { prisma } from "@/src/server/db/prisma"
import { parseJsonBody, serverErrorResponse } from "@/src/server/http/json"
import { adminLoginSchema } from "@/src/server/validation/api-schemas"

export async function POST(request: NextRequest) {
  try {
    const parsedBody = await parseJsonBody(request, adminLoginSchema, "Invalid login payload.")
    if (!parsedBody.ok) return parsedBody.response

    const { username, password } = parsedBody.data

    const adminUser = await prisma.user.findFirst({
      where: {
        role: "ADMIN",
        OR: [{ email: username.toLowerCase() }, { name: username }],
      },
      select: { email: true, passwordHash: true },
    })

    if (!adminUser) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 })
    }

    const passwordMatches = await bcrypt.compare(password, adminUser.passwordHash)
    if (!passwordMatches) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 })
    }

    const response = NextResponse.json({ ok: true })
    response.cookies.set(
      getAdminCookieName(),
      createAdminSessionToken(adminUser.email),
      getAdminCookieOptions()
    )
    return response
  } catch (error) {
    return serverErrorResponse(error)
  }
}

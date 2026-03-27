import { NextResponse } from "next/server"
import { getAdminCookieName, getAdminCookieOptions } from "@/src/server/auth/admin-auth"

export async function POST() {
  const response = NextResponse.json({ ok: true })
  response.cookies.set(getAdminCookieName(), "", {
    ...getAdminCookieOptions(),
    maxAge: 0,
  })
  return response
}


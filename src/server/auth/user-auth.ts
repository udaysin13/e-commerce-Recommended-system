import jwt from "jsonwebtoken"
import { NextRequest, NextResponse } from "next/server"
import { env } from "@/src/server/config/env"
import { prisma } from "@/src/server/db/prisma"

const COOKIE_NAME = "fluxcart_session"
const TOKEN_EXPIRY = "7d"

export type SessionPayload = {
  userId: string
  role: string
  iat?: number
  exp?: number
}

export function createSessionToken(payload: Omit<SessionPayload, "iat" | "exp">) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: TOKEN_EXPIRY })
}

export function verifySessionToken(token: string) {
  try {
    return jwt.verify(token, env.JWT_SECRET) as SessionPayload
  } catch {
    return null
  }
}

export function setSessionCookie(response: NextResponse, token: string) {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  })
}

async function getUserFromSessionToken(token?: string) {
  if (!token) return null
  const payload = verifySessionToken(token)
  if (!payload) return null

  return prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, name: true, email: true, role: true },
  })
}

export function getSessionCookieName() {
  return COOKIE_NAME
}

export async function getSessionUser(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value
  return getUserFromSessionToken(token)
}

export async function getSessionUserFromToken(token?: string) {
  return getUserFromSessionToken(token)
}

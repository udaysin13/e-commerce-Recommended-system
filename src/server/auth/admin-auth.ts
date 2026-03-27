import { createHmac, timingSafeEqual } from "crypto"
import { env } from "@/src/server/config/env"

const COOKIE_NAME = "admin_session"
const ONE_DAY_SECONDS = 60 * 60 * 24

const base64UrlEncode = (value: string) =>
  Buffer.from(value, "utf8").toString("base64url")

const base64UrlDecode = (value: string) =>
  Buffer.from(value, "base64url").toString("utf8")

const getSignature = (payload: string) =>
  createHmac("sha256", env.ADMIN_SESSION_SECRET).update(payload).digest("base64url")

export const getAdminCookieName = () => COOKIE_NAME

export const createAdminSessionToken = (username: string) => {
  const exp = Date.now() + ONE_DAY_SECONDS * 1000
  const payload = base64UrlEncode(JSON.stringify({ username, exp }))
  const signature = getSignature(payload)
  return `${payload}.${signature}`
}

export const verifyAdminSessionToken = (token?: string) => {
  if (!token) return false
  const [payload, signature] = token.split(".")
  if (!payload || !signature) return false

  const expectedSig = getSignature(payload)
  const sigBuf = Buffer.from(signature)
  const expectedBuf = Buffer.from(expectedSig)
  if (sigBuf.length !== expectedBuf.length) return false
  if (!timingSafeEqual(sigBuf, expectedBuf)) return false

  try {
    const decoded = JSON.parse(base64UrlDecode(payload)) as { username?: string; exp?: number }
    if (!decoded.username || !decoded.exp) return false
    if (Date.now() > decoded.exp) return false
    return true
  } catch {
    return false
  }
}

export const getAdminCookieOptions = () => ({
  httpOnly: true,
  sameSite: "lax" as const,
  secure: env.NODE_ENV === "production",
  path: "/",
  maxAge: ONE_DAY_SECONDS,
})

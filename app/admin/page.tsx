import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import AdminClient from "./AdminClient"
import { getAdminCookieName, verifyAdminSessionToken } from "@/src/server/auth/admin-auth"

export default async function AdminPage() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get(getAdminCookieName())?.value

  if (!verifyAdminSessionToken(sessionToken)) {
    redirect("/admin-login")
  }

  return <AdminClient />
}


import "server-only"

import { cookies } from "next/headers"
import { decryptToken, dashboardForRole } from "./token"

export type { SessionPayload } from "./token"
export { dashboardForRole }

export async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value
  if (!token) return null
  return decryptToken(token)
}

export async function createSession(token: string) {
  const cookieStore = await cookies()
  cookieStore.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  })
}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete("token")
}

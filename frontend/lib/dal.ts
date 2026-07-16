import "server-only"

import { redirect } from "next/navigation"
import { getSession } from "./session"
import type { SessionPayload } from "./token"

export async function verifySession(): Promise<SessionPayload> {
  const session = await getSession()
  if (!session) redirect("/login")
  return session
}

export async function verifyRole(allowed: string[]): Promise<SessionPayload> {
  const session = await verifySession()
  if (!allowed.includes(session.role)) redirect("/login")
  return session
}

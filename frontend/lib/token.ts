import { jwtVerify } from "jose"

export type SessionPayload = {
  sub: string
  email: string
  name: string
  role: "user" | "seller" | "admin"
  exp: number
}

export const DASHBOARD_BY_ROLE: Record<string, string> = {
  user: "/dashboard/user",
  seller: "/dashboard/seller",
  admin: "/dashboard/admin",
}

export function dashboardForRole(role: string): string {
  return DASHBOARD_BY_ROLE[role] ?? "/dashboard/user"
}

export async function decryptToken(token: string): Promise<SessionPayload | null> {
  const secret = process.env.JWT_SECRET
  if (!secret) return null
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret))
    return payload as unknown as SessionPayload
  } catch {
    return null
  }
}

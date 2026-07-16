import { NextRequest, NextResponse } from "next/server"
import { decryptToken, dashboardForRole } from "@/lib/token"

const AUTH_PATHS = ["/login", "/register"]

// Which roles are allowed on each dashboard prefix
const ROLE_RULES: Array<{ prefix: string; allowed: string[] }> = [
  { prefix: "/dashboard/admin",  allowed: ["admin"] },
  { prefix: "/dashboard/seller", allowed: ["seller"] },
  { prefix: "/dashboard/user",   allowed: ["user"] },
]

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname
  const token = req.cookies.get("token")?.value
  const session = token ? await decryptToken(token) : null

  // 1. Not logged in → protect all /dashboard routes
  if (path.startsWith("/dashboard") && !session) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  // 2. Logged in but wrong role for this dashboard → send to correct dashboard
  if (session) {
    for (const { prefix, allowed } of ROLE_RULES) {
      if (path.startsWith(prefix) && !allowed.includes(session.role)) {
        return NextResponse.redirect(new URL(dashboardForRole(session.role), req.url))
      }
    }
  }

  // 3. Already logged in → skip login/register pages
  if (AUTH_PATHS.includes(path) && session) {
    return NextResponse.redirect(new URL(dashboardForRole(session.role), req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg$).*)"],
}

"use client"

import Link from "next/link"
import { LogOut, LayoutDashboard, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { logoutAction } from "@/app/actions/auth"
import type { SessionPayload } from "@/lib/session"

const DASHBOARD_LINK: Record<string, string> = {
  user:   "/dashboard/user",
  seller: "/dashboard/seller",
  admin:  "/dashboard/admin",
}

export function NavbarUserMenu({ session }: { session: SessionPayload | null }) {
  if (!session) {
    return (
      <div className="hidden md:flex items-center gap-2">
        <Link href="/login">
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground">Sign In</Button>
        </Link>
        <Link href="/register">
          <Button className="shadow-sm shadow-primary/20 gap-1">
            Get Started <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>
    )
  }

  const dashboardHref = DASHBOARD_LINK[session.role] ?? "/dashboard/user"

  return (
    <div className="hidden md:flex items-center gap-2">
      <Link
        href={dashboardHref}
        className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      >
        <LayoutDashboard className="h-4 w-4 text-primary" />
        {session.name.split(" ")[0]}
      </Link>
      <form action={logoutAction}>
        <Button variant="ghost" size="sm" type="submit" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-1.5">
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </form>
    </div>
  )
}

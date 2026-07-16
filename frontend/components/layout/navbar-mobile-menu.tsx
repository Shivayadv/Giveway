"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, Gift, LayoutDashboard, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { logoutAction } from "@/app/actions/auth"
import type { SessionPayload } from "@/lib/session"

const DASHBOARD_LINK: Record<string, string> = {
  user: "/dashboard/user",
  seller: "/dashboard/seller",
  admin: "/dashboard/admin",
}

interface NavbarMobileMenuProps {
  navLinks: { label: string; href: string }[]
  session: SessionPayload | null
}

export function NavbarMobileMenu({ navLinks, session }: NavbarMobileMenuProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden"
            onClick={() => setOpen(false)}
          />

          {/* Drawer */}
          <div className="fixed inset-y-0 right-0 z-50 flex w-72 flex-col bg-card border-l border-border shadow-2xl md:hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-primary" />
                <span className="font-bold tracking-tight">GiveAwayLead</span>
              </Link>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex-1 space-y-1 p-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Auth actions */}
            <div className="border-t border-border p-4 space-y-2">
              {session ? (
                <>
                  <Link
                    href={DASHBOARD_LINK[session.role] ?? "/dashboard/user"}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    <LayoutDashboard className="h-4 w-4 text-primary" />
                    Dashboard
                  </Link>
                  <form action={logoutAction}>
                    <button
                      type="submit"
                      className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setOpen(false)}>
                    <Button variant="outline" className="w-full">Sign In</Button>
                  </Link>
                  <Link href="/register" onClick={() => setOpen(false)}>
                    <Button className="w-full">Get Started Free</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </>
  )
}

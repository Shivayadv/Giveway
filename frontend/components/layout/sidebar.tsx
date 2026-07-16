"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Gift, LayoutDashboard, Ticket, Trophy, User, LogOut,
  PlusCircle, Users, BarChart3, CreditCard, ShieldCheck, Shuffle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { logoutAction } from "@/app/actions/auth"

export type Role = "user" | "seller" | "admin"

const NAV_LINKS: Record<Role, { name: string; href: string; icon: React.ElementType }[]> = {
  user: [
    { name: "Dashboard",    href: "/dashboard/user",           icon: LayoutDashboard },
    { name: "My Campaigns", href: "/dashboard/user/campaigns", icon: Ticket },
    { name: "My Wins",      href: "/dashboard/user/wins",      icon: Trophy },
    { name: "Profile",      href: "/dashboard/user/profile",   icon: User },
  ],
  seller: [
    { name: "Dashboard",       href: "/dashboard/seller",               icon: LayoutDashboard },
    { name: "Create Campaign", href: "/dashboard/seller/campaigns/new", icon: PlusCircle },
    { name: "My Campaigns",    href: "/dashboard/seller/campaigns",     icon: Ticket },
    { name: "Leads",           href: "/dashboard/seller/leads",         icon: Users },
    { name: "Analytics",       href: "/dashboard/seller/analytics",     icon: BarChart3 },
    { name: "Payments",        href: "/dashboard/seller/payments",      icon: CreditCard },
  ],
  admin: [
    { name: "Dashboard",       href: "/dashboard/admin",           icon: LayoutDashboard },
    { name: "Approvals",       href: "/dashboard/admin/approvals", icon: ShieldCheck },
    { name: "Campaigns",       href: "/dashboard/admin/campaigns", icon: Ticket },
    { name: "Users",           href: "/dashboard/admin/users",     icon: Users },
    { name: "Winner Draw",     href: "/dashboard/admin/draw",      icon: Shuffle },
    { name: "Fraud Detection", href: "/dashboard/admin/fraud",     icon: Trophy },
    { name: "Revenue",         href: "/dashboard/admin/revenue",   icon: BarChart3 },
  ],
}

export function SidebarNavContent({ role, onNavClick }: { role: Role; onNavClick?: () => void }) {
  const pathname = usePathname()
  const links = NAV_LINKS[role]

  return (
    <>
      {/* Logo */}
      <div className="flex h-16 flex-shrink-0 items-center border-b border-border/50 px-5">
        <Link href="/" className="flex items-center gap-2.5 group" onClick={onNavClick}>
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-primary/30 blur-sm group-hover:bg-primary/50 transition-all" />
            <Gift className="relative h-6 w-6 text-primary" />
          </div>
          <span className="text-lg font-bold tracking-tight">GiveAwayLead</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {links.map((link) => {
          const isActive = pathname === link.href
          return (
            <Link
              key={link.name}
              href={link.href}
              onClick={onNavClick}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <link.icon className="h-4 w-4 flex-shrink-0" />
              {link.name}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-border/50 p-3">
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            Logout
          </button>
        </form>
      </div>
    </>
  )
}

export function Sidebar({ role }: { role: Role }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-border/50 bg-card lg:flex">
      <SidebarNavContent role={role} />
    </aside>
  )
}

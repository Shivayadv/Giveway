"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Gift, LayoutDashboard, Ticket, Trophy, User, LogOut, PlusCircle, Users, BarChart3, CreditCard, ShieldCheck } from "lucide-react"

import { cn } from "@/lib/utils"

export type Role = "user" | "seller" | "admin"

interface SidebarProps {
  role: Role
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()

  const links = {
    user: [
      { name: "Dashboard", href: "/dashboard/user", icon: LayoutDashboard },
      { name: "My Campaigns", href: "/dashboard/user/campaigns", icon: Ticket },
      { name: "My Wins", href: "/dashboard/user/wins", icon: Trophy },
      { name: "Profile", href: "/dashboard/user/profile", icon: User },
    ],
    seller: [
      { name: "Dashboard", href: "/dashboard/seller", icon: LayoutDashboard },
      { name: "Create Campaign", href: "/dashboard/seller/campaigns/new", icon: PlusCircle },
      { name: "My Campaigns", href: "/dashboard/seller/campaigns", icon: Ticket },
      { name: "Leads", href: "/dashboard/seller/leads", icon: Users },
      { name: "Analytics", href: "/dashboard/seller/analytics", icon: BarChart3 },
      { name: "Payments", href: "/dashboard/seller/payments", icon: CreditCard },
    ],
    admin: [
      { name: "Dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
      { name: "Approvals", href: "/dashboard/admin/approvals", icon: ShieldCheck },
      { name: "Campaigns", href: "/dashboard/admin/campaigns", icon: Ticket },
      { name: "Users", href: "/dashboard/admin/users", icon: Users },
      { name: "Fraud Detection", href: "/dashboard/admin/fraud", icon: Trophy },
      { name: "Revenue", href: "/dashboard/admin/revenue", icon: BarChart3 },
    ]
  }

  const currentLinks = links[role]

  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r bg-background lg:flex">
      <div className="flex h-16 items-center flex-shrink-0 px-6 border-b">
        <Link href="/" className="flex items-center gap-2">
          <Gift className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold tracking-tight">GiveAwayLead</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
        {currentLinks.map((link) => {
          const isActive = pathname === link.href
          return (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.name}
            </Link>
          )
        })}
      </nav>
      <div className="p-4 border-t">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Link>
      </div>
    </aside>
  )
}

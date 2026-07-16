import { Sidebar, type Role } from "@/components/layout/sidebar"
import { MobileSidebarButton } from "@/components/layout/mobile-sidebar-button"
import { Gift } from "lucide-react"
import Link from "next/link"

interface DashboardLayoutProps {
  children: React.ReactNode
  role: Role
}

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <Sidebar role={role} />

      {/* Content area */}
      <div className="flex w-full flex-col lg:pl-64">
        {/* Mobile header */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/50 bg-card/80 backdrop-blur-xl px-4 lg:hidden">
          <MobileSidebarButton role={role} />
          <Link href="/" className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            <span className="font-bold tracking-tight">GiveAwayLead</span>
          </Link>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

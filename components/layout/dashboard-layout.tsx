import { Sidebar, type Role } from "@/components/layout/sidebar"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DashboardLayoutProps {
  children: React.ReactNode
  role: Role
}

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-muted/20">
      <Sidebar role={role} />
      <div className="flex w-full flex-col lg:pl-64">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 lg:hidden">
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          <span className="font-semibold tracking-tight">GiveAwayLead</span>
        </header>
        <main className="p-4 md:p-8 lg:p-10">{children}</main>
      </div>
    </div>
  )
}

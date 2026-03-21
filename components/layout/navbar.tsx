import Link from "next/link"
import { Gift, Menu } from "lucide-react"

import { Button } from "@/components/ui/button"

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Gift className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold tracking-tight">GiveAwayLead</span>
        </Link>
        <nav className="hidden md:flex gap-6">
          <Link href="/campaigns" className="text-sm font-medium transition-colors hover:text-primary">
            Campaigns
          </Link>
          <Link href="/#how-it-works" className="text-sm font-medium transition-colors hover:text-primary text-muted-foreground">
            How it Works
          </Link>
          <Link href="/#testimonials" className="text-sm font-medium transition-colors hover:text-primary text-muted-foreground">
            Testimonials
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/dashboard/user" className="hidden md:block">
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link href="/dashboard/seller">
            <Button>Launch Campaign</Button>
          </Link>
          <Button variant="outline" size="icon" className="md:hidden">
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}

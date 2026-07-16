import Link from "next/link"
import { Gift } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getSession } from "@/lib/session"
import { NavbarUserMenu } from "./navbar-user-menu"
import { NavbarMobileMenu } from "./navbar-mobile-menu"

export async function Navbar() {
  const session = await getSession()

  const navLinks = [
    { label: "Campaigns", href: "/campaigns" },
    { label: "How it Works", href: "/#how-it-works" },
    { label: "Testimonials", href: "/#testimonials" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-primary/30 blur-sm group-hover:bg-primary/50 transition-all duration-300" />
            <Gift className="relative h-6 w-6 text-primary" />
          </div>
          <span className="text-xl font-bold tracking-tight">GiveAwayLead</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-4 py-2 text-sm font-medium text-muted-foreground rounded-lg transition-colors hover:text-foreground hover:bg-muted"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <NavbarUserMenu session={session} />
          <NavbarMobileMenu navLinks={navLinks} session={session} />
        </div>
      </div>
    </header>
  )
}

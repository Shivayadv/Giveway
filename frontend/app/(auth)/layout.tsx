import { Gift } from "lucide-react"
import Link from "next/link"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[500px] w-[700px] rounded-full bg-orange-500/10 blur-[100px]" />
        <div className="absolute left-1/4 bottom-0 h-[300px] w-[400px] rounded-full bg-amber-500/8 blur-[80px]" />
      </div>

      {/* Logo */}
      <Link href="/" className="relative flex items-center gap-2.5 mb-8 group">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-primary/30 blur-md group-hover:bg-primary/50 transition-all" />
          <Gift className="relative h-8 w-8 text-primary" />
        </div>
        <span className="text-2xl font-bold tracking-tight">GiveAwayLead</span>
      </Link>

      <div className="relative w-full max-w-md">
        {children}
      </div>

      <p className="relative mt-8 text-xs text-muted-foreground">
        &copy; 2026 GiveAwayLead. All rights reserved.
      </p>
    </div>
  )
}

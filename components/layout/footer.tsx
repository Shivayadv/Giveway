import Link from "next/link"
import { Gift } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-muted/20">
      <div className="container flex flex-col md:flex-row items-center justify-between gap-4 py-10 px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Gift className="h-5 w-5 text-primary" />
          <span className="font-semibold">GiveAwayLead</span>
        </div>
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} GiveAwayLead Platform. All rights reserved.
        </p>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <Link href="#" className="hover:text-foreground">Terms</Link>
          <Link href="#" className="hover:text-foreground">Privacy</Link>
        </div>
      </div>
    </footer>
  )
}

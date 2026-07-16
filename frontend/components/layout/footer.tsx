import Link from "next/link"
import { Gift, Twitter, Instagram, Linkedin } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card/50">
      <div className="container px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-primary" />
              <span className="font-bold text-lg">GiveAwayLead</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              India&apos;s most trusted platform for verified brand giveaways and premium product wins.
            </p>
            <div className="flex gap-3">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Platform */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/campaigns" className="hover:text-primary transition-colors">Browse Campaigns</Link></li>
              <li><Link href="/register" className="hover:text-primary transition-colors">Sign Up Free</Link></li>
              <li><Link href="/#how-it-works" className="hover:text-primary transition-colors">How it Works</Link></li>
              <li><Link href="/#testimonials" className="hover:text-primary transition-colors">Winners</Link></li>
            </ul>
          </div>

          {/* Brands */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">For Brands</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/register" className="hover:text-primary transition-colors">Launch Campaign</Link></li>
              <li><Link href="/dashboard/seller" className="hover:text-primary transition-colors">Brand Dashboard</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Pricing</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Case Studies</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Cookie Policy</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Contact Us</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/50 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} GiveAwayLead Platform. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Made with <span className="text-primary">♥</span> in the USA
          </p>
        </div>
      </div>
    </footer>
  )
}

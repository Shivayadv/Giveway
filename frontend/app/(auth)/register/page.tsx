"use client"

import Link from "next/link"
import { useState, useActionState } from "react"
import { registerAction } from "@/app/actions/auth"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SubmitButton } from "@/components/ui/submit-button"
import { Gift, Trophy, AlertCircle } from "lucide-react"

export default function RegisterPage() {
  const [role, setRole] = useState<"user" | "seller">("user")
  const [state, action] = useActionState(registerAction, undefined)

  return (
    <div className="w-full rounded-2xl border border-border/50 bg-card shadow-2xl shadow-black/20">
      <div className="px-8 pt-8 pb-6 border-b border-border/50">
        <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
        <p className="text-muted-foreground mt-1.5 text-sm">Join 500,000+ users winning premium products every day</p>
      </div>

      <div className="px-8 py-7">
        <div className="grid grid-cols-2 gap-2 mb-6 p-1 bg-muted rounded-xl">
          <button type="button" onClick={() => setRole("user")} className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${role === "user" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            <Trophy className="h-4 w-4" /> Win Prizes
          </button>
          <button type="button" onClick={() => setRole("seller")} className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${role === "seller" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            <Gift className="h-4 w-4" /> Brand Partner
          </button>
        </div>

        <form action={action} className="space-y-4">
          <input type="hidden" name="role" value={role} />

          {state?.errors?.general && (
            <div className="flex items-start gap-2.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              {state.errors.general}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
              <Input id="name" name="name" placeholder="John Smith" className="h-11 rounded-xl bg-muted/40 border-border/60" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-sm font-medium">Phone</Label>
              <Input id="phone" name="phone" type="tel" placeholder="+1 (555) 000-0000" className="h-11 rounded-xl bg-muted/40 border-border/60" required />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-medium">Email address</Label>
            <Input id="email" name="email" type="email" placeholder="you@example.com" className="h-11 rounded-xl bg-muted/40 border-border/60" required />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm font-medium">Password</Label>
            <Input id="password" name="password" type="password" placeholder="Min. 8 characters" className="h-11 rounded-xl bg-muted/40 border-border/60" required />
          </div>

          {role === "seller" && (
            <div className="space-y-4 pt-3 border-t border-border/50">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">Brand Details</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="brand_name" className="text-sm font-medium">Brand Name</Label>
                  <Input id="brand_name" name="brand_name" placeholder="TechCorp India" className="h-11 rounded-xl bg-muted/40 border-border/60" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="brand_category" className="text-sm font-medium">Category</Label>
                  <select id="brand_category" name="brand_category" className="flex h-11 w-full rounded-xl border border-border/60 bg-muted/40 px-3 text-sm focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30">
                    <option value="Electronics">Electronics</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Beauty">Beauty</option>
                    <option value="Food">Food & Beverage</option>
                    <option value="Gaming">Gaming</option>
                    <option value="Home">Home & Living</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="brand_website" className="text-sm font-medium">Website <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <Input id="brand_website" name="brand_website" placeholder="https://yourbrand.com" className="h-11 rounded-xl bg-muted/40 border-border/60" />
              </div>
            </div>
          )}

          <SubmitButton className="w-full h-11 text-base font-semibold rounded-xl mt-1">
            {role === "seller" ? "Register as Brand Partner" : "Create Free Account"}
          </SubmitButton>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-5">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}

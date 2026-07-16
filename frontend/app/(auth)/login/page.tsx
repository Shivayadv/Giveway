"use client"

import Link from "next/link"
import { useActionState } from "react"
import { loginAction } from "@/app/actions/auth"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SubmitButton } from "@/components/ui/submit-button"
import { AlertCircle } from "lucide-react"

export default function LoginPage() {
  const [state, action] = useActionState(loginAction, undefined)

  return (
    <div className="w-full rounded-2xl border border-border/50 bg-card shadow-2xl shadow-black/20">
      {/* Header */}
      <div className="px-8 pt-8 pb-6 border-b border-border/50">
        <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-muted-foreground mt-1.5 text-sm">Sign in to your GiveAwayLead account</p>
      </div>

      {/* Form */}
      <div className="px-8 py-7">
        <form action={action} className="space-y-5">
          {state?.errors?.general && (
            <div className="flex items-start gap-2.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              {state.errors.general}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-medium">Email address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              className="h-11 rounded-xl bg-muted/40 border-border/60 focus:border-primary/60"
              required
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <a href="#" className="text-xs text-primary hover:underline">Forgot password?</a>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              className="h-11 rounded-xl bg-muted/40 border-border/60 focus:border-primary/60"
              required
            />
          </div>

          <SubmitButton className="w-full h-11 text-base font-semibold rounded-xl mt-1">
            Sign In
          </SubmitButton>
        </form>

        <div className="mt-5 text-center">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-primary font-semibold hover:underline">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

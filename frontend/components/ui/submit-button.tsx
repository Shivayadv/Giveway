"use client"

import { useFormStatus } from "react-dom"
import { Button } from "./button"
import { Loader2 } from "lucide-react"

export function SubmitButton({ children, className }: { children: React.ReactNode; className?: string }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className={className}>
      {pending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
      {children}
    </Button>
  )
}

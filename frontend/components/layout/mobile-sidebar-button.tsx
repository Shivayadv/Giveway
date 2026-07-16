"use client"

import { useState } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SidebarNavContent, type Role } from "./sidebar"

export function MobileSidebarButton({ role }: { role: Role }) {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <>
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(true)}>
        <Menu className="h-5 w-5" />
        <span className="sr-only">Open menu</span>
      </Button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={close}
          />

          {/* Drawer */}
          <div className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border/50 bg-card shadow-2xl lg:hidden">
            {/* Close button */}
            <button
              onClick={close}
              className="absolute right-3 top-3.5 rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarNavContent role={role} onNavClick={close} />
          </div>
        </>
      )}
    </>
  )
}

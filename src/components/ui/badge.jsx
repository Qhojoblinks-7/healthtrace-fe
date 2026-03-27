import * as React from "react"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex h-6 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-xl border-0 px-3 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:ring-[3px] focus-visible:ring-ring/50",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-br from-white to-[#E8EDF2] text-primary shadow-[2px_2px_4px_rgba(176,190,197,0.4),-2px_-2px_4px_rgba(255,255,255,0.7)]",
        secondary: "bg-gradient-to-br from-white to-[#E8EDF2] text-secondary shadow-[2px_2px_4px_rgba(176,190,197,0.4),-2px_-2px_4px_rgba(255,255,255,0.7)]",
        destructive: "bg-gradient-to-br from-white to-[#E8EDF2] text-destructive shadow-[2px_2px_4px_rgba(176,190,197,0.4),-2px_-2px_4px_rgba(255,255,255,0.7)]",
        outline: "bg-gradient-to-br from-white to-[#E8EDF2] text-foreground shadow-[2px_2px_4px_rgba(176,190,197,0.4),-2px_-2px_4px_rgba(255,255,255,0.7)]",
        ghost: "hover:bg-muted hover:text-muted-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({ className, variant = "default", ...props }) {
  return (
    <span
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }

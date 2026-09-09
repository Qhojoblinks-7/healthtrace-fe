import * as React from "react";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center rounded-xl border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-br from-white to-[#E8EDF2] dark:from-background dark:to-card text-primary shadow-neu-outer-sm hover:shadow-neu-outer hover:-translate-y-0.5 active:shadow-neu-inner-sm active:translate-y-0",
        outline:
          "border-border bg-gradient-to-br from-white to-[#E8EDF2] dark:from-background dark:to-card text-foreground shadow-neu-outer-sm hover:shadow-neu-outer hover:-translate-y-0.5 active:shadow-neu-inner-sm active:translate-y-0",
        secondary:
          "bg-gradient-to-br from-white to-[#E8EDF2] dark:from-background dark:to-card text-secondary shadow-neu-outer-sm hover:shadow-neu-outer hover:-translate-y-0.5 active:shadow-neu-inner-sm active:translate-y-0",
        ghost: "hover:bg-muted hover:text-foreground",
        destructive:
          "bg-gradient-to-br from-white to-[#E8EDF2] dark:from-background dark:to-card text-destructive shadow-neu-outer-sm hover:shadow-neu-outer hover:-translate-y-0.5 active:shadow-neu-inner-sm active:translate-y-0 focus-visible:border-destructive/40 focus-visible:ring-destructive/20",
      },
      size: {
        default: "h-10 gap-1.5 px-4",
        xs: "h-7 gap-1 rounded-lg px-2.5 text-xs",
        sm: "h-8 gap-1 rounded-lg px-3 text-[0.8rem]",
        lg: "h-11 gap-1.5 px-5",
        icon: "size-10",
        "icon-xs": "size-7 rounded-lg",
        "icon-sm": "size-8 rounded-lg",
        "icon-lg": "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };

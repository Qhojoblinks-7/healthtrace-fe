"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const Switch = React.forwardRef(
  ({ className, checked, onCheckedChange, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange?.(!checked)}
      className={cn(
        "peer inline-flex h-7 w-14 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
        checked
          ? "bg-gradient-to-br from-[#E8EDF2] to-white shadow-[inset_2px_2px_4px_rgba(176,190,197,0.3),inset_-2px_-2px_4px_rgba(255,255,255,0.5)]"
          : "bg-gradient-to-br from-white to-[#E8EDF2] shadow-[4px_4px_8px_rgba(176,190,197,0.4),-4px_-4px_8px_rgba(255,255,255,0.7)]",
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          "pointer-events-none block h-6 w-6 rounded-full bg-gradient-to-br from-white to-[#E8EDF2] shadow-[2px_2px_4px_rgba(176,190,197,0.4),-2px_-2px_4px_rgba(255,255,255,0.7)] ring-0 transition-transform",
          checked ? "translate-x-7" : "translate-x-0",
        )}
      />
    </button>
  ),
);
Switch.displayName = "Switch";

export { Switch };

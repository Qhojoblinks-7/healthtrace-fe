import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full min-w-0 rounded-xl border-0 bg-gradient-to-br from-[#E8EDF2] to-white dark:from-background dark:to-card px-4 py-2 text-base transition-all outline-none shadow-neu-inner-sm file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:shadow-[inset_2px_2px_4px_rgba(176,190,197,0.3),inset_-2px_-2px_4px_rgba(255,255,255,0.5),0_0_0_2px_rgba(76,175,80,0.3)] dark:focus-visible:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3),inset_-2px_-2px_4px_rgba(255,255,255,0.05),0_0_0_2px_rgba(129,140,248,0.3)] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:shadow-[inset_2px_2px_4px_rgba(176,190,197,0.3),inset_-2px_-2px_4px_rgba(255,255,255,0.5),0_0_0_2px_rgba(220,38,38,0.2)] dark:aria-invalid:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3),inset_-2px_-2px_4px_rgba(255,255,255,0.05),0_0_0_2px_rgba(239,68,68,0.2)]",
        className,
      )}
      {...props}
    />
  );
}

export { Input };

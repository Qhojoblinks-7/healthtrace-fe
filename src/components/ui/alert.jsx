import * as React from "react";

import { cn } from "@/lib/utils";

const Alert = React.forwardRef(
  ({ className, variant = "default", ...props }, ref) => (
    <div
      ref={ref}
      role="alert"
      className={cn(
        "relative w-full rounded-xl border-0 bg-gradient-to-br from-white to-[#E8EDF2] p-4 shadow-[4px_4px_8px_rgba(176,190,197,0.4),-4px_-4px_8px_rgba(255,255,255,0.7)] [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
        {
          "bg-gradient-to-br from-red-50 to-red-100 text-destructive shadow-[4px_4px_8px_rgba(220,38,38,0.2),-4px_-4px_8px_rgba(255,255,255,0.7)]":
            variant === "destructive",
          "bg-gradient-to-br from-blue-50 to-blue-100 text-blue-800 shadow-[4px_4px_8px_rgba(33,150,243,0.2),-4px_-4px_8px_rgba(255,255,255,0.7)]":
            variant === "info",
        },
        className,
      )}
      {...props}
    />
  ),
);
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };

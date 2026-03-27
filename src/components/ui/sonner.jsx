import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner";
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({
  ...props
}) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-4" />
        ),
        info: (
          <InfoIcon className="size-4" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4" />
        ),
        error: (
          <OctagonXIcon className="size-4" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "linear-gradient(to bottom right, white, #E8EDF2)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "transparent",
          "--border-radius": "12px",
          "--shadow": "8px 8px 16px rgba(176,190,197,0.5), -8px -8px 16px rgba(255,255,255,0.8)"
        }
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast rounded-xl bg-gradient-to-br from-white to-[#E8EDF2] shadow-[8px_8px_16px_rgba(176,190,197,0.5),-8px_-8px_16px_rgba(255,255,255,0.8)] border-0",
        },
      }}
      {...props} />
  );
}

export { Toaster }

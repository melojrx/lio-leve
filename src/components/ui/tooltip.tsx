import * as React from "react"
import { cn } from "@/lib/utils"

// No-op provider to keep API compatibility
const TooltipProvider = ({ children }: { children: React.ReactNode; delayDuration?: number }) => <>{children}</>

// Lightweight tooltip without Radix dependency
const Tooltip = ({ className, children, ...props }: React.ComponentProps<"div">) => (
  <div className={cn("relative inline-flex group", className)} {...props}>
    {children}
  </div>
)

type TooltipTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean };

const TooltipTrigger = React.forwardRef<HTMLButtonElement, TooltipTriggerProps>(({ className, asChild, children, ...props }, ref) => {
  if (asChild) {
    const { onClick, ...rest } = props;
    return (
      <span
        className={cn("inline-flex items-center focus:outline-none", className)}
        onClick={onClick as React.MouseEventHandler<HTMLSpanElement>}
        {...(rest as React.HTMLAttributes<HTMLSpanElement>)}
      >
        {children}
      </span>
    )
  }
  return (
    <button
      ref={ref}
      className={cn("inline-flex items-center focus:outline-none", className)}
      {...props}
    >
      {children}
    </button>
  )
})
TooltipTrigger.displayName = "TooltipTrigger"

type TooltipContentProps = React.ComponentProps<"div"> & {
  side?: "top" | "right" | "bottom" | "left"
  align?: "start" | "center" | "end"
  sideOffset?: number
}

const TooltipContent = React.forwardRef<HTMLDivElement, TooltipContentProps>(
  ({ className, side, align, sideOffset, ...props }, ref) => (
    <div
      ref={ref}
      role="tooltip"
      className={cn(
        "pointer-events-none absolute z-50 hidden group-hover:block group-focus-within:block top-full left-1/2 -translate-x-1/2 mt-2 rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md",
        className
      )}
      {...props}
    />
  )
)
TooltipContent.displayName = "TooltipContent"

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }

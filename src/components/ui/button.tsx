import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-6 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        next:
          "border border-1.5 border-green bg-none hover:bg-green/20 hover:text-green",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        rsvp:
          "!border-1.5 !border-white bg-white/40 backdrop-blur-md text-white hover:bg-white/80 hover:text-blue hover:!border-blue hover:shadow-intense active:bg-green active:text-white transition-all",
        radpos:
          "!border-1.5 !border-green text-green group-[&:not(.selected)]:hover:bg-green/15 group-[&:not(.selected)]:hover:text-green active:bg-green active:text-white transition-colors",
        radneg:
          "!border-1.5 !border-orange text-orange group-[&:not(.selected)]:hover:bg-orange/15 group-[&:not(.selected)]:hover:text-orange active:bg-orange active:text-white transition-colors",

        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-6 rounded-md px-0 text-xs",
        lg: "h-10 text-lg rounded-md px-8",
        xl: "h-16 rounded-xl px-8 text-xl",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

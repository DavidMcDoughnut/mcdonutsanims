import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const inputVariants = cva(
  "flex w-full bg-transparent transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-blue/60 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "h-9 px-3 py-2",
        form: "rounded-none border-b-1.5 border-blue/40 hover:border-blue focus:border-green px-0 pb-2 pt-1 transition-colors duration-200",
      },
      hasValue: {
        true: "border-green text-green",
        false: "",
      }
    },
    defaultVariants: {
      variant: "default",
      hasValue: false,
    },
  }
)

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  hasValue?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant, hasValue, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ variant, hasValue }), className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }

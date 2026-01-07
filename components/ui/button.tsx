import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils/cn"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 shadow-rustic",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-[#8B2E3D] to-[#7A1F2E] text-white hover:from-[#7A1F2E] hover:to-[#6A1A28] shadow-rustic-lg hover:shadow-rustic-lg hover:scale-[1.02]",
        destructive:
          "bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 shadow-rustic-lg",
        outline:
          "border-2 border-[#8B2E3D]/30 bg-white/80 text-[#8B2E3D] hover:bg-[#8B2E3D]/10 hover:border-[#8B2E3D] hover:shadow-rustic",
        secondary:
          "bg-gradient-to-r from-[#8B2E3D]/10 to-[#8B2E3D]/5 text-[#8B2E3D] border-2 border-[#8B2E3D]/20 hover:from-[#8B2E3D]/20 hover:to-[#8B2E3D]/10",
        ghost: "hover:bg-[#8B2E3D]/10 hover:text-[#8B2E3D] text-[#8B2E3D]/70",
        link: "text-[#8B2E3D] underline-offset-4 hover:underline hover:text-[#7A1F2E]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
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
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }


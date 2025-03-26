
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 border border-primary/20",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 border border-destructive/20",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-secondary/20",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
      isDelete: {
        true: "bg-destructive text-destructive-foreground hover:bg-destructive/90 border border-destructive/20",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      isDelete: false,
    },
    compoundVariants: [
      {
        isDelete: true,
        className: "bg-destructive text-destructive-foreground hover:bg-destructive/90 border border-destructive/20",
      },
    ],
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isDelete?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isDelete = false, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    // Override variant if isDelete is true
    const effectiveVariant = isDelete ? "destructive" : variant;
    
    return (
      <Comp
        className={cn(buttonVariants({ variant: effectiveVariant, size, isDelete, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 active:scale-95 disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                default: "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg", // mapped primary to default
                primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg",
                secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
                outline: "border-2 border-gray-200 hover:border-gray-300 text-gray-700 bg-transparent",
                ghost: "hover:bg-gray-100 text-gray-700",
                destructive: "bg-red-600 text-white hover:bg-red-700 shadow-md hover:shadow-lg",
                link: "text-primary underline-offset-4 hover:underline",
            },
            size: {
                default: "h-11 px-6 text-base", // mapped md to default
                sm: "h-9 px-3 text-sm",
                lg: "h-14 px-8 text-lg",
                icon: "h-10 w-10",
                md: "h-11 px-6 text-base",
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
    isLoading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", asChild = false, isLoading, children, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        // Map old props to new cva variants if needed, though we kept keys mostly same.
        // 'primary' maps to 'primary' in cva now.

        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                disabled={isLoading || props.disabled}
                {...props}
            >
                {isLoading && (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                )}
                {!isLoading && children}
            </Comp>
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }

import React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8d82df] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:translate-y-px',
  {
    variants: {
      variant: {
        default: 'border border-transparent bg-[#4f46b5] text-white shadow-sm hover:bg-[#443ca3] hover:-translate-y-px',
        primary: 'border border-transparent bg-[#4f46b5] text-white shadow-sm hover:bg-[#443ca3] hover:-translate-y-px',
        accent: 'border border-transparent bg-[#ffb61b] text-[#2d235f] shadow-sm hover:bg-[#f0a800] hover:-translate-y-px',
        destructive: 'border border-transparent bg-[#c43d4b] text-white hover:bg-[#ad3441]',
        outline: 'border border-[#ded8ed] bg-white text-[#403951] shadow-sm hover:border-[#c7bee2] hover:bg-[#faf9ff]',
        secondary: 'border border-[#e5e0ef] bg-[#f5f2fa] text-[#4e475d] hover:bg-[#ede9f5]',
        ghost: 'border border-transparent text-[#625b70] hover:bg-[#f1eef8] hover:text-[#332c48]',
        link: 'border-transparent bg-transparent px-0 text-[#4f46b5] hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3 text-xs',
        lg: 'h-11 rounded-lg px-7',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button'
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
})

Button.displayName = 'Button'
export { Button, buttonVariants }

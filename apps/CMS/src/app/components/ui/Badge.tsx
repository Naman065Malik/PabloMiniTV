import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info'
}

const badgeVariants = {
  default: 'bg-[#4f46b5] text-white border-[#4f46b5]',
  secondary: 'bg-[#f1eef8] text-[#5d566b] border-[#e2ddec]',
  destructive: 'bg-[#fff0f2] text-[#c43d4b] border-[#f0cbd1]',
  outline: 'bg-white text-[#514a5e] border-[#ddd7e9]',
  success: 'bg-[#eaf8f0] text-[#198754] border-[#cdebd9]',
  warning: 'bg-[#fff6df] text-[#a66a00] border-[#f3dfab]',
  info: 'bg-[#edf5ff] text-[#2864a5] border-[#d1e3f8]',
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(({ className, variant = 'default', ...props }, ref) => (
  <span ref={ref} className={cn('inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold', badgeVariants[variant], className)} {...props} />
))
Badge.displayName = 'Badge'
export { Badge, badgeVariants }

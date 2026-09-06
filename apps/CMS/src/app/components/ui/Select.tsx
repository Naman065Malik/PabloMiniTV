import { forwardRef, type SelectHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {}

const Select = forwardRef<HTMLSelectElement, SelectProps>(({ className, ...props }, ref) => (
  <select
    ref={ref}
    className={cn('h-10 w-full rounded-lg border border-[#ddd7e9] bg-white px-3 text-sm text-[#302a42] shadow-sm outline-none focus:border-[#8d82df] focus:ring-3 focus:ring-[#8d82df]/15 disabled:cursor-not-allowed disabled:bg-[#f5f3f8] disabled:opacity-60', className)}
    {...props}
  />
))
Select.displayName = 'Select'
export { Select }

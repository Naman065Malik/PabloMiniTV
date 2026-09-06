import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

const Input = forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    className={cn('h-10 w-full rounded-lg border border-[#ddd7e9] bg-white px-3 text-sm text-[#302a42] shadow-sm outline-none placeholder:text-[#aaa3b3] focus:border-[#8d82df] focus:ring-3 focus:ring-[#8d82df]/15 disabled:cursor-not-allowed disabled:bg-[#f5f3f8] disabled:opacity-60', className)}
    {...props}
  />
))
Input.displayName = 'Input'
export { Input }

import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn('min-h-20 w-full resize-y rounded-lg border border-[#ddd7e9] bg-white px-3 py-2.5 text-sm text-[#302a42] shadow-sm outline-none placeholder:text-[#aaa3b3] focus:border-[#8d82df] focus:ring-3 focus:ring-[#8d82df]/15 disabled:cursor-not-allowed disabled:bg-[#f5f3f8] disabled:opacity-60', className)}
    {...props}
  />
))
Textarea.displayName = 'Textarea'
export { Textarea }

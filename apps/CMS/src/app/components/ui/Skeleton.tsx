import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> { count?: number }

export function Skeleton({ count = 1, className, ...props }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={cn('mb-3 h-12 animate-pulse rounded-lg bg-[#ebe8f4]', className)} {...props} />
      ))}
    </>
  )
}

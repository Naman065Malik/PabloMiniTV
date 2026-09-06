// Skeleton loading component.
import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  count?: number
}

export function Skeleton({ count = 1, className, ...props }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'animate-pulse rounded-md bg-muted h-4 mb-2',
            className
          )}
          {...props}
        />
      ))}
    </>
  )
}

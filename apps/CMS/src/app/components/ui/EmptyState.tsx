// Empty state component.
import { type HTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  message: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ message, description, action, className, ...props }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)} {...props}>
      <div className="mb-4 text-6xl">📭</div>
      <h3 className="mb-2 text-lg font-medium text-foreground">{message}</h3>
      {description && <p className="text-muted-foreground mb-4">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
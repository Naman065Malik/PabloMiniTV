// Generic content table component.
import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export interface TableColumn {
  header: string
  accessorKey: string
  width?: string
  sortable?: boolean
}

export interface TableProps extends HTMLAttributes<HTMLDivElement> {
  data?: unknown[]
  columns?: TableColumn[]
}

export function Table({ data = [], columns = [], className, ...props }: TableProps) {
  if (!columns.length) {
    return null
  }

  return (
    <div className={cn('overflow-x-auto', className)} {...props}>
      <table className="min-w-full divide-y divide-border">
        <thead>
          <tr>
            {columns.map(col => (
              <th
                key={col.accessorKey}
                className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                style={{ width: col.width }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {(data as Record<string, unknown>[]).map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map(col => (
                <td key={col.accessorKey} className="px-4 py-3 text-sm">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {(row as any)[col.accessorKey] ?? '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

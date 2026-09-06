// Filter bar hooks and shared filter state.
import { useState, useCallback } from 'react'

export interface Filters {
  section?: string
  status?: string
  language?: string
  show?: string
}

export function useFilters() {
  const [filters, setFilters] = useState<Filters>({})

  const updateFilter = useCallback((key: keyof Filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined,
    }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({})
  }, [])

  return { filters, updateFilter, clearFilters }
}

export interface FilterBarProps {
  className?: string
}

export function FilterBar({ className }: FilterBarProps) {
  const { filters, updateFilter, clearFilters } = useFilters()

  return (
    <div className={className} data-filter-bar>
      <select
        value={filters.section ?? ''}
        onChange={e => updateFilter('section', e.target.value)}
        className="border rounded px-2 py-1 text-sm"
      >
        <option value="">All Sections</option>
        <option value="movies">Movies</option>
        <option value="series">Series</option>
      </select>

      <select
        value={filters.status ?? ''}
        onChange={e => updateFilter('status', e.target.value)}
        className="border rounded px-2 py-1 text-sm"
      >
        <option value="">All Statuses</option>
        <option value="draft">Draft</option>
        <option value="published">Published</option>
      </select>

      <select
        value={filters.language ?? ''}
        onChange={e => updateFilter('language', e.target.value)}
        className="border rounded px-2 py-1 text-sm"
      >
        <option value="">All Languages</option>
        <option value="en">English</option>
        <option value="es">Spanish</option>
        <option value="fr">French</option>
      </select>

      <button onClick={clearFilters} className="text-sm text-muted-foreground hover:underline">
        Clear
      </button>
    </div>
  )
}

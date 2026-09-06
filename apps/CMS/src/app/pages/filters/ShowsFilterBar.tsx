// Shows-specific filter bar.
import type { Filters } from './FilterBar'

export interface ShowsFilterBarProps {
  filters: Filters
  onFilterChange: (filters: Filters) => void
  className?: string
}

export function ShowsFilterBar({ filters, onFilterChange, className }: ShowsFilterBarProps) {
  const handleChange = (key: keyof Filters, value: string) => {
    onFilterChange({ ...filters, [key]: value || undefined })
  }

  return (
    <div className={className} data-shows-filter-bar>
      <select
        value={filters.section ?? ''}
        onChange={e => handleChange('section', e.target.value)}
        className="border rounded px-2 py-1 text-sm"
      >
        <option value="">All Sections</option>
        <option value="movies">Movies</option>
        <option value="series">Series</option>
      </select>

      <select
        value={filters.status ?? ''}
        onChange={e => handleChange('status', e.target.value)}
        className="border rounded px-2 py-1 text-sm"
      >
        <option value="">All Statuses</option>
        <option value="draft">Draft</option>
        <option value="published">Published</option>
      </select>

      <select
        value={filters.language ?? ''}
        onChange={e => handleChange('language', e.target.value)}
        className="border rounded px-2 py-1 text-sm"
      >
        <option value="">All Languages</option>
        <option value="en">English</option>
        <option value="es">Spanish</option>
        <option value="fr">French</option>
      </select>
    </div>
  )
}

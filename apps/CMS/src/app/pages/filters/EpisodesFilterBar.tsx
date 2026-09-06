// Episodes-specific filter bar.
import type { Filters } from './FilterBar'

export interface EpisodesFilterBarProps {
  filters: Filters
  onFilterChange: (filters: Filters) => void
  className?: string
}

export function EpisodesFilterBar({ filters, onFilterChange, className }: EpisodesFilterBarProps) {
  const handleChange = (key: keyof Filters, value: string) => {
    onFilterChange({ ...filters, [key]: value || undefined })
  }

  return (
    <div className={className} data-episodes-filter-bar>
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

      <input
        type="text"
        placeholder="Filter by show..."
        value={filters.show ?? ''}
        onChange={e => handleChange('show', e.target.value)}
        className="border rounded px-2 py-1 text-sm"
      />
    </div>
  )
}

import { apiFetch } from './client'

export type ContentStatus = 'draft' | 'published' | 'archived'

export interface Show {
  id: number
  title: string
  slug: string
  description: string | null
  section: string | null
  category: string | null
  status: ContentStatus
  created_at: string
  updated_at: string
}

export interface ShowListResponse {
  items: Show[]
  page: number
  page_size: number
  total: number
}

export interface ShowInput {
  title: string
  description?: string
  section?: string
  category?: string
}

export interface ShowFilters {
  page?: number
  pageSize?: number
  search?: string
  section?: string
  status?: ContentStatus
}

function token() {
  return window.localStorage.getItem('pablo-mini-tv-auth-token')
}

export function listShows(filters: ShowFilters = {}) {
  const params = new URLSearchParams()
  params.set('page', String(filters.page ?? 1))
  params.set('page_size', String(filters.pageSize ?? 20))
  if (filters.search) params.set('search', filters.search)
  if (filters.section) params.set('section', filters.section)
  if (filters.status) params.set('status', filters.status)
  return apiFetch<ShowListResponse>(`/admin/shows?${params}`, { token: token() })
}

export function getShow(showId: string) {
  return apiFetch<Show>(`/admin/shows/${showId}`, { token: token() })
}

export function createShow(input: ShowInput) {
  return apiFetch<Show>('/admin/shows', { method: 'POST', token: token(), body: JSON.stringify(input) })
}

export function deleteShow(showId: number) {
  return apiFetch<void>(`/admin/shows/${showId}`, { method: 'DELETE', token: token() })
}

export function updateShow(showId: number, input: Partial<ShowInput>) {
  return apiFetch<Show>(`/admin/shows/${showId}`, { method: 'PATCH', token: token(), body: JSON.stringify(input) })
}

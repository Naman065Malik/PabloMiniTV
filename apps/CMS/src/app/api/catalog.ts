import { apiFetch } from './client'

export interface PublishRun {
  id: number
  created_by: number
  status: 'draft' | 'queued' | 'processing' | 'completed' | 'failed'
  created_at?: string
  started_at?: string | null
  completed_at?: string | null
  shows_count?: number
  episodes_count?: number
}

function token() { return window.localStorage.getItem('pablo-mini-tv-auth-token') }
export function listPublishRuns() { return apiFetch<PublishRun[]>('/admin/publish-runs', { token: token() }) }
export function publishCatalogue(showIds: number[]) { return apiFetch<{ run_id: number; status: string }>('/admin/catalog/publish', { method: 'POST', token: token(), body: JSON.stringify(showIds) }) }

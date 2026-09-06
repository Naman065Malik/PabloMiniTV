import { apiFetch } from './client'

export interface ValidationIssue {
  entity_type?: string
  entity_id?: number
  entity?: string
  title?: string
  message?: string
  reason?: string
  explanation?: string
}

export interface ValidationReport {
  total_shows: number
  valid_shows: number
  invalid_shows: number
  total_episodes: number
  valid_episodes: number
  invalid_episodes: number
  errors: ValidationIssue[]
  warnings: ValidationIssue[]
  last_publish_failure?: {
    run_id: number
    message: string
    created_at?: string
  } | null
}

function token() { return window.localStorage.getItem('pablo-mini-tv-auth-token') }
export function getValidationReport() { return apiFetch<ValidationReport>('/admin/validation/validation-report', { token: token() }) }

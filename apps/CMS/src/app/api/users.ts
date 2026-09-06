import { apiFetch } from './client'

export type UserRole = 'admin' | 'editor'

export interface ManagedUser {
  id: number
  email: string
  role: UserRole
  is_active: boolean
  created_at: string
}

export interface UserInput {
  email: string
  password: string
  role: UserRole
}

function token() { return window.localStorage.getItem('pablo-mini-tv-auth-token') }

export function listUsers() {
  return apiFetch<ManagedUser[]>('/admin/users', { token: token() })
}

export function createUser(input: UserInput) {
  return apiFetch<ManagedUser>('/admin/users', { method: 'POST', token: token(), body: JSON.stringify(input) })
}

export function deleteUser(userId: number) {
  return apiFetch<void>(`/admin/users/${userId}`, { method: 'DELETE', token: token() })
}

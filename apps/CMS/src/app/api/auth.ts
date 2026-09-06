import { apiFetch } from './client'

export interface AuthToken {
  access_token: string
  token_type: string
}

export interface ApiUser {
  id: number
  email: string
  role: 'admin' | 'editor'
  is_active: boolean
}

export function loginRequest(email: string, password: string) {
  const formData = new URLSearchParams()

  formData.append('username', email)
  formData.append('password', password)

  return apiFetch<AuthToken>('/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString(),
  })
}

export function getCurrentUser(token: string) {
  return apiFetch<ApiUser>('/auth/me', { token })
}

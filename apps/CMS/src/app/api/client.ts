const BASE_URL = '/api'

export interface ApiOptions extends RequestInit {
  token?: string | null
}

export async function apiFetch<T>(endpoint: string, { token, headers, ...options }: ApiOptions = {}): Promise<T> {
  const isFormData = options.body instanceof FormData
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...(options.body && !isFormData ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  })

  if (response.status === 204) {
    return undefined as T
  }

  if (!response.ok) {
    const errorData: { detail?: string } = await response.json().catch(() => ({}))
    if (response.status === 401 && !endpoint.endsWith('/auth/login')) {
      window.localStorage.removeItem('pablo-mini-tv-auth-token')
      window.location.assign('/admin/login')
    }
    throw new Error(errorData.detail ?? 'API request failed')
  }

  return response.json() as Promise<T>
}

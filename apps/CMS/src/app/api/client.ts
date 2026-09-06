const BASE_URL = '/api'

export interface ApiOptions extends RequestInit {
  token?: string | null
}

export async function apiFetch<T>(endpoint: string, { token, headers, ...options }: ApiOptions = {}): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  })

  if (response.status === 204) {
    return undefined as T
  }

  if (!response.ok) {
    const errorData: { detail?: string } = await response.json().catch(() => ({}))
    throw new Error(errorData.detail ?? 'API request failed')
  }

  return response.json() as Promise<T>
}

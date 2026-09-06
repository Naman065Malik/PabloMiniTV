import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { getCurrentUser, loginRequest, type ApiUser } from '../api/auth'

const AUTH_TOKEN_KEY = 'pablo-mini-tv-auth-token'
export type User = Pick<ApiUser, 'id' | 'email' | 'role'>

interface AuthContextValue {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)
function storedToken() { return window.localStorage.getItem(AUTH_TOKEN_KEY) }

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(storedToken)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(() => Boolean(storedToken()))

  useEffect(() => {
    if (!token) return
    void getCurrentUser(token)
      .then(({ id, email, role }) => setUser({ id, email, role }))
      .catch(() => { window.localStorage.removeItem(AUTH_TOKEN_KEY); setToken(null) })
      .finally(() => setIsLoading(false))
  }, [token])

  const login = useCallback(async (email: string, password: string) => {
    const { access_token } = await loginRequest(email, password)
    const { id, email: userEmail, role } = await getCurrentUser(access_token)
    window.localStorage.setItem(AUTH_TOKEN_KEY, access_token)
    setToken(access_token)
    setUser({ id, email: userEmail, role })
    setIsLoading(false)
  }, [])

  const logout = useCallback(() => {
    window.localStorage.removeItem(AUTH_TOKEN_KEY)
    setToken(null)
    setUser(null)
    setIsLoading(false)
  }, [])

  const value = useMemo(() => ({ user, token, isAuthenticated: Boolean(user), isLoading, login, logout }), [user, token, isLoading, login, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

// CMS login page.
import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || '/admin/dashboard'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-branding">
          <h1>PabloMiniTV</h1>
          <p>Content Management System</p>
          <div className="illustration">
            {/* TODO: Add mascot illustration */}
            <div className="placeholder-illustration">🐶 + 🎭</div>
          </div>
          <div className="tagline">
            <p>Create. Manage. Publish.</p>
            <p>Keep every story ready for little minds.</p>
          </div>
        </div>

        <div className="login-form-wrapper">
          <div className="login-form">
            <h2>Welcome back</h2>
            <p className="subtitle">Sign in to manage the PabloMiniTV catalogue.</p>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  placeholder="admin@peblo.tv"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="login-help">
              <p>Demo credentials:</p>
              <p><strong>admin@peblo.local</strong> / admin-password (admin role)</p>
              <p><strong>editor@peblo.local</strong> / editor-password (editor role)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
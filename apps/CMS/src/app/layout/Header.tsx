import { Bell, UserRound } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export function Header() {
  const { user } = useAuth()
  if (!user) return null

  return (
    <header className="admin-header">
      <div className="header-context">
        <div className="brand-mark" aria-hidden="true">
          <UserRound />
        </div>
        <div>
          <span className="header-kicker">PabloMiniTV CMS</span>
          <h2>Content Management</h2>
        </div>
      </div>
      <div className="header-context">
        <Bell size={17} aria-hidden="true" color="#817a93" />
        <span className="header-email">{user.email}</span>
        <span className="role-pill">{user.role}</span>
      </div>
    </header>
  )
}

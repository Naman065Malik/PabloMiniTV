import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  if (!user) return null

  const navItems = [
    { icon: '🏠', label: 'Dashboard', href: '/admin/dashboard', active: location.pathname === '/admin/dashboard' },
    { type: 'section', label: 'CONTENT' as const },
    { icon: '📺', label: 'Shows', href: '/admin/shows', active: location.pathname.startsWith('/admin/shows') && !location.pathname.includes('/edit') && location.pathname !== '/admin/shows/new' },
    { icon: '🎬', label: 'Episodes', href: '/admin/episodes', active: location.pathname.startsWith('/admin/episodes') && !location.pathname.includes('/edit') && location.pathname !== '/admin/episodes/new' },
    { type: 'section', label: 'PUBLISHING' as const },
    { icon: '🚀', label: 'Publish', href: '/admin/publish', active: location.pathname === '/admin/publish' },
  ]

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-header">
        <h1>PabloMiniTV</h1>
        <p>CMS</p>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item, index) => {
          if ('type' in item && item.type === 'section') {
            return (
              <div key={index} className="nav-section">
                <span className="section-label">{item.label}</span>
              </div>
            )
          }

          return (
            <a
              key={index}
              href={item.href}
              onClick={(e) => { e.preventDefault(); navigate(item.href || '/admin') }}
              className={`nav-item ${item.active ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </a>
          )
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-name">{user.email.split('@')[0]}</div>
          <div className="user-role">{user.role}</div>
        </div>
        <button onClick={logout} className="logout-btn">
          Logout
        </button>
      </div>
    </aside>
  )
}

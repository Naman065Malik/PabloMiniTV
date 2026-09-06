import { BarChart3, BookOpen, Film, LayoutDashboard, LogOut, Rocket, Tv } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
  { section: 'CONTENT' },
  { icon: Tv, label: 'Shows', href: '/admin/shows' },
  { icon: Film, label: 'Episodes', href: '/admin/episodes' },
  { section: 'PUBLISHING' },
  { icon: Rocket, label: 'Publish', href: '/admin/publish' },
]

export function Sidebar() {
  const { user, logout } = useAuth()
  if (!user) return null

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="brand-mark" aria-hidden="true"><BookOpen /></div>
          <div>
            <h1>PabloMiniTV</h1>
            <p>Content Studio</p>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="CMS navigation">
        {navItems.map((item, index) => {
          if ('section' in item) {
            return <div key={item.section} className="nav-section"><span className="section-label">{item.section}</span></div>
          }

          const Icon = item.icon
          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              end={item.href === '/admin/dashboard'}
            >
              <span className="nav-icon"><Icon /></span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar" aria-hidden="true">{user.email.charAt(0).toUpperCase()}</div>
          <div className="user-details">
            <div className="user-name">{user.email.split('@')[0]}</div>
            <div className="user-role">{user.role}</div>
          </div>
        </div>
        <button type="button" onClick={logout} className="logout-btn">
          <LogOut size={15} aria-hidden="true" /> <span>Sign out</span>
        </button>
      </div>
    </aside>
  )
}

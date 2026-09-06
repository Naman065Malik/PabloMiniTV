import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { useAuth } from '../hooks/useAuth'

export function AdminLayout() {
  const { user } = useAuth()
  if (!user) return null

  return (
    <div className="admin-shell">
      <Sidebar />
      <div className="admin-main">
        <Header />
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

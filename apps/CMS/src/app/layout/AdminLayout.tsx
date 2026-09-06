import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { useAuth } from '../hooks/useAuth'

export function AdminLayout() {
  const { user } = useAuth()
  if (!user) return null;

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-[260px]">
        <Header />
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

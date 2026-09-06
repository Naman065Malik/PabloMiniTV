import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()
  if (isLoading) return <div className="loading-screen">Loading your workspace…</div>
  if (!isAuthenticated) return <Navigate to="/admin/login" state={{ from: location }} replace />
  return <Outlet />
}

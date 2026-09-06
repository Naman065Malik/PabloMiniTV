import { useAuth } from '../hooks/useAuth'

export function Header() {
  const { user } = useAuth()
  if (!user) return null
  return (
    <header className="admin-header">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-semibold">Content Management</h2>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">{user.email}</span>
        <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full capitalize">
          {user.role}
        </span>
      </div>
    </header>
  )
}

import { useState, type FormEvent } from 'react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { useAuth } from '../../hooks/useAuth'
import { createUser, deleteUser, listUsers, type ManagedUser, type UserRole } from '../../api/users'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

const usersKey = ['managed-users'] as const

export function UsersPage() {
  const { user: currentUser } = useAuth()
  const queryClient = useQueryClient()
  const users = useQuery({ queryKey: usersKey, queryFn: listUsers })
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('editor')
  const [formError, setFormError] = useState('')
  const create = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      setEmail('')
      setPassword('')
      setRole('editor')
      setFormError('')
      void queryClient.invalidateQueries({ queryKey: usersKey })
    },
    onError: error => setFormError(error.message),
  })
  const remove = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: usersKey }),
  })

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    create.mutate({ email: email.trim(), password, role })
  }

  return (
    <section className="space-y-8">
      <div><p className="eyebrow">Administration</p><h1 className="page-title">User management</h1><p className="page-description">Create and manage the people who can access the CMS.</p></div>
      <section className="user-management-grid">
        <form className="table-card user-create-form" onSubmit={handleSubmit}>
          <div className="section-heading"><div><h2>Create user</h2><p>Choose an editor or administrator role.</p></div></div>
          <div className="user-form-fields">
            <label>Email<Input type="email" required value={email} onChange={event => setEmail(event.target.value)} /></label>
            <label>Temporary password<Input type="password" required minLength={8} value={password} onChange={event => setPassword(event.target.value)} /></label>
            <label>Role<Select value={role} onChange={event => setRole(event.target.value as UserRole)}><option value="editor">Editor</option><option value="admin">Admin</option></Select></label>
            {formError && <p className="form-error" role="alert">{formError}</p>}
            <Button type="submit" variant="accent" disabled={create.isPending}>{create.isPending ? 'Creating…' : 'Create user'}</Button>
          </div>
        </form>
      </section>
      <section className="table-card">
        <div className="section-heading"><div><h2>Users</h2><p>Admin accounts are protected from deletion.</p></div></div>
        {users.isLoading ? <p className="permission-message">Loading users…</p> : users.error ? <p className="form-error m-4" role="alert">{users.error.message}</p> : <table className="content-table"><thead><tr><th>Email</th><th>Role</th><th>Status</th><th>Created</th><th></th></tr></thead><tbody>{users.data?.map(managedUser => <UserRow key={managedUser.id} user={managedUser} currentUserId={currentUser?.id} onDelete={id => remove.mutate(id)} isDeleting={remove.isPending} />)}</tbody></table>}
      </section>
    </section>
  )
}

function UserRow({ user, currentUserId, onDelete, isDeleting }: { user: ManagedUser; currentUserId?: number; onDelete: (id: number) => void; isDeleting: boolean }) {
  const protectedUser = user.role === 'admin' || user.id === currentUserId
  return <tr><td><strong>{user.email}</strong></td><td><span className="status status-published">{user.role}</span></td><td>{user.is_active ? 'Active' : 'Inactive'}</td><td>{new Date(user.created_at).toLocaleDateString()}</td><td>{protectedUser ? <span className="cell-subtitle">Protected</span> : <Button size="sm" variant="outline" onClick={() => { if (confirm(`Delete ${user.email}?`)) onDelete(user.id) }} disabled={isDeleting}>Delete</Button>}</td></tr>
}

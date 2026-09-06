import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { Skeleton } from '../../components/ui/Skeleton'
import { useShows, useUpdateShow } from '../../queries/useShows'
import { useQueryClient } from '@tanstack/react-query'

export function ShowsPage() {
  const { data, error, isLoading, refetch } = useShows()
  const queryClient = useQueryClient()
  const updateShow = useUpdateShow()

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Content library</p>
          <h1 className="page-title">Shows</h1>
        </div>
        <Button asChild variant="accent"><Link to="/admin/shows/new">+ Add Show</Link></Button>
      </div>
      {isLoading ? <Skeleton count={7} /> : error ? (
        <EmptyState message="We couldn't load shows" description={error.message} action={<Button onClick={() => refetch()}>Try again</Button>} />
      ) : !data?.items.length ? (
        <EmptyState message="No shows yet" description="Create your first show to begin building the catalogue." action={<Button asChild><Link to="/admin/shows/new">Add Show</Link></Button>} />
      ) : (
        <div className="table-card overflow-x-auto">
          <table className="content-table">
            <thead><tr><th>Show title</th><th>Section</th><th>Category</th><th>Status</th><th>Updated</th><th></th></tr></thead>
            <tbody>
              {data.items.map(show => (
                <tr key={show.id}>
                  <td>
                    <strong>{show.title}</strong>
                    <span className="cell-subtitle">{show.description || 'No synopsis yet'}</span>
                  </td>
                  <td>{show.section || '—'}</td>
                  <td>{show.category || '—'}</td>
                  <td><span className={`status status-${show.status}`}>{show.status}</span></td>
                  <td>{new Date(show.updated_at).toLocaleDateString()}</td>
                  <td><div className="flex gap-2"><Button asChild size="sm" variant="outline"><Link to={`/admin/shows/${show.id}`}>Manage</Link></Button><Button size="sm" variant="outline" onClick={() => { const nextStatus = show.status === "published" ? "draft" : "published"; const action = nextStatus === "published" ? "Publish" : "Unpublish"; if (confirm(`${action} this show? This updates status to ${nextStatus}.`)) updateShow.mutate({ id: show.id, input: { status: nextStatus } }, { onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["shows"] }); refetch() } }) }} disabled={updateShow.isPending}>{updateShow.isPending ? "Updating…" : show.status === "published" ? "Unpublish" : "Publish"}</Button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="table-meta">Showing {data.items.length} of {data.total} shows</p>
        </div>
      )}
    </section>
  )
}

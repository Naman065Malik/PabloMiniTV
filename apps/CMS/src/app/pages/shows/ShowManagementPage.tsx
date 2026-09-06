import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { Skeleton } from '../../components/ui/Skeleton'
import { useShow, useDeleteShow } from '../../queries/useShows'
import { useSeasons, useCreateSeason, useUpdateSeason, useDeleteSeason } from '../../queries/useEpisodes'

export function ShowManagementPage() {
  const { showId } = useParams()
  const navigate = useNavigate()
  const show = useShow(showId ?? '')
  const seasons = useSeasons(Number(showId))
  const deleteShow = useDeleteShow()
  const [confirmDeleteShow, setConfirmDeleteShow] = useState(false)
  const createSeason = useCreateSeason()
  const updateSeason = useUpdateSeason()
  const deleteSeason = useDeleteSeason()
  const [addOpen, setAddOpen] = useState(false)
  const [newNumber, setNewNumber] = useState('')
  const [newTitle, setNewTitle] = useState('')
  const [editSeasonId, setEditSeasonId] = useState<number | null>(null)
  const [editNumber, setEditNumber] = useState('')
  const [editTitle, setEditTitle] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!showId) return
    createSeason.mutate({ showId: Number(showId), input: { season_number: Number(newNumber), title: newTitle || undefined } }, { onSuccess: () => { setAddOpen(false); setNewNumber(''); setNewTitle(''); } })
  }

  const startEdit = (s: { id: number; season_number: number; title: string | null }) => {
    setEditSeasonId(s.id)
    setEditNumber(String(s.season_number))
    setEditTitle(s.title ?? '')
  }

  const saveEdit = (id: number) => {
    updateSeason.mutate({ id, input: { season_number: Number(editNumber), title: editTitle || undefined } }, { onSuccess: () => setEditSeasonId(null) })
  }

  return (
    <section className="space-y-6">
      <div>
        <button onClick={() => navigate('/admin/shows')} className="text-sm text-blue-600 hover:underline">← Back to Shows</button>
        {show.isLoading ? <Skeleton count={2} /> : show.error ? (
          <EmptyState message="Couldn't load show" description={show.error.message} action={<Button onClick={() => show.refetch()}>Retry</Button>} />
        ) : show.data ? (
          <div className="mt-2">
            <h1 className="page-title">{show.data.title}</h1>
            <p className="text-sm text-gray-500">{show.data.category || ''} · {show.data.section || ''} · Status: {show.data.status}</p>
            <div className="flex gap-2 mt-3">
              <Button asChild size="sm" variant="outline"><Link to={`/admin/shows/${show.data.id}/edit`}>Edit Show</Link></Button>
              <Button size="sm" variant="outline" onClick={() => setConfirmDeleteShow(true)}>Delete Show</Button>
            </div>
            {confirmDeleteShow && (
              <div className="mt-3 p-4 bg-red-50 border border-red-200 rounded text-sm" role="dialog" aria-modal="true" aria-label="Delete show confirmation">
                <p><strong>Delete Show?</strong></p>
                <p>Are you sure you want to delete "{show.data.title}"? This action cannot be undone.</p>
                <div className="flex gap-2 mt-2">
                  <Button size="sm" variant="outline" onClick={() => setConfirmDeleteShow(false)} disabled={deleteShow.isPending}>Cancel</Button>
                  <Button size="sm" variant="outline" onClick={() => deleteShow.mutate(Number(showId), { onSuccess: () => { setConfirmDeleteShow(false); navigate('/admin/shows') } })} disabled={deleteShow.isPending}>{deleteShow.isPending ? 'Deleting…' : 'Delete Show'}</Button>
                </div>
                {deleteShow.isError && <p className="text-red-600 text-xs mt-1">Unable to delete this show. Please try again.</p>}
              </div>
            )}
          </div>
        ) : null}
      </div>

      <section>
        <div className="flex items-center justify-between gap-4"><h2 className="text-xl font-semibold">Seasons</h2><Button size="sm" onClick={() => setAddOpen(true)}>+ Add Season</Button></div>
        {addOpen && (
          <form onSubmit={handleCreate} className="mt-3 p-4 bg-gray-50 rounded border space-y-2">
            <label>Season number <input type="number" required value={newNumber} onChange={e => setNewNumber(e.target.value)} className="border rounded px-2 py-1 text-sm" /></label>
            <label>Title <input value={newTitle} onChange={e => setNewTitle(e.target.value)} className="border rounded px-2 py-1 text-sm" placeholder="Optional" /></label>
            <div className="flex gap-2"><Button type="submit" disabled={createSeason.isPending}>Save</Button><Button type="button" variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button></div>
            {createSeason.error && <p className="text-red-600 text-sm">{createSeason.error.message}</p>}
          </form>
        )}
        {seasons.isLoading ? <Skeleton count={3} /> : seasons.error ? (
          <EmptyState message="Couldn't load seasons" description={seasons.error.message} />
        ) : !seasons.data?.length ? (
          <EmptyState message="No seasons yet" description="Add a season to start organizing episodes." action={<Button onClick={() => setAddOpen(true)}>+ Add Season</Button>} />
        ) : (
          <div className="table-card overflow-x-auto mt-3">
            <table className="content-table"><thead><tr><th>Season</th><th>Title</th><th>Episodes</th><th></th></tr></thead>
              <tbody>
                {seasons.data.map(s => (
                  <tr key={s.id}>
                    <td>
                      <strong>{s.season_number === 0 ? 'Season 0 — Trailer Season' : `Season ${s.season_number}`}</strong>
                    </td>
                    <td>{s.title || '—'}</td>
                    <td>—</td>
                    <td>
                      <div className="flex gap-2">
                        {editSeasonId === s.id ? (
                          <>
                            <input type="number" value={editNumber} onChange={e => setEditNumber(e.target.value)} className="border rounded px-1 text-sm w-20" />
                            <input value={editTitle} onChange={e => setEditTitle(e.target.value)} className="border rounded px-1 text-sm w-32" />
                            <Button size="sm" onClick={() => saveEdit(s.id)} disabled={updateSeason.isPending}>Save</Button>
                            <Button size="sm" variant="outline" onClick={() => setEditSeasonId(null)}>Cancel</Button>
                          </>
                        ) : (
                          <>
                            <Button size="sm" variant="outline" onClick={() => startEdit(s)}>Edit</Button>
                            <Button size="sm" asChild variant="outline"><Link to={`/admin/episodes?showId=${showId}&seasonId=${s.id}`}>View Episodes</Link></Button>
                            <Button size="sm" variant="outline" onClick={() => setConfirmDeleteId(s.id)}>Delete</Button>
                          </>
                        )}
                      </div>
                      {confirmDeleteId === s.id && (
                        <div className="mt-1 text-sm">
                          <span>Delete Season {s.season_number}? This removes episodes too.</span>
                          <Button size="sm" variant="outline" onClick={() => deleteSeason.mutate(s.id, { onSuccess: () => setConfirmDeleteId(null) })} disabled={deleteSeason.isPending}>Yes</Button>
                          <Button size="sm" variant="outline" onClick={() => setConfirmDeleteId(null)}>No</Button>
                        </div>
                      )}
                      {deleteSeason.isError && confirmDeleteId === s.id && <p className="form-error text-xs">Delete failed.</p>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  )
}

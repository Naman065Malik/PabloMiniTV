import { useState, useMemo } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { Skeleton } from '../../components/ui/Skeleton'
import { useShows } from '../../queries/useShows'
import { useSeasons, useEpisodes, useDeleteEpisode } from '../../queries/useEpisodes'

export function EpisodesPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const shows = useShows()
  const urlShow = parseInt(searchParams.get('showId') || '', 10) || ''
  const urlSeason = parseInt(searchParams.get('seasonId') || '', 10) || ''
  const showId = urlShow
  const seasonId = urlSeason
  const [search, setSearch] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)
  const seasons = useSeasons(Number(showId) || 0)
  const episodes = useEpisodes(Number(seasonId) || 0)
  const deleteEpisode = useDeleteEpisode()

  const filtered = useMemo(() => {
    if (!episodes.data) return []
    const q = search.toLowerCase()
    return episodes.data.filter(ep => {
      if (!q) return true
      return (ep.title || '').toLowerCase().includes(q) || (ep.content_group || '').toLowerCase().includes(q) || (ep.language || '').toLowerCase().includes(q)
    })
  }, [episodes.data, search])

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Content library</p>
          <h1 className="page-title">Episodes</h1>
        </div>
        <Button asChild variant="accent" disabled={!showId || !seasonId}><Link to="/admin/episodes/new">+ Add Episode</Link></Button>
      </div>

      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Show</label>
          <select value={showId} onChange={e => { const v = Number(e.target.value) || ''; setSearchParams(v ? { showId: String(v) } : {}) }} className="border rounded px-2 py-1 text-sm min-w-[160px]" aria-label="Select show">
            <option value="">Select a show</option>
            {shows.data?.items.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Season</label>
          <select value={seasonId} onChange={e => { const v = Number(e.target.value) || ''; setSearchParams(v ? { showId: String(showId), seasonId: String(v) } : { showId: String(showId) }) }} disabled={!showId || seasons.isLoading} className="border rounded px-2 py-1 text-sm min-w-[160px]" aria-label="Select season">
            <option value="">Select a season</option>
            {seasons.data?.map(s => <option key={s.id} value={s.id}>{s.season_number === 0 ? 'Trailer Season (Season 0)' : `Season ${s.season_number}`}{s.title ? ` — ${s.title}` : ''}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Search</label>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search episodes…" className="border rounded px-2 py-1 text-sm min-w-[200px]" aria-label="Search episodes" />
        </div>
      </div>

      {shows.isLoading ? <Skeleton count={3} /> : shows.error ? (
        <EmptyState message="Couldn't load shows" description={shows.error.message} />
      ) : !seasons.data && showId ? <Skeleton count={3} /> : !seasonId ? (
        <EmptyState message={showId ? 'Select a season to view episodes.' : 'Select a show and season to browse episodes.'} />
      ) : episodes.isLoading ? <Skeleton count={4} /> : episodes.error ? (
        <EmptyState message="Couldn't load episodes" description={episodes.error.message} action={<Button onClick={() => episodes.refetch()}>Retry</Button>} />
      ) : !filtered.length ? (
        <EmptyState message={search ? 'No matches' : 'No episodes in this season yet.'} description={search ? `No episodes match "${search}".` : 'Add the first episode to begin.'} action={<Button onClick={() => navigate('/admin/episodes/new')} disabled={!showId || !seasonId}>+ Add Episode</Button>} />
      ) : (
        <div className="table-card overflow-x-auto">
          <table className="content-table">
            <thead><tr><th>Episode</th><th>Title</th><th>Language</th><th>Content Group</th><th>Duration</th><th>Artwork</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {filtered.map(ep => (
                <tr key={ep.id}>
                  <td><strong>Episode {ep.episode_number ?? '—'}</strong></td>
                  <td>{ep.title || '—'}</td>
                  <td>{ep.language}</td>
                  <td><span className="text-xs bg-gray-100 px-1 rounded">{ep.content_group}</span></td>
                  <td>{ep.duration_seconds ? `${Math.round(ep.duration_seconds / 60)} min` : '—'}</td>
                  <td>✓ Poster · ✓ Banner · ✓ Thumb</td>
                  <td><span className={`status status-${ep.status}`}>{ep.status}</span></td>
                  <td>
                    <div className="flex gap-2">
                      <Button asChild size="sm" variant="outline"><Link to={`/admin/episodes/${ep.id}/edit`}>Edit</Link></Button>
                      <Button size="sm" variant="outline" onClick={() => setConfirmDeleteId(ep.id)} disabled={deleteEpisode.isPending}>Delete</Button>
                    </div>
                    {confirmDeleteId === ep.id && (
                      <div className="mt-1 text-xs">
                        <span>Delete Episode {ep.episode_number}? This is permanent.</span>
                        <Button size="sm" variant="outline" onClick={() => deleteEpisode.mutate(ep.id, { onSuccess: () => setConfirmDeleteId(null) })} disabled={deleteEpisode.isPending}>Yes</Button>
                        <Button size="sm" variant="outline" onClick={() => setConfirmDeleteId(null)}>No</Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { Skeleton } from '../../components/ui/Skeleton'
import { useSeasons } from '../../queries/useEpisodes'
import { useShow } from '../../queries/useShows'
import { useEpisodes } from '../../queries/useEpisodes'

export function SeasonEpisodesPage() {
  const { seasonId } = useParams()
  const navigate = useNavigate()
  const episodes = useEpisodes(Number(seasonId))
  const season = useSeasons(0) // placeholder; ideally fetch season by id
  const show = useShow('') // not needed if route carries context
  const [addOpen, setAddOpen] = useState(false)

  return (
    <section className="space-y-6">
      <button onClick={() => navigate(-1)} className="text-sm text-blue-600 hover:underline">← Back</button>
      <h1 className="page-title">Season Episodes</h1>
      <Button size="sm" onClick={() => setAddOpen(true)}>+ Add Episode</Button>
      {episodes.isLoading ? <Skeleton count={3} /> : episodes.error ? (
        <EmptyState message="Couldn't load episodes" description={episodes.error.message} />
      ) : !episodes.data?.length ? (
        <EmptyState message="No episodes yet" description="Add the first episode to this season." action={<Button onClick={() => setAddOpen(true)}>+ Add Episode</Button>} />
      ) : (
        <div className="table-card">
          <table className="content-table"><thead><tr><th>Episode</th><th>Title</th><th>Language</th><th>Duration</th><th></th></tr></thead>
            <tbody>
              {episodes.data.map(ep => (
                <tr key={ep.id}>
                  <td><strong>Episode {ep.episode_number ?? '—'}</strong></td>
                  <td>{ep.title || '—'}</td>
                  <td>{ep.language}</td>
                  <td>{ep.duration_seconds ? `${Math.round(ep.duration_seconds / 60)} min` : '—'}</td>
                  <td><Button asChild size="sm" variant="outline"><Link to={`/admin/episodes/${ep.id}/edit`}>Edit</Link></Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

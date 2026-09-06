import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { Skeleton } from '../../components/ui/Skeleton'
import { useShows } from '../../queries/useShows'

export function EpisodesPage() {
  const shows = useShows()
  const firstShow = shows.data?.items[0]

  if (shows.isLoading) return <Skeleton count={6} />
  if (!firstShow) return <EmptyState message="No episodes yet" description="Create a show and season before adding episodes." action={<Button asChild><Link to="/admin/shows/new">Add Show</Link></Button>} />

  return <section className="space-y-6"><div className="flex items-center justify-between gap-4"><div><p className="eyebrow">Content library</p><h1 className="page-title">Episodes</h1><p className="page-description">Episodes are available by season. Season 0 contains trailers.</p></div><Button asChild variant="accent"><Link to="/admin/episodes/new">+ Add Episode</Link></Button></div>
    <div className="table-card"><div className="table-meta">Choose a show and season to browse episodes. The API does not provide a cross-catalogue episode listing.</div><p className="empty-inline">No season selected</p></div>
  </section>
}

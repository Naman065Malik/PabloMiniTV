import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { EpisodeForm } from '../../components/content/EpisodeForm'
import { EmptyState } from '../../components/ui/EmptyState'
import { Skeleton } from '../../components/ui/Skeleton'
import { useCreateEpisode, useSeasons } from '../../queries/useEpisodes'
import { useShows } from '../../queries/useShows'

export function EpisodeCreatePage() {
  const navigate = useNavigate()
  const [showId, setShowId] = useState<number>()
  const shows = useShows()
  const seasons = useSeasons(showId)
  const createEpisode = useCreateEpisode()
  if (shows.isLoading) return <Skeleton count={4} />
  if (!shows.data?.items.length) return <EmptyState message="Add a show first" description="Episodes belong to a season, and seasons belong to a show." />
  return <section className="editor-page"><div><p className="eyebrow">Content library</p><h1 className="page-title">Add an episode</h1><p className="page-description">Season 0 is reserved for trailers.</p></div>
    <EpisodeForm shows={shows.data.items} seasons={seasons.data ?? []} selectedShowId={showId} onShowChange={setShowId} onCancel={() => navigate('/admin/episodes')} onSubmit={(seasonId, input) => createEpisode.mutate({ seasonId, input }, { onSuccess: () => navigate('/admin/episodes') })} isSubmitting={createEpisode.isPending} error={createEpisode.error?.message} />
  </section>
}

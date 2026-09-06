import { useNavigate, useParams } from 'react-router-dom'
import { EpisodeForm } from '../../components/content/EpisodeForm'
import { EmptyState } from '../../components/ui/EmptyState'
import { Skeleton } from '../../components/ui/Skeleton'
import { useEpisode, useSeasons, useUpdateEpisode } from '../../queries/useEpisodes'
import { useShows } from '../../queries/useShows'

export function EpisodeEditPage() {
  const { episodeId } = useParams()
  const navigate = useNavigate()
  const episode = useEpisode(episodeId)
  const shows = useShows()
  const seasons = useSeasons(undefined)
  const updateEpisode = useUpdateEpisode()
  if (episode.isLoading || shows.isLoading) return <Skeleton count={6} />
  if (!episode.data || !shows.data) return <EmptyState message="Episode not found" description={episode.error?.message ?? 'This episode is no longer available.'} />
  return <section className="editor-page"><div><p className="eyebrow">Content library</p><h1 className="page-title">Edit episode</h1></div>
    <EpisodeForm initialData={episode.data} shows={shows.data.items} seasons={seasons.data ?? []} onShowChange={() => undefined} onCancel={() => navigate('/admin/episodes')} onSubmit={(_, input) => updateEpisode.mutate({ id: episode.data.id, input }, { onSuccess: () => navigate('/admin/episodes') })} isSubmitting={updateEpisode.isPending} error={updateEpisode.error?.message} />
  </section>
}

import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { EpisodeForm } from '../../components/content/EpisodeForm'
import { EmptyState } from '../../components/ui/EmptyState'
import { Skeleton } from '../../components/ui/Skeleton'
import { useEpisode, useEpisodeArtworks, useSeasons, useUpdateEpisode } from '../../queries/useEpisodes'
import { uploadEpisodeArtwork } from '../../api/episodes'
import { useShows } from '../../queries/useShows'

export function EpisodeEditPage() {
  const { episodeId } = useParams()
  const navigate = useNavigate()
  const episode = useEpisode(episodeId)
  const artworks = useEpisodeArtworks(episodeId)
  const shows = useShows()
  const showForSeason = useMemo(() => {
    // Derive show from season: season belongs to a show; approximate by using show list
    if (!episode.data || !shows.data) return undefined
    // We don't have direct show_id on episode; pass season and let form select
    return undefined
  }, [episode.data, shows.data])
  const seasons = useSeasons(episode.data?.season_id ? Number(episode.data.season_id) : undefined)
  const updateEpisode = useUpdateEpisode()
  const selectedShowId = useMemo(() => {
    if (!episode.data || !shows.data) return undefined
    // Derive show from season via backend; approximate by finding season's show if needed
    // For edit form, we only need to pre-select; episode has season_id
    return undefined
  }, [episode.data, shows.data])
  if (episode.isLoading || shows.isLoading) return <Skeleton count={6} />
  if (!episode.data || !shows.data) return <EmptyState message="Episode not found" description={episode.error?.message ?? 'This episode is no longer available.'} />
  return <section className="editor-page"><div><p className="eyebrow">Content library</p><h1 className="page-title">Edit episode</h1></div>
    <EpisodeForm initialData={episode.data} artwork={artworks.data?.find(item => item.type === 'thumbnail')} onArtworkUpload={(type, file) => uploadEpisodeArtwork(episode.data.id, type, file).then(() => artworks.refetch()).then(() => undefined)} shows={shows.data.items} seasons={seasons.data ?? []} selectedShowId={seasons.data?.find(s => s.id === Number(episode.data?.season_id))?.show_id ?? undefined} onShowChange={() => undefined} onCancel={() => navigate(`/admin/episodes?showId=${episode.data?.show_id ?? ''}&seasonId=${episode.data?.season_id ?? ''}`)} onSubmit={(_, input) => updateEpisode.mutate({ id: episode.data.id, input }, { onSuccess: () => navigate(`/admin/episodes?showId=${episode.data?.show_id ?? ''}&seasonId=${episode.data?.season_id ?? ''}`) })} isSubmitting={updateEpisode.isPending} error={updateEpisode.error?.message} />
  </section>
}

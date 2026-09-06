import { useNavigate, useParams } from 'react-router-dom'
import { ShowForm } from '../../components/content/ShowForm'
import { EmptyState } from '../../components/ui/EmptyState'
import { Skeleton } from '../../components/ui/Skeleton'
import { useShow, useShowArtworks, useUpdateShow } from '../../queries/useShows'
import { uploadShowArtwork } from '../../api/shows'

export function ShowEditPage() {
  const { showId } = useParams()
  const navigate = useNavigate()
  const show = useShow(showId)
  const artworks = useShowArtworks(showId)
  const updateShow = useUpdateShow()

  if (show.isLoading) return <Skeleton count={6} />
  if (show.error || !show.data) return <EmptyState message="Show not found" description={show.error?.message ?? 'This show is no longer available.'} />

  return <section className="editor-page"><div><button onClick={() => navigate(`/admin/shows/${showId}`)} className="text-sm text-blue-600 hover:underline mb-2">← Back to {show.data?.title || 'Show'}</button><p className="eyebrow">Content library</p><h1 className="page-title">Edit {show.data.title}</h1></div>
    <ShowForm initialData={show.data} artworks={artworks.data} onCancel={() => navigate(`/admin/shows/${showId}`)} onSubmit={input => updateShow.mutate({ id: show.data.id, input }, { onSuccess: () => navigate(`/admin/shows/${showId}`) })} onArtworkUpload={(type, file) => uploadShowArtwork(show.data.id, type, file).then(() => artworks.refetch()).then(() => undefined)} isSubmitting={updateShow.isPending} error={updateShow.error?.message} />
  </section>
}

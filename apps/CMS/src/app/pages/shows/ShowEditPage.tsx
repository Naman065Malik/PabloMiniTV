import { useNavigate, useParams } from 'react-router-dom'
import { ShowForm } from '../../components/content/ShowForm'
import { EmptyState } from '../../components/ui/EmptyState'
import { Skeleton } from '../../components/ui/Skeleton'
import { useShow, useUpdateShow } from '../../queries/useShows'

export function ShowEditPage() {
  const { showId } = useParams()
  const navigate = useNavigate()
  const show = useShow(showId)
  const updateShow = useUpdateShow()

  if (show.isLoading) return <Skeleton count={6} />
  if (show.error || !show.data) return <EmptyState message="Show not found" description={show.error?.message ?? 'This show is no longer available.'} />

  return <section className="editor-page"><div><p className="eyebrow">Content library</p><h1 className="page-title">Edit {show.data.title}</h1></div>
    <ShowForm initialData={show.data} onCancel={() => navigate('/admin/shows')} onSubmit={input => updateShow.mutate({ id: show.data.id, input }, { onSuccess: () => navigate('/admin/shows') })} isSubmitting={updateShow.isPending} error={updateShow.error?.message} />
  </section>
}

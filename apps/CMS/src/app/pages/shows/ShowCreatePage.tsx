import { useNavigate } from 'react-router-dom'
import { ShowForm } from '../../components/content/ShowForm'
import { useCreateShow } from '../../queries/useShows'

export function ShowCreatePage() {
  const navigate = useNavigate()
  const createShow = useCreateShow()

  return <section className="editor-page"><div><p className="eyebrow">Content library</p><h1 className="page-title">Add a show</h1><p className="page-description">Set up the show details and give the team the artwork they need.</p></div>
    <ShowForm onCancel={() => navigate('/admin/shows')} onSubmit={data => createShow.mutate(data, { onSuccess: () => navigate('/admin/shows') })} isSubmitting={createShow.isPending} error={createShow.error?.message} />
  </section>
}

import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { Skeleton } from '../../components/ui/Skeleton'
import { useShows } from '../../queries/useShows'
import { useValidationReport } from '../../queries/useValidationReport'

export function DashboardPage() {
  const shows = useShows()
  const validation = useValidationReport()
  const showItems = shows.data?.items ?? []
  const draftCount = showItems.filter(show => show.status === 'draft').length
  const publishedCount = showItems.filter(show => show.status === 'published').length
  const validationErrors = validation.data?.errors.length ?? 0

  return <section className="space-y-8"><div><p className="eyebrow">Welcome back</p><h1 className="page-title">Dashboard</h1><p className="page-description">A clear view of the catalogue before its next release.</p></div>
    <div className="metric-grid"><Metric label="Total shows" value={shows.isLoading ? '—' : showItems.length} /><Metric label="Total episodes" value={validation.data?.total_episodes ?? '—'} /><Metric label="Draft content" value={draftCount} /><Metric label="Published content" value={publishedCount} /></div>
    <div className="dashboard-columns"><section className="table-card"><div className="section-heading"><div><h2>Recent shows</h2><p>Continue managing the latest catalogue entries.</p></div><Button asChild variant="outline" size="sm"><Link to="/admin/shows">View all</Link></Button></div>{shows.isLoading ? <Skeleton count={3} /> : shows.error ? <EmptyState message="Couldn't load recent content" description={shows.error.message} /> : !showItems.length ? <EmptyState message="No shows yet" description="Your first show will appear here." action={<Button asChild><Link to="/admin/shows/new">Add Show</Link></Button>} /> : <div className="recent-list">{showItems.slice(0, 5).map(show => <Link className="recent-item" to={`/admin/shows/${show.id}/edit`} key={show.id}><div><strong>{show.title}</strong><span>{show.section || 'No section'} · {show.category || 'Uncategorised'}</span></div><span className={`status status-${show.status}`}>{show.status}</span></Link>)}</div>}</section>
      <section className="validation-card"><div className="section-heading"><div><h2>Validation summary</h2><p>Checks that prevent a safe catalogue release.</p></div></div>{validation.isLoading ? <Skeleton count={2} /> : <><strong className={validationErrors ? 'validation-warning' : 'validation-ready'}>{validationErrors ? `⚠ ${validationErrors} issue${validationErrors === 1 ? '' : 's'} need attention` : '✓ Ready to publish'}</strong><p>{validationErrors ? 'Fix blocking issues before publishing.' : 'No blocking issues found.'}</p><Button asChild variant="outline" size="sm"><Link to="/admin/publish">Review publishing</Link></Button></>}</section></div>
    <section className="quick-actions"><h2>Quick actions</h2><div><Button asChild><Link to="/admin/shows/new">Add Show</Link></Button><Button asChild variant="accent"><Link to="/admin/episodes/new">Add Episode</Link></Button><Button asChild className="quick-action-publish"><Link to="/admin/publish">Publish Catalogue</Link></Button><Button asChild className="quick-action-preflight"><Link to="/admin/seed-preflight">Seed Preflight</Link></Button></div></section>
  </section>
}

function Metric({ label, value }: { label: string; value: string | number }) { return <article className="metric-card"><span>{label}</span><strong>{value}</strong></article> }

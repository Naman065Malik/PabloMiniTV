import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { Skeleton } from '../../components/ui/Skeleton'
import { Fragment, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useShows } from '../../queries/useShows'
import { usePublishCatalogue, usePublishHistory } from '../../queries/usePublishHistory'
import { useValidationReport } from '../../queries/useValidationReport'

export function PublishPage() {
  const [showPublishDetails, setShowPublishDetails] = useState(false)
  const [expandedRunId, setExpandedRunId] = useState<number | null>(null)
  const { user } = useAuth()
  const validation = useValidationReport()
  const shows = useShows()
  const history = usePublishHistory()
  const publish = usePublishCatalogue()
  const hasPublishedShows = shows.data?.items.some(show => show.status === 'published') ?? false
  const canPublish = user?.role === 'admin' && hasPublishedShows

  return (
    <section className="space-y-8">
      <div><p className="eyebrow">Publishing</p><h1 className="page-title">Publish catalogue</h1><p className="page-description">Run validation first, then queue the current catalogue for publishing.</p></div>
      <section className="publish-status">
        <div><h2>Catalogue status</h2>{validation.isLoading && <Skeleton count={1} />}</div>
        <div className="flex items-center gap-3"><Button variant="accent" disabled={!canPublish || publish.isPending} onClick={() => publish.mutate(shows.data?.items.map(show => show.id) ?? [])}>{publish.isPending ? 'Publishing…' : 'Publish'}</Button>{user?.role !== 'admin' && <span className="field-hint">Only administrators can publish.</span>}</div>
      </section>
      {publish.error && <section className="form-error" role="alert"><div className="flex items-start justify-between gap-3"><strong>Publishing failed</strong><Button size="sm" variant="outline" onClick={() => setShowPublishDetails(value => !value)}>{showPublishDetails ? 'Hide details' : 'View details'}</Button></div>{showPublishDetails && <div className="mt-3 whitespace-pre-wrap text-sm font-normal">{publish.error.message}</div>}</section>}
      <section className="table-card"><div className="section-heading"><div><h2>Publish run history</h2><p>Most recent catalogue releases.</p></div></div>{history.isLoading ? <Skeleton count={3} /> : history.error ? <EmptyState message="Couldn't load publish history" description={history.error.message} /> : !history.data?.length ? <EmptyState message="No publish runs yet" description="Completed and queued releases will be listed here." /> : <table className="content-table"><thead><tr><th>Date / time</th><th>User</th><th>Shows</th><th>Episodes</th><th>Outcome</th><th>Report</th></tr></thead><tbody>{history.data.map(run => <Fragment key={run.id}><tr><td>{run.created_at ? new Date(run.created_at).toLocaleString() : '—'}</td><td>{run.created_by}</td><td>{run.shows_count ?? '—'}</td><td>{run.episodes_count ?? '—'}</td><td><span className={`status status-${run.status}`}>{run.status}</span></td><td>{run.validation_report?.length ? <Button size="sm" variant="outline" onClick={() => setExpandedRunId(expandedRunId === run.id ? null : run.id)}>{expandedRunId === run.id ? 'Hide report' : 'View report'}</Button> : '—'}</td></tr>{expandedRunId === run.id && run.validation_report?.length ? <tr><td colSpan={6}><ValidationIssues issues={run.validation_report} /></td></tr> : null}</Fragment>)}</tbody></table>}</section>
    </section>
  )
}

function ValidationIssues({ issues }: { issues: Array<{ entity_type?: string; entity_id?: number; message?: string; code?: string }> }) {
  return <div className="issue-groups">{issues.map((issue, index) => {
    const target = issue.entity_type === 'episode'
      ? `/admin/episodes/${issue.entity_id}/edit`
      : issue.entity_type === 'show'
        ? `/admin/shows/${issue.entity_id}/edit`
        : '/admin/shows'
    return <article className="validation-issue" key={`${issue.entity_type ?? 'issue'}-${issue.entity_id ?? index}-${index}`}><div><strong>{issue.code ?? 'Catalogue issue'}</strong><p>{issue.message ?? 'This item needs attention before publishing.'}</p></div><Button asChild size="sm" variant="outline"><Link to={target}>Fix</Link></Button></article>
  })}</div>
}


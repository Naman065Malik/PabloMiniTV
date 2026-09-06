import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { Skeleton } from '../../components/ui/Skeleton'
import { useAuth } from '../../hooks/useAuth'
import { useShows } from '../../queries/useShows'
import { usePublishCatalogue, usePublishHistory } from '../../queries/usePublishHistory'
import { useValidationReport } from '../../queries/useValidationReport'

export function PublishPage() {
  const { user } = useAuth()
  const validation = useValidationReport()
  const shows = useShows()
  const history = usePublishHistory(user?.role === 'admin')
  const publish = usePublishCatalogue()
  const errors = validation.data?.errors ?? []
  const ready = !validation.isLoading && errors.length === 0
  const canPublish = user?.role === 'admin' && ready && Boolean(shows.data?.items.length)

  return (
    <section className="space-y-8">
      <div><p className="eyebrow">Publishing</p><h1 className="page-title">Publish catalogue</h1><p className="page-description">Run validation first, then queue the current catalogue for publishing.</p></div>
      <section className="publish-status">
        <div><h2>Catalogue status</h2>{validation.isLoading ? <Skeleton count={1} /> : <><strong className={ready ? 'validation-ready' : 'validation-warning'}>{ready ? '✓ Ready to publish' : `⚠ ${errors.length} issue${errors.length === 1 ? '' : 's'} need to be fixed`}</strong><p>{user?.role === 'admin' ? 'Only a clean validation report can be published.' : 'Only administrators can publish the catalogue.'}</p></>}</div>
        <Button variant="accent" disabled={!canPublish || publish.isPending} onClick={() => publish.mutate(shows.data?.items.map(show => show.id) ?? [])}>{publish.isPending ? 'Queueing…' : 'Publish Catalogue'}</Button>
      </section>
      {publish.error && <p className="form-error" role="alert">{publish.error.message}</p>}
      <section className="table-card"><div className="section-heading"><div><h2>Validation report</h2><p>Issues are grouped by their affected content.</p></div></div>{validation.isLoading ? <Skeleton count={4} /> : errors.length === 0 ? <EmptyState message="No blocking issues" description="The catalogue has passed the available validation checks." /> : <ValidationIssues issues={errors} />}</section>
      <section className="table-card"><div className="section-heading"><div><h2>Publish run history</h2><p>Most recent catalogue releases.</p></div></div>{user?.role !== 'admin' ? <p className="permission-message">Only administrators can view publishing history.</p> : history.isLoading ? <Skeleton count={3} /> : history.error ? <EmptyState message="Couldn't load publish history" description={history.error.message} /> : !history.data?.length ? <EmptyState message="No publish runs yet" description="Completed and queued releases will be listed here." /> : <table className="content-table"><thead><tr><th>Date / time</th><th>User</th><th>Shows</th><th>Episodes</th><th>Outcome</th><th>Duration</th></tr></thead><tbody>{history.data.map(run => <tr key={run.id}><td>{run.created_at ? new Date(run.created_at).toLocaleString() : '—'}</td><td>{run.created_by}</td><td>{run.shows_count ?? '—'}</td><td>{run.episodes_count ?? '—'}</td><td><span className={`status status-${run.status}`}>{run.status}</span></td><td>{duration(run.started_at, run.completed_at)}</td></tr>)}</tbody></table>}</section>
    </section>
  )
}

function ValidationIssues({ issues }: { issues: Array<{ entity_type?: string; entity?: string; title?: string; message?: string; reason?: string; explanation?: string }> }) {
  const groups = issues.reduce<Record<string, typeof issues>>((result, issue) => { const group = issue.entity_type || issue.entity || 'Other'; (result[group] ||= []).push(issue); return result }, {})
  return <div className="issue-groups">{Object.entries(groups).map(([group, groupIssues]) => <div key={group}><h3>{group}</h3>{groupIssues.map((issue, index) => <article className="validation-issue" key={`${group}-${index}`}><div><strong>{issue.title || 'Catalogue issue'}</strong><p>{issue.message || issue.reason || issue.explanation || 'This item needs attention before publishing.'}</p></div><Button asChild size="sm" variant="outline"><Link to="/admin/shows">Fix</Link></Button></article>)}</div>)}</div>
}
function duration(start?: string | null, end?: string | null) { if (!start || !end) return '—'; return `${Math.max(0, Math.round((new Date(end).getTime() - new Date(start).getTime()) / 1000))}s` }

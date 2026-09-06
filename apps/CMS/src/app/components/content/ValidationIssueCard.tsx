import { useState } from 'react';

interface IssueProps {
  severity: 'error' | 'warning';
  code: string;
  message?: string;
  show?: string;
  episode_id?: string;
  content_group?: string;
  language?: string;
  records?: string[];
}

function formatIssue(i: IssueProps) {
  const titleMap: Record<string, string> = {
    DUPLICATE_CONTENT_GROUP_LANGUAGE: 'Language version appears twice',
    MISSING_ARTWORK: 'Episode artwork is missing',
    INVALID_DURATION: 'Invalid episode duration',
    MISSING_SECTION: "Show section is missing",
    MISSING_FIELD: 'Required information missing',
    BAD_FORMAT: 'Invalid seed file format',
    BAD_JSON: 'Invalid JSON file',
    DB_CONFLICT: 'Content already exists',
  };
  const descMap: Record<string, (i: IssueProps) => string> = {
    DUPLICATE_CONTENT_GROUP_LANGUAGE: (i) => `Episode "${i.show ?? 'unknown'}" has two versions in the same language (${i.language ?? 'unknown'}). Remove one duplicate version before importing.`,
    MISSING_ARTWORK: (i) => `"${i.message?.match(/episode (.+?) /)?.[1] ?? 'The episode'}" is published but has no artwork yet. Add poster, banner and thumbnail before importing.`,
    MISSING_SECTION: (i) => `"${i.show ?? 'This show'}" needs a section (like Featured or Kids) before it can be published.`,
    DB_CONFLICT: () => 'This content already exists in the catalogue. Either update the existing content or remove the duplicate from the seed file.',
  };
  const title = titleMap[i.code] || (i.message ? i.message.slice(0, 50) : 'Something needs attention');
  const desc = descMap[i.code] ? descMap[i.code](i) : (i.message || 'Please review this item before importing.');
  const action = i.severity === 'error' ? 'Fix before importing.' : 'Review before publishing.';
  return { title, desc, action, severity: i.severity };
}

export function ValidationIssueCard({ issue }: { issue: IssueProps }) {
  const [expanded, setExpanded] = useState(false);
  const f = formatIssue(issue);
  return (
    <div className={`rounded-lg border p-4 ${f.severity === 'error' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
      <div className="flex items-start gap-3">
        <span className="text-xl shrink-0">{f.severity === 'error' ? '❌' : '⚠️'}</span>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-base leading-snug">{f.title}</h4>
          <p className="text-sm text-gray-700 mt-1">{f.desc}</p>
          <p className="text-xs text-gray-500 mt-1">Fix: {f.action}</p>
          <button onClick={() => setExpanded(!expanded)} className="text-xs text-blue-600 hover:underline mt-2" aria-expanded={expanded}>
            {expanded ? 'Collapse details' : 'Expand details'}
          </button>
          {expanded && (
            <div className="mt-2 p-2 bg-white/60 rounded text-xs text-gray-600 space-y-0.5 border border-gray-200/60 font-mono">
              <div><strong>Code:</strong> {issue.code}</div>
              <div><strong>Message:</strong> {issue.message}</div>
              {issue.show && <div><strong>Show:</strong> {issue.show}</div>}
              {issue.episode_id && <div><strong>Episode ID:</strong> {issue.episode_id}</div>}
              {issue.content_group && <div><strong>Content group:</strong> {issue.content_group}</div>}
              {issue.language && <div><strong>Language:</strong> {issue.language}</div>}
              {issue.records?.length ? <div><strong>Records:</strong> {issue.records.join(', ')}</div> : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

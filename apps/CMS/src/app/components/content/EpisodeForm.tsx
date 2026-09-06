import { useState, type FormEvent } from 'react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Textarea } from '../ui/Textarea'
import type { Episode, EpisodeInput, Season } from '../../api/episodes'
import type { Show } from '../../api/shows'

interface EpisodeFormProps {
  initialData?: Episode
  shows: Show[]
  seasons: Season[]
  selectedShowId?: number
  onShowChange: (showId: number) => void
  onSubmit: (seasonId: number, input: EpisodeInput) => void
  onCancel: () => void
  isSubmitting?: boolean
  error?: string
}

export function EpisodeForm({ initialData, shows, seasons, selectedShowId, onShowChange, onSubmit, onCancel, isSubmitting = false, error }: EpisodeFormProps) {
  const [thumbnail, setThumbnail] = useState('')
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const values = new FormData(event.currentTarget)
    const seasonId = Number(values.get('seasonId'))
    onSubmit(seasonId, {
      title: String(values.get('title') || ''),
      description: String(values.get('description') || '') || undefined,
      episode_number: Number(values.get('episodeNumber')) || undefined,
      duration_seconds: Number(values.get('durationSeconds')) || undefined,
      language: String(values.get('language') || ''),
      content_group: String(values.get('contentGroup') || ''),
      status: String(values.get('status') || 'draft') as EpisodeInput['status'],
    })
  }
  const isBlocked = !initialData?.duration_seconds || !thumbnail
  return <form className="editor-form" onSubmit={handleSubmit}>
    {error && <p className="form-error" role="alert">{"Content group + language conflict" in error || "already exists" in error ? "This episode already has an English version in this content group. Use a different content group or language." : error.includes('duration') ? "Publishing requires a duration. Add duration before publishing." : error}</p>}
    <fieldset><legend>Episode information</legend><div className="form-grid"><label>Show<Select value={selectedShowId ?? ''} onChange={event => onShowChange(Number(event.target.value))} required><option value="">Select show</option>{shows.map(show => <option key={show.id} value={show.id}>{show.title}</option>)}</Select></label><label>Season<Select name="seasonId" defaultValue={initialData?.season_id ?? ''} required disabled={!selectedShowId}><option value="">Select season</option>{seasons.map(season => <option key={season.id} value={season.id}>{season.season_number === 0 ? 'Trailer (Season 0)' : `Season ${season.season_number}`}{season.title ? ` — ${season.title}` : ''}</option>)}</Select></label></div>
      <div className="form-grid"><label>Episode number<Input name="episodeNumber" type="number" min="0" defaultValue={initialData?.episode_number ?? ''} /></label><label>Content group<Input name="contentGroup" required defaultValue={initialData?.content_group} placeholder="e.g. story-01" /></label></div>
      <label>Title<Input name="title" required defaultValue={initialData?.title ?? ''} /></label><label>Description<Textarea name="description" rows={4} defaultValue={initialData?.description ?? ''} /></label>
      <div className="form-grid"><label>Duration (seconds)<Input name="durationSeconds" type="number" min="0" defaultValue={initialData?.duration_seconds ?? ''} /></label><label>Language<Select name="language" required defaultValue={initialData?.language ?? 'en'}><option value="en">English</option><option value="es">Spanish</option><option value="fr">French</option></Select></label></div>
      <label>Status<Select name="status" defaultValue={initialData?.status ?? 'draft'}><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></Select></label>
    </fieldset>
    <fieldset><legend>Thumbnail</legend><label className="artwork-slot"><strong>Episode thumbnail</strong><span>16:9 · ~640 × 360 · max 200KB</span><input type="file" accept="image/*" onChange={event => { const file = event.target.files?.[0]; setThumbnail(file && file.size <= 200 * 1024 ? file.name : '') }} /></label>{isBlocked && <p className="publish-blocked">Publishing blocked: add a thumbnail and a duration before publishing this episode.</p>}</fieldset>
    <div className="form-actions"><Button type="button" variant="outline" onClick={onCancel}>Cancel</Button><Button type="submit" variant="outline" disabled={isSubmitting}>Save Draft</Button><Button type="submit" variant="accent" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Save'}</Button></div>
  </form>
}

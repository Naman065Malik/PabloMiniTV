import { useState, type FormEvent } from 'react'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Textarea } from '../ui/Textarea'
import { Button } from '../ui/Button'
import type { Show, ShowInput } from '../../api/shows'

interface ShowFormProps {
  initialData?: Show
  onSubmit: (data: ShowInput) => void
  onCancel: () => void
  isSubmitting?: boolean
  error?: string
}

const artworkSlots = [
  ['Poster', '2:3 · ~600 × 900 · max 200KB'],
  ['Banner', '16:9 · ~1280 × 720 · max 200KB'],
  ['Thumbnail', '16:9 · ~640 × 360 · max 200KB'],
] as const

export function ShowForm({ initialData, onSubmit, onCancel, isSubmitting = false, error }: ShowFormProps) {
  const [artworkMessage, setArtworkMessage] = useState('')

  function handleArtwork(file: File | undefined) {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setArtworkMessage('Please choose an image file.')
    } else if (file.size > 200 * 1024) {
      setArtworkMessage(`${file.name} is larger than the 200KB limit.`)
    } else {
      setArtworkMessage(`${file.name} is ready to upload when artwork storage is connected.`)
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const values = new FormData(event.currentTarget)
    onSubmit({
      title: String(values.get('title') || ''),
      description: String(values.get('description') || '') || undefined,
      section: String(values.get('section') || '') || undefined,
      category: String(values.get('category') || '') || undefined,
    })
  }

  return <form className="editor-form" onSubmit={handleSubmit}>
    {error && <p className="form-error" role="alert">{error}</p>}
    <fieldset><legend>Basic information</legend>
      <label>Title<Input name="title" required defaultValue={initialData?.title} /></label>
      <label>Synopsis<Textarea name="description" rows={5} defaultValue={initialData?.description ?? ''} /></label>
      <div className="form-grid"><label>Section<Select name="section" defaultValue={initialData?.section ?? ''}><option value="">Choose section</option><option value="preschool">Preschool</option><option value="kids">Kids</option><option value="family">Family</option></Select></label><label>Category<Input name="category" defaultValue={initialData?.category ?? ''} placeholder="e.g. Adventure" /></label></div>
      <div className="form-grid"><label>Primary language<Select disabled defaultValue="en"><option value="en">English</option></Select><span className="field-hint">Language metadata is not yet exposed by the current API.</span></label><label>Status<Select disabled defaultValue={initialData?.status ?? 'draft'}><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></Select><span className="field-hint">Status is controlled by publishing.</span></label></div>
    </fieldset>
    <fieldset><legend>Artwork</legend><p className="field-hint">Upload artwork that meets the required aspect ratio and file-size guidance.</p>
      <div className="artwork-grid">{artworkSlots.map(([name, hint]) => <label className="artwork-slot" key={name}><strong>{name}</strong><span>{hint}</span><input type="file" accept="image/*" onChange={event => handleArtwork(event.target.files?.[0])} /></label>)}</div>
      {artworkMessage && <p className="field-hint" role="status">{artworkMessage}</p>}
    </fieldset>
    <div className="form-actions"><Button type="button" variant="outline" onClick={onCancel}>Cancel</Button><Button type="submit" variant="outline" disabled={isSubmitting}>Save Draft</Button><Button type="submit" variant="accent" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Save'}</Button></div>
  </form>
}

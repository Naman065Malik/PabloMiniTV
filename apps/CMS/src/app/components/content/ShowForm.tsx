import { type FormEvent } from 'react'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Textarea } from '../ui/Textarea'
import { Button } from '../ui/Button'
import { ArtworkUpload } from './ArtworkUpload'
import type { Artwork, Show, ShowInput } from '../../api/shows'
import type { ArtworkType } from './ArtworkUpload'

interface ShowFormProps {
  initialData?: Show
  onSubmit: (data: ShowInput) => void
  onCancel: () => void
  isSubmitting?: boolean
  error?: string
  onArtworkUpload?: (type: ArtworkType, file: File) => Promise<void>
  artworks?: Artwork[]
}

export function ShowForm({ initialData, onSubmit, onCancel, isSubmitting = false, error, onArtworkUpload, artworks = [] }: ShowFormProps) {
  const artworkFor = (type: ArtworkType) => artworks.find(artwork => artwork.type === type.toLowerCase())

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
    <fieldset><legend>Artwork</legend><p className="field-hint">Upload artwork that meets the required dimensions, aspect ratio, and 200 KB limit.</p>
      <div className="artwork-grid">
        <ArtworkUpload type="POSTER" existingArtwork={artworkFor('POSTER')} onUpload={onArtworkUpload ? file => onArtworkUpload('POSTER', file) : undefined} />
        <ArtworkUpload type="BANNER" existingArtwork={artworkFor('BANNER')} onUpload={onArtworkUpload ? file => onArtworkUpload('BANNER', file) : undefined} />
        <ArtworkUpload type="THUMBNAIL" existingArtwork={artworkFor('THUMBNAIL')} onUpload={onArtworkUpload ? file => onArtworkUpload('THUMBNAIL', file) : undefined} />
      </div>
    </fieldset>
    <div className="form-actions"><Button type="button" variant="outline" onClick={onCancel}>Cancel</Button><Button type="submit" variant="outline" disabled={isSubmitting}>Save Draft</Button><Button type="submit" variant="accent" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Save'}</Button></div>
  </form>
}

import { useState, useCallback, type ChangeEvent } from 'react'
import { Button } from '../ui/Button'
import type { Artwork } from '../../api/shows'

export type ArtworkType = 'POSTER' | 'BANNER' | 'THUMBNAIL'

const ARTWORK_CONFIG: Record<ArtworkType, { label: string; target: string; dims: string; aspect: string; minW: number; minH: number; maxW: number; maxH: number }> = {
  POSTER: { label: 'Poster', target: '600 × 900', dims: '~600 × 900 px', aspect: '2:3', minW: 400, minH: 600, maxW: 900, maxH: 1200 },
  BANNER: { label: 'Banner', target: '1280 × 720', dims: '~1280 × 720 px', aspect: '16:9', minW: 800, minH: 360, maxW: 1600, maxH: 900 },
  THUMBNAIL: { label: 'Thumbnail', target: '640 × 360', dims: '~640 × 360 px', aspect: '16:9', minW: 320, minH: 180, maxW: 800, maxH: 450 },
}

const MAX_SIZE = 200 * 1024
const SUPPORTED = ['image/jpeg', 'image/png', 'image/webp']

export interface ArtworkSlotState {
  file: File | null
  previewUrl: string | null
  width: number | null
  height: number | null
  error: string | null
  isUploading: boolean
  uploaded: boolean
}

export interface ArtworkUploadProps {
  type: ArtworkType
  onUpload?: (file: File) => Promise<void> | void
  existingArtwork?: Artwork
}

function getAspect(width: number, height: number) {
  if (!width || !height) return 0
  return width / height
}

function formatAspect(width: number, height: number) {
  const a = getAspect(width, height)
  return a.toFixed(2) + ':1'
}

function validateSlot(file: File): string | null {
  if (!file) return 'Please select a file.'
  if (!SUPPORTED.includes(file.type)) return 'Supported formats: JPEG, PNG, WEBP.'
  if (file.size > MAX_SIZE) return `${file.name} is ${Math.round(file.size / 1024)} KB, larger than 200 KB limit.`
  return null
}

export function ArtworkUpload({ type, onUpload, existingArtwork }: ArtworkUploadProps) {
  const cfg = ARTWORK_CONFIG[type]
  const [state, setState] = useState<ArtworkSlotState>({
    file: null,
    previewUrl: null,
    width: null, height: null, error: null,
    isUploading: false, uploaded: false,
  })

  const handleFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const basicError = validateSlot(file)
    if (basicError) {
      setState(s => ({ ...s, file, previewUrl: null, width: null, height: null, error: basicError, uploaded: false }))
      return
    }
    const img = new Image()
    img.onload = () => {
      const w = img.width, h = img.height
      const aspect = getAspect(w, h)
      const target = type === 'POSTER' ? 2 / 3 : 16 / 9
      const aspectOk = Math.abs(aspect - target) <= target * 0.2
      const dimOk = w >= cfg.minW && h >= cfg.minH && w <= cfg.maxW && h <= cfg.maxH
      let msg: string | null = null
      if (!aspectOk) {
        msg = `${cfg.label} is ${w} × ${h} pixels. Please upload an image around ${cfg.target} with a ${cfg.aspect} aspect ratio.`
      } else if (!dimOk) {
        msg = `${cfg.label} is ${w} × ${h} pixels. Please upload around ${cfg.dims} with a ${cfg.aspect} aspect ratio.`
      } else {
        msg = null
      }
      setState(s => ({
        ...s,
        file,
        previewUrl: URL.createObjectURL(file),
        width: w,
        height: h,
        error: msg,
        uploaded: false,
      }))
    }
    img.onerror = () => {
      setState(s => ({ ...s, file, previewUrl: null, width: null, height: null, error: 'Not a valid image file.', uploaded: false }))
    }
    img.src = URL.createObjectURL(file)
  }, [type, cfg])

  const handleUpload = useCallback(async () => {
    if (!state.file || state.error) return
    setState(s => ({ ...s, isUploading: true, uploaded: false }))
    try {
      if (!onUpload) throw new Error('Save the show before uploading artwork.')
      await onUpload(state.file)
      setState(s => ({ ...s, isUploading: false, uploaded: true }))
    } catch (error) {
      setState(s => ({
        ...s,
        isUploading: false,
        uploaded: false,
        error: error instanceof Error ? error.message : 'Artwork upload failed.',
      }))
    }
  }, [state.file, state.error, onUpload])

  const handleRemove = useCallback(() => {
    if (state.previewUrl) URL.revokeObjectURL(state.previewUrl)
    setState({ file: null, previewUrl: null, width: null, height: null, error: null, isUploading: false, uploaded: false })
  }, [state.previewUrl])

  const hasError = !!state.error
  const canUpload = !!state.file && !!onUpload && !hasError && !state.isUploading && !state.uploaded

  return (
    <div className="artwork-slot" aria-label={`${cfg.label} upload`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <strong className="block">{cfg.label}</strong>
          <span className="text-xs text-gray-500">{cfg.dims} · {cfg.aspect} · max 200 KB</span>
        </div>
        {state.uploaded && <span className="text-xs text-green-600 font-medium">Uploaded</span>}
      </div>

      <div className="mt-2">
        <label className="inline-flex items-center gap-2 px-3 py-2 rounded bg-gray-50 border border-gray-200 text-sm cursor-pointer hover:bg-gray-100" aria-label={`Select ${cfg.label}`}>Select file
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} className="hidden" />
        </label>
      </div>

      {existingArtwork && !state.file && (
        <div className="mt-3">
          <img
            src={`/api/public/catalog/catalog/assets/${existingArtwork.storage_key}`}
            alt={`Current ${cfg.label.toLowerCase()}`}
            className="max-h-40 rounded border border-gray-200 object-contain"
          />
          <div className="mt-1 text-xs text-gray-500">
            Current: {existingArtwork.original_filename} · {Math.round(existingArtwork.file_size_bytes / 1024)} KB
          </div>
          {existingArtwork.width && existingArtwork.height && (
            <div className="text-xs text-gray-500">Dimensions: {existingArtwork.width} × {existingArtwork.height}</div>
          )}
        </div>
      )}

      {state.file && (
        <div className="mt-2 text-xs">{state.file.name} · {Math.round(state.file.size / 1024)} KB</div>
      )}

      {state.previewUrl && (
        <div className="mt-2">
          <img src={state.previewUrl} alt={`${cfg.label} preview`} className="max-h-40 rounded border border-gray-200 object-contain" />
          {state.width && state.height && (
            <div className="text-xs text-gray-500 mt-1">Dimensions: {state.width} × {state.height} ({formatAspect(state.width, state.height)})</div>
          )}
        </div>
      )}

      {state.error && (
        <div className="mt-2 text-sm text-red-600" role="alert">{state.error}</div>
      )}

      <div className="mt-2 flex gap-2">
        <Button size="sm" variant="outline" onClick={handleUpload} disabled={!canUpload}>{state.isUploading ? 'Uploading…' : 'Upload'}</Button>
        {state.file && <Button size="sm" variant="outline" onClick={handleRemove}>Remove</Button>}
      </div>
    </div>
  )
}

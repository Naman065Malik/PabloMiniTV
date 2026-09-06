import { apiFetch } from './client'
import type { Artwork, ContentStatus } from './shows'

export interface Season {
  id: number
  show_id: number
  season_number: number
  title: string | null
}

export interface Episode {
  id: number
  season_id: number
  title: string | null
  description: string | null
  episode_number: number | null
  duration_seconds: number | null
  language: string
  content_group: string
  status: ContentStatus
  video_storage_key: string | null
  created_at: string
  updated_at: string
}

export interface EpisodeInput {
  title: string
  description?: string
  episode_number?: number
  duration_seconds?: number
  language: string
  content_group: string
  status?: ContentStatus
}

function token() { return window.localStorage.getItem('pablo-mini-tv-auth-token') }

export function listSeasons(showId: number) { return apiFetch<Season[]>(`/admin/shows/${showId}/seasons`, { token: token() }) }
export function getSeason(seasonId: number) { return apiFetch<Season>(`/admin/seasons/${seasonId}`, { token: token() }) }
export function createSeason(showId: number, input: { season_number: number; title?: string }) { return apiFetch<Season>(`/admin/shows/${showId}/seasons`, { method: 'POST', token: token(), body: JSON.stringify(input) }) }
export function updateSeason(seasonId: number, input: Partial<{ season_number: number; title?: string }>) { return apiFetch<Season>(`/admin/seasons/${seasonId}`, { method: 'PATCH', token: token(), body: JSON.stringify(input) }) }
export function deleteSeason(seasonId: number) { return apiFetch<void>(`/admin/seasons/${seasonId}`, { method: 'DELETE', token: token() }) }
export function listEpisodes(seasonId: number) { return apiFetch<Episode[]>(`/admin/seasons/${seasonId}/episodes`, { token: token() }) }
export function getEpisode(episodeId: string) { return apiFetch<Episode>(`/admin/episodes/${episodeId}`, { token: token() }) }
export function createEpisode(seasonId: number, input: EpisodeInput) { return apiFetch<Episode>(`/admin/seasons/${seasonId}/episodes`, { method: 'POST', token: token(), body: JSON.stringify(input) }) }
export function updateEpisode(episodeId: string, input: Partial<EpisodeInput>) { return apiFetch<Episode>(`/admin/episodes/${episodeId}`, { method: 'PATCH', token: token(), body: JSON.stringify(input) }) }
export function uploadEpisodeArtwork(episodeId: number, artworkType: string, file: File) {
  const body = new FormData()
  body.append('file', file)
  return apiFetch<Artwork>(`/admin/episodes/${episodeId}/artworks?artwork_type=${encodeURIComponent(artworkType)}`, { method: 'POST', token: token(), body })
}
export function listEpisodeArtworks(episodeId: number) {
  return apiFetch<Artwork[]>(`/admin/episodes/${episodeId}/artworks`, { token: token() })
}

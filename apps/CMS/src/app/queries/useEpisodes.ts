import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '../api/client'
import { createEpisode, deleteSeason, getEpisode, listEpisodes, listSeasons, createSeason, updateSeason, updateEpisode, type EpisodeInput } from '../api/episodes'

export const episodeKeys = {
  all: ['episodes'] as const,
  seasons: (showId: number) => [...episodeKeys.all, 'seasons', showId] as const,
  list: (seasonId: number) => [...episodeKeys.all, 'list', seasonId] as const,
  detail: (episodeId: string) => [...episodeKeys.all, 'detail', episodeId] as const,
}

export function useSeasons(showId: number | undefined) { return useQuery({ queryKey: episodeKeys.seasons(showId ?? 0), queryFn: () => listSeasons(showId ?? 0), enabled: Boolean(showId) }) }
export function useEpisodes(seasonId: number | undefined) { return useQuery({ queryKey: episodeKeys.list(seasonId ?? 0), queryFn: () => listEpisodes(seasonId ?? 0), enabled: Boolean(seasonId) }) }
export function useEpisode(episodeId: string | undefined) { return useQuery({ queryKey: episodeKeys.detail(episodeId ?? ''), queryFn: () => getEpisode(episodeId ?? ''), enabled: Boolean(episodeId) }) }

export function useCreateSeason() {
  const client = useQueryClient()
  return useMutation({ mutationFn: ({ showId, input }: { showId: number; input: { season_number: number; title?: string } }) => createSeason(showId, input), onSuccess: () => client.invalidateQueries({ queryKey: episodeKeys.all }) })
}
export function useUpdateSeason() {
  const client = useQueryClient()
  return useMutation({ mutationFn: ({ id, input }: { id: number; input: Partial<{ season_number: number; title?: string }> }) => updateSeason(id, input), onSuccess: () => client.invalidateQueries({ queryKey: episodeKeys.all }) })
}
export function useDeleteSeason() {
  const client = useQueryClient()
  return useMutation({ mutationFn: (id: number) => deleteSeason(id), onSuccess: () => client.invalidateQueries({ queryKey: episodeKeys.all }) })
}
export function useCreateEpisode() {
  const client = useQueryClient()
  return useMutation({ mutationFn: ({ seasonId, input }: { seasonId: number; input: EpisodeInput }) => createEpisode(seasonId, input), onSuccess: () => client.invalidateQueries({ queryKey: episodeKeys.all }) })
}
export function useDeleteEpisode() {
  const client = useQueryClient()
  return useMutation({ mutationFn: (id: number) => apiFetch<void>(`/admin/episodes/${id}`, { method: 'DELETE', token: window.localStorage.getItem('pablo-mini-tv-auth-token') }), onSuccess: () => client.invalidateQueries({ queryKey: episodeKeys.all }) })
}
export function useUpdateEpisode() {
  const client = useQueryClient()
  return useMutation({ mutationFn: ({ id, input }: { id: number; input: Partial<EpisodeInput> }) => updateEpisode(id, input), onSuccess: () => client.invalidateQueries({ queryKey: episodeKeys.all }) })
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createShow, deleteShow, getShow, listShows, updateShow, type ShowFilters, type ShowInput } from '../api/shows'

export const showKeys = {
  all: ['shows'] as const,
  list: (filters: ShowFilters) => [...showKeys.all, 'list', filters] as const,
  detail: (showId: string) => [...showKeys.all, 'detail', showId] as const,
}

export function useShows(filters: ShowFilters = {}) {
  return useQuery({
    queryKey: showKeys.list(filters),
    queryFn: () => listShows(filters),
  })
}

export function useShow(showId: string | undefined) {
  return useQuery({
    queryKey: showKeys.detail(showId ?? ''),
    queryFn: () => getShow(showId ?? ''),
    enabled: Boolean(showId),
  })
}

export function useCreateShow() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: ShowInput) => createShow(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: showKeys.all }),
  })
}

export function useDeleteShow() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteShow(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: showKeys.all }),
  })
}

export function useUpdateShow() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: Partial<ShowInput> }) => updateShow(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: showKeys.all }),
  })
}

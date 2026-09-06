import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { publishCatalogue, listPublishRuns } from '../api/catalog'
import { validationReportKey } from './useValidationReport'

export const publishHistoryKey = ['publish-history'] as const
export function usePublishHistory(enabled = true) { return useQuery({ queryKey: publishHistoryKey, queryFn: listPublishRuns, enabled }) }
export function usePublishCatalogue() { const client = useQueryClient(); return useMutation({ mutationFn: publishCatalogue, onSuccess: () => { void client.invalidateQueries({ queryKey: publishHistoryKey }); void client.invalidateQueries({ queryKey: validationReportKey }) } }) }

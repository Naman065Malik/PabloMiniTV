import { useQuery } from '@tanstack/react-query'
import { getValidationReport } from '../api/validation'

export const validationReportKey = ['validation-report'] as const
export function useValidationReport() { return useQuery({ queryKey: validationReportKey, queryFn: getValidationReport }) }

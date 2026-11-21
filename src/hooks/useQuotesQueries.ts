import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createQuote,
  deleteQuote,
  getDailyQuote,
  getQuote,
  getRandomQuote,
  listQuotes,
  toggleFavoriteQuote,
  updateQuote,
  type QuoteInput,
  type QuoteListParams,
} from '../services/quotesApi'

export const quotesKeys = {
  all: ['admin', 'quotes'] as const,
  daily: (date?: string) => [...quotesKeys.all, 'daily', date ?? 'today'] as const,
  random: () => [...quotesKeys.all, 'random'] as const,
  detail: (id: number) => [...quotesKeys.all, 'detail', id] as const,
  list: (params: QuoteListParams) => [...quotesKeys.all, 'list', params] as const,
}

export function useDailyQuote(date?: string) {
  return useQuery({
    queryKey: quotesKeys.daily(date),
    queryFn: () => getDailyQuote(date),
  })
}

export function useRandomQuote(enabled = false) {
  return useQuery({
    queryKey: quotesKeys.random(),
    queryFn: () => getRandomQuote(),
    enabled,
  })
}

export function useQuotesList(params: QuoteListParams = {}) {
  return useQuery({
    queryKey: quotesKeys.list(params),
    queryFn: () => listQuotes(params),
  })
}

export function useQuote(id: number | null | undefined) {
  return useQuery({
    queryKey: quotesKeys.detail(id as number),
    queryFn: () => getQuote(id as number),
    enabled: typeof id === 'number' && id > 0,
  })
}

export function useQuotesMutations() {
  const queryClient = useQueryClient()

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: quotesKeys.all })
  }

  const createQuoteMutation = useMutation({
    mutationFn: (data: QuoteInput) => createQuote(data),
    onSuccess: invalidateAll,
  })

  const updateQuoteMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<QuoteInput> }) =>
      updateQuote(id, data),
    onSuccess: invalidateAll,
  })

  const deleteQuoteMutation = useMutation({
    mutationFn: (id: number) => deleteQuote(id),
    onSuccess: invalidateAll,
  })

  const toggleFavoriteMutation = useMutation({
    mutationFn: (id: number) => toggleFavoriteQuote(id),
    onSuccess: invalidateAll,
  })

  return {
    createQuote: createQuoteMutation,
    updateQuote: updateQuoteMutation,
    deleteQuote: deleteQuoteMutation,
    toggleFavorite: toggleFavoriteMutation,
  }
}

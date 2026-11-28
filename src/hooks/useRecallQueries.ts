import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  bulkDeleteRecallCards,
  bulkMoveRecallCards,
  createRecallCard,
  deleteRecallCard,
  emptyRecallTrash,
  getRecallStats,
  importRecallApkg,
  importRecallCards,
  listDueRecallCards,
  listRecallCards,
  listReviewedTodayRecallCards,
  purgeRecallCard,
  restoreRecallCard,
  reviewRecallCard,
  toggleRecallFavorite,
  updateRecallCard,
  type RecallCardCreateInput,
  type RecallCardUpdateInput,
  type RecallListParams,
  type RecallRating,
} from '../services/recallApi'

export const recallKeys = {
  all: ['recall'] as const,
  stats: () => [...recallKeys.all, 'stats'] as const,
  due: (deck?: string) => [...recallKeys.all, 'due', deck ?? 'all'] as const,
  reviewedToday: () => [...recallKeys.all, 'reviewedToday'] as const,
  lists: () => [...recallKeys.all, 'list'] as const,
  list: (params: RecallListParams) => [...recallKeys.lists(), params] as const,
}

export function useRecallStats() {
  return useQuery({
    queryKey: recallKeys.stats(),
    queryFn: getRecallStats,
  })
}

export function useRecallDue(deck?: string) {
  return useQuery({
    queryKey: recallKeys.due(deck),
    queryFn: () => listDueRecallCards({ deck, limit: 200 }),
  })
}

export function useRecallReviewedToday() {
  return useQuery({
    queryKey: recallKeys.reviewedToday(),
    queryFn: listReviewedTodayRecallCards,
  })
}

export function useRecallCards(params: RecallListParams = {}) {
  return useQuery({
    queryKey: recallKeys.list(params),
    queryFn: () => listRecallCards(params),
  })
}

export function useRecallMutations() {
  const qc = useQueryClient()

  const invalidateAll = () => {
    qc.invalidateQueries({ queryKey: recallKeys.all })
  }

  const create = useMutation({
    mutationFn: (input: RecallCardCreateInput) => createRecallCard(input),
    onSuccess: invalidateAll,
  })

  const bulkImport = useMutation({
    mutationFn: (cards: RecallCardCreateInput[]) => importRecallCards(cards),
    onSuccess: invalidateAll,
  })

  const importApkg = useMutation({
    mutationFn: ({ file, deck }: { file: File; deck: string }) =>
      importRecallApkg(file, deck),
    onSuccess: invalidateAll,
  })

  const bulkDelete = useMutation({
    mutationFn: (input: { ids?: number[]; deck?: string; permanent?: boolean }) =>
      bulkDeleteRecallCards(input),
    onSuccess: invalidateAll,
  })

  const bulkMove = useMutation({
    mutationFn: (input: { ids: number[]; deck: string }) => bulkMoveRecallCards(input),
    onSuccess: invalidateAll,
  })

  const emptyTrash = useMutation({
    mutationFn: () => emptyRecallTrash(),
    onSuccess: invalidateAll,
  })

  const update = useMutation({
    mutationFn: ({ id, input }: { id: number; input: RecallCardUpdateInput }) =>
      updateRecallCard(id, input),
    onSuccess: invalidateAll,
  })

  const review = useMutation({
    mutationFn: ({ id, rating }: { id: number; rating: RecallRating }) =>
      reviewRecallCard(id, rating),
    onSuccess: invalidateAll,
  })

  const toggleFavorite = useMutation({
    mutationFn: (id: number) => toggleRecallFavorite(id),
    onSuccess: invalidateAll,
  })

  const softDelete = useMutation({
    mutationFn: (id: number) => deleteRecallCard(id),
    onSuccess: invalidateAll,
  })

  const restore = useMutation({
    mutationFn: (id: number) => restoreRecallCard(id),
    onSuccess: invalidateAll,
  })

  const purge = useMutation({
    mutationFn: (id: number) => purgeRecallCard(id),
    onSuccess: invalidateAll,
  })

  return {
    create,
    bulkImport,
    importApkg,
    bulkDelete,
    bulkMove,
    emptyTrash,
    update,
    review,
    toggleFavorite,
    softDelete,
    restore,
    purge,
  }
}

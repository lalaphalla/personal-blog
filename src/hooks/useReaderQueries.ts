import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createFeedSource,
  deleteFeedSource,
  deleteSavedArticle,
  getHnFeed,
  getHnItem,
  listFeedItems,
  listFeedSources,
  listSavedArticles,
  saveArticle,
  updateSavedArticle,
  type HnCategory,
} from '../services/readerApi'

export const readerKeys = {
  all: ['reader'] as const,
  hn: (category: HnCategory, q?: string, page = 0) =>
    [...readerKeys.all, 'hn', category, q ?? '', page] as const,
  hnItem: (id?: number) => [...readerKeys.all, 'hnItem', id] as const,
  feeds: () => [...readerKeys.all, 'feeds'] as const,
  feedItems: (sourceId?: number) =>
    [...readerKeys.all, 'feedItems', sourceId ?? 'all'] as const,
  saved: (isRead?: boolean) => [...readerKeys.all, 'saved', isRead ?? 'all'] as const,
}

export function useHnFeed(category: HnCategory, q?: string, page = 0) {
  return useQuery({
    queryKey: readerKeys.hn(category, q, page),
    queryFn: () => getHnFeed({ category, q, page }),
    staleTime: 2 * 60_000,
  })
}

export function useHnItem(hnId?: number) {
  return useQuery({
    queryKey: readerKeys.hnItem(hnId),
    queryFn: () => getHnItem(hnId!),
    enabled: Boolean(hnId),
    staleTime: 2 * 60_000,
  })
}

export function useFeedSources() {
  return useQuery({
    queryKey: readerKeys.feeds(),
    queryFn: listFeedSources,
  })
}

export function useFeedItems(sourceId?: number) {
  return useQuery({
    queryKey: readerKeys.feedItems(sourceId),
    queryFn: () => listFeedItems({ source_id: sourceId, limit: 60 }),
    staleTime: 2 * 60_000,
  })
}

export function useSavedArticles(isRead?: boolean) {
  return useQuery({
    queryKey: readerKeys.saved(isRead),
    queryFn: () => listSavedArticles(isRead),
  })
}

export function useReaderMutations() {
  const qc = useQueryClient()

  const addFeed = useMutation({
    mutationFn: createFeedSource,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: readerKeys.feeds() })
      qc.invalidateQueries({ queryKey: [...readerKeys.all, 'feedItems'] })
    },
  })

  const removeFeed = useMutation({
    mutationFn: deleteFeedSource,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: readerKeys.feeds() })
      qc.invalidateQueries({ queryKey: [...readerKeys.all, 'feedItems'] })
    },
  })

  const bookmark = useMutation({
    mutationFn: saveArticle,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...readerKeys.all, 'saved'] })
    },
  })

  const toggleRead = useMutation({
    mutationFn: ({ id, isRead }: { id: number; isRead: boolean }) =>
      updateSavedArticle(id, isRead),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...readerKeys.all, 'saved'] })
    },
  })

  const removeBookmark = useMutation({
    mutationFn: deleteSavedArticle,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...readerKeys.all, 'saved'] })
    },
  })

  return {
    addFeed,
    removeFeed,
    bookmark,
    toggleRead,
    removeBookmark,
  }
}

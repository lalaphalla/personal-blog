import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  addAttachment,
  createEntry,
  deleteAttachment,
  deleteEntry,
  getCalendar,
  getMemories,
  getMoodSummary,
  getTimeline,
  getTodayJournal,
  getEntry,
  listEntries,
  listPrompts,
  purgeEntry,
  restoreEntry,
  toggleFavorite,
  updateEntry,
  type JournalAttachmentInput,
  type JournalEntryInput,
  type JournalListParams,
} from '../services/journalApi'

export const journalKeys = {
  all: ['admin', 'journal'] as const,
  today: (date?: string) => [...journalKeys.all, 'today', date ?? 'current'] as const,
  entry: (id: number) => [...journalKeys.all, 'entry', id] as const,
  calendar: (year: number, month: number) => [...journalKeys.all, 'calendar', year, month] as const,
  timeline: (cursor?: string | null) => [...journalKeys.all, 'timeline', cursor ?? 'root'] as const,
  memories: (date?: string) => [...journalKeys.all, 'memories', date ?? 'current'] as const,
  prompts: () => [...journalKeys.all, 'prompts'] as const,
  moods: (year: number, month: number) => [...journalKeys.all, 'moods', year, month] as const,
  list: (params: JournalListParams) => [...journalKeys.all, 'list', params] as const,
}

export function useTodayJournal(date?: string) {
  return useQuery({
    queryKey: journalKeys.today(date),
    queryFn: () => getTodayJournal(date),
  })
}

export function useJournalEntry(id: number | null | undefined) {
  return useQuery({
    queryKey: journalKeys.entry(id as number),
    queryFn: () => getEntry(id as number),
    enabled: typeof id === 'number' && id > 0,
  })
}

export function useJournalCalendar(year: number, month: number) {
  return useQuery({
    queryKey: journalKeys.calendar(year, month),
    queryFn: () => getCalendar(year, month),
  })
}

export function useJournalTimeline(cursor?: string | null, limit = 30) {
  return useQuery({
    queryKey: journalKeys.timeline(cursor),
    queryFn: () => getTimeline(cursor, limit),
  })
}

export function useJournalMemories(date?: string) {
  return useQuery({
    queryKey: journalKeys.memories(date),
    queryFn: () => getMemories(date),
  })
}

export function useJournalPrompts() {
  return useQuery({
    queryKey: journalKeys.prompts(),
    queryFn: listPrompts,
    staleTime: 60 * 60 * 1000, // 1 hour
  })
}

export function useJournalMoodSummary(year: number, month: number) {
  return useQuery({
    queryKey: journalKeys.moods(year, month),
    queryFn: () => getMoodSummary(year, month),
  })
}

export function useJournalList(params: JournalListParams) {
  return useQuery({
    queryKey: journalKeys.list(params),
    queryFn: () => listEntries(params),
  })
}

export function useJournalMutations() {
  const queryClient = useQueryClient()

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: journalKeys.all })
  }

  // One-way save: the entry cache is written from the mutation response, never refetched
  // into the editor. Lists/calendar/timeline still refresh (they show last-edited times).
  const invalidateExceptEntry = () => {
    queryClient.invalidateQueries({
      queryKey: journalKeys.all,
      predicate: (query) => query.queryKey[2] !== 'entry',
    })
  }

  const createEntryMutation = useMutation({
    mutationFn: (data: JournalEntryInput) => createEntry(data),
    onSuccess: (created) => {
      // Seed the entry cache so the post-create navigate renders the form
      // immediately (no spinner → no unmount mid-typing).
      queryClient.setQueryData(journalKeys.entry(created.id), created)
      invalidateExceptEntry()
    },
  })

  const updateEntryMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<JournalEntryInput> }) =>
      updateEntry(id, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(journalKeys.entry(updated.id), updated)
      invalidateExceptEntry()
    },
  })

  const deleteEntryMutation = useMutation({
    mutationFn: (id: number) => deleteEntry(id),
    onSuccess: invalidateAll,
  })

  const restoreEntryMutation = useMutation({
    mutationFn: (id: number) => restoreEntry(id),
    onSuccess: invalidateAll,
  })

  const purgeEntryMutation = useMutation({
    mutationFn: (id: number) => purgeEntry(id),
    onSuccess: invalidateAll,
  })

  const toggleFavoriteMutation = useMutation({
    mutationFn: (id: number) => toggleFavorite(id),
    onSuccess: invalidateAll,
  })

  const addAttachmentMutation = useMutation({
    mutationFn: ({ entryId, data }: { entryId: number; data: JournalAttachmentInput }) =>
      addAttachment(entryId, data),
    onSuccess: invalidateAll,
  })

  const deleteAttachmentMutation = useMutation({
    mutationFn: (id: number) => deleteAttachment(id),
    onSuccess: invalidateAll,
  })

  return {
    createEntry: createEntryMutation,
    updateEntry: updateEntryMutation,
    deleteEntry: deleteEntryMutation,
    restoreEntry: restoreEntryMutation,
    purgeEntry: purgeEntryMutation,
    toggleFavorite: toggleFavoriteMutation,
    addAttachment: addAttachmentMutation,
    deleteAttachment: deleteAttachmentMutation,
  }
}

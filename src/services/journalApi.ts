import { request } from './http'

export type Mood = 'great' | 'good' | 'okay' | 'low' | 'bad'
export type AttachmentKind = 'image' | 'video' | 'audio' | 'file'

export interface JournalAttachment {
  id: number
  kind: AttachmentKind
  url: string
  filename: string
  mime_type: string | null
  size_bytes: number | null
  position: number
  created_at: string
}

export interface JournalEntry {
  id: number
  entry_date: string // YYYY-MM-DD
  title: string
  content: string
  mood: Mood | null
  tags: string[]
  location: string | null
  prompt_id: number | null
  is_favorite: boolean
  deleted_at: string | null
  gratitude: string | null
  highlight: string | null
  challenge: string | null
  lesson: string | null
  created_at: string
  updated_at: string
  attachments: JournalAttachment[]
}

export interface JournalEntrySummary {
  id: number
  entry_date: string
  title: string
  excerpt: string
  mood: Mood | null
  tags: string[]
  is_favorite: boolean
  deleted_at: string | null
  created_at: string
  updated_at: string
  attachment_count: number
  has_photos: boolean
}

export interface JournalPrompt {
  id: number
  text: string
  is_active: boolean
}

export interface JournalCalendarDay {
  date: string
  entries: number
  moods: Mood[]
  has_photos: boolean
}

export interface JournalCalendarOut {
  year: number
  month: number
  days: JournalCalendarDay[]
}

export interface JournalTodayOut {
  date: string
  entries: JournalEntrySummary[]
}

export interface JournalTimelineOut {
  items: JournalEntrySummary[]
  next_cursor: string | null
}

export interface JournalMemoryGroup {
  label: string
  date: string
  entries: JournalEntrySummary[]
}

export interface JournalMemoriesOut {
  date: string
  groups: JournalMemoryGroup[]
}

export interface MoodSummaryOut {
  year: number
  month: number
  counts: Record<Mood, number>
  total: number
  best_days: string[]
}

export interface JournalEntryInput {
  entry_date: string
  title?: string
  content?: string
  mood?: Mood | null
  tags?: string[]
  location?: string | null
  prompt_id?: number | null
  is_favorite?: boolean
  gratitude?: string | null
  highlight?: string | null
  challenge?: string | null
  lesson?: string | null
}

export interface JournalListParams {
  start?: string
  end?: string
  mood?: Mood
  tag?: string
  favorite?: boolean
  q?: string
  cursor?: string | null
  limit?: number
  include_deleted?: boolean
}

export interface JournalAttachmentInput {
  kind?: AttachmentKind
  url: string
  filename: string
  mime_type?: string | null
  size_bytes?: number | null
  position?: number | null
}

export function getTodayJournal(date?: string): Promise<JournalTodayOut> {
  const query = date ? `?date=${encodeURIComponent(date)}` : ''
  return request<JournalTodayOut>(`/admin/journal/today${query}`)
}

export function getCalendar(year: number, month: number): Promise<JournalCalendarOut> {
  return request<JournalCalendarOut>(`/admin/journal/calendar?year=${year}&month=${month}`)
}

export function getTimeline(cursor?: string | null, limit = 30): Promise<JournalTimelineOut> {
  const params = new URLSearchParams()
  if (cursor) params.set('cursor', cursor)
  if (limit) params.set('limit', String(limit))
  const qs = params.toString()
  return request<JournalTimelineOut>(`/admin/journal/timeline${qs ? `?${qs}` : ''}`)
}

export function getMemories(date?: string): Promise<JournalMemoriesOut> {
  const query = date ? `?date=${encodeURIComponent(date)}` : ''
  return request<JournalMemoriesOut>(`/admin/journal/memories${query}`)
}

export function listPrompts(): Promise<JournalPrompt[]> {
  return request<JournalPrompt[]>('/admin/journal/prompts')
}

export function getMoodSummary(year: number, month: number): Promise<MoodSummaryOut> {
  return request<MoodSummaryOut>(`/admin/journal/moods?year=${year}&month=${month}`)
}

export function listEntries(params: JournalListParams = {}): Promise<JournalTimelineOut> {
  const search = new URLSearchParams()
  if (params.start) search.set('start', params.start)
  if (params.end) search.set('end', params.end)
  if (params.mood) search.set('mood', params.mood)
  if (params.tag) search.set('tag', params.tag)
  if (params.favorite !== undefined) search.set('favorite', String(params.favorite))
  if (params.q) search.set('q', params.q)
  if (params.cursor) search.set('cursor', params.cursor)
  if (params.limit !== undefined) search.set('limit', String(params.limit))
  if (params.include_deleted) search.set('include_deleted', 'true')
  const qs = search.toString()
  return request<JournalTimelineOut>(`/admin/journal/entries${qs ? `?${qs}` : ''}`)
}

export function createEntry(data: JournalEntryInput): Promise<JournalEntry> {
  return request<JournalEntry>('/admin/journal/entries', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function getEntry(id: number): Promise<JournalEntry> {
  return request<JournalEntry>(`/admin/journal/entries/${id}`)
}

export function updateEntry(id: number, data: Partial<JournalEntryInput>): Promise<JournalEntry> {
  return request<JournalEntry>(`/admin/journal/entries/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export function deleteEntry(id: number): Promise<void> {
  return request<void>(`/admin/journal/entries/${id}`, {
    method: 'DELETE',
  })
}

export function restoreEntry(id: number): Promise<JournalEntry> {
  return request<JournalEntry>(`/admin/journal/entries/${id}/restore`, {
    method: 'POST',
  })
}

export function purgeEntry(id: number): Promise<void> {
  return request<void>(`/admin/journal/entries/${id}/permanent`, {
    method: 'DELETE',
  })
}

export function toggleFavorite(id: number): Promise<JournalEntry> {
  return request<JournalEntry>(`/admin/journal/entries/${id}/favorite`, {
    method: 'POST',
  })
}

export function addAttachment(
  entryId: number,
  data: JournalAttachmentInput
): Promise<JournalAttachment> {
  return request<JournalAttachment>(`/admin/journal/entries/${entryId}/attachments`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function deleteAttachment(attachmentId: number): Promise<void> {
  return request<void>(`/admin/journal/attachments/${attachmentId}`, {
    method: 'DELETE',
  })
}

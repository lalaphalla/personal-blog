import { request } from './http'

export type RecallRating = 'again' | 'hard' | 'good' | 'easy'

export interface RecallCard {
  id: number
  front: string
  back: string
  hint: string | null
  deck: string
  tags: string[]
  source_url: string | null
  is_favorite: boolean
  is_suspended: boolean
  repetitions: number
  interval_days: number
  ease_factor: number
  due_date: string
  last_reviewed_at: string | null
  total_reviews: number
  deleted_at: string | null
  created_at: string
  updated_at: string
  next_intervals: Record<RecallRating, number>
}

export interface RecallCardListOut {
  items: RecallCard[]
  total: number
}

export interface RecallDeckStats {
  name: string
  total: number
  due: number
}

export interface RecallStats {
  due_today: number
  total_cards: number
  reviewed_today: number
  mastered_count: number
  decks: RecallDeckStats[]
}

export interface RecallCardCreateInput {
  front: string
  back: string
  hint?: string | null
  deck?: string
  tags?: string[]
  source_url?: string | null
  is_favorite?: boolean
  is_suspended?: boolean
}

export interface RecallCardUpdateInput {
  front?: string
  back?: string
  hint?: string | null
  deck?: string
  tags?: string[]
  source_url?: string | null
  is_favorite?: boolean
  is_suspended?: boolean
}

export interface RecallListParams {
  q?: string
  deck?: string
  tag?: string
  favorite?: boolean
  suspended?: boolean
  include_deleted?: boolean
  limit?: number
  offset?: number
}

export function getRecallStats(): Promise<RecallStats> {
  return request<RecallStats>('/admin/recall/stats')
}

export function listDueRecallCards(params: { deck?: string; limit?: number } = {}): Promise<RecallCard[]> {
  const search = new URLSearchParams()
  if (params.deck) search.set('deck', params.deck)
  if (params.limit !== undefined) search.set('limit', String(params.limit))
  const qs = search.toString()
  return request<RecallCard[]>(`/admin/recall/due${qs ? `?${qs}` : ''}`)
}

export function listRecallCards(params: RecallListParams = {}): Promise<RecallCardListOut> {
  const search = new URLSearchParams()
  if (params.q) search.set('q', params.q)
  if (params.deck) search.set('deck', params.deck)
  if (params.tag) search.set('tag', params.tag)
  if (params.favorite !== undefined) search.set('favorite', String(params.favorite))
  if (params.suspended !== undefined) search.set('suspended', String(params.suspended))
  if (params.include_deleted !== undefined) {
    search.set('include_deleted', String(params.include_deleted))
  }
  if (params.limit !== undefined) search.set('limit', String(params.limit))
  if (params.offset !== undefined) search.set('offset', String(params.offset))
  const qs = search.toString()
  return request<RecallCardListOut>(`/admin/recall/cards${qs ? `?${qs}` : ''}`)
}

export function createRecallCard(input: RecallCardCreateInput): Promise<RecallCard> {
  return request<RecallCard>('/admin/recall/cards', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function importRecallCards(
  cards: RecallCardCreateInput[],
): Promise<{ created_count: number; items: RecallCard[] }> {
  return request<{ created_count: number; items: RecallCard[] }>('/admin/recall/import', {
    method: 'POST',
    body: JSON.stringify({ cards }),
  })
}

export function importRecallApkg(
  file: File,
  deck: string,
): Promise<{ created_count: number; items: RecallCard[] }> {
  const data = new FormData()
  data.append('file', file)
  data.append('deck', deck.trim() || 'Anki Import')
  return request<{ created_count: number; items: RecallCard[] }>('/admin/recall/import-apkg', {
    method: 'POST',
    body: data,
  })
}

export function bulkDeleteRecallCards(input: {
  ids?: number[]
  deck?: string
  permanent?: boolean
}): Promise<{ deleted_count: number }> {
  return request<{ deleted_count: number }>('/admin/recall/bulk-delete', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function bulkMoveRecallCards(input: {
  ids: number[]
  deck: string
}): Promise<{ updated_count: number }> {
  return request<{ updated_count: number }>('/admin/recall/bulk-move', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function emptyRecallTrash(): Promise<{ deleted_count: number }> {
  return request<{ deleted_count: number }>('/admin/recall/trash/empty', {
    method: 'DELETE',
  })
}

export function updateRecallCard(id: number, input: RecallCardUpdateInput): Promise<RecallCard> {
  return request<RecallCard>(`/admin/recall/cards/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
}

export function reviewRecallCard(id: number, rating: RecallRating): Promise<RecallCard> {
  return request<RecallCard>(`/admin/recall/cards/${id}/review`, {
    method: 'POST',
    body: JSON.stringify({ rating }),
  })
}

export function toggleRecallFavorite(id: number): Promise<RecallCard> {
  return request<RecallCard>(`/admin/recall/cards/${id}/favorite`, { method: 'POST' })
}

export function deleteRecallCard(id: number): Promise<void> {
  return request<void>(`/admin/recall/cards/${id}`, { method: 'DELETE' })
}

export function restoreRecallCard(id: number): Promise<RecallCard> {
  return request<RecallCard>(`/admin/recall/cards/${id}/restore`, { method: 'POST' })
}

export function purgeRecallCard(id: number): Promise<void> {
  return request<void>(`/admin/recall/cards/${id}/permanent`, { method: 'DELETE' })
}

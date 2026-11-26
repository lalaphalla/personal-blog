import { request } from './http'

export type HnCategory = 'top' | 'new' | 'ask' | 'show'

export interface HnStory {
  id: number
  title: string
  url: string
  domain: string | null
  author: string
  points: number
  num_comments: number
  created_at: string
  story_text: string | null
}

export interface HnFeed {
  category: HnCategory
  page: number
  items: HnStory[]
}

export interface HnComment {
  id: number
  author: string | null
  text: string
  created_at: string
  children: HnComment[]
}

export interface HnItem {
  id: number
  title: string
  url: string
  author: string
  points: number
  text: string | null
  created_at: string
  children: HnComment[]
}

export interface FeedSource {
  id: number
  name: string
  url: string
  category: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface FeedItem {
  source_id: number
  source_name: string
  category: string
  title: string
  url: string
  author: string | null
  published_at: string | null
  summary: string | null
}

export interface SavedArticle {
  id: number
  title: string
  url: string
  source: string
  author: string | null
  hn_id: number | null
  summary: string | null
  is_read: boolean
  created_at: string
}

export function getHnFeed(params: {
  category?: HnCategory
  q?: string
  page?: number
} = {}): Promise<HnFeed> {
  const search = new URLSearchParams()
  if (params.category) search.set('category', params.category)
  if (params.q) search.set('q', params.q)
  if (params.page !== undefined) search.set('page', String(params.page))
  const qs = search.toString()
  return request<HnFeed>(`/admin/reader/hn${qs ? `?${qs}` : ''}`)
}

export function getHnItem(hnId: number): Promise<HnItem> {
  return request<HnItem>(`/admin/reader/hn/${hnId}`)
}

export function listFeedSources(): Promise<FeedSource[]> {
  return request<FeedSource[]>('/admin/reader/feeds')
}

export function createFeedSource(input: {
  name: string
  url: string
  category?: string
}): Promise<FeedSource> {
  return request<FeedSource>('/admin/reader/feeds', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function deleteFeedSource(id: number): Promise<void> {
  return request<void>(`/admin/reader/feeds/${id}`, { method: 'DELETE' })
}

export function listFeedItems(params: {
  source_id?: number
  limit?: number
} = {}): Promise<FeedItem[]> {
  const search = new URLSearchParams()
  if (params.source_id !== undefined) search.set('source_id', String(params.source_id))
  if (params.limit !== undefined) search.set('limit', String(params.limit))
  const qs = search.toString()
  return request<FeedItem[]>(`/admin/reader/feeds/items${qs ? `?${qs}` : ''}`)
}

export function listSavedArticles(isRead?: boolean): Promise<SavedArticle[]> {
  const search = new URLSearchParams()
  if (isRead !== undefined) search.set('is_read', String(isRead))
  const qs = search.toString()
  return request<SavedArticle[]>(`/admin/reader/saved${qs ? `?${qs}` : ''}`)
}

export function saveArticle(input: {
  title: string
  url: string
  source?: string
  author?: string | null
  hn_id?: number | null
  summary?: string | null
}): Promise<SavedArticle> {
  return request<SavedArticle>('/admin/reader/saved', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function updateSavedArticle(id: number, isRead: boolean): Promise<SavedArticle> {
  return request<SavedArticle>(`/admin/reader/saved/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ is_read: isRead }),
  })
}

export function deleteSavedArticle(id: number): Promise<void> {
  return request<void>(`/admin/reader/saved/${id}`, { method: 'DELETE' })
}

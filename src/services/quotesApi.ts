import { request } from './http'

export type SourceType = 'book' | 'movie' | 'show' | 'speech' | 'article' | 'person' | 'other'

export interface Quote {
  id: number
  content: string
  author: string | null
  source_title: string | null
  source_type: SourceType | null
  said_year: number | null
  said_date: string | null
  context: string | null
  source_url: string | null
  image_url: string | null
  tags: string[]
  is_favorite: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface QuoteInput {
  content: string
  author?: string | null
  source_title?: string | null
  source_type?: SourceType | null
  said_year?: number | null
  said_date?: string | null
  context?: string | null
  source_url?: string | null
  image_url?: string | null
  tags?: string[]
  is_favorite?: boolean
  is_active?: boolean
}

export interface QuoteListParams {
  author?: string
  source_type?: SourceType
  tag?: string
  favorite?: boolean
  active?: boolean
  q?: string
  limit?: number
  offset?: number
}

export interface QuoteListResponse {
  items: Quote[]
  total: number
}

export function getDailyQuote(date?: string): Promise<Quote | null> {
  const query = date ? `?date=${encodeURIComponent(date)}` : ''
  return request<Quote | null>(`/admin/quotes/today${query}`)
}

export function getRandomQuote(excludeId?: number): Promise<Quote | null> {
  const query = excludeId ? `?exclude_id=${excludeId}` : ''
  return request<Quote | null>(`/admin/quotes/random${query}`)
}

export function listQuotes(params: QuoteListParams = {}): Promise<QuoteListResponse> {
  const search = new URLSearchParams()
  if (params.author) search.set('author', params.author)
  if (params.source_type) search.set('source_type', params.source_type)
  if (params.tag) search.set('tag', params.tag)
  if (params.favorite !== undefined) search.set('favorite', String(params.favorite))
  if (params.active !== undefined) search.set('active', String(params.active))
  if (params.q) search.set('q', params.q)
  if (params.limit !== undefined) search.set('limit', String(params.limit))
  if (params.offset !== undefined) search.set('offset', String(params.offset))
  const qs = search.toString()
  return request<QuoteListResponse>(`/admin/quotes${qs ? `?${qs}` : ''}`)
}

export function createQuote(data: QuoteInput): Promise<Quote> {
  return request<Quote>('/admin/quotes', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function getQuote(id: number): Promise<Quote> {
  return request<Quote>(`/admin/quotes/${id}`)
}

export function updateQuote(id: number, data: Partial<QuoteInput>): Promise<Quote> {
  return request<Quote>(`/admin/quotes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export function deleteQuote(id: number): Promise<void> {
  return request<void>(`/admin/quotes/${id}`, {
    method: 'DELETE',
  })
}

export function toggleFavoriteQuote(id: number): Promise<Quote> {
  return request<Quote>(`/admin/quotes/${id}/favorite`, {
    method: 'POST',
  })
}

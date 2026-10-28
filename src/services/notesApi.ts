import { request } from './http'

export type NoteView = 'all' | 'favorite' | 'archive'

export interface Notebook {
  id: number
  name: string
  color: string | null
  position: number
  created_at: string
  updated_at: string
}

export interface Note {
  id: number
  notebook_id: number | null
  is_favorite: boolean
  archived_at: string | null
  title: string
  tags: string[]
  content: string
  created_at: string
  updated_at: string
}

export interface NoteListParams {
  view?: NoteView
  notebook_id?: number
  limit?: number
  tag?: string
  search?: string
}

export interface NoteInput {
  title: string
  content: string
  tags?: string[]
  notebook_id?: number | null
}

export function listNotebooks(): Promise<Notebook[]> {
  return request<Notebook[]>('/admin/notebooks')
}

export function listAllTags(): Promise<string[]> {
  return request<{ tags: string[] }>('/admin/notes/tags').then((data) => data.tags)
}

export function createNotebook(input: { name: string; color?: string }): Promise<Notebook> {
  return request<Notebook>('/admin/notebooks', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function updateNotebook(id: number, patch: Partial<{ name: string; color: string | null; position: number }>): Promise<Notebook> {
  return request<Notebook>(`/admin/notebooks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(patch),
  })
}

export function deleteNotebook(id: number): Promise<void> {
  return request<void>(`/admin/notebooks/${id}`, { method: 'DELETE' })
}

function noteQuery(params: NoteListParams): string {
  const search = new URLSearchParams()
  if (params.view && params.view !== 'all') search.set('view', params.view)
  if (params.notebook_id !== undefined) search.set('notebook_id', String(params.notebook_id))
  if (params.limit !== undefined) search.set('limit', String(params.limit))
  if (params.tag) search.set('tag', params.tag)
  if (params.search) search.set('search', params.search)
  const query = search.toString()
  return query ? `?${query}` : ''
}

export function listNotes(params: NoteListParams = {}): Promise<Note[]> {
  return request<Note[]>(`/admin/notes${noteQuery(params)}`)
}

export function getNote(id: number): Promise<Note> {
  return request<Note>(`/admin/notes/${id}`)
}

export function createNote(input: NoteInput & { is_favorite?: boolean }): Promise<Note> {
  return request<Note>('/admin/notes', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function updateNote(id: number, patch: Partial<NoteInput> & { is_favorite?: boolean }): Promise<Note> {
  return request<Note>(`/admin/notes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(patch),
  })
}

export function deleteNote(id: number): Promise<void> {
  return request<void>(`/admin/notes/${id}`, { method: 'DELETE' })
}

export function toggleFavoriteNote(id: number): Promise<Note> {
  return request<Note>(`/admin/notes/${id}/favorite`, { method: 'POST' })
}

export function archiveNote(id: number): Promise<Note> {
  return request<Note>(`/admin/notes/${id}/archive`, { method: 'POST' })
}

export function unarchiveNote(id: number): Promise<Note> {
  return request<Note>(`/admin/notes/${id}/unarchive`, { method: 'POST' })
}

import { request } from './http'

export type MindmapNodeColor =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'purple'

export interface MindmapLinkedEntity {
  type: 'note' | 'journal'
  id: number
  title: string
}

export interface MindmapNodeData {
  label: string
  color?: MindmapNodeColor
  notes?: string
  collapsed?: boolean
  linkedEntity?: MindmapLinkedEntity | null
  [key: string]: unknown
}

export interface MindmapNodeRecord {
  id: string
  type?: string
  position: { x: number; y: number }
  data: MindmapNodeData
  [key: string]: unknown
}

export interface MindmapEdgeRecord {
  id: string
  source: string
  target: string
  type?: string
  [key: string]: unknown
}

export interface MindmapViewport {
  x: number
  y: number
  zoom: number
}

export interface Mindmap {
  id: number
  title: string
  description: string | null
  nodes: MindmapNodeRecord[]
  edges: MindmapEdgeRecord[]
  viewport: MindmapViewport | null
  node_count: number
  is_favorite: boolean
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export interface MindmapSummary {
  id: number
  title: string
  description: string | null
  node_count: number
  is_favorite: boolean
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export interface MindmapListOut {
  items: MindmapSummary[]
  total: number
}

export interface MindmapCreateInput {
  title?: string
  description?: string | null
  nodes?: MindmapNodeRecord[]
  edges?: MindmapEdgeRecord[]
  viewport?: MindmapViewport | null
  is_favorite?: boolean
}

export interface MindmapUpdateInput {
  title?: string
  description?: string | null
  nodes?: MindmapNodeRecord[]
  edges?: MindmapEdgeRecord[]
  viewport?: MindmapViewport | null
  is_favorite?: boolean
}

export interface MindmapListParams {
  q?: string
  favorite?: boolean
  include_deleted?: boolean
  limit?: number
  offset?: number
}

export function listMindmaps(params: MindmapListParams = {}): Promise<MindmapListOut> {
  const search = new URLSearchParams()
  if (params.q) search.set('q', params.q)
  if (params.favorite !== undefined) search.set('favorite', String(params.favorite))
  if (params.include_deleted !== undefined) {
    search.set('include_deleted', String(params.include_deleted))
  }
  if (params.limit !== undefined) search.set('limit', String(params.limit))
  if (params.offset !== undefined) search.set('offset', String(params.offset))
  const qs = search.toString()
  return request<MindmapListOut>(`/admin/mindmaps${qs ? `?${qs}` : ''}`)
}

export function getMindmap(id: number): Promise<Mindmap> {
  return request<Mindmap>(`/admin/mindmaps/${id}`)
}

export function createMindmap(input: MindmapCreateInput = {}): Promise<Mindmap> {
  return request<Mindmap>('/admin/mindmaps', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function updateMindmap(id: number, input: MindmapUpdateInput): Promise<Mindmap> {
  return request<Mindmap>(`/admin/mindmaps/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
}

export function toggleMindmapFavorite(id: number): Promise<Mindmap> {
  return request<Mindmap>(`/admin/mindmaps/${id}/favorite`, { method: 'POST' })
}

export function deleteMindmap(id: number): Promise<void> {
  return request<void>(`/admin/mindmaps/${id}`, { method: 'DELETE' })
}

export function restoreMindmap(id: number): Promise<Mindmap> {
  return request<Mindmap>(`/admin/mindmaps/${id}/restore`, { method: 'POST' })
}

export function purgeMindmap(id: number): Promise<void> {
  return request<void>(`/admin/mindmaps/${id}/permanent`, { method: 'DELETE' })
}

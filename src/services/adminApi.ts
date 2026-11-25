import { request } from './http'
import type { Post, PostInput, PostPage, PostStatus } from '../types/blog'
import { compressImageForUpload } from '../utils/imageCompression'

export interface AdminListParams {
  page?: number
  limit?: number
  status?: PostStatus
}

export interface UploadedImage {
  filename: string
  url: string
  thumbnail_url?: string | null
  size_bytes: number
  created_at: number
}

export function adminListImages(): Promise<UploadedImage[]> {
  return request<UploadedImage[]>('/admin/uploads')
}

export async function adminUploadImage(file: File): Promise<UploadedImage> {
  const prepared = await compressImageForUpload(file)
  const data = new FormData()
  data.append('file', prepared)
  return request<UploadedImage>('/admin/uploads', { method: 'POST', body: data })
}

export function adminListPosts(params: AdminListParams = {}): Promise<PostPage> {
  const search = new URLSearchParams()
  if (params.page !== undefined) search.set('page', String(params.page))
  if (params.limit !== undefined) search.set('limit', String(params.limit))
  if (params.status !== undefined) search.set('status', params.status)
  const query = search.toString()
  return request<PostPage>(`/admin/posts${query ? `?${query}` : ''}`)
}

export function adminGetPost(id: number): Promise<Post> {
  return request<Post>(`/admin/posts/${id}`)
}

export function adminCreatePost(input: PostInput): Promise<Post> {
  return request<Post>('/admin/posts', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function adminUpdatePost(id: number, input: PostInput): Promise<Post> {
  return request<Post>(`/admin/posts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
}

export function adminDeletePost(id: number): Promise<void> {
  return request<void>(`/admin/posts/${id}`, { method: 'DELETE' })
}

export function adminPublishPost(id: number): Promise<Post> {
  return request<Post>(`/admin/posts/${id}/publish`, { method: 'POST' })
}

export function adminUnpublishPost(id: number): Promise<Post> {
  return request<Post>(`/admin/posts/${id}/unpublish`, { method: 'POST' })
}

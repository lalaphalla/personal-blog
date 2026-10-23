import { request } from './http'
import type { ListPostsParams, Post, PostPage } from '../types/blog'

export { ApiError } from './http'

export function listPosts(params: ListPostsParams = {}): Promise<PostPage> {
  const search = new URLSearchParams()
  if (params.page !== undefined) search.set('page', String(params.page))
  if (params.limit !== undefined) search.set('limit', String(params.limit))
  const query = search.toString()
  return request<PostPage>(`/posts${query ? `?${query}` : ''}`)
}

export function getPostBySlug(slug: string): Promise<Post> {
  return request<Post>(`/posts/${encodeURIComponent(slug)}`)
}

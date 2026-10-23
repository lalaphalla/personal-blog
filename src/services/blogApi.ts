import { apiUrl } from '../config/api'
import type { ListPostsParams, Post, PostPage } from '../types/blog'

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(apiUrl(path), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })

  if (!response.ok) {
    let message = response.statusText
    try {
      const body = await response.json()
      if (typeof body?.detail === 'string') {
        message = body.detail
      }
    } catch {
      // response had no JSON body
    }
    throw new ApiError(response.status, message)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

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

export type PostStatus = 'draft' | 'published'

export interface Post {
  id: number
  title: string
  slug: string
  description: string | null
  category: string | null
  cover_url: string | null
  tags: string[]
  content: string
  status: PostStatus
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface PostPage {
  items: Post[]
  total: number
  page: number
  limit: number
}

export interface ListPostsParams {
  page?: number
  limit?: number
  status?: PostStatus
}

export interface PostInput {
  title: string
  slug?: string | null
  description?: string | null
  category?: string | null
  cover_url?: string | null
  tags?: string[]
  content?: string
}

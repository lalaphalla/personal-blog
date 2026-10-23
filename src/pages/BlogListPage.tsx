import { useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { Link as RouterLink } from 'react-router'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Container from '@mui/material/Container'
import Link from '@mui/material/Link'
import Pagination from '@mui/material/Pagination'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { formatDate } from '../utils/format'
import { listPosts } from '../services/blogApi'
import type { Post } from '../types/blog'

const PAGE_SIZE = 10

function PostCardSkeleton() {
  return (
    <Card component="li" variant="outlined" sx={{ bgcolor: 'transparent' }}>
      <CardContent>
        <Skeleton width={180} height={32} sx={{ borderRadius: 1 }} />
        <Skeleton width="70%" height={40} sx={{ mt: 1 }} />
        <Skeleton width="100%" />
      </CardContent>
    </Card>
  )
}

function postTag(post: Post): string {
  return post.tags[0] ?? post.category ?? 'Article'
}

function postDate(post: Post): string {
  return post.published_at ?? post.created_at
}

function BlogListPage() {
  const [page, setPage] = useState(1)

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ['posts', page],
    queryFn: () => listPosts({ page, limit: PAGE_SIZE }),
    placeholderData: keepPreviousData,
  })

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0

  return (
    <Container component="main" maxWidth="md" sx={{ py: 6, flex: 1 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h1" component="h1">
          Blog
        </Typography>
        <Typography color="text.secondary">
          Notes, guides, and stories about building for the web.
        </Typography>
      </Box>

      {isError && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              Retry
            </Button>
          }
        >
          {error instanceof Error ? error.message : 'Failed to load posts.'}
        </Alert>
      )}

      <Stack component="ul" spacing={2} sx={{ listStyle: 'none', p: 0, m: 0 }}>
        {isPending && (
          <>
            <PostCardSkeleton />
            <PostCardSkeleton />
            <PostCardSkeleton />
          </>
        )}

        {data?.items.map((post) => (
          <Card
            key={post.id}
            component="li"
            variant="outlined"
            sx={{ bgcolor: 'transparent' }}
          >
            <CardContent>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1.5 }}>
                <Chip
                  label={postTag(post)}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
                <Typography variant="caption" color="text.secondary">
                  <time dateTime={postDate(post)}>{formatDate(postDate(post))}</time>
                </Typography>
              </Stack>

              <Typography variant="h5" component="h2" gutterBottom>
                <Link
                  component={RouterLink}
                  to={`/blog/${post.slug}`}
                  color="inherit"
                  underline="hover"
                >
                  {post.title}
                </Link>
              </Typography>

              {post.description && (
                <Typography color="text.secondary" sx={{ mb: 1.5 }}>
                  {post.description}
                </Typography>
              )}

              <Link
                component={RouterLink}
                to={`/blog/${post.slug}`}
                color="primary"
                underline="hover"
              >
                Read more →
              </Link>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {data && data.items.length === 0 && !isError && (
        <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
          No posts yet.
        </Typography>
      )}

      {totalPages > 1 && (
        <Pagination
          count={totalPages}
          page={page}
          onChange={(_, next) => setPage(next)}
          color="primary"
          sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}
        />
      )}
    </Container>
  )
}

export default BlogListPage

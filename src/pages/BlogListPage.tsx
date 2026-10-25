import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { Link as RouterLink, useSearchParams } from 'react-router'
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
const WORDS_PER_MINUTE = 220

const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

const srOnly = {
  position: 'absolute',
  width: 1,
  height: 1,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
  border: 0,
  p: 0,
  m: -1,
} as const

/** Optional fields the list endpoint may or may not return. */
type PostExtras = {
  author?: { name: string }
  reading_time?: number
  content?: string
}

function relativeOrAbsolute(iso: string): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return formatDate(iso)

  const days = Math.round((then - Date.now()) / 86_400_000)
  return Math.abs(days) < 30 ? rtf.format(days, 'day') : formatDate(iso)
}

function readingMinutes(post: Post): number | null {
  const extras = post as Partial<PostExtras>
  if (extras.reading_time) return extras.reading_time

  const words = extras.content?.trim().split(/\s+/).length
  if (!words) return null

  return Math.max(1, Math.round(words / WORDS_PER_MINUTE))
}

function Dot() {
  return (
    <Typography component="span" variant="caption" color="text.secondary" aria-hidden>
      ·
    </Typography>
  )
}

function PostMeta({ post }: { post: Post }) {
  const date = post.published_at ?? post.created_at
  const author = (post as Partial<PostExtras>).author?.name
  const minutes = readingMinutes(post)

  const showDate = Boolean(date)
  const showAuthor = Boolean(author)
  const showMinutes = Boolean(minutes)

  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
      {showDate && (
        <Typography variant="caption" color="text.secondary" component="span">
          <time dateTime={date} title={formatDate(date)}>
            {relativeOrAbsolute(date)}
          </time>
        </Typography>
      )}
      {showDate && (showAuthor || showMinutes) && <Dot />}
      {showAuthor && (
        <Typography variant="caption" color="text.secondary" component="span">
          {author}
        </Typography>
      )}
      {showAuthor && showMinutes && <Dot />}
      {showMinutes && (
        <Typography variant="caption" color="text.secondary" component="span">
          {minutes} min read
        </Typography>
      )}
    </Stack>
  )
}

function PostCard({ post }: { post: Post }) {
  const href = `/blog/${post.slug}`

  return (
    <Card
      component="li"
      variant="outlined"
      sx={{
        position: 'relative',
        bgcolor: 'transparent',
        transition: 'border-color .15s ease, transform .15s ease',
        '&:hover, &:focus-within': {
          borderColor: 'primary.main',
          transform: 'translateY(-1px)',
        },
      }}
    >
      <CardContent>
        {post.tags.length > 0 && (
          <Stack direction="row" sx={{ mb: 1.5, flexWrap: 'wrap', gap: 0.75, alignItems: 'center' }}>
            {post.tags.slice(0, 2).map((tag) => (
              <Chip key={tag} label={tag} size="small" color="primary" variant="outlined" />
            ))}
            {post.tags.length > 2 && (
              <Typography variant="caption" color="text.secondary">
                +{post.tags.length - 2}
              </Typography>
            )}
          </Stack>
        )}

        <Typography variant="h5" component="h2" gutterBottom>
          <Link
            component={RouterLink}
            to={href}
            color="inherit"
            underline="hover"
            sx={{
              // Stretch the title link across the whole card so the entire
              // surface is clickable without nesting interactive elements.
              '&::after': { content: '""', position: 'absolute', inset: 0 },
            }}
          >
            {post.title}
          </Link>
        </Typography>

        {post.description && (
          <Typography color="text.secondary" sx={{ mb: 1.5 }}>
            {post.description}
          </Typography>
        )}

        <PostMeta post={post} />
      </CardContent>
    </Card>
  )
}

function PostCardSkeleton() {
  return (
    <Card component="li" variant="outlined" sx={{ bgcolor: 'transparent' }}>
      <CardContent>
        <Skeleton variant="rounded" width={72} height={24} sx={{ mb: 1.5, borderRadius: 1 }} />
        <Skeleton width="85%" height={34} />
        <Skeleton width="55%" height={34} sx={{ mb: 1.5 }} />
        <Skeleton width="100%" />
        <Skeleton width="88%" sx={{ mb: 1.5 }} />
        <Skeleton width={160} height={18} />
      </CardContent>
    </Card>
  )
}

function EmptyState({ page, onReset }: { page: number; onReset: () => void }) {
  return (
    <Box sx={{ py: 8, textAlign: 'center' }}>
      <Typography variant="h6" component="p" gutterBottom>
        Nothing here yet
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        {page > 1
          ? 'This page is empty — the posts may have been moved.'
          : 'The first post is still being written.'}
      </Typography>
      {page > 1 && (
        <Button variant="outlined" onClick={onReset}>
          Back to page 1
        </Button>
      )}
    </Box>
  )
}

function BlogListPage() {
  const [params, setParams] = useSearchParams()
  const page = Math.max(1, Number(params.get('page')) || 1)

  const { data, isPending, isFetching, isError, error, refetch } = useQuery({
    queryKey: ['posts', page],
    queryFn: () => listPosts({ page, limit: PAGE_SIZE }),
    placeholderData: keepPreviousData,
  })

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 0
  const isEmpty = !isPending && !isError && data?.items.length === 0

  function goToPage(next: number) {
    const nextParams = new URLSearchParams(params)
    if (next <= 1) nextParams.delete('page')
    else nextParams.set('page', String(next))

    setParams(nextParams)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <Container component="main" sx={{ py: 6, flex: 1 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h1" component="h1">
          Blog
        </Typography>
        <Typography color="text.secondary">
          Notes, guides, and stories about building for the web.
        </Typography>
      </Box>

      <Typography component="p" aria-live="polite" sx={srOnly}>
        {isFetching && !isPending ? 'Loading page…' : `Page ${page} of ${totalPages || 1}`}
      </Typography>

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

      <Stack
        component="ul"
        spacing={2}
        aria-busy={isFetching}
        sx={{
          listStyle: 'none',
          p: 0,
          m: 0,
          opacity: isFetching && !isPending ? 0.55 : 1,
          transition: 'opacity .15s ease',
        }}
      >
        {isPending &&
          Array.from({ length: PAGE_SIZE }, (_, i) => <PostCardSkeleton key={i} />)}

        {data?.items.map((post) => <PostCard key={post.id} post={post} />)}
      </Stack>

      {isEmpty && <EmptyState page={page} onReset={() => goToPage(1)} />}

      {totalPages > 1 && (
        <Pagination
          count={totalPages}
          page={Math.min(page, totalPages)}
          onChange={(_, next) => goToPage(next)}
          color="primary"
          aria-label="Blog pages"
          sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}
        />
      )}
    </Container>
  )
}

export default BlogListPage
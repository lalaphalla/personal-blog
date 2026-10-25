import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Link as RouterLink, Navigate, useParams } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Container from '@mui/material/Container'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { formatDate } from '../utils/format'
import { ApiError, getPostBySlug } from '../services/blogApi'

const markdownSx = {
  mt: 1,
  color: 'text.primary',
  lineHeight: 1.75,
  '& p, & ul, & ol': { my: 0, mb: 2 },
  '& li': { mb: 0.5 },
  '& h2': {
    mt: 4,
    mb: 1.5,
    fontSize: '1.5rem',
    fontWeight: 500,
    color: 'text.primary',
  },
  '& h3': {
    mt: 3,
    mb: 1,
    fontSize: '1.15rem',
    fontWeight: 500,
    color: 'text.primary',
  },
  '& a': { color: 'primary.main' },
  '& strong': { color: 'text.primary' },
  '& code': {
    fontFamily: 'monospace',
    fontSize: '0.9em',
    px: 0.5,
    py: 0.25,
    borderRadius: 1,
    bgcolor: 'action.hover',
  },
  '& pre': {
    my: 0,
    mb: 2,
    p: 2,
    borderRadius: 2,
    overflowX: 'auto',
    bgcolor: 'action.hover',
    '& code': { bgcolor: 'transparent', p: 0 },
  },
  '& table': {
    width: '100%',
    my: 2,
    borderCollapse: 'collapse',
    fontSize: '0.95em',
  },
  '& th, & td': {
    border: 1,
    borderColor: 'divider',
    px: 1.5,
    py: 1,
    textAlign: 'left',
    verticalAlign: 'top',
  },
  '& th': {
    bgcolor: 'action.hover',
    fontWeight: 600,
  },
} as const

function BlogDetailPage() {
  const { slug } = useParams()

  const { data: post, isPending, isError, error, refetch } = useQuery({
    queryKey: ['post', slug],
    queryFn: () => getPostBySlug(slug!),
    enabled: Boolean(slug),
  })

  if (!slug) {
    return <Navigate to="/blog" replace />
  }

  if (isPending) {
    return (
      <Container
        component="main"
        maxWidth="md"
        sx={{ py: 6, flex: 1, display: 'flex', justifyContent: 'center' }}
      >
        <CircularProgress sx={{ mt: 4 }} />
      </Container>
    )
  }

  if (isError || !post) {
    const notFound = error instanceof ApiError && error.status === 404
    return (
      <Container component="main" maxWidth="md" sx={{ py: 6, flex: 1 }}>
        <Link component={RouterLink} to="/blog" underline="hover">
          ← Back to blog
        </Link>
        <Alert
          severity={notFound ? 'info' : 'error'}
          sx={{ mt: 3 }}
          action={
            notFound ? null : (
              <Button color="inherit" size="small" onClick={() => refetch()}>
                Retry
              </Button>
            )
          }
        >
          {notFound ? 'This post could not be found.' : 'Failed to load the post.'}
        </Alert>
      </Container>
    )
  }

  const date = post.published_at ?? post.created_at

  return (
    <Container component="main" maxWidth="md" sx={{ py: 6, flex: 1 }}>
      <Link component={RouterLink} to="/blog" underline="hover">
        ← Back to blog
      </Link>

      <Stack
        direction="row"
        spacing={1.5}
        sx={{ mt: 3, mb: 1.5, alignItems: 'center' }}
      >
        <Chip
          label={post.tags[0] ?? post.category ?? 'Article'}
          size="small"
          color="primary"
          variant="outlined"
        />
        <Typography variant="caption" color="text.secondary">
          <time dateTime={date}>{formatDate(date)}</time>
        </Typography>
      </Stack>

      <Typography variant="h3" component="h1" gutterBottom>
        {post.title}
      </Typography>

      {post.cover_url && (
        <Box
          component="img"
          src={post.cover_url}
          alt=""
          sx={{
            width: '100%',
            maxHeight: 420,
            objectFit: 'cover',
            borderRadius: 2,
            mb: 3,
            display: 'block',
          }}
        />
      )}

      <Box component="article" sx={markdownSx}>
        <Markdown remarkPlugins={[remarkGfm]}>{post.content}</Markdown>
      </Box>
    </Container>
  )
}

export default BlogDetailPage

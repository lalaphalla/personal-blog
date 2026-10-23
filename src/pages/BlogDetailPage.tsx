import Markdown from 'react-markdown'
import { Link as RouterLink, Navigate, useParams } from 'react-router'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Container from '@mui/material/Container'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { formatDate, getPost } from '../data/posts'

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
} as const

function BlogDetailPage() {
  const { slug } = useParams()
  const post = slug ? getPost(slug) : undefined

  if (!post) {
    return <Navigate to="/blog" replace />
  }

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
        <Chip label={post.tag} size="small" color="primary" variant="outlined" />
        <Typography variant="caption" color="text.secondary">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
        </Typography>
      </Stack>

      <Typography variant="h3" component="h1" gutterBottom>
        {post.title}
      </Typography>

      <Box component="article" sx={markdownSx}>
        <Markdown>{post.content}</Markdown>
      </Box>
    </Container>
  )
}

export default BlogDetailPage

import { Link as RouterLink } from 'react-router'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Container from '@mui/material/Container'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { formatDate, posts } from '../data/posts'

function BlogListPage() {
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

      <Stack component="ul" spacing={2} sx={{ listStyle: 'none', p: 0, m: 0 }}>
        {posts.map((post) => (
          <Card
            key={post.slug}
            component="li"
            variant="outlined"
            sx={{ bgcolor: 'transparent' }}
          >
            <CardContent>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1.5 }}>
                <Chip
                  label={post.tag}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
                <Typography variant="caption" color="text.secondary">
                  <time dateTime={post.date}>{formatDate(post.date)}</time>
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

              <Typography color="text.secondary" sx={{ mb: 1.5 }}>
                {post.excerpt}
              </Typography>

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
    </Container>
  )
}

export default BlogListPage

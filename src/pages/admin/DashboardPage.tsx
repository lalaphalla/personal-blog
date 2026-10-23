import { useQuery } from '@tanstack/react-query'
import { Link as RouterLink } from 'react-router'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { adminListPosts } from '../../services/adminApi'

function StatCard({ label, value, loading }: { label: string; value: number; loading: boolean }) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography color="text.secondary" gutterBottom>
          {label}
        </Typography>
        <Typography variant="h4">
          {loading ? <CircularProgress size={28} /> : value}
        </Typography>
      </CardContent>
    </Card>
  )
}

function DashboardPage() {
  const all = useQuery({
    queryKey: ['admin', 'posts', { limit: 1 }],
    queryFn: () => adminListPosts({ limit: 1 }),
  })
  const drafts = useQuery({
    queryKey: ['admin', 'posts', { status: 'draft', limit: 1 }],
    queryFn: () => adminListPosts({ status: 'draft', limit: 1 }),
  })
  const published = useQuery({
    queryKey: ['admin', 'posts', { status: 'published', limit: 1 }],
    queryFn: () => adminListPosts({ status: 'published', limit: 1 }),
  })

  const recent = useQuery({
    queryKey: ['admin', 'posts', { limit: 5 }],
    queryFn: () => adminListPosts({ limit: 5 }),
  })

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h4">Dashboard</Typography>
        <Button variant="contained" component={RouterLink} to="/admin/posts/new">
          New post
        </Button>
      </Stack>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard label="Total posts" value={all.data?.total ?? 0} loading={all.isPending} />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard label="Drafts" value={drafts.data?.total ?? 0} loading={drafts.isPending} />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard
            label="Published"
            value={published.data?.total ?? 0}
            loading={published.isPending}
          />
        </Grid>
      </Grid>

      <Box>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Recent posts
        </Typography>
        <Stack spacing={1}>
          {recent.data?.items.map((post) => (
            <Card key={post.id} variant="outlined" sx={{ bgcolor: 'transparent' }}>
              <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography component={RouterLink} to={`/admin/posts/${post.id}/edit`} color="inherit">
                    {post.title}
                  </Typography>
                  <Typography variant="caption" color={post.status === 'published' ? 'success.main' : 'text.secondary'}>
                    {post.status}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          ))}
          {recent.data?.items.length === 0 && (
            <Typography color="text.secondary">No posts yet.</Typography>
          )}
        </Stack>
      </Box>
    </Stack>
  )
}

export default DashboardPage

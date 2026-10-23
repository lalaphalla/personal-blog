import { useState } from 'react'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link as RouterLink } from 'react-router'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Pagination from '@mui/material/Pagination'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import PublishIcon from '@mui/icons-material/Publish'
import UnpublishIcon from '@mui/icons-material/Drafts'
import {
  adminDeletePost,
  adminListPosts,
  adminPublishPost,
  adminUnpublishPost,
} from '../../services/adminApi'
import { formatDate } from '../../utils/format'
import type { PostStatus } from '../../types/blog'

const PAGE_SIZE = 20

type StatusFilter = PostStatus | 'all'

function PostsPage() {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const queryClient = useQueryClient()

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['admin', 'posts', { page, status: statusFilter }],
    queryFn: () =>
      adminListPosts({
        page,
        limit: PAGE_SIZE,
        ...(statusFilter === 'all' ? {} : { status: statusFilter }),
      }),
    placeholderData: keepPreviousData,
  })

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['admin', 'posts'] })

  const publishMutation = useMutation({
    mutationFn: adminPublishPost,
    onSuccess: invalidate,
  })
  const unpublishMutation = useMutation({
    mutationFn: adminUnpublishPost,
    onSuccess: invalidate,
  })
  const deleteMutation = useMutation({
    mutationFn: adminDeletePost,
    onSuccess: invalidate,
  })

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0

  return (
    <Stack spacing={2}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h4">Posts</Typography>
        <Button variant="contained" component={RouterLink} to="/admin/posts/new">
          New post
        </Button>
      </Stack>

      <ButtonGroup size="small">
        {(['all', 'draft', 'published'] as const).map((value) => (
          <Button
            key={value}
            variant={statusFilter === value ? 'contained' : 'outlined'}
            onClick={() => {
              setStatusFilter(value)
              setPage(1)
            }}
          >
            {value === 'all' ? 'All' : value === 'draft' ? 'Drafts' : 'Published'}
          </Button>
        ))}
      </ButtonGroup>

      {isError && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              Retry
            </Button>
          }
        >
          Failed to load posts.
        </Alert>
      )}

      {isPending ? (
        <CircularProgress sx={{ display: 'block', mx: 'auto', my: 4 }} />
      ) : (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Slug</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Updated</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.items.map((post) => (
                <TableRow key={post.id} hover>
                  <TableCell>
                    <Typography
                      component={RouterLink}
                      to={`/admin/posts/${post.id}/edit`}
                      color="inherit"
                      sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                    >
                      {post.title}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
                    {post.slug}
                  </TableCell>
                  <TableCell>
                    <Typography
                      component="span"
                      sx={{
                        color: post.status === 'published' ? 'success.main' : 'warning.main',
                        fontWeight: 500,
                      }}
                    >
                      {post.status}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>
                    {formatDate(post.updated_at)}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        component={RouterLink}
                        to={`/admin/posts/${post.id}/edit`}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {post.status === 'draft' ? (
                      <Tooltip title="Publish">
                        <IconButton
                          size="small"
                          disabled={publishMutation.isPending}
                          onClick={() => publishMutation.mutate(post.id)}
                        >
                          <PublishIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Tooltip title="Unpublish">
                        <IconButton
                          size="small"
                          disabled={unpublishMutation.isPending}
                          onClick={() => unpublishMutation.mutate(post.id)}
                        >
                          <UnpublishIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        disabled={deleteMutation.isPending}
                        onClick={() => {
                          if (window.confirm(`Delete "${post.title}"? This cannot be undone.`)) {
                            deleteMutation.mutate(post.id)
                          }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {data?.items.length === 0 && !isError && (
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
          sx={{ display: 'flex', justifyContent: 'center' }}
        />
      )}
    </Stack>
  )
}

export default PostsPage

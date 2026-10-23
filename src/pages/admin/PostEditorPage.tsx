import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link as RouterLink, useNavigate, useParams } from 'react-router'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { getErrorMessage } from '../../config/queryClient'
import PostForm, { type PostFormSubmit } from '../../components/admin/PostForm'
import {
  adminCreatePost,
  adminGetPost,
  adminUpdatePost,
} from '../../services/adminApi'

function PostEditorPage() {
  const { id } = useParams()
  const postId = id ? Number(id) : undefined
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const { data: post, isPending, isError } = useQuery({
    queryKey: ['admin', 'posts', postId],
    queryFn: () => adminGetPost(postId!),
    enabled: Boolean(postId),
  })

  const createMutation = useMutation({
    mutationFn: adminCreatePost,
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'posts'] })
      navigate(`/admin/posts/${created.id}/edit`)
    },
    onError: (error) => setSubmitError(getErrorMessage(error)),
  })

  const updateMutation = useMutation({
    mutationFn: (values: PostFormSubmit) => adminUpdatePost(postId!, values),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'posts'] })
      navigate(`/admin/posts/${updated.id}/edit`)
    },
    onError: (error) => setSubmitError(getErrorMessage(error)),
  })

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const handleSubmit = (values: PostFormSubmit) => {
    setSubmitError(null)
    if (postId) {
      updateMutation.mutate(values)
    } else {
      createMutation.mutate(values)
    }
  }

  if (postId && isPending) {
    return (
      <Stack sx={{ alignItems: 'center', py: 8 }}>
        <CircularProgress />
      </Stack>
    )
  }

  if (postId && (isError || !post)) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" component={RouterLink} to="/admin/posts">
            Back to posts
          </Button>
        }
      >
        Failed to load the post.
      </Alert>
    )
  }

  return (
    <Box>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">{postId ? 'Edit post' : 'New post'}</Typography>
        <Button component={RouterLink} to="/admin/posts">
          Cancel
        </Button>
      </Stack>

      <PostForm
        post={post}
        onSubmit={handleSubmit}
        submitLabel={postId ? 'Save changes' : 'Create draft'}
        isSubmitting={isSubmitting}
        error={submitError}
      />
    </Box>
  )
}

export default PostEditorPage

import { useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import {
  adminListImages,
  adminUploadImage,
  type UploadedImage,
} from '../../services/adminApi'
import { getErrorMessage } from '../../config/queryClient'

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(mtime: number): string {
  return new Date(mtime * 1000).toLocaleDateString()
}

function ImageCard({
  image,
  copied,
  onCopy,
}: {
  image: UploadedImage
  copied: boolean
  onCopy: (url: string) => void
}) {
  return (
    <Paper variant="outlined" sx={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <Box
        component="a"
        href={image.url}
        target="_blank"
        rel="noreferrer"
        sx={{ display: 'block', bgcolor: 'action.hover', p: 0 }}
      >
        <Box
          component="img"
          src={image.url}
          alt={image.filename}
          loading="lazy"
          sx={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }}
        />
      </Box>
      <Stack spacing={1} sx={{ p: 1.5 }}>
        <Typography
          variant="body2"
          noWrap
          sx={{ fontFamily: 'monospace' }}
          title={image.filename}
        >
          {image.filename}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
          <Chip size="small" label={formatSize(image.size_bytes)} variant="outlined" />
          <Typography variant="caption" color="text.secondary" sx={{ pt: 0.25 }}>
            {formatDate(image.created_at)}
          </Typography>
        </Stack>
        <Button
          type="button"
          size="small"
          variant="outlined"
          onClick={() => onCopy(image.url)}
        >
          {copied ? 'Copied ✓' : 'Copy URL'}
        </Button>
      </Stack>
    </Paper>
  )
}

function MediaPage() {
  const queryClient = useQueryClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const { data: images, isPending, isError, error, refetch } = useQuery({
    queryKey: ['admin', 'images'],
    queryFn: adminListImages,
  })

  const uploadMutation = useMutation({
    mutationFn: (file: File) => adminUploadImage(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'images'] })
    },
    onError: (uploadError) => setActionError(getErrorMessage(uploadError)),
  })

  function copyUrl(url: string) {
    void navigator.clipboard
      .writeText(url)
      .then(() => {
        setCopiedUrl(url)
        window.setTimeout(() => setCopiedUrl((current) => (current === url ? null : current)), 1500)
      })
      .catch(() => {
        setActionError('Clipboard not available — copy the URL from the image link instead')
      })
  }

  if (isPending) {
    return (
      <Stack sx={{ alignItems: 'center', py: 8 }}>
        <CircularProgress />
      </Stack>
    )
  }

  if (isError) {
    return (
      <Alert severity="error" action={<Button size="small" color="inherit" onClick={() => refetch()}>Retry</Button>}>
        {getErrorMessage(error)}
      </Alert>
    )
  }

  return (
    <Box>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Media</Typography>
        <Stack direction="row" spacing={1}>
          {actionError ? (
            <Button size="small" color="inherit" onClick={() => setActionError(null)}>
              Dismiss
            </Button>
          ) : null}
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/gif,image/webp"
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (!file) return
              setActionError(null)
              uploadMutation.mutate(file)
              if (fileRef.current) fileRef.current.value = ''
            }}
          />
          <Button
            variant="contained"
            onClick={() => fileRef.current?.click()}
            disabled={uploadMutation.isPending}
          >
            {uploadMutation.isPending ? 'Uploading…' : 'Upload image'}
          </Button>
        </Stack>
      </Stack>

      {actionError ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {actionError}
        </Alert>
      ) : null}

      {images && images.length > 0 ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
            gap: 2,
          }}
        >
          {images.map((image) => (
            <ImageCard
              key={image.filename}
              image={image}
              copied={copiedUrl === image.url}
              onCopy={copyUrl}
            />
          ))}
        </Box>
      ) : (
        <Alert severity="info">No images uploaded yet — click “Upload image”.</Alert>
      )}
    </Box>
  )
}

export default MediaPage

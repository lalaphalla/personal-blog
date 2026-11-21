import { useRef, useState, type ChangeEvent } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import { CameraIcon, CloseIcon } from '../DocIcons'
import { adminUploadImage } from '../../services/adminApi'
import type { JournalAttachment, JournalAttachmentInput } from '../../services/journalApi'

interface AttachmentStripProps {
  attachments: JournalAttachment[]
  onAddAttachment: (input: JournalAttachmentInput) => Promise<void>
  onDeleteAttachment: (id: number) => Promise<void>
  disabled?: boolean
}

export default function AttachmentStrip({
  attachments,
  onAddAttachment,
  onDeleteAttachment,
  disabled = false,
}: AttachmentStripProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Only image files (PNG, JPEG, GIF, WebP) are supported.')
      return
    }

    try {
      setIsUploading(true)
      setErrorMsg(null)
      // 1. Upload file to media server
      const uploaded = await adminUploadImage(file)
      // 2. Link attachment to journal entry
      await onAddAttachment({
        kind: 'image',
        url: uploaded.url,
        filename: uploaded.filename,
        size_bytes: uploaded.size_bytes,
        mime_type: file.type,
      })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to upload photo'
      setErrorMsg(msg)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <Stack spacing={1.5}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <CameraIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Photos & Media ({attachments.length}/20)
          </Typography>
        </Stack>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        <Button
          size="small"
          variant="outlined"
          disabled={disabled || isUploading || attachments.length >= 20}
          onClick={() => fileInputRef.current?.click()}
          startIcon={isUploading ? <CircularProgress size={16} /> : <CameraIcon />}
          sx={{ textTransform: 'none', borderRadius: 2 }}
        >
          {isUploading ? 'Uploading...' : 'Add Photo'}
        </Button>
      </Stack>

      {errorMsg && (
        <Typography variant="caption" color="error">
          {errorMsg}
        </Typography>
      )}

      {attachments.length > 0 && (
        <Stack
          direction="row"
          spacing={1.5}
          sx={{
            overflowX: 'auto',
            py: 1,
            px: 0.5,
            '::-webkit-scrollbar': { height: 6 },
            '::-webkit-scrollbar-thumb': { bgcolor: 'action.disabled', borderRadius: 3 },
          }}
        >
          {attachments.map((att) => (
            <Paper
              key={att.id}
              elevation={1}
              sx={{
                position: 'relative',
                flexShrink: 0,
                width: 100,
                height: 100,
                borderRadius: 2,
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Box
                component="img"
                src={att.url}
                alt={att.filename}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
              <IconButton
                size="small"
                disabled={disabled}
                onClick={() => onDeleteAttachment(att.id)}
                sx={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  bgcolor: (theme) => alpha(theme.palette.common.black, 0.6),
                  color: 'common.white',
                  '&:hover': {
                    bgcolor: (theme) => alpha(theme.palette.common.black, 0.8),
                  },
                  p: 0.5,
                }}
              >
                <CloseIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Paper>
          ))}
        </Stack>
      )}
    </Stack>
  )
}

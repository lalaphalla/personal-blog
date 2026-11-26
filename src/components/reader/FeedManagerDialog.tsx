import { useState } from 'react'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { TrashIcon } from '../DocIcons'
import type { FeedSource } from '../../services/readerApi'

interface FeedManagerDialogProps {
  open: boolean
  onClose: () => void
  feeds: FeedSource[]
  onAddFeed: (input: { name: string; url: string; category?: string }) => Promise<void>
  onDeleteFeed: (id: number) => Promise<void>
  isSubmitting?: boolean
}

const PRESET_FEEDS = [
  { name: "Simon Willison's Blog", url: 'https://simonwillison.net/atom/everything/', category: 'AI & Python' },
  { name: 'FastAPI Releases', url: 'https://github.com/fastapi/fastapi/releases.atom', category: 'Python' },
  { name: 'Lobsters', url: 'https://lobste.rs/rss', category: 'Tech' },
]

export default function FeedManagerDialog({
  open,
  onClose,
  feeds,
  onAddFeed,
  onDeleteFeed,
  isSubmitting = false,
}: FeedManagerDialogProps) {
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [category, setCategory] = useState('Tech')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleAdd = async () => {
    if (!name.trim() || !url.trim()) return
    setErrorMsg(null)
    try {
      await onAddFeed({
        name: name.trim(),
        url: url.trim(),
        category: category.trim() || 'Tech',
      })
      setName('')
      setUrl('')
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to add feed')
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Manage RSS & Atom Feeds</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <Stack spacing={1.5}>
            <TextField
              label="Feed Name"
              size="small"
              fullWidth
              placeholder="e.g. Simon Willison's Blog"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <TextField
              label="RSS / Atom URL"
              size="small"
              fullWidth
              placeholder="https://example.com/feed.xml"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <TextField
                label="Category"
                size="small"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                sx={{ flex: 1 }}
              />
              <Button
                variant="contained"
                disabled={!name.trim() || !url.trim() || isSubmitting}
                onClick={handleAdd}
                sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600 }}
              >
                {isSubmitting ? 'Adding...' : 'Add Feed'}
              </Button>
            </Stack>

            {errorMsg && (
              <Typography variant="caption" color="error">
                {errorMsg}
              </Typography>
            )}

            <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', gap: 0.75, alignItems: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                Quick add:
              </Typography>
              {PRESET_FEEDS.map((preset) => (
                <Chip
                  key={preset.url}
                  size="small"
                  label={preset.name}
                  variant="outlined"
                  onClick={() => {
                    setName(preset.name)
                    setUrl(preset.url)
                    setCategory(preset.category)
                  }}
                />
              ))}
            </Stack>
          </Stack>

          <Divider />

          <Stack spacing={1}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Subscribed Feeds ({feeds.length})
            </Typography>
            {feeds.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No custom feeds yet. Add any RSS or Atom URL above (tip: Reddit works with `.rss`, GitHub releases with `.atom`).
              </Typography>
            ) : (
              feeds.map((feed) => (
                <Stack
                  key={feed.id}
                  direction="row"
                  sx={{
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 1.25,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    gap: 1,
                  }}
                >
                  <Stack sx={{ minWidth: 0 }}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                        {feed.name}
                      </Typography>
                      <Chip size="small" label={feed.category} sx={{ height: 20, fontSize: '0.7rem' }} />
                    </Stack>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {feed.url}
                    </Typography>
                  </Stack>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => void onDeleteFeed(feed.id)}
                  >
                    <TrashIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Stack>
              ))
            )}
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none' }}>
          Done
        </Button>
      </DialogActions>
    </Dialog>
  )
}

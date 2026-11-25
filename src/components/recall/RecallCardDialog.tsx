import { useState } from 'react'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControlLabel from '@mui/material/FormControlLabel'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import type {
  RecallCard,
  RecallCardCreateInput,
  RecallCardUpdateInput,
} from '../../services/recallApi'

interface RecallCardDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (payload: RecallCardCreateInput | RecallCardUpdateInput) => Promise<void>
  initialCard?: RecallCard | null
  existingDecks?: string[]
  isSubmitting?: boolean
}

function RecallCardFormBody({
  onClose,
  onSubmit,
  initialCard,
  existingDecks = [],
  isSubmitting = false,
}: Omit<RecallCardDialogProps, 'open'>) {
  const [front, setFront] = useState(initialCard?.front ?? '')
  const [back, setBack] = useState(initialCard?.back ?? '')
  const [hint, setHint] = useState(initialCard?.hint ?? '')
  const [deck, setDeck] = useState(initialCard?.deck ?? 'General')
  const [tagsRaw, setTagsRaw] = useState((initialCard?.tags ?? []).join(', '))
  const [sourceUrl, setSourceUrl] = useState(initialCard?.source_url ?? '')
  const [isSuspended, setIsSuspended] = useState(initialCard?.is_suspended ?? false)

  const handleSave = async () => {
    if (!front.trim() || !back.trim()) return
    const tags = tagsRaw
      .split(/[,\s]+/)
      .map((t) => t.trim().replace(/^#/, '').toLowerCase())
      .filter(Boolean)

    await onSubmit({
      front: front.trim(),
      back: back.trim(),
      hint: hint.trim() || null,
      deck: deck.trim() || 'General',
      tags,
      source_url: sourceUrl.trim() || null,
      ...(initialCard ? { is_suspended: isSuspended } : {}),
    })
    onClose()
  }

  const deckSuggestions = Array.from(new Set(['General', ...existingDecks])).slice(0, 8)

  return (
    <>
      <DialogTitle sx={{ fontWeight: 700 }}>
        {initialCard ? 'Edit Recall Card' : 'New Recall Card'}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            label="Front (Prompt / Question)"
            placeholder="e.g. How to safely back up a live SQLite database?"
            multiline
            minRows={2}
            maxRows={6}
            fullWidth
            required
            autoFocus
            value={front}
            onChange={(e) => setFront(e.target.value)}
          />

          <TextField
            label="Back (Answer / Key Takeaway — Markdown supported)"
            placeholder="e.g. Use `sqlite3.connect(src).backup(dst)` instead of copying the file directly."
            multiline
            minRows={3}
            maxRows={10}
            fullWidth
            required
            value={back}
            onChange={(e) => setBack(e.target.value)}
          />

          <TextField
            label="Hint (optional)"
            size="small"
            fullWidth
            value={hint}
            onChange={(e) => setHint(e.target.value)}
          />

          <Stack spacing={1}>
            <TextField
              label="Deck"
              size="small"
              fullWidth
              value={deck}
              onChange={(e) => setDeck(e.target.value)}
            />
            {deckSuggestions.length > 0 && (
              <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', gap: 0.75 }}>
                {deckSuggestions.map((d) => (
                  <Chip
                    key={d}
                    size="small"
                    label={d}
                    variant={deck === d ? 'filled' : 'outlined'}
                    color={deck === d ? 'primary' : 'default'}
                    onClick={() => setDeck(d)}
                  />
                ))}
              </Stack>
            )}
          </Stack>

          <TextField
            label="Tags (comma or space separated)"
            size="small"
            fullWidth
            placeholder="sqlite, devops, python"
            value={tagsRaw}
            onChange={(e) => setTagsRaw(e.target.value)}
          />

          <TextField
            label="Source URL (optional)"
            size="small"
            fullWidth
            placeholder="https://..."
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
          />

          {initialCard && (
            <FormControlLabel
              control={
                <Switch
                  checked={isSuspended}
                  onChange={(e) => setIsSuspended(e.target.checked)}
                />
              }
              label={
                <Typography variant="body2" color="text.secondary">
                  Suspend card (hide from daily reviews)
                </Typography>
              }
            />
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none' }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={!front.trim() || !back.trim() || isSubmitting}
          onClick={handleSave}
          sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600 }}
        >
          {isSubmitting ? 'Saving...' : initialCard ? 'Save Changes' : 'Create Card'}
        </Button>
      </DialogActions>
    </>
  )
}

export default function RecallCardDialog({ open, ...props }: RecallCardDialogProps) {
  return (
    <Dialog open={open} onClose={props.onClose} maxWidth="sm" fullWidth>
      {open && (
        <RecallCardFormBody
          key={props.initialCard?.id ?? 'new'}
          {...props}
        />
      )}
    </Dialog>
  )
}

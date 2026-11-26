import { useMemo, useRef, useState, type ChangeEvent } from 'react'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import type { RecallCardCreateInput } from '../../services/recallApi'
import { parseRecallImport } from '../../utils/recallImportExport'

interface RecallImportDialogProps {
  open: boolean
  onClose: () => void
  onImport: (cards: RecallCardCreateInput[]) => Promise<void>
  onImportApkg: (file: File, deck: string) => Promise<void>
  existingDecks?: string[]
  isSubmitting?: boolean
}

export default function RecallImportDialog({
  open,
  onClose,
  onImport,
  onImportApkg,
  existingDecks = [],
  isSubmitting = false,
}: RecallImportDialogProps) {
  const [rawText, setRawText] = useState('')
  const [apkgFile, setApkgFile] = useState<File | null>(null)
  const [deck, setDeck] = useState('General')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const parsedCards = useMemo(
    () => (apkgFile ? [] : parseRecallImport(rawText, deck)),
    [apkgFile, rawText, deck],
  )

  const deckSuggestions = useMemo(
    () => Array.from(new Set(['General', ...existingDecks])).slice(0, 8),
    [existingDecks],
  )

  const handleFilePick = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setErrorMsg(null)

    if (file.name.toLowerCase().endsWith('.apkg')) {
      setApkgFile(file)
      setRawText('')
      if (deck === 'General') {
        setDeck(file.name.replace(/\.apkg$/i, ''))
      }
    } else {
      setApkgFile(null)
      const text = await file.text()
      setRawText(text)
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async () => {
    setErrorMsg(null)
    try {
      if (apkgFile) {
        await onImportApkg(apkgFile, deck.trim() || 'Anki Import')
        setApkgFile(null)
        onClose()
        return
      }
      if (parsedCards.length === 0) return
      await onImport(parsedCards.slice(0, 500))
      setRawText('')
      onClose()
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to import cards')
    }
  }

  const canSubmit = Boolean(apkgFile) || parsedCards.length > 0

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Import Recall Cards</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".md,.markdown,.txt,.csv,.tsv,.json,.apkg"
              style={{ display: 'none' }}
              onChange={handleFilePick}
            />
            <Button
              variant="outlined"
              size="small"
              onClick={() => fileInputRef.current?.click()}
              sx={{ textTransform: 'none', borderRadius: 2 }}
            >
              Choose File (.apkg, .md, .csv, .tsv, .json)
            </Button>
            <Typography variant="caption" color="text.secondary">
              Supports Anki (.apkg or .txt), Quizlet TSV/CSV, Markdown (Q:/A:), and JSON.
            </Typography>
          </Stack>

          <Stack spacing={1}>
            <TextField
              label="Target Deck"
              size="small"
              fullWidth
              value={deck}
              onChange={(e) => setDeck(e.target.value)}
            />
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
          </Stack>

          {apkgFile ? (
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: 'action.hover',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Anki Package: {apkgFile.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {(apkgFile.size / 1024).toFixed(1)} KB · Up to 500 cards will be imported into "{deck || 'Anki Import'}".
                  </Typography>
                </div>
                <Button size="small" onClick={() => setApkgFile(null)} sx={{ textTransform: 'none' }}>
                  Clear
                </Button>
              </Stack>
            </Paper>
          ) : (
            <TextField
              label="Or paste cards"
              multiline
              minRows={7}
              maxRows={14}
              fullWidth
              placeholder={
                'Q: How to safely back up SQLite?\nA: Use sqlite3.connect(src).backup(dst)\n---\nQ: Nginx max body size?\nA: client_max_body_size 12m;'
              }
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
            />
          )}

          {!apkgFile && rawText.trim() && (
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: 'action.hover',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.75 }}>
                {parsedCards.length > 0
                  ? `Detected ${parsedCards.length} card${parsedCards.length === 1 ? '' : 's'}${
                      parsedCards.length > 500 ? ' (first 500 will be imported)' : ''
                    }`
                  : 'No valid cards detected yet'}
              </Typography>
              {parsedCards.slice(0, 3).map((c, idx) => (
                <Typography key={idx} variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                  • {c.front} → {c.back}
                </Typography>
              ))}
            </Paper>
          )}

          {errorMsg && (
            <Typography variant="caption" color="error">
              {errorMsg}
            </Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none' }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={!canSubmit || isSubmitting}
          onClick={handleSubmit}
          sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600 }}
        >
          {isSubmitting
            ? 'Importing...'
            : apkgFile
              ? 'Import Anki (.apkg)'
              : `Import ${Math.min(parsedCards.length, 500)} Card${parsedCards.length === 1 ? '' : 's'}`}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { CameraIcon, TrashIcon } from '../DocIcons'
import { adminUploadImage } from '../../services/adminApi'
import { useQuotesMutations } from '../../hooks/useQuotesQueries'
import type { Quote, QuoteInput, SourceType } from '../../services/quotesApi'

const SOURCE_TYPES: { value: SourceType; label: string }[] = [
  { value: 'book', label: 'Book' },
  { value: 'movie', label: 'Movie' },
  { value: 'show', label: 'TV Show' },
  { value: 'speech', label: 'Speech' },
  { value: 'article', label: 'Article' },
  { value: 'person', label: 'Person / Conversation' },
  { value: 'other', label: 'Other' },
]

interface QuoteDialogProps {
  open: boolean
  quote?: Quote | null
  onClose: () => void
}

export default function QuoteDialog({ open, quote, onClose }: QuoteDialogProps) {
  const { createQuote, updateQuote } = useQuotesMutations()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [content, setContent] = useState('')
  const [author, setAuthor] = useState('')
  const [sourceTitle, setSourceTitle] = useState('')
  const [sourceType, setSourceType] = useState<SourceType | ''>('')
  const [dateMode, setDateMode] = useState<'year' | 'date'>('year')
  const [saidYear, setSaidYear] = useState('')
  const [saidDate, setSaidDate] = useState('')
  const [context, setContext] = useState('')
  const [sourceUrl, setSourceUrl] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [isFavorite, setIsFavorite] = useState(false)
  const [isActive, setIsActive] = useState(true)

  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  useEffect(() => {
    if (quote) {
      setContent(quote.content || '')
      setAuthor(quote.author || '')
      setSourceTitle(quote.source_title || '')
      setSourceType(quote.source_type || '')
      if (quote.said_date) {
        setDateMode('date')
        setSaidDate(quote.said_date)
        setSaidYear('')
      } else if (quote.said_year) {
        setDateMode('year')
        setSaidYear(String(quote.said_year))
        setSaidDate('')
      } else {
        setDateMode('year')
        setSaidYear('')
        setSaidDate('')
      }
      setContext(quote.context || '')
      setSourceUrl(quote.source_url || '')
      setImageUrl(quote.image_url || '')
      setTags(quote.tags || [])
      setIsFavorite(quote.is_favorite ?? false)
      setIsActive(quote.is_active ?? true)
    } else {
      setContent('')
      setAuthor('')
      setSourceTitle('')
      setSourceType('')
      setDateMode('year')
      setSaidYear('')
      setSaidDate('')
      setContext('')
      setSourceUrl('')
      setImageUrl('')
      setTags([])
      setIsFavorite(false)
      setIsActive(true)
    }
    setTagInput('')
    setUploadError(null)
  }, [quote, open])

  const handleAddTag = () => {
    const trimmed = tagInput.trim().toLowerCase()
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove))
  }

  const handleImageFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)
      setUploadError(null)
      const res = await adminUploadImage(file)
      setImageUrl(res.url)
    } catch {
      setUploadError('Failed to upload image. Please try again.')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const isSaving = createQuote.isPending || updateQuote.isPending

  const handleSave = async () => {
    const trimmedContent = content.trim()
    if (!trimmedContent) return

    const inputData: QuoteInput = {
      content: trimmedContent,
      author: author.trim() || null,
      source_title: sourceTitle.trim() || null,
      source_type: sourceType || null,
      said_year: dateMode === 'year' && saidYear.trim() ? parseInt(saidYear.trim(), 10) : null,
      said_date: dateMode === 'date' && saidDate.trim() ? saidDate.trim() : null,
      context: context.trim() || null,
      source_url: sourceUrl.trim() || null,
      image_url: imageUrl.trim() || null,
      tags,
      is_favorite: isFavorite,
      is_active: isActive,
    }

    if (quote) {
      await updateQuote.mutateAsync({ id: quote.id, data: inputData })
    } else {
      await createQuote.mutateAsync(inputData)
    }

    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
        {quote ? 'Edit Quote' : 'Add New Quote'}
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2.5} sx={{ pt: 0.5 }}>
          {/* Quote content */}
          <TextField
            label="Quote Text *"
            multiline
            rows={3}
            placeholder="Type or paste the memorable quote..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            fullWidth
            required
            autoFocus
          />

          {/* Author and Source Type */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Author / Speaker"
              placeholder="e.g. Steve Jobs, Yoda"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel id="source-type-label">Source Type</InputLabel>
              <Select
                labelId="source-type-label"
                value={sourceType}
                label="Source Type"
                onChange={(e) => setSourceType(e.target.value as SourceType | '')}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {SOURCE_TYPES.map((st) => (
                  <MenuItem key={st.value} value={st.value}>
                    {st.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          {/* Source Title & Context */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Source Title"
              placeholder="e.g. Stanford Commencement Address"
              value={sourceTitle}
              onChange={(e) => setSourceTitle(e.target.value)}
              fullWidth
            />

            <TextField
              label="Context / Page / Scene"
              placeholder="e.g. Chapter 4, or scene on Dagobah"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              fullWidth
            />
          </Stack>

          {/* Date / Year options */}
          <Stack spacing={1}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', mr: 1 }}>
                Date Info:
              </Typography>
              <Chip
                label="Year only"
                size="small"
                clickable
                color={dateMode === 'year' ? 'primary' : 'default'}
                variant={dateMode === 'year' ? 'filled' : 'outlined'}
                onClick={() => setDateMode('year')}
              />
              <Chip
                label="Exact Date"
                size="small"
                clickable
                color={dateMode === 'date' ? 'primary' : 'default'}
                variant={dateMode === 'date' ? 'filled' : 'outlined'}
                onClick={() => setDateMode('date')}
              />
            </Stack>

            {dateMode === 'year' ? (
              <TextField
                label="Year Said / Published"
                type="number"
                placeholder="e.g. 1980"
                value={saidYear}
                onChange={(e) => setSaidYear(e.target.value)}
                fullWidth
              />
            ) : (
              <TextField
                label="Exact Date"
                type="date"
                value={saidDate}
                onChange={(e) => setSaidDate(e.target.value)}
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
              />
            )}
          </Stack>

          {/* Reference URL */}
          <TextField
            label="Source URL"
            type="url"
            placeholder="https://..."
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            fullWidth
          />

          {/* Image (Author portrait or book cover) */}
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', mb: 1 }}>
              Image / Artwork (Optional)
            </Typography>

            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              {imageUrl ? (
                <Avatar
                  src={imageUrl}
                  variant="rounded"
                  sx={{ width: 64, height: 64, borderRadius: 2 }}
                />
              ) : (
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: 2,
                    bgcolor: 'action.hover',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'text.disabled',
                  }}
                >
                  <CameraIcon sx={{ fontSize: 28 }} />
                </Box>
              )}

              <Stack spacing={0.5}>
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={isUploading ? <CircularProgress size={16} /> : <CameraIcon />}
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                    sx={{ textTransform: 'none' }}
                  >
                    {imageUrl ? 'Change Image' : 'Upload Image'}
                  </Button>

                  {imageUrl && (
                    <Button
                      variant="text"
                      color="error"
                      size="small"
                      startIcon={<TrashIcon />}
                      onClick={() => setImageUrl('')}
                      sx={{ textTransform: 'none' }}
                    >
                      Remove
                    </Button>
                  )}
                </Stack>

                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept="image/*"
                  onChange={handleImageFileChange}
                />

                {uploadError && (
                  <Typography variant="caption" color="error">
                    {uploadError}
                  </Typography>
                )}
              </Stack>
            </Stack>
          </Box>

          {/* Tags */}
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', mb: 1 }}>
              Tags & Themes
            </Typography>

            <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap', gap: 0.5 }}>
              {tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  onDelete={() => handleRemoveTag(tag)}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Stack>

            <Stack direction="row" spacing={1}>
              <TextField
                size="small"
                placeholder="Add tag (e.g. wisdom, tech, mindset)"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddTag()
                  }
                }}
                fullWidth
              />
              <Button
                variant="outlined"
                size="small"
                onClick={handleAddTag}
                sx={{ textTransform: 'none', px: 2 }}
              >
                Add
              </Button>
            </Stack>
          </Box>

          {/* Options: Favorite & Active in daily rotation */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={isFavorite}
                  onChange={(e) => setIsFavorite(e.target.checked)}
                  color="primary"
                />
              }
              label="Favorite"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  color="primary"
                />
              }
              label="Active in daily inspiration"
            />
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={isSaving} sx={{ textTransform: 'none' }}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!content.trim() || isSaving}
          startIcon={isSaving ? <CircularProgress size={16} /> : undefined}
          sx={{ textTransform: 'none', px: 3, fontWeight: 700 }}
        >
          {quote ? 'Save Changes' : 'Create Quote'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

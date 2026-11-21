import { useEffect, useRef, useState } from 'react'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import {
  ChevronRightIcon,
  HeartIcon,
  SparklesIcon,
  TrashIcon,
} from '../DocIcons'
import MarkdownEditor from '../admin/MarkdownEditor'
import MoodPicker from './MoodPicker'
import AttachmentStrip from './AttachmentStrip'
import type {
  JournalAttachment,
  JournalAttachmentInput,
  JournalEntry,
  JournalEntryInput,
  JournalPrompt,
  Mood,
} from '../../services/journalApi'
import { getLocalTodayDateString } from '../../utils/journal'

interface JournalEditorFormProps {
  initialData?: JournalEntry
  defaultDate?: string
  defaultPrompt?: JournalPrompt | null
  onSave: (data: JournalEntryInput) => Promise<JournalEntry>
  onDelete?: (id: number) => Promise<void>
  onToggleFavorite?: (id: number) => Promise<void>
  onAddAttachment?: (entryId: number, data: JournalAttachmentInput) => Promise<void>
  onDeleteAttachment?: (attachmentId: number) => Promise<void>
}

export default function JournalEditorForm({
  initialData,
  defaultDate,
  defaultPrompt,
  onSave,
  onDelete,
  onToggleFavorite,
  onAddAttachment,
  onDeleteAttachment,
}: JournalEditorFormProps) {
  const isEditing = Boolean(initialData?.id)

  const [entryDate, setEntryDate] = useState(
    initialData?.entry_date || defaultDate || getLocalTodayDateString()
  )
  const [title, setTitle] = useState(initialData?.title || '')
  const [content, setContent] = useState(initialData?.content || '')
  const [mood, setMood] = useState<Mood | null>(initialData?.mood ?? null)
  const [location, setLocation] = useState(initialData?.location || '')
  const [tags, setTags] = useState<string[]>(initialData?.tags || [])
  const [tagInput, setTagInput] = useState('')
  const [isFavorite, setIsFavorite] = useState(initialData?.is_favorite || false)

  // Reflections
  const [gratitude, setGratitude] = useState(initialData?.gratitude || '')
  const [highlight, setHighlight] = useState(initialData?.highlight || '')
  const [challenge, setChallenge] = useState(initialData?.challenge || '')
  const [lesson, setLesson] = useState(initialData?.lesson || '')
  const [promptId] = useState<number | null>(
    initialData?.prompt_id ?? defaultPrompt?.id ?? null
  )

  const [attachments, setAttachments] = useState<JournalAttachment[]>(
    initialData?.attachments || []
  )

  const [savingStatus, setSavingStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isFirstRender = useRef(true)

  // Sync state if initialData changes
  useEffect(() => {
    if (initialData) {
      setEntryDate(initialData.entry_date)
      setTitle(initialData.title)
      setContent(initialData.content)
      setMood(initialData.mood)
      setLocation(initialData.location || '')
      setTags(initialData.tags || [])
      setIsFavorite(initialData.is_favorite)
      setGratitude(initialData.gratitude || '')
      setHighlight(initialData.highlight || '')
      setChallenge(initialData.challenge || '')
      setLesson(initialData.lesson || '')
      setAttachments(initialData.attachments || [])
    }
  }, [initialData])

  // Prepare payload
  const buildPayload = (): JournalEntryInput => ({
    entry_date: entryDate,
    title: title.trim(),
    content,
    mood,
    location: location.trim() || null,
    tags,
    is_favorite: isFavorite,
    prompt_id: promptId,
    gratitude: gratitude.trim() || null,
    highlight: highlight.trim() || null,
    challenge: challenge.trim() || null,
    lesson: lesson.trim() || null,
  })

  // Manual save handler
  const handleManualSave = async () => {
    try {
      setSavingStatus('saving')
      const saved = await onSave(buildPayload())
      setSavingStatus('saved')
      if (saved.attachments) {
        setAttachments(saved.attachments)
      }
    } catch {
      setSavingStatus('error')
    }
  }

  // Autosave for existing entries (debounced)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    if (!isEditing) return // Do not autosave creation to avoid phantom rows

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)

    setSavingStatus('saving')
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await onSave(buildPayload())
        setSavingStatus('saved')
      } catch {
        setSavingStatus('error')
      }
    }, 1200)

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    }
  }, [entryDate, title, content, mood, location, tags, gratitude, highlight, challenge, lesson])

  // Tag addition
  const handleAddTag = () => {
    const clean = tagInput.trim().replace(/^#/, '')
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove))
  }

  return (
    <Stack spacing={3.5} sx={{ width: '100%' }}>
      {/* Top action header: date, favorite, autosave status, save/delete */}
      <Stack
        direction="row"
        sx={{
          pb: 1,
          borderBottom: '1px solid',
          borderColor: 'divider',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <TextField
            type="date"
            size="small"
            value={entryDate}
            onChange={(e) => setEntryDate(e.target.value)}
            sx={{ width: 170 }}
          />

          {isEditing && (
            <Tooltip title={isFavorite ? 'Remove from favorites' : 'Mark as favorite'}>
              <IconButton
                onClick={async () => {
                  setIsFavorite(!isFavorite)
                  if (initialData?.id && onToggleFavorite) {
                    await onToggleFavorite(initialData.id)
                  }
                }}
                sx={{
                  color: isFavorite ? 'error.main' : 'action.disabled',
                  '&:hover': { color: 'error.main' },
                }}
              >
                <HeartIcon />
              </IconButton>
            </Tooltip>
          )}

          {savingStatus === 'saving' && (
            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', color: 'text.secondary' }}>
              <CircularProgress size={14} />
              <Typography variant="caption">Saving...</Typography>
            </Stack>
          )}
          {savingStatus === 'saved' && (
            <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600 }}>
              Saved
            </Typography>
          )}
          {savingStatus === 'error' && (
            <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 600 }}>
              Save failed
            </Typography>
          )}
        </Stack>

        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          {isEditing && onDelete && initialData && (
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<TrashIcon />}
              onClick={() => onDelete(initialData.id)}
              sx={{ textTransform: 'none', borderRadius: 2 }}
            >
              Delete
            </Button>
          )}

          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={handleManualSave}
            disabled={savingStatus === 'saving'}
            sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600, px: 2.5 }}
          >
            {isEditing ? 'Save' : 'Save Entry'}
          </Button>
        </Stack>
      </Stack>

      {/* Mood Section */}
      <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: 'text.secondary' }}>
          HOW ARE YOU FEELING?
        </Typography>
        <MoodPicker value={mood} onChange={setMood} />
      </Paper>

      {/* Title (Optional) */}
      <TextField
        fullWidth
        placeholder="Title (optional)"
        variant="standard"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        slotProps={{
          input: {
            disableUnderline: true,
            sx: {
              fontSize: '1.75rem',
              fontWeight: 700,
              py: 0.5,
            },
          },
        }}
      />

      {/* Content Editor */}
      <Box sx={{ minHeight: 320 }}>
        <MarkdownEditor
          value={content}
          onChange={setContent}
          minRows={14}
        />
      </Box>

      {/* Reflection Accordion */}
      <Accordion
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: '12px !important',
          '&:before': { display: 'none' },
        }}
      >
        <AccordionSummary expandIcon={<ChevronRightIcon sx={{ transform: 'rotate(90deg)' }} />}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <SparklesIcon sx={{ color: 'secondary.main', fontSize: 20 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Reflections & Learnings
            </Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 0 }}>
          <Stack spacing={2}>
            <TextField
              label="What are you grateful for today?"
              fullWidth
              multiline
              rows={2}
              value={gratitude}
              onChange={(e) => setGratitude(e.target.value)}
            />
            <TextField
              label="Highlight of the day"
              fullWidth
              multiline
              rows={2}
              value={highlight}
              onChange={(e) => setHighlight(e.target.value)}
            />
            <TextField
              label="A challenge or obstacle"
              fullWidth
              multiline
              rows={2}
              value={challenge}
              onChange={(e) => setChallenge(e.target.value)}
            />
            <TextField
              label="Lesson or takeaway"
              fullWidth
              multiline
              rows={2}
              value={lesson}
              onChange={(e) => setLesson(e.target.value)}
            />
          </Stack>
        </AccordionDetails>
      </Accordion>

      {/* Attachments (Available when entry has an ID) */}
      {isEditing && initialData?.id && onAddAttachment && onDeleteAttachment && (
        <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <AttachmentStrip
            attachments={attachments}
            onAddAttachment={async (data) => {
              await onAddAttachment(initialData.id, data)
            }}
            onDeleteAttachment={async (attId) => {
              await onDeleteAttachment(attId)
            }}
          />
        </Paper>
      )}

      {/* Tags and Location */}
      <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Stack spacing={2}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
            METADATA
          </Typography>

          <TextField
            label="Location (optional)"
            size="small"
            placeholder="e.g. San Francisco, Home, Coffee Shop"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          <Stack spacing={1}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <TextField
                label="Tags"
                size="small"
                placeholder="Add a tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddTag()
                  }
                }}
                sx={{ flexGrow: 1 }}
              />
              <Button
                variant="outlined"
                size="small"
                onClick={handleAddTag}
                sx={{ textTransform: 'none', borderRadius: 2 }}
              >
                Add
              </Button>
            </Stack>

            {tags.length > 0 && (
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                {tags.map((t) => (
                  <Chip
                    key={t}
                    label={t}
                    onDelete={() => handleRemoveTag(t)}
                    size="small"
                    sx={{ borderRadius: 1.5 }}
                  />
                ))}
              </Stack>
            )}
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  )
}

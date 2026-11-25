import { useEffect, useRef, useState } from 'react'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import {
  ChevronRightIcon,
  HeartIcon,
  SparklesIcon,
  TrashIcon,
} from '../DocIcons'
import MarkdownEditor from '../admin/MarkdownEditor'
import LiveMarkdownEditor from '../editor/LiveMarkdownEditor'
import SmartTagInput from '../common/SmartTagInput'
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
import {
  clearDraft,
  readDraft,
  writeDraft,
  type JournalDraft,
  type JournalDraftData,
} from '../../hooks/useJournalDraft'

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

// --- Save / draft plumbing (module level so effects don't need them in deps) ---

/** Stable string snapshot of the editable fields, for dirty checks. */
function snapshotOf(fields: JournalDraftData): string {
  return JSON.stringify(fields)
}

// is_favorite is deliberately NOT part of any save payload: the backend toggle is a
// flip (`not entry.is_favorite`), so a concurrent update carrying it can race and
// silently revert a ♥. The toggle endpoint is the sole writer (schema excludes unset).
function payloadFrom(fields: JournalDraftData): JournalEntryInput {
  return {
    entry_date: fields.entryDate,
    title: fields.title.trim(),
    content: fields.content,
    mood: fields.mood,
    location: fields.location.trim() || null,
    tags: fields.tags,
    prompt_id: fields.promptId,
    gratitude: fields.gratitude.trim() || null,
    highlight: fields.highlight.trim() || null,
    challenge: fields.challenge.trim() || null,
    lesson: fields.lesson.trim() || null,
  }
}

/**
 * Pick the write-through draft worth restoring for this mount, if any.
 * Existing entry: only when the draft is newer than the server copy
 * (`savedAt > updated_at`); stale drafts are dropped. New entry: same requested
 * date, and it must actually contain text (empty → nothing to restore).
 */
function pickRestoreDraft(
  initialData: JournalEntry | undefined,
  defaultDate?: string,
): JournalDraft | null {
  const scope = initialData
    ? `entry.${initialData.id}`
    : `new.${defaultDate || getLocalTodayDateString()}`
  const draft = readDraft(scope)
  if (!draft) return null
  if (initialData) {
    const serverAt = Date.parse(initialData.updated_at)
    if (Number.isFinite(serverAt) && draft.savedAt > serverAt) return draft
    clearDraft(scope) // server copy is newer → the insurance is stale garbage
    return null
  }
  if (!draft.title.trim() && !draft.content.trim()) {
    clearDraft(scope)
    return null
  }
  return draft
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
  const mountDate = initialData?.entry_date || defaultDate || getLocalTodayDateString()

  // The server copy at mount is the "last saved" baseline. A newer local draft, if
  // any, is restored silently during the first render (Apple-style: never a prompt).
  const serverFields: JournalDraftData = {
    entryDate: mountDate,
    title: initialData?.title || '',
    content: initialData?.content || '',
    mood: initialData?.mood ?? null,
    location: initialData?.location || '',
    tags: initialData?.tags || [],
    isFavorite: initialData?.is_favorite || false,
    gratitude: initialData?.gratitude || '',
    highlight: initialData?.highlight || '',
    challenge: initialData?.challenge || '',
    lesson: initialData?.lesson || '',
    promptId: initialData?.prompt_id ?? defaultPrompt?.id ?? null,
  }
  const [restoredDraft] = useState(() => pickRestoreDraft(initialData, defaultDate))
  const initialFields = restoredDraft ?? serverFields

  const [entryDate, setEntryDate] = useState(initialFields.entryDate)
  const [title, setTitle] = useState(initialFields.title)
  const [content, setContent] = useState(initialFields.content)
  const [mood, setMood] = useState<Mood | null>(initialFields.mood)
  const [location, setLocation] = useState(initialFields.location)
  const [tags, setTags] = useState<string[]>(initialFields.tags)
  const [isFavorite, setIsFavorite] = useState(initialFields.isFavorite)

  // Reflections
  const [gratitude, setGratitude] = useState(initialFields.gratitude)
  const [highlight, setHighlight] = useState(initialFields.highlight)
  const [challenge, setChallenge] = useState(initialFields.challenge)
  const [lesson, setLesson] = useState(initialFields.lesson)
  const [promptId] = useState<number | null>(initialFields.promptId)

  const [attachments, setAttachments] = useState<JournalAttachment[]>(
    initialData?.attachments || []
  )

  const [editorMode, setEditorMode] = useState<'live' | 'standard'>('live')
  const [savingStatus, setSavingStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const draftTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const isFirstRender = useRef(true)
  const isSavingRef = useRef(false)
  const pendingSaveRef = useRef(false)
  // The id the form is actually saving to (adopted after the first create).
  const entryIdRef = useRef<number | undefined>(initialData?.id)
  // Insurance scope, fixed at mount (`entry.<id>` / `new.<date>`), moved to the
  // entry scope once the first create lands.
  const draftScopeRef = useRef<string>(
    initialData ? `entry.${initialData.id}` : `new.${mountDate}`
  )
  const lastSavedRef = useRef<string>(snapshotOf(serverFields))
  const latestFieldsRef = useRef<JournalDraftData>(initialFields)
  const onSaveRef = useRef(onSave)
  const runSaveRef = useRef<() => Promise<void>>(async () => { })

  // Autosave + invisible write-through, sharing one trigger (any field change):
  //   - 300 ms: mirror unsaved fields into localStorage so refresh / tab close /
  //     offline / a failed save can never destroy typing (never prompts).
  //   - 1200 ms: create on first real input, then update forever after. The empty
  //     guard lives in runSave (no phantom rows).
  // The first run is skipped so nothing can clear a restored draft before it is read.
  // Declared before the sync effect so latestFieldsRef is fresh when it dirty-checks.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return undefined
    }
    const fields: JournalDraftData = {
      entryDate,
      title,
      content,
      mood,
      location,
      tags,
      isFavorite,
      gratitude,
      highlight,
      challenge,
      lesson,
      promptId,
    }
    latestFieldsRef.current = fields
    const dirty = snapshotOf(fields) !== lastSavedRef.current

    window.clearTimeout(draftTimeoutRef.current)
    window.clearTimeout(saveTimeoutRef.current)
    if (!dirty) {
      // Back to the saved state → the insurance is no longer needed, and a
      // "Saving…" left over from the dirty period must not get stuck.
      clearDraft(draftScopeRef.current)
      setSavingStatus((s) => (s === 'saving' ? 'idle' : s))
      return undefined
    }
    setSavingStatus('saving')
    draftTimeoutRef.current = window.setTimeout(() => {
      // Re-check at fire time: a save may have landed in the meantime.
      if (snapshotOf(latestFieldsRef.current) !== lastSavedRef.current) {
        writeDraft(draftScopeRef.current, latestFieldsRef.current)
      }
    }, 300)
    saveTimeoutRef.current = window.setTimeout(() => {
      void runSaveRef.current()
    }, 1200)
    return () => {
      window.clearTimeout(draftTimeoutRef.current)
      window.clearTimeout(saveTimeoutRef.current)
    }
  }, [
    entryDate,
    title,
    content,
    mood,
    location,
    tags,
    isFavorite,
    gratitude,
    highlight,
    challenge,
    lesson,
    promptId,
  ])

  // Adopt server state only when a *different* entry is loaded AND we are not dirty
  // (the create transition delivers initialData while typing continues — local text
  // wins). Same-entry refreshes stop at the id gate. Attachments are always adopted:
  // they are server-managed and never typed locally.
  const syncedEntryIdRef = useRef<number | undefined>(initialData?.id)
  useEffect(() => {
    if (!initialData) return
    setAttachments(initialData.attachments || [])
    if (syncedEntryIdRef.current === initialData.id) return
    if (lastSavedRef.current !== snapshotOf(latestFieldsRef.current)) return
    syncedEntryIdRef.current = initialData.id
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
  }, [initialData])

  // One save path for the autosave timer, the manual Save button and the unmount
  // flush. Always reads the freshest fields via latestFieldsRef, so a stale closure
  // can never PUT old values.
  const runSave = async (): Promise<void> => {
    if (isSavingRef.current) {
      pendingSaveRef.current = true // a save is in flight — follow up with the newest fields
      return
    }
    const fields = latestFieldsRef.current
    const isNew = entryIdRef.current === undefined
    if (isNew && !fields.title.trim() && !fields.content.trim()) {
      // Empty draft → never create a phantom row (type nothing → nothing saved).
      setSavingStatus('idle')
      return
    }
    const sentSnapshot = snapshotOf(fields)
    isSavingRef.current = true
    setSavingStatus('saving')
    try {
      const saved = await onSaveRef.current(payloadFrom(fields))
      lastSavedRef.current = sentSnapshot
      if (saved.attachments) {
        setAttachments(saved.attachments)
      }
      const stillDirty = snapshotOf(latestFieldsRef.current) !== sentSnapshot
      if (isNew && saved.id) {
        // First create landed: move the insurance draft to the entry scope.
        const oldScope = draftScopeRef.current
        entryIdRef.current = saved.id
        draftScopeRef.current = `entry.${saved.id}`
        if (stillDirty) {
          writeDraft(draftScopeRef.current, latestFieldsRef.current)
        } else {
          clearDraft(oldScope)
        }
      } else if (!stillDirty) {
        clearDraft(draftScopeRef.current)
      }
      setSavingStatus('saved')
    } catch {
      setSavingStatus('error')
    } finally {
      isSavingRef.current = false
      if (pendingSaveRef.current) {
        pendingSaveRef.current = false
        void runSave()
      }
    }
  }
  useEffect(() => {
    runSaveRef.current = runSave
  })

  useEffect(() => {
    onSaveRef.current = onSave
  }, [onSave])

  // Manual save: flush the debounce first so a pending timer can't save twice.
  const handleManualSave = () => {
    window.clearTimeout(saveTimeoutRef.current)
    void runSaveRef.current()
  }

  // Flush on unmount (journal-plan.md §187/547): never lose the last keystrokes.
  // The write-through runs first and also covers new drafts — calling onSave there
  // would create an entry and hijack the user's navigation with a redirect.
  // Existing entries additionally get a best-effort PUT.
  useEffect(() => {
    return () => {
      window.clearTimeout(saveTimeoutRef.current)
      window.clearTimeout(draftTimeoutRef.current)
      const fields = latestFieldsRef.current
      const dirty = snapshotOf(fields) !== lastSavedRef.current
      if (dirty) {
        writeDraft(draftScopeRef.current, fields) // synchronous insurance
      }
      if (!dirty || isSavingRef.current) return // in-flight save already covers this
      const id = entryIdRef.current
      if (!id) return // new draft: the write-through covers it until the next visit
      void onSaveRef.current(payloadFrom(fields)).catch(() => { }) // best-effort, no status updates
    }
  }, [])

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
      <Paper
        variant="outlined"
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          bgcolor: 'background.paper',
        }}
      >
        <Box
          sx={{
            px: 2,
            py: 1,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.02),
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontWeight: 650,
              color: 'text.secondary',
              letterSpacing: 0.6,
              textTransform: 'uppercase',
              fontSize: '0.7rem',
            }}
          >
            {editorMode === 'live' ? 'Obsidian Live Preview' : 'Standard Markdown'}
          </Typography>

          <ToggleButtonGroup
            size="small"
            exclusive
            value={editorMode}
            onChange={(_, next) => {
              if (next) setEditorMode(next)
            }}
            sx={{ height: 26 }}
          >
            <ToggleButton
              value="live"
              sx={{
                px: 1.25,
                fontSize: '0.75rem',
                textTransform: 'none',
                fontWeight: 600,
                py: 0,
              }}
            >
              Live Preview
            </ToggleButton>
            <ToggleButton
              value="standard"
              sx={{
                px: 1.25,
                fontSize: '0.75rem',
                textTransform: 'none',
                fontWeight: 600,
                py: 0,
              }}
            >
              Standard
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box sx={{ p: 2, minHeight: 320 }}>
          {editorMode === 'live' ? (
            // No inner key: entry switches remount the whole form via the page key,
            // and re-keying here would reset the cursor on the create transition.
            <LiveMarkdownEditor
              initialContent={content}
              onChange={setContent}
              minHeight={320}
              placeholder="What happened today? Write your thoughts, ideas, or reflections..."
            />
          ) : (
            <MarkdownEditor
              value={content}
              onChange={setContent}
              minRows={14}
            />
          )}
        </Box>
      </Paper>

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

          <SmartTagInput
            value={tags}
            onChange={setTags}
            placeholder="Add tags (e.g. #gratitude, #work)…"
          />
        </Stack>
      </Paper>
    </Stack>
  )
}

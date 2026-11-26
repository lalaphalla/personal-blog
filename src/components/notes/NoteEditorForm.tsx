import { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import {
  ArchiveIcon,
  StarFilledIcon,
  StarIcon,
  TrashIcon,
} from '../DocIcons'
import MarkdownEditor from '../admin/MarkdownEditor'
import LiveMarkdownEditor from '../editor/LiveMarkdownEditor'
import SmartTagInput from '../common/SmartTagInput'
import { getErrorMessage } from '../../config/queryClient'
import {
  archiveNote,
  createNote,
  deleteNote,
  getNote,
  listNotebooks,
  toggleFavoriteNote,
  unarchiveNote,
  updateNote,
  type Note,
} from '../../services/notesApi'

type SaveStatus = 'idle' | 'dirty' | 'saving' | 'saved' | 'error'

const SERIF_FONT = "'Iowan Old Style', 'Palatino Linotype', Palatino, 'Source Serif 4', Georgia, serif"
const AUTOSAVE_DELAY = 800

function snapshot(
  title: string,
  content: string,
  notebookId: number | null,
  tags: string[],
): string {
  return JSON.stringify({ title, content, notebookId, tags })
}

interface NoteEditorFormProps {
  noteId?: number
  defaultNotebookId?: number | null
  onDone: (id: number) => void
  onDeleted: () => void
  /** Called after a brand-new note is created (route replace to /:id/edit). */
  onCreated?: (id: number) => void
  /** Pane mode: fill the available height and scroll internally. */
  compact?: boolean
}

/**
 * Shared note editor with debounced autosave.
 * The parent must key this component by note id so switching notes remounts it
 * and the cleanup flush saves the previous note's pending keystrokes.
 */
export default function NoteEditorForm({
  noteId: initialNoteId,
  defaultNotebookId = null,
  onDone,
  onDeleted,
  onCreated,
  compact = false,
}: NoteEditorFormProps) {
  const queryClient = useQueryClient()

  // Seed from the query cache so a warm-cache mount paints complete on the first
  // frame (the editor is mount-only and cannot be filled in later).
  const cachedNote = initialNoteId
    ? queryClient.getQueryData<Note>(['admin', 'notes', initialNoteId])
    : undefined

  const [title, setTitle] = useState(cachedNote?.title ?? '')
  const [content, setContent] = useState(cachedNote?.content ?? '')
  const [tags, setTags] = useState<string[]>(cachedNote?.tags ?? [])
  const [notebookId, setNotebookId] = useState<number | null>(
    cachedNote ? cachedNote.notebook_id : (defaultNotebookId ?? null),
  )
  const [editorMode, setEditorMode] = useState<'live' | 'standard'>('live')
  // The mount-only editor may only render once `content` holds real note text.
  const [contentLoaded, setContentLoaded] = useState(() => !initialNoteId || Boolean(cachedNote))
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [saveError, setSaveError] = useState<string | null>(null)
  const [currentNoteId, setCurrentNoteId] = useState<number | undefined>(initialNoteId)

  const noteIdRef = useRef<number | undefined>(initialNoteId)
  const loadedRef = useRef(!initialNoteId)
  const lastSavedRef = useRef<string | null>(
    !initialNoteId ? snapshot('', '', defaultNotebookId ?? null, []) : null
  )
  const timerRef = useRef<number | undefined>(undefined)
  const latestRef = useRef<{ title: string; content: string; notebookId: number | null; tags: string[] }>({
    title: '',
    content: '',
    notebookId: defaultNotebookId ?? null,
    tags: [],
  })

  useEffect(() => {
    latestRef.current = { title, content, notebookId, tags }
  }, [title, content, notebookId, tags])

  const { data: notebooks } = useQuery({
    queryKey: ['admin', 'notebooks'],
    queryFn: listNotebooks,
  })

  const { data: note, isPending: isNotePending, isError: isNoteError } = useQuery({
    queryKey: ['admin', 'notes', initialNoteId],
    queryFn: () => getNote(initialNoteId!),
    enabled: Boolean(initialNoteId),
  })

  // Load an existing note into the form exactly once.
  useEffect(() => {
    if (!initialNoteId || !note || loadedRef.current) return
    setTitle(note.title)
    setContent(note.content)
    setTags(note.tags || [])
    setNotebookId(note.notebook_id)
    lastSavedRef.current = snapshot(
      note.title,
      note.content,
      note.notebook_id,
      note.tags || [],
    )
    loadedRef.current = true
    setContentLoaded(true)
  }, [note, initialNoteId])

  const persist = async (): Promise<{ ok: boolean; id?: number }> => {
    const current = latestRef.current
    const next = snapshot(current.title, current.content, current.notebookId, current.tags)
    if (next === lastSavedRef.current) return { ok: true, id: noteIdRef.current }

    const payload = {
      title: current.title,
      content: current.content,
      tags: current.tags,
      notebook_id: current.notebookId,
    }

    setSaveStatus('saving')
    try {
      const creating = !noteIdRef.current
      const saved = noteIdRef.current
        ? await updateNote(noteIdRef.current, payload)
        : await createNote(payload)
      noteIdRef.current = saved.id
      setCurrentNoteId(saved.id)
      lastSavedRef.current = next
      setSaveError(null)
      setSaveStatus('saved')
      queryClient.setQueryData(['admin', 'notes', saved.id], saved)
      await queryClient.invalidateQueries({ queryKey: ['admin', 'notes'] })
      if (creating) onCreated?.(saved.id)
      return { ok: true, id: saved.id }
    } catch (error) {
      setSaveStatus('error')
      setSaveError(getErrorMessage(error))
      return { ok: false, id: noteIdRef.current }
    }
  }

  const persistRef = useRef<() => Promise<{ ok: boolean; id?: number }>>(persist)
  useEffect(() => {
    persistRef.current = persist
  })

  // Debounced autosave. State updates happen in the input handlers, not here.
  useEffect(() => {
    if (!loadedRef.current) return undefined
    const next = snapshot(title, content, notebookId, tags)
    if (next === lastSavedRef.current) return undefined
    window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => {
      void persistRef.current()
    }, AUTOSAVE_DELAY)
    return () => window.clearTimeout(timerRef.current)
  }, [title, content, notebookId, tags])

  // Flush pending edits when the editor unmounts (switching notes or closing).
  // This is best-effort: destructive navigation is not blocked when it fails.
  useEffect(() => {
    return () => {
      window.clearTimeout(timerRef.current)
      const id = noteIdRef.current
      const current = latestRef.current
      if (!loadedRef.current || !id) return
      if (snapshot(current.title, current.content, current.notebookId, current.tags) === lastSavedRef.current) {
        return
      }
      void updateNote(id, {
        title: current.title,
        content: current.content,
        tags: current.tags,
        notebook_id: current.notebookId,
      }).catch(() => {})
    }
  }, [])

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin', 'notes'] })

  const favoriteMutation = useMutation({
    mutationFn: () => toggleFavoriteNote(noteIdRef.current!),
    onSuccess: (updated) => {
      queryClient.setQueryData(['admin', 'notes', updated.id], updated)
      void invalidate()
    },
  })

  const archiveMutation = useMutation({
    mutationFn: () =>
      note?.archived_at ? unarchiveNote(noteIdRef.current!) : archiveNote(noteIdRef.current!),
    onSuccess: (updated) => {
      queryClient.setQueryData(['admin', 'notes', updated.id], updated)
      void invalidate()
      if (updated.archived_at) onDone(updated.id)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteNote(noteIdRef.current!),
    onSuccess: () => {
      void invalidate()
      onDeleted()
    },
  })

  const markDirty = () => {
    if (saveStatus !== 'dirty') setSaveStatus('dirty')
  }

  const handleDone = async () => {
    window.clearTimeout(timerRef.current)
    const result = await persistRef.current()
    if (!result.ok) return
    if (result.id) onDone(result.id)
  }

  const statusLabel: Record<SaveStatus, string> = {
    idle: initialNoteId ? 'Saved' : 'Draft',
    dirty: 'Unsaved changes…',
    saving: 'Saving…',
    saved: 'Saved',
    error: 'Save failed',
  }

  if (initialNoteId && isNotePending) {
    return (
      <Stack sx={{ alignItems: 'center', py: 8 }}>
        <Typography variant="body2" color="text.secondary">
          Loading note…
        </Typography>
      </Stack>
    )
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: compact ? '100%' : 'auto',
        minHeight: 0,
        bgcolor: 'background.paper',
      }}
    >
      <Stack
        direction="row"
        sx={{
          alignItems: 'center',
          gap: 1,
          px: 2,
          py: 1,
          borderBottom: '1px solid',
          borderColor: 'divider',
          flexWrap: 'wrap',
          rowGap: 0.5,
        }}
      >
        <Typography
          variant="caption"
          color={saveStatus === 'error' ? 'error.main' : 'text.secondary'}
          aria-live="polite"
          sx={{ minWidth: 96 }}
        >
          {statusLabel[saveStatus]}
        </Typography>
        <Box sx={{ flex: 1 }} />
        {currentNoteId ? (
          <>
            <Tooltip title={note?.is_favorite ? 'Remove from favorites' : 'Add to favorites'}>
              <IconButton
                size="small"
                onClick={() => favoriteMutation.mutate()}
                disabled={favoriteMutation.isPending}
                aria-label="Toggle favorite"
              >
                {note?.is_favorite ? (
                  <StarFilledIcon sx={{ color: 'warning.main' }} />
                ) : (
                  <StarIcon />
                )}
              </IconButton>
            </Tooltip>
            <Tooltip title={note?.archived_at ? 'Unarchive note' : 'Archive note'}>
              <IconButton
                size="small"
                onClick={() => archiveMutation.mutate()}
                disabled={archiveMutation.isPending}
                aria-label="Toggle archive"
              >
                <ArchiveIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete note">
              <IconButton
                size="small"
                color="error"
                onClick={() => {
                  if (window.confirm('Delete this note permanently?')) deleteMutation.mutate()
                }}
                disabled={deleteMutation.isPending}
                aria-label="Delete note"
              >
                <TrashIcon />
              </IconButton>
            </Tooltip>
            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
          </>
        ) : null}
        <Button
          variant="contained"
          size="small"
          onClick={() => void handleDone()}
          disabled={saveStatus === 'saving'}
          sx={{ borderRadius: 2 }}
        >
          Done
        </Button>
      </Stack>

      {saveError ? (
        <Alert severity="error" onClose={() => setSaveError(null)} sx={{ borderRadius: 0 }}>
          {saveError}
        </Alert>
      ) : null}

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: compact ? 'auto' : 'visible',
          px: compact ? { xs: 1.5, md: 2.5 } : 0,
          py: compact ? { xs: 1.5, md: 2.5 } : 0,
          bgcolor: compact ? 'background.default' : 'transparent',
        }}
      >
        <Paper
          variant="outlined"
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
            bgcolor: 'background.paper',
            boxShadow: '0 1px 2px rgba(8, 6, 13, 0.04)',
            maxWidth: 900,
            mx: 'auto',
          }}
        >
          <Box sx={{ px: { xs: 2.25, md: compact ? 4 : 5.5 }, pt: { xs: 2.5, md: compact ? 3 : 4 }, pb: 2 }}>
            <Typography
              variant="overline"
              sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: 1.4, lineHeight: 1.4 }}
            >
              Note
            </Typography>
            <TextField
              fullWidth
              variant="standard"
              placeholder="Untitled"
              value={title}
              autoFocus={!initialNoteId}
              onChange={(event) => {
                setTitle(event.target.value)
                markDirty()
              }}
              slotProps={{
                input: {
                  disableUnderline: true,
                  sx: {
                    fontFamily: SERIF_FONT,
                    fontSize: 'clamp(1.8rem, 1.4rem + 1.4vw, 2.35rem)',
                    fontWeight: 600,
                    letterSpacing: '-0.02em',
                    lineHeight: 1.2,
                    p: 0,
                  },
                },
                htmlInput: { 'aria-label': 'Note title' },
              }}
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 2 }}>
              <TextField
                select
                label="Notebook"
                size="small"
                sx={{ minWidth: { sm: 220 } }}
                value={notebookId === null ? '' : String(notebookId)}
                onChange={(event) => {
                  const value = event.target.value
                  setNotebookId(value === '' ? null : Number(value))
                  markDirty()
                }}
              >
                <MenuItem value="">No notebook</MenuItem>
                {(notebooks ?? []).map((option) => (
                  <MenuItem key={option.id} value={String(option.id)}>
                    {option.name}
                  </MenuItem>
                ))}
              </TextField>
              <Box sx={{ flex: 1, minWidth: { sm: 260 } }}>
                <SmartTagInput
                  value={tags}
                  onChange={(nextTags) => {
                    setTags(nextTags)
                    markDirty()
                  }}
                  fullWidth
                />
              </Box>
            </Stack>
          </Box>
          <Divider />
          <Box
            sx={{
              px: { xs: 2.25, md: compact ? 4 : 5.5 },
              py: 1.25,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.02),
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
          <Divider />
          <Box sx={{ px: { xs: 2.25, md: compact ? 4 : 5.5 }, py: { xs: 2.5, md: compact ? 3 : 3.5 } }}>
            {!contentLoaded ? (
              isNoteError ? (
                <Alert severity="error">Couldn't load this note. Go back and try again.</Alert>
              ) : (
                <Stack sx={{ alignItems: 'center', py: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Loading note…
                  </Typography>
                </Stack>
              )
            ) : editorMode === 'live' ? (
              // No inner key: note switches and the create transition are handled
              // by the pane-level key — re-keying here resets the cursor to 0.
              <LiveMarkdownEditor
                initialContent={content}
                onChange={(next) => {
                  setContent(next)
                  markDirty()
                }}
                minHeight={compact ? 420 : 500}
              />
            ) : (
              <MarkdownEditor
                value={content}
                onChange={(next) => {
                  setContent(next)
                  markDirty()
                }}
                minRows={compact ? 18 : 20}
              />
            )}
          </Box>
        </Paper>
      </Box>
    </Box>
  )
}

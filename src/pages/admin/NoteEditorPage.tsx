import { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link as RouterLink, useNavigate, useParams } from 'react-router'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import {
  ArchiveIcon,
  ArrowLeftIcon,
  EyeIcon,
  StarFilledIcon,
  StarIcon,
} from '../../components/DocIcons'
import MarkdownEditor from '../../components/admin/MarkdownEditor'
import { getErrorMessage } from '../../config/queryClient'
import { listNotebooks } from '../../services/notesApi'
import {
  archiveNote,
  createNote,
  deleteNote,
  getNote,
  toggleFavoriteNote,
  unarchiveNote,
  updateNote,
} from '../../services/notesApi'

type SaveStatus = 'idle' | 'dirty' | 'saving' | 'saved' | 'error'

const SERIF_FONT = "'Iowan Old Style', 'Palatino Linotype', Palatino, 'Source Serif 4', Georgia, serif"

function snapshot(
  title: string,
  content: string,
  notebookId: number | null,
  tagsText: string,
): string {
  return JSON.stringify({ title, content, notebookId, tagsText })
}

function parseTags(value: string): string[] {
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
}

function NoteEditorPage() {
  const { id } = useParams()
  const routeNoteId = id ? Number(id) : undefined
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [noteId, setNoteId] = useState<number | undefined>(routeNoteId)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tagsText, setTagsText] = useState('')
  const [notebookId, setNotebookId] = useState<number | null>(null)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [saveError, setSaveError] = useState<string | null>(null)

  const loadedRef = useRef(false)
  const lastSavedRef = useRef<string | null>(null)
  const saveTimerRef = useRef<number | undefined>(undefined)

  const { data: notebooks } = useQuery({
    queryKey: ['admin', 'notebooks'],
    queryFn: listNotebooks,
  })

  const { data: note, isPending: isNotePending } = useQuery({
    queryKey: ['admin', 'notes', routeNoteId],
    queryFn: () => getNote(routeNoteId!),
    enabled: Boolean(routeNoteId),
  })

  // Load an existing note into the form exactly once
  useEffect(() => {
    if (noteId && note && !loadedRef.current) {
      setTitle(note.title)
      setContent(note.content)
      setTagsText(note.tags.join(', '))
      setNotebookId(note.notebook_id)
      lastSavedRef.current = snapshot(note.title, note.content, note.notebook_id, note.tags.join(', '))
      loadedRef.current = true
    }
    if (!routeNoteId && !noteId) {
      loadedRef.current = true // new note: autosave can start immediately
    }
  }, [note, noteId, routeNoteId])

  // Debounced autosave: creates the note on first meaningful input, then PUTs changes
  useEffect(() => {
    if (!loadedRef.current) return undefined
    const next = snapshot(title, content, notebookId, tagsText)
    if (next === lastSavedRef.current) return undefined

    setSaveStatus('dirty')
    window.clearTimeout(saveTimerRef.current)
    saveTimerRef.current = window.setTimeout(() => {
      setSaveStatus('saving')
      const tags = parseTags(tagsText)
      const save = noteId
        ? updateNote(noteId, { title, content, tags, notebook_id: notebookId })
        : createNote({ title, content, tags, notebook_id: notebookId })
      void save
        .then((saved) => {
          lastSavedRef.current = next
          setSaveError(null)
          if (!noteId) {
            setNoteId(saved.id)
            navigate(`/admin/notes/${saved.id}/edit`, { replace: true })
          }
          setSaveStatus('saved')
          queryClient.invalidateQueries({ queryKey: ['admin', 'notes'] })
        })
        .catch((saveErrorCaught) => {
          setSaveStatus('error')
          setSaveError(getErrorMessage(saveErrorCaught))
        })
    }, 800)

    return () => window.clearTimeout(saveTimerRef.current)
  }, [title, content, notebookId, tagsText, noteId, navigate, queryClient])

  const invalidateNotes = () => queryClient.invalidateQueries({ queryKey: ['admin', 'notes'] })

  const favoriteMutation = useMutation({
    mutationFn: () => toggleFavoriteNote(noteId!),
    onSuccess: () => invalidateNotes(),
  })
  const archiveMutation = useMutation({
    mutationFn: () => (note?.archived_at ? unarchiveNote(note.id) : archiveNote(noteId!)),
    onSuccess: () => {
      invalidateNotes()
      navigate('/admin/notes')
    },
  })
  const deleteMutation = useMutation({
    mutationFn: () => deleteNote(noteId!),
    onSuccess: () => {
      invalidateNotes()
      navigate('/admin/notes')
    },
  })

  const statusLabel: Record<SaveStatus, string> = {
    idle: '',
    dirty: 'Unsaved changes…',
    saving: 'Saving…',
    saved: 'Saved ✓',
    error: '',
  }

  if (routeNoteId && isNotePending) {
    return (
      <Stack sx={{ alignItems: 'center', py: 8 }}>
        <CircularProgress />
      </Stack>
    )
  }

  return (
    <Box>
      <Stack
        direction="row"
        sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2.5, gap: 1, flexWrap: 'wrap', rowGap: 1 }}
      >
        <Button
          component={RouterLink}
          to="/admin/notes"
          size="small"
          startIcon={<ArrowLeftIcon />}
          sx={{ color: 'text.secondary' }}
        >
          Notes
        </Button>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', rowGap: 1 }}>
          <Typography
            variant="caption"
            color={saveStatus === 'error' ? 'error' : 'text.secondary'}
            sx={{ mr: 0.5 }}
          >
            {saveStatus === 'error' ? 'Save failed' : statusLabel[saveStatus]}
          </Typography>
          {noteId ? (
            <>
              <Button
                size="small"
                onClick={() => favoriteMutation.mutate()}
                title={note?.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
                startIcon={
                  note?.is_favorite ? (
                    <StarFilledIcon sx={{ color: 'warning.main' }} />
                  ) : (
                    <StarIcon />
                  )
                }
              >
                {note?.is_favorite ? 'Favorited' : 'Favorite'}
              </Button>
              <Button
                size="small"
                onClick={() => archiveMutation.mutate()}
                startIcon={<ArchiveIcon />}
              >
                {note?.archived_at ? 'Unarchive' : 'Archive'}
              </Button>
              <Button
                size="small"
                component={RouterLink}
                to={`/admin/notes/${noteId}`}
                startIcon={<EyeIcon />}
              >
                View
              </Button>
              <Button
                size="small"
                color="error"
                onClick={() => {
                  if (window.confirm('Delete this note permanently?')) deleteMutation.mutate()
                }}
              >
                Delete
              </Button>
            </>
          ) : null}
        </Stack>
      </Stack>

      {saveError ? (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setSaveError(null)}>
          {saveError}
        </Alert>
      ) : null}

      <Paper
        variant="outlined"
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          bgcolor: 'background.paper',
          boxShadow: '0 1px 2px rgba(8, 6, 13, 0.04)',
        }}
      >
        <Box sx={{ px: { xs: 2.5, md: 5.5 }, pt: { xs: 3, md: 4 }, pb: 2 }}>
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
            onChange={(event) => setTitle(event.target.value)}
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
              }}
            >
              <MenuItem value="">No notebook</MenuItem>
              {(notebooks ?? []).map((option) => (
                <MenuItem key={option.id} value={String(option.id)}>
                  {option.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Tags"
              size="small"
              fullWidth
              placeholder="idea, personal, todo…"
              value={tagsText}
              onChange={(event) => setTagsText(event.target.value)}
            />
          </Stack>
        </Box>
        <Divider />
        <Box sx={{ px: { xs: 2.5, md: 5.5 }, py: { xs: 2.5, md: 3.5 } }}>
          <MarkdownEditor
            value={content}
            onChange={setContent}
            minRows={20}
          />
        </Box>
      </Paper>
    </Box>
  )
}

export default NoteEditorPage

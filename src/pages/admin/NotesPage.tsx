import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link as RouterLink, useNavigate } from 'react-router'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { getErrorMessage } from '../../config/queryClient'
import {
  archiveNote,
  createNotebook,
  deleteNotebook,
  listAllTags,
  listNotebooks,
  listNotes,
  toggleFavoriteNote,
  unarchiveNote,
  type Note,
  type NoteView,
} from '../../services/notesApi'

const VIEWS: Array<{ key: NoteView | 'recent'; label: string }> = [
  { key: 'all', label: 'All notes' },
  { key: 'favorite', label: 'Favorites' },
  { key: 'recent', label: 'Recent' },
  { key: 'archive', label: 'Archive' },
]

type Mode = { kind: 'view'; view: NoteView | 'recent' } | { kind: 'notebook'; id: number }

function modeToParams(mode: Mode) {
  if (mode.kind === 'notebook') return { view: 'all' as const, notebook_id: mode.id }
  if (mode.view === 'recent') return { view: 'all' as const, limit: 5 }
  return { view: mode.view }
}

function modeLabel(mode: Mode): string {
  if (mode.kind === 'notebook') return 'notebook'
  return VIEWS.find((item) => item.key === mode.view)?.label ?? 'All notes'
}

function snippet(content: string): string {
  return content.replace(/\s+/g, ' ').trim().slice(0, 120)
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString()
}

function NoteCard({
  note,
  onEdit,
  onToggleFavorite,
  onArchiveToggle,
  onSelectTag,
}: {
  note: Note
  onEdit: (note: Note) => void
  onToggleFavorite: (note: Note) => void
  onArchiveToggle: (note: Note) => void
  onSelectTag: (tag: string) => void
}) {
  return (
    <Paper
      variant="outlined"
      component={RouterLink}
      to={`/admin/notes/${note.id}`}
      sx={{
        display: 'block',
        p: 2,
        mb: 1.5,
        textDecoration: 'none',
        color: 'inherit',
        '&:hover': { borderColor: 'primary.main' },
      }}
    >
      <Stack direction="row" sx={{ alignItems: 'flex-start', gap: 1 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }} noWrap>
              {note.title.trim() || 'Untitled'}
            </Typography>
            {note.archived_at ? <Chip size="small" label="Archived" /> : null}
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            {snippet(note.content) || 'Empty note'}
          </Typography>
          <Stack direction="row" spacing={0.5} sx={{ mb: 0.5, flexWrap: 'wrap', rowGap: 0.5 }}>
            {note.tags.map((tag) => (
              <Chip
                key={tag}
                size="small"
                label={tag}
                onClick={(event) => {
                  event.preventDefault()
                  onSelectTag(tag)
                }}
                sx={{ height: 20, fontSize: '0.7rem' }}
              />
            ))}
          </Stack>
          <Typography variant="caption" color="text.secondary">
            {formatDate(note.updated_at)}
          </Typography>
        </Box>
        <IconButton
          size="small"
          title="Edit note"
          onClick={(event) => {
            event.preventDefault()
            onEdit(note)
          }}
        >
          <Box component="span">✎</Box>
        </IconButton>
        <IconButton
          size="small"
          title={note.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
          onClick={(event) => {
            event.preventDefault()
            onToggleFavorite(note)
          }}
        >
          <Box component="span" sx={{ color: note.is_favorite ? 'warning.main' : 'text.disabled' }}>
            {note.is_favorite ? '★' : '☆'}
          </Box>
        </IconButton>
        <IconButton
          size="small"
          title={note.archived_at ? 'Unarchive' : 'Archive'}
          onClick={(event) => {
            event.preventDefault()
            onArchiveToggle(note)
          }}
        >
          <Box component="span" sx={{ color: note.archived_at ? 'text.primary' : 'text.disabled' }}>
            ⌛
          </Box>
        </IconButton>
      </Stack>
    </Paper>
  )
}

function NotesPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [mode, setMode] = useState<Mode>({ kind: 'view', view: 'all' })
  const [tagFilter, setTagFilter] = useState<string | null>(null)
  const [searchText, setSearchText] = useState('')
  const [search, setSearch] = useState('')
  const [newNotebookName, setNewNotebookName] = useState('')
  const [actionError, setActionError] = useState<string | null>(null)

  // Debounce the search box so typing doesn't fire a request per keystroke
  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchText), 300)
    return () => window.clearTimeout(timer)
  }, [searchText])

  const { data: notebooks } = useQuery({
    queryKey: ['admin', 'notebooks'],
    queryFn: listNotebooks,
  })

  const { data: allTags } = useQuery({
    queryKey: ['admin', 'notes', 'tags'],
    queryFn: listAllTags,
  })

  const params = modeToParams(mode)
  const { data: notes, isPending, isError, error, refetch } = useQuery({
    queryKey: [
      'admin',
      'notes',
      'list',
      mode.kind === 'view' ? mode.view : `nb-${mode.id}`,
      tagFilter ?? '',
      search,
    ],
    queryFn: () => listNotes({ ...params, tag: tagFilter ?? undefined, search: search || undefined }),
    placeholderData: (previous) => previous, // keep list visible while refiltering
  })

  const invalidateNotes = () => queryClient.invalidateQueries({ queryKey: ['admin', 'notes'] })

  const favoriteMutation = useMutation({
    mutationFn: (note: Note) => toggleFavoriteNote(note.id),
    onSuccess: invalidateNotes,
    onError: (mutationError) => setActionError(getErrorMessage(mutationError)),
  })
  const archiveMutation = useMutation({
    mutationFn: (note: Note) =>
      note.archived_at ? unarchiveNote(note.id) : archiveNote(note.id),
    onSuccess: invalidateNotes,
    onError: (mutationError) => setActionError(getErrorMessage(mutationError)),
  })
  const createNotebookMutation = useMutation({
    mutationFn: () => createNotebook({ name: newNotebookName.trim() }),
    onSuccess: () => {
      setNewNotebookName('')
      queryClient.invalidateQueries({ queryKey: ['admin', 'notebooks'] })
    },
    onError: (mutationError) => setActionError(getErrorMessage(mutationError)),
  })
  const deleteNotebookMutation = useMutation({
    mutationFn: (id: number) => deleteNotebook(id),
    onSuccess: (_result, id) => {
      if (mode.kind === 'notebook' && mode.id === id) setMode({ kind: 'view', view: 'all' })
      queryClient.invalidateQueries({ queryKey: ['admin', 'notebooks'] })
      invalidateNotes()
    },
    onError: (mutationError) => setActionError(getErrorMessage(mutationError)),
  })

  return (
    <Box>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Notes</Typography>
        <Button variant="contained" onClick={() => navigate('/admin/notes/new')}>
          New note
        </Button>
      </Stack>

      {actionError ? (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setActionError(null)}>
          {actionError}
        </Alert>
      ) : null}

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ alignItems: 'flex-start' }}>
        {/* Sidebar: views + notebooks */}
        <Paper variant="outlined" sx={{ width: { xs: '100%', md: 260 }, flexShrink: 0 }}>
          <List disablePadding>
            {VIEWS.map((item) => (
              <ListItemButton
                key={item.key}
                selected={mode.kind === 'view' && mode.view === item.key}
                onClick={() => setMode({ kind: 'view', view: item.key })}
              >
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
          </List>
          <Divider />
          <Box sx={{ p: 1.5 }}>
            <Typography variant="overline" color="text.secondary">
              Notebooks
            </Typography>
            <List disablePadding dense>
              {(notebooks ?? []).map((notebook) => (
                <ListItemButton
                  key={notebook.id}
                  dense
                  selected={mode.kind === 'notebook' && mode.id === notebook.id}
                  onClick={() => setMode({ kind: 'notebook', id: notebook.id })}
                >
                  <ListItemText
                    primary={notebook.name}
                    slotProps={{ primary: { noWrap: true } }}
                  />
                  <IconButton
                    size="small"
                    title="Delete notebook (notes are kept)"
                    onClick={(event) => {
                      event.stopPropagation()
                      if (window.confirm(`Delete notebook “${notebook.name}”? Its notes are kept.`)) {
                        deleteNotebookMutation.mutate(notebook.id)
                      }
                    }}
                  >
                    <Box component="span" sx={{ fontSize: 14 }}>
                      🗑
                    </Box>
                  </IconButton>
                </ListItemButton>
              ))}
            </List>
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <TextField
                size="small"
                fullWidth
                placeholder="New notebook"
                value={newNotebookName}
                onChange={(event) => setNewNotebookName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && newNotebookName.trim()) {
                    createNotebookMutation.mutate()
                  }
                }}
              />
              <Button
                variant="outlined"
                disabled={!newNotebookName.trim() || createNotebookMutation.isPending}
                onClick={() => createNotebookMutation.mutate()}
              >
                Add
              </Button>
            </Stack>
          </Box>
        </Paper>

        {/* Note list */}
        <Box sx={{ flex: 1, minWidth: 0, width: '100%' }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            sx={{ mb: 2, alignItems: 'center' }}
          >
            <TextField
              size="small"
              fullWidth
              placeholder="Search notes by title…"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
            />
            <TextField
              select
              size="small"
              label="Tag"
              sx={{ minWidth: 150 }}
              value={tagFilter ?? ''}
              onChange={(event) => setTagFilter(event.target.value || null)}
            >
              <MenuItem value="">All tags</MenuItem>
              {(allTags ?? []).map((tag) => (
                <MenuItem key={tag} value={tag}>
                  {tag}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
          {isPending ? null : isError ? (
            <Alert severity="error" action={<Button size="small" color="inherit" onClick={() => refetch()}>Retry</Button>}>
              {getErrorMessage(error)}
            </Alert>
          ) : notes && notes.length > 0 ? (
            <Box>
              <Stack direction="row" spacing={1} sx={{ mb: 1, alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  {modeLabel(mode)}
                </Typography>
                {tagFilter ? (
                  <Chip
                    size="small"
                    color="primary"
                    label={`tag: ${tagFilter}`}
                    onDelete={() => setTagFilter(null)}
                  />
                ) : null}
                {search ? (
                  <Chip
                    size="small"
                    color="secondary"
                    label={`search: ${search}`}
                    onDelete={() => {
                      setSearch('')
                      setSearchText('')
                    }}
                  />
                ) : null}
              </Stack>
              {notes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onEdit={(target) => navigate(`/admin/notes/${target.id}/edit`)}
                  onToggleFavorite={(target) => favoriteMutation.mutate(target)}
                  onArchiveToggle={(target) => archiveMutation.mutate(target)}
                  onSelectTag={(tag) => setTagFilter((current) => (current === tag ? null : tag))}
                />
              ))}
            </Box>
          ) : (
            <Alert severity="info">
              No notes here yet — create one with “New note”.
            </Alert>
          )}
        </Box>
      </Stack>
    </Box>
  )
}

export default NotesPage

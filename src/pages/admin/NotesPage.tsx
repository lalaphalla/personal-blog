import { useEffect, useState, type ReactNode } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link as RouterLink, useNavigate } from 'react-router'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import {
  ArchiveIcon,
  BookOpenIcon,
  ClockIcon,
  EditIcon,
  FileTextIcon,
  SearchIcon,
  StarFilledIcon,
  StarIcon,
  TrashIcon,
} from '../../components/DocIcons'
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

const VIEW_ICONS: Record<NoteView | 'recent', ReactNode> = {
  all: <FileTextIcon />,
  favorite: <StarIcon />,
  recent: <ClockIcon />,
  archive: <ArchiveIcon />,
}

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
        p: { xs: 1.75, sm: 2.25 },
        minHeight: 174,
        textDecoration: 'none',
        color: 'inherit',
        borderRadius: 3,
        transition: 'border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease',
        '&:hover': {
          borderColor: 'primary.main',
          boxShadow: '0 8px 24px rgba(25, 39, 68, 0.08)',
          transform: 'translateY(-2px)',
        },
      }}
    >
      <Stack direction="row" sx={{ alignItems: 'flex-start', gap: 1 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.75 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, minWidth: 0 }} noWrap>
              {note.title.trim() || 'Untitled'}
            </Typography>
            {note.archived_at ? <Chip size="small" label="Archived" /> : null}
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.25, lineHeight: 1.65, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '3.3em' }}>
            {snippet(note.content) || 'Empty note'}
          </Typography>
          <Stack direction="row" spacing={0.5} sx={{ mb: 1.25, flexWrap: 'wrap', rowGap: 0.5, maxHeight: 26, overflow: 'hidden' }}>
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
          <EditIcon sx={{ fontSize: 17 }} />
        </IconButton>
        <IconButton
          size="small"
          title={note.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
          onClick={(event) => {
            event.preventDefault()
            onToggleFavorite(note)
          }}
        >
          {note.is_favorite ? (
            <StarFilledIcon sx={{ fontSize: 17, color: 'warning.main' }} />
          ) : (
            <StarIcon sx={{ fontSize: 17, color: 'text.disabled' }} />
          )}
        </IconButton>
        <IconButton
          size="small"
          title={note.archived_at ? 'Unarchive' : 'Archive'}
          onClick={(event) => {
            event.preventDefault()
            onArchiveToggle(note)
          }}
        >
          <ArchiveIcon
            sx={{ fontSize: 17, color: note.archived_at ? 'text.primary' : 'text.disabled' }}
          />
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

  // One extra fetch powers the sidebar counters and the "Recent" list.
  const { data: noteStats } = useQuery({
    queryKey: ['admin', 'notes', 'stats'],
    queryFn: async () => {
      const [active, archived] = await Promise.all([
        listNotes({ view: 'all', limit: 200 }),
        listNotes({ view: 'archive', limit: 200 }),
      ])
      return { active, archived }
    },
  })

  const activeNotes = noteStats?.active ?? []
  const recentNotes = activeNotes.slice(0, 5)
  const viewCounts: Record<NoteView | 'recent', number> = {
    all: activeNotes.length,
    favorite: activeNotes.filter((item) => item.is_favorite).length,
    recent: recentNotes.length,
    archive: noteStats?.archived.length ?? 0,
  }
  const notebookCount = (notebookId: number) =>
    activeNotes.filter((item) => item.notebook_id === notebookId).length

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
      <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ alignItems: { xs: 'stretch', sm: 'center' }, justifyContent: 'space-between', gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="overline" color="primary.main" sx={{ fontWeight: 700, letterSpacing: 1.4 }}>YOUR WORKSPACE</Typography>
          <Typography variant="h4" sx={{ fontWeight: 750, letterSpacing: '-0.03em', lineHeight: 1.15 }}>Notes</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>Capture ideas, keep useful details close, and find them when you need them.</Typography>
        </Box>
        <Button variant="contained" size="large" sx={{ borderRadius: 2, alignSelf: { xs: 'stretch', sm: 'center' }, whiteSpace: 'nowrap' }} onClick={() => navigate('/admin/notes/new')}>
          New note
        </Button>
      </Stack>

      {actionError ? (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setActionError(null)}>
          {actionError}
        </Alert>
      ) : null}

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 1.5, md: 2.5 }} sx={{ alignItems: 'stretch' }}>
        {/* Sidebar: views + notebooks */}
        <Paper variant="outlined" sx={{ width: { xs: '100%', md: 250 }, flexShrink: 0, borderRadius: 3, overflow: 'hidden', alignSelf: 'flex-start' }}>
          <List disablePadding sx={{ display: { xs: 'flex', md: 'block' }, overflowX: { xs: 'auto', md: 'visible' }, px: 1, py: 0.75 }}>
            {VIEWS.map((item) => {
              const selected = mode.kind === 'view' && mode.view === item.key
              return (
                <ListItemButton
                  key={item.key}
                  sx={{
                    borderRadius: 2,
                    gap: 1,
                    minWidth: { xs: 'max-content', md: 'auto' },
                    '&.Mui-selected': {
                      bgcolor: 'primary.50',
                      color: 'primary.dark',
                      '&:hover': { bgcolor: 'primary.100' },
                    },
                  }}
                  selected={selected}
                  onClick={() => setMode({ kind: 'view', view: item.key })}
                >
                  <Box sx={{ display: 'flex', color: selected ? 'primary.main' : 'text.disabled' }}>
                    {VIEW_ICONS[item.key]}
                  </Box>
                  <ListItemText primary={item.label} />
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}
                  >
                    {viewCounts[item.key]}
                  </Typography>
                </ListItemButton>
              )
            })}
          </List>
          <Divider />
          <Box sx={{ p: 1.5 }}>
            <Stack
              direction="row"
              spacing={0.75}
              sx={{ alignItems: 'center', color: 'text.secondary', px: 1, mb: 0.25 }}
            >
              <BookOpenIcon sx={{ fontSize: 15 }} />
              <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                Notebooks
              </Typography>
            </Stack>
            <List disablePadding dense>
              {(notebooks ?? []).map((notebook) => {
                const selected = mode.kind === 'notebook' && mode.id === notebook.id
                return (
                  <ListItemButton
                    key={notebook.id}
                    dense
                    selected={selected}
                    onClick={() => setMode({ kind: 'notebook', id: notebook.id })}
                    sx={{
                      borderRadius: 1.5,
                      gap: 0.75,
                      '&.Mui-selected': {
                        bgcolor: 'primary.50',
                        color: 'primary.dark',
                        '&:hover': { bgcolor: 'primary.100' },
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        color: selected ? 'primary.main' : 'text.disabled',
                      }}
                    >
                      <BookOpenIcon sx={{ fontSize: 16 }} />
                    </Box>
                    <ListItemText
                      primary={notebook.name}
                      slotProps={{ primary: { noWrap: true, variant: 'body2' } }}
                    />
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}
                    >
                      {notebookCount(notebook.id)}
                    </Typography>
                    <IconButton
                      size="small"
                      title="Delete notebook (notes are kept)"
                      sx={{ ml: -0.5 }}
                      onClick={(event) => {
                        event.stopPropagation()
                        if (window.confirm(`Delete notebook “${notebook.name}”? Its notes are kept.`)) {
                          deleteNotebookMutation.mutate(notebook.id)
                        }
                      }}
                    >
                      <TrashIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </ListItemButton>
                )
              })}
            </List>
            <Stack direction="row" spacing={1} sx={{ mt: 1.25 }}>
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
          <Divider />
          <Box sx={{ p: 1.5, display: { xs: 'none', md: 'block' } }}>
            <Stack
              direction="row"
              spacing={0.75}
              sx={{ alignItems: 'center', color: 'text.secondary', px: 1, mb: 0.25 }}
            >
              <ClockIcon sx={{ fontSize: 15 }} />
              <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                Recent
              </Typography>
            </Stack>
            <List disablePadding dense>
              {recentNotes.map((recent) => (
                <ListItemButton
                  key={recent.id}
                  dense
                  component={RouterLink}
                  to={`/admin/notes/${recent.id}`}
                  sx={{ borderRadius: 1.5, gap: 0.75 }}
                >
                  <Box sx={{ display: 'flex', color: 'text.disabled' }}>
                    <FileTextIcon sx={{ fontSize: 15 }} />
                  </Box>
                  <ListItemText
                    primary={recent.title.trim() || 'Untitled'}
                    slotProps={{ primary: { noWrap: true, variant: 'body2' } }}
                  />
                </ListItemButton>
              ))}
              {recentNotes.length === 0 ? (
                <Typography variant="caption" color="text.secondary" sx={{ px: 1 }}>
                  No recent notes
                </Typography>
              ) : null}
            </List>
          </Box>
        </Paper>

        {/* Note list */}
        <Box sx={{ flex: 1, minWidth: 0, width: '100%' }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            sx={{ mb: 2, alignItems: 'stretch', p: { xs: 1.5, sm: 2 }, border: '1px solid', borderColor: 'divider', borderRadius: 3, bgcolor: 'background.paper' }}
          >
            <TextField
              size="small"
              fullWidth
              placeholder="Search notes by title…"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ fontSize: 17 }} />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              select
              size="small"
              label="Tag"
              sx={{ minWidth: { sm: 170 } }}
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
              <Stack direction="row" spacing={1} sx={{ mb: 1.5, alignItems: 'center', flexWrap: 'wrap', rowGap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  {modeLabel(mode)} · {notes.length} {notes.length === 1 ? 'note' : 'notes'}
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
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' }, gap: 1.5 }}>
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
            </Box>
          ) : (
            <Alert severity="info" sx={{ borderRadius: 3, py: 2 }}>
              No notes here yet — create one with “New note”.
            </Alert>
          )}
        </Box>
      </Stack>
    </Box>
  )
}

export default NotesPage

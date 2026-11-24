import { useEffect, useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import {
  BookOpenIcon,
  ChevronRightIcon,
  FileTextIcon,
  MenuIcon,
  PlusIcon,
} from '../../../components/DocIcons'
import EmptyState from '../../../components/notes/EmptyState'
import NoteListItem from '../../../components/notes/NoteListItem'
import { getErrorMessage } from '../../../config/queryClient'
import type { NotesScope } from '../../../hooks/useNotesScope'
import {
  archiveNote,
  deleteNote,
  listNotes,
  toggleFavoriteNote,
  unarchiveNote,
  type Note,
  type NoteListParams,
  type NoteSummary,
  type Notebook,
} from '../../../services/notesApi'
import { sortNotes, type NoteSort } from '../../../utils/notes'
import NotesToolbar from './NotesToolbar'

interface NotesListPaneProps {
  scope: NotesScope
  scopeLabel: string
  scopePath: string
  selectedNoteId?: number
  notebooks: Notebook[]
  summary?: NoteSummary
  activeTag: string | null
  onClearTag: () => void
  showSidebarToggle: boolean
  onToggleSidebar: () => void
}

function scopeParams(scope: NotesScope): NoteListParams {
  switch (scope.kind) {
    case 'favorites':
      return { view: 'favorite' }
    case 'archive':
      return { view: 'archive' }
    case 'unfiled':
      return { view: 'unfiled' }
    case 'recent':
      return { view: 'all', limit: 5 }
    case 'notebook':
      return { view: 'all', notebook_id: scope.id }
    default:
      return { view: 'all' }
  }
}

function NotebookDirectory({
  notebooks,
  summary,
  showSidebarToggle,
  onToggleSidebar,
}: {
  notebooks: Notebook[]
  summary?: NoteSummary
  showSidebarToggle: boolean
  onToggleSidebar: () => void
}) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <Box
        sx={{
          px: 1.5,
          py: 1.25,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
          {showSidebarToggle ? (
            <Button size="small" onClick={onToggleSidebar} aria-label="Open navigation" sx={{ minWidth: 0, px: 0.5 }}>
              <MenuIcon sx={{ fontSize: 18 }} />
            </Button>
          ) : null}
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.25 }}>
              Notebooks
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {notebooks.length} {notebooks.length === 1 ? 'notebook' : 'notebooks'}
            </Typography>
          </Box>
          <Button
            component={RouterLink}
            to="/admin/notes/new"
            size="small"
            variant="contained"
            startIcon={<PlusIcon sx={{ fontSize: 16 }} />}
            sx={{ borderRadius: 2 }}
          >
            New
          </Button>
        </Stack>
      </Box>
      <Box sx={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        <List disablePadding dense>
          <ListItemButton component={RouterLink} to="/admin/notes/all" sx={{ py: 1.1, borderBottom: '1px solid', borderColor: 'divider' }}>
            <ListItemIcon sx={{ minWidth: 32, color: 'text.disabled' }}>
              <FileTextIcon sx={{ fontSize: 17 }} />
            </ListItemIcon>
            <ListItemText primary="All notes" slotProps={{ primary: { variant: 'body2', sx: { fontWeight: 600 } } }} />
            <Typography variant="caption" color="text.secondary">
              {summary?.all ?? ''}
            </Typography>
            <ChevronRightIcon sx={{ fontSize: 16, color: 'text.disabled', ml: 0.5 }} />
          </ListItemButton>
          {notebooks.map((notebook) => (
            <ListItemButton
              key={notebook.id}
              component={RouterLink}
              to={`/admin/notes/notebooks/${notebook.id}`}
              sx={{ py: 1.1, borderBottom: '1px solid', borderColor: 'divider' }}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    bgcolor: notebook.color || 'text.disabled',
                    opacity: notebook.color ? 1 : 0.5,
                  }}
                />
              </ListItemIcon>
              <ListItemText primary={notebook.name} slotProps={{ primary: { variant: 'body2', sx: { fontWeight: 600 } } }} />
              <Typography variant="caption" color="text.secondary">
                {summary?.notebooks.find((item) => item.id === notebook.id)?.count ?? ''}
              </Typography>
              <ChevronRightIcon sx={{ fontSize: 16, color: 'text.disabled', ml: 0.5 }} />
            </ListItemButton>
          ))}
        </List>
        {notebooks.length === 0 ? (
          <EmptyState
            icon={<BookOpenIcon sx={{ fontSize: 22 }} />}
            title="No notebooks yet"
            description="Create notebooks from the navigation rail, then file notes into them."
            compact
          />
        ) : null}
      </Box>
    </Box>
  )
}

/** Middle pane: scope header, filter, and the compact note list. */
export default function NotesListPane({
  scope,
  scopeLabel,
  scopePath,
  selectedNoteId,
  notebooks,
  summary,
  activeTag,
  onClearTag,
  showSidebarToggle,
  onToggleSidebar,
}: NotesListPaneProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [filterText, setFilterText] = useState('')
  const [filter, setFilter] = useState('')
  const [sort, setSort] = useState<NoteSort>('updated')

  useEffect(() => {
    const timer = window.setTimeout(() => setFilter(filterText), 300)
    return () => window.clearTimeout(timer)
  }, [filterText])

  const scopeKey =
    scope.kind === 'notebook' ? `notebook-${scope.id}` : scope.kind

  const { data: notes, isPending, isError, error, refetch } = useQuery({
    queryKey: ['admin', 'notes', 'list', scopeKey, activeTag ?? '', filter],
    queryFn: () =>
      listNotes({
        ...scopeParams(scope),
        tag: activeTag ?? undefined,
        search: filter || undefined,
      }),
    placeholderData: (previous) => previous,
    enabled: scope.kind !== 'notebooks',
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin', 'notes'] })

  const favoriteMutation = useMutation({
    mutationFn: (note: Note) => toggleFavoriteNote(note.id),
    onSuccess: () => void invalidate(),
  })
  const archiveMutation = useMutation({
    mutationFn: (note: Note) =>
      note.archived_at ? unarchiveNote(note.id) : archiveNote(note.id),
    onSuccess: () => void invalidate(),
  })
  const deleteMutation = useMutation({
    mutationFn: (note: Note) => deleteNote(note.id),
    onSuccess: (_result, note) => {
      void invalidate()
      if (selectedNoteId === note.id) navigate(scopePath)
    },
  })

  if (scope.kind === 'notebooks') {
    return (
      <NotebookDirectory
        notebooks={notebooks}
        summary={summary}
        showSidebarToggle={showSidebarToggle}
        onToggleSidebar={onToggleSidebar}
      />
    )
  }

  const sortedNotes = notes ? sortNotes(notes, sort) : undefined
  const hasFilter = Boolean(activeTag || filter)
  const scopeKeyForLink = scopePath.replace(/^\/admin\/notes\//, '')
  const noteSearch = new URLSearchParams({ scope: scopeKeyForLink })
  if (activeTag) noteSearch.set('tag', activeTag)
  const noteSearchString = noteSearch.toString()

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, bgcolor: 'background.paper' }}>
      <NotesToolbar
        scope={scope}
        scopeLabel={scopeLabel}
        count={sortedNotes?.length}
        showSidebarToggle={showSidebarToggle}
        onToggleSidebar={onToggleSidebar}
        filter={filterText}
        onFilterChange={setFilterText}
        tag={activeTag}
        onClearTag={onClearTag}
        sort={sort}
        onSortChange={setSort}
      />

      <Box sx={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        {isPending ? (
          <Stack spacing={0} sx={{ p: 2 }}>
            {[0, 1, 2, 3, 4].map((row) => (
              <Box key={row} sx={{ py: 1.25, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Skeleton variant="text" width="70%" height={22} />
                <Skeleton variant="text" width="90%" height={18} />
                <Skeleton variant="text" width="35%" height={16} />
              </Box>
            ))}
          </Stack>
        ) : isError ? (
          <Box sx={{ p: 2 }}>
            <Alert
              severity="error"
              action={
                <Button size="small" color="inherit" onClick={() => void refetch()}>
                  Retry
                </Button>
              }
            >
              {getErrorMessage(error)}
            </Alert>
          </Box>
        ) : sortedNotes && sortedNotes.length > 0 ? (
          sortedNotes.map((note) => (
            <NoteListItem
              key={note.id}
              note={note}
              selected={note.id === selectedNoteId}
              scopePath={scopePath}
              search={noteSearchString}
              onToggleFavorite={(target) => favoriteMutation.mutate(target)}
              onArchiveToggle={(target) => archiveMutation.mutate(target)}
              onDelete={(target) => {
                if (window.confirm(`Delete “${target.title.trim() || 'Untitled'}” permanently?`)) {
                  deleteMutation.mutate(target)
                }
              }}
            />
          ))
        ) : (
          <EmptyState
            title={hasFilter ? 'No notes match this filter' : 'No notes here yet'}
            description={
              hasFilter
                ? 'Try a different word or clear the tag filter.'
                : 'Create a note and it will show up in this view.'
            }
            compact
            action={
              hasFilter ? (
                <Button size="small" onClick={() => { setFilterText(''); onClearTag() }}>
                  Clear filters
                </Button>
              ) : (
                <Button
                  size="small"
                  component={RouterLink}
                  to={
                    scope.kind === 'notebook'
                      ? `/admin/notes/new?notebook_id=${scope.id}&scope=notebooks/${scope.id}`
                      : `/admin/notes/new?scope=${scopeKeyForLink}`
                  }
                  startIcon={<PlusIcon />}
                >
                  New note
                </Button>
              )
            }
          />
        )}
      </Box>
    </Box>
  )
}

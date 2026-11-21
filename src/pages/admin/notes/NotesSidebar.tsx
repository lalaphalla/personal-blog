import { useState } from 'react'
import { Link as RouterLink, NavLink, useNavigate, useSearchParams } from 'react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import {
  ArchiveIcon,
  BookOpenIcon,
  ClockIcon,
  EditIcon,
  FileTextIcon,
  InboxIcon,
  MoreHorizontalIcon,
  PlusIcon,
  StarIcon,
  TagIcon,
  TrashIcon,
} from '../../../components/DocIcons'
import { getErrorMessage } from '../../../config/queryClient'
import {
  createNotebook,
  deleteNotebook,
  updateNotebook,
  type NoteSummary,
  type Notebook,
} from '../../../services/notesApi'
import type { NotesScope } from '../../../hooks/useNotesScope'

interface NotesSidebarProps {
  scope: NotesScope
  summary?: NoteSummary
  notebooks: Notebook[]
  activeTag: string | null
  onNavigate?: () => void
}

const QUICK_LINKS = [
  { key: 'all', label: 'All notes', to: '/admin/notes/all', icon: <FileTextIcon /> },
  { key: 'favorites', label: 'Favorites', to: '/admin/notes/favorites', icon: <StarIcon /> },
  { key: 'recent', label: 'Recently edited', to: '/admin/notes/recent', icon: <ClockIcon /> },
  { key: 'archive', label: 'Archive', to: '/admin/notes/archive', icon: <ArchiveIcon /> },
  { key: 'unfiled', label: 'Unfiled', to: '/admin/notes/unfiled', icon: <InboxIcon /> },
] as const

function countFor(key: (typeof QUICK_LINKS)[number]['key'], summary?: NoteSummary): number | undefined {
  if (!summary) return undefined
  if (key === 'all') return summary.all
  if (key === 'favorites') return summary.favorites
  if (key === 'archive') return summary.archive
  if (key === 'unfiled') return summary.unfiled
  return undefined
}

/** Navigation rail: quick access counts, notebooks, and tags. */
export default function NotesSidebar({
  scope,
  summary,
  notebooks,
  activeTag,
  onNavigate,
}: NotesSidebarProps) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [, setSearchParams] = useSearchParams()
  const [tagExpanded, setTagExpanded] = useState(false)
  const [notebookMenu, setNotebookMenu] = useState<{ anchor: HTMLElement; notebook: Notebook } | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Notebook | null>(null)
  const [name, setName] = useState('')
  const [dialogError, setDialogError] = useState<string | null>(null)

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin', 'notebooks'] })
    void queryClient.invalidateQueries({ queryKey: ['admin', 'notes', 'summary'] })
    void queryClient.invalidateQueries({ queryKey: ['admin', 'notes'] })
  }

  const saveNotebook = useMutation({
    mutationFn: () =>
      editing
        ? updateNotebook(editing.id, { name: name.trim() })
        : createNotebook({ name: name.trim() }),
    onSuccess: () => {
      invalidate()
      setDialogOpen(false)
      setEditing(null)
      setName('')
      setDialogError(null)
    },
    onError: (error) => setDialogError(getErrorMessage(error)),
  })

  const removeNotebook = useMutation({
    mutationFn: (id: number) => deleteNotebook(id),
    onSuccess: (_result, id) => {
      invalidate()
      if (scope.kind === 'notebook' && scope.id === id) navigate('/admin/notes/all')
    },
  })

  const openCreate = () => {
    setEditing(null)
    setName('')
    setDialogError(null)
    setDialogOpen(true)
  }

  const openRename = (notebook: Notebook) => {
    setEditing(notebook)
    setName(notebook.name)
    setDialogError(null)
    setDialogOpen(true)
    setNotebookMenu(null)
  }

  const toggleTag = (tag: string) => {
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous)
        if (next.get('tag') === tag) next.delete('tag')
        else next.set('tag', tag)
        return next
      },
      { replace: true },
    )
    onNavigate?.()
  }

  const tagCounts = summary?.tags ?? []
  const visibleTags = tagExpanded ? tagCounts : tagCounts.slice(0, 8)

  return (
    <Box
      component="nav"
      aria-label="Notes navigation"
      sx={{
        height: '100%',
        overflowY: 'auto',
        bgcolor: 'grey.50',
        display: 'flex',
        flexDirection: 'column',
        py: 1,
      }}
    >
      <Box sx={{ px: 1.25, pb: 0.5 }}>
        <Typography
          variant="overline"
          color="text.secondary"
          sx={{ px: 1, letterSpacing: 1.1, fontWeight: 700 }}
        >
          Workspace
        </Typography>
        <List disablePadding dense>
          {QUICK_LINKS.map((item) => {
            const selected = scope.kind === item.key
            const count = countFor(item.key, summary)
            return (
              <ListItemButton
                key={item.key}
                component={NavLink}
                to={item.to}
                selected={selected}
                onClick={() => onNavigate?.()}
                sx={{
                  borderRadius: 2,
                  gap: 0.5,
                  py: 0.6,
                  color: selected ? 'primary.dark' : 'text.primary',
                  '&.Mui-selected': {
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                    '&:hover': { bgcolor: (theme) => alpha(theme.palette.primary.main, 0.14) },
                  },
                }}
              >
                <ListItemIcon
                  sx={{ minWidth: 30, color: selected ? 'primary.main' : 'text.disabled' }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  slotProps={{ primary: { variant: 'body2', sx: { fontWeight: selected ? 600 : 500 } } }}
                />
                {count !== undefined ? (
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}
                  >
                    {count}
                  </Typography>
                ) : null}
              </ListItemButton>
            )
          })}
        </List>
      </Box>

      <Divider sx={{ my: 1 }} />

      <Box sx={{ px: 1.25, pb: 0.5 }}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', pr: 0.5 }}>
          <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', px: 1, color: 'text.secondary' }}>
            <BookOpenIcon sx={{ fontSize: 15 }} />
            <Typography variant="overline" sx={{ letterSpacing: 1.1, fontWeight: 700, lineHeight: 1.6 }}>
              Notebooks
            </Typography>
          </Stack>
          <Tooltip title="New notebook">
            <IconButton size="small" aria-label="New notebook" onClick={openCreate}>
              <PlusIcon sx={{ fontSize: 17 }} />
            </IconButton>
          </Tooltip>
        </Stack>
        <List disablePadding dense>
          {notebooks.map((notebook) => {
            const selected = scope.kind === 'notebook' && scope.id === notebook.id
            const count = summary?.notebooks.find((item) => item.id === notebook.id)?.count
            return (
              <Box
                key={notebook.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: 2,
                  bgcolor: selected ? (theme) => alpha(theme.palette.primary.main, 0.1) : 'transparent',
                  '&:hover': {
                    bgcolor: (theme) =>
                      selected
                        ? alpha(theme.palette.primary.main, 0.14)
                        : alpha(theme.palette.action.hover, 0.6),
                  },
                }}
              >
                <Box
                  component={NavLink}
                  to={`/admin/notes/notebooks/${notebook.id}`}
                  onClick={() => onNavigate?.()}
                  aria-current={selected ? 'page' : undefined}
                  sx={{
                    flex: 1,
                    minWidth: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.75,
                    py: 0.55,
                    pl: 1,
                    pr: 0.5,
                    color: selected ? 'primary.dark' : 'text.primary',
                    textDecoration: 'none',
                    borderRadius: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: notebook.color || (selected ? 'primary.main' : 'text.disabled'),
                      opacity: notebook.color || selected ? 1 : 0.5,
                      flexShrink: 0,
                    }}
                  />
                  <Typography
                    variant="body2"
                    noWrap
                    sx={{ flex: 1, minWidth: 0, fontWeight: selected ? 600 : 500 }}
                  >
                    {notebook.name}
                  </Typography>
                  {count !== undefined ? (
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}
                    >
                      {count}
                    </Typography>
                  ) : null}
                </Box>
                <IconButton
                  size="small"
                  aria-label={`Actions for ${notebook.name}`}
                  onClick={(event) =>
                    setNotebookMenu({ anchor: event.currentTarget, notebook })
                  }
                  sx={{ mr: 0.25, color: 'text.disabled' }}
                >
                  <MoreHorizontalIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>
            )
          })}
          {notebooks.length === 0 ? (
            <Typography variant="caption" color="text.secondary" sx={{ px: 1, py: 0.5 }}>
              No notebooks yet
            </Typography>
          ) : null}
        </List>
      </Box>

      <Divider sx={{ my: 1 }} />

      <Box sx={{ px: 1.25, pb: 1 }}>
        <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', px: 1, mb: 0.5, color: 'text.secondary' }}>
          <TagIcon sx={{ fontSize: 15 }} />
          <Typography variant="overline" sx={{ letterSpacing: 1.1, fontWeight: 700, lineHeight: 1.6 }}>
            Tags
          </Typography>
        </Stack>
        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.5, px: 0.5 }}>
          {visibleTags.map((item) => {
            const active = activeTag === item.tag
            return (
              <Button
                key={item.tag}
                size="small"
                onClick={() => toggleTag(item.tag)}
                sx={{
                  borderRadius: 1.5,
                  px: 0.9,
                  py: 0.1,
                  minWidth: 0,
                  fontSize: '0.75rem',
                  color: active ? 'primary.dark' : 'text.secondary',
                  bgcolor: active ? (theme) => alpha(theme.palette.primary.main, 0.12) : 'action.hover',
                  '&:hover': {
                    bgcolor: (theme) => alpha(theme.palette.primary.main, active ? 0.18 : 0.08),
                  },
                }}
              >
                #{item.tag}
                <Box component="span" sx={{ ml: 0.5, opacity: 0.6, fontVariantNumeric: 'tabular-nums' }}>
                  {item.count}
                </Box>
              </Button>
            )
          })}
          {tagCounts.length === 0 ? (
            <Typography variant="caption" color="text.secondary" sx={{ px: 0.5 }}>
              Tags appear here as you add them
            </Typography>
          ) : null}
        </Stack>
        {tagCounts.length > 8 ? (
          <Button size="small" onClick={() => setTagExpanded((value) => !value)} sx={{ mt: 0.5, ml: 0.25, fontSize: '0.75rem' }}>
            {tagExpanded ? 'Show less' : `Show all (${tagCounts.length})`}
          </Button>
        ) : null}
      </Box>

      <Box sx={{ flex: 1 }} />

      <Box sx={{ p: 1.25 }}>
        <Button
          fullWidth
          variant="outlined"
          size="small"
          component={RouterLink}
          to="/admin/notes/new"
          startIcon={<PlusIcon />}
          onClick={() => onNavigate?.()}
          sx={{ borderRadius: 2, justifyContent: 'flex-start' }}
        >
          New note
        </Button>
      </Box>

      <Menu
        anchorEl={notebookMenu?.anchor ?? null}
        open={Boolean(notebookMenu)}
        onClose={() => setNotebookMenu(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={() => notebookMenu && openRename(notebookMenu.notebook)}>
          <EditIcon sx={{ fontSize: 17, mr: 1.25 }} />
          Rename
        </MenuItem>
        <MenuItem
          onClick={() => {
            const target = notebookMenu?.notebook
            setNotebookMenu(null)
            if (target && window.confirm(`Delete notebook “${target.name}”? Its notes are kept.`)) {
              removeNotebook.mutate(target.id)
            }
          }}
          sx={{ color: 'error.main' }}
        >
          <TrashIcon sx={{ fontSize: 17, mr: 1.25 }} />
          Delete
        </MenuItem>
      </Menu>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>{editing ? 'Rename notebook' : 'New notebook'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            margin="dense"
            label="Name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && name.trim()) saveNotebook.mutate()
            }}
            error={Boolean(dialogError)}
            helperText={dialogError ?? undefined}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={!name.trim() || saveNotebook.isPending}
            onClick={() => saveNotebook.mutate()}
          >
            {editing ? 'Save' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

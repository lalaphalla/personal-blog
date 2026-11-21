import { memo, useState, type MouseEvent } from 'react'
import { Link as RouterLink } from 'react-router'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import {
  ArchiveIcon,
  MoreHorizontalIcon,
  StarFilledIcon,
  StarIcon,
  TrashIcon,
} from '../DocIcons'
import type { Note } from '../../services/notesApi'
import { noteRelativeTime, noteSnippet, noteTitle } from '../../utils/notes'

interface NoteListItemProps {
  note: Note
  selected: boolean
  scopePath: string
  /** Query string for the note link (keeps scope/tag when opening a note). */
  search: string
  onToggleFavorite: (note: Note) => void
  onArchiveToggle: (note: Note) => void
  onDelete: (note: Note) => void
}

function NoteListItem({
  note,
  selected,
  scopePath,
  search,
  onToggleFavorite,
  onArchiveToggle,
  onDelete,
}: NoteListItemProps) {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null)

  const openMenu = (event: MouseEvent<HTMLElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setMenuAnchor(event.currentTarget)
  }

  const closeMenu = () => setMenuAnchor(null)

  return (
    <Box
      sx={{
        position: 'relative',
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: selected ? (theme) => alpha(theme.palette.primary.main, 0.08) : 'transparent',
        boxShadow: selected ? (theme) => `inset 3px 0 0 ${theme.palette.primary.main}` : 'none',
        transition: 'background-color 120ms ease',
        '&:hover': {
          bgcolor: (theme) =>
            selected ? alpha(theme.palette.primary.main, 0.12) : alpha(theme.palette.action.hover, 0.5),
        },
      }}
    >
      <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5, pr: 0.5 }}>
        <Box
          component={RouterLink}
          to={`/admin/notes/${note.id}${search ? `?${search}` : ''}`}
          state={{ scopePath }}
          aria-current={selected ? 'page' : undefined}
          sx={{
            flex: 1,
            minWidth: 0,
            py: 1.25,
            pl: 2,
            pr: 0.5,
            color: 'inherit',
            textDecoration: 'none',
            outlineOffset: -2,
          }}
        >
          <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
            <Typography
              variant="subtitle2"
              noWrap
              sx={{
                fontWeight: selected ? 700 : 600,
                color: selected ? 'primary.dark' : 'text.primary',
                minWidth: 0,
              }}
            >
              {noteTitle(note)}
            </Typography>
            {note.archived_at ? (
              <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                · Archived
              </Typography>
            ) : null}
          </Stack>
          <Typography
            variant="body2"
            color="text.secondary"
            noWrap
            sx={{ mt: 0.25, fontSize: '0.8125rem' }}
          >
            {noteSnippet(note.content) || 'Empty note'}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 0.5, alignItems: 'center', minWidth: 0 }}>
            <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
              {noteRelativeTime(note.updated_at)}
            </Typography>
            {note.tags.slice(0, 2).map((tag) => (
              <Typography
                key={tag}
                variant="caption"
                color="text.secondary"
                noWrap
                sx={{ opacity: 0.8 }}
              >
                #{tag}
              </Typography>
            ))}
          </Stack>
        </Box>

        <IconButton
          size="small"
          aria-label={note.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
          onClick={() => onToggleFavorite(note)}
          sx={{ color: note.is_favorite ? 'warning.main' : 'text.disabled' }}
        >
          {note.is_favorite ? (
            <StarFilledIcon sx={{ fontSize: 16 }} />
          ) : (
            <StarIcon sx={{ fontSize: 16 }} />
          )}
        </IconButton>
        <IconButton size="small" aria-label="Note actions" onClick={openMenu}>
          <MoreHorizontalIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Stack>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={closeMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem
          onClick={() => {
            closeMenu()
            onArchiveToggle(note)
          }}
        >
          <ArchiveIcon sx={{ fontSize: 17, mr: 1.25 }} />
          {note.archived_at ? 'Unarchive' : 'Archive'}
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            closeMenu()
            onDelete(note)
          }}
          sx={{ color: 'error.main' }}
        >
          <TrashIcon sx={{ fontSize: 17, mr: 1.25 }} />
          Delete
        </MenuItem>
      </Menu>
    </Box>
  )
}

export default memo(NoteListItem)

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { Link as RouterLink } from 'react-router'
import { PanelLeftIcon, PlusIcon, SearchIcon } from '../../../components/DocIcons'
import type { NoteSort } from '../../../utils/notes'

interface NotesToolbarProps {
  scopeLabel: string
  count?: number
  showSidebarToggle: boolean
  onToggleSidebar: () => void
  filter: string
  onFilterChange: (value: string) => void
  tag: string | null
  onClearTag: () => void
  sort: NoteSort
  onSortChange: (sort: NoteSort) => void
}

/** Header strip for the notes list pane: scope, filter, sort, and create. */
export default function NotesToolbar({
  scopeLabel,
  count,
  showSidebarToggle,
  onToggleSidebar,
  filter,
  onFilterChange,
  tag,
  onClearTag,
  sort,
  onSortChange,
}: NotesToolbarProps) {
  return (
    <Box
      sx={{
        px: 1.5,
        py: 1.25,
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mb: 1 }}>
        {showSidebarToggle ? (
          <Tooltip title="Toggle navigation">
            <IconButton size="small" aria-label="Toggle navigation" onClick={onToggleSidebar}>
              <PanelLeftIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        ) : null}
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.25 }} noWrap>
            {scopeLabel}
          </Typography>
          {count !== undefined ? (
            <Typography variant="caption" color="text.secondary">
              {count} {count === 1 ? 'note' : 'notes'}
            </Typography>
          ) : null}
        </Box>
        <Button
          component={RouterLink}
          to="/admin/notes/new"
          size="small"
          variant="contained"
          startIcon={<PlusIcon sx={{ fontSize: 16 }} />}
          sx={{ borderRadius: 2, flexShrink: 0, px: 1.25 }}
        >
          New
        </Button>
      </Stack>

      <TextField
        size="small"
        fullWidth
        placeholder="Filter in this view…"
        value={filter}
        onChange={(event) => onFilterChange(event.target.value)}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 16 }} />
              </InputAdornment>
            ),
          },
        }}
      />

      <Stack
        direction="row"
        spacing={1}
        sx={{ mt: 0.75, alignItems: 'center', justifyContent: 'space-between', minHeight: 24 }}
      >
        <Box sx={{ minWidth: 0 }}>
          {tag ? (
            <Chip
              size="small"
              color="primary"
              label={`#${tag}`}
              onDelete={onClearTag}
              sx={{ height: 22, fontSize: '0.7rem' }}
            />
          ) : null}
        </Box>
        <TextField
          select
          size="small"
          variant="standard"
          value={sort}
          onChange={(event) => onSortChange(event.target.value as NoteSort)}
          slotProps={{ input: { disableUnderline: true, sx: { fontSize: '0.75rem' } } }}
          sx={{ width: 104, flexShrink: 0 }}
          aria-label="Sort notes"
        >
          <MenuItem value="updated" sx={{ fontSize: '0.8rem' }}>
            Updated
          </MenuItem>
          <MenuItem value="created" sx={{ fontSize: '0.8rem' }}>
            Created
          </MenuItem>
          <MenuItem value="title" sx={{ fontSize: '0.8rem' }}>
            Title
          </MenuItem>
        </TextField>
      </Stack>
    </Box>
  )
}

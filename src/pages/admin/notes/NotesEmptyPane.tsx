import { Link as RouterLink } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { FileTextIcon, PlusIcon } from '../../../components/DocIcons'
import EmptyState from '../../../components/notes/EmptyState'
import { listNotes, type Note } from '../../../services/notesApi'
import { noteRelativeTime, noteTitle } from '../../../utils/notes'

/** Placeholder in the note pane when no note is selected. */
export default function NotesEmptyPane() {
  const { data: recent } = useQuery({
    queryKey: ['admin', 'notes', 'list', 'pane-recent'],
    queryFn: () => listNotes({ view: 'all', limit: 5 }),
  })

  return (
    <Box
      sx={{
        height: '100%',
        overflowY: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
        bgcolor: 'grey.50',
      }}
    >
      <Stack sx={{ alignItems: 'center', width: '100%', maxWidth: 380 }}>
        <EmptyState
          icon={<FileTextIcon sx={{ fontSize: 24 }} />}
          title="Select a note"
          description="Choose a note from the list to read it here, or start a new one."
          action={
            <Button
              component={RouterLink}
              to="/admin/notes/new"
              variant="outlined"
              size="small"
              startIcon={<PlusIcon />}
            >
              New note
            </Button>
          }
        />
        {recent && recent.length > 0 ? (
          <Box sx={{ width: '100%', mt: 1 }}>
            <Typography
              variant="overline"
              color="text.secondary"
              sx={{ px: 1.5, fontWeight: 700, letterSpacing: 1.1 }}
            >
              Recently edited
            </Typography>
            <List disablePadding dense>
              {recent.map((note: Note) => (
                <ListItemButton
                  key={note.id}
                  component={RouterLink}
                  to={`/admin/notes/${note.id}`}
                  sx={{ borderRadius: 2 }}
                >
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
                      {noteTitle(note)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {noteRelativeTime(note.updated_at)}
                    </Typography>
                  </Box>
                </ListItemButton>
              ))}
            </List>
          </Box>
        ) : null}
      </Stack>
    </Box>
  )
}

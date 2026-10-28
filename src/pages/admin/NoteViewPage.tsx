import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link as RouterLink, useParams } from 'react-router'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { markdownSx } from '../../components/markdownSx'
import { getErrorMessage } from '../../config/queryClient'
import { getNote, toggleFavoriteNote, type Note } from '../../services/notesApi'

function NoteViewPage() {
  const { id } = useParams()
  const noteId = id ? Number(id) : undefined
  const queryClient = useQueryClient()

  const { data: note, isPending, isError, error } = useQuery({
    queryKey: ['admin', 'notes', noteId],
    queryFn: () => getNote(noteId!),
    enabled: Boolean(noteId),
  })

  const favoriteMutation = useMutation({
    mutationFn: () => toggleFavoriteNote(noteId!),
    onSuccess: (updated: Note) => {
      queryClient.setQueryData(['admin', 'notes', noteId], updated)
      queryClient.invalidateQueries({ queryKey: ['admin', 'notes', 'list'] })
    },
  })

  if (!noteId || isPending) {
    return (
      <Stack sx={{ alignItems: 'center', py: 8 }}>
        <CircularProgress />
      </Stack>
    )
  }

  if (isError || !note) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Button component={RouterLink} to="/admin/notes" size="small">
          ← All notes
        </Button>
        <Alert severity="error" sx={{ mt: 2 }}>
          {getErrorMessage(error)}
        </Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth="md" sx={{ px: 0 }}>
      <Stack
        direction="row"
        sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}
      >
        <Button component={RouterLink} to="/admin/notes" size="small">
          ← All notes
        </Button>
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            onClick={() => favoriteMutation.mutate()}
            title={note.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            {note.is_favorite ? '★ Favorited' : '☆ Favorite'}
          </Button>
          <Button variant="contained" component={RouterLink} to={`/admin/notes/${note.id}/edit`}>
            Edit
          </Button>
        </Stack>
      </Stack>

      <Stack direction="row" spacing={1} sx={{ mb: 1, alignItems: 'center' }}>
        <Typography variant="h3" component="h1">
          {note.title.trim() || 'Untitled'}
        </Typography>
        {note.is_favorite ? <Chip size="small" label="★" /> : null}
        {note.archived_at ? <Chip size="small" label="Archived" /> : null}
      </Stack>
      {note.tags.length > 0 ? (
        <Stack direction="row" spacing={0.5} sx={{ mb: 1, flexWrap: 'wrap', rowGap: 0.5 }}>
          {note.tags.map((tag) => (
            <Chip key={tag} size="small" variant="outlined" label={tag} />
          ))}
        </Stack>
      ) : null}
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3 }}>
        {new Date(note.updated_at).toLocaleString()}
      </Typography>

      <Box component="article" sx={markdownSx}>
        {note.content.trim() ? (
          <Markdown remarkPlugins={[remarkGfm]}>{note.content}</Markdown>
        ) : (
          <Typography color="text.secondary">This note is empty — click Edit to write something.</Typography>
        )}
      </Box>
    </Container>
  )
}

export default NoteViewPage

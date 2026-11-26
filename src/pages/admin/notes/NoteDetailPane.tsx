import { useEffect, useRef, useState } from 'react'
import { Link as RouterLink, useLocation, useNavigate, useSearchParams } from 'react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Snackbar from '@mui/material/Snackbar'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import {
  ArchiveIcon,
  ArrowLeftIcon,
  BookOpenIcon,
  CloseIcon,
  CopyIcon,
  EditIcon,
  FileTextIcon,
  StarFilledIcon,
  StarIcon,
} from '../../../components/DocIcons'
import { NoteDocument, NoteInspector } from '../../../components/notes/NoteDocument'
import EmptyState from '../../../components/notes/EmptyState'
import { getErrorMessage } from '../../../config/queryClient'
import {
  archiveNote,
  getNote,
  listNotebooks,
  toggleFavoriteNote,
  unarchiveNote,
  type Note,
} from '../../../services/notesApi'
import { noteTitle } from '../../../utils/notes'

interface NoteDetailPaneProps {
  noteId: number
  scopePath: string
  /** Show a back button when the list pane is not visible. */
  showBack?: boolean
}

/** Right pane: reading view with its own action strip and inspector drawer. */
export default function NoteDetailPane({ noteId, scopePath, showBack = false }: NoteDetailPaneProps) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [snack, setSnack] = useState<string | null>(null)
  const [inspectorOpen, setInspectorOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const state = location.state as { scopePath?: string } | null
  const tagParam = new URLSearchParams(location.search).get('tag')
  const backTo = `${state?.scopePath ?? scopePath}${tagParam ? `?tag=${encodeURIComponent(tagParam)}` : ''}`

  const { data: note, isPending, isError, error } = useQuery({
    queryKey: ['admin', 'notes', noteId],
    queryFn: () => getNote(noteId),
  })

  const { data: notebooks } = useQuery({
    queryKey: ['admin', 'notebooks'],
    queryFn: listNotebooks,
  })

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 })
  }, [noteId])

  const syncNote = (updated: Note) => {
    queryClient.setQueryData(['admin', 'notes', noteId], updated)
    void queryClient.invalidateQueries({ queryKey: ['admin', 'notes', 'list'] })
    void queryClient.invalidateQueries({ queryKey: ['admin', 'notes', 'summary'] })
  }

  const favoriteMutation = useMutation({
    mutationFn: () => toggleFavoriteNote(noteId),
    onSuccess: syncNote,
  })

  const archiveMutation = useMutation({
    mutationFn: () => (note?.archived_at ? unarchiveNote(noteId) : archiveNote(noteId)),
    onSuccess: (updated) => {
      syncNote(updated)
      if (updated.archived_at) setSnack('Note archived')
      else setSnack('Note restored')
    },
  })

  const handleSelectTag = (tag: string) => {
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous)
        next.set('tag', tag)
        return next
      },
      { replace: true },
    )
    setInspectorOpen(false)
  }

  const copyMarkdown = async () => {
    if (!note) return
    try {
      await navigator.clipboard.writeText(note.content)
      setSnack('Markdown copied to clipboard')
    } catch {
      setSnack('Could not copy markdown')
    }
  }

  if (isPending) {
    return (
      <Stack sx={{ alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <CircularProgress />
      </Stack>
    )
  }

  if (isError || !note) {
    return (
      <Box sx={{ p: 3 }}>
        <EmptyState
          icon={<FileTextIcon sx={{ fontSize: 22 }} />}
          title="Note unavailable"
          description={getErrorMessage(error)}
          action={
            <Button component={RouterLink} to={backTo} size="small" startIcon={<ArrowLeftIcon />}>
              Back to notes
            </Button>
          }
        />
      </Box>
    )
  }

  const notebookName = notebooks?.find((item) => item.id === note.notebook_id)?.name
  const activeTag = searchParams.get('tag')

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        bgcolor: 'background.default',
      }}
    >
      <Stack
        direction="row"
        sx={{
          alignItems: 'center',
          gap: 0.75,
          px: 2,
          py: 1,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          flexWrap: 'wrap',
          rowGap: 0.5,
        }}
      >
        {showBack ? (
          <Tooltip title="Back to list">
            <IconButton
              size="small"
              component={RouterLink}
              to={backTo}
              aria-label="Back to notes list"
              sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
            >
              <ArrowLeftIcon />
            </IconButton>
          </Tooltip>
        ) : null}
        <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', minWidth: 0, flex: 1 }}>
          <BookOpenIcon sx={{ fontSize: 17, color: 'text.disabled', flexShrink: 0 }} />
          <Typography variant="body2" color="text.secondary" noWrap>
            {notebookName ?? 'Unfiled'}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.4 }}>
            /
          </Typography>
          <Typography
            variant="body2"
            noWrap
            sx={{ color: 'text.primary', fontWeight: 600, maxWidth: { xs: 140, sm: 260, lg: 340 } }}
          >
            {noteTitle(note)}
          </Typography>
          {activeTag ? (
            <Typography variant="caption" color="primary.main" noWrap sx={{ flexShrink: 0 }}>
              #{activeTag}
            </Typography>
          ) : null}
        </Stack>
        <Tooltip title={note.is_favorite ? 'Remove from favorites' : 'Add to favorites'}>
          <IconButton
            size="small"
            onClick={() => favoriteMutation.mutate()}
            disabled={favoriteMutation.isPending}
            aria-label="Toggle favorite"
            sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
          >
            {note.is_favorite ? (
              <StarFilledIcon sx={{ color: 'warning.main' }} />
            ) : (
              <StarIcon />
            )}
          </IconButton>
        </Tooltip>
        <Tooltip title={note.archived_at ? 'Unarchive note' : 'Archive note'}>
          <IconButton
            size="small"
            onClick={() => archiveMutation.mutate()}
            disabled={archiveMutation.isPending}
            aria-label="Toggle archive"
            sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
          >
            <ArchiveIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Copy markdown">
          <IconButton
            size="small"
            onClick={() => void copyMarkdown()}
            aria-label="Copy markdown"
            sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
          >
            <CopyIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Properties and contents">
          <IconButton
            size="small"
            onClick={() => setInspectorOpen(true)}
            aria-label="Open note inspector"
            sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
          >
            <FileTextIcon />
          </IconButton>
        </Tooltip>
        <Button
          variant="contained"
          size="small"
          component={RouterLink}
          to={`/admin/notes/${note.id}/edit${location.search}`}
          startIcon={<EditIcon />}
          sx={{ borderRadius: 2, ml: 0.25 }}
        >
          Edit
        </Button>
      </Stack>

      <Box
        ref={scrollRef}
        sx={{ flex: 1, overflowY: 'auto', minHeight: 0, px: { xs: 1.5, md: 3 }, py: { xs: 1.5, md: 3 } }}
      >
        <NoteDocument
          note={note}
          notebookName={notebookName}
          compact
          onEdit={() => navigate(`/admin/notes/${note.id}/edit`)}
          onSelectTag={handleSelectTag}
        />
      </Box>

      <Drawer
        anchor="right"
        open={inspectorOpen}
        onClose={() => setInspectorOpen(false)}
        slotProps={{ paper: { sx: { width: 340, maxWidth: '90vw' } } }}
      >
        <Stack
          direction="row"
          sx={{
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            py: 1.25,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Inspector
          </Typography>
          <IconButton size="small" aria-label="Close inspector" onClick={() => setInspectorOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Stack>
        <Box sx={{ p: 2, overflowY: 'auto' }}>
          <NoteInspector note={note} notebookName={notebookName} onSelectTag={handleSelectTag} />
        </Box>
      </Drawer>

      <Snackbar
        open={Boolean(snack)}
        autoHideDuration={2200}
        onClose={() => setSnack(null)}
        message={snack ?? ''}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  )
}

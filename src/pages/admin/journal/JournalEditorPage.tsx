import { useNavigate, useParams, useSearchParams } from 'react-router'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import { ArrowLeftIcon } from '../../../components/DocIcons'
import JournalEditorForm from '../../../components/journal/JournalEditorForm'
import EmptyState from '../../../components/notes/EmptyState'
import {
  useJournalEntry,
  useJournalMutations,
  useJournalPrompts,
} from '../../../hooks/useJournalQueries'
import type { JournalAttachmentInput, JournalEntryInput } from '../../../services/journalApi'
import { getLocalTodayDateString } from '../../../utils/journal'

export default function JournalEditorPage() {
  const { id } = useParams<{ id?: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const entryId = id ? parseInt(id, 10) : null
  const isEditing = typeof entryId === 'number' && !isNaN(entryId)

  const dateParam = searchParams.get('date') || getLocalTodayDateString()
  const promptIdParam = searchParams.get('prompt_id') ? parseInt(searchParams.get('prompt_id')!, 10) : null

  const { data: entry, isPending, isError } = useJournalEntry(entryId)
  const { data: prompts } = useJournalPrompts()
  const {
    createEntry,
    updateEntry,
    deleteEntry,
    toggleFavorite,
    addAttachment,
    deleteAttachment,
  } = useJournalMutations()

  const selectedPrompt = promptIdParam && prompts
    ? prompts.find((p) => p.id === promptIdParam) ?? null
    : null

  if (isEditing && isPending) {
    return (
      <Stack sx={{ py: 12, alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Stack>
    )
  }

  if (isEditing && (isError || !entry)) {
    return (
      <EmptyState
        title="Journal entry not found"
        description="The entry may have been deleted or moved."
        action={
          <Button variant="outlined" onClick={() => navigate('/admin/journal')}>
            Back to Today
          </Button>
        }
      />
    )
  }

  const handleSave = async (data: JournalEntryInput) => {
    if (isEditing && entryId) {
      const updated = await updateEntry.mutateAsync({ id: entryId, data })
      return updated
    } else {
      const created = await createEntry.mutateAsync(data)
      navigate(`/admin/journal/${created.id}/edit`, { replace: true })
      return created
    }
  }

  const handleDelete = async (entryIdToDelete: number) => {
    if (window.confirm('Move this entry to Recently Deleted?')) {
      await deleteEntry.mutateAsync(entryIdToDelete)
      navigate('/admin/journal')
    }
  }

  const handleAddAttachment = async (targetEntryId: number, data: JournalAttachmentInput) => {
    await addAttachment.mutateAsync({ entryId: targetEntryId, data })
  }

  const handleDeleteAttachment = async (attachmentId: number) => {
    await deleteAttachment.mutateAsync(attachmentId)
  }

  return (
    <Stack spacing={2.5} sx={{ width: '100%' }}>
      <Box>
        <Button
          size="small"
          startIcon={<ArrowLeftIcon />}
          onClick={() => navigate(-1)}
          sx={{ textTransform: 'none', color: 'text.secondary', px: 0 }}
        >
          Back
        </Button>
      </Box>

      <JournalEditorForm
        initialData={entry}
        defaultDate={dateParam}
        defaultPrompt={selectedPrompt}
        onSave={handleSave}
        onDelete={handleDelete}
        onToggleFavorite={async (entryFavoriteId) => {
          await toggleFavorite.mutateAsync(entryFavoriteId)
        }}
        onAddAttachment={handleAddAttachment}
        onDeleteAttachment={handleDeleteAttachment}
      />
    </Stack>
  )
}

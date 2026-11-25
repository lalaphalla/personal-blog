import { useEffect, useRef, useState } from 'react'
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
import type { JournalAttachmentInput, JournalEntry, JournalEntryInput } from '../../../services/journalApi'
import { getLocalTodayDateString } from '../../../utils/journal'

export default function JournalEditorPage() {
  const { id } = useParams<{ id?: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const entryIdRaw = id ? parseInt(id, 10) : NaN
  const entryId = Number.isNaN(entryIdRaw) ? null : entryIdRaw // NaN would break identity checks
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

  // The form must survive the create transition (undefined id → created id): a
  // remount there would reset the editor and drop keystrokes typed during the POST.
  // `key` tracks what the form is *showing*, adjusted during render via the
  // documented previous-props pattern; `createdId` records the id we just created
  // so that transition adopts the same instance instead of remounting — and is
  // forgotten the moment the session changes.
  const createInFlightRef = useRef<Promise<JournalEntry> | null>(null)
  const [form, setForm] = useState(() => ({
    shown: entryId as number | null,
    key: entryId != null ? `entry-${entryId}` : 'draft-0',
    seq: 0,
    createdId: null as number | null,
  }))
  if (form.shown !== entryId) {
    if (form.shown === null && entryId != null && form.createdId === entryId) {
      setForm((f) => ({ ...f, shown: entryId })) // the id we just created — same instance
    } else {
      setForm((f) => ({
        shown: entryId,
        key: entryId != null ? `entry-${entryId}` : `draft-${f.seq + 1}`,
        seq: f.seq + 1,
        createdId: null, // a new session forgets the previous create
      }))
    }
  }
  // The in-flight create guard only applies within one draft session.
  useEffect(() => {
    createInFlightRef.current = null
  }, [form.shown])

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
    if (form.createdId != null) {
      // Post-create saves (including one racing the create POST) go to the new entry.
      return updateEntry.mutateAsync({ id: form.createdId, data })
    }
    if (isEditing && entryId) {
      return updateEntry.mutateAsync({ id: entryId, data })
    }
    if (createInFlightRef.current) {
      // A create is already running (a manual Save racing the autosave): wait for
      // it, then persist the newest fields as an update instead of creating twice.
      const existing = await createInFlightRef.current
      return updateEntry.mutateAsync({ id: existing.id, data })
    }
    const pending = createEntry.mutateAsync(data)
    createInFlightRef.current = pending
    try {
      const created = await pending
      // Claim + redirect only while still on the new-entry screen. This reads
      // `window.location` (always fresh) instead of `form` from the closure —
      // the closure can be stale if the create POST lands after the user opened
      // another entry, which must keep its own saves.
      if (window.location.pathname === '/admin/journal/new') {
        setForm((f) => ({ ...f, createdId: created.id }))
        navigate(`/admin/journal/${created.id}/edit`, { replace: true })
      }
      return created
    } catch (error) {
      // Failed → allow the next save to retry the create.
      createInFlightRef.current = null
      throw error
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
        key={form.key}
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

import { useState } from 'react'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router'
import NoteEditorForm from '../../../components/notes/NoteEditorForm'
import { useNotesScope } from '../../../hooks/useNotesScope'

/** Right pane: in-place editor with autosave. */
export default function NoteEditorPane() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { scope, scopePath } = useNotesScope()
  const [searchParams] = useSearchParams()

  const noteId = id && /^\d+$/.test(id) ? Number(id) : undefined

  const notebookIdParam = searchParams.get('notebook_id')
  const defaultNotebookId = notebookIdParam
    ? Number(notebookIdParam)
    : scope.kind === 'notebook'
      ? scope.id
      : undefined

  // The form must survive the create transition (undefined id → created id): a
  // remount there would reset the editor and drop keystrokes typed during the POST.
  // `key` tracks what the form is *showing*, adjusted during render via the
  // documented previous-props pattern; `createdId` records the id we just created
  // so that transition adopts the same instance. A different note — or a fresh
  // draft in another notebook scope — gets a new instance.
  const desiredScope =
    noteId != null ? `note-${noteId}` : `draft:${defaultNotebookId ?? 'none'}`
  const [form, setForm] = useState(() => ({
    shown: noteId as number | undefined,
    scope: desiredScope,
    key: noteId != null ? `note-${noteId}` : 'draft-0',
    seq: 0,
    createdId: null as number | null,
  }))
  if (form.shown !== noteId || form.scope !== desiredScope) {
    if (form.shown === undefined && noteId != null && form.createdId === noteId) {
      // The id we just created — same instance.
      setForm((f) => ({ ...f, shown: noteId, scope: desiredScope }))
    } else {
      setForm((f) => ({
        shown: noteId,
        scope: desiredScope,
        key: noteId != null ? `note-${noteId}` : `draft-${f.seq + 1}`,
        seq: f.seq + 1,
        createdId: null, // a new session forgets the previous create
      }))
    }
  }

  return (
    <NoteEditorForm
      key={form.key}
      noteId={noteId}
      defaultNotebookId={defaultNotebookId}
      compact
      onDone={(savedId) => navigate(`/admin/notes/${savedId}${location.search}`)}
      onCreated={(createdId) => {
        // Only claim the form and redirect while still on the new-note screen —
        // otherwise the user has already navigated away and must not be yanked back.
        if (window.location.pathname !== '/admin/notes/new') return
        setForm((f) => ({ ...f, createdId }))
        navigate(`/admin/notes/${createdId}/edit${location.search}`, { replace: true })
      }}
      onDeleted={() => navigate(scopePath)}
    />
  )
}

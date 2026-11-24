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

  return (
    <NoteEditorForm
      key={noteId ?? `new-${defaultNotebookId ?? 'none'}`}
      noteId={noteId}
      defaultNotebookId={defaultNotebookId}
      compact
      onDone={(savedId) => navigate(`/admin/notes/${savedId}${location.search}`)}
      onCreated={(createdId) =>
        navigate(`/admin/notes/${createdId}/edit${location.search}`, { replace: true })
      }
      onDeleted={() => navigate(scopePath)}
    />
  )
}

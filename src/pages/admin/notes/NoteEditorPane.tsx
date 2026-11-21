import { useLocation, useNavigate, useParams } from 'react-router'
import NoteEditorForm from '../../../components/notes/NoteEditorForm'
import { useNotesScope } from '../../../hooks/useNotesScope'

/** Right pane: in-place editor with autosave. */
export default function NoteEditorPane() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { scopePath } = useNotesScope()
  const noteId = id && /^\d+$/.test(id) ? Number(id) : undefined

  return (
    <NoteEditorForm
      key={noteId ?? 'new'}
      noteId={noteId}
      compact
      onDone={(savedId) => navigate(`/admin/notes/${savedId}${location.search}`)}
      onCreated={(createdId) =>
        navigate(`/admin/notes/${createdId}/edit${location.search}`, { replace: true })
      }
      onDeleted={() => navigate(scopePath)}
    />
  )
}

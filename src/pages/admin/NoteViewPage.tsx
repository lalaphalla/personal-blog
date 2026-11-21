import { Navigate, useParams } from 'react-router'
import { useMediaQuery } from '@mui/material'
import { useNotesScope } from '../../hooks/useNotesScope'
import NoteDetailPane from './notes/NoteDetailPane'

/** Route wrapper: renders the note reading pane inside the workspace. */
export default function NoteViewPage() {
  const { id } = useParams()
  const isWide = useMediaQuery('(min-width:1280px)')
  const { scopePath } = useNotesScope()
  const noteId = id && /^\d+$/.test(id) ? Number(id) : undefined

  if (!noteId) {
    return <Navigate to="/admin/notes/all" replace />
  }

  return <NoteDetailPane noteId={noteId} scopePath={scopePath} showBack={!isWide} />
}

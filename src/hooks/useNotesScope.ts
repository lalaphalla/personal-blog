import { useLocation } from 'react-router'

export type NotesScope =
  | { kind: 'all' }
  | { kind: 'favorites' }
  | { kind: 'recent' }
  | { kind: 'archive' }
  | { kind: 'unfiled' }
  | { kind: 'notebooks' }
  | { kind: 'notebook'; id: number }
  | { kind: 'search' }

export interface NotesScopeInfo {
  scope: NotesScope
  noteId?: number
  isEditing: boolean
  isCreating: boolean
  /** Canonical URL for the current list scope (used by back links and redirects). */
  scopePath: string
  scopeLabel: string
}

const SCOPE_LABELS: Record<string, string> = {
  all: 'All notes',
  favorites: 'Favorites',
  recent: 'Recently edited',
  archive: 'Archive',
  unfiled: 'Unfiled',
  notebooks: 'Notebooks',
  search: 'Search',
}

function parseScope(key: string): NotesScope {
  if (key.startsWith('notebooks/')) {
    const id = Number(key.slice('notebooks/'.length))
    if (Number.isFinite(id)) return { kind: 'notebook', id }
    return { kind: 'notebooks' }
  }
  switch (key) {
    case 'favorites':
      return { kind: 'favorites' }
    case 'recent':
      return { kind: 'recent' }
    case 'archive':
      return { kind: 'archive' }
    case 'unfiled':
      return { kind: 'unfiled' }
    case 'notebooks':
      return { kind: 'notebooks' }
    case 'search':
      return { kind: 'search' }
    default:
      return { kind: 'all' }
  }
}

function scopePathFor(key: string): string {
  if (key === 'notebooks' || key.startsWith('notebooks/')) return `/admin/notes/${key}`
  return `/admin/notes/${key || 'all'}`
}

/**
 * Derive the notes scope + selected note from the URL.
 *
 * Note routes (`/:id`) accept a `?scope=` param so the list keeps its scope
 * when a note is opened — e.g. `/admin/notes/12?scope=favorites`.
 */
export function useNotesScope(): NotesScopeInfo {
  const { pathname, search } = useLocation()
  const rest = pathname.replace(/^\/admin\/notes\/?/, '').replace(/\/$/, '')
  const segments = rest ? rest.split('/') : []

  const noteMatch = /^(\d+)(?:\/edit)?$/.exec(rest)
  const noteId = noteMatch ? Number(noteMatch[1]) : undefined
  const isEditing = segments.length === 2 && segments[1] === 'edit'
  const isCreating = rest === 'new'
  const isNoteRoute = Boolean(noteMatch) || isCreating

  const pathKey = segments.join('/')
  const scopeParam = new URLSearchParams(search).get('scope')
  const key = isNoteRoute ? (scopeParam ?? 'all') : pathKey

  return {
    scope: parseScope(key),
    noteId,
    isEditing,
    isCreating,
    scopePath: scopePathFor(key),
    scopeLabel: SCOPE_LABELS[key] ?? 'All notes',
  }
}

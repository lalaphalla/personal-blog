import type { Mood } from '../services/journalApi'

/**
 * Invisible write-through drafts — Apple-Journal-style local-first insurance.
 *
 * While there are unsaved changes, a debounced snapshot is kept in localStorage so a
 * refresh, closed tab, offline network or failed save can never destroy typing. Drafts are
 * restored silently on mount (there is never a "Restore?" prompt) and cleared on every
 * successful save. Scopes: `new.<date>` for unsaved drafts, `entry.<id>` while editing a
 * saved entry.
 *
 * See docs/journal-autosave-loss.md §4 P0 #4.
 */

/** The editable fields of a journal entry (everything autosave persists). */
export interface JournalDraftData {
  entryDate: string
  title: string
  content: string
  mood: Mood | null
  location: string
  tags: string[]
  gratitude: string
  highlight: string
  challenge: string
  lesson: string
  isFavorite: boolean
  promptId: number | null
}

export interface JournalDraft extends JournalDraftData {
  savedAt: number
}

function draftKey(scope: string): string {
  return `journal.draft.${scope}`
}

export function readDraft(scope: string): JournalDraft | null {
  try {
    const raw = localStorage.getItem(draftKey(scope))
    if (!raw) return null
    const parsed = JSON.parse(raw) as JournalDraft
    return typeof parsed?.content === 'string' ? parsed : null
  } catch {
    return null
  }
}

export function writeDraft(scope: string, draft: JournalDraftData): void {
  try {
    localStorage.setItem(draftKey(scope), JSON.stringify({ ...draft, savedAt: Date.now() }))
  } catch {
    // Private mode or quota exceeded — the server autosave remains the safety net.
  }
}

export function clearDraft(scope: string): void {
  try {
    localStorage.removeItem(draftKey(scope))
  } catch {
    // Ignore
  }
}

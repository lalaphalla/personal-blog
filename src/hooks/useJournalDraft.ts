import { useState } from 'react'
import type { JournalEntryInput } from '../services/journalApi'

const DRAFT_KEY = 'journal.draft.new'

export function useJournalDraft() {
  const [draft, setDraft] = useState<Partial<JournalEntryInput> | null>(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY)
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  const saveDraft = (data: Partial<JournalEntryInput>) => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(data))
      setDraft(data)
    } catch {
      // Ignore localStorage quotas or private mode restrictions
    }
  }

  const clearDraft = () => {
    try {
      localStorage.removeItem(DRAFT_KEY)
      setDraft(null)
    } catch {
      // Ignore
    }
  }

  return { draft, saveDraft, clearDraft }
}

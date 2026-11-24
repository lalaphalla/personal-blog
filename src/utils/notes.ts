import type { Note } from '../services/notesApi'

export type NoteSort = 'updated' | 'created' | 'title'

export function noteTitle(note: Pick<Note, 'title'>): string {
  return note.title.trim() || 'Untitled'
}

/** Collapse whitespace and trim a note body to a one-line preview. */
export function noteSnippet(content: string, length = 120): string {
  return content.replace(/\s+/g, ' ').trim().slice(0, length)
}

/** Parses date or ISO string as UTC if no timezone offset is provided */
export function parseNoteUtcDate(value: string): Date {
  if (!value) return new Date()
  const trimmed = value.trim()
  const hasTimezone = /[Zz]$|[+-]\d{2}(:?\d{2})?$/.test(trimmed)
  return new Date(hasTimezone ? trimmed : `${trimmed}Z`)
}

const relativeTime = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

/** "10 minutes ago", "Yesterday", then an absolute date for old notes. */
export function noteRelativeTime(value: string): string {
  const date = parseNoteUtcDate(value)
  const diffSeconds = Math.round((date.getTime() - Date.now()) / 1000)
  const absSeconds = Math.abs(diffSeconds)

  if (absSeconds < 60) return 'Just now'
  if (absSeconds < 60 * 60) {
    return relativeTime.format(Math.round(diffSeconds / 60), 'minute')
  }
  if (absSeconds < 60 * 60 * 24) {
    return relativeTime.format(Math.round(diffSeconds / 3600), 'hour')
  }
  if (absSeconds < 60 * 60 * 24 * 7) {
    return relativeTime.format(Math.round(diffSeconds / 86400), 'day')
  }
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

/** Detailed timestamp for the note document + properties. */
export function formatNoteDateTime(value: string): string {
  return parseNoteUtcDate(value).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function sortNotes(notes: Note[], sort: NoteSort): Note[] {
  const sorted = [...notes]
  if (sort === 'title') {
    sorted.sort((a, b) => noteTitle(a).localeCompare(noteTitle(b)))
    return sorted
  }
  const key = sort === 'created' ? 'created_at' : 'updated_at'
  sorted.sort((a, b) => parseNoteUtcDate(b[key]).getTime() - parseNoteUtcDate(a[key]).getTime())
  return sorted
}

export interface OutlineItem {
  id: string
  text: string
  level: number
}

export function slugify(text: string): string {
  const slug = text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .trim()
    .replace(/\s+/g, '-')
  return slug || 'section'
}

/** Extract markdown headings for the note contents panel. */
export function buildOutline(content: string): OutlineItem[] {
  const items: OutlineItem[] = []
  const seen = new Map<string, number>()
  for (const line of content.split('\n')) {
    const match = /^(#{1,4})\s+(.+?)\s*#*\s*$/.exec(line)
    if (!match) continue
    const text = match[2]
      .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/[*_`~]/g, '')
      .trim()
    if (!text) continue
    const base = slugify(text)
    const count = seen.get(base) ?? 0
    seen.set(base, count + 1)
    items.push({ id: count === 0 ? base : `${base}-${count}`, text, level: match[1].length })
  }
  return items
}

export function countStats(content: string) {
  const chars = [...content].length
  const cjk = content.match(/[\u3400-\u9fff\uf900-\ufaff]/g)?.length ?? 0
  const latin = content
    .replace(/[\u3400-\u9fff\uf900-\ufaff]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length
  const words = cjk + latin
  return {
    chars,
    words,
    minutes: words > 0 ? Math.max(1, Math.ceil(words / 200)) : 0,
  }
}

import type { Mood } from '../services/journalApi'

export interface MoodMeta {
  value: Mood
  label: string
  emoji: string
  color: string
  bgColor: string
  borderColor: string
}

export const MOODS: MoodMeta[] = [
  {
    value: 'great',
    label: 'Great',
    emoji: '😄',
    color: '#059669', // Emerald 600
    bgColor: '#ecfdf5', // Emerald 50
    borderColor: '#a7f3d0',
  },
  {
    value: 'good',
    label: 'Good',
    emoji: '🙂',
    color: '#10b981', // Mint / green
    bgColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  {
    value: 'okay',
    label: 'Okay',
    emoji: '😐',
    color: '#3b82f6', // Slate blue
    bgColor: '#eff6ff',
    borderColor: '#bfdbfe',
  },
  {
    value: 'low',
    label: 'Low',
    emoji: '😕',
    color: '#d97706', // Amber 600
    bgColor: '#fffbeb',
    borderColor: '#fde68a',
  },
  {
    value: 'bad',
    label: 'Bad',
    emoji: '😢',
    color: '#e11d48', // Rose / terracotta
    bgColor: '#fff1f2',
    borderColor: '#fecdd3',
  },
]

export function getMoodMeta(mood: Mood | null | undefined): MoodMeta | null {
  if (!mood) return null
  return MOODS.find((m) => m.value === mood) ?? null
}

/** Formats local date to YYYY-MM-DD without UTC shift */
export function getLocalTodayDateString(d: Date = new Date()): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** Converts "2026-11-21" to "Saturday, November 21, 2026" */
export function formatFullJournalDate(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split('-').map(Number)
    if (!year || !month || !day) return dateStr
    const d = new Date(year, month - 1, day)
    return d.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return dateStr
  }
}

/** Formats "2026-11-21" to "Nov 21, 2026" */
export function formatShortJournalDate(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split('-').map(Number)
    if (!year || !month || !day) return dateStr
    const d = new Date(year, month - 1, day)
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return dateStr
  }
}

/** Parses date or ISO string as UTC if no timezone offset is provided */
export function parseUtcDate(value: string): Date {
  if (!value) return new Date()
  const trimmed = value.trim()
  const hasTimezone = /[Zz]$|[+-]\d{2}(:?\d{2})?$/.test(trimmed)
  return new Date(hasTimezone ? trimmed : `${trimmed}Z`)
}

/** Formats ISO timestamp to local "6:42 PM" */
export function formatJournalTime(isoStr: string): string {
  try {
    const d = parseUtcDate(isoStr)
    return d.toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    })
  } catch {
    return ''
  }
}

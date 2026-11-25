import type { RecallCard, RecallCardCreateInput } from '../services/recallApi'

function parseCsvLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i += 1
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += ch
    }
  }
  result.push(current.trim())
  return result
}

function parseTags(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.map((t) => String(t).trim().replace(/^#/, '').toLowerCase()).filter(Boolean)
  }
  if (typeof raw === 'string') {
    return raw
      .split(/[,\s]+/)
      .map((t) => t.trim().replace(/^#/, '').toLowerCase())
      .filter(Boolean)
  }
  return []
}

function parseJsonCards(text: string, defaultDeck: string): RecallCardCreateInput[] | null {
  const trimmed = text.trim()
  if (!trimmed.startsWith('[') && !trimmed.startsWith('{')) return null
  try {
    const parsed: unknown = JSON.parse(trimmed)
    const rawList = Array.isArray(parsed)
      ? parsed
      : typeof parsed === 'object' && parsed !== null && Array.isArray((parsed as { cards?: unknown }).cards)
        ? (parsed as { cards: unknown[] }).cards
        : []

    const cards: RecallCardCreateInput[] = []
    for (const item of rawList) {
      if (typeof item !== 'object' || item === null) continue
      const obj = item as Record<string, unknown>
      const front = typeof obj.front === 'string' ? obj.front.trim() : ''
      const back = typeof obj.back === 'string' ? obj.back.trim() : ''
      if (!front || !back) continue
      cards.push({
        front,
        back,
        hint: typeof obj.hint === 'string' && obj.hint.trim() ? obj.hint.trim() : null,
        deck: typeof obj.deck === 'string' && obj.deck.trim() ? obj.deck.trim() : defaultDeck,
        tags: parseTags(obj.tags),
        source_url:
          typeof obj.source_url === 'string' && obj.source_url.trim()
            ? obj.source_url.trim()
            : null,
      })
    }
    return cards
  } catch {
    return null
  }
}

function parseMarkdownCards(text: string, defaultDeck: string): RecallCardCreateInput[] {
  const normalized = text.replace(/\r\n/g, '\n').trim()
  if (!normalized) return []

  // Pattern 1: Q: ... A: ... blocks (separated by --- or Q: lines)
  if (/^Q:\s+/im.test(normalized)) {
    const blocks = normalized.split(/\n---+\n|\n(?=Q:\s+)/i)
    const cards: RecallCardCreateInput[] = []
    for (const block of blocks) {
      const qMatch = /^Q:\s*([\s\S]*?)\nA:\s*([\s\S]*)$/im.exec(block.trim())
      if (!qMatch) continue
      const front = qMatch[1].trim()
      const back = qMatch[2].trim()
      if (front && back) {
        cards.push({ front, back, deck: defaultDeck, tags: [] })
      }
    }
    if (cards.length > 0) return cards
  }

  // Pattern 2: ## Front headings followed by Back body
  if (/^#{1,3}\s+/m.test(normalized)) {
    const sections = normalized.split(/\n(?=#{1,3}\s+)/)
    const cards: RecallCardCreateInput[] = []
    for (const sec of sections) {
      const match = /^#{1,3}\s+(.+)\n([\s\S]+)$/.exec(sec.trim())
      if (!match) continue
      const front = match[1].trim()
      const back = match[2].trim()
      if (front && back) {
        cards.push({ front, back, deck: defaultDeck, tags: [] })
      }
    }
    if (cards.length > 0) return cards
  }

  return []
}

function parseDelimitedCards(text: string, defaultDeck: string): RecallCardCreateInput[] {
  const lines = text
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'))

  const cards: RecallCardCreateInput[] = []
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i]
    const parts = line.includes('\t')
      ? line.split('\t').map((p) => p.trim())
      : parseCsvLine(line)

    if (parts.length < 2) continue
    const [front, back, third = '', fourth = ''] = parts
    if (!front || !back) continue

    // Skip header row if present
    if (
      i === 0 &&
      front.toLowerCase() === 'front' &&
      back.toLowerCase() === 'back'
    ) {
      continue
    }

    cards.push({
      front,
      back,
      hint: fourth ? third || null : null,
      tags: parseTags(fourth || third),
      deck: defaultDeck,
    })
  }
  return cards
}

/**
 * Auto-detect and parse JSON, Markdown (Q:/A: or ## headings), or TSV/CSV (Anki/Quizlet/Sheets).
 */
export function parseRecallImport(
  rawText: string,
  defaultDeck = 'General',
): RecallCardCreateInput[] {
  const deck = defaultDeck.trim() || 'General'
  const jsonCards = parseJsonCards(rawText, deck)
  if (jsonCards !== null) return jsonCards

  const mdCards = parseMarkdownCards(rawText, deck)
  if (mdCards.length > 0) return mdCards

  return parseDelimitedCards(rawText, deck)
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export function exportRecallAsMarkdown(cards: RecallCard[], name = 'recall-cards'): void {
  const body = cards
    .map((c) => `Q: ${c.front}\nA: ${c.back}`)
    .join('\n\n---\n\n')
  downloadBlob(
    new Blob([body + '\n'], { type: 'text/markdown;charset=utf-8' }),
    `${name}.md`,
  )
}

export function exportRecallAsJson(cards: RecallCard[], name = 'recall-cards'): void {
  const payload = cards.map((c) => ({
    front: c.front,
    back: c.back,
    hint: c.hint,
    deck: c.deck,
    tags: c.tags,
    source_url: c.source_url,
  }))
  downloadBlob(
    new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }),
    `${name}.json`,
  )
}

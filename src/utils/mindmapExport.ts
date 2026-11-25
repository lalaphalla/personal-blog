import type { Edge } from '@xyflow/react'
import type { MindmapFlowNode } from '../components/mindmap/MindmapNode'
import type { MindmapNodeColor } from '../services/mindmapApi'
import { NODE_COLOR_MAP } from './mindmapLayout'

function slugifyFilename(title: string): string {
  const cleaned = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return cleaned || 'mindmap'
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

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/** Export mindmap as a formatted JSON file. */
export function exportMindmapAsJson(
  title: string,
  nodes: MindmapFlowNode[],
  edges: Edge[],
): void {
  const payload = {
    title,
    exportedAt: new Date().toISOString(),
    nodes: nodes.map((n) => ({
      id: n.id,
      position: n.position,
      data: {
        label: n.data.label,
        color: n.data.color ?? 'default',
        notes: n.data.notes ?? '',
      },
    })),
    edges: edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
    })),
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  })
  downloadBlob(blob, `${slugifyFilename(title)}.json`)
}

/** Export mindmap hierarchy as a Markdown outline (.md). */
export function exportMindmapAsMarkdown(
  title: string,
  nodes: MindmapFlowNode[],
  edges: Edge[],
): void {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]))
  const childrenMap = new Map<string, string[]>()
  const hasParent = new Set<string>()

  for (const edge of edges) {
    if (!nodeMap.has(edge.source) || !nodeMap.has(edge.target)) continue
    hasParent.add(edge.target)
    const list = childrenMap.get(edge.source) ?? []
    list.push(edge.target)
    childrenMap.set(edge.source, list)
  }

  const roots = nodes.filter((n) => !hasParent.has(n.id))
  if (roots.length === 0 && nodes.length > 0) {
    roots.push(nodes[0])
  }

  const lines: string[] = [`# ${title.trim() || 'Untitled Mindmap'}`, '']
  const visited = new Set<string>()

  const walk = (nodeId: string, depth: number) => {
    if (visited.has(nodeId)) return
    visited.add(nodeId)
    const node = nodeMap.get(nodeId)
    if (!node) return

    const label = (node.data.label || 'Untitled').trim()
    if (depth === 0) {
      lines.push(`## ${label}`)
    } else if (depth === 1) {
      lines.push(`### ${label}`)
    } else {
      const indent = '  '.repeat(depth - 2)
      lines.push(`${indent}- ${label}`)
    }

    const notes = typeof node.data.notes === 'string' ? node.data.notes.trim() : ''
    if (notes) {
      const indent = depth <= 1 ? '' : '  '.repeat(depth - 1)
      lines.push(`${indent}> ${notes}`)
    }

    const children = childrenMap.get(nodeId) ?? []
    for (const childId of children) {
      walk(childId, depth + 1)
    }
  }

  for (const root of roots) {
    walk(root.id, 0)
    lines.push('')
  }

  const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' })
  downloadBlob(blob, `${slugifyFilename(title)}.md`)
}

/** Render the entire mindmap graph to a clean 2x PNG image and download it. */
export async function exportMindmapAsPng(
  title: string,
  nodes: MindmapFlowNode[],
  edges: Edge[],
): Promise<void> {
  if (nodes.length === 0) return

  const padding = 48
  const defaultW = 160
  const defaultH = 44

  const boxes = nodes.map((n) => {
    const w = n.measured?.width ?? defaultW
    const h = n.measured?.height ?? defaultH
    return { node: n, x: n.position.x, y: n.position.y, w, h }
  })
  const boxMap = new Map(boxes.map((b) => [b.node.id, b]))

  const minX = Math.min(...boxes.map((b) => b.x)) - padding
  const minY = Math.min(...boxes.map((b) => b.y)) - padding
  const maxX = Math.max(...boxes.map((b) => b.x + b.w)) + padding
  const maxY = Math.max(...boxes.map((b) => b.y + b.h)) + padding

  const width = Math.max(200, Math.ceil(maxX - minX))
  const height = Math.max(150, Math.ceil(maxY - minY))

  const edgePaths = edges
    .map((e) => {
      const src = boxMap.get(e.source)
      const tgt = boxMap.get(e.target)
      if (!src || !tgt) return ''
      const goesLeft = tgt.x + tgt.w / 2 < src.x + src.w / 2
      const x1 = goesLeft ? src.x - minX : src.x + src.w - minX
      const y1 = src.y + src.h / 2 - minY
      const x2 = goesLeft ? tgt.x + tgt.w - minX : tgt.x - minX
      const y2 = tgt.y + tgt.h / 2 - minY
      const midX = (x1 + x2) / 2
      return `<path d="M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}" fill="none" stroke="#64748b" stroke-width="2" />`
    })
    .join('\n')

  const nodeRects = boxes
    .map(({ node, x, y, w, h }) => {
      const colorKey: MindmapNodeColor =
        node.data.color && node.data.color in NODE_COLOR_MAP ? node.data.color : 'default'
      const palette = NODE_COLOR_MAP[colorKey]
      const rx = node.id === 'root' ? 12 : 8
      const nx = x - minX
      const ny = y - minY
      const label = escapeXml((node.data.label || 'Untitled').trim())
      const fontWeight = node.id === 'root' ? 700 : 500
      const fontSize = node.id === 'root' ? 15 : 14

      return `
        <g>
          <rect x="${nx}" y="${ny}" width="${w}" height="${h}" rx="${rx}" fill="${palette.bg}" stroke="${palette.border}" stroke-width="2" />
          <text x="${nx + w / 2}" y="${ny + h / 2}" dominant-baseline="central" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="${fontSize}" font-weight="${fontWeight}" fill="#0f172a">${label}</text>
        </g>
      `
    })
    .join('\n')

  const svgMarkup = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <rect width="100%" height="100%" fill="#f8fafc" />
      ${edgePaths}
      ${nodeRects}
    </svg>
  `.trim()

  const svgBlob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' })
  const svgUrl = URL.createObjectURL(svgBlob)

  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image()
      el.onload = () => resolve(el)
      el.onerror = () => reject(new Error('Failed to render SVG'))
      el.src = svgUrl
    })

    const scale = 2
    const canvas = document.createElement('canvas')
    canvas.width = width * scale
    canvas.height = height * scale
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.scale(scale, scale)
    ctx.drawImage(img, 0, 0)

    const pngBlob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), 'image/png'),
    )
    if (pngBlob) {
      downloadBlob(pngBlob, `${slugifyFilename(title)}.png`)
    }
  } finally {
    URL.revokeObjectURL(svgUrl)
  }
}

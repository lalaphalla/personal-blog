import type { Edge, Node } from '@xyflow/react'
import type {
  MindmapEdgeRecord,
  MindmapNodeColor,
  MindmapNodeData,
  MindmapNodeRecord,
} from '../services/mindmapApi'
import { autoLayoutMindmap } from './mindmapLayout'

const BRANCH_COLORS: MindmapNodeColor[] = [
  'primary',
  'success',
  'warning',
  'info',
  'purple',
  'error',
]

export interface ParsedMindmap {
  title: string
  nodes: MindmapNodeRecord[]
  edges: MindmapEdgeRecord[]
}

function cleanMarkdownLabel(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .trim()
}

/**
 * Parse a Markdown document (headings `#..######` and indented `-` / `*` / `1.` lists)
 * into a positioned Mindmap tree ready for `createMindmap`.
 */
export function parseMarkdownToMindmap(
  markdown: string,
  fallbackTitle = 'Imported Mindmap',
): ParsedMindmap {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n')

  let title = fallbackTitle.trim() || 'Imported Mindmap'
  let rootCreated = false

  const nodes: Node<MindmapNodeData>[] = []
  const edges: Edge[] = []

  // Stack of { depth, id, color }
  const stack: Array<{ depth: number; id: string; color: MindmapNodeColor }> = []
  let currentHeadingDepth = 0
  let branchIndex = 0
  let counter = 0

  const ensureRoot = (rootLabel: string) => {
    if (rootCreated) return
    rootCreated = true
    title = rootLabel
    nodes.push({
      id: 'root',
      type: 'mindmapNode',
      position: { x: 0, y: 0 },
      data: {
        label: rootLabel,
        color: 'primary',
        notes: '',
        collapsed: false,
        linkedEntity: null,
      },
    })
    stack.push({ depth: 0, id: 'root', color: 'primary' })
  }

  for (const rawLine of lines) {
    const trimmed = rawLine.trim()
    if (!trimmed) continue

    const headingMatch = /^(#{1,6})\s+(.+)$/.exec(trimmed)
    if (headingMatch) {
      const level = headingMatch[1].length
      const label = cleanMarkdownLabel(headingMatch[2])
      if (!label) continue

      if (level === 1 && !rootCreated) {
        ensureRoot(label)
        currentHeadingDepth = 0
        continue
      }

      if (!rootCreated) {
        ensureRoot(title)
      }

      const depth = level === 1 ? 1 : level - 1
      currentHeadingDepth = depth

      while (stack.length > 1 && stack[stack.length - 1].depth >= depth) {
        stack.pop()
      }

      const parent = stack[stack.length - 1]
      const color: MindmapNodeColor =
        parent.id === 'root'
          ? BRANCH_COLORS[branchIndex++ % BRANCH_COLORS.length]
          : parent.color

      counter += 1
      const id = `node-${counter}`
      nodes.push({
        id,
        type: 'mindmapNode',
        position: { x: 0, y: 0 },
        data: {
          label,
          color,
          notes: '',
          collapsed: false,
          linkedEntity: null,
        },
      })
      edges.push({
        id: `edge-${parent.id}-${id}`,
        source: parent.id,
        target: id,
        type: 'smoothstep',
      })
      stack.push({ depth, id, color })
      continue
    }

    const listMatch = /^(\s*)(?:[-*+]|\d+\.)\s+(.+)$/.exec(rawLine)
    if (listMatch) {
      const label = cleanMarkdownLabel(listMatch[2])
      if (!label) continue

      if (!rootCreated) {
        ensureRoot(title)
      }

      const indentSpaces = listMatch[1].replace(/\t/g, '  ').length
      const listLevel = Math.floor(indentSpaces / 2) + 1
      const depth = currentHeadingDepth + listLevel

      while (stack.length > 1 && stack[stack.length - 1].depth >= depth) {
        stack.pop()
      }

      const parent = stack[stack.length - 1]
      const color: MindmapNodeColor =
        parent.id === 'root'
          ? BRANCH_COLORS[branchIndex++ % BRANCH_COLORS.length]
          : parent.color

      counter += 1
      const id = `node-${counter}`
      nodes.push({
        id,
        type: 'mindmapNode',
        position: { x: 0, y: 0 },
        data: {
          label,
          color,
          notes: '',
          collapsed: false,
          linkedEntity: null,
        },
      })
      edges.push({
        id: `edge-${parent.id}-${id}`,
        source: parent.id,
        target: id,
        type: 'smoothstep',
      })
      stack.push({ depth, id, color })
    }
  }

  if (!rootCreated) {
    ensureRoot(title)
  }

  const { nodes: laidOut, edges: laidOutEdges } = autoLayoutMindmap(nodes, edges, 'LR')

  return {
    title,
    nodes: laidOut.map((n) => ({
      id: n.id,
      type: n.type || 'mindmapNode',
      position: n.position,
      data: n.data,
    })),
    edges: laidOutEdges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      ...(e.sourceHandle ? { sourceHandle: e.sourceHandle } : {}),
      type: e.type || 'smoothstep',
    })),
  }
}

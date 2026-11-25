import dagre from '@dagrejs/dagre'
import { Position, type Edge, type Node } from '@xyflow/react'
import type { MindmapNodeColor } from '../services/mindmapApi'

export interface NodeColorStyle {
  label: string
  border: string
  accent: string
  bg: string
}

export const NODE_COLOR_MAP: Record<MindmapNodeColor, NodeColorStyle> = {
  default: { label: 'Default', border: '#cbd5e1', accent: '#64748b', bg: '#ffffff' },
  primary: { label: 'Blue', border: '#93c5fd', accent: '#2563eb', bg: '#eff6ff' },
  success: { label: 'Green', border: '#86efac', accent: '#16a34a', bg: '#f0fdf4' },
  warning: { label: 'Amber', border: '#fcd34d', accent: '#d97706', bg: '#fffbeb' },
  error: { label: 'Red', border: '#fca5a5', accent: '#dc2626', bg: '#fef2f2' },
  info: { label: 'Cyan', border: '#67e8f9', accent: '#0891b2', bg: '#ecfeff' },
  purple: { label: 'Purple', border: '#d8b4fe', accent: '#9333ea', bg: '#faf5ff' },
}

export function generateNodeId(): string {
  return `node-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

const DEFAULT_NODE_WIDTH = 180
const DEFAULT_NODE_HEIGHT = 48

function runDagre<N extends Node>(
  nodes: N[],
  edges: Edge[],
  direction: 'LR' | 'RL' | 'TB',
): N[] {
  if (nodes.length === 0) return nodes

  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({
    rankdir: direction,
    nodesep: direction === 'TB' ? 48 : 32,
    ranksep: direction === 'TB' ? 72 : 96,
  })

  for (const node of nodes) {
    const width = node.measured?.width ?? DEFAULT_NODE_WIDTH
    const height = node.measured?.height ?? DEFAULT_NODE_HEIGHT
    g.setNode(node.id, { width, height })
  }

  for (const edge of edges) {
    g.setEdge(edge.source, edge.target)
  }

  dagre.layout(g)

  return nodes.map((node) => {
    const positioned = g.node(node.id)
    if (!positioned) return node
    const width = node.measured?.width ?? DEFAULT_NODE_WIDTH
    const height = node.measured?.height ?? DEFAULT_NODE_HEIGHT
    return {
      ...node,
      position: {
        x: Math.round(positioned.x - width / 2),
        y: Math.round(positioned.y - height / 2),
      },
    }
  })
}

function collectSubtreeIds(
  startIds: string[],
  childrenMap: Map<string, string[]>,
): Set<string> {
  const result = new Set<string>()
  const queue = [...startIds]
  while (queue.length > 0) {
    const id = queue.shift()!
    if (result.has(id)) continue
    result.add(id)
    for (const child of childrenMap.get(id) ?? []) {
      queue.push(child)
    }
  }
  return result
}

export function autoLayoutMindmap<N extends Node>(
  nodes: N[],
  edges: Edge[],
  direction: 'LR' | 'TB' = 'LR',
): { nodes: N[]; edges: Edge[] } {
  const updatedNodes = runDagre(nodes, edges, direction).map((n) => ({
    ...n,
    targetPosition: direction === 'TB' ? Position.Top : Position.Left,
    sourcePosition: direction === 'TB' ? Position.Bottom : Position.Right,
  }))
  const updatedEdges = edges.map((e) => ({
    ...e,
    sourceHandle: e.source === 'root' ? 'right' : e.sourceHandle,
  }))
  return { nodes: updatedNodes, edges: updatedEdges }
}

/**
 * Balanced Left & Right mindmap layout: places root in the center and splits
 * top-level branches evenly to the right (LR) and left (RL).
 */
export function autoLayoutBalancedMindmap<N extends Node>(
  nodes: N[],
  edges: Edge[],
): { nodes: N[]; edges: Edge[] } {
  if (nodes.length <= 1) {
    return autoLayoutMindmap(nodes, edges, 'LR')
  }

  const root = nodes.find((n) => n.id === 'root') ?? nodes[0]
  const childrenMap = new Map<string, string[]>()
  for (const e of edges) {
    const list = childrenMap.get(e.source) ?? []
    list.push(e.target)
    childrenMap.set(e.source, list)
  }

  const directChildren = childrenMap.get(root.id) ?? []
  const splitIdx = Math.ceil(directChildren.length / 2)
  const rightSeeds = directChildren.slice(0, splitIdx)
  const leftSeeds = directChildren.slice(splitIdx)

  const rightSubtree = collectSubtreeIds(rightSeeds, childrenMap)
  const leftSubtree = collectSubtreeIds(leftSeeds, childrenMap)

  const rightNodesInput = nodes
    .filter((n) => n.id === root.id || rightSubtree.has(n.id))
    .map((n) => ({
      ...n,
      targetPosition: Position.Left,
      sourcePosition: Position.Right,
    }))
  const rightEdgesInput = edges.filter(
    (e) =>
      (e.source === root.id && rightSubtree.has(e.target)) ||
      (rightSubtree.has(e.source) && rightSubtree.has(e.target)),
  )

  const leftNodesInput = nodes
    .filter((n) => n.id === root.id || leftSubtree.has(n.id))
    .map((n) => ({
      ...n,
      targetPosition: Position.Right,
      sourcePosition: Position.Left,
    }))
  const leftEdgesInput = edges.filter(
    (e) =>
      (e.source === root.id && leftSubtree.has(e.target)) ||
      (leftSubtree.has(e.source) && leftSubtree.has(e.target)),
  )

  const rightLaid = runDagre(rightNodesInput, rightEdgesInput, 'LR')
  const leftLaid = runDagre(leftNodesInput, leftEdgesInput, 'RL')

  const rightRoot = rightLaid.find((n) => n.id === root.id)
  const leftRoot = leftLaid.find((n) => n.id === root.id)

  const posMap = new Map<string, { x: number; y: number }>()
  const sideMap = new Map<string, 'left' | 'right'>()

  posMap.set(root.id, { x: 0, y: 0 })

  const rOffX = rightRoot ? -rightRoot.position.x : 0
  const rOffY = rightRoot ? -rightRoot.position.y : 0
  for (const n of rightLaid) {
    if (n.id === root.id) continue
    posMap.set(n.id, { x: n.position.x + rOffX, y: n.position.y + rOffY })
    sideMap.set(n.id, 'right')
  }

  const lOffX = leftRoot ? -leftRoot.position.x : 0
  const lOffY = leftRoot ? -leftRoot.position.y : 0
  for (const n of leftLaid) {
    if (n.id === root.id) continue
    posMap.set(n.id, { x: n.position.x + lOffX, y: n.position.y + lOffY })
    sideMap.set(n.id, 'left')
  }

  const finalNodes = nodes.map((n) => {
    const pos = posMap.get(n.id) ?? n.position
    const side = sideMap.get(n.id)
    if (n.id === root.id) {
      return {
        ...n,
        position: pos,
        targetPosition: Position.Left,
        sourcePosition: Position.Right,
      }
    }
    if (side === 'left') {
      return {
        ...n,
        position: pos,
        targetPosition: Position.Right,
        sourcePosition: Position.Left,
      }
    }
    return {
      ...n,
      position: pos,
      targetPosition: Position.Left,
      sourcePosition: Position.Right,
    }
  })

  const finalEdges = edges.map((e) => {
    if (e.source === root.id) {
      const side = sideMap.get(e.target) === 'left' ? 'left' : 'right'
      return { ...e, sourceHandle: side }
    }
    return { ...e, sourceHandle: undefined }
  })

  return { nodes: finalNodes, edges: finalEdges }
}

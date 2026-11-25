import '@xyflow/react/dist/style.css'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  Position,
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Connection,
  type Edge,
  type Viewport,
} from '@xyflow/react'
import type {
  Mindmap,
  MindmapNodeColor,
  MindmapUpdateInput,
} from '../../services/mindmapApi'
import {
  exportMindmapAsJson,
  exportMindmapAsMarkdown,
  exportMindmapAsPng,
} from '../../utils/mindmapExport'
import {
  autoLayoutBalancedMindmap,
  autoLayoutMindmap,
  generateNodeId,
} from '../../utils/mindmapLayout'
import MindmapNodeComponent, { type MindmapFlowNode } from './MindmapNode'
import MindmapToolbar from './MindmapToolbar'

// style 
const DEFAULT_EDGE_STYLE = {
  stroke: '#64748b',
  strokeWidth: 2,
}


const DEFAULT_EDGE_OPTIONS = {
  type: 'smoothstep',
  style: DEFAULT_EDGE_STYLE,
}

const nodeTypes = {
  mindmapNode: MindmapNodeComponent,
}

interface MindmapCanvasProps {
  mindmap: Mindmap
  onSave: (input: MindmapUpdateInput) => Promise<void>
  onToggleFavorite: () => Promise<void>
}

function serializeNodes(nodes: MindmapFlowNode[]) {
  return nodes.map((n) => ({
    id: n.id,
    type: n.type || 'mindmapNode',
    position: n.position,
    ...(n.targetPosition ? { targetPosition: n.targetPosition } : {}),
    ...(n.sourcePosition ? { sourcePosition: n.sourcePosition } : {}),
    data: {
      label: n.data.label,
      color: n.data.color ?? 'default',
      notes: n.data.notes ?? '',
      collapsed: Boolean(n.data.collapsed),
      linkedEntity: n.data.linkedEntity ?? null,
    },
  }))
}

function serializeEdges(edges: Edge[]) {
  return edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    ...(e.sourceHandle ? { sourceHandle: e.sourceHandle } : {}),
    type: e.type || 'smoothstep',
  }))
}

function MindmapCanvasInner({
  mindmap,
  onSave,
  onToggleFavorite,
}: MindmapCanvasProps) {
  const { fitView, getViewport } = useReactFlow()
  const [title, setTitle] = useState(mindmap.title)
  const [savingStatus, setSavingStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null)
  const isDirtyRef = useRef(false)
  const saveTimerRef = useRef<number | null>(null)
  const onSaveRef = useRef(onSave)
  useEffect(() => {
    onSaveRef.current = onSave
  }, [onSave])

  const [nodes, setNodes, onNodesChange] = useNodesState<MindmapFlowNode>(
    (mindmap.nodes || []) as MindmapFlowNode[],
  )
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(
    (mindmap.edges || []).map((e) => ({
      ...e,
      type: e.type || 'smoothstep',
      style: e.style ?? DEFAULT_EDGE_STYLE,
    })),
  )

  // Sync when switching to a different mindmap id
  const loadedIdRef = useRef(mindmap.id)
  useEffect(() => {
    if (loadedIdRef.current !== mindmap.id) {
      loadedIdRef.current = mindmap.id
      isDirtyRef.current = false
      setTitle(mindmap.title)
      setNodes((mindmap.nodes || []) as MindmapFlowNode[])
      setEdges(
        (mindmap.edges || []).map((e) => ({
          ...e,
          type: e.type || 'smoothstep',
          style: e.style ?? DEFAULT_EDGE_STYLE,
        })),
      )
      setSavingStatus('idle')
    }
  }, [mindmap, setEdges, setNodes])

  const markDirty = useCallback(() => {
    isDirtyRef.current = true
  }, [])

  const handleLabelChange = useCallback(
    (id: string, label: string) => {
      markDirty()
      setNodes((nds) =>
        nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, label } } : n)),
      )
    },
    [markDirty, setNodes],
  )

  const handleFinishEdit = useCallback(() => {
    setEditingNodeId(null)
  }, [])

  // Inject interactive callbacks into node data without mutating saved data
  const renderedNodes = useMemo(
    () =>
      nodes.map((n) => ({
        ...n,
        type: 'mindmapNode' as const,
        data: {
          ...n.data,
          editing: editingNodeId === n.id,
          onLabelChange: handleLabelChange,
          onFinishEdit: handleFinishEdit,
        },
      })),
    [nodes, editingNodeId, handleLabelChange, handleFinishEdit],
  )

  // Debounced autosave
  useEffect(() => {
    if (!isDirtyRef.current) return
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current)
    saveTimerRef.current = window.setTimeout(async () => {
      try {
        setSavingStatus('saving')
        await onSaveRef.current({
          title,
          nodes: serializeNodes(nodes),
          edges: serializeEdges(edges),
          viewport: getViewport(),
        })
        isDirtyRef.current = false
        setSavingStatus('saved')
      } catch {
        setSavingStatus('error')
      }
    }, 1200)
    return () => {
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current)
    }
  }, [title, nodes, edges, getViewport])

  const selectedNode = useMemo(() => nodes.find((n) => n.selected) ?? null, [nodes])

  const addChildToNode = useCallback(
    (parentId: string) => {
      const parent = nodes.find((n) => n.id === parentId) ?? nodes[0]
      if (!parent) return

      const existingChildren = edges.filter((e) => e.source === parent.id).length
      const isLeftBranch = parent.sourcePosition === Position.Left
      const newId = generateNodeId()
      const newNode: MindmapFlowNode = {
        id: newId,
        type: 'mindmapNode',
        targetPosition: isLeftBranch ? Position.Right : Position.Left,
        sourcePosition: isLeftBranch ? Position.Left : Position.Right,
        position: {
          x: parent.position.x + (isLeftBranch ? -240 : 240),
          y: parent.position.y + existingChildren * 72,
        },
        selected: true,
        data: {
          label: 'New Idea',
          color: parent.data.color ?? 'default',
          notes: '',
          collapsed: false,
          linkedEntity: null,
        },
      }
      const newEdge: Edge = {
        id: `edge-${parent.id}-${newId}`,
        source: parent.id,
        target: newId,
        sourceHandle: parent.id === 'root' ? 'right' : undefined,
        type: 'smoothstep',
        style: DEFAULT_EDGE_STYLE,
      }

      markDirty()
      setNodes((nds) => [...nds.map((n) => ({ ...n, selected: false })), newNode])
      setEdges((eds) => eds.concat(newEdge))
      setEditingNodeId(newId)
    },
    [edges, markDirty, nodes, setEdges, setNodes],
  )

  const addSiblingToNode = useCallback(
    (nodeId: string) => {
      const parentEdge = edges.find((e) => e.target === nodeId)
      if (!parentEdge) {
        // Root node: add a child instead
        addChildToNode(nodeId)
        return
      }
      addChildToNode(parentEdge.source)
    },
    [addChildToNode, edges],
  )

  const deleteSelectedNodes = useCallback(() => {
    const deletableIds = new Set(
      nodes.filter((n) => n.selected && n.id !== 'root').map((n) => n.id),
    )
    if (deletableIds.size === 0) return

    markDirty()
    setNodes((nds) => nds.filter((n) => !deletableIds.has(n.id)))
    setEdges((eds) =>
      eds.filter((e) => !deletableIds.has(e.source) && !deletableIds.has(e.target)),
    )
  }, [markDirty, nodes, setEdges, setNodes])

  const handleSelectColor = useCallback(
    (color: MindmapNodeColor) => {
      if (!selectedNode) return
      markDirty()
      setNodes((nds) =>
        nds.map((n) => (n.id === selectedNode.id ? { ...n, data: { ...n.data, color } } : n)),
      )
    },
    [markDirty, selectedNode, setNodes],
  )

  const handleAutoLayout = useCallback(
    (mode: 'BALANCED' | 'LR') => {
      markDirty()
      const result =
        mode === 'BALANCED'
          ? autoLayoutBalancedMindmap(nodes, edges)
          : autoLayoutMindmap(nodes, edges, 'LR')
      setNodes(result.nodes)
      setEdges(
        result.edges.map((e) => ({
          ...e,
          type: e.type || 'smoothstep',
          style: e.style ?? DEFAULT_EDGE_STYLE,
        })),
      )
      window.setTimeout(() => fitView({ padding: 0.2, duration: 250 }), 30)
    },
    [edges, fitView, markDirty, nodes, setEdges, setNodes],
  )

  const onConnect = useCallback(
    (connection: Connection) => {
      markDirty()
      setEdges((eds) =>
        addEdge({ ...connection, type: 'smoothstep', style: DEFAULT_EDGE_STYLE }, eds),
      )
    },
    [markDirty, setEdges],
  )

  // Keyboard shortcuts: Tab (add child), Enter (add sibling)
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (editingNodeId) return
      const target = e.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return

      if (e.key === 'Tab') {
        e.preventDefault()
        addChildToNode(selectedNode?.id ?? nodes[0]?.id ?? 'root')
      } else if (e.key === 'Enter' && selectedNode) {
        e.preventDefault()
        addSiblingToNode(selectedNode.id)
      }
    },
    [addChildToNode, addSiblingToNode, editingNodeId, nodes, selectedNode],
  )

  const defaultViewport: Viewport | undefined = mindmap.viewport ?? undefined

  return (
    <Stack sx={{ height: '100%', width: '100%' }} onKeyDown={handleKeyDown}>
      <MindmapToolbar
        title={title}
        onTitleChange={(next) => {
          markDirty()
          setTitle(next)
        }}
        isFavorite={mindmap.is_favorite}
        onToggleFavorite={onToggleFavorite}
        savingStatus={savingStatus}
        hasSelection={Boolean(selectedNode)}
        canDeleteSelection={Boolean(selectedNode && selectedNode.id !== 'root')}
        selectedColor={(selectedNode?.data.color as MindmapNodeColor) ?? 'default'}
        onAddChild={() => addChildToNode(selectedNode?.id ?? nodes[0]?.id ?? 'root')}
        onAddSibling={() => selectedNode && addSiblingToNode(selectedNode.id)}
        onDeleteSelected={deleteSelectedNodes}
        onSelectColor={handleSelectColor}
        onAutoLayout={handleAutoLayout}
        onFitView={() => fitView({ padding: 0.2, duration: 250 })}
        onExportPng={() => void exportMindmapAsPng(title, nodes, edges)}
        onExportMarkdown={() => exportMindmapAsMarkdown(title, nodes, edges)}
        onExportJson={() => exportMindmapAsJson(title, nodes, edges)}
      />

      <Box sx={{ flex: 1, minHeight: 0, width: '100%' }}>
        <ReactFlow
          nodes={renderedNodes}
          edges={edges}
          nodeTypes={nodeTypes}
          defaultEdgeOptions={DEFAULT_EDGE_OPTIONS}
          onNodesChange={(changes) => {
            if (changes.toArray().some((c) => c.type !== 'select')) {
              markDirty()
            }
            onNodesChange(changes)
          }}
          onEdgesChange={(changes) => {
            if (changes.toArray().some((c) => c.type !== 'select')) {
              markDirty()
            }
            onEdgesChange(changes)
          }}
          onConnect={onConnect}
          defaultViewport={defaultViewport}
          fitView={!defaultViewport}
          fitViewOptions={{ padding: 0.3 }}
          deleteKeyCode={['Backspace', 'Delete']}
        >
          <Background variant={BackgroundVariant.Dots} gap={18} size={1} />
          <Controls />
          <MiniMap
            pannable
            zoomable
            style={{ width: 140, height: 95 }}
          />
        </ReactFlow>
      </Box>
    </Stack>
  )
}

export default function MindmapCanvas(props: MindmapCanvasProps) {
  return (
    <ReactFlowProvider>
      <MindmapCanvasInner {...props} />
    </ReactFlowProvider>
  )
}

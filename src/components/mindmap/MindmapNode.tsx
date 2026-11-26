import { memo, useEffect, useRef, useState } from 'react'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react'
import type { MindmapNodeColor, MindmapNodeData } from '../../services/mindmapApi'
import { NODE_COLOR_MAP } from '../../utils/mindmapLayout'

export interface MindmapFlowNodeData extends MindmapNodeData {
  onLabelChange?: (id: string, label: string) => void
  editing?: boolean
  onFinishEdit?: (id: string) => void
}

export type MindmapFlowNode = Node<MindmapFlowNodeData, 'mindmapNode'>

function MindmapNodeComponent({
  id,
  data,
  selected,
  targetPosition,
  sourcePosition,
}: NodeProps<MindmapFlowNode>) {
  const [localEditing, setLocalEditing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const isEditing = localEditing || Boolean(data.editing)
  const colorKey: MindmapNodeColor =
    data.color && data.color in NODE_COLOR_MAP ? data.color : 'default'
  const palette = NODE_COLOR_MAP[colorKey]
  const isRoot = id === 'root'

  useEffect(() => {
    if (isEditing) {
      const timer = window.setTimeout(() => {
        inputRef.current?.focus()
        inputRef.current?.select()
      }, 10)
      return () => window.clearTimeout(timer)
    }
  }, [isEditing])

  const commit = () => {
    const raw = inputRef.current?.value ?? data.label ?? ''
    const trimmed = raw.trim() || 'Untitled'
    setLocalEditing(false)
    data.onLabelChange?.(id, trimmed)
    data.onFinishEdit?.(id)
  }

  const cancel = () => {
    setLocalEditing(false)
    data.onFinishEdit?.(id)
  }

  return (
    <Paper
      elevation={selected ? 4 : 1}
      onDoubleClick={(e) => {
        e.stopPropagation()
        setLocalEditing(true)
      }}
      sx={{
        minWidth: isRoot ? 160 : 120,
        maxWidth: 260,
        px: 2,
        py: 1.1,
        borderRadius: isRoot ? 3 : 2,
        bgcolor: palette.bg,
        border: '2px solid',
        borderColor: selected ? palette.accent : palette.border,
        boxShadow: selected ? `0 0 0 3px ${palette.accent}22` : undefined,
        cursor: isEditing ? 'text' : 'grab',
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
        position: 'relative',
      }}
    >
      {!isRoot && (
        <Handle
          type="target"
          position={targetPosition ?? Position.Left}
          style={{
            width: 8,
            height: 8,
            background: palette.accent,
            border: '2px solid #fff',
          }}
        />
      )}
      {isRoot && (
        <Handle
          id="left"
          type="source"
          position={Position.Left}
          style={{
            width: 8,
            height: 8,
            background: palette.accent,
            border: '2px solid #fff',
          }}
        />
      )}

      {isEditing ? (
        <Box
          component="input"
          key="editing"
          ref={inputRef}
          defaultValue={data.label || ''}
          onBlur={commit}
          onKeyDown={(e) => {
            e.stopPropagation()
            if (e.key === 'Enter') {
              e.preventDefault()
              commit()
            } else if (e.key === 'Escape') {
              e.preventDefault()
              cancel()
            }
          }}
          sx={{
            width: '100%',
            border: 'none',
            outline: 'none',
            bgcolor: 'transparent',
            fontFamily: 'inherit',
            fontSize: isRoot ? '0.95rem' : '0.875rem',
            fontWeight: isRoot ? 700 : 500,
            color: '#0f172a',
            p: 0,
          }}
        />
      ) : (
        <Typography
          variant="body2"
          sx={{
            fontSize: isRoot ? '0.95rem' : '0.875rem',
            fontWeight: isRoot ? 700 : 500,
            color: '#0f172a',
            wordBreak: 'break-word',
            textAlign: 'center',
            userSelect: 'none',
          }}
        >
          {data.label || 'Untitled'}
        </Typography>
      )}

      <Handle
        id={isRoot ? 'right' : undefined}
        type="source"
        position={isRoot ? Position.Right : (sourcePosition ?? Position.Right)}
        style={{
          width: 8,
          height: 8,
          background: palette.accent,
          border: '2px solid #fff',
        }}
      />
    </Paper>
  )
}

export default memo(MindmapNodeComponent)

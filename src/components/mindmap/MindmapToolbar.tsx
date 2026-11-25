import { useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { Link as RouterLink } from 'react-router'
import { ArrowLeftIcon, PlusIcon, StarFilledIcon, StarIcon, TrashIcon } from '../DocIcons'
import type { MindmapNodeColor } from '../../services/mindmapApi'
import { NODE_COLOR_MAP } from '../../utils/mindmapLayout'

interface MindmapToolbarProps {
  title: string
  onTitleChange: (title: string) => void
  isFavorite: boolean
  onToggleFavorite: () => void
  savingStatus: 'idle' | 'saving' | 'saved' | 'error'
  hasSelection: boolean
  canDeleteSelection: boolean
  selectedColor: MindmapNodeColor
  onAddChild: () => void
  onAddSibling: () => void
  onDeleteSelected: () => void
  onSelectColor: (color: MindmapNodeColor) => void
  onAutoLayout: (mode: 'BALANCED' | 'LR') => void
  onFitView: () => void
  onExportPng: () => void
  onExportMarkdown: () => void
  onExportJson: () => void
}

const COLOR_KEYS = Object.keys(NODE_COLOR_MAP) as MindmapNodeColor[]

export default function MindmapToolbar({
  title,
  onTitleChange,
  isFavorite,
  onToggleFavorite,
  savingStatus,
  hasSelection,
  canDeleteSelection,
  selectedColor,
  onAddChild,
  onAddSibling,
  onDeleteSelected,
  onSelectColor,
  onAutoLayout,
  onFitView,
  onExportPng,
  onExportMarkdown,
  onExportJson,
}: MindmapToolbarProps) {
  const [exportAnchor, setExportAnchor] = useState<null | HTMLElement>(null)

  return (
    <Paper
      elevation={0}
      square
      sx={{
        px: { xs: 1.5, sm: 2.5 },
        py: 1,
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        zIndex: 5,
      }}
    >
      <Stack
        direction="row"
        sx={{
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        {/* Left: Back, title, favorite, save status */}
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', minWidth: 0, flex: '1 1 220px' }}>
          <Tooltip title="Back to Mindmaps">
            <IconButton component={RouterLink} to="/admin/mindmaps" size="small">
              <ArrowLeftIcon />
            </IconButton>
          </Tooltip>

          <TextField
            size="small"
            variant="standard"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Untitled Mindmap"
            slotProps={{
              input: {
                disableUnderline: true,
                sx: { fontWeight: 700, fontSize: { xs: '0.95rem', sm: '1.05rem' } },
              },
            }}
            sx={{ minWidth: 120, maxWidth: 280, flex: 1 }}
          />

          <Tooltip title={isFavorite ? 'Remove favorite' : 'Mark favorite'}>
            <IconButton
              size="small"
              onClick={onToggleFavorite}
              sx={{ color: isFavorite ? 'warning.main' : 'action.disabled' }}
            >
              {isFavorite ? <StarFilledIcon /> : <StarIcon />}
            </IconButton>
          </Tooltip>

          {savingStatus === 'saving' && (
            <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
              Saving...
            </Typography>
          )}
          {savingStatus === 'error' && (
            <Typography variant="caption" color="error.main" sx={{ whiteSpace: 'nowrap' }}>
              Save failed
            </Typography>
          )}
        </Stack>

        {/* Right: Node & layout actions */}
        <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
          <Button
            size="small"
            variant="contained"
            startIcon={<PlusIcon sx={{ fontSize: 16 }} />}
            onClick={onAddChild}
            sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600 }}
          >
            Child
          </Button>

          {hasSelection && (
            <Button
              size="small"
              variant="outlined"
              onClick={onAddSibling}
              sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600 }}
            >
              + Sibling
            </Button>
          )}

          {hasSelection && (
            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', px: 0.5 }}>
              {COLOR_KEYS.map((key) => {
                const c = NODE_COLOR_MAP[key]
                const active = selectedColor === key
                return (
                  <Tooltip key={key} title={c.label}>
                    <Box
                      component="button"
                      type="button"
                      onClick={() => onSelectColor(key)}
                      aria-label={`Color ${c.label}`}
                      sx={{
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        bgcolor: c.accent,
                        border: active ? '2px solid #0f172a' : '2px solid transparent',
                        cursor: 'pointer',
                        p: 0,
                      }}
                    />
                  </Tooltip>
                )
              })}
            </Stack>
          )}

          {canDeleteSelection && (
            <Tooltip title="Delete selected node">
              <IconButton size="small" color="error" onClick={onDeleteSelected}>
                <TrashIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          )}

          <Button
            size="small"
            variant="outlined"
            onClick={() => onAutoLayout('BALANCED')}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Left & Right
          </Button>

          <Button
            size="small"
            variant="outlined"
            onClick={() => onAutoLayout('LR')}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Tree →
          </Button>

          <Button
            size="small"
            variant="text"
            onClick={onFitView}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Fit
          </Button>

          <Button
            size="small"
            variant="outlined"
            onClick={(e) => setExportAnchor(e.currentTarget)}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Export
          </Button>
          <Menu
            anchorEl={exportAnchor}
            open={Boolean(exportAnchor)}
            onClose={() => setExportAnchor(null)}
          >
            <MenuItem
              onClick={() => {
                setExportAnchor(null)
                onExportPng()
              }}
            >
              Export as PNG (.png)
            </MenuItem>
            <MenuItem
              onClick={() => {
                setExportAnchor(null)
                onExportMarkdown()
              }}
            >
              Export as Markdown (.md)
            </MenuItem>
            <MenuItem
              onClick={() => {
                setExportAnchor(null)
                onExportJson()
              }}
            >
              Export as JSON (.json)
            </MenuItem>
          </Menu>
        </Stack>
      </Stack>
    </Paper>
  )
}

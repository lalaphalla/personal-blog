import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { EditIcon, TrashIcon } from '../DocIcons'
import type { TaskItem } from '../../services/taskApi'

interface TaskRowProps {
  task: TaskItem
  isTrash?: boolean
  todayStr: string
  onToggle: (id: number) => void
  onEdit: (task: TaskItem) => void
  onDelete: (id: number) => void
  onRestore: (id: number) => void
  onPurge: (id: number) => void
}

const PRIORITY_COLORS = {
  high: 'error.main',
  medium: 'warning.main',
  low: 'text.disabled',
} as const

export default function TaskRow({
  task,
  isTrash = false,
  todayStr,
  onToggle,
  onEdit,
  onDelete,
  onRestore,
  onPurge,
}: TaskRowProps) {
  const isOverdue = Boolean(!task.is_completed && task.due_date && task.due_date < todayStr)

  return (
    <Paper
      elevation={0}
      sx={{
        px: 2,
        py: 1.5,
        borderRadius: 2.5,
        border: '1px solid',
        borderColor: isOverdue ? 'error.light' : 'divider',
        bgcolor: 'background.paper',
        opacity: task.is_completed ? 0.68 : 1,
      }}
    >
      <Stack direction="row" spacing={1.25} sx={{ alignItems: 'flex-start' }}>
        {!isTrash && (
          <Checkbox
            checked={task.is_completed}
            onChange={() => onToggle(task.id)}
            sx={{ p: 0.25, mt: 0.1 }}
          />
        )}

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: PRIORITY_COLORS[task.priority],
                flexShrink: 0,
              }}
            />
            <Typography
              variant="body1"
              sx={{
                fontWeight: 600,
                textDecoration: task.is_completed ? 'line-through' : 'none',
                wordBreak: 'break-word',
              }}
            >
              {task.title}
            </Typography>
          </Stack>

          {task.notes && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.35, whiteSpace: 'pre-line', wordBreak: 'break-word' }}
            >
              {task.notes}
            </Typography>
          )}

          <Stack
            direction="row"
            spacing={0.75}
            sx={{ mt: 0.75, alignItems: 'center', flexWrap: 'wrap', gap: 0.75 }}
          >
            <Chip size="small" label={task.project} variant="outlined" />
            {task.due_date && (
              <Chip
                size="small"
                label={task.due_date === todayStr ? 'Today' : task.due_date}
                color={isOverdue ? 'error' : task.due_date === todayStr ? 'primary' : 'default'}
                variant={isOverdue || task.due_date === todayStr ? 'filled' : 'outlined'}
              />
            )}
            {task.tags.map((tag) => (
              <Chip key={tag} size="small" label={`#${tag}`} />
            ))}
          </Stack>
        </Box>

        {isTrash ? (
          <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
            <Button size="small" onClick={() => onRestore(task.id)} sx={{ textTransform: 'none' }}>
              Restore
            </Button>
            <Button
              size="small"
              color="error"
              onClick={() => onPurge(task.id)}
              sx={{ textTransform: 'none' }}
            >
              Purge
            </Button>
          </Stack>
        ) : (
          <Stack direction="row" spacing={0.25} sx={{ flexShrink: 0 }}>
            <Tooltip title="Edit task">
              <IconButton size="small" onClick={() => onEdit(task)}>
                <EditIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Move to trash">
              <IconButton
                size="small"
                onClick={() => onDelete(task.id)}
                sx={{ color: 'action.disabled', '&:hover': { color: 'error.main' } }}
              >
                <TrashIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          </Stack>
        )}
      </Stack>
    </Paper>
  )
}

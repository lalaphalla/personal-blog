import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { EditIcon, TrashIcon } from '../DocIcons'
import type { HabitColor, HabitItem } from '../../services/habitApi'

interface HabitCardProps {
  habit: HabitItem
  onCheckin: (params: { id: number; log_date?: string; delta?: number }) => void
  onEdit: (habit: HabitItem) => void
  onToggleArchive: (habit: HabitItem) => void
  onDelete: (id: number) => void
}

const ACCENT_HEX: Record<HabitColor, string> = {
  primary: '#aa3bff',
  success: '#16a34a',
  info: '#0284c7',
  warning: '#d97706',
  error: '#dc2626',
  purple: '#9333ea',
}

function shortWeekday(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  return ['S', 'M', 'T', 'W', 'T', 'F', 'S'][dt.getDay()]
}

export default function HabitCard({
  habit,
  onCheckin,
  onEdit,
  onToggleArchive,
  onDelete,
}: HabitCardProps) {
  const accent = ACCENT_HEX[habit.color] ?? ACCENT_HEX.primary

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.25,
        borderRadius: 3,
        border: '1px solid',
        borderColor: habit.completed_today ? accent : 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Stack spacing={1.75}>
        {/* Header: Emoji, Name, Today Check-in */}
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
          <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', minWidth: 0 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: `${accent}1a`,
                display: 'grid',
                placeItems: 'center',
                fontSize: '1.25rem',
                flexShrink: 0,
              }}
            >
              {habit.emoji}
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle1" noWrap sx={{ fontWeight: 700, lineHeight: 1.25 }}>
                {habit.name}
              </Typography>
              {habit.description && (
                <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                  {habit.description}
                </Typography>
              )}
            </Box>
          </Stack>

          {!habit.is_archived && (
            habit.target_per_day > 1 ? (
              <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', flexShrink: 0 }}>
                <Button
                  size="small"
                  variant="outlined"
                  disabled={habit.today_count <= 0}
                  onClick={() => onCheckin({ id: habit.id, delta: -1 })}
                  sx={{ minWidth: 30, px: 0.75, borderRadius: 2 }}
                >
                  −
                </Button>
                <Chip
                  label={`${habit.today_count} / ${habit.target_per_day}`}
                  size="small"
                  sx={{
                    fontWeight: 700,
                    bgcolor: habit.completed_today ? accent : undefined,
                    color: habit.completed_today ? '#fff' : undefined,
                  }}
                />
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => onCheckin({ id: habit.id, delta: 1 })}
                  sx={{
                    minWidth: 30,
                    px: 0.75,
                    borderRadius: 2,
                    bgcolor: accent,
                    '&:hover': { bgcolor: accent },
                  }}
                >
                  +
                </Button>
              </Stack>
            ) : (
              <Button
                size="small"
                variant={habit.completed_today ? 'contained' : 'outlined'}
                onClick={() => onCheckin({ id: habit.id })}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 700,
                  flexShrink: 0,
                  ...(habit.completed_today
                    ? { bgcolor: accent, '&:hover': { bgcolor: accent } }
                    : { borderColor: accent, color: accent }),
                }}
              >
                {habit.completed_today ? 'Done ✓' : 'Check in'}
              </Button>
            )
          )}
        </Stack>

        {/* 7-day interactive strip */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 0.75,
          }}
        >
          {habit.last_7_days.map((day) => (
            <Tooltip
              key={day.date}
              title={`${day.date}: ${day.count}/${habit.target_per_day} (tap to toggle)`}
            >
              <Box
                component="button"
                type="button"
                onClick={() => onCheckin({ id: habit.id, log_date: day.date })}
                sx={{
                  border: '1px solid',
                  borderColor: day.completed ? accent : 'divider',
                  bgcolor: day.completed ? accent : day.scheduled ? 'action.hover' : 'transparent',
                  color: day.completed ? '#fff' : 'text.secondary',
                  borderRadius: 1.5,
                  py: 0.5,
                  cursor: 'pointer',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  opacity: day.scheduled || day.completed ? 1 : 0.45,
                }}
              >
                {shortWeekday(day.date)}
              </Box>
            </Tooltip>
          ))}
        </Box>

        {/* 30-day mini heatmap */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(30, 1fr)',
            gap: '3px',
          }}
        >
          {habit.last_30_days.map((day) => (
            <Tooltip key={day.date} title={`${day.date}: ${day.count}/${habit.target_per_day}`}>
              <Box
                sx={{
                  height: 8,
                  borderRadius: 0.5,
                  bgcolor: day.completed ? accent : 'action.hover',
                  opacity: day.completed ? 0.9 : day.scheduled ? 0.65 : 0.25,
                }}
              />
            </Tooltip>
          ))}
        </Box>

        {/* Footer: Streak, Rate, Actions */}
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              🔥 {habit.current_streak}d streak
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Best: {habit.best_streak}d · {habit.completion_rate_30d}% (30d)
            </Typography>
          </Stack>

          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
            <Button
              size="small"
              onClick={() => onToggleArchive(habit)}
              sx={{ textTransform: 'none', fontSize: '0.75rem', minWidth: 0, px: 1 }}
            >
              {habit.is_archived ? 'Unarchive' : 'Archive'}
            </Button>
            <Tooltip title="Edit habit">
              <IconButton size="small" onClick={() => onEdit(habit)}>
                <EditIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete habit">
              <IconButton
                size="small"
                onClick={() => onDelete(habit.id)}
                sx={{ color: 'action.disabled', '&:hover': { color: 'error.main' } }}
              >
                <TrashIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Stack>
    </Paper>
  )
}

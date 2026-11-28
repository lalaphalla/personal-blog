import { useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import type {
  HabitColor,
  HabitCreateInput,
  HabitItem,
  HabitUpdateInput,
} from '../../services/habitApi'

const EMOJI_PRESETS = ['✅', '💪', '📚', '🧠', '💧', '🏃', '🧘', '✍️', '🥗', '😴']
const COLOR_OPTIONS: Array<{ value: HabitColor; label: string; hex: string }> = [
  { value: 'primary', label: 'Primary', hex: '#aa3bff' },
  { value: 'success', label: 'Green', hex: '#16a34a' },
  { value: 'info', label: 'Blue', hex: '#0284c7' },
  { value: 'warning', label: 'Amber', hex: '#d97706' },
  { value: 'error', label: 'Red', hex: '#dc2626' },
  { value: 'purple', label: 'Purple', hex: '#9333ea' },
]
const WEEKDAYS = [
  { day: 0, label: 'Mon' },
  { day: 1, label: 'Tue' },
  { day: 2, label: 'Wed' },
  { day: 3, label: 'Thu' },
  { day: 4, label: 'Fri' },
  { day: 5, label: 'Sat' },
  { day: 6, label: 'Sun' },
]

interface HabitDialogProps {
  open: boolean
  onClose: () => void
  initialHabit?: HabitItem | null
  onSubmit: (payload: HabitCreateInput | HabitUpdateInput) => Promise<void>
  isSubmitting?: boolean
}

function HabitFormBody({
  onClose,
  initialHabit,
  onSubmit,
  isSubmitting = false,
}: Omit<HabitDialogProps, 'open'>) {
  const [name, setName] = useState(initialHabit?.name ?? '')
  const [description, setDescription] = useState(initialHabit?.description ?? '')
  const [emoji, setEmoji] = useState(initialHabit?.emoji ?? '✅')
  const [color, setColor] = useState<HabitColor>(initialHabit?.color ?? 'primary')
  const [targetPerDay, setTargetPerDay] = useState(initialHabit?.target_per_day ?? 1)
  const [scheduleDays, setScheduleDays] = useState<number[]>(
    initialHabit?.schedule_days ?? [],
  )

  const toggleDay = (d: number) => {
    setScheduleDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort((a, b) => a - b),
    )
  }

  const handleSave = async () => {
    if (!name.trim()) return
    await onSubmit({
      name: name.trim(),
      description: description.trim() || null,
      emoji: emoji.trim() || '✅',
      color,
      target_per_day: Math.max(1, Number(targetPerDay) || 1),
      schedule_days: scheduleDays,
    })
    onClose()
  }

  return (
    <>
      <DialogTitle sx={{ fontWeight: 700 }}>
        {initialHabit ? 'Edit Habit' : 'New Habit'}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            label="Habit Name"
            placeholder="e.g. Read 20 minutes, Workout, Drink water"
            fullWidth
            required
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <TextField
            label="Cue / Note (optional)"
            size="small"
            fullWidth
            placeholder="e.g. Right after morning coffee"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {/* Emoji Picker */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mb: 0.75 }}>
              ICON
            </Typography>
            <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', gap: 0.75 }}>
              {EMOJI_PRESETS.map((em) => (
                <Chip
                  key={em}
                  label={em}
                  variant={emoji === em ? 'filled' : 'outlined'}
                  color={emoji === em ? 'primary' : 'default'}
                  onClick={() => setEmoji(em)}
                />
              ))}
            </Stack>
          </Box>

          {/* Color & Daily Target */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { sm: 'center' } }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mb: 0.75 }}>
                COLOR
              </Typography>
              <Stack direction="row" spacing={1}>
                {COLOR_OPTIONS.map((c) => (
                  <Box
                    key={c.value}
                    component="button"
                    type="button"
                    onClick={() => setColor(c.value)}
                    aria-label={c.label}
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      bgcolor: c.hex,
                      border: color === c.value ? '3px solid' : '2px solid transparent',
                      borderColor: color === c.value ? 'text.primary' : 'transparent',
                      cursor: 'pointer',
                      p: 0,
                    }}
                  />
                ))}
              </Stack>
            </Box>

            <TextField
              label="Target / day"
              type="number"
              size="small"
              slotProps={{ htmlInput: { min: 1, max: 50 } }}
              value={targetPerDay}
              onChange={(e) => setTargetPerDay(Math.max(1, Number(e.target.value) || 1))}
              sx={{ width: 120 }}
            />
          </Stack>

          {/* Schedule Days */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mb: 0.75 }}>
              SCHEDULE ({scheduleDays.length === 0 ? 'Every day' : `${scheduleDays.length} days/week`})
            </Typography>
            <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', gap: 0.75 }}>
              <Chip
                size="small"
                label="Every day"
                variant={scheduleDays.length === 0 ? 'filled' : 'outlined'}
                color={scheduleDays.length === 0 ? 'primary' : 'default'}
                onClick={() => setScheduleDays([])}
              />
              {WEEKDAYS.map((w) => (
                <Chip
                  key={w.day}
                  size="small"
                  label={w.label}
                  variant={scheduleDays.includes(w.day) ? 'filled' : 'outlined'}
                  color={scheduleDays.includes(w.day) ? 'primary' : 'default'}
                  onClick={() => toggleDay(w.day)}
                />
              ))}
            </Stack>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none' }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={!name.trim() || isSubmitting}
          onClick={handleSave}
          sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600 }}
        >
          {isSubmitting ? 'Saving...' : initialHabit ? 'Save Changes' : 'Create Habit'}
        </Button>
      </DialogActions>
    </>
  )
}

export default function HabitDialog({ open, ...props }: HabitDialogProps) {
  return (
    <Dialog open={open} onClose={props.onClose} maxWidth="sm" fullWidth>
      {open && (
        <HabitFormBody key={props.initialHabit?.id ?? 'new'} {...props} />
      )}
    </Dialog>
  )
}

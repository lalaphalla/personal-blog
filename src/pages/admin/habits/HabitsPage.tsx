import { useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { HabitsIcon, PlusIcon } from '../../../components/DocIcons'
import HabitCard from '../../../components/habits/HabitCard'
import HabitDialog from '../../../components/habits/HabitDialog'
import EmptyState from '../../../components/notes/EmptyState'
import { useHabitMutations, useHabits } from '../../../hooks/useHabitQueries'
import type { HabitCreateInput, HabitItem, HabitUpdateInput } from '../../../services/habitApi'

export default function HabitsPage() {
  const [showArchived, setShowArchived] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingHabit, setEditingHabit] = useState<HabitItem | null>(null)

  const { data, isPending, isError } = useHabits(showArchived)
  const { create, update, checkin, remove } = useHabitMutations()

  const summary = data?.summary
  const items = data?.items ?? []

  const handleDialogSubmit = async (payload: HabitCreateInput | HabitUpdateInput) => {
    if (editingHabit) {
      await update.mutateAsync({ id: editingHabit.id, input: payload })
    } else {
      await create.mutateAsync(payload as HabitCreateInput)
    }
  }

  return (
    <Box sx={{ maxWidth: 960, mx: 'auto', px: { xs: 2, sm: 3 }, py: { xs: 2.5, sm: 4 } }}>
      <Stack spacing={3}>
        {/* Header */}
        <Stack
          direction="row"
          sx={{
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1.5,
          }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -0.5 }}>
              Habits
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Build consistency one day at a time.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1}>
            <Button
              variant={showArchived ? 'contained' : 'outlined'}
              onClick={() => setShowArchived((v) => !v)}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
            >
              {showArchived ? 'Active Habits' : 'Archived'}
            </Button>
            <Button
              variant="contained"
              startIcon={<PlusIcon />}
              onClick={() => {
                setEditingHabit(null)
                setDialogOpen(true)
              }}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
            >
              New Habit
            </Button>
          </Stack>
        </Stack>

        {/* Summary Strip */}
        {summary && !showArchived && (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(3, 1fr)' },
              gap: 1.5,
            }}
          >
            {[
              {
                label: 'Completed Today',
                value: `${summary.completed_today} / ${summary.scheduled_today}`,
                color: 'primary.main',
              },
              {
                label: 'Best Active Streak',
                value: `${summary.best_active_streak}d`,
                color: 'warning.main',
              },
              {
                label: '30-Day Consistency',
                value: `${summary.avg_rate_30d}%`,
                color: 'success.main',
              },
            ].map((stat) => (
              <Paper
                key={stat.label}
                elevation={0}
                sx={{
                  p: 1.75,
                  borderRadius: 2.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  {stat.label}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: stat.color, mt: 0.25 }}>
                  {stat.value}
                </Typography>
              </Paper>
            ))}
          </Box>
        )}

        {/* Habits Grid */}
        {isPending ? (
          <Stack sx={{ py: 10, alignItems: 'center' }}>
            <CircularProgress />
          </Stack>
        ) : isError ? (
          <EmptyState
            title="Unable to load habits"
            description="Please check your connection and try again."
          />
        ) : items.length === 0 ? (
          <EmptyState
            title={showArchived ? 'No archived habits' : 'No habits yet'}
            description={
              showArchived
                ? 'Archived habits will appear here.'
                : 'Create your first daily habit to start tracking streaks.'
            }
            icon={<HabitsIcon sx={{ fontSize: 28 }} />}
            action={
              !showArchived ? (
                <Button
                  variant="contained"
                  startIcon={<PlusIcon />}
                  onClick={() => {
                    setEditingHabit(null)
                    setDialogOpen(true)
                  }}
                  sx={{ mt: 1, borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                >
                  New Habit
                </Button>
              ) : undefined
            }
          />
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
              gap: 2,
            }}
          >
            {items.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                onCheckin={(params) => checkin.mutate(params)}
                onEdit={(h) => {
                  setEditingHabit(h)
                  setDialogOpen(true)
                }}
                onToggleArchive={(h) =>
                  update.mutate({ id: h.id, input: { is_archived: !h.is_archived } })
                }
                onDelete={(id) => remove.mutate(id)}
              />
            ))}
          </Box>
        )}
      </Stack>

      <HabitDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        initialHabit={editingHabit}
        onSubmit={handleDialogSubmit}
        isSubmitting={create.isPending || update.isPending}
      />
    </Box>
  )
}

import { useMemo, useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import InputAdornment from '@mui/material/InputAdornment'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { SearchIcon, TasksIcon } from '../../../components/DocIcons'
import EmptyState from '../../../components/notes/EmptyState'
import TaskDialog from '../../../components/tasks/TaskDialog'
import TaskQuickAdd from '../../../components/tasks/TaskQuickAdd'
import TaskRow from '../../../components/tasks/TaskRow'
import { useTaskList, useTaskMutations, useTaskStats } from '../../../hooks/useTaskQueries'
import type { TaskItem, TaskView } from '../../../services/taskApi'

function getTodayIso(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export default function TasksPage() {
  const [view, setView] = useState<TaskView>('today')
  const [selectedProject, setSelectedProject] = useState<string | undefined>(undefined)
  const [search, setSearch] = useState('')
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null)

  const todayStr = getTodayIso()
  const { data: stats } = useTaskStats()
  const { data, isPending, isError } = useTaskList({
    view,
    project: selectedProject,
    q: search.trim() || undefined,
  })

  const { create, update, toggle, softDelete, restore, purge } = useTaskMutations()

  const items = useMemo(() => data?.items ?? [], [data?.items])
  const existingProjects = useMemo(
    () => (stats?.projects ?? []).map((p) => p.name),
    [stats],
  )

  const overdueTasks = useMemo(
    () => (view === 'today' ? items.filter((t) => t.due_date && t.due_date < todayStr) : []),
    [items, todayStr, view],
  )
  const todayTasks = useMemo(
    () => (view === 'today' ? items.filter((t) => !t.due_date || t.due_date >= todayStr) : items),
    [items, todayStr, view],
  )

  const summaryCards: Array<{
    key: TaskView
    label: string
    value: number
    accent: string
  }> = [
    { key: 'today', label: 'Today', value: stats?.today ?? 0, accent: 'primary.main' },
    { key: 'upcoming', label: 'Upcoming', value: stats?.upcoming ?? 0, accent: 'info.main' },
    { key: 'all', label: 'All Open', value: stats?.all_open ?? 0, accent: 'warning.main' },
    { key: 'completed', label: 'Completed', value: stats?.completed ?? 0, accent: 'success.main' },
  ]

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', px: { xs: 2, sm: 3 }, py: { xs: 2.5, sm: 4 } }}>
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
              Tasks
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Stay focused on today, plan ahead, and check things off.
            </Typography>
          </Box>

          <Button
            size="small"
            variant={view === 'trash' ? 'contained' : 'outlined'}
            color={view === 'trash' ? 'error' : 'inherit'}
            onClick={() => setView(view === 'trash' ? 'today' : 'trash')}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            {view === 'trash' ? 'Back to Today' : 'Trash'}
          </Button>
        </Stack>

        {/* Apple Reminders-style 2x2 Summary Cards */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
            gap: 1.5,
          }}
        >
          {summaryCards.map((card) => {
            const active = view === card.key
            return (
              <Paper
                key={card.key}
                elevation={0}
                onClick={() => setView(card.key)}
                sx={{
                  p: 1.75,
                  borderRadius: 2.5,
                  border: '2px solid',
                  borderColor: active ? card.accent : 'divider',
                  bgcolor: 'background.paper',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s ease',
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                  {card.label}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: card.accent, mt: 0.25 }}>
                  {card.value}
                </Typography>
              </Paper>
            )
          })}
        </Box>

        {/* Quick Add */}
        {view !== 'completed' && view !== 'trash' && (
          <TaskQuickAdd
            onAdd={async (input) => {
              await create.mutateAsync(input)
            }}
            defaultProject={selectedProject ?? 'Inbox'}
            existingProjects={existingProjects}
            isSubmitting={create.isPending}
          />
        )}

        {/* Project Filter + Search */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}
        >
          <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', gap: 0.75 }}>
            <Chip
              size="small"
              label="All Projects"
              variant={selectedProject === undefined ? 'filled' : 'outlined'}
              color={selectedProject === undefined ? 'primary' : 'default'}
              onClick={() => setSelectedProject(undefined)}
            />
            {(stats?.projects ?? []).map((proj) => (
              <Chip
                key={proj.name}
                size="small"
                label={`${proj.name} (${proj.open_count})`}
                variant={selectedProject === proj.name ? 'filled' : 'outlined'}
                color={selectedProject === proj.name ? 'primary' : 'default'}
                onClick={() => setSelectedProject(proj.name)}
              />
            ))}
          </Stack>

          <TextField
            size="small"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ width: { xs: '100%', sm: 240 } }}
          />
        </Stack>

        {/* Task List */}
        {isPending ? (
          <Stack sx={{ py: 8, alignItems: 'center' }}>
            <CircularProgress />
          </Stack>
        ) : isError ? (
          <EmptyState
            title="Unable to load tasks"
            description="Please check your connection and try again."
          />
        ) : items.length === 0 ? (
          <EmptyState
            title={
              view === 'today'
                ? 'Nothing due today!'
                : view === 'trash'
                  ? 'Trash is empty'
                  : 'No tasks found'
            }
            description={
              view === 'today'
                ? 'Add a task above or check Upcoming / All Open.'
                : 'Tasks matching your filter will appear here.'
            }
            icon={<TasksIcon sx={{ fontSize: 28 }} />}
          />
        ) : (
          <Stack spacing={2.5}>
            {overdueTasks.length > 0 && (
              <Stack spacing={1}>
                <Typography variant="subtitle2" color="error.main" sx={{ fontWeight: 700 }}>
                  Overdue ({overdueTasks.length})
                </Typography>
                {overdueTasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    todayStr={todayStr}
                    onToggle={(id) => toggle.mutate(id)}
                    onEdit={setEditingTask}
                    onDelete={(id) => softDelete.mutate(id)}
                    onRestore={(id) => restore.mutate(id)}
                    onPurge={(id) => purge.mutate(id)}
                  />
                ))}
              </Stack>
            )}

            {todayTasks.length > 0 && (
              <Stack spacing={1}>
                {overdueTasks.length > 0 && (
                  <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 700 }}>
                    Due Today ({todayTasks.length})
                  </Typography>
                )}
                {todayTasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    isTrash={view === 'trash'}
                    todayStr={todayStr}
                    onToggle={(id) => toggle.mutate(id)}
                    onEdit={setEditingTask}
                    onDelete={(id) => softDelete.mutate(id)}
                    onRestore={(id) => restore.mutate(id)}
                    onPurge={(id) => purge.mutate(id)}
                  />
                ))}
              </Stack>
            )}
          </Stack>
        )}
      </Stack>

      <TaskDialog
        open={Boolean(editingTask)}
        task={editingTask}
        onClose={() => setEditingTask(null)}
        existingProjects={existingProjects}
        onSave={async (id, input) => {
          await update.mutateAsync({ id, input })
        }}
        isSubmitting={update.isPending}
      />
    </Box>
  )
}

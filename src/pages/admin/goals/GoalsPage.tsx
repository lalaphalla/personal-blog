import { useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Checkbox from '@mui/material/Checkbox'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Divider from '@mui/material/Divider'
import FormControl from '@mui/material/FormControl'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import InputLabel from '@mui/material/InputLabel'
import LinearProgress from '@mui/material/LinearProgress'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import { useGoalMutations, useGoals } from '../../../hooks/useGoalQueries'
import type {
  GoalColor,
  GoalCreateInput,
  GoalItem,
  GoalStatus,
} from '../../../services/goalApi'

const CATEGORIES = ['General', 'Career', 'Learning', 'Health', 'Personal', 'Finance']
const COLORS: Array<{ value: GoalColor; label: string }> = [
  { value: 'primary', label: 'Blue' },
  { value: 'success', label: 'Green' },
  { value: 'warning', label: 'Amber' },
  { value: 'error', label: 'Red' },
  { value: 'info', label: 'Cyan' },
  { value: 'purple', label: 'Purple' },
]

function getColorHex(color: GoalColor): string {
  switch (color) {
    case 'success':
      return '#2e7d32'
    case 'warning':
      return '#ed6c02'
    case 'error':
      return '#d32f2f'
    case 'info':
      return '#0288d1'
    case 'purple':
      return '#7b1fa2'
    default:
      return '#1976d2'
  }
}

interface GoalFormState {
  title: string
  description: string
  category: string
  color: GoalColor
  timeframe: string
  target_date: string
  status: GoalStatus
  manual_progress: number
  initialMilestonesText: string
}

const EMPTY_FORM: GoalFormState = {
  title: '',
  description: '',
  category: 'General',
  color: 'primary',
  timeframe: '',
  target_date: '',
  status: 'active',
  manual_progress: 0,
  initialMilestonesText: '',
}

function GoalCard({
  goal,
  onEdit,
  onDelete,
  onToggleMilestone,
  onAddMilestone,
  onDeleteMilestone,
  busy,
}: {
  goal: GoalItem
  onEdit: (goal: GoalItem) => void
  onDelete: (id: number) => void
  onToggleMilestone: (goalId: number, milestoneId: number) => void
  onAddMilestone: (goalId: number, title: string) => void
  onDeleteMilestone: (goalId: number, milestoneId: number) => void
  busy: boolean
}) {
  const [newMilestone, setNewMilestone] = useState('')
  const accent = getColorHex(goal.color)

  const handleAdd = () => {
    const trimmed = newMilestone.trim()
    if (!trimmed) return
    onAddMilestone(goal.id, trimmed)
    setNewMilestone('')
  }

  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderTop: `3px solid ${accent}`,
      }}
    >
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {/* Top Row */}
        <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
          <Box sx={{ minWidth: 0 }}>
            <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', gap: 0.5, mb: 0.75 }}>
              <Chip label={goal.category} size="small" variant="outlined" />
              {goal.timeframe && (
                <Chip label={goal.timeframe} size="small" color="primary" variant="outlined" />
              )}
              {goal.target_date && (
                <Chip label={`Due ${goal.target_date}`} size="small" variant="outlined" />
              )}
              {goal.status !== 'active' && (
                <Chip
                  label={goal.status}
                  size="small"
                  color={goal.status === 'completed' ? 'success' : 'default'}
                />
              )}
            </Stack>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.25 }}>
              {goal.title}
            </Typography>
            {goal.description && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {goal.description}
              </Typography>
            )}
          </Box>

          <Stack direction="row" spacing={0.25} sx={{ flexShrink: 0 }}>
            <IconButton size="small" onClick={() => onEdit(goal)} aria-label="Edit goal">
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={() => onDelete(goal.id)}
              disabled={busy}
              aria-label="Delete goal"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Stack>

        {/* Progress */}
        <Box>
          <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              {goal.milestones_total > 0
                ? `${goal.milestones_done}/${goal.milestones_total} milestones`
                : 'Manual progress'}
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              {goal.progress}%
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={goal.progress}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: 'action.hover',
              '& .MuiLinearProgress-bar': { bgcolor: accent, borderRadius: 4 },
            }}
          />
        </Box>

        <Divider />

        {/* Milestones */}
        <Stack spacing={0.5} sx={{ flex: 1 }}>
          {goal.milestones.map((m) => (
            <Stack
              key={m.id}
              direction="row"
              spacing={0.5}
              sx={{ alignItems: 'center' }}
            >
              <Checkbox
                size="small"
                checked={m.is_done}
                disabled={busy}
                onChange={() => onToggleMilestone(goal.id, m.id)}
                sx={{ p: 0.5 }}
              />
              <Typography
                variant="body2"
                sx={{
                  flex: 1,
                  minWidth: 0,
                  textDecoration: m.is_done ? 'line-through' : 'none',
                  color: m.is_done ? 'text.secondary' : 'text.primary',
                }}
              >
                {m.title}
              </Typography>
              <IconButton
                size="small"
                onClick={() => onDeleteMilestone(goal.id, m.id)}
                disabled={busy}
                aria-label="Delete milestone"
                sx={{ opacity: 0.6, '&:hover': { opacity: 1 } }}
              >
                <DeleteIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Stack>
          ))}
        </Stack>

        {/* Quick add milestone */}
        <Stack direction="row" spacing={1} sx={{ pt: 0.5 }}>
          <TextField
            size="small"
            fullWidth
            placeholder="Add milestone…"
            value={newMilestone}
            onChange={(e) => setNewMilestone(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAdd()
              }
            }}
          />
          <Button
            size="small"
            variant="outlined"
            disabled={!newMilestone.trim() || busy}
            onClick={handleAdd}
          >
            Add
          </Button>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default function GoalsPage() {
  const [statusTab, setStatusTab] = useState<GoalStatus | 'all'>('active')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<GoalItem | null>(null)
  const [form, setForm] = useState<GoalFormState>(EMPTY_FORM)

  const goalsQuery = useGoals(statusTab)
  const mutations = useGoalMutations()

  const summary = goalsQuery.data?.summary
  const items = goalsQuery.data?.items ?? []

  const openCreate = () => {
    setEditingGoal(null)
    setForm(EMPTY_FORM)
    setDialogOpen(true)
  }

  const openEdit = (goal: GoalItem) => {
    setEditingGoal(goal)
    setForm({
      title: goal.title,
      description: goal.description ?? '',
      category: goal.category,
      color: goal.color,
      timeframe: goal.timeframe ?? '',
      target_date: goal.target_date ?? '',
      status: goal.status,
      manual_progress: goal.manual_progress ?? goal.progress,
      initialMilestonesText: '',
    })
    setDialogOpen(true)
  }

  const handleSave = () => {
    if (!form.title.trim()) return

    if (editingGoal) {
      mutations.update.mutate(
        {
          id: editingGoal.id,
          input: {
            title: form.title.trim(),
            description: form.description.trim() || null,
            category: form.category,
            color: form.color,
            timeframe: form.timeframe.trim() || null,
            target_date: form.target_date || null,
            status: form.status,
            manual_progress:
              editingGoal.milestones_total === 0 ? form.manual_progress : null,
          },
        },
        { onSuccess: () => setDialogOpen(false) },
      )
      return
    }

    const milestones = form.initialMilestonesText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((title, index) => ({ title, position: index }))

    const payload: GoalCreateInput = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      category: form.category,
      color: form.color,
      timeframe: form.timeframe.trim() || null,
      target_date: form.target_date || null,
      status: form.status,
      manual_progress: milestones.length === 0 ? form.manual_progress : null,
      milestones,
    }

    mutations.create.mutate(payload, {
      onSuccess: () => setDialogOpen(false),
    })
  }

  const busy =
    mutations.create.isPending ||
    mutations.update.isPending ||
    mutations.remove.isPending ||
    mutations.createMilestone.isPending ||
    mutations.toggle.isPending ||
    mutations.removeMilestone.isPending

  return (
    <Stack spacing={3}>
      {/* Header */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Goals &amp; Milestones
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track quarterly and yearly outcomes above your daily habits and tasks.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          New Goal
        </Button>
      </Stack>

      {/* Summary KPIs */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Active Goals
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.5 }}>
                {summary?.active ?? 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Avg Progress
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.5 }}>
                {summary?.avg_progress ?? 0}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Completed
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.5 }}>
                {summary?.completed ?? 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Paused
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.5 }}>
                {summary?.paused ?? 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Status Filter Tabs */}
      <Tabs
        value={statusTab}
        onChange={(_, val: GoalStatus | 'all') => setStatusTab(val)}
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label={`Active (${summary?.active ?? 0})`} value="active" />
        <Tab label={`Completed (${summary?.completed ?? 0})`} value="completed" />
        <Tab label={`Paused (${summary?.paused ?? 0})`} value="paused" />
        <Tab label={`All (${summary?.total ?? 0})`} value="all" />
      </Tabs>

      {/* Goals Grid */}
      {goalsQuery.isPending ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : items.length === 0 ? (
        <Card variant="outlined">
          <CardContent sx={{ py: 5, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              No goals in this view
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Create a quarterly or yearly goal and break it down into milestones.
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
              Create your first goal
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {items.map((goal) => (
            <Grid key={goal.id} size={{ xs: 12, md: 6 }}>
              <GoalCard
                goal={goal}
                onEdit={openEdit}
                onDelete={(id) => mutations.remove.mutate(id)}
                onToggleMilestone={(goalId, milestoneId) =>
                  mutations.toggle.mutate({ goalId, milestoneId })
                }
                onAddMilestone={(goalId, title) =>
                  mutations.createMilestone.mutate({ goalId, input: { title } })
                }
                onDeleteMilestone={(goalId, milestoneId) =>
                  mutations.removeMilestone.mutate({ goalId, milestoneId })
                }
                busy={busy}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create / Edit Goal Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingGoal ? 'Edit Goal' : 'New Goal'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Goal Title"
              required
              fullWidth
              autoFocus
              placeholder="e.g. Pass HSK 4 Chinese"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              minRows={2}
              placeholder="Why does this goal matter?"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Category</InputLabel>
                  <Select
                    label="Category"
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  >
                    {CATEGORIES.map((c) => (
                      <MenuItem key={c} value={c}>
                        {c}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Color</InputLabel>
                  <Select
                    label="Color"
                    value={form.color}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, color: e.target.value as GoalColor }))
                    }
                  >
                    {COLORS.map((c) => (
                      <MenuItem key={c.value} value={c.value}>
                        {c.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid size={{ xs: 4 }}>
                <TextField
                  label="Timeframe"
                  size="small"
                  fullWidth
                  placeholder="2026-Q4"
                  value={form.timeframe}
                  onChange={(e) => setForm((f) => ({ ...f, timeframe: e.target.value }))}
                />
              </Grid>
              <Grid size={{ xs: 4 }}>
                <TextField
                  label="Target Date"
                  type="date"
                  size="small"
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                  value={form.target_date}
                  onChange={(e) => setForm((f) => ({ ...f, target_date: e.target.value }))}
                />
              </Grid>
              <Grid size={{ xs: 4 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    label="Status"
                    value={form.status}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, status: e.target.value as GoalStatus }))
                    }
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="paused">Paused</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {(!editingGoal || editingGoal.milestones_total === 0) && (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Manual Progress (used when no milestones exist): {form.manual_progress}%
                </Typography>
                <Slider
                  value={form.manual_progress}
                  onChange={(_, val) =>
                    setForm((f) => ({ ...f, manual_progress: val as number }))
                  }
                  min={0}
                  max={100}
                  step={5}
                />
              </Box>
            )}

            {!editingGoal && (
              <TextField
                label="Initial Milestones (one per line, optional)"
                fullWidth
                multiline
                minRows={3}
                placeholder={'Finish textbook chapters 1-10\nComplete 5 mock exams\nRegister for exam'}
                value={form.initialMilestonesText}
                onChange={(e) =>
                  setForm((f) => ({ ...f, initialMilestonesText: e.target.value }))
                }
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!form.title.trim() || mutations.create.isPending || mutations.update.isPending}
          >
            {editingGoal ? 'Save' : 'Create Goal'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}

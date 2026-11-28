import { useQuery } from '@tanstack/react-query'
import { Link as RouterLink } from 'react-router'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Checkbox from '@mui/material/Checkbox'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import LinearProgress from '@mui/material/LinearProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import AddIcon from '@mui/icons-material/Add'
import EditNoteIcon from '@mui/icons-material/EditNote'
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment'
import PsychologyIcon from '@mui/icons-material/Psychology'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import RemoveIcon from '@mui/icons-material/Remove'
import SettingsIcon from '@mui/icons-material/Settings'
import TaskAltIcon from '@mui/icons-material/TaskAlt'
import { adminListPosts } from '../../services/adminApi'
import { useTaskList, useTaskMutations, useTaskStats } from '../../hooks/useTaskQueries'
import { useHabitMutations, useHabits } from '../../hooks/useHabitQueries'
import { useGoals } from '../../hooks/useGoalQueries'
import { useExpenses } from '../../hooks/useExpenseQueries'
import { useRecallStats } from '../../hooks/useRecallQueries'
import { useTodayJournal } from '../../hooks/useJournalQueries'
import TodayQuoteCard from '../../components/quotes/TodayQuoteCard'
import { getLocalTodayDateString } from '../../utils/journal'

function StatCard({
  label,
  value,
  sublabel,
  to,
  loading,
}: {
  label: string
  value: string | number
  sublabel?: string
  to?: string
  loading: boolean
}) {
  const content = (
    <CardContent sx={{ height: '100%' }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      {loading ? (
        <CircularProgress size={24} sx={{ mt: 1 }} />
      ) : (
        <>
          <Typography variant="h4" sx={{ mt: 0.5, fontWeight: 700 }}>
            {value}
          </Typography>
          {sublabel && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
              {sublabel}
            </Typography>
          )}
        </>
      )}
    </CardContent>
  )

  return (
    <Card
      variant="outlined"
      component={to ? RouterLink : 'div'}
      to={to}
      sx={{
        height: '100%',
        textDecoration: 'none',
        color: 'inherit',
        display: 'block',
        transition: 'border-color 0.15s ease, background-color 0.15s ease',
        ...(to
          ? {
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'action.hover',
              },
            }
          : {}),
      }}
    >
      {content}
    </Card>
  )
}

function DashboardPage() {
  const todayStr = getLocalTodayDateString()

  // Productivity & personal modules
  const taskStats = useTaskStats()
  const todayTasks = useTaskList({ view: 'today' })
  const taskMutations = useTaskMutations()

  const habitsQuery = useHabits(false)
  const habitMutations = useHabitMutations()

  const recallStats = useRecallStats()
  const journalToday = useTodayJournal(todayStr)
  const activeGoals = useGoals('active')
  const monthExpenses = useExpenses(todayStr.slice(0, 7))

  // Blog posts
  const allPosts = useQuery({
    queryKey: ['admin', 'posts', { limit: 1 }],
    queryFn: () => adminListPosts({ limit: 1 }),
  })
  const drafts = useQuery({
    queryKey: ['admin', 'posts', { status: 'draft', limit: 1 }],
    queryFn: () => adminListPosts({ status: 'draft', limit: 1 }),
  })
  const published = useQuery({
    queryKey: ['admin', 'posts', { status: 'published', limit: 1 }],
    queryFn: () => adminListPosts({ status: 'published', limit: 1 }),
  })
  const recentPosts = useQuery({
    queryKey: ['admin', 'posts', { limit: 5 }],
    queryFn: () => adminListPosts({ limit: 5 }),
  })

  const scheduledHabits =
    habitsQuery.data?.items.filter((h) => h.is_scheduled_today) ?? []
  const visibleHabits =
    scheduledHabits.length > 0 ? scheduledHabits : (habitsQuery.data?.items ?? [])
  const habitSummary = habitsQuery.data?.summary

  const todayTaskItems = todayTasks.data?.items ?? []
  const todayJournalEntries = journalToday.data?.entries ?? []

  return (
    <Stack spacing={3}>
      {/* Header & Quick Actions */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Today
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {todayStr} — Your daily command center
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<EditNoteIcon />}
            component={RouterLink}
            to="/admin/journal/new"
          >
            Journal
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<PsychologyIcon />}
            component={RouterLink}
            to="/admin/recall"
          >
            Review Recall
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<SettingsIcon />}
            component={RouterLink}
            to="/admin/settings"
          >
            Settings
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            component={RouterLink}
            to="/admin/posts/new"
          >
            New post
          </Button>
        </Stack>
      </Stack>

      {/* Top KPI Summary Row */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            label="Tasks Due Today"
            value={taskStats.data?.today ?? 0}
            sublabel={
              taskStats.data?.overdue
                ? `${taskStats.data.overdue} overdue`
                : `${taskStats.data?.all_open ?? 0} open total`
            }
            to="/admin/tasks"
            loading={taskStats.isPending}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            label="Habits Today"
            value={
              habitSummary
                ? `${habitSummary.completed_today}/${habitSummary.scheduled_today}`
                : '0/0'
            }
            sublabel={
              habitSummary
                ? `Best streak: ${habitSummary.best_active_streak}d`
                : undefined
            }
            to="/admin/habits"
            loading={habitsQuery.isPending}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            label="Recall Due"
            value={recallStats.data?.due_today ?? 0}
            sublabel={
              recallStats.data
                ? `Reviewed ${recallStats.data.reviewed_today} today · ${recallStats.data.streak_days}d streak`
                : undefined
            }
            to="/admin/recall"
            loading={recallStats.isPending}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            label="Journal Today"
            value={todayJournalEntries.length}
            sublabel={
              todayJournalEntries.length > 0
                ? 'Entries logged today'
                : 'No entry yet today'
            }
            to="/admin/journal"
            loading={journalToday.isPending}
          />
        </Grid>
      </Grid>

      {/* Interactive Today Focus: Tasks & Habits */}
      <Grid container spacing={2}>
        {/* Tasks Due Today */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Stack
                direction="row"
                sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}
              >
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <TaskAltIcon color="primary" fontSize="small" />
                  <Typography variant="h6">Tasks Due Today</Typography>
                </Stack>
                <Button size="small" component={RouterLink} to="/admin/tasks">
                  View all
                </Button>
              </Stack>

              {todayTasks.isPending ? (
                <CircularProgress size={24} />
              ) : todayTaskItems.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                  No tasks due today. Enjoy the clear queue!
                </Typography>
              ) : (
                <Stack divider={<Divider flexItem />} spacing={0.5}>
                  {todayTaskItems.slice(0, 6).map((task) => {
                    const isOverdue = Boolean(task.due_date && task.due_date < todayStr && !task.is_completed)
                    return (
                      <Stack
                        key={task.id}
                        direction="row"
                        spacing={1}
                        sx={{ alignItems: 'center', py: 0.75 }}
                      >
                        <Checkbox
                          size="small"
                          checked={task.is_completed}
                          disabled={taskMutations.toggle.isPending}
                          onChange={() => taskMutations.toggle.mutate(task.id)}
                          sx={{ p: 0.5 }}
                        />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            variant="body2"
                            noWrap
                            sx={{
                              textDecoration: task.is_completed ? 'line-through' : 'none',
                              color: task.is_completed ? 'text.secondary' : 'text.primary',
                            }}
                          >
                            {task.title}
                          </Typography>
                        </Box>
                        {isOverdue && (
                          <Chip label="Overdue" size="small" color="error" variant="outlined" />
                        )}
                        {task.priority === 'high' && !task.is_completed && (
                          <Chip label="High" size="small" color="warning" variant="outlined" />
                        )}
                      </Stack>
                    )
                  })}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Habits Today */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Stack
                direction="row"
                sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}
              >
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <LocalFireDepartmentIcon color="warning" fontSize="small" />
                  <Typography variant="h6">Habits Today</Typography>
                </Stack>
                <Button size="small" component={RouterLink} to="/admin/habits">
                  Manage
                </Button>
              </Stack>

              {habitsQuery.isPending ? (
                <CircularProgress size={24} />
              ) : visibleHabits.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                  No active habits yet. Create one to start building streaks.
                </Typography>
              ) : (
                <Stack divider={<Divider flexItem />} spacing={0.5}>
                  {visibleHabits.slice(0, 6).map((habit) => {
                    const isSingle = habit.target_per_day <= 1
                    return (
                      <Stack
                        key={habit.id}
                        direction="row"
                        spacing={1.5}
                        sx={{ alignItems: 'center', py: 0.75 }}
                      >
                        <Typography sx={{ fontSize: '1.15rem', lineHeight: 1 }}>
                          {habit.emoji}
                        </Typography>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            variant="body2"
                            noWrap
                            sx={{
                              fontWeight: habit.completed_today ? 600 : 400,
                              color: habit.completed_today ? 'success.main' : 'text.primary',
                            }}
                          >
                            {habit.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {habit.current_streak}d streak
                            {!isSingle && ` · ${habit.today_count}/${habit.target_per_day}`}
                          </Typography>
                        </Box>

                        {isSingle ? (
                          <IconButton
                            size="small"
                            color={habit.completed_today ? 'success' : 'default'}
                            disabled={habitMutations.checkin.isPending}
                            onClick={() =>
                              habitMutations.checkin.mutate({
                                id: habit.id,
                                delta: habit.completed_today ? -1 : 1,
                              })
                            }
                            aria-label={`Toggle ${habit.name}`}
                          >
                            {habit.completed_today ? (
                              <TaskAltIcon />
                            ) : (
                              <RadioButtonUncheckedIcon />
                            )}
                          </IconButton>
                        ) : (
                          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                            <IconButton
                              size="small"
                              disabled={habit.today_count <= 0 || habitMutations.checkin.isPending}
                              onClick={() =>
                                habitMutations.checkin.mutate({ id: habit.id, delta: -1 })
                              }
                              aria-label={`Decrement ${habit.name}`}
                            >
                              <RemoveIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              color={habit.completed_today ? 'success' : 'primary'}
                              disabled={habitMutations.checkin.isPending}
                              onClick={() =>
                                habitMutations.checkin.mutate({ id: habit.id, delta: 1 })
                              }
                              aria-label={`Increment ${habit.name}`}
                            >
                              <AddIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        )}
                      </Stack>
                    )
                  })}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Reflection Row: Daily Quote & Today's Journal */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <TodayQuoteCard />
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Stack
                direction="row"
                sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}
              >
                <Typography variant="h6">Today&apos;s Journal</Typography>
                <Button size="small" component={RouterLink} to="/admin/journal/new">
                  Write entry
                </Button>
              </Stack>

              {journalToday.isPending ? (
                <CircularProgress size={24} />
              ) : todayJournalEntries.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
                  You haven&apos;t logged a journal entry today. Take a minute to capture a highlight or reflection.
                </Typography>
              ) : (
                <Stack spacing={1}>
                  {todayJournalEntries.slice(0, 3).map((entry) => (
                    <Box
                      key={entry.id}
                      component={RouterLink}
                      to={`/admin/journal/${entry.id}`}
                      sx={{
                        display: 'block',
                        p: 1.25,
                        borderRadius: 1,
                        border: 1,
                        borderColor: 'divider',
                        textDecoration: 'none',
                        color: 'inherit',
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                    >
                      <Stack
                        direction="row"
                        sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 0.25 }}
                      >
                        <Typography variant="subtitle2" noWrap>
                          {entry.title || 'Untitled entry'}
                        </Typography>
                        {entry.mood && (
                          <Chip label={entry.mood} size="small" variant="outlined" />
                        )}
                      </Stack>
                      {entry.excerpt && (
                        <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                          {entry.excerpt}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Active Goals Widget */}
      <Card variant="outlined">
        <CardContent>
          <Stack
            direction="row"
            sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}
          >
            <Typography variant="h6">Active Goals</Typography>
            <Button size="small" component={RouterLink} to="/admin/goals">
              Manage goals
            </Button>
          </Stack>

          {activeGoals.isPending ? (
            <CircularProgress size={24} />
          ) : (activeGoals.data?.items.length ?? 0) === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No active goals yet. Set a quarterly or yearly target to track milestones.
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {activeGoals.data?.items.slice(0, 3).map((goal) => (
                <Grid key={goal.id} size={{ xs: 12, md: 4 }}>
                  <Box
                    component={RouterLink}
                    to="/admin/goals"
                    sx={{
                      display: 'block',
                      p: 1.5,
                      borderRadius: 1.5,
                      border: 1,
                      borderColor: 'divider',
                      textDecoration: 'none',
                      color: 'inherit',
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                  >
                    <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.75, gap: 1 }}>
                      <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600 }}>
                        {goal.title}
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700, flexShrink: 0 }}>
                        {goal.progress}%
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={goal.progress}
                      sx={{ height: 6, borderRadius: 3, mb: 0.75 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {goal.milestones_total > 0
                        ? `${goal.milestones_done}/${goal.milestones_total} milestones`
                        : goal.timeframe || goal.category}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Active Goals & Expenses Row */}
      <Card variant="outlined">
        <CardContent>
          <Stack
            direction="row"
            sx={{ alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}
          >
            <Box>
              <Typography variant="h6">Expenses ({todayStr.slice(0, 7)})</Typography>
              <Typography variant="body2" color="text.secondary">
                {monthExpenses.isPending
                  ? 'Loading…'
                  : `Today: $${(monthExpenses.data?.summary.today_total ?? 0).toFixed(2)} · Month: $${(monthExpenses.data?.summary.month_total ?? 0).toFixed(2)} (${monthExpenses.data?.summary.count ?? 0} entries)`}
              </Typography>
            </Box>
            <Button size="small" variant="outlined" component={RouterLink} to="/admin/expenses">
              Log expense
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Blog Publishing Summary */}
      <Box>
        <Stack
          direction="row"
          sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}
        >
          <Typography variant="h6">Blog Publishing</Typography>
          <Button size="small" component={RouterLink} to="/admin/posts">
            All posts
          </Button>
        </Stack>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <StatCard
              label="Total posts"
              value={allPosts.data?.total ?? 0}
              loading={allPosts.isPending}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <StatCard
              label="Drafts"
              value={drafts.data?.total ?? 0}
              loading={drafts.isPending}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <StatCard
              label="Published"
              value={published.data?.total ?? 0}
              loading={published.isPending}
            />
          </Grid>
        </Grid>

        <Stack spacing={1}>
          {recentPosts.data?.items.map((post) => (
            <Card key={post.id} variant="outlined" sx={{ bgcolor: 'transparent' }}>
              <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography component={RouterLink} to={`/admin/posts/${post.id}/edit`} color="inherit">
                    {post.title}
                  </Typography>
                  <Typography
                    variant="caption"
                    color={post.status === 'published' ? 'success.main' : 'text.secondary'}
                  >
                    {post.status}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          ))}
          {recentPosts.data?.items.length === 0 && (
            <Typography color="text.secondary">No posts yet.</Typography>
          )}
        </Stack>
      </Box>
    </Stack>
  )
}

export default DashboardPage

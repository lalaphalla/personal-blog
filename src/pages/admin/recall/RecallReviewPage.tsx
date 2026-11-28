import { useMemo, useState } from 'react'
import { Link as RouterLink } from 'react-router'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import LinearProgress from '@mui/material/LinearProgress'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { PlusIcon, RecallIcon } from '../../../components/DocIcons'
import EmptyState from '../../../components/notes/EmptyState'
import RecallCardDialog from '../../../components/recall/RecallCardDialog'
import RecallFlashcard from '../../../components/recall/RecallFlashcard'
import {
  useRecallDue,
  useRecallMutations,
  useRecallReviewedToday,
  useRecallStats,
} from '../../../hooks/useRecallQueries'
import { useAppSettings, useUpdateAppSetting } from '../../../hooks/useSettingsQueries'
import type {
  RecallCard,
  RecallCardCreateInput,
  RecallCardUpdateInput,
  RecallRating,
} from '../../../services/recallApi'

const DAILY_LIMIT_OPTIONS = [
  { value: 10, label: '10' },
  { value: 20, label: '20' },
  { value: 30, label: '30' },
  { value: 50, label: '50' },
  { value: 0, label: 'All' },
]

const RATING_CHIP_COLOR: Record<RecallRating, 'error' | 'warning' | 'primary' | 'success'> = {
  again: 'error',
  hard: 'warning',
  good: 'primary',
  easy: 'success',
}

export default function RecallReviewPage() {
  const [selectedDeck, setSelectedDeck] = useState<string | undefined>(undefined)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCard, setEditingCard] = useState<RecallCard | null>(null)
  const [deferredOrder, setDeferredOrder] = useState<number[]>([])
  const [pinnedCardId, setPinnedCardId] = useState<number | null>(null)
  const [overrideGoal, setOverrideGoal] = useState(false)
  const [queueTab, setQueueTab] = useState<'up_next' | 'reviewed'>('up_next')

  const { data: appSettings } = useAppSettings()
  const updateSetting = useUpdateAppSetting()
  const dailyLimit =
    typeof appSettings?.['recall.daily_limit'] === 'number'
      ? (appSettings['recall.daily_limit'] as number)
      : 20

  const { data: stats } = useRecallStats()
  const { data: dueCards = [], isPending, isError } = useRecallDue(selectedDeck)
  const { data: reviewedTodayItems = [] } = useRecallReviewedToday()
  const { create, update, review, toggleFavorite } = useRecallMutations()

  const orderedQueue = useMemo(() => {
    let list = dueCards
    if (deferredOrder.length > 0) {
      const orderMap = new Map(deferredOrder.map((id, idx) => [id, idx]))
      list = [...dueCards].sort((a, b) => {
        const ia = orderMap.get(a.id) ?? -1
        const ib = orderMap.get(b.id) ?? -1
        return ia - ib
      })
    }
    if (pinnedCardId !== null) {
      const idx = list.findIndex((c) => c.id === pinnedCardId)
      if (idx > 0) {
        list = [list[idx], ...list.slice(0, idx), ...list.slice(idx + 1)]
      }
    }
    return list
  }, [dueCards, deferredOrder, pinnedCardId])

  const reviewedTodayCount = stats?.reviewed_today ?? reviewedTodayItems.length
  const goalReached = dailyLimit > 0 && reviewedTodayCount >= dailyLimit && !overrideGoal
  const remainingGoalCount =
    dailyLimit > 0 && !overrideGoal
      ? Math.min(orderedQueue.length, Math.max(0, dailyLimit - reviewedTodayCount))
      : orderedQueue.length

  const currentCard = goalReached ? null : orderedQueue[0] ?? null
  const existingDecks = useMemo(
    () => (stats?.decks ?? []).map((d) => d.name),
    [stats],
  )

  const handleRate = async (rating: RecallRating) => {
    if (!currentCard) return
    const ratedId = currentCard.id
    await review.mutateAsync({ id: ratedId, rating })
    if (pinnedCardId === ratedId) setPinnedCardId(null)
    if (rating === 'again') {
      setDeferredOrder((prev) => [...prev.filter((id) => id !== ratedId), ratedId])
    } else {
      setDeferredOrder((prev) => prev.filter((id) => id !== ratedId))
    }
  }

  const handleDialogSubmit = async (
    payload: RecallCardCreateInput | RecallCardUpdateInput,
  ) => {
    if (editingCard) {
      await update.mutateAsync({ id: editingCard.id, input: payload })
    } else {
      await create.mutateAsync(payload as RecallCardCreateInput)
    }
  }

  const goalProgress =
    dailyLimit > 0 ? Math.min(100, Math.round((reviewedTodayCount / dailyLimit) * 100)) : 100

  return (
    <Box sx={{ maxWidth: 860, mx: 'auto', px: { xs: 2, sm: 3 }, py: { xs: 2.5, sm: 4 } }}>
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
              Recall
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Daily spaced repetition for things you want to remember.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1}>
            <Button
              component={RouterLink}
              to="/admin/recall/cards"
              variant="outlined"
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
            >
              All Cards ({stats?.total_cards ?? 0})
            </Button>
            <Button
              variant="contained"
              startIcon={<PlusIcon />}
              onClick={() => {
                setEditingCard(null)
                setDialogOpen(true)
              }}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
            >
              New Card
            </Button>
          </Stack>
        </Stack>

        {/* Daily Goal Setting + Progress */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 2.5,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <Stack spacing={1.25}>
            <Stack
              direction="row"
              sx={{
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 1,
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                Daily Goal:{' '}
                {dailyLimit > 0
                  ? `${reviewedTodayCount} / ${dailyLimit} reviewed today`
                  : `${reviewedTodayCount} reviewed today (No limit)`}
              </Typography>

              <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                <Typography variant="caption" color="text.secondary" sx={{ mr: 0.25 }}>
                  Limit/day:
                </Typography>
                {DAILY_LIMIT_OPTIONS.map((opt) => (
                  <Chip
                    key={opt.value}
                    size="small"
                    label={opt.label}
                    variant={dailyLimit === opt.value ? 'filled' : 'outlined'}
                    color={dailyLimit === opt.value ? 'primary' : 'default'}
                    onClick={() => {
                      setOverrideGoal(false)
                      updateSetting.mutate({ key: 'recall.daily_limit', value: opt.value })
                    }}
                    sx={{ fontWeight: 600 }}
                  />
                ))}
              </Stack>
            </Stack>

            {dailyLimit > 0 && (
              <LinearProgress
                variant="determinate"
                value={goalProgress}
                color={goalProgress >= 100 ? 'success' : 'primary'}
                sx={{ height: 7, borderRadius: 4 }}
              />
            )}
          </Stack>
        </Paper>

        {/* Stats Strip */}
        {stats && (
          <Stack spacing={1.5}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(6, 1fr)' },
                gap: 1.5,
              }}
            >
              {[
                { label: 'Due Today', value: stats.due_today, color: 'primary.main' },
                { label: 'Reviewed Today', value: stats.reviewed_today, color: 'success.main' },
                { label: 'Streak', value: `${stats.streak_days}d`, color: 'warning.main' },
                { label: 'Accuracy (30d)', value: `${stats.accuracy_percent}%`, color: 'info.main' },
                { label: 'Mastered (21d+)', value: stats.mastered_count, color: 'success.dark' },
                { label: 'Total Cards', value: stats.total_cards, color: 'text.primary' },
              ].map((item) => (
                <Paper
                  key={item.label}
                  elevation={0}
                  sx={{
                    p: 1.5,
                    borderRadius: 2.5,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                  }}
                >
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    {item.label}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: item.color, mt: 0.25 }}>
                    {item.value}
                  </Typography>
                </Paper>
              ))}
            </Box>

            {stats.daily_activity && stats.daily_activity.length > 0 && (
              <Paper
                elevation={0}
                sx={{
                  p: 1.75,
                  borderRadius: 2.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                }}
              >
                <Stack
                  direction="row"
                  sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}
                >
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                    LAST 14 DAYS ACTIVITY
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {stats.total_reviews_all_time} total reviews
                  </Typography>
                </Stack>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${stats.daily_activity.length}, 1fr)`,
                    gap: 0.75,
                    alignItems: 'end',
                    height: 44,
                  }}
                >
                  {(() => {
                    const maxCount = Math.max(
                      1,
                      ...stats.daily_activity.map((d) => d.count),
                    )
                    return stats.daily_activity.map((day) => {
                      const heightPct = day.count > 0 ? Math.max(18, Math.round((day.count / maxCount) * 100)) : 8
                      return (
                        <Tooltip
                          key={day.date}
                          title={`${day.date}: ${day.count} review${day.count === 1 ? '' : 's'}${
                            day.again_count > 0 ? ` (${day.again_count} again)` : ''
                          }`}
                        >
                          <Box
                            sx={{
                              height: `${heightPct}%`,
                              borderRadius: 1,
                              bgcolor: day.count > 0 ? 'primary.main' : 'action.hover',
                              opacity: day.count > 0 ? 0.85 : 1,
                              transition: 'height 0.2s ease',
                            }}
                          />
                        </Tooltip>
                      )
                    })
                  })()}
                </Box>
              </Paper>
            )}
          </Stack>
        )}

        {/* Deck Filter Chips */}
        {stats && stats.decks.length > 0 && (
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.75 }}>
            <Chip
              label={`All Decks (${stats.due_today})`}
              variant={selectedDeck === undefined ? 'filled' : 'outlined'}
              color={selectedDeck === undefined ? 'primary' : 'default'}
              onClick={() => setSelectedDeck(undefined)}
              sx={{ fontWeight: 600 }}
            />
            {stats.decks.map((d) => (
              <Chip
                key={d.name}
                label={`${d.name} (${d.due})`}
                variant={selectedDeck === d.name ? 'filled' : 'outlined'}
                color={selectedDeck === d.name ? 'primary' : 'default'}
                onClick={() => setSelectedDeck(d.name)}
                sx={{ fontWeight: 600 }}
              />
            ))}
          </Stack>
        )}

        {/* Active Review Card */}
        {isPending ? (
          <Stack sx={{ py: 10, alignItems: 'center' }}>
            <CircularProgress />
          </Stack>
        ) : isError ? (
          <EmptyState
            title="Unable to load due cards"
            description="Please check your connection and try again."
          />
        ) : goalReached ? (
          <EmptyState
            title={`Daily goal reached (${reviewedTodayCount}/${dailyLimit})!`}
            description={
              orderedQueue.length > 0
                ? `You still have ${orderedQueue.length} due card${orderedQueue.length === 1 ? '' : 's'} waiting if you want to keep going.`
                : 'Great job staying consistent today.'
            }
            icon={<RecallIcon sx={{ fontSize: 28 }} />}
            action={
              orderedQueue.length > 0 ? (
                <Button
                  variant="contained"
                  onClick={() => setOverrideGoal(true)}
                  sx={{ mt: 1, borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                >
                  Keep Studying ({orderedQueue.length} more due)
                </Button>
              ) : undefined
            }
          />
        ) : currentCard ? (
          <Stack spacing={1.5}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              {remainingGoalCount} card{remainingGoalCount === 1 ? '' : 's'} left in today&apos;s session
              {orderedQueue.length > remainingGoalCount
                ? ` (${orderedQueue.length} total due)`
                : ''}
            </Typography>
            <RecallFlashcard
              key={`${currentCard.id}-${currentCard.total_reviews}`}
              card={currentCard}
              onRate={handleRate}
              onToggleFavorite={() => toggleFavorite.mutate(currentCard.id)}
              onEdit={() => {
                setEditingCard(currentCard)
                setDialogOpen(true)
              }}
              isSubmitting={review.isPending}
            />
          </Stack>
        ) : (
          <EmptyState
            title={
              stats && stats.total_cards > 0
                ? "You're all caught up for today!"
                : 'No recall cards yet'
            }
            description={
              stats && stats.total_cards > 0
                ? 'All due cards have been reviewed. Add a new card or browse your library.'
                : 'Create your first Recall card for something you want to remember long-term.'
            }
            icon={<RecallIcon sx={{ fontSize: 28 }} />}
            action={
              <Stack direction="row" spacing={1.5} sx={{ mt: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<PlusIcon />}
                  onClick={() => {
                    setEditingCard(null)
                    setDialogOpen(true)
                  }}
                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                >
                  New Card
                </Button>
                <Button
                  component={RouterLink}
                  to="/admin/recall/cards"
                  variant="outlined"
                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                >
                  Browse All Cards
                </Button>
              </Stack>
            }
          />
        )}

        {/* Up Next & Reviewed Today Queue Lists */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 2.5,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <Tabs
            value={queueTab}
            onChange={(_e, val: 'up_next' | 'reviewed') => setQueueTab(val)}
            sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
          >
            <Tab
              value="up_next"
              label={`Up Next (${orderedQueue.length})`}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            />
            <Tab
              value="reviewed"
              label={`Reviewed Today (${reviewedTodayItems.length})`}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            />
          </Tabs>

          {queueTab === 'up_next' ? (
            orderedQueue.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No cards left in today&apos;s due queue.
              </Typography>
            ) : (
              <Stack spacing={1}>
                {orderedQueue.slice(0, 30).map((c, idx) => (
                  <Stack
                    key={c.id}
                    direction="row"
                    sx={{
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 1.5,
                      p: 1.25,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: currentCard?.id === c.id ? 'primary.main' : 'divider',
                    }}
                  >
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', minWidth: 0 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                        {idx + 1}.
                      </Typography>
                      <Chip size="small" label={c.deck} variant="outlined" />
                      <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
                        {c.front}
                      </Typography>
                    </Stack>
                    {currentCard?.id !== c.id && (
                      <Button
                        size="small"
                        variant="text"
                        onClick={() => {
                          setOverrideGoal(true)
                          setPinnedCardId(c.id)
                        }}
                        sx={{ textTransform: 'none', fontWeight: 600, flexShrink: 0 }}
                      >
                        Review Now
                      </Button>
                    )}
                  </Stack>
                ))}
              </Stack>
            )
          ) : reviewedTodayItems.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No cards reviewed yet today.
            </Typography>
          ) : (
            <Stack spacing={1}>
              {reviewedTodayItems.map((item) => (
                <Stack
                  key={item.log_id}
                  direction="row"
                  sx={{
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1.5,
                    p: 1.25,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center', minWidth: 0 }}>
                    <Chip size="small" label={item.deck} variant="outlined" />
                    <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
                      {item.front}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', flexShrink: 0 }}>
                    <Chip
                      size="small"
                      label={`${item.rating} · ${item.new_interval_days}d`}
                      color={RATING_CHIP_COLOR[item.rating]}
                      sx={{ textTransform: 'capitalize', fontWeight: 600 }}
                    />
                  </Stack>
                </Stack>
              ))}
            </Stack>
          )}
        </Paper>
      </Stack>

      <RecallCardDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleDialogSubmit}
        initialCard={editingCard}
        existingDecks={existingDecks}
        isSubmitting={create.isPending || update.isPending}
      />
    </Box>
  )
}

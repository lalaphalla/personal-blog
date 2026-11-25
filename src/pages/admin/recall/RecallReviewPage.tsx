import { useMemo, useState } from 'react'
import { Link as RouterLink } from 'react-router'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { PlusIcon, RecallIcon } from '../../../components/DocIcons'
import EmptyState from '../../../components/notes/EmptyState'
import RecallCardDialog from '../../../components/recall/RecallCardDialog'
import RecallFlashcard from '../../../components/recall/RecallFlashcard'
import {
  useRecallDue,
  useRecallMutations,
  useRecallStats,
} from '../../../hooks/useRecallQueries'
import type {
  RecallCard,
  RecallCardCreateInput,
  RecallCardUpdateInput,
  RecallRating,
} from '../../../services/recallApi'

export default function RecallReviewPage() {
  const [selectedDeck, setSelectedDeck] = useState<string | undefined>(undefined)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCard, setEditingCard] = useState<RecallCard | null>(null)
  const [deferredOrder, setDeferredOrder] = useState<number[]>([])

  const { data: stats } = useRecallStats()
  const { data: dueCards = [], isPending, isError } = useRecallDue(selectedDeck)
  const { create, update, review, toggleFavorite } = useRecallMutations()

  // Push 'again'-rated cards to the back of the current session queue
  const orderedQueue = useMemo(() => {
    if (deferredOrder.length === 0) return dueCards
    const orderMap = new Map(deferredOrder.map((id, idx) => [id, idx]))
    return [...dueCards].sort((a, b) => {
      const ia = orderMap.get(a.id) ?? -1
      const ib = orderMap.get(b.id) ?? -1
      return ia - ib
    })
  }, [dueCards, deferredOrder])

  const currentCard = orderedQueue[0] ?? null
  const existingDecks = useMemo(
    () => (stats?.decks ?? []).map((d) => d.name),
    [stats],
  )

  const handleRate = async (rating: RecallRating) => {
    if (!currentCard) return
    await review.mutateAsync({ id: currentCard.id, rating })
    if (rating === 'again') {
      setDeferredOrder((prev) => [...prev.filter((id) => id !== currentCard.id), currentCard.id])
    } else {
      setDeferredOrder((prev) => prev.filter((id) => id !== currentCard.id))
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

  return (
    <Box sx={{ maxWidth: 820, mx: 'auto', px: { xs: 2, sm: 3 }, py: { xs: 2.5, sm: 4 } }}>
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

        {/* Stats Strip */}
        {stats && (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
              gap: 1.5,
            }}
          >
            {[
              { label: 'Due Today', value: stats.due_today, color: 'primary.main' },
              { label: 'Reviewed Today', value: stats.reviewed_today, color: 'success.main' },
              { label: 'Mastered (21d+)', value: stats.mastered_count, color: 'info.main' },
              { label: 'Total Cards', value: stats.total_cards, color: 'text.primary' },
            ].map((item) => (
              <Paper
                key={item.label}
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
                  {item.label}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: item.color, mt: 0.25 }}>
                  {item.value}
                </Typography>
              </Paper>
            ))}
          </Box>
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
        ) : currentCard ? (
          <Stack spacing={1.5}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              {orderedQueue.length} card{orderedQueue.length === 1 ? '' : 's'} remaining in queue
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

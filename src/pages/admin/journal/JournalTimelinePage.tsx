import { useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ClockIcon } from '../../../components/DocIcons'
import JournalEntryCard from '../../../components/journal/JournalEntryCard'
import EmptyState from '../../../components/notes/EmptyState'
import { useJournalList, useJournalMutations } from '../../../hooks/useJournalQueries'
import type { JournalEntrySummary, Mood } from '../../../services/journalApi'
import { MOODS } from '../../../utils/journal'

export default function JournalTimelinePage() {
  const [selectedMood, setSelectedMood] = useState<Mood | undefined>(undefined)
  const [accumulatedItems, setAccumulatedItems] = useState<JournalEntrySummary[]>([])
  const [cursor, setCursor] = useState<string | null>(null)

  const { data: timelineData, isPending, isError } = useJournalList({
    mood: selectedMood,
    cursor: cursor,
    limit: 25,
  })

  const { toggleFavorite } = useJournalMutations()

  // Track items across pagination
  const currentItems = timelineData?.items || []
  const nextCursor = timelineData?.next_cursor

  const handleMoodFilter = (mood?: Mood) => {
    setSelectedMood(mood)
    setCursor(null)
    setAccumulatedItems([])
  }

  const handleLoadMore = () => {
    if (nextCursor) {
      setAccumulatedItems((prev) => [...prev, ...currentItems])
      setCursor(nextCursor)
    }
  }

  const allItems = [...accumulatedItems, ...currentItems]

  return (
    <Stack spacing={3.5} sx={{ width: '100%' }}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -0.5 }}>
          Timeline
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          A continuous record of your journey over time.
        </Typography>
      </Box>

      {/* Mood quick filter pills */}
      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
        <Button
          size="small"
          variant={selectedMood === undefined ? 'contained' : 'outlined'}
          onClick={() => handleMoodFilter(undefined)}
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
        >
          All
        </Button>
        {MOODS.map((m) => (
          <Button
            key={m.value}
            size="small"
            variant={selectedMood === m.value ? 'contained' : 'outlined'}
            onClick={() => handleMoodFilter(m.value)}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              borderColor: m.borderColor,
              color: selectedMood === m.value ? '#fff' : m.color,
              bgcolor: selectedMood === m.value ? m.color : 'transparent',
              '&:hover': {
                bgcolor: selectedMood === m.value ? m.color : m.bgColor,
              },
            }}
          >
            {m.emoji} {m.label}
          </Button>
        ))}
      </Stack>

      {/* Entries List */}
      {isPending && allItems.length === 0 ? (
        <Stack sx={{ py: 12, alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress />
        </Stack>
      ) : isError ? (
        <EmptyState
          title="Unable to load timeline"
          description="Please check your connection and try again."
        />
      ) : allItems.length === 0 ? (
        <EmptyState
          title="No entries found"
          description="Write entries on Today or the Calendar to see your timeline grow."
          icon={<ClockIcon sx={{ fontSize: 28 }} />}
        />
      ) : (
        <Stack spacing={2}>
          {allItems.map((entry) => (
            <JournalEntryCard
              key={`${entry.id}-${entry.created_at}`}
              entry={entry}
              showDate
              onToggleFavorite={(id) => toggleFavorite.mutate(id)}
            />
          ))}

          {nextCursor && (
            <Box sx={{ textAlign: 'center', pt: 2 }}>
              <Button
                variant="outlined"
                onClick={handleLoadMore}
                sx={{ borderRadius: 2, px: 3, textTransform: 'none', fontWeight: 600 }}
              >
                Load older entries
              </Button>
            </Box>
          )}
        </Stack>
      )}
    </Stack>
  )
}

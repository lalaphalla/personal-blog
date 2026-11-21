import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { HeartIcon } from '../../../components/DocIcons'
import JournalEntryCard from '../../../components/journal/JournalEntryCard'
import EmptyState from '../../../components/notes/EmptyState'
import { useJournalList, useJournalMutations } from '../../../hooks/useJournalQueries'

export default function JournalFavoritesPage() {
  const { data: listData, isPending, isError } = useJournalList({
    favorite: true,
    limit: 50,
  })

  const { toggleFavorite } = useJournalMutations()
  const entries = listData?.items || []

  return (
    <Stack spacing={3.5} sx={{ width: '100%' }}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -0.5 }}>
          Favorites
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Meaningful entries and milestones you&apos;ve starred.
        </Typography>
      </Box>

      {isPending ? (
        <Stack sx={{ py: 12, alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress />
        </Stack>
      ) : isError ? (
        <EmptyState
          title="Unable to load favorites"
          description="Please check your connection and try again."
        />
      ) : entries.length === 0 ? (
        <EmptyState
          title="No favorites yet"
          description="Click the heart icon on any entry to keep your most special moments here."
          icon={<HeartIcon sx={{ fontSize: 28 }} />}
        />
      ) : (
        <Stack spacing={2}>
          {entries.map((entry) => (
            <JournalEntryCard
              key={entry.id}
              entry={entry}
              showDate
              onToggleFavorite={(id) => toggleFavorite.mutate(id)}
            />
          ))}
        </Stack>
      )}
    </Stack>
  )
}

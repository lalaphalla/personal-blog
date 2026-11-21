import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { SparklesIcon } from '../../../components/DocIcons'
import JournalEntryCard from '../../../components/journal/JournalEntryCard'
import EmptyState from '../../../components/notes/EmptyState'
import { useJournalMemories, useJournalMutations } from '../../../hooks/useJournalQueries'
import { formatFullJournalDate, getLocalTodayDateString } from '../../../utils/journal'

export default function JournalMemoriesPage() {
  const todayStr = getLocalTodayDateString()
  const { data: memoriesData, isPending, isError } = useJournalMemories(todayStr)
  const { toggleFavorite } = useJournalMutations()

  const groups = memoriesData?.groups || []

  return (
    <Stack spacing={3.5} sx={{ width: '100%' }}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -0.5 }}>
          On This Day
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Look back at what you wrote in previous months and years on {formatFullJournalDate(todayStr)}.
        </Typography>
      </Box>

      {isPending ? (
        <Stack sx={{ py: 12, alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress />
        </Stack>
      ) : isError ? (
        <EmptyState
          title="Unable to load memories"
          description="Please check your connection and try again."
        />
      ) : groups.length === 0 ? (
        <EmptyState
          title="No past memories for today"
          description="As you keep writing, your reflections from 1 month, 6 months, and 1 year ago will appear here."
          icon={<SparklesIcon sx={{ fontSize: 28 }} />}
        />
      ) : (
        <Stack spacing={4}>
          {groups.map((group) => (
            <Stack key={group.date} spacing={2}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <SparklesIcon sx={{ color: 'secondary.main', fontSize: 20 }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {group.label} &mdash; {formatFullJournalDate(group.date)}
                </Typography>
              </Stack>

              <Stack spacing={2}>
                {group.entries.map((entry) => (
                  <JournalEntryCard
                    key={entry.id}
                    entry={entry}
                    onToggleFavorite={(id) => toggleFavorite.mutate(id)}
                  />
                ))}
              </Stack>
              <Divider sx={{ pt: 1 }} />
            </Stack>
          ))}
        </Stack>
      )}
    </Stack>
  )
}

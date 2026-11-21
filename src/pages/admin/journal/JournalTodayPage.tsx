import { Link as RouterLink, useNavigate } from 'react-router'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { PlusIcon, SunIcon } from '../../../components/DocIcons'
import JournalEntryCard from '../../../components/journal/JournalEntryCard'
import PromptCard from '../../../components/journal/PromptCard'
import EmptyState from '../../../components/notes/EmptyState'
import {
  useJournalMutations,
  useJournalPrompts,
  useTodayJournal,
} from '../../../hooks/useJournalQueries'
import type { JournalPrompt } from '../../../services/journalApi'
import { formatFullJournalDate, getLocalTodayDateString } from '../../../utils/journal'

export default function JournalTodayPage() {
  const navigate = useNavigate()
  const todayStr = getLocalTodayDateString()

  const { data: todayData, isPending, isError } = useTodayJournal(todayStr)
  const { data: prompts } = useJournalPrompts()
  const { toggleFavorite } = useJournalMutations()

  const handleSelectPrompt = (prompt: JournalPrompt) => {
    navigate(`/admin/journal/new?date=${todayStr}&prompt_id=${prompt.id}`)
  }

  if (isPending) {
    return (
      <Stack sx={{ py: 12, alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Stack>
    )
  }

  if (isError || !todayData) {
    return (
      <EmptyState
        title="Unable to load today's journal"
        description="Please check your connection or reload the page."
        icon={<SunIcon sx={{ fontSize: 28 }} />}
      />
    )
  }

  const entries = todayData.entries || []

  return (
    <Stack spacing={4} sx={{ width: '100%' }}>
      {/* Date Header & Call to Action */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        sx={{
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
        }}
        spacing={2}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -0.5 }}>
            {formatFullJournalDate(todayStr)}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {entries.length === 0
              ? 'No entries recorded for today yet.'
              : `${entries.length} ${entries.length === 1 ? 'entry' : 'entries'} captured today.`}
          </Typography>
        </Box>

        <Button
          component={RouterLink}
          to={`/admin/journal/new?date=${todayStr}`}
          variant="contained"
          color="primary"
          startIcon={<PlusIcon />}
          sx={{
            borderRadius: 2.5,
            px: 2.5,
            py: 1,
            fontWeight: 700,
            textTransform: 'none',
            boxShadow: 'none',
          }}
        >
          Write about today
        </Button>
      </Stack>

      {/* Daily Prompt Banner */}
      {prompts && prompts.length > 0 && (
        <PromptCard prompts={prompts} onSelectPrompt={handleSelectPrompt} />
      )}

      {/* Today's Entries Feed */}
      {entries.length === 0 ? (
        <EmptyState
          title="What happened today?"
          description="Take a moment to write a thought, capture an accomplishment, or reflect on your day."
          icon={<SunIcon sx={{ fontSize: 28 }} />}
          action={
            <Button
              component={RouterLink}
              to={`/admin/journal/new?date=${todayStr}`}
              variant="outlined"
              color="primary"
              startIcon={<PlusIcon />}
              sx={{ textTransform: 'none', borderRadius: 2 }}
            >
              Start First Entry
            </Button>
          }
        />
      ) : (
        <Stack spacing={2}>
          <Typography
            variant="overline"
            sx={{ fontWeight: 700, letterSpacing: 1.2, color: 'text.secondary' }}
          >
            TODAY&apos;S ENTRIES ({entries.length})
          </Typography>

          {entries.map((entry) => (
            <JournalEntryCard
              key={entry.id}
              entry={entry}
              onToggleFavorite={(id) => toggleFavorite.mutate(id)}
            />
          ))}
        </Stack>
      )}
    </Stack>
  )
}

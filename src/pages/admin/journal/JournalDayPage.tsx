import { Link as RouterLink, useNavigate, useParams } from 'react-router'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ArrowLeftIcon, PlusIcon, SunIcon } from '../../../components/DocIcons'
import JournalEntryCard from '../../../components/journal/JournalEntryCard'
import EmptyState from '../../../components/notes/EmptyState'
import { useJournalMutations, useTodayJournal } from '../../../hooks/useJournalQueries'
import { formatFullJournalDate } from '../../../utils/journal'

export default function JournalDayPage() {
  const { date } = useParams<{ date: string }>()
  const navigate = useNavigate()

  const { data: dayData, isPending, isError } = useTodayJournal(date)
  const { toggleFavorite } = useJournalMutations()

  if (isPending) {
    return (
      <Stack sx={{ py: 12, alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Stack>
    )
  }

  if (isError || !dayData || !date) {
    return (
      <EmptyState
        title="Unable to load entries for this day"
        description="Please verify the date and try again."
        action={
          <Button variant="outlined" onClick={() => navigate('/admin/journal/calendar')}>
            Back to Calendar
          </Button>
        }
      />
    )
  }

  const entries = dayData.entries || []

  return (
    <Stack spacing={3.5} sx={{ width: '100%' }}>
      <Box>
        <Button
          size="small"
          startIcon={<ArrowLeftIcon />}
          onClick={() => navigate('/admin/journal/calendar')}
          sx={{ textTransform: 'none', color: 'text.secondary', px: 0, mb: 1 }}
        >
          Calendar
        </Button>
      </Box>

      {/* Date Header & Action */}
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
            {formatFullJournalDate(date)}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {entries.length === 0
              ? 'No entries on this day.'
              : `${entries.length} ${entries.length === 1 ? 'entry' : 'entries'}`}
          </Typography>
        </Box>

        <Button
          component={RouterLink}
          to={`/admin/journal/new?date=${date}`}
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
          Add Entry for this day
        </Button>
      </Stack>

      {/* Day Entries Feed */}
      {entries.length === 0 ? (
        <EmptyState
          title="No entries recorded on this day"
          description="You can add an entry retrospectively for this date."
          icon={<SunIcon sx={{ fontSize: 28 }} />}
          action={
            <Button
              component={RouterLink}
              to={`/admin/journal/new?date=${date}`}
              variant="outlined"
              color="primary"
              startIcon={<PlusIcon />}
              sx={{ textTransform: 'none', borderRadius: 2 }}
            >
              Add Entry
            </Button>
          }
        />
      ) : (
        <Stack spacing={2}>
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

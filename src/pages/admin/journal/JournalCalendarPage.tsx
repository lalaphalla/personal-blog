import { useState } from 'react'
import { useNavigate } from 'react-router'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import CalendarMonth from '../../../components/journal/CalendarMonth'
import EmptyState from '../../../components/notes/EmptyState'
import { useJournalCalendar } from '../../../hooks/useJournalQueries'

export default function JournalCalendarPage() {
  const navigate = useNavigate()
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1) // 1-12

  const { data: calendarData, isPending, isError } = useJournalCalendar(year, month)

  const handlePrevMonth = () => {
    if (month === 1) {
      setYear(year - 1)
      setMonth(12)
    } else {
      setMonth(month - 1)
    }
  }

  const handleNextMonth = () => {
    if (month === 12) {
      setYear(year + 1)
      setMonth(1)
    } else {
      setMonth(month + 1)
    }
  }

  const handleSelectDate = (dateStr: string) => {
    navigate(`/admin/journal/day/${dateStr}`)
  }

  return (
    <Stack spacing={3} sx={{ width: '100%' }}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -0.5 }}>
          Calendar
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Browse your journal history by date.
        </Typography>
      </Box>

      {isPending ? (
        <Stack sx={{ py: 12, alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress />
        </Stack>
      ) : isError || !calendarData ? (
        <EmptyState
          title="Unable to load calendar"
          description="Please check your connection and try again."
        />
      ) : (
        <CalendarMonth
          year={year}
          month={month}
          days={calendarData.days}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onSelectDate={handleSelectDate}
        />
      )}
    </Stack>
  )
}

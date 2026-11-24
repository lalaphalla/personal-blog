import { useNavigate, useSearchParams } from 'react-router'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import CalendarMonth from '../../../components/journal/CalendarMonth'
import EmptyState from '../../../components/notes/EmptyState'
import { useJournalCalendar } from '../../../hooks/useJournalQueries'

export default function JournalCalendarPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const today = new Date()
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth() + 1 // 1-12

  const yearParam = searchParams.get('year')
  const monthParam = searchParams.get('month')

  const parsedYear = yearParam ? parseInt(yearParam, 10) : NaN
  const parsedMonth = monthParam ? parseInt(monthParam, 10) : NaN

  const year =
    !isNaN(parsedYear) && parsedYear >= 1900 && parsedYear <= 2100 ? parsedYear : currentYear
  const month =
    !isNaN(parsedMonth) && parsedMonth >= 1 && parsedMonth <= 12 ? parsedMonth : currentMonth

  const { data: calendarData, isPending, isError } = useJournalCalendar(year, month)

  const setYearMonth = (newYear: number, newMonth: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('year', String(newYear))
      next.set('month', String(newMonth))
      return next
    })
  }

  const handlePrevMonth = () => {
    if (month === 1) {
      setYearMonth(year - 1, 12)
    } else {
      setYearMonth(year, month - 1)
    }
  }

  const handleNextMonth = () => {
    if (month === 12) {
      setYearMonth(year + 1, 1)
    } else {
      setYearMonth(year, month + 1)
    }
  }

  const handlePrevYear = () => {
    setYearMonth(year - 1, month)
  }

  const handleNextYear = () => {
    setYearMonth(year + 1, month)
  }

  const handleToday = () => {
    setYearMonth(currentYear, currentMonth)
  }

  const handleSelectYearMonth = (newYear: number, newMonth: number) => {
    setYearMonth(newYear, newMonth)
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
          onPrevYear={handlePrevYear}
          onNextYear={handleNextYear}
          onToday={handleToday}
          onSelectYearMonth={handleSelectYearMonth}
          onSelectDate={handleSelectDate}
        />
      )}
    </Stack>
  )
}

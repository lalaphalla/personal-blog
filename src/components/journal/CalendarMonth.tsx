import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'
import { CameraIcon, ChevronLeftIcon, ChevronRightIcon } from '../DocIcons'
import type { JournalCalendarDay } from '../../services/journalApi'
import { getLocalTodayDateString, getMoodMeta } from '../../utils/journal'

interface CalendarMonthProps {
  year: number
  month: number // 1-12
  days: JournalCalendarDay[]
  onPrevMonth: () => void
  onNextMonth: () => void
  onSelectDate: (date: string) => void
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function CalendarMonth({
  year,
  month,
  days,
  onPrevMonth,
  onNextMonth,
  onSelectDate,
}: CalendarMonthProps) {
  const theme = useTheme()
  const todayStr = getLocalTodayDateString()

  // Map entries by date YYYY-MM-DD
  const dayMap = new Map<string, JournalCalendarDay>()
  for (const d of days) {
    dayMap.set(d.date, d)
  }

  // Month calculations
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay()
  const daysInMonth = new Date(year, month, 0).getDate()
  const monthName = new Date(year, month - 1, 1).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  })

  // Cells before day 1
  const leadingBlanks = Array.from({ length: firstDayOfWeek }, (_, i) => i)
  // Day numbers
  const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 3 },
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      {/* Month Header */}
      <Stack
        direction="row"
        sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}
      >
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {monthName}
        </Typography>

        <Stack direction="row" spacing={1}>
          <IconButton onClick={onPrevMonth} size="small" aria-label="Previous month">
            <ChevronLeftIcon />
          </IconButton>
          <IconButton onClick={onNextMonth} size="small" aria-label="Next month">
            <ChevronRightIcon />
          </IconButton>
        </Stack>
      </Stack>

      {/* Weekday Labels */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          textAlign: 'center',
          mb: 1.5,
        }}
      >
        {WEEKDAYS.map((wd) => (
          <Typography
            key={wd}
            variant="caption"
            sx={{ fontWeight: 700, color: 'text.secondary' }}
          >
            {wd}
          </Typography>
        ))}
      </Box>

      {/* Days Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: { xs: 0.5, sm: 1 },
        }}
      >
        {/* Leading empty cells */}
        {leadingBlanks.map((i) => (
          <Box key={`blank-${i}`} sx={{ minHeight: { xs: 48, sm: 64 } }} />
        ))}

        {/* Days of month */}
        {monthDays.map((dayNum) => {
          const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
          const info = dayMap.get(dateStr)
          const isToday = dateStr === todayStr
          const hasEntries = info && info.entries > 0

          const dominantMoodMeta =
            info && info.moods.length > 0 ? getMoodMeta(info.moods[0]) : null

          return (
            <ButtonBase
              key={dateStr}
              onClick={() => onSelectDate(dateStr)}
              sx={{
                minHeight: { xs: 48, sm: 64 },
                p: 0.75,
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                border: '1px solid',
                borderColor: isToday ? 'primary.main' : 'transparent',
                bgcolor: hasEntries
                  ? alpha(dominantMoodMeta?.color || theme.palette.primary.main, 0.08)
                  : 'transparent',
                transition: 'all 0.15s ease',
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.12),
                },
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontWeight: isToday ? 800 : hasEntries ? 600 : 400,
                  color: isToday
                    ? 'primary.main'
                    : hasEntries
                      ? 'text.primary'
                      : 'text.secondary',
                }}
              >
                {dayNum}
              </Typography>

              {hasEntries && (
                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mt: 0.5 }}>
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      bgcolor: dominantMoodMeta?.color || 'primary.main',
                    }}
                  />
                  {info.entries > 1 && (
                    <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 700 }}>
                      {info.entries}
                    </Typography>
                  )}
                  {info.has_photos && (
                    <CameraIcon sx={{ fontSize: 10, color: 'text.secondary' }} />
                  )}
                </Stack>
              )}
            </ButtonBase>
          )
        })}
      </Box>
    </Paper>
  )
}

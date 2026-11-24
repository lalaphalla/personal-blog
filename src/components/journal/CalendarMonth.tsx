import { useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonBase from '@mui/material/ButtonBase'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'
import {
  CameraIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from '../DocIcons'
import CalendarQuickJumpPopover from './CalendarQuickJumpPopover'
import type { JournalCalendarDay } from '../../services/journalApi'
import { getLocalTodayDateString, getMoodMeta } from '../../utils/journal'

interface CalendarMonthProps {
  year: number
  month: number // 1-12
  days: JournalCalendarDay[]
  onPrevMonth: () => void
  onNextMonth: () => void
  onPrevYear: () => void
  onNextYear: () => void
  onSelectDate: (date: string) => void
  onSelectYearMonth: (year: number, month: number) => void
  onToday: () => void
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function CalendarMonth({
  year,
  month,
  days,
  onPrevMonth,
  onNextMonth,
  onPrevYear,
  onNextYear,
  onSelectDate,
  onSelectYearMonth,
  onToday,
}: CalendarMonthProps) {
  const theme = useTheme()
  const todayStr = getLocalTodayDateString()
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

  const today = new Date()
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month

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
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          mb: 2.5,
        }}
      >
        {/* Clickable Month-Year Name triggering Quick Jump Popover */}
        <Tooltip title="Click to quickly jump to any month or year">
          <ButtonBase
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{
              borderRadius: 2,
              px: 1.25,
              py: 0.5,
              mx: -1.25,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              transition: 'background-color 0.15s ease',
              '&:hover': { bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08) },
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: -0.5 }}>
              {monthName}
            </Typography>
            <ChevronDownIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
          </ButtonBase>
        </Tooltip>

        {/* Quick Nav Controls */}
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
          {!isCurrentMonth && (
            <Button
              size="small"
              variant="outlined"
              onClick={onToday}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 650,
                fontSize: '0.75rem',
                py: 0.25,
                px: 1.25,
                mr: 0.5,
              }}
            >
              Today
            </Button>
          )}

          <Tooltip title="Previous year">
            <IconButton onClick={onPrevYear} size="small" aria-label="Previous year">
              <ChevronsLeftIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Previous month">
            <IconButton onClick={onPrevMonth} size="small" aria-label="Previous month">
              <ChevronLeftIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Next month">
            <IconButton onClick={onNextMonth} size="small" aria-label="Next month">
              <ChevronRightIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Next year">
            <IconButton onClick={onNextYear} size="small" aria-label="Next year">
              <ChevronsRightIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      {/* Quick Jump Popover */}
      <CalendarQuickJumpPopover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        year={year}
        month={month}
        onClose={() => setAnchorEl(null)}
        onSelect={onSelectYearMonth}
      />

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

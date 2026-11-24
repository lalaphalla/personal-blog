import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonBase from '@mui/material/ButtonBase'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Popover from '@mui/material/Popover'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import { ChevronLeftIcon, ChevronRightIcon } from '../DocIcons'

interface CalendarQuickJumpPopoverProps {
  open: boolean
  anchorEl: HTMLElement | null
  year: number
  month: number // 1-12
  onClose: () => void
  onSelect: (year: number, month: number) => void
}

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

export default function CalendarQuickJumpPopover({
  open,
  anchorEl,
  year,
  month,
  onClose,
  onSelect,
}: CalendarQuickJumpPopoverProps) {
  const [tempYear, setTempYear] = useState(year)

  // Keep tempYear in sync whenever popover opens
  useEffect(() => {
    if (open) {
      setTempYear(year)
    }
  }, [open, year])

  const today = new Date()
  const todayYear = today.getFullYear()
  const todayMonth = today.getMonth() + 1

  const handleSelectMonth = (mIndex: number) => {
    onSelect(tempYear, mIndex + 1)
    onClose()
  }

  const handleJumpToCurrent = () => {
    onSelect(todayYear, todayMonth)
    onClose()
  }

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      slotProps={{
        paper: {
          sx: {
            p: 2,
            width: 280,
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            border: '1px solid',
            borderColor: 'divider',
          },
        },
      }}
    >
      <Stack spacing={2}>
        {/* Year Selector Stepper */}
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <IconButton
            size="small"
            onClick={() => setTempYear((y) => y - 1)}
            aria-label="Previous year"
            sx={{ border: '1px solid', borderColor: 'divider' }}
          >
            <ChevronLeftIcon sx={{ fontSize: 18 }} />
          </IconButton>

          <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: -0.5 }}>
            {tempYear}
          </Typography>

          <IconButton
            size="small"
            onClick={() => setTempYear((y) => y + 1)}
            aria-label="Next year"
            sx={{ border: '1px solid', borderColor: 'divider' }}
          >
            <ChevronRightIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Stack>

        {/* 12 Months Grid (4 columns x 3 rows) */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 1,
          }}
        >
          {MONTHS.map((mName, idx) => {
            const mNum = idx + 1
            const isSelected = tempYear === year && mNum === month
            const isTodayMonth = tempYear === todayYear && mNum === todayMonth

            return (
              <ButtonBase
                key={mName}
                onClick={() => handleSelectMonth(idx)}
                sx={{
                  py: 1.25,
                  borderRadius: 2,
                  fontSize: '0.875rem',
                  fontWeight: isSelected ? 800 : isTodayMonth ? 700 : 500,
                  bgcolor: isSelected
                    ? 'primary.main'
                    : isTodayMonth
                      ? (theme) => alpha(theme.palette.primary.main, 0.08)
                      : 'transparent',
                  color: isSelected
                    ? 'primary.contrastText'
                    : isTodayMonth
                      ? 'primary.main'
                      : 'text.primary',
                  border: isSelected
                    ? 'none'
                    : isTodayMonth
                      ? '1px solid'
                      : '1px solid transparent',
                  borderColor: isTodayMonth ? 'primary.main' : 'transparent',
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    bgcolor: isSelected
                      ? 'primary.dark'
                      : (theme) => alpha(theme.palette.primary.main, 0.12),
                  },
                }}
              >
                {mName}
              </ButtonBase>
            )
          })}
        </Box>

        <Divider />

        {/* Jump to Current Month */}
        <Button
          fullWidth
          size="small"
          onClick={handleJumpToCurrent}
          sx={{
            textTransform: 'none',
            fontWeight: 650,
            borderRadius: 2,
            py: 0.75,
            color: 'primary.main',
          }}
        >
          Jump to This Month
        </Button>
      </Stack>
    </Popover>
  )
}

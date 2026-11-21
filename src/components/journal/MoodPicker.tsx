import ButtonBase from '@mui/material/ButtonBase'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import type { Mood } from '../../services/journalApi'
import { MOODS } from '../../utils/journal'

interface MoodPickerProps {
  value?: Mood | null
  onChange: (mood: Mood | null) => void
  disabled?: boolean
  size?: 'small' | 'medium'
}

export default function MoodPicker({
  value,
  onChange,
  disabled = false,
  size = 'medium',
}: MoodPickerProps) {
  const isSmall = size === 'small'

  return (
    <Stack
      direction="row"
      spacing={isSmall ? 1 : 1.5}
      role="radiogroup"
      aria-label="Mood"
      sx={{ flexWrap: 'wrap', gap: 1 }}
    >
      {MOODS.map((m) => {
        const isSelected = value === m.value
        return (
          <ButtonBase
            key={m.value}
            role="radio"
            aria-checked={isSelected}
            disabled={disabled}
            onClick={() => onChange(isSelected ? null : m.value)}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: isSmall ? 52 : 64,
              minHeight: isSmall ? 52 : 64,
              px: isSmall ? 1 : 1.5,
              py: isSmall ? 0.75 : 1,
              borderRadius: 2.5,
              border: '2px solid',
              borderColor: isSelected ? m.color : 'divider',
              bgcolor: isSelected ? alpha(m.color, 0.12) : 'background.paper',
              color: isSelected ? m.color : 'text.secondary',
              transition: 'all 0.15s ease',
              '&:hover': {
                borderColor: m.color,
                bgcolor: alpha(m.color, 0.08),
              },
            }}
          >
            <Typography sx={{ fontSize: isSmall ? '1.35rem' : '1.75rem', lineHeight: 1 }}>
              {m.emoji}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                mt: 0.5,
                fontWeight: isSelected ? 700 : 500,
                fontSize: isSmall ? '0.7rem' : '0.75rem',
                color: isSelected ? m.color : 'text.secondary',
              }}
            >
              {m.label}
            </Typography>
          </ButtonBase>
        )
      })}
    </Stack>
  )
}

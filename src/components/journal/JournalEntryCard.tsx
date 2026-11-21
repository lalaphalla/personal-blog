import { Link as RouterLink } from 'react-router'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import { CameraIcon, HeartIcon, TagIcon } from '../DocIcons'
import type { JournalEntrySummary } from '../../services/journalApi'
import { formatJournalTime, formatShortJournalDate, getMoodMeta } from '../../utils/journal'

interface JournalEntryCardProps {
  entry: JournalEntrySummary
  showDate?: boolean
  onToggleFavorite?: (id: number) => void
}

export default function JournalEntryCard({
  entry,
  showDate = false,
  onToggleFavorite,
}: JournalEntryCardProps) {
  const moodMeta = getMoodMeta(entry.mood)

  return (
    <Paper
      elevation={0}
      component={RouterLink}
      to={`/admin/journal/${entry.id}`}
      sx={{
        p: 2.5,
        borderRadius: 3,
        display: 'block',
        textDecoration: 'none',
        color: 'inherit',
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        transition: 'all 0.15s ease',
        '&:hover': {
          borderColor: 'primary.light',
          boxShadow: (theme) => `0 4px 16px ${alpha(theme.palette.common.black, 0.06)}`,
          transform: 'translateY(-1px)',
        },
      }}
    >
      <Stack spacing={1.5}>
        {/* Header row: time/date, mood badge, favorite */}
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
              {showDate
                ? formatShortJournalDate(entry.entry_date)
                : formatJournalTime(entry.created_at) || 'Entry'}
            </Typography>

            {moodMeta && (
              <Chip
                size="small"
                label={`${moodMeta.emoji} ${moodMeta.label}`}
                sx={{
                  bgcolor: moodMeta.bgColor,
                  color: moodMeta.color,
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  border: '1px solid',
                  borderColor: moodMeta.borderColor,
                }}
              />
            )}

            {entry.has_photos && (
              <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', color: 'text.secondary' }}>
                <CameraIcon sx={{ fontSize: 16 }} />
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  {entry.attachment_count}
                </Typography>
              </Stack>
            )}
          </Stack>

          {onToggleFavorite && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onToggleFavorite(entry.id)
              }}
              sx={{
                color: entry.is_favorite ? 'error.main' : 'action.disabled',
                '&:hover': { color: 'error.main' },
              }}
            >
              <HeartIcon sx={{ fontSize: 18 }} />
            </IconButton>
          )}
        </Stack>

        {/* Title (if present) */}
        {entry.title ? (
          <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
            {entry.title}
          </Typography>
        ) : null}

        {/* Excerpt */}
        {entry.excerpt ? (
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              lineHeight: 1.6,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {entry.excerpt}
          </Typography>
        ) : (
          <Typography variant="body2" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>
            Empty entry
          </Typography>
        )}

        {/* Tags */}
        {entry.tags && entry.tags.length > 0 && (
          <Stack direction="row" spacing={1} sx={{ pt: 0.5, flexWrap: 'wrap', gap: 0.75 }}>
            {entry.tags.map((tag) => (
              <Chip
                key={tag}
                size="small"
                icon={<TagIcon sx={{ fontSize: 14 }} />}
                label={tag}
                sx={{ fontSize: '0.75rem', borderRadius: 1.5 }}
              />
            ))}
          </Stack>
        )}
      </Stack>
    </Paper>
  )
}

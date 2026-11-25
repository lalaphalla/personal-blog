import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { EditIcon, StarFilledIcon, StarIcon } from '../DocIcons'
import type { RecallCard, RecallRating } from '../../services/recallApi'
import RecallMarkdown from './RecallMarkdown'

interface RecallFlashcardProps {
  card: RecallCard
  onRate: (rating: RecallRating) => Promise<void>
  onToggleFavorite: () => void
  onEdit: () => void
  isSubmitting?: boolean
}

function formatInterval(days: number): string {
  if (days <= 0) return 'Today'
  if (days === 1) return '1d'
  if (days < 30) return `${days}d`
  const months = Math.round(days / 30)
  return `${months}mo`
}

const RATINGS: Array<{
  value: RecallRating
  label: string
  shortcut: string
  color: 'error' | 'warning' | 'primary' | 'success'
}> = [
  { value: 'again', label: 'Again', shortcut: '1', color: 'error' },
  { value: 'hard', label: 'Hard', shortcut: '2', color: 'warning' },
  { value: 'good', label: 'Good', shortcut: '3', color: 'primary' },
  { value: 'easy', label: 'Easy', shortcut: '4', color: 'success' },
]

export default function RecallFlashcard({
  card,
  onRate,
  onToggleFavorite,
  onEdit,
  isSubmitting = false,
}: RecallFlashcardProps) {
  const [revealed, setRevealed] = useState(false)
  const [showHint, setShowHint] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return
      if (isSubmitting) return

      if (!revealed && (e.code === 'Space' || e.key === 'Enter')) {
        e.preventDefault()
        setRevealed(true)
        return
      }

      if (revealed) {
        if (e.key === '1') void onRate('again')
        else if (e.key === '2') void onRate('hard')
        else if (e.key === '3') void onRate('good')
        else if (e.key === '4') void onRate('easy')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isSubmitting, onRate, revealed])

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.5, sm: 4 },
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Stack spacing={2.5}>
        {/* Header: Deck, Tags, Favorite, Edit */}
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 0.75 }}>
            <Chip
              size="small"
              label={card.deck}
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 600, borderRadius: 1.5 }}
            />
            {card.tags.map((tag) => (
              <Chip
                key={tag}
                size="small"
                label={`#${tag}`}
                sx={{ fontSize: '0.75rem', borderRadius: 1.5 }}
              />
            ))}
          </Stack>

          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', flexShrink: 0 }}>
            <Tooltip title={card.is_favorite ? 'Remove favorite' : 'Favorite'}>
              <IconButton
                size="small"
                onClick={onToggleFavorite}
                sx={{ color: card.is_favorite ? 'warning.main' : 'action.disabled' }}
              >
                {card.is_favorite ? <StarFilledIcon /> : <StarIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit card">
              <IconButton size="small" onClick={onEdit}>
                <EditIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        {/* Front */}
        <Box
          sx={{
            py: { xs: 1.5, sm: 2.5 },
            '& p': { my: 0.75, fontSize: { xs: '1.05rem', sm: '1.2rem' }, fontWeight: 600, lineHeight: 1.55 },
            '& pre, & code': {
              fontFamily: 'monospace',
              bgcolor: 'action.hover',
              borderRadius: 1,
              px: 0.75,
              py: 0.25,
            },
          }}
        >
          <RecallMarkdown content={card.front} />
        </Box>

        {/* Optional Hint */}
        {!revealed && card.hint && (
          <Box>
            {!showHint ? (
              <Button
                size="small"
                variant="text"
                onClick={() => setShowHint(true)}
                sx={{ textTransform: 'none' }}
              >
                Show hint
              </Button>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                Hint: {card.hint}
              </Typography>
            )}
          </Box>
        )}

        {/* Reveal or Back + Rating */}
        {!revealed ? (
          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={() => setRevealed(true)}
            sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 700, py: 1.4 }}
          >
            Show Answer
          </Button>
        ) : (
          <Stack spacing={2.5}>
            <Divider />

            <Box
              sx={{
                '& p': { my: 0.75, lineHeight: 1.65, color: 'text.primary' },
                '& pre': {
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: 'grey.100',
                  overflowX: 'auto',
                  fontSize: '0.85rem',
                },
                '& code': {
                  fontFamily: 'monospace',
                  bgcolor: 'grey.100',
                  borderRadius: 1,
                  px: 0.6,
                  py: 0.15,
                  fontSize: '0.875em',
                },
                '& ul, & ol': { pl: 2.5, my: 0.75 },
              }}
            >
              <RecallMarkdown content={card.back} />
            </Box>

            {card.source_url && (
              <Link
                href={card.source_url}
                target="_blank"
                rel="noreferrer"
                variant="caption"
                sx={{ wordBreak: 'break-all' }}
              >
                Source: {card.source_url}
              </Link>
            )}

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
                gap: 1,
                pt: 0.5,
              }}
            >
              {RATINGS.map((r) => {
                const days = card.next_intervals?.[r.value] ?? 0
                return (
                  <Button
                    key={r.value}
                    variant="outlined"
                    color={r.color}
                    disabled={isSubmitting}
                    onClick={() => void onRate(r.value)}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      py: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      lineHeight: 1.2,
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {r.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatInterval(days)}
                    </Typography>
                  </Button>
                )
              })}
            </Box>
          </Stack>
        )}
      </Stack>
    </Paper>
  )
}

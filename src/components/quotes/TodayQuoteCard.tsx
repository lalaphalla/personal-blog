import { useState } from 'react'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import { HeartIcon, QuoteIcon, RefreshIcon } from '../DocIcons'
import { getRandomQuote, type Quote } from '../../services/quotesApi'
import { useDailyQuote, useQuotesMutations } from '../../hooks/useQuotesQueries'
import { getLocalTodayDateString } from '../../utils/journal'

const SERIF_FONT =
  "'Iowan Old Style', 'Palatino Linotype', Palatino, 'Source Serif 4', Georgia, serif"

export default function TodayQuoteCard() {
  const todayStr = getLocalTodayDateString()
  const { data: dailyQuote, isPending } = useDailyQuote(todayStr)
  const { toggleFavorite } = useQuotesMutations()

  const [shuffledQuote, setShuffledQuote] = useState<Quote | null>(null)
  const [isShuffling, setIsShuffling] = useState(false)

  const activeQuote = shuffledQuote || dailyQuote

  const handleShuffle = async () => {
    try {
      setIsShuffling(true)
      const random = await getRandomQuote(activeQuote?.id)
      if (random) {
        setShuffledQuote(random)
      }
    } finally {
      setIsShuffling(false)
    }
  }

  if (isPending && !activeQuote) {
    return null
  }

  if (!activeQuote) {
    return null
  }

  const dateOrYearDisplay = activeQuote.said_date || (activeQuote.said_year ? `~${activeQuote.said_year}` : '')

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.5, sm: 3 },
        borderRadius: 3.5,
        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
        border: '1px solid',
        borderColor: (theme) => alpha(theme.palette.primary.main, 0.12),
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Stack spacing={2}>
        {/* Top bar: Category badge, Quotation icon, Shuffle, and Favorite */}
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <QuoteIcon sx={{ color: 'primary.main', fontSize: 20 }} />
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                letterSpacing: 0.8,
                color: 'primary.main',
                textTransform: 'uppercase',
              }}
            >
              Daily Inspiration
            </Typography>

            {activeQuote.source_type && (
              <Chip
                size="small"
                label={activeQuote.source_type}
                sx={{
                  height: 20,
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  textTransform: 'capitalize',
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                  color: 'primary.dark',
                }}
              />
            )}
          </Stack>

          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
            <Tooltip title={activeQuote.is_favorite ? 'Favorited' : 'Mark favorite'}>
              <IconButton
                size="small"
                onClick={() => toggleFavorite.mutate(activeQuote.id)}
                sx={{
                  color: activeQuote.is_favorite ? 'error.main' : 'action.disabled',
                  '&:hover': { color: 'error.main' },
                }}
              >
                <HeartIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Shuffle inspiring quote">
              <IconButton
                size="small"
                onClick={handleShuffle}
                disabled={isShuffling}
                sx={{ color: 'text.secondary' }}
              >
                {isShuffling ? <CircularProgress size={16} /> : <RefreshIcon sx={{ fontSize: 18 }} />}
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        {/* Quote Content and Optional Image */}
        <Stack
          direction={{ xs: 'column', sm: activeQuote.image_url ? 'row' : 'column' }}
          spacing={2}
          sx={{ alignItems: { sm: 'center' } }}
        >
          {activeQuote.image_url && (
            <Avatar
              src={activeQuote.image_url}
              alt={activeQuote.author || 'Quote author'}
              sx={{
                width: { xs: 60, sm: 76 },
                height: { xs: 60, sm: 76 },
                borderRadius: 2.5,
                border: '2px solid',
                borderColor: 'background.paper',
                boxShadow: 1,
                flexShrink: 0,
              }}
            />
          )}

          <Box sx={{ flexGrow: 1 }}>
            <Typography
              variant="h6"
              sx={{
                fontFamily: SERIF_FONT,
                fontStyle: 'italic',
                fontWeight: 500,
                fontSize: { xs: '1.05rem', sm: '1.15rem' },
                color: 'text.primary',
                lineHeight: 1.6,
              }}
            >
              &ldquo;{activeQuote.content}&rdquo;
            </Typography>

            {/* Attribution */}
            <Stack
              direction="row"
              spacing={1}
              sx={{ mt: 1, alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}
            >
              {activeQuote.author && (
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  &mdash; {activeQuote.author}
                </Typography>
              )}

              {activeQuote.source_title && (
                <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                  {activeQuote.author ? `, ` : `&mdash; `}
                  {activeQuote.source_title}
                </Typography>
              )}

              {dateOrYearDisplay && (
                <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                  ({dateOrYearDisplay})
                </Typography>
              )}
            </Stack>

            {activeQuote.context && (
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.25 }}>
                Context: {activeQuote.context}
              </Typography>
            )}
          </Box>
        </Stack>
      </Stack>
    </Paper>
  )
}

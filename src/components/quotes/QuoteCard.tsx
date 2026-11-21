import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import { EditIcon, HeartIcon, TrashIcon } from '../DocIcons'
import { useQuotesMutations } from '../../hooks/useQuotesQueries'
import type { Quote } from '../../services/quotesApi'

const SERIF_FONT =
  "'Iowan Old Style', 'Palatino Linotype', Palatino, 'Source Serif 4', Georgia, serif"

interface QuoteCardProps {
  quote: Quote
  onEdit: (quote: Quote) => void
  onDelete: (quote: Quote) => void
}

export default function QuoteCard({ quote, onEdit, onDelete }: QuoteCardProps) {
  const { toggleFavorite } = useQuotesMutations()

  const dateOrYearDisplay = quote.said_date || (quote.said_year ? `~${quote.said_year}` : '')

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
        '&:hover': {
          borderColor: 'primary.main',
          boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.primary.main, 0.08)}`,
        },
      }}
    >
      <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top Badges and Action Icons */}
        <Stack
          direction="row"
          sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}
        >
          <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
            {quote.source_type && (
              <Chip
                size="small"
                label={quote.source_type}
                sx={{
                  height: 22,
                  fontSize: '0.675rem',
                  fontWeight: 700,
                  textTransform: 'capitalize',
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                  color: 'primary.dark',
                }}
              />
            )}

            {!quote.is_active && (
              <Chip
                size="small"
                label="Muted"
                variant="outlined"
                sx={{ height: 22, fontSize: '0.675rem', color: 'text.secondary' }}
              />
            )}
          </Stack>

          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
            <Tooltip title={quote.is_favorite ? 'Favorited' : 'Mark favorite'}>
              <IconButton
                size="small"
                onClick={() => toggleFavorite.mutate(quote.id)}
                sx={{
                  color: quote.is_favorite ? 'error.main' : 'text.disabled',
                  '&:hover': { color: 'error.main' },
                }}
              >
                <HeartIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Edit quote">
              <IconButton size="small" onClick={() => onEdit(quote)} sx={{ color: 'text.secondary' }}>
                <EditIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Delete quote">
              <IconButton
                size="small"
                onClick={() => onDelete(quote)}
                sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}
              >
                <TrashIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        {/* Content with Optional Avatar */}
        <Stack
          direction={{ xs: 'column', sm: quote.image_url ? 'row' : 'column' }}
          spacing={2}
          sx={{ flexGrow: 1, alignItems: { sm: 'flex-start' } }}
        >
          {quote.image_url && (
            <Avatar
              src={quote.image_url}
              alt={quote.author || 'Quote author'}
              sx={{
                width: 52,
                height: 52,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                flexShrink: 0,
              }}
            />
          )}

          <Box sx={{ flexGrow: 1 }}>
            <Typography
              variant="body1"
              sx={{
                fontFamily: SERIF_FONT,
                fontStyle: 'italic',
                fontWeight: 500,
                fontSize: '1rem',
                color: 'text.primary',
                lineHeight: 1.6,
                mb: 1,
              }}
            >
              &ldquo;{quote.content}&rdquo;
            </Typography>

            {/* Attribution */}
            <Stack
              direction="row"
              spacing={0.75}
              sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}
            >
              {quote.author && (
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  &mdash; {quote.author}
                </Typography>
              )}

              {quote.source_title && (
                <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                  {quote.author ? `, ` : `&mdash; `}
                  {quote.source_title}
                </Typography>
              )}

              {dateOrYearDisplay && (
                <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                  ({dateOrYearDisplay})
                </Typography>
              )}
            </Stack>

            {quote.context && (
              <Typography
                variant="caption"
                sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}
              >
                {quote.context}
              </Typography>
            )}

            {quote.source_url && (
              <Link
                href={quote.source_url}
                target="_blank"
                rel="noreferrer"
                variant="caption"
                sx={{
                  display: 'inline-block',
                  mt: 0.5,
                  color: 'primary.main',
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                View Reference &rarr;
              </Link>
            )}
          </Box>
        </Stack>

        {/* Tags */}
        {quote.tags && quote.tags.length > 0 && (
          <Stack
            direction="row"
            spacing={0.5}
            sx={{ mt: 2, pt: 1.5, borderTop: '1px solid', borderColor: 'divider', flexWrap: 'wrap', gap: 0.5 }}
          >
            {quote.tags.map((tag) => (
              <Chip
                key={tag}
                label={`#${tag}`}
                size="small"
                variant="outlined"
                sx={{ height: 20, fontSize: '0.65rem' }}
              />
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  )
}

import { useState } from 'react'
import { Link as RouterLink, useNavigate, useParams } from 'react-router'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import {
  ArrowLeftIcon,
  CloseIcon,
  EditIcon,
  HeartIcon,
  SparklesIcon,
  TagIcon,
  TrashIcon,
} from '../../../components/DocIcons'
import EmptyState from '../../../components/notes/EmptyState'
import { markdownSx } from '../../../components/markdownSx'
import { sharedMarkdownComponents } from '../../../components/markdownComponents'
import {
  useJournalEntry,
  useJournalMutations,
  useJournalPrompts,
} from '../../../hooks/useJournalQueries'
import {
  formatFullJournalDate,
  formatJournalTime,
  getMoodMeta,
} from '../../../utils/journal'

const SERIF_FONT =
  "'Iowan Old Style', 'Palatino Linotype', Palatino, 'Source Serif 4', Georgia, serif"

export default function JournalDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const entryId = id ? parseInt(id, 10) : null

  const { data: entry, isPending, isError } = useJournalEntry(entryId)
  const { data: prompts } = useJournalPrompts()
  const { deleteEntry, toggleFavorite } = useJournalMutations()

  const [activePhoto, setActivePhoto] = useState<string | null>(null)

  if (isPending) {
    return (
      <Stack sx={{ py: 12, alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Stack>
    )
  }

  if (isError || !entry) {
    return (
      <EmptyState
        title="Journal entry not found"
        description="This entry may have been deleted or does not exist."
        action={
          <Button variant="outlined" onClick={() => navigate('/admin/journal')}>
            Back to Journal
          </Button>
        }
      />
    )
  }

  const moodMeta = getMoodMeta(entry.mood)
  const prompt = entry.prompt_id && prompts
    ? prompts.find((p) => p.id === entry.prompt_id)
    : null

  const hasReflections = Boolean(
    entry.highlight || entry.gratitude || entry.challenge || entry.lesson
  )

  const handleDelete = async () => {
    if (window.confirm('Move this entry to Recently Deleted?')) {
      await deleteEntry.mutateAsync(entry.id)
      navigate('/admin/journal')
    }
  }

  return (
    <Stack spacing={3.5} sx={{ width: '100%', pb: 6 }}>
      {/* Top action header */}
      <Stack
        direction="row"
        sx={{
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 1.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Button
          size="small"
          startIcon={<ArrowLeftIcon />}
          onClick={() => navigate(-1)}
          sx={{ textTransform: 'none', color: 'text.secondary', px: 0 }}
        >
          Back
        </Button>

        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Tooltip title={entry.is_favorite ? 'Remove from favorites' : 'Mark as favorite'}>
            <IconButton
              size="small"
              onClick={() => toggleFavorite.mutate(entry.id)}
              sx={{
                color: entry.is_favorite ? 'error.main' : 'action.disabled',
                '&:hover': { color: 'error.main' },
              }}
            >
              <HeartIcon />
            </IconButton>
          </Tooltip>

          <Button
            component={RouterLink}
            to={`/admin/journal/${entry.id}/edit`}
            variant="contained"
            color="primary"
            size="small"
            startIcon={<EditIcon />}
            sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600, px: 2 }}
          >
            Edit
          </Button>

          <Button
            variant="outlined"
            color="error"
            size="small"
            startIcon={<TrashIcon />}
            onClick={handleDelete}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Delete
          </Button>
        </Stack>
      </Stack>

      {/* Main Journal Document */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 4, md: 5 },
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Stack spacing={3}>
          {/* Metadata Row: Date, time, mood, location */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            sx={{
              alignItems: { xs: 'flex-start', sm: 'center' },
              justifyContent: 'space-between',
              gap: 1.5,
            }}
          >
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                {formatFullJournalDate(entry.entry_date)}
              </Typography>
              {entry.created_at && (
                <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                  • {formatJournalTime(entry.created_at)}
                </Typography>
              )}
              {entry.location && (
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  📍 {entry.location}
                </Typography>
              )}
            </Stack>

            {moodMeta && (
              <Chip
                label={`${moodMeta.emoji} ${moodMeta.label}`}
                sx={{
                  bgcolor: moodMeta.bgColor,
                  color: moodMeta.color,
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  border: '1px solid',
                  borderColor: moodMeta.borderColor,
                  py: 0.5,
                }}
              />
            )}
          </Stack>

          {/* Title */}
          {entry.title ? (
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                letterSpacing: -0.5,
                color: 'text.primary',
                lineHeight: 1.25,
              }}
            >
              {entry.title}
            </Typography>
          ) : null}

          {/* Prompt Banner (if applicable) */}
          {prompt && (
            <Box
              sx={{
                p: 2,
                borderRadius: 2.5,
                bgcolor: (theme) => alpha(theme.palette.secondary.main || '#7c3aed', 0.06),
                borderLeft: '4px solid',
                borderColor: 'secondary.main',
              }}
            >
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.5 }}>
                <SparklesIcon sx={{ color: 'secondary.main', fontSize: 18 }} />
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 700, letterSpacing: 0.8, color: 'secondary.main' }}
                >
                  Prompt
                </Typography>
              </Stack>
              <Typography
                variant="body1"
                sx={{ fontStyle: 'italic', color: 'text.primary', fontWeight: 500 }}
              >
                &ldquo;{prompt.text}&rdquo;
              </Typography>
            </Box>
          )}

          {/* Markdown Content */}
          <Box
            sx={{
              ...markdownSx,
              fontFamily: SERIF_FONT,
              fontSize: '1.125rem',
              lineHeight: 1.85,
              color: 'text.primary',
              pt: 1,
            }}
          >
            {entry.content ? (
              <Markdown remarkPlugins={[remarkGfm]} components={sharedMarkdownComponents}>
                {entry.content}
              </Markdown>
            ) : (
              <Typography variant="body1" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>
                No body content recorded for this entry.
              </Typography>
            )}
          </Box>

          {/* Reflections Grid */}
          {hasReflections && (
            <Box sx={{ pt: 2 }}>
              <Divider sx={{ mb: 3 }} />
              <Typography
                variant="overline"
                sx={{ fontWeight: 700, letterSpacing: 1.2, color: 'text.secondary', display: 'block', mb: 2 }}
              >
                Reflections
              </Typography>

              <Stack spacing={2}>
                {entry.highlight && (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: 'action.hover',
                      borderLeft: '3px solid',
                      borderColor: 'primary.main',
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block' }}>
                      ✨ Highlight
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 0.5, whiteSpace: 'pre-line' }}>
                      {entry.highlight}
                    </Typography>
                  </Paper>
                )}

                {entry.gratitude && (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: 'action.hover',
                      borderLeft: '3px solid',
                      borderColor: 'success.main',
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block' }}>
                      🙏 Gratitude
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 0.5, whiteSpace: 'pre-line' }}>
                      {entry.gratitude}
                    </Typography>
                  </Paper>
                )}

                {entry.challenge && (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: 'action.hover',
                      borderLeft: '3px solid',
                      borderColor: 'warning.main',
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block' }}>
                      ⚡ Challenge
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 0.5, whiteSpace: 'pre-line' }}>
                      {entry.challenge}
                    </Typography>
                  </Paper>
                )}

                {entry.lesson && (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: 'action.hover',
                      borderLeft: '3px solid',
                      borderColor: 'info.main',
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block' }}>
                      💡 Lesson
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 0.5, whiteSpace: 'pre-line' }}>
                      {entry.lesson}
                    </Typography>
                  </Paper>
                )}
              </Stack>
            </Box>
          )}

          {/* Photos & Media Gallery */}
          {entry.attachments && entry.attachments.length > 0 && (
            <Box sx={{ pt: 2 }}>
              <Divider sx={{ mb: 3 }} />
              <Typography
                variant="overline"
                sx={{ fontWeight: 700, letterSpacing: 1.2, color: 'text.secondary', display: 'block', mb: 2 }}
              >
                Attached Photos ({entry.attachments.length})
              </Typography>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: 'repeat(auto-fill, minmax(130px, 1fr))',
                    sm: 'repeat(auto-fill, minmax(180px, 1fr))',
                  },
                  gap: 2,
                }}
              >
                {entry.attachments.map((att) => (
                  <Paper
                    key={att.id}
                    elevation={0}
                    onClick={() => setActivePhoto(att.url)}
                    sx={{
                      aspectRatio: '1 / 1',
                      borderRadius: 2.5,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border: '1px solid',
                      borderColor: 'divider',
                      transition: 'transform 0.15s ease',
                      '&:hover': {
                        transform: 'scale(1.02)',
                      },
                    }}
                  >
                    <Box
                      component="img"
                      src={att.url}
                      alt={att.filename}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  </Paper>
                ))}
              </Box>
            </Box>
          )}

          {/* Tags */}
          {entry.tags && entry.tags.length > 0 && (
            <Box sx={{ pt: 1 }}>
              <Divider sx={{ mb: 2 }} />
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                {entry.tags.map((tag) => (
                  <Chip
                    key={tag}
                    icon={<TagIcon sx={{ fontSize: 15 }} />}
                    label={tag}
                    sx={{ borderRadius: 2 }}
                  />
                ))}
              </Stack>
            </Box>
          )}
        </Stack>
      </Paper>

      {/* Full Size Photo Modal */}
      <Dialog
        open={Boolean(activePhoto)}
        onClose={() => setActivePhoto(null)}
        maxWidth="md"
        fullWidth
      >
        <Box sx={{ position: 'relative', bgcolor: 'black', p: 1, textAlign: 'center' }}>
          <IconButton
            onClick={() => setActivePhoto(null)}
            sx={{ position: 'absolute', top: 12, right: 12, color: 'white', bgcolor: 'rgba(0,0,0,0.5)' }}
          >
            <CloseIcon />
          </IconButton>
          {activePhoto && (
            <Box
              component="img"
              src={activePhoto}
              alt="Enlarged attachment"
              sx={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain' }}
            />
          )}
        </Box>
      </Dialog>
    </Stack>
  )
}

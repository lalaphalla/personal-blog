import { useMemo, useState, type ReactNode } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link as RouterLink, useParams } from 'react-router'
import Markdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Container from '@mui/material/Container'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Paper from '@mui/material/Paper'
import Snackbar from '@mui/material/Snackbar'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import { markdownSx } from '../../components/markdownSx'
import {
  ArchiveIcon,
  ArrowLeftIcon,
  BookOpenIcon,
  CalendarIcon,
  ClockIcon,
  CopyIcon,
  EditIcon,
  FileTextIcon,
  HashIcon,
  StarFilledIcon,
  StarIcon,
  TagIcon,
} from '../../components/DocIcons'
import { getErrorMessage } from '../../config/queryClient'
import {
  archiveNote,
  getNote,
  listNotebooks,
  toggleFavoriteNote,
  unarchiveNote,
  type Note,
} from '../../services/notesApi'

const SERIF_FONT = "'Iowan Old Style', 'Palatino Linotype', Palatino, 'Source Serif 4', Georgia, serif"
const PROPERTY_COUNT = 6

const documentSx = {
  ...markdownSx,
  fontFamily: SERIF_FONT,
  fontSize: '1.0625rem',
  lineHeight: 1.85,
  '& > :first-of-type': { mt: 0 },
  '& > :last-child': { mb: 0 },
  '& p, & ul, & ol': { my: 0, mb: 2.25 },
  '& li': { mb: 0.65 },
  '& h1, & h2, & h3, & h4': {
    fontFamily: SERIF_FONT,
    color: 'text.primary',
    scrollMarginTop: 32,
  },
  '& h1': { mt: 4, mb: 1.5, fontSize: '1.9rem', fontWeight: 600, letterSpacing: '-0.02em' },
  '& h2': { mt: 3.5, mb: 1.25, fontSize: '1.45rem', fontWeight: 600, letterSpacing: '-0.01em' },
  '& h3': { mt: 2.5, mb: 1, fontSize: '1.15rem', fontWeight: 600 },
  '& h4': { mt: 2, mb: 0.75, fontSize: '1rem', fontWeight: 600 },
  '& ul, & ol': { pl: 3 },
  '& li::marker': { color: 'primary.main' },
  '& a': { color: 'primary.main', textDecorationColor: 'currentColor' },
  '& blockquote': {
    my: 2.5,
    mx: 0,
    pl: 2.25,
    borderLeft: '3px solid',
    borderColor: 'primary.light',
    color: 'text.secondary',
    fontStyle: 'italic',
  },
  '& hr': { my: 3.5, border: 0, borderTop: '1px solid', borderColor: 'divider' },
  '& code': {
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
    fontSize: '0.85em',
    px: 0.5,
    py: 0.25,
    borderRadius: 1,
    bgcolor: 'action.hover',
  },
  '& pre': {
    my: 2.5,
    p: 2,
    borderRadius: 2,
    overflowX: 'auto',
    bgcolor: 'grey.50',
    border: '1px solid',
    borderColor: 'divider',
    '& code': { bgcolor: 'transparent', p: 0 },
  },
  '& img': { maxWidth: '100%', borderRadius: 2 },
  '& table': { width: '100%', my: 2.5, borderCollapse: 'collapse', fontSize: '0.9em' },
} as const

interface OutlineItem {
  id: string
  text: string
  level: number
}

function slugify(text: string): string {
  const slug = text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .trim()
    .replace(/\s+/g, '-')
  return slug || 'section'
}

/** Flatten rendered heading children back into plain text for anchor ids. */
function flattenText(children: ReactNode): string {
  if (typeof children === 'string' || typeof children === 'number') return String(children)
  if (Array.isArray(children)) return children.map(flattenText).join('')
  if (children && typeof children === 'object' && 'props' in children) {
    return flattenText((children.props as { children?: ReactNode }).children)
  }
  return ''
}

const markdownComponents: Components = {
  h1: ({ children }) => <h1 id={slugify(flattenText(children))}>{children}</h1>,
  h2: ({ children }) => <h2 id={slugify(flattenText(children))}>{children}</h2>,
  h3: ({ children }) => <h3 id={slugify(flattenText(children))}>{children}</h3>,
  h4: ({ children }) => <h4 id={slugify(flattenText(children))}>{children}</h4>,
}

function buildOutline(content: string): OutlineItem[] {
  const items: OutlineItem[] = []
  const seen = new Map<string, number>()
  for (const line of content.split('\n')) {
    const match = /^(#{1,4})\s+(.+?)\s*#*\s*$/.exec(line)
    if (!match) continue
    const text = match[2]
      .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/[*_`~]/g, '')
      .trim()
    if (!text) continue
    const base = slugify(text)
    const count = seen.get(base) ?? 0
    seen.set(base, count + 1)
    items.push({ id: count === 0 ? base : `${base}-${count}`, text, level: match[1].length })
  }
  return items
}

function countStats(content: string) {
  const chars = [...content].length
  const cjk = content.match(/[\u3400-\u9fff\uf900-\ufaff]/g)?.length ?? 0
  const latin = content
    .replace(/[\u3400-\u9fff\uf900-\ufaff]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length
  const words = cjk + latin
  return {
    chars,
    words,
    minutes: words > 0 ? Math.max(1, Math.ceil(words / 200)) : 0,
  }
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function PropertyRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: ReactNode
}) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '18px 74px minmax(0, 1fr)',
        columnGap: 1,
        alignItems: 'center',
        py: 0.75,
      }}
    >
      <Box sx={{ display: 'flex', color: 'text.disabled' }}>{icon}</Box>
      <Typography variant="caption" color="text.secondary" noWrap>
        {label}
      </Typography>
      <Box
        sx={{
          minWidth: 0,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 0.5,
          alignItems: 'center',
          fontSize: '0.8125rem',
        }}
      >
        {value}
      </Box>
    </Box>
  )
}

function NoteViewPage() {
  const { id } = useParams()
  const noteId = id ? Number(id) : undefined
  const queryClient = useQueryClient()
  const [snack, setSnack] = useState<string | null>(null)

  const { data: note, isPending, isError, error } = useQuery({
    queryKey: ['admin', 'notes', noteId],
    queryFn: () => getNote(noteId!),
    enabled: Boolean(noteId),
  })

  const { data: notebooks } = useQuery({
    queryKey: ['admin', 'notebooks'],
    queryFn: listNotebooks,
  })

  const syncNote = (updated: Note) => {
    queryClient.setQueryData(['admin', 'notes', noteId], updated)
    queryClient.invalidateQueries({ queryKey: ['admin', 'notes', 'list'] })
    queryClient.invalidateQueries({ queryKey: ['admin', 'notes', 'stats'] })
  }

  const favoriteMutation = useMutation({
    mutationFn: () => toggleFavoriteNote(noteId!),
    onSuccess: syncNote,
  })

  const archiveMutation = useMutation({
    mutationFn: () => (note?.archived_at ? unarchiveNote(noteId!) : archiveNote(noteId!)),
    onSuccess: syncNote,
  })

  const stats = useMemo(() => countStats(note?.content ?? ''), [note?.content])
  const outline = useMemo(() => buildOutline(note?.content ?? ''), [note?.content])

  if (!noteId || isPending) {
    return (
      <Stack sx={{ alignItems: 'center', py: 8 }}>
        <CircularProgress />
      </Stack>
    )
  }

  if (isError || !note) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Button component={RouterLink} to="/admin/notes" size="small" startIcon={<ArrowLeftIcon />}>
          All notes
        </Button>
        <Alert severity="error" sx={{ mt: 2 }}>
          {getErrorMessage(error)}
        </Alert>
      </Container>
    )
  }

  const displayTitle = note.title.trim() || 'Untitled'
  const notebookName = notebooks?.find((item) => item.id === note.notebook_id)?.name

  const copyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(note.content)
      setSnack('Markdown copied to clipboard')
    } catch {
      setSnack('Could not copy markdown')
    }
  }

  return (
    <Box>
      {/* Document toolbar: breadcrumb + note actions */}
      <Stack
        direction="row"
        sx={{
          alignItems: 'center',
          gap: 1,
          mb: 2.5,
          flexWrap: 'wrap',
          rowGap: 1,
        }}
      >
        <Button
          component={RouterLink}
          to="/admin/notes"
          size="small"
          startIcon={<ArrowLeftIcon />}
          sx={{ color: 'text.secondary', flexShrink: 0 }}
        >
          Notes
        </Button>
        <Divider orientation="vertical" flexItem sx={{ my: 0.75 }} />
        <Stack
          direction="row"
          spacing={0.75}
          sx={{ alignItems: 'center', minWidth: 0, color: 'text.secondary' }}
        >
          <BookOpenIcon sx={{ fontSize: 18, flexShrink: 0 }} />
          <Typography variant="body2" noWrap>
            {notebookName ?? 'Unfiled'}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.4 }}>
            /
          </Typography>
          <Typography
            variant="body2"
            noWrap
            sx={{ color: 'text.primary', fontWeight: 600, maxWidth: { xs: 160, sm: 360 } }}
          >
            {displayTitle}
          </Typography>
        </Stack>
        <Box sx={{ flex: 1 }} />
        <Tooltip title={note.is_favorite ? 'Remove from favorites' : 'Add to favorites'}>
          <IconButton
            size="small"
            onClick={() => favoriteMutation.mutate()}
            disabled={favoriteMutation.isPending}
            sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
          >
            {note.is_favorite ? (
              <StarFilledIcon sx={{ color: 'warning.main' }} />
            ) : (
              <StarIcon />
            )}
          </IconButton>
        </Tooltip>
        <Tooltip title={note.archived_at ? 'Unarchive note' : 'Archive note'}>
          <IconButton
            size="small"
            onClick={() => archiveMutation.mutate()}
            disabled={archiveMutation.isPending}
            sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
          >
            <ArchiveIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Copy markdown">
          <IconButton
            size="small"
            onClick={() => void copyMarkdown()}
            sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
          >
            <CopyIcon />
          </IconButton>
        </Tooltip>
        <Button
          variant="contained"
          component={RouterLink}
          to={`/admin/notes/${note.id}/edit`}
          startIcon={<EditIcon />}
          sx={{ borderRadius: 2 }}
        >
          Edit
        </Button>
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'minmax(0, 1fr) 292px' },
          gap: 2.5,
          alignItems: 'start',
        }}
      >
        {/* Document paper */}
        <Paper
          variant="outlined"
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
            bgcolor: 'background.paper',
            boxShadow: '0 1px 2px rgba(8, 6, 13, 0.04)',
          }}
        >
          <Box sx={{ px: { xs: 2.5, md: 5.5 }, pt: { xs: 3, md: 4.5 }, pb: { xs: 2.5, md: 3.5 } }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1.25, flexWrap: 'wrap', rowGap: 0.5 }}>
              <Typography
                variant="overline"
                sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: 1.4, lineHeight: 1.4 }}
              >
                Note
              </Typography>
              {note.is_favorite ? (
                <Chip
                  size="small"
                  icon={<StarFilledIcon sx={{ fontSize: 13 }} />}
                  label="Favorite"
                  sx={{
                    height: 21,
                    fontSize: '0.7rem',
                    bgcolor: (theme) => alpha(theme.palette.warning.main, 0.14),
                    color: 'warning.dark',
                  }}
                />
              ) : null}
              {note.archived_at ? (
                <Chip
                  size="small"
                  icon={<ArchiveIcon sx={{ fontSize: 13 }} />}
                  label="Archived"
                  sx={{ height: 21, fontSize: '0.7rem' }}
                />
              ) : null}
            </Stack>

            <Typography
              component="h1"
              sx={{
                fontFamily: SERIF_FONT,
                fontSize: 'clamp(2rem, 1.4rem + 1.6vw, 2.6rem)',
                fontWeight: 600,
                lineHeight: 1.15,
                letterSpacing: '-0.02em',
                wordBreak: 'break-word',
              }}
            >
              {displayTitle}
            </Typography>

            <Stack
              direction="row"
              spacing={2}
              sx={{ mt: 1.5, alignItems: 'center', flexWrap: 'wrap', rowGap: 0.75, color: 'text.secondary' }}
            >
              <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                <CalendarIcon sx={{ fontSize: 15 }} />
                <Typography variant="caption">{formatDateTime(note.updated_at)}</Typography>
              </Stack>
              <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                <ClockIcon sx={{ fontSize: 15 }} />
                <Typography variant="caption">
                  {stats.minutes > 0 ? `${stats.minutes} min read` : 'Empty note'}
                </Typography>
              </Stack>
            </Stack>

            {note.tags.length > 0 ? (
              <Stack direction="row" spacing={0.5} sx={{ mt: 1.75, flexWrap: 'wrap', rowGap: 0.5 }}>
                {note.tags.map((tag) => (
                  <Chip
                    key={tag}
                    size="small"
                    variant="outlined"
                    label={tag}
                    sx={{ height: 23, fontSize: '0.72rem' }}
                  />
                ))}
              </Stack>
            ) : null}
          </Box>

          <Divider />

          <Box sx={{ px: { xs: 2.5, md: 5.5 }, py: { xs: 3, md: 4.5 } }}>
            {note.content.trim() ? (
              <Box component="article" sx={documentSx}>
                <Markdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                  {note.content}
                </Markdown>
              </Box>
            ) : (
              <Box
                sx={{
                  textAlign: 'center',
                  py: 6,
                  px: 3,
                  border: '1px dashed',
                  borderColor: 'divider',
                  borderRadius: 2,
                  color: 'text.secondary',
                }}
              >
                <FileTextIcon sx={{ fontSize: 34, color: 'text.disabled', mb: 1 }} />
                <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>This note is empty</Typography>
                <Typography variant="body2" sx={{ mt: 0.5, mb: 2 }}>
                  Start writing to fill this page with ideas.
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  component={RouterLink}
                  to={`/admin/notes/${note.id}/edit`}
                  startIcon={<EditIcon />}
                >
                  Start writing
                </Button>
              </Box>
            )}
          </Box>

          {/* Status bar, similar to a document workspace footer */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 1,
              rowGap: 0.5,
              px: { xs: 2.5, md: 4 },
              py: 1.25,
              borderTop: '1px solid',
              borderColor: 'divider',
              bgcolor: 'action.hover',
            }}
          >
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center', color: 'text.secondary' }}>
              <Typography variant="caption">{PROPERTY_COUNT} properties</Typography>
              <Typography variant="caption">{stats.words.toLocaleString()} words</Typography>
              <Typography variant="caption">{stats.chars.toLocaleString()} characters</Typography>
            </Stack>
            <Typography variant="caption" color="text.secondary">
              Updated {formatDateTime(note.updated_at)}
            </Typography>
          </Box>
        </Paper>

        {/* Inspector column: properties + outline */}
        <Stack spacing={2} sx={{ position: { lg: 'sticky' }, top: { lg: 24 }, alignSelf: 'start' }}>
          <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <Box
              sx={{
                px: 2,
                py: 1.25,
                borderBottom: '1px solid',
                borderColor: 'divider',
                bgcolor: 'action.hover',
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Properties
              </Typography>
            </Box>
            <Box sx={{ px: 2, py: 0.75 }}>
              <PropertyRow
                icon={<HashIcon sx={{ fontSize: 15 }} />}
                label="UID"
                value={<Typography variant="caption">NT-{String(note.id).padStart(5, '0')}</Typography>}
              />
              <PropertyRow
                icon={<BookOpenIcon sx={{ fontSize: 15 }} />}
                label="Notebook"
                value={
                  <Typography variant="caption" color={notebookName ? 'text.primary' : 'text.secondary'}>
                    {notebookName ?? 'Unfiled'}
                  </Typography>
                }
              />
              <PropertyRow
                icon={<TagIcon sx={{ fontSize: 15 }} />}
                label="Tags"
                value={
                  note.tags.length > 0 ? (
                    note.tags.map((tag) => (
                      <Chip
                        key={tag}
                        size="small"
                        label={tag}
                        sx={{ height: 20, fontSize: '0.68rem' }}
                      />
                    ))
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      Empty
                    </Typography>
                  )
                }
              />
              <PropertyRow
                icon={<CalendarIcon sx={{ fontSize: 15 }} />}
                label="Created"
                value={<Typography variant="caption">{formatDateTime(note.created_at)}</Typography>}
              />
              <PropertyRow
                icon={<ClockIcon sx={{ fontSize: 15 }} />}
                label="Updated"
                value={<Typography variant="caption">{formatDateTime(note.updated_at)}</Typography>}
              />
              <PropertyRow
                icon={<FileTextIcon sx={{ fontSize: 15 }} />}
                label="Status"
                value={
                  <>
                    {note.archived_at ? (
                      <Chip size="small" label="Archived" sx={{ height: 20, fontSize: '0.68rem' }} />
                    ) : (
                      <Chip
                        size="small"
                        label="Active"
                        sx={{
                          height: 20,
                          fontSize: '0.68rem',
                          bgcolor: (theme) => alpha(theme.palette.success.main, 0.14),
                          color: 'success.dark',
                        }}
                      />
                    )}
                    {note.is_favorite ? (
                      <Chip
                        size="small"
                        label="Favorite"
                        sx={{
                          height: 20,
                          fontSize: '0.68rem',
                          bgcolor: (theme) => alpha(theme.palette.warning.main, 0.14),
                          color: 'warning.dark',
                        }}
                      />
                    ) : null}
                  </>
                }
              />
            </Box>
          </Paper>

          {outline.length > 0 ? (
            <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
              <Box
                sx={{
                  px: 2,
                  py: 1.25,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'action.hover',
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Contents
                </Typography>
              </Box>
              <List disablePadding dense sx={{ p: 0.75 }}>
                {outline.map((item) => (
                  <ListItemButton
                    key={item.id}
                    component="a"
                    href={`#${item.id}`}
                    sx={{
                      borderRadius: 1.5,
                      py: 0.4,
                      pl: 1 + Math.max(0, item.level - 1) * 1.25,
                    }}
                  >
                    <ListItemText
                      primary={item.text}
                      slotProps={{
                        primary: {
                          variant: 'body2',
                          noWrap: true,
                          sx: {
                            fontSize: '0.8125rem',
                            color: item.level === 1 ? 'text.primary' : 'text.secondary',
                          },
                        },
                      }}
                    />
                  </ListItemButton>
                ))}
              </List>
            </Paper>
          ) : null}
        </Stack>
      </Box>

      <Snackbar
        open={Boolean(snack)}
        autoHideDuration={2200}
        onClose={() => setSnack(null)}
        message={snack ?? ''}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  )
}

export default NoteViewPage

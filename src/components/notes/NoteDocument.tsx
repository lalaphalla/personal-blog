import { useMemo, type ReactNode } from 'react'
import Markdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import {
  ArchiveIcon,
  BookOpenIcon,
  CalendarIcon,
  ClockIcon,
  EditIcon,
  FileTextIcon,
  HashIcon,
  StarFilledIcon,
  TagIcon,
} from '../DocIcons'
import { markdownSx } from '../markdownSx'
import type { Note } from '../../services/notesApi'
import {
  buildOutline,
  countStats,
  formatNoteDateTime,
  noteTitle,
  slugify,
} from '../../utils/notes'

const SERIF_FONT = "'Iowan Old Style', 'Palatino Linotype', Palatino, 'Source Serif 4', Georgia, serif"

const documentSx = {
  ...markdownSx,
  fontFamily: SERIF_FONT,
  fontSize: '1.0625rem',
  lineHeight: 1.85,
  '& > :first-of-type': { mt: 0 },
  '& > :last-child': { mb: 0 },
  '& p': { my: 0, mb: 2.25, whiteSpace: 'pre-line' },
  '& ul, & ol': { my: 0, mb: 2.25, pl: 3 },
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
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
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

interface NoteDocumentProps {
  note: Note
  notebookName?: string
  onEdit: () => void
  onSelectTag?: (tag: string) => void
  /** Tighter padding used inside the workspace pane. */
  compact?: boolean
}

/** Reading view for a note: serif document, metadata, tags, footer stats. */
export function NoteDocument({ note, notebookName, onEdit, onSelectTag, compact = false }: NoteDocumentProps) {
  const stats = useMemo(() => countStats(note.content), [note.content])

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        bgcolor: 'background.paper',
        boxShadow: '0 1px 2px rgba(8, 6, 13, 0.04)',
        width: '100%',
        maxWidth: compact ? 820 : 900,
        mx: 'auto',
      }}
    >
      <Box sx={{ px: { xs: 2.5, md: compact ? 4 : 5.5 }, pt: { xs: 3, md: compact ? 3.5 : 4.5 }, pb: { xs: 2.5, md: 3.5 } }}>
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
          {noteTitle(note)}
        </Typography>

        <Stack
          direction="row"
          spacing={2}
          sx={{ mt: 1.5, alignItems: 'center', flexWrap: 'wrap', rowGap: 0.75, color: 'text.secondary' }}
        >
          <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
            <CalendarIcon sx={{ fontSize: 15 }} />
            <Typography variant="caption">{formatNoteDateTime(note.updated_at)}</Typography>
          </Stack>
          <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
            <ClockIcon sx={{ fontSize: 15 }} />
            <Typography variant="caption">
              {stats.minutes > 0 ? `${stats.minutes} min read` : 'Empty note'}
            </Typography>
          </Stack>
          {notebookName ? (
            <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
              <BookOpenIcon sx={{ fontSize: 15 }} />
              <Typography variant="caption">{notebookName}</Typography>
            </Stack>
          ) : null}
        </Stack>

        {note.tags.length > 0 ? (
          <Stack direction="row" spacing={0.5} sx={{ mt: 1.75, flexWrap: 'wrap', rowGap: 0.5 }}>
            {note.tags.map((tag) => (
              <Chip
                key={tag}
                size="small"
                variant="outlined"
                label={tag}
                onClick={onSelectTag ? () => onSelectTag(tag) : undefined}
                sx={{ height: 23, fontSize: '0.72rem' }}
              />
            ))}
          </Stack>
        ) : null}
      </Box>

      <Divider />

      <Box sx={{ px: { xs: 2.5, md: compact ? 4 : 5.5 }, py: { xs: 3, md: compact ? 3.5 : 4.5 } }}>
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
            <Button variant="outlined" size="small" onClick={onEdit} startIcon={<EditIcon />}>
              Start writing
            </Button>
          </Box>
        )}
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1,
          rowGap: 0.5,
          px: { xs: 2.5, md: compact ? 3.5 : 4 },
          py: 1.25,
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: 'action.hover',
        }}
      >
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center', color: 'text.secondary' }}>
          <Typography variant="caption">6 properties</Typography>
          <Typography variant="caption">{stats.words.toLocaleString()} words</Typography>
          <Typography variant="caption">{stats.chars.toLocaleString()} characters</Typography>
        </Stack>
        <Typography variant="caption" color="text.secondary">
          Updated {formatNoteDateTime(note.updated_at)}
        </Typography>
      </Box>
    </Paper>
  )
}

interface NoteInspectorProps {
  note: Note
  notebookName?: string
  onSelectTag?: (tag: string) => void
}

/** Properties + contents sidebar for the note pane. */
export function NoteInspector({ note, notebookName, onSelectTag }: NoteInspectorProps) {
  const outline = useMemo(() => buildOutline(note.content), [note.content])

  return (
    <Stack spacing={2}>
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
                    onClick={onSelectTag ? () => onSelectTag(tag) : undefined}
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
            value={<Typography variant="caption">{formatNoteDateTime(note.created_at)}</Typography>}
          />
          <PropertyRow
            icon={<ClockIcon sx={{ fontSize: 15 }} />}
            label="Updated"
            value={<Typography variant="caption">{formatNoteDateTime(note.updated_at)}</Typography>}
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
  )
}

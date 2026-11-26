import { useMemo, useState } from 'react'
import { Link as RouterLink } from 'react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Link from '@mui/material/Link'
import Paper from '@mui/material/Paper'
import Snackbar from '@mui/material/Snackbar'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { BookmarkIcon, PlusIcon, ReaderIcon, SearchIcon, TrashIcon } from '../../../components/DocIcons'
import EmptyState from '../../../components/notes/EmptyState'
import FeedManagerDialog from '../../../components/reader/FeedManagerDialog'
import HnCommentsDrawer from '../../../components/reader/HnCommentsDrawer'
import RecallCardDialog from '../../../components/recall/RecallCardDialog'
import { useRecallMutations, useRecallStats } from '../../../hooks/useRecallQueries'
import {
  useFeedItems,
  useFeedSources,
  useHnFeed,
  useReaderMutations,
  useSavedArticles,
} from '../../../hooks/useReaderQueries'
import { createNote } from '../../../services/notesApi'
import type { RecallCardCreateInput } from '../../../services/recallApi'
import type { HnCategory } from '../../../services/readerApi'

type ReaderTab = 'hn' | 'feeds' | 'saved'

const HN_CATEGORIES: Array<{ value: HnCategory; label: string }> = [
  { value: 'top', label: 'Top' },
  { value: 'new', label: 'New' },
  { value: 'ask', label: 'Ask HN' },
  { value: 'show', label: 'Show HN' },
]

function formatTimeAgo(iso: string | null): string {
  if (!iso) return ''
  const ts = Date.parse(iso)
  if (Number.isNaN(ts)) return iso
  const diffMin = Math.max(1, Math.floor((Date.now() - ts) / 60_000))
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  return `${Math.floor(diffHr / 24)}d ago`
}

export default function ReaderPage() {
  const [activeTab, setActiveTab] = useState<ReaderTab>('hn')
  const [hnCategory, setHnCategory] = useState<HnCategory>('top')
  const [hnSearchInput, setHnSearchInput] = useState('')
  const [hnSearch, setHnSearch] = useState('')
  const [hnPage, setHnPage] = useState(0)
  const [activeHnId, setActiveHnId] = useState<number | null>(null)

  const [selectedSourceId, setSelectedSourceId] = useState<number | undefined>(undefined)
  const [feedDialogOpen, setFeedDialogOpen] = useState(false)
  const [savedFilter, setSavedFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [recallPrefill, setRecallPrefill] = useState<Partial<RecallCardCreateInput> | null>(null)
  const [notice, setNotice] = useState<{ message: string; noteId?: number } | null>(null)

  const qc = useQueryClient()
  const { data: recallStats } = useRecallStats()
  const { create: createRecallCard } = useRecallMutations()
  const saveToNotes = useMutation({
    mutationFn: (input: { title: string; url: string; source: string; summary?: string | null }) =>
      createNote({
        title: input.title,
        content: `Source: [${input.source}](${input.url})${
          input.summary ? `\n\n${input.summary}` : ''
        }\n`,
        tags: ['reader'],
      }),
    onSuccess: (created) => {
      qc.invalidateQueries({ queryKey: ['notes'] })
      setNotice({ message: 'Saved to Notes', noteId: created.id })
    },
  })

  const { data: hnFeed, isPending: hnLoading, isError: hnError } = useHnFeed(
    hnCategory,
    hnSearch || undefined,
    hnPage,
  )
  const { data: feedSources = [] } = useFeedSources()
  const { data: feedItems = [], isPending: feedsLoading } = useFeedItems(selectedSourceId)
  const { data: savedArticles = [], isPending: savedLoading } = useSavedArticles(
    savedFilter === 'all' ? undefined : savedFilter === 'read',
  )

  const { addFeed, removeFeed, bookmark, toggleRead, removeBookmark } = useReaderMutations()

  const savedUrlMap = useMemo(
    () => new Map(savedArticles.map((a) => [a.url, a])),
    [savedArticles],
  )

  const handleToggleBookmark = (input: {
    title: string
    url: string
    source: string
    author?: string | null
    hn_id?: number | null
    summary?: string | null
  }) => {
    const existing = savedUrlMap.get(input.url)
    if (existing) {
      removeBookmark.mutate(existing.id)
    } else {
      bookmark.mutate(input)
    }
  }

  return (
    <Box sx={{ maxWidth: 960, mx: 'auto', px: { xs: 2, sm: 3 }, py: { xs: 2.5, sm: 4 } }}>
      <Stack spacing={3}>
        {/* Header */}
        <Stack
          direction="row"
          sx={{
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1.5,
          }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -0.5 }}>
              Reader
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Hacker News, custom RSS/Atom feeds, and saved reading.
            </Typography>
          </Box>

          <Button
            variant="outlined"
            startIcon={<PlusIcon />}
            onClick={() => setFeedDialogOpen(true)}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            Manage Feeds ({feedSources.length})
          </Button>
        </Stack>

        {/* Main Tabs */}
        <Tabs
          value={activeTab}
          onChange={(_e, val: ReaderTab) => setActiveTab(val)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab value="hn" label="Hacker News" sx={{ textTransform: 'none', fontWeight: 600 }} />
          <Tab
            value="feeds"
            label={`My Feeds (${feedSources.length})`}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          />
          <Tab
            value="saved"
            label={`Saved (${savedArticles.length})`}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          />
        </Tabs>

        {/* ---- TAB 1: HACKER NEWS ---- */}
        {activeTab === 'hn' && (
          <Stack spacing={2.5}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1.5}
              sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}
            >
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.75 }}>
                {HN_CATEGORIES.map((cat) => (
                  <Button
                    key={cat.value}
                    size="small"
                    variant={!hnSearch && hnCategory === cat.value ? 'contained' : 'outlined'}
                    onClick={() => {
                      setHnSearch('')
                      setHnSearchInput('')
                      setHnCategory(cat.value)
                      setHnPage(0)
                    }}
                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                  >
                    {cat.label}
                  </Button>
                ))}
              </Stack>

              <Box
                component="form"
                onSubmit={(e) => {
                  e.preventDefault()
                  setHnSearch(hnSearchInput.trim())
                  setHnPage(0)
                }}
              >
                <TextField
                  size="small"
                  placeholder="Search Hacker News..."
                  value={hnSearchInput}
                  onChange={(e) => setHnSearchInput(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{ width: { xs: '100%', sm: 260 } }}
                />
              </Box>
            </Stack>

            {hnLoading ? (
              <Stack sx={{ py: 10, alignItems: 'center' }}>
                <CircularProgress />
              </Stack>
            ) : hnError || !hnFeed ? (
              <EmptyState
                title="Unable to load Hacker News"
                description="Please check your connection and try again."
              />
            ) : hnFeed.items.length === 0 ? (
              <EmptyState
                title="No stories found"
                description="Try another search query or category."
                icon={<ReaderIcon sx={{ fontSize: 28 }} />}
              />
            ) : (
              <Stack spacing={1.5}>
                {hnFeed.items.map((story, idx) => {
                  const isSaved = savedUrlMap.has(story.url)
                  return (
                    <Paper
                      key={story.id}
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: 2.5,
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Stack spacing={1}>
                        <Stack
                          direction="row"
                          sx={{ alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5 }}
                        >
                          <Box sx={{ minWidth: 0 }}>
                            <Typography
                              component="span"
                              variant="caption"
                              color="text.secondary"
                              sx={{ mr: 1, fontWeight: 700 }}
                            >
                              {hnPage * 30 + idx + 1}.
                            </Typography>
                            <Link
                              href={story.url}
                              target="_blank"
                              rel="noreferrer"
                              underline="hover"
                              sx={{
                                fontWeight: 700,
                                fontSize: '0.98rem',
                                color: 'text.primary',
                                wordBreak: 'break-word',
                              }}
                            >
                              {story.title}
                            </Link>
                            {story.domain && (
                              <Typography
                                component="span"
                                variant="caption"
                                color="text.secondary"
                                sx={{ ml: 1 }}
                              >
                                ({story.domain})
                              </Typography>
                            )}
                          </Box>

                          <Tooltip title={isSaved ? 'Remove bookmark' : 'Save to Read Later'}>
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleToggleBookmark({
                                  title: story.title,
                                  url: story.url,
                                  source: 'Hacker News',
                                  author: story.author,
                                  hn_id: story.id,
                                  summary: story.story_text,
                                })
                              }
                              sx={{ color: isSaved ? 'primary.main' : 'action.disabled' }}
                            >
                              <BookmarkIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                        </Stack>

                        <Stack
                          direction="row"
                          spacing={1.5}
                          sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1 }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            {story.points} points · by {story.author} · {formatTimeAgo(story.created_at)}
                          </Typography>
                          <Button
                            size="small"
                            onClick={() => setActiveHnId(story.id)}
                            sx={{
                              minWidth: 0,
                              px: 1,
                              py: 0.25,
                              fontSize: '0.75rem',
                              textTransform: 'none',
                              fontWeight: 600,
                              borderRadius: 1.5,
                            }}
                          >
                            {story.num_comments} comment{story.num_comments === 1 ? '' : 's'}
                          </Button>
                          <Button
                            size="small"
                            disabled={saveToNotes.isPending}
                            onClick={() =>
                              saveToNotes.mutate({
                                title: story.title,
                                url: story.url,
                                source: 'Hacker News',
                                summary: story.story_text,
                              })
                            }
                            sx={{
                              minWidth: 0,
                              px: 1,
                              py: 0.25,
                              fontSize: '0.75rem',
                              textTransform: 'none',
                            }}
                          >
                            + Note
                          </Button>
                          <Button
                            size="small"
                            onClick={() =>
                              setRecallPrefill({
                                front: story.title,
                                back: story.story_text || story.url,
                                deck: 'Hacker News',
                                source_url: story.url,
                              })
                            }
                            sx={{
                              minWidth: 0,
                              px: 1,
                              py: 0.25,
                              fontSize: '0.75rem',
                              textTransform: 'none',
                            }}
                          >
                            + Recall
                          </Button>
                        </Stack>
                      </Stack>
                    </Paper>
                  )
                })}

                <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'center', pt: 1 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    disabled={hnPage === 0}
                    onClick={() => setHnPage((p) => Math.max(0, p - 1))}
                    sx={{ textTransform: 'none', borderRadius: 2 }}
                  >
                    Previous
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    disabled={hnFeed.items.length < 30}
                    onClick={() => setHnPage((p) => p + 1)}
                    sx={{ textTransform: 'none', borderRadius: 2 }}
                  >
                    Next
                  </Button>
                </Stack>
              </Stack>
            )}
          </Stack>
        )}

        {/* ---- TAB 2: MY FEEDS ---- */}
        {activeTab === 'feeds' && (
          <Stack spacing={2.5}>
            {feedSources.length > 0 && (
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.75 }}>
                <Chip
                  size="small"
                  label="All Feeds"
                  variant={selectedSourceId === undefined ? 'filled' : 'outlined'}
                  color={selectedSourceId === undefined ? 'primary' : 'default'}
                  onClick={() => setSelectedSourceId(undefined)}
                />
                {feedSources.map((src) => (
                  <Chip
                    key={src.id}
                    size="small"
                    label={src.name}
                    variant={selectedSourceId === src.id ? 'filled' : 'outlined'}
                    color={selectedSourceId === src.id ? 'primary' : 'default'}
                    onClick={() => setSelectedSourceId(src.id)}
                  />
                ))}
              </Stack>
            )}

            {feedSources.length === 0 ? (
              <EmptyState
                title="No custom feeds yet"
                description="Subscribe to any RSS or Atom feed (tech blogs, GitHub releases, Reddit .rss, Substack)."
                icon={<ReaderIcon sx={{ fontSize: 28 }} />}
                action={
                  <Button
                    variant="contained"
                    startIcon={<PlusIcon />}
                    onClick={() => setFeedDialogOpen(true)}
                    sx={{ mt: 1, borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                  >
                    Add Your First Feed
                  </Button>
                }
              />
            ) : feedsLoading ? (
              <Stack sx={{ py: 10, alignItems: 'center' }}>
                <CircularProgress />
              </Stack>
            ) : feedItems.length === 0 ? (
              <EmptyState
                title="No feed items loaded"
                description="Check your feed URLs in Manage Feeds."
              />
            ) : (
              <Stack spacing={1.5}>
                {feedItems.map((item, idx) => {
                  const isSaved = savedUrlMap.has(item.url)
                  return (
                    <Paper
                      key={`${item.source_id}-${item.url}-${idx}`}
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: 2.5,
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Stack spacing={1}>
                        <Stack
                          direction="row"
                          sx={{ alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5 }}
                        >
                          <Box sx={{ minWidth: 0 }}>
                            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.5 }}>
                              <Chip size="small" label={item.source_name} sx={{ height: 20, fontSize: '0.7rem' }} />
                              {item.published_at && (
                                <Typography variant="caption" color="text.secondary">
                                  {formatTimeAgo(item.published_at)}
                                </Typography>
                              )}
                            </Stack>
                            <Link
                              href={item.url}
                              target="_blank"
                              rel="noreferrer"
                              underline="hover"
                              sx={{ fontWeight: 700, fontSize: '0.98rem', color: 'text.primary' }}
                            >
                              {item.title}
                            </Link>
                          </Box>

                          <Tooltip title={isSaved ? 'Remove bookmark' : 'Save to Read Later'}>
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleToggleBookmark({
                                  title: item.title,
                                  url: item.url,
                                  source: item.source_name,
                                  author: item.author,
                                  summary: item.summary,
                                })
                              }
                              sx={{ color: isSaved ? 'primary.main' : 'action.disabled' }}
                            >
                              <BookmarkIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                        </Stack>

                        {item.summary && (
                          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.55 }}>
                            {item.summary}
                          </Typography>
                        )}

                        <Stack direction="row" spacing={1}>
                          <Button
                            size="small"
                            disabled={saveToNotes.isPending}
                            onClick={() =>
                              saveToNotes.mutate({
                                title: item.title,
                                url: item.url,
                                source: item.source_name,
                                summary: item.summary,
                              })
                            }
                            sx={{ minWidth: 0, px: 1, py: 0.25, fontSize: '0.75rem', textTransform: 'none' }}
                          >
                            + Note
                          </Button>
                          <Button
                            size="small"
                            onClick={() =>
                              setRecallPrefill({
                                front: item.title,
                                back: item.summary || item.url,
                                deck: item.source_name,
                                source_url: item.url,
                              })
                            }
                            sx={{ minWidth: 0, px: 1, py: 0.25, fontSize: '0.75rem', textTransform: 'none' }}
                          >
                            + Recall
                          </Button>
                        </Stack>
                      </Stack>
                    </Paper>
                  )
                })}
              </Stack>
            )}
          </Stack>
        )}

        {/* ---- TAB 3: SAVED ---- */}
        {activeTab === 'saved' && (
          <Stack spacing={2.5}>
            <Stack direction="row" spacing={1}>
              {(['all', 'unread', 'read'] as const).map((f) => (
                <Button
                  key={f}
                  size="small"
                  variant={savedFilter === f ? 'contained' : 'outlined'}
                  onClick={() => setSavedFilter(f)}
                  sx={{ borderRadius: 2, textTransform: 'capitalize', fontWeight: 600 }}
                >
                  {f}
                </Button>
              ))}
            </Stack>

            {savedLoading ? (
              <Stack sx={{ py: 10, alignItems: 'center' }}>
                <CircularProgress />
              </Stack>
            ) : savedArticles.length === 0 ? (
              <EmptyState
                title="No saved articles"
                description="Bookmark stories from Hacker News or My Feeds to read later."
                icon={<BookmarkIcon sx={{ fontSize: 28 }} />}
              />
            ) : (
              <Stack spacing={1.5}>
                {savedArticles.map((article) => (
                  <Paper
                    key={article.id}
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 2.5,
                      border: '1px solid',
                      borderColor: 'divider',
                      opacity: article.is_read ? 0.72 : 1,
                    }}
                  >
                    <Stack spacing={1}>
                      <Stack
                        direction="row"
                        sx={{ alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5 }}
                      >
                        <Box sx={{ minWidth: 0 }}>
                          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.5 }}>
                            <Chip size="small" label={article.source} sx={{ height: 20, fontSize: '0.7rem' }} />
                            <Typography variant="caption" color="text.secondary">
                              {formatTimeAgo(article.created_at)}
                            </Typography>
                          </Stack>
                          <Link
                            href={article.url}
                            target="_blank"
                            rel="noreferrer"
                            underline="hover"
                            sx={{ fontWeight: 700, fontSize: '0.98rem', color: 'text.primary' }}
                          >
                            {article.title}
                          </Link>
                        </Box>

                        <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() =>
                              toggleRead.mutate({ id: article.id, isRead: !article.is_read })
                            }
                            sx={{ textTransform: 'none', borderRadius: 2, fontSize: '0.75rem' }}
                          >
                            {article.is_read ? 'Mark Unread' : 'Mark Read'}
                          </Button>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => removeBookmark.mutate(article.id)}
                          >
                            <TrashIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Stack>
                      </Stack>

                      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                        {article.hn_id && (
                          <Button
                            size="small"
                            onClick={() => setActiveHnId(article.hn_id)}
                            sx={{
                              minWidth: 0,
                              px: 1,
                              py: 0.25,
                              fontSize: '0.75rem',
                              textTransform: 'none',
                              fontWeight: 600,
                            }}
                          >
                            Open HN Comments
                          </Button>
                        )}
                        <Button
                          size="small"
                          disabled={saveToNotes.isPending}
                          onClick={() =>
                            saveToNotes.mutate({
                              title: article.title,
                              url: article.url,
                              source: article.source,
                              summary: article.summary,
                            })
                          }
                          sx={{ minWidth: 0, px: 1, py: 0.25, fontSize: '0.75rem', textTransform: 'none' }}
                        >
                          + Note
                        </Button>
                        <Button
                          size="small"
                          onClick={() =>
                            setRecallPrefill({
                              front: article.title,
                              back: article.summary || article.url,
                              deck: article.source,
                              source_url: article.url,
                            })
                          }
                          sx={{ minWidth: 0, px: 1, py: 0.25, fontSize: '0.75rem', textTransform: 'none' }}
                        >
                          + Recall
                        </Button>
                      </Stack>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            )}
          </Stack>
        )}
      </Stack>

      <HnCommentsDrawer
        hnId={activeHnId}
        onClose={() => setActiveHnId(null)}
        onCreateRecallFromComment={(prefill) => setRecallPrefill(prefill)}
      />

      <FeedManagerDialog
        open={feedDialogOpen}
        onClose={() => setFeedDialogOpen(false)}
        feeds={feedSources}
        onAddFeed={async (input) => {
          await addFeed.mutateAsync(input)
        }}
        onDeleteFeed={async (id) => {
          await removeFeed.mutateAsync(id)
        }}
        isSubmitting={addFeed.isPending}
      />

      <RecallCardDialog
        open={Boolean(recallPrefill)}
        onClose={() => setRecallPrefill(null)}
        prefill={recallPrefill}
        existingDecks={(recallStats?.decks ?? []).map((d) => d.name)}
        isSubmitting={createRecallCard.isPending}
        onSubmit={async (payload) => {
          await createRecallCard.mutateAsync(payload as RecallCardCreateInput)
          setNotice({ message: 'Added to Recall' })
        }}
      />

      <Snackbar
        open={Boolean(notice)}
        autoHideDuration={3500}
        onClose={() => setNotice(null)}
        message={notice?.message}
        action={
          notice?.noteId ? (
            <Button
              component={RouterLink}
              to={`/admin/notes/${notice.noteId}`}
              color="inherit"
              size="small"
              sx={{ textTransform: 'none', fontWeight: 700 }}
            >
              Open Note
            </Button>
          ) : undefined
        }
      />
    </Box>
  )
}

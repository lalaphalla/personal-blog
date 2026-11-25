import { useMemo, useState } from 'react'
import { Link as RouterLink } from 'react-router'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import {
  ArrowLeftIcon,
  EditIcon,
  PlusIcon,
  RecallIcon,
  SearchIcon,
  StarFilledIcon,
  StarIcon,
  TrashIcon,
} from '../../../components/DocIcons'
import EmptyState from '../../../components/notes/EmptyState'
import RecallCardDialog from '../../../components/recall/RecallCardDialog'
import RecallImportDialog from '../../../components/recall/RecallImportDialog'
import RecallMarkdown from '../../../components/recall/RecallMarkdown'
import {
  useRecallCards,
  useRecallMutations,
  useRecallStats,
} from '../../../hooks/useRecallQueries'
import type {
  RecallCard,
  RecallCardCreateInput,
  RecallCardUpdateInput,
} from '../../../services/recallApi'
import {
  exportRecallAsJson,
  exportRecallAsMarkdown,
} from '../../../utils/recallImportExport'

type FilterTab = 'all' | 'favorites' | 'suspended' | 'trash'

export default function RecallCardsPage() {
  const [filter, setFilter] = useState<FilterTab>('all')
  const [selectedDeck, setSelectedDeck] = useState<string | undefined>(undefined)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [exportAnchor, setExportAnchor] = useState<null | HTMLElement>(null)
  const [editingCard, setEditingCard] = useState<RecallCard | null>(null)
  const [moveDialogOpen, setMoveDialogOpen] = useState(false)
  const [targetDeck, setTargetDeck] = useState('General')
  const [showAllAnswers, setShowAllAnswers] = useState(false)
  const [revealedIds, setRevealedIds] = useState<Set<number>>(() => new Set())
  const [selectedIds, setSelectedIds] = useState<Set<number>>(() => new Set())

  const toggleRevealCard = (id: number) => {
    setRevealedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectCard = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const { data: stats } = useRecallStats()
  const { data, isPending, isError } = useRecallCards({
    q: search.trim() || undefined,
    deck: selectedDeck,
    favorite: filter === 'favorites' ? true : undefined,
    suspended: filter === 'suspended' ? true : undefined,
    include_deleted: filter === 'trash',
    limit: 200,
  })

  const {
    create,
    bulkImport,
    importApkg,
    bulkDelete,
    bulkMove,
    emptyTrash,
    update,
    toggleFavorite,
    softDelete,
    restore,
    purge,
  } = useRecallMutations()

  const items = data?.items ?? []
  const existingDecks = useMemo(
    () => (stats?.decks ?? []).map((d) => d.name),
    [stats],
  )

  const handleDialogSubmit = async (
    payload: RecallCardCreateInput | RecallCardUpdateInput,
  ) => {
    if (editingCard) {
      await update.mutateAsync({ id: editingCard.id, input: payload })
    } else {
      await create.mutateAsync(payload as RecallCardCreateInput)
    }
  }

  return (
    <Box sx={{ maxWidth: 1080, mx: 'auto', px: { xs: 2, sm: 3 }, py: { xs: 2.5, sm: 4 } }}>
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
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Tooltip title="Back to Review Today">
              <IconButton component={RouterLink} to="/admin/recall">
                <ArrowLeftIcon />
              </IconButton>
            </Tooltip>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -0.5 }}>
                All Recall Cards
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Search, organize, and edit your memory library.
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
            <Button
              variant="outlined"
              onClick={() => setImportOpen(true)}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
            >
              Import
            </Button>

            <Button
              variant="outlined"
              disabled={items.length === 0}
              onClick={(e) => setExportAnchor(e.currentTarget)}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
            >
              Export
            </Button>
            <Menu
              anchorEl={exportAnchor}
              open={Boolean(exportAnchor)}
              onClose={() => setExportAnchor(null)}
            >
              <MenuItem
                onClick={() => {
                  setExportAnchor(null)
                  exportRecallAsMarkdown(items, selectedDeck || 'recall-cards')
                }}
              >
                Export as Markdown (.md)
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setExportAnchor(null)
                  exportRecallAsJson(items, selectedDeck || 'recall-cards')
                }}
              >
                Export as JSON (.json)
              </MenuItem>
            </Menu>

            <Button
              variant="contained"
              startIcon={<PlusIcon />}
              onClick={() => {
                setEditingCard(null)
                setDialogOpen(true)
              }}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
            >
              New Card
            </Button>
          </Stack>
        </Stack>

        {/* Filter Tabs + Search */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}
        >
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.75 }}>
            {(
              [
                { key: 'all', label: 'All' },
                { key: 'favorites', label: 'Favorites' },
                { key: 'suspended', label: 'Suspended' },
                { key: 'trash', label: 'Trash' },
              ] as const
            ).map((tab) => (
              <Button
                key={tab.key}
                size="small"
                variant={filter === tab.key ? 'contained' : 'outlined'}
                onClick={() => setFilter(tab.key)}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
              >
                {tab.label}
              </Button>
            ))}
            <Button
              size="small"
              variant={showAllAnswers ? 'contained' : 'outlined'}
              onClick={() => setShowAllAnswers((v) => !v)}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
            >
              {showAllAnswers ? 'Hide Answers' : 'Show Answers'}
            </Button>

            {items.length > 0 && (
              <Button
                size="small"
                variant="outlined"
                onClick={() => {
                  if (selectedIds.size === items.length) {
                    setSelectedIds(new Set())
                  } else {
                    setSelectedIds(new Set(items.map((c) => c.id)))
                  }
                }}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
              >
                {selectedIds.size === items.length ? 'Deselect All' : 'Select All'}
              </Button>
            )}

            {selectedDeck && filter !== 'trash' && items.length > 0 && (
              <Button
                size="small"
                color="error"
                variant="outlined"
                disabled={bulkDelete.isPending}
                onClick={async () => {
                  await bulkDelete.mutateAsync({ deck: selectedDeck })
                  setSelectedIds(new Set())
                  setSelectedDeck(undefined)
                }}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
              >
                Delete Deck ({selectedDeck})
              </Button>
            )}

            {filter === 'trash' && items.length > 0 && (
              <Button
                size="small"
                color="error"
                variant="outlined"
                disabled={emptyTrash.isPending}
                onClick={async () => {
                  await emptyTrash.mutateAsync()
                  setSelectedIds(new Set())
                }}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
              >
                Empty Trash
              </Button>
            )}
          </Stack>

          <TextField
            size="small"
            placeholder="Search front, back, hint, or deck..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ width: { xs: '100%', sm: 290 } }}
          />
        </Stack>

        {/* Deck chips */}
        {existingDecks.length > 0 && (
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.75 }}>
            <Chip
              size="small"
              label="All Decks"
              variant={selectedDeck === undefined ? 'filled' : 'outlined'}
              color={selectedDeck === undefined ? 'primary' : 'default'}
              onClick={() => setSelectedDeck(undefined)}
            />
            {existingDecks.map((deck) => (
              <Chip
                key={deck}
                size="small"
                label={deck}
                variant={selectedDeck === deck ? 'filled' : 'outlined'}
                color={selectedDeck === deck ? 'primary' : 'default'}
                onClick={() => setSelectedDeck(deck)}
              />
            ))}
          </Stack>
        )}

        {/* Bulk selection bar */}
        {selectedIds.size > 0 && (
          <Paper
            elevation={0}
            sx={{
              px: 2,
              py: 1.25,
              borderRadius: 2.5,
              border: '1px solid',
              borderColor: 'primary.light',
              bgcolor: 'primary.50',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 1,
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {selectedIds.size} card{selectedIds.size === 1 ? '' : 's'} selected
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                onClick={() => setSelectedIds(new Set())}
                sx={{ textTransform: 'none' }}
              >
                Clear
              </Button>
              {filter !== 'trash' && (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    setTargetDeck(selectedDeck || existingDecks[0] || 'General')
                    setMoveDialogOpen(true)
                  }}
                  sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600 }}
                >
                  Change Deck
                </Button>
              )}
              <Button
                size="small"
                color="error"
                variant="contained"
                disabled={bulkDelete.isPending}
                onClick={async () => {
                  await bulkDelete.mutateAsync({
                    ids: Array.from(selectedIds),
                    permanent: filter === 'trash',
                  })
                  setSelectedIds(new Set())
                }}
                sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600 }}
              >
                {filter === 'trash' ? 'Purge Selected' : 'Delete Selected'}
              </Button>
            </Stack>
          </Paper>
        )}

        {/* Cards Grid */}
        {isPending ? (
          <Stack sx={{ py: 10, alignItems: 'center' }}>
            <CircularProgress />
          </Stack>
        ) : isError ? (
          <EmptyState
            title="Unable to load cards"
            description="Please check your connection and try again."
          />
        ) : items.length === 0 ? (
          <EmptyState
            title={filter === 'trash' ? 'Trash is empty' : 'No cards found'}
            description={
              filter === 'trash'
                ? 'Deleted cards will appear here.'
                : 'Try a different filter or create a new Recall card.'
            }
            icon={<RecallIcon sx={{ fontSize: 28 }} />}
          />
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: 'repeat(2, 1fr)',
              },
              gap: 2.5,
            }}
          >
            {items.map((card) => {
              const isRevealed = showAllAnswers || revealedIds.has(card.id)
              return (
                <Paper
                  key={card.id}
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 1.75,
                  }}
                >
                  <Stack spacing={1.5}>
                    <Stack
                      direction="row"
                      sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1 }}
                    >
                      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                        <Checkbox
                          size="small"
                          checked={selectedIds.has(card.id)}
                          onChange={() => toggleSelectCard(card.id)}
                          sx={{ p: 0.25, ml: -0.5 }}
                        />
                        <Chip
                          size="small"
                          label={card.deck}
                          color="primary"
                          variant="outlined"
                          sx={{ fontWeight: 600, borderRadius: 1.5 }}
                        />
                      </Stack>

                      {filter !== 'trash' && (
                        <Stack direction="row" spacing={0.25}>
                          <IconButton
                            size="small"
                            onClick={() => toggleFavorite.mutate(card.id)}
                            sx={{ color: card.is_favorite ? 'warning.main' : 'action.disabled' }}
                          >
                            {card.is_favorite ? <StarFilledIcon /> : <StarIcon />}
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setEditingCard(card)
                              setDialogOpen(true)
                            }}
                          >
                            <EditIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Stack>
                      )}
                    </Stack>

                    <Box
                      sx={{
                        '& p': {
                          my: 0,
                          fontSize: '1rem',
                          fontWeight: 700,
                          lineHeight: 1.5,
                        },
                        '& code': {
                          fontFamily: 'monospace',
                          bgcolor: 'action.hover',
                          borderRadius: 1,
                          px: 0.5,
                        },
                      }}
                    >
                      <RecallMarkdown content={card.front} />
                    </Box>

                    {!showAllAnswers && (
                      <Box>
                        <Button
                          size="small"
                          variant={isRevealed ? 'text' : 'outlined'}
                          onClick={() => toggleRevealCard(card.id)}
                          sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600 }}
                        >
                          {isRevealed ? 'Hide Answer' : 'Show Answer'}
                        </Button>
                      </Box>
                    )}

                    {isRevealed && (
                      <>
                        <Divider />
                        <Box
                          sx={{
                            '& p': { my: 0.25, fontSize: '0.925rem', lineHeight: 1.6, color: 'text.secondary' },
                            '& pre': {
                              p: 1.25,
                              borderRadius: 2,
                              bgcolor: 'grey.100',
                              overflowX: 'auto',
                              fontSize: '0.825rem',
                            },
                            '& code': {
                              fontFamily: 'monospace',
                              bgcolor: 'grey.100',
                              borderRadius: 1,
                              px: 0.5,
                              py: 0.1,
                              fontSize: '0.875em',
                            },
                          }}
                        >
                          <RecallMarkdown content={card.back} />
                        </Box>
                      </>
                    )}
                  </Stack>

                  <Stack
                    direction="row"
                    sx={{ alignItems: 'center', justifyContent: 'space-between', pt: 0.5 }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Due: {card.due_date} · {card.interval_days}d
                    </Typography>

                    {filter === 'trash' ? (
                      <Stack direction="row" spacing={0.5}>
                        <Button
                          size="small"
                          onClick={() => restore.mutate(card.id)}
                          sx={{ textTransform: 'none' }}
                        >
                          Restore
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => purge.mutate(card.id)}
                          sx={{ textTransform: 'none' }}
                        >
                          Purge
                        </Button>
                      </Stack>
                    ) : (
                      <Tooltip title="Move to trash">
                        <IconButton
                          size="small"
                          onClick={() => softDelete.mutate(card.id)}
                          sx={{ color: 'action.disabled', '&:hover': { color: 'error.main' } }}
                        >
                          <TrashIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Stack>
                </Paper>
              )
            })}
          </Box>
        )}
      </Stack>

      <RecallCardDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleDialogSubmit}
        initialCard={editingCard}
        existingDecks={existingDecks}
        isSubmitting={create.isPending || update.isPending}
      />

      <RecallImportDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImport={async (cards) => {
          await bulkImport.mutateAsync(cards)
        }}
        onImportApkg={async (file, deck) => {
          await importApkg.mutateAsync({ file, deck })
        }}
        existingDecks={existingDecks}
        isSubmitting={bulkImport.isPending || importApkg.isPending}
      />

      <Dialog
        open={moveDialogOpen}
        onClose={() => setMoveDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          Move {selectedIds.size} Card{selectedIds.size === 1 ? '' : 's'} to Deck
        </DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ pt: 1 }}>
            <TextField
              label="Target Deck"
              size="small"
              fullWidth
              autoFocus
              value={targetDeck}
              onChange={(e) => setTargetDeck(e.target.value)}
            />
            {existingDecks.length > 0 && (
              <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', gap: 0.75 }}>
                {Array.from(new Set(['General', ...existingDecks])).map((d) => (
                  <Chip
                    key={d}
                    size="small"
                    label={d}
                    variant={targetDeck === d ? 'filled' : 'outlined'}
                    color={targetDeck === d ? 'primary' : 'default'}
                    onClick={() => setTargetDeck(d)}
                  />
                ))}
              </Stack>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setMoveDialogOpen(false)} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={!targetDeck.trim() || bulkMove.isPending}
            onClick={async () => {
              await bulkMove.mutateAsync({
                ids: Array.from(selectedIds),
                deck: targetDeck.trim(),
              })
              setMoveDialogOpen(false)
              setSelectedIds(new Set())
            }}
            sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600 }}
          >
            {bulkMove.isPending ? 'Moving...' : 'Move Cards'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

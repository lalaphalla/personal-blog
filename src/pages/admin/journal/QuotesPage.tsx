import { useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import InputAdornment from '@mui/material/InputAdornment'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { HeartIcon, PlusIcon, QuoteIcon, SearchIcon } from '../../../components/DocIcons'
import EmptyState from '../../../components/notes/EmptyState'
import QuoteCard from '../../../components/quotes/QuoteCard'
import QuoteDialog from '../../../components/quotes/QuoteDialog'
import { useQuotesList, useQuotesMutations } from '../../../hooks/useQuotesQueries'
import type { Quote, SourceType } from '../../../services/quotesApi'

const SOURCE_FILTERS: { value: SourceType | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'book', label: 'Books' },
  { value: 'movie', label: 'Movies' },
  { value: 'show', label: 'TV Shows' },
  { value: 'speech', label: 'Speeches' },
  { value: 'article', label: 'Articles' },
  { value: 'person', label: 'People' },
  { value: 'other', label: 'Other' },
]

export default function QuotesPage() {
  const [search, setSearch] = useState('')
  const [selectedType, setSelectedType] = useState<SourceType | 'all'>('all')
  const [onlyFavorites, setOnlyFavorites] = useState(false)

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null)

  // Delete confirm state
  const [quoteToDelete, setQuoteToDelete] = useState<Quote | null>(null)

  const { deleteQuote } = useQuotesMutations()

  const { data, isPending, isError } = useQuotesList({
    q: search.trim() || undefined,
    source_type: selectedType === 'all' ? undefined : selectedType,
    favorite: onlyFavorites ? true : undefined,
  })

  const handleOpenAdd = () => {
    setEditingQuote(null)
    setDialogOpen(true)
  }

  const handleEdit = (quote: Quote) => {
    setEditingQuote(quote)
    setDialogOpen(true)
  }

  const handleDeletePrompt = (quote: Quote) => {
    setQuoteToDelete(quote)
  }

  const handleConfirmDelete = async () => {
    if (!quoteToDelete) return
    await deleteQuote.mutateAsync(quoteToDelete.id)
    setQuoteToDelete(null)
  }

  const quotes = data?.items || []

  return (
    <Stack spacing={3.5} sx={{ width: '100%' }}>
      {/* Page Header */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        sx={{
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
        }}
        spacing={2}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -0.5 }}>
            Quotes & Wisdom
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Curate inspiring lines from books, movies, speeches, and mentors.
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="primary"
          startIcon={<PlusIcon />}
          onClick={handleOpenAdd}
          sx={{
            borderRadius: 2.5,
            px: 2.5,
            py: 1,
            fontWeight: 700,
            textTransform: 'none',
            boxShadow: 'none',
          }}
        >
          Add Quote
        </Button>
      </Stack>

      {/* Filter and Search Bar */}
      <Stack spacing={2}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: 'center' }}>
          <TextField
            placeholder="Search quotes, authors, or sources..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            fullWidth
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              },
            }}
          />

          <Button
            variant={onlyFavorites ? 'contained' : 'outlined'}
            color={onlyFavorites ? 'error' : 'inherit'}
            startIcon={<HeartIcon sx={{ fontSize: 16 }} />}
            onClick={() => setOnlyFavorites(!onlyFavorites)}
            size="medium"
            sx={{
              whiteSpace: 'nowrap',
              textTransform: 'none',
              borderRadius: 2,
              px: 2,
            }}
          >
            Favorites
          </Button>
        </Stack>

        {/* Category Filter Chips */}
        <Stack
          direction="row"
          spacing={1}
          sx={{ overflowX: 'auto', pb: 0.5, alignItems: 'center' }}
        >
          {SOURCE_FILTERS.map((f) => (
            <Chip
              key={f.value}
              label={f.label}
              clickable
              color={selectedType === f.value ? 'primary' : 'default'}
              variant={selectedType === f.value ? 'filled' : 'outlined'}
              onClick={() => setSelectedType(f.value)}
              sx={{ fontWeight: selectedType === f.value ? 700 : 500 }}
            />
          ))}
        </Stack>
      </Stack>

      {/* Main Content Area */}
      {isPending ? (
        <Stack sx={{ py: 10, alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress />
        </Stack>
      ) : isError ? (
        <EmptyState
          title="Failed to load quotes"
          description="Could not retrieve quote collection. Please check your connection."
          icon={<QuoteIcon sx={{ fontSize: 32 }} />}
        />
      ) : quotes.length === 0 ? (
        <EmptyState
          title={search || selectedType !== 'all' || onlyFavorites ? 'No matching quotes found' : 'No quotes yet'}
          description={
            search || selectedType !== 'all' || onlyFavorites
              ? 'Try adjusting your search keywords or filters.'
              : 'Start your personal quotes archive by adding memorable thoughts, book excerpts, or speech lines.'
          }
          icon={<QuoteIcon sx={{ fontSize: 32 }} />}
          action={
            <Button
              variant="outlined"
              startIcon={<PlusIcon />}
              onClick={handleOpenAdd}
              sx={{ textTransform: 'none', borderRadius: 2 }}
            >
              Add First Quote
            </Button>
          }
        />
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(2, 1fr)',
              lg: 'repeat(3, 1fr)',
            },
            gap: 2.5,
          }}
        >
          {quotes.map((quote) => (
            <QuoteCard
              key={quote.id}
              quote={quote}
              onEdit={handleEdit}
              onDelete={handleDeletePrompt}
            />
          ))}
        </Box>
      )}

      {/* Edit / Create Dialog */}
      <QuoteDialog
        open={dialogOpen}
        quote={editingQuote}
        onClose={() => setDialogOpen(false)}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={Boolean(quoteToDelete)}
        onClose={() => setQuoteToDelete(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Quote?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to permanently delete this quote? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setQuoteToDelete(null)} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={deleteQuote.isPending}
            sx={{ textTransform: 'none', fontWeight: 700 }}
          >
            {deleteQuote.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}

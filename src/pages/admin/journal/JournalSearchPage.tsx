import { useState } from 'react'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import InputAdornment from '@mui/material/InputAdornment'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { SearchIcon } from '../../../components/DocIcons'
import JournalEntryCard from '../../../components/journal/JournalEntryCard'
import EmptyState from '../../../components/notes/EmptyState'
import { useJournalList, useJournalMutations } from '../../../hooks/useJournalQueries'
import type { Mood } from '../../../services/journalApi'

export default function JournalSearchPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [tagTerm, setTagTerm] = useState('')
  const [selectedMood] = useState<Mood | undefined>(undefined)

  const { data: searchResults, isPending } = useJournalList({
    q: searchTerm.trim() || undefined,
    tag: tagTerm.trim() || undefined,
    mood: selectedMood,
    limit: 50,
  })

  const { toggleFavorite } = useJournalMutations()
  const entries = searchResults?.items || []

  return (
    <Stack spacing={3.5} sx={{ width: '100%' }}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -0.5 }}>
          Search Journal
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Find entries across titles, reflections, content, and tags.
        </Typography>
      </Box>

      {/* Search Input Row */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          fullWidth
          placeholder="Search by keywords or thoughts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            },
          }}
          sx={{ flexGrow: 2 }}
        />

        <TextField
          placeholder="Filter by tag..."
          value={tagTerm}
          onChange={(e) => setTagTerm(e.target.value)}
          sx={{ flexGrow: 1 }}
        />
      </Stack>

      {/* Results */}
      {isPending ? (
        <Stack sx={{ py: 12, alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress />
        </Stack>
      ) : entries.length === 0 ? (
        <EmptyState
          title="No matching entries"
          description={
            searchTerm || tagTerm
              ? 'Try searching with a different term or keyword.'
              : 'Type keywords above to search your entries.'
          }
          icon={<SearchIcon sx={{ fontSize: 28 }} />}
        />
      ) : (
        <Stack spacing={2}>
          <Typography
            variant="overline"
            sx={{ fontWeight: 700, letterSpacing: 1.2, color: 'text.secondary' }}
          >
            RESULTS ({entries.length})
          </Typography>

          {entries.map((entry) => (
            <JournalEntryCard
              key={entry.id}
              entry={entry}
              showDate
              onToggleFavorite={(id) => toggleFavorite.mutate(id)}
            />
          ))}
        </Stack>
      )}
    </Stack>
  )
}

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { TrashIcon } from '../../../components/DocIcons'
import EmptyState from '../../../components/notes/EmptyState'
import { useJournalList, useJournalMutations } from '../../../hooks/useJournalQueries'
import { formatShortJournalDate } from '../../../utils/journal'

export default function JournalTrashPage() {
  const { data: listData, isPending, isError } = useJournalList({
    include_deleted: true,
    limit: 50,
  })

  const { restoreEntry, purgeEntry } = useJournalMutations()
  const deletedEntries = (listData?.items || []).filter((e) => e.deleted_at !== null)

  const handleRestore = async (id: number) => {
    await restoreEntry.mutateAsync(id)
  }

  const handlePurge = async (id: number) => {
    if (window.confirm('Permanently purge this entry and its attachments? This cannot be undone.')) {
      await purgeEntry.mutateAsync(id)
    }
  }

  return (
    <Stack spacing={3.5} sx={{ width: '100%' }}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -0.5 }}>
          Recently Deleted
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Entries here are excluded from Today, Calendar, and Timeline. You can restore or permanently remove them.
        </Typography>
      </Box>

      {isPending ? (
        <Stack sx={{ py: 12, alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress />
        </Stack>
      ) : isError ? (
        <EmptyState
          title="Unable to load trash"
          description="Please check your connection and try again."
        />
      ) : deletedEntries.length === 0 ? (
        <EmptyState
          title="Trash is empty"
          description="Deleted journal entries will appear here."
          icon={<TrashIcon sx={{ fontSize: 28 }} />}
        />
      ) : (
        <Stack spacing={2}>
          {deletedEntries.map((entry) => (
            <Paper
              key={entry.id}
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
              }}
            >
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                sx={{
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  justifyContent: 'space-between',
                }}
                spacing={2}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    {formatShortJournalDate(entry.entry_date)}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }} noWrap>
                    {entry.title || 'Untitled Entry'}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {entry.excerpt || 'No content preview.'}
                  </Typography>
                </Box>

                <Stack direction="row" spacing={1.5} sx={{ flexShrink: 0 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleRestore(entry.id)}
                    sx={{ borderRadius: 2, textTransform: 'none' }}
                  >
                    Restore
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    onClick={() => handlePurge(entry.id)}
                    sx={{ borderRadius: 2, textTransform: 'none' }}
                  >
                    Delete Forever
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}
    </Stack>
  )
}

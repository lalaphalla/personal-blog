import { useRef, useState, type ChangeEvent } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import {
  MindmapIcon,
  PlusIcon,
  SearchIcon,
  StarFilledIcon,
  StarIcon,
  TrashIcon,
} from '../../../components/DocIcons'
import EmptyState from '../../../components/notes/EmptyState'
import { useMindmapList, useMindmapMutations } from '../../../hooks/useMindmapQueries'
import { parseMarkdownToMindmap } from '../../../utils/mindmapImport'

type FilterTab = 'all' | 'favorites' | 'trash'

export default function MindmapListPage() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState<FilterTab>('all')
  const [search, setSearch] = useState('')
  const [importOpen, setImportOpen] = useState(false)
  const [markdownText, setMarkdownText] = useState('')
  const [importTitle, setImportTitle] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data, isPending, isError } = useMindmapList({
    q: search.trim() || undefined,
    favorite: filter === 'favorites' ? true : undefined,
    include_deleted: filter === 'trash',
    limit: 100,
  })

  const { create, toggleFavorite, softDelete, restore, purge } = useMindmapMutations()

  const handleCreate = async () => {
    const created = await create.mutateAsync({ title: 'Untitled Mindmap' })
    navigate(`/admin/mindmaps/${created.id}`)
  }

  const handleFilePick = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    setMarkdownText(text)
    if (!importTitle.trim()) {
      setImportTitle(file.name.replace(/\.(md|markdown|txt)$/i, ''))
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleImportSubmit = async () => {
    if (!markdownText.trim()) return
    const parsed = parseMarkdownToMindmap(
      markdownText,
      importTitle.trim() || 'Imported Mindmap',
    )
    const created = await create.mutateAsync({
      title: importTitle.trim() || parsed.title,
      nodes: parsed.nodes,
      edges: parsed.edges,
    })
    setImportOpen(false)
    setMarkdownText('')
    setImportTitle('')
    navigate(`/admin/mindmaps/${created.id}`)
  }

  const items = data?.items ?? []

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
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -0.5 }}>
              Mindmaps
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Visual thinking, brainstorming, and idea trees.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              onClick={() => setImportOpen(true)}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
            >
              Import .md
            </Button>

            <Button
              variant="contained"
              startIcon={<PlusIcon />}
              onClick={handleCreate}
              disabled={create.isPending}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, px: 2.5 }}
            >
              {create.isPending ? 'Creating...' : 'New Mindmap'}
            </Button>
          </Stack>
        </Stack>

        {/* Search + Filter pills */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}
        >
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant={filter === 'all' ? 'contained' : 'outlined'}
              onClick={() => setFilter('all')}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
            >
              All
            </Button>
            <Button
              size="small"
              variant={filter === 'favorites' ? 'contained' : 'outlined'}
              onClick={() => setFilter('favorites')}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
            >
              Favorites
            </Button>
            <Button
              size="small"
              variant={filter === 'trash' ? 'contained' : 'outlined'}
              onClick={() => setFilter('trash')}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
            >
              Trash
            </Button>
          </Stack>

          <TextField
            size="small"
            placeholder="Search mindmaps or node text..."
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
            sx={{ width: { xs: '100%', sm: 280 } }}
          />
        </Stack>

        {/* Grid */}
        {isPending ? (
          <Stack sx={{ py: 10, alignItems: 'center' }}>
            <CircularProgress />
          </Stack>
        ) : isError ? (
          <EmptyState
            title="Unable to load mindmaps"
            description="Please check your connection and try again."
          />
        ) : items.length === 0 ? (
          <EmptyState
            title={filter === 'trash' ? 'Trash is empty' : 'No mindmaps yet'}
            description={
              filter === 'trash'
                ? 'Deleted mindmaps will appear here.'
                : 'Create your first mindmap to start organizing ideas visually.'
            }
            icon={<MindmapIcon sx={{ fontSize: 28 }} />}
          />
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
              },
              gap: 2,
            }}
          >
            {items.map((map) => (
              <Paper
                key={map.id}
                elevation={0}
                component={filter === 'trash' ? 'div' : RouterLink}
                to={filter === 'trash' ? undefined : `/admin/mindmaps/${map.id}`}
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 2,
                  transition: 'all 0.15s ease',
                  ...(filter !== 'trash'
                    ? {
                        '&:hover': {
                          borderColor: 'primary.light',
                          boxShadow: (theme) =>
                            `0 4px 16px ${alpha(theme.palette.common.black, 0.06)}`,
                          transform: 'translateY(-1px)',
                        },
                      }
                    : {}),
                }}
              >
                <Stack spacing={1}>
                  <Stack
                    direction="row"
                    sx={{ alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}
                  >
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', minWidth: 0 }}>
                      <MindmapIcon sx={{ color: 'primary.main', flexShrink: 0 }} />
                      <Typography variant="subtitle1" noWrap sx={{ fontWeight: 700 }}>
                        {map.title}
                      </Typography>
                    </Stack>

                    {filter !== 'trash' && (
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          toggleFavorite.mutate(map.id)
                        }}
                        sx={{
                          color: map.is_favorite ? 'warning.main' : 'action.disabled',
                          mt: -0.5,
                        }}
                      >
                        {map.is_favorite ? <StarFilledIcon /> : <StarIcon />}
                      </IconButton>
                    )}
                  </Stack>

                  {map.description && (
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {map.description}
                    </Typography>
                  )}
                </Stack>

                <Stack
                  direction="row"
                  sx={{ alignItems: 'center', justifyContent: 'space-between', pt: 0.5 }}
                >
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <Chip
                      size="small"
                      label={`${map.node_count} node${map.node_count === 1 ? '' : 's'}`}
                      sx={{ fontSize: '0.75rem', borderRadius: 1.5 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {new Date(map.updated_at).toLocaleDateString()}
                    </Typography>
                  </Stack>

                  {filter === 'trash' ? (
                    <Stack direction="row" spacing={0.5}>
                      <Button
                        size="small"
                        onClick={() => restore.mutate(map.id)}
                        sx={{ textTransform: 'none' }}
                      >
                        Restore
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => purge.mutate(map.id)}
                        sx={{ textTransform: 'none' }}
                      >
                        Purge
                      </Button>
                    </Stack>
                  ) : (
                    <Tooltip title="Move to trash">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          softDelete.mutate(map.id)
                        }}
                        sx={{ color: 'action.disabled', '&:hover': { color: 'error.main' } }}
                      >
                        <TrashIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Stack>
              </Paper>
            ))}
          </Box>
        )}
      </Stack>

      <Dialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Import Mindmap from Markdown</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <input
                ref={fileInputRef}
                type="file"
                accept=".md,.markdown,.txt,text/markdown,text/plain"
                style={{ display: 'none' }}
                onChange={handleFilePick}
              />
              <Button
                variant="outlined"
                size="small"
                onClick={() => fileInputRef.current?.click()}
                sx={{ textTransform: 'none', borderRadius: 2 }}
              >
                Choose .md file
              </Button>
              <Typography variant="caption" color="text.secondary">
                Uses # headings and indented - bullets to build branches.
              </Typography>
            </Stack>

            <TextField
              label="Title (optional — defaults to first # heading)"
              size="small"
              fullWidth
              value={importTitle}
              onChange={(e) => setImportTitle(e.target.value)}
            />

            <TextField
              label="Markdown content"
              multiline
              minRows={8}
              maxRows={16}
              fullWidth
              placeholder={'# My System\n## Frontend\n- React\n- MUI\n## Backend\n- FastAPI\n- SQLite'}
              value={markdownText}
              onChange={(e) => setMarkdownText(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setImportOpen(false)} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={!markdownText.trim() || create.isPending}
            onClick={handleImportSubmit}
            sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600 }}
          >
            {create.isPending ? 'Importing...' : 'Import & Open'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

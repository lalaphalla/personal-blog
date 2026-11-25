import { useParams } from 'react-router'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import MindmapCanvas from '../../../components/mindmap/MindmapCanvas'
import EmptyState from '../../../components/notes/EmptyState'
import { useMindmap, useMindmapMutations } from '../../../hooks/useMindmapQueries'

export default function MindmapEditorPage() {
  const { id } = useParams<{ id: string }>()
  const mindmapId = id ? Number(id) : undefined
  const { data: mindmap, isPending, isError } = useMindmap(mindmapId)
  const { update, toggleFavorite } = useMindmapMutations()

  if (isPending) {
    return (
      <Stack sx={{ height: '70vh', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Stack>
    )
  }

  if (isError || !mindmap) {
    return (
      <Box sx={{ p: 4 }}>
        <EmptyState
          title="Mindmap not found"
          description="It may have been moved to trash or deleted."
        />
      </Box>
    )
  }

  return (
    <Box
      sx={{
        height: { xs: 'calc(100vh - 56px)', md: 'calc(100vh - 64px)' },
        width: '100%',
        overflow: 'hidden',
      }}
    >
      <MindmapCanvas
        mindmap={mindmap}
        onSave={async (input) => {
          await update.mutateAsync({ id: mindmap.id, input })
        }}
        onToggleFavorite={async () => {
          await toggleFavorite.mutateAsync(mindmap.id)
        }}
      />
    </Box>
  )
}

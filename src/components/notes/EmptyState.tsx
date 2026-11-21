import type { ReactNode } from 'react'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { FileTextIcon } from '../DocIcons'

interface EmptyStateProps {
  title: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
  compact?: boolean
}

/** Shared empty/placeholder presentation for the notes panes. */
export default function EmptyState({
  title,
  description,
  icon,
  action,
  compact = false,
}: EmptyStateProps) {
  return (
    <Stack
      sx={{
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        px: 3,
        py: compact ? 4 : 8,
        color: 'text.secondary',
        minHeight: compact ? 160 : 280,
      }}
    >
      <Box
        sx={{
          width: compact ? 40 : 52,
          height: compact ? 40 : 52,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          bgcolor: 'action.hover',
          color: 'text.disabled',
          mb: 1.5,
        }}
      >
        {icon ?? <FileTextIcon sx={{ fontSize: compact ? 20 : 24 }} />}
      </Box>
      <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>{title}</Typography>
      {description ? (
        <Typography variant="body2" sx={{ mt: 0.5, maxWidth: 340 }}>
          {description}
        </Typography>
      ) : null}
      {action ? <Box sx={{ mt: 2 }}>{action}</Box> : null}
    </Stack>
  )
}

import { useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import { RefreshIcon, SparklesIcon } from '../DocIcons'
import type { JournalPrompt } from '../../services/journalApi'

interface PromptCardProps {
  prompts: JournalPrompt[]
  onSelectPrompt?: (prompt: JournalPrompt) => void
}

export default function PromptCard({ prompts, onSelectPrompt }: PromptCardProps) {
  const [index, setIndex] = useState(0)

  if (!prompts || prompts.length === 0) return null

  const currentPrompt = prompts[index % prompts.length]

  const nextPrompt = () => {
    setIndex((prev) => (prev + 1) % prompts.length)
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 3,
        bgcolor: (theme) => alpha(theme.palette.secondary.main || '#7c3aed', 0.05),
        border: '1px solid',
        borderColor: (theme) => alpha(theme.palette.secondary.main || '#7c3aed', 0.15),
      }}
    >
      <Stack spacing={1.5}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <SparklesIcon sx={{ color: 'secondary.main', fontSize: 20 }} />
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                letterSpacing: 0.8,
                color: 'secondary.main',
                textTransform: 'uppercase',
              }}
            >
              Daily Reflection
            </Typography>
          </Stack>

          <Tooltip title="Give me another prompt">
            <IconButton size="small" onClick={nextPrompt} sx={{ color: 'text.secondary' }}>
              <RefreshIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Stack>

        <Typography
          variant="h6"
          sx={{
            fontStyle: 'italic',
            fontWeight: 500,
            fontSize: '1.05rem',
            color: 'text.primary',
            lineHeight: 1.5,
          }}
        >
          &ldquo;{currentPrompt.text}&rdquo;
        </Typography>

        {onSelectPrompt && (
          <Box sx={{ pt: 0.5 }}>
            <Button
              size="small"
              variant="outlined"
              color="secondary"
              onClick={() => onSelectPrompt(currentPrompt)}
              sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600 }}
            >
              Reflect on this
            </Button>
          </Box>
        )}
      </Stack>
    </Paper>
  )
}

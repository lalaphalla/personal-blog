import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import TextField from '@mui/material/TextField'
import Markdown from 'react-markdown'
import { useState } from 'react'

const markdownSx = {
  p: 2,
  color: 'text.primary',
  lineHeight: 1.7,
  '& p, & ul, & ol': { my: 0, mb: 2 },
  '& li': { mb: 0.5 },
  '& h2': { mt: 3, mb: 1, fontSize: '1.3rem', fontWeight: 500 },
  '& h3': { mt: 2, mb: 1, fontSize: '1.1rem', fontWeight: 500 },
  '& code': {
    fontFamily: 'monospace',
    fontSize: '0.9em',
    px: 0.5,
    py: 0.25,
    borderRadius: 1,
    bgcolor: 'action.hover',
  },
  '& pre': {
    my: 0,
    mb: 2,
    p: 2,
    borderRadius: 2,
    overflowX: 'auto',
    bgcolor: 'action.hover',
    '& code': { bgcolor: 'transparent', p: 0 },
  },
} as const

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  error?: string
  minRows?: number
}

function MarkdownEditor({ value, onChange, error, minRows = 16 }: MarkdownEditorProps) {
  const [tab, setTab] = useState(0)

  return (
    <Box>
      <Tabs value={tab} onChange={(_, next) => setTab(next)} sx={{ mb: 1 }}>
        <Tab label="Write" />
        <Tab label="Preview" />
      </Tabs>

      {tab === 0 ? (
        <TextField
          value={value}
          onChange={(e) => onChange(e.target.value)}
          multiline
          minRows={minRows}
          fullWidth
          placeholder="Write your post in Markdown…"
          error={Boolean(error)}
          helperText={error}
          slotProps={{
            input: {
              sx: {
                fontFamily: 'monospace',
                fontSize: '0.9rem',
                alignItems: 'flex-start',
              },
            },
          }}
        />
      ) : (
        <Paper variant="outlined" sx={{ minHeight: 280, ...markdownSx }}>
          {value.trim() ? (
            <Markdown>{value}</Markdown>
          ) : (
            <Box sx={{ color: 'text.secondary' }}>Nothing to preview yet.</Box>
          )}
        </Paper>
      )}
    </Box>
  )
}

export default MarkdownEditor

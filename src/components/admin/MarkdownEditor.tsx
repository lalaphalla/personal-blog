import { useState } from 'react'
import type { ClipboardEvent, DragEvent } from 'react'
import Box from '@mui/material/Box'
import FormHelperText from '@mui/material/FormHelperText'
import Stack from '@mui/material/Stack'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import MDEditor, { commands } from '@uiw/react-md-editor'
import '@uiw/react-md-editor/markdown-editor.css'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { EditIcon, EyeIcon } from '../DocIcons'
import { markdownSx } from '../markdownSx'
import { sharedMarkdownComponents } from '../markdownComponents'
import { adminUploadImage } from '../../services/adminApi'
import { getErrorMessage } from '../../config/queryClient'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  error?: string
  minRows?: number
}

type EditorMode = 'write' | 'preview'

/** Keep only the formatting actions: split/live preview is replaced by our own toggle. */
const toolbarExtras = commands
  .getExtraCommands()
  .filter((command) => !['edit', 'live', 'preview'].includes(command.name ?? ''))

function altFromFilename(filename: string): string {
  return filename.replace(/\.[^.]+$/, '').replace(/[^\w-]+/g, ' ').trim() || 'image'
}

/** Insert a snippet at the current cursor position of the editor textarea. */
function insertAtCursor(textarea: HTMLTextAreaElement, snippet: string, onChange: (v: string) => void) {
  const start = textarea.selectionStart ?? textarea.value.length
  const end = textarea.selectionEnd ?? start
  const nextValue = textarea.value.slice(0, start) + snippet + textarea.value.slice(end)
  onChange(nextValue)

  requestAnimationFrame(() => {
    const pos = start + snippet.length
    textarea.focus()
    textarea.setSelectionRange(pos, pos)
  })
}

function MarkdownEditor({ value, onChange, error, minRows = 16 }: MarkdownEditorProps) {
  const [mode, setMode] = useState<EditorMode>('write')
  const [uploading, setUploading] = useState(false)
  const [uploadMessage, setUploadMessage] = useState<string | null>(null)

  async function uploadAndInsert(files: FileList, textarea: HTMLTextAreaElement) {
    setUploadMessage(null)
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) {
        setUploadMessage(`Skipped "${file.name}" — images only`)
        continue
      }
      setUploading(true)
      try {
        const { url } = await adminUploadImage(file)
        insertAtCursor(textarea, `![${altFromFilename(file.name)}](${url})\n`, onChange)
      } catch (uploadError) {
        setUploadMessage(getErrorMessage(uploadError))
      } finally {
        setUploading(false)
      }
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLTextAreaElement>) {
    const files = event.clipboardData?.files
    if (!files || files.length === 0) return
    event.preventDefault()
    void uploadAndInsert(files, event.currentTarget)
  }

  function handleDrop(event: DragEvent<HTMLTextAreaElement>) {
    const files = event.dataTransfer?.files
    if (!files || files.length === 0) return
    event.preventDefault()
    void uploadAndInsert(files, event.currentTarget)
  }

  return (
    <Box data-color-mode="light">
      <Stack
        direction="row"
        sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1 }}
      >
        <Typography variant="caption" color="text.secondary">
          Markdown
        </Typography>
        <ToggleButtonGroup
          size="small"
          exclusive
          value={mode}
          onChange={(_event, next: EditorMode | null) => {
            if (next) setMode(next)
          }}
          aria-label="Editor view mode"
          sx={{
            bgcolor: 'background.paper',
            '& .MuiToggleButton-root': {
              px: 1.25,
              py: 0.4,
              gap: 0.5,
              textTransform: 'none',
              fontSize: '0.8125rem',
            },
          }}
        >
          <ToggleButton value="write" aria-label="Write markdown">
            <EditIcon sx={{ fontSize: 15 }} />
            Write
          </ToggleButton>
          <ToggleButton value="preview" aria-label="Preview markdown">
            <EyeIcon sx={{ fontSize: 15 }} />
            Preview
          </ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      {mode === 'write' ? (
        <MDEditor
          value={value}
          onChange={(next) => onChange(next ?? '')}
          height={minRows * 24}
          preview="edit"
          extraCommands={toolbarExtras}
          textareaProps={{
            placeholder: 'Write in Markdown…',
            onPaste: handlePaste,
            onDrop: handleDrop,
          }}
        />
      ) : (
        <Box
          sx={{
            minHeight: minRows * 24,
            p: { xs: 2, sm: 4 },
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            bgcolor: 'background.paper',
          }}
        >
          {value.trim() ? (
            <Box component="article" sx={markdownSx}>
              <Markdown remarkPlugins={[remarkGfm]} components={sharedMarkdownComponents}>
                {value}
              </Markdown>
            </Box>
          ) : (
            <Typography color="text.secondary">
              Nothing to preview yet — switch to Write and start typing.
            </Typography>
          )}
        </Box>
      )}

      {error ? <FormHelperText error>{error}</FormHelperText> : null}
      {uploading ? <FormHelperText>Uploading image…</FormHelperText> : null}
      {!uploading && uploadMessage ? (
        <FormHelperText error={/skipped|failed|error/i.test(uploadMessage) ? true : undefined}>
          {uploadMessage}
        </FormHelperText>
      ) : null}
    </Box>
  )
}

export default MarkdownEditor

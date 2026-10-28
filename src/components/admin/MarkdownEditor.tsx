import { useState } from 'react'
import type { ClipboardEvent, DragEvent } from 'react'
import Box from '@mui/material/Box'
import FormHelperText from '@mui/material/FormHelperText'
import MDEditor from '@uiw/react-md-editor'
import '@uiw/react-md-editor/markdown-editor.css'
import { adminUploadImage } from '../../services/adminApi'
import { getErrorMessage } from '../../config/queryClient'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  error?: string
  minRows?: number
}

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
      <MDEditor
        value={value}
        onChange={(next) => onChange(next ?? '')}
        height={minRows * 24}
        preview="live"
        textareaProps={{
          placeholder: 'Write your post in Markdown…',
          onPaste: handlePaste,
          onDrop: handleDrop,
        }}
      />
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

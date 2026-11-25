import { useEffect, useRef } from 'react'
import Box from '@mui/material/Box'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { markdown } from '@codemirror/lang-markdown'
import { EditorState } from '@codemirror/state'
import { EditorView, keymap, placeholder as cmPlaceholder } from '@codemirror/view'
import { editorTheme } from './extensions/editorTheme'
import { createLivePreviewPlugin } from './extensions/livePreview'

export interface LiveMarkdownEditorProps {
  initialContent: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: string | number
  autoFocus?: boolean
}

export default function LiveMarkdownEditor({
  initialContent,
  onChange,
  placeholder = 'Write in Markdown...',
  minHeight = '320px',
  autoFocus = false,
}: LiveMarkdownEditorProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const viewRef = useRef<EditorView | null>(null)
  const onChangeRef = useRef(onChange)

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  // NOTE: initialContent is mount-only — the editor owns its text while mounted
  // (plan doc §5). External updates (note/entry switching) go through `key`, never
  // by pushing new values in: doing so races the keystrokes and reverts typing.

  useEffect(() => {
    if (!containerRef.current) return

    const extensions = [
      history(),
      keymap.of([...defaultKeymap, ...historyKeymap]),
      markdown(),
      createLivePreviewPlugin(),
      editorTheme,
      EditorView.lineWrapping,
      cmPlaceholder(placeholder),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          onChangeRef.current(update.state.doc.toString())
        }
      }),
    ]

    const state = EditorState.create({
      doc: initialContent,
      extensions,
    })

    const view = new EditorView({
      state,
      parent: containerRef.current,
    })

    viewRef.current = view

    if (autoFocus) {
      view.focus()
    }

    return () => {
      view.destroy()
      viewRef.current = null
    }
  }, []) // Mounts once per key. In NoteEditorForm, key={noteId} guarantees clean lifecycle.

  return (
    <Box
      sx={{
        width: '100%',
        minHeight,
        '& .cm-editor': {
          minHeight,
          height: '100%',
        },
        '& .cm-scroller': {
          minHeight,
        },
      }}
    >
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </Box>
  )
}

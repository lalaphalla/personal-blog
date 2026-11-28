import { EditorView } from '@codemirror/view'

export const editorTheme = EditorView.theme({
  '&': {
    height: '100%',
    fontSize: '1rem',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    color: 'inherit',
    backgroundColor: 'transparent',
  },
  '&.cm-focused': {
    outline: 'none',
  },
  '.cm-content': {
    fontSize: '1rem',
    lineHeight: '1.55',
    padding: '12px 4px',
  },
  '.cm-line': {
    padding: '0',
  },
  '.cm-placeholder': {
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  '&.cm-focused .cm-cursor': {
    borderLeftColor: '#6366f1',
    borderLeftWidth: '1.5px',
  },
  '&.cm-focused .cm-selectionBackground, ::selection': {
    backgroundColor: 'rgba(99, 102, 241, 0.18) !important',
  },
  // Heading line styles
  '.cm-header': {
    fontWeight: '700',
  },
  '.cm-header-1': {
    fontSize: '1.85rem',
    lineHeight: '1.25',
    fontWeight: '800',
    letterSpacing: '-0.02em',
  },
  '.cm-header-2': {
    fontSize: '1.45rem',
    lineHeight: '1.3',
    fontWeight: '750',
    letterSpacing: '-0.015em',
  },
  '.cm-header-3': {
    fontSize: '1.2rem',
    lineHeight: '1.35',
    fontWeight: '700',
  },
  '.cm-header-4, .cm-header-5, .cm-header-6': {
    fontSize: '1.05rem',
    lineHeight: '1.4',
    fontWeight: '650',
  },
  // Inline mark styles
  '.cm-strong': {
    fontWeight: '700',
  },
  '.cm-em': {
    fontStyle: 'italic',
  },
  '.cm-inline-code': {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    fontSize: '0.875em',
    backgroundColor: 'rgba(125, 125, 125, 0.12)',
    padding: '2px 5px',
    borderRadius: '4px',
    color: 'inherit',
  },
  // Blockquote line style
  '.cm-blockquote': {
    borderLeft: '3px solid rgba(99, 102, 241, 0.65)',
    paddingLeft: '14px',
    color: '#64748b',
    fontStyle: 'italic',
  },
  // Link styling
  '.cm-link-text': {
    color: '#3b82f6',
    textDecoration: 'underline',
    textUnderlineOffset: '3px',
    cursor: 'pointer',
  },
})

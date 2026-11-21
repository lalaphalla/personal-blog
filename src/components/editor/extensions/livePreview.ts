import { RangeSetBuilder } from '@codemirror/state'
import {
  Decoration,
  type DecorationSet,
  EditorView,
  ViewPlugin,
  type ViewUpdate,
} from '@codemirror/view'
import { syntaxTree } from '@codemirror/language'

interface DecEntry {
  from: number
  to: number
  isLine: boolean
  dec: Decoration
}

export function createLivePreviewPlugin() {
  return ViewPlugin.fromClass(
    class {
      decorations: DecorationSet

      constructor(view: EditorView) {
        this.decorations = this.buildDecorations(view)
      }

      update(update: ViewUpdate) {
        if (update.docChanged || update.selectionSet || update.viewportChanged) {
          this.decorations = this.buildDecorations(update.view)
        }
      }

      buildDecorations(view: EditorView): DecorationSet {
        const selection = view.state.selection.main
        const selStartLine = view.state.doc.lineAt(selection.from).number
        const selEndLine = view.state.doc.lineAt(selection.to).number

        const isLineActive = (lineNo: number): boolean => {
          return lineNo >= selStartLine && lineNo <= selEndLine
        }

        const entries: DecEntry[] = []
        const lineClassMap = new Map<number, Set<string>>()

        const addLineClass = (lineStart: number, className: string) => {
          if (!lineClassMap.has(lineStart)) {
            lineClassMap.set(lineStart, new Set())
          }
          lineClassMap.get(lineStart)!.add(className)
        }

        const doc = view.state.doc

        for (const { from, to } of view.visibleRanges) {
          syntaxTree(view.state).iterate({
            from,
            to,
            enter(node) {
              const nodeStartLine = doc.lineAt(node.from).number
              const nodeEndLine = doc.lineAt(node.to).number

              // Skip active lines where the cursor or selection is currently placed
              const active = isLineActive(nodeStartLine) || isLineActive(nodeEndLine)
              if (active) return

              // 1. Headings (# Heading 1, ## Heading 2, etc.)
              if (node.name.startsWith('ATXHeading')) {
                const levelMatch = node.name.match(/\d+$/)
                const level = levelMatch ? parseInt(levelMatch[0], 10) : 1
                const line = doc.lineAt(node.from)

                addLineClass(line.from, `cm-header cm-header-${level}`)

                // Find and hide the HeaderMark inside the heading
                const firstChild = node.node.firstChild
                if (firstChild && firstChild.name === 'HeaderMark') {
                  const hideTo = Math.min(
                    line.to,
                    doc.sliceString(firstChild.to, firstChild.to + 1) === ' '
                      ? firstChild.to + 1
                      : firstChild.to
                  )
                  entries.push({
                    from: firstChild.from,
                    to: hideTo,
                    isLine: false,
                    dec: Decoration.replace({}),
                  })
                }
              }

              // 2. Strong / Bold (**bold** or __bold__)
              else if (node.name === 'StrongEmphasis') {
                const firstChild = node.node.firstChild
                const lastChild = node.node.lastChild

                if (
                  firstChild &&
                  lastChild &&
                  firstChild.name === 'EmphasisMark' &&
                  lastChild.name === 'EmphasisMark' &&
                  firstChild.from !== lastChild.from
                ) {
                  // Hide opening **
                  entries.push({
                    from: firstChild.from,
                    to: firstChild.to,
                    isLine: false,
                    dec: Decoration.replace({}),
                  })
                  // Style text inside as bold
                  if (firstChild.to < lastChild.from) {
                    entries.push({
                      from: firstChild.to,
                      to: lastChild.from,
                      isLine: false,
                      dec: Decoration.mark({ class: 'cm-strong' }),
                    })
                  }
                  // Hide closing **
                  entries.push({
                    from: lastChild.from,
                    to: lastChild.to,
                    isLine: false,
                    dec: Decoration.replace({}),
                  })
                }
              }

              // 3. Emphasis / Italic (*italic* or _italic_)
              else if (node.name === 'Emphasis') {
                const firstChild = node.node.firstChild
                const lastChild = node.node.lastChild

                if (
                  firstChild &&
                  lastChild &&
                  firstChild.name === 'EmphasisMark' &&
                  lastChild.name === 'EmphasisMark' &&
                  firstChild.from !== lastChild.from
                ) {
                  // Hide opening *
                  entries.push({
                    from: firstChild.from,
                    to: firstChild.to,
                    isLine: false,
                    dec: Decoration.replace({}),
                  })
                  // Style text inside as italic
                  if (firstChild.to < lastChild.from) {
                    entries.push({
                      from: firstChild.to,
                      to: lastChild.from,
                      isLine: false,
                      dec: Decoration.mark({ class: 'cm-em' }),
                    })
                  }
                  // Hide closing *
                  entries.push({
                    from: lastChild.from,
                    to: lastChild.to,
                    isLine: false,
                    dec: Decoration.replace({}),
                  })
                }
              }

              // 4. Inline Code (`code`)
              else if (node.name === 'InlineCode') {
                const firstChild = node.node.firstChild
                const lastChild = node.node.lastChild

                if (
                  firstChild &&
                  lastChild &&
                  firstChild.name === 'CodeMark' &&
                  lastChild.name === 'CodeMark' &&
                  firstChild.from !== lastChild.from
                ) {
                  // Hide opening `
                  entries.push({
                    from: firstChild.from,
                    to: firstChild.to,
                    isLine: false,
                    dec: Decoration.replace({}),
                  })
                  // Style code inside
                  if (firstChild.to < lastChild.from) {
                    entries.push({
                      from: firstChild.to,
                      to: lastChild.from,
                      isLine: false,
                      dec: Decoration.mark({ class: 'cm-inline-code' }),
                    })
                  }
                  // Hide closing `
                  entries.push({
                    from: lastChild.from,
                    to: lastChild.to,
                    isLine: false,
                    dec: Decoration.replace({}),
                  })
                }
              }

              // 5. Blockquote (> text)
              else if (node.name === 'Blockquote') {
                const line = doc.lineAt(node.from)
                addLineClass(line.from, 'cm-blockquote')

                const firstChild = node.node.firstChild
                if (firstChild && firstChild.name === 'QuoteMark') {
                  const hideTo = Math.min(
                    line.to,
                    doc.sliceString(firstChild.to, firstChild.to + 1) === ' '
                      ? firstChild.to + 1
                      : firstChild.to
                  )
                  entries.push({
                    from: firstChild.from,
                    to: hideTo,
                    isLine: false,
                    dec: Decoration.replace({}),
                  })
                }
              }

              // 6. Links [label](url)
              else if (node.name === 'Link') {
                let openBracket: { from: number; to: number } | null = null
                let closeBracket: { from: number; to: number } | null = null

                let child = node.node.firstChild
                while (child) {
                  if (child.name === 'LinkMark') {
                    const text = doc.sliceString(child.from, child.to)
                    if (text === '[') openBracket = { from: child.from, to: child.to }
                    if (text === ']') closeBracket = { from: child.from, to: child.to }
                  }
                  child = child.nextSibling
                }

                if (openBracket && closeBracket && openBracket.to < closeBracket.from) {
                  // Hide opening [
                  entries.push({
                    from: openBracket.from,
                    to: openBracket.to,
                    isLine: false,
                    dec: Decoration.replace({}),
                  })
                  // Style link text
                  entries.push({
                    from: openBracket.to,
                    to: closeBracket.from,
                    isLine: false,
                    dec: Decoration.mark({ class: 'cm-link-text' }),
                  })
                  // Hide ](url)
                  entries.push({
                    from: closeBracket.from,
                    to: node.to,
                    isLine: false,
                    dec: Decoration.replace({}),
                  })
                }
              }
            },
          })
        }

        // Add line decorations
        for (const [lineStart, classSet] of lineClassMap.entries()) {
          entries.push({
            from: lineStart,
            to: lineStart,
            isLine: true,
            dec: Decoration.line({ class: Array.from(classSet).join(' ') }),
          })
        }

        // Sort: line decorations first at line start, then ranges in ascending order
        entries.sort((a, b) => {
          if (a.from !== b.from) return a.from - b.from
          if (a.isLine && !b.isLine) return -1
          if (!a.isLine && b.isLine) return 1
          return a.to - b.to
        })

        const builder = new RangeSetBuilder<Decoration>()
        let lastEnd = -1
        let lastLineStart = -1

        for (const entry of entries) {
          if (entry.isLine) {
            if (entry.from !== lastLineStart) {
              builder.add(entry.from, entry.from, entry.dec)
              lastLineStart = entry.from
            }
          } else {
            // Guard against any accidental overlap
            if (entry.from >= lastEnd && entry.from < entry.to) {
              builder.add(entry.from, entry.to, entry.dec)
              lastEnd = entry.to
            }
          }
        }

        return builder.finish()
      }
    },
    {
      decorations: (v) => v.decorations,
    }
  )
}

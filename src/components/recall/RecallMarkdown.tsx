import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const AUDIO_EXT_RE = /\.(mp3|wav|ogg|m4a)(\?.*)?$/i

interface RecallMarkdownProps {
  content: string
}

export default function RecallMarkdown({ content }: RecallMarkdownProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        a: ({ href, children }) => {
          if (href && AUDIO_EXT_RE.test(href)) {
            return (
              <Box sx={{ my: 0.75 }}>
                <Box
                  component="audio"
                  controls
                  preload="none"
                  src={href}
                  sx={{ width: '100%', maxWidth: 340, height: 36, display: 'block' }}
                />
              </Box>
            )
          }
          return (
            <Link href={href} target="_blank" rel="noreferrer">
              {children}
            </Link>
          )
        },
        img: ({ src, alt }) => (
          <Box
            component="img"
            src={src}
            alt={alt || 'Recall media'}
            loading="lazy"
            decoding="async"
            sx={{
              display: 'block',
              maxWidth: '100%',
              maxHeight: 260,
              borderRadius: 2,
              objectFit: 'contain',
              my: 1,
            }}
          />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  )
}

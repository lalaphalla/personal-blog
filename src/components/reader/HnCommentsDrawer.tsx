import { useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { CloseIcon } from '../DocIcons'
import { useHnItem } from '../../hooks/useReaderQueries'
import type { HnComment } from '../../services/readerApi'

interface HnCommentsDrawerProps {
  hnId: number | null
  onClose: () => void
  onCreateRecallFromComment?: (prefill: {
    front: string
    back: string
    source_url: string
    deck: string
  }) => void
}

function CommentNode({
  comment,
  storyTitle,
  onCreateRecallFromComment,
  depth = 0,
}: {
  comment: HnComment
  storyTitle: string
  onCreateRecallFromComment?: HnCommentsDrawerProps['onCreateRecallFromComment']
  depth?: number
}) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <Box
      sx={{
        pl: depth > 0 ? 1.75 : 0,
        borderLeft: depth > 0 ? '2px solid' : 'none',
        borderColor: 'divider',
        mt: 1.5,
      }}
    >
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.5 }}>
        <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
          {comment.author || 'anonymous'}
        </Typography>
        <Button
          size="small"
          onClick={() => setCollapsed((c) => !c)}
          sx={{
            minWidth: 0,
            px: 0.75,
            py: 0,
            fontSize: '0.7rem',
            textTransform: 'none',
            color: 'text.secondary',
          }}
        >
          {collapsed ? `[+ ${comment.children.length + 1}]` : '[-]'}
        </Button>
        {onCreateRecallFromComment && (
          <Button
            size="small"
            onClick={() =>
              onCreateRecallFromComment({
                front: storyTitle,
                back: `${comment.text}\n\n— *${comment.author || 'anonymous'}*`,
                source_url: `https://news.ycombinator.com/item?id=${comment.id}`,
                deck: 'Hacker News',
              })
            }
            sx={{
              minWidth: 0,
              px: 0.75,
              py: 0,
              fontSize: '0.7rem',
              textTransform: 'none',
            }}
          >
            + Recall
          </Button>
        )}
      </Stack>

      {!collapsed && (
        <>
          <Typography
            variant="body2"
            sx={{
              whiteSpace: 'pre-line',
              lineHeight: 1.55,
              color: 'text.primary',
              wordBreak: 'break-word',
            }}
          >
            {comment.text}
          </Typography>
          {comment.children.map((child) => (
            <CommentNode
              key={child.id}
              comment={child}
              storyTitle={storyTitle}
              onCreateRecallFromComment={onCreateRecallFromComment}
              depth={depth + 1}
            />
          ))}
        </>
      )}
    </Box>
  )
}

export default function HnCommentsDrawer({
  hnId,
  onClose,
  onCreateRecallFromComment,
}: HnCommentsDrawerProps) {
  const { data: item, isPending, isError } = useHnItem(hnId ?? undefined)

  return (
    <Drawer
      anchor="right"
      open={Boolean(hnId)}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: { xs: '100vw', sm: 560 },
            maxWidth: '100vw',
          },
        },
      }}
    >
      <Stack sx={{ height: '100%' }}>
        <Stack
          direction="row"
          sx={{
            px: 2.5,
            py: 1.75,
            borderBottom: '1px solid',
            borderColor: 'divider',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Hacker News Discussion
          </Typography>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>

        <Box sx={{ flex: 1, overflowY: 'auto', p: 2.5 }}>
          {isPending ? (
            <Stack sx={{ py: 8, alignItems: 'center' }}>
              <CircularProgress />
            </Stack>
          ) : isError || !item ? (
            <Typography variant="body2" color="error">
              Unable to load comments.
            </Typography>
          ) : (
            <Stack spacing={2}>
              <Box>
                <Link
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  underline="hover"
                  sx={{ fontWeight: 700, fontSize: '1.05rem', color: 'text.primary' }}
                >
                  {item.title}
                </Link>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  {item.points} points · by {item.author} ·{' '}
                  <Link
                    href={`https://news.ycombinator.com/item?id=${item.id}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open on HN
                  </Link>
                </Typography>
              </Box>

              {item.text && (
                <Typography
                  variant="body2"
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: 'action.hover',
                    whiteSpace: 'pre-line',
                    lineHeight: 1.6,
                  }}
                >
                  {item.text}
                </Typography>
              )}

              <Divider />

              {item.children.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No comments yet.
                </Typography>
              ) : (
                <Box>
                  {item.children.map((c) => (
                    <CommentNode
                      key={c.id}
                      comment={c}
                      storyTitle={item.title}
                      onCreateRecallFromComment={onCreateRecallFromComment}
                    />
                  ))}
                </Box>
              )}
            </Stack>
          )}
        </Box>
      </Stack>
    </Drawer>
  )
}

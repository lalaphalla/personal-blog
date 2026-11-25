import { useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import type { JournalThumbnail } from '../../services/journalApi'

interface JournalMediaCollageProps {
  images: JournalThumbnail[]
  totalCount?: number
}

export default function JournalMediaCollage({
  images,
  totalCount,
}: JournalMediaCollageProps) {
  const [failedIds, setFailedIds] = useState<Set<number>>(() => new Set())

  const visibleImages = images.slice(0, 4)
  if (visibleImages.length === 0) return null

  const count = visibleImages.length
  const extraCount = totalCount && totalCount > 4 ? totalCount - 4 : 0

  const handleImageError = (id: number) => {
    setFailedIds((prev) => {
      if (prev.has(id)) return prev
      const next = new Set(prev)
      next.add(id)
      return next
    })
  }

  const renderTile = (img: JournalThumbnail, index: number, extraSx?: object) => {
    const isFailed = failedIds.has(img.id)
    const showOverflow = index === 3 && extraCount > 0
    const src = img.thumbnail_url || img.url

    return (
      <Box
        key={img.id}
        sx={{
          position: 'relative',
          overflow: 'hidden',
          bgcolor: 'action.hover',
          width: '100%',
          height: '100%',
          minHeight: 0,
          ...extraSx,
        }}
      >
        {!isFailed ? (
          <Box
            component="img"
            src={src}
            alt={img.filename}
            loading="lazy"
            decoding="async"
            onError={() => handleImageError(img.id)}
            sx={{
              display: 'block',
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.25s ease',
            }}
          />
        ) : (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'text.disabled',
            }}
          >
            <Typography variant="caption">Image unavailable</Typography>
          </Box>
        )}

        {showOverflow && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: (theme) => alpha(theme.palette.common.black, 0.5),
              backdropFilter: 'blur(2px)',
            }}
          >
            <Typography
              variant="h6"
              sx={{ color: 'common.white', fontWeight: 700, letterSpacing: 0.5 }}
            >
              +{extraCount}
            </Typography>
          </Box>
        )}
      </Box>
    )
  }

  if (count === 1) {
    return (
      <Box
        sx={{
          borderRadius: 2.5,
          overflow: 'hidden',
          height: { xs: 180, sm: 220 },
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        {renderTile(visibleImages[0], 0)}
      </Box>
    )
  }

  if (count === 2) {
    return (
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 0.5,
          borderRadius: 2.5,
          overflow: 'hidden',
          height: { xs: 150, sm: 185 },
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        {visibleImages.map((img, i) => renderTile(img, i))}
      </Box>
    )
  }

  if (count === 3) {
    return (
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1.35fr 1fr',
          gridTemplateRows: '1fr 1fr',
          gap: 0.5,
          borderRadius: 2.5,
          overflow: 'hidden',
          height: { xs: 175, sm: 215 },
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        {visibleImages.map((img, i) =>
          renderTile(img, i, i === 0 ? { gridRow: '1 / span 2' } : undefined),
        )}
      </Box>
    )
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: '1fr 1fr',
        gap: 0.5,
        borderRadius: 2.5,
        overflow: 'hidden',
        height: { xs: 180, sm: 220 },
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      {visibleImages.map((img, i) => renderTile(img, i))}
    </Box>
  )
}

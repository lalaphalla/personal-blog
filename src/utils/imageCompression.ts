const MAX_IMAGE_DIMENSION = 2048
const SIZE_THRESHOLD_BYTES = 1.5 * 1024 * 1024 // 1.5 MB
const COMPRESSION_QUALITY = 0.85
const COMPRESSIBLE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

interface LoadedImage {
  width: number
  height: number
  draw: (ctx: CanvasRenderingContext2D, width: number, height: number) => void
  cleanup: () => void
}

async function loadImageForCanvas(file: File): Promise<LoadedImage> {
  if (typeof createImageBitmap === 'function') {
    const bitmap = await createImageBitmap(file)
    return {
      width: bitmap.width,
      height: bitmap.height,
      draw: (ctx, w, h) => ctx.drawImage(bitmap, 0, 0, w, h),
      cleanup: () => bitmap.close(),
    }
  }

  const objectUrl = URL.createObjectURL(file)
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image()
    el.onload = () => resolve(el)
    el.onerror = () => reject(new Error('Failed to load image'))
    el.src = objectUrl
  })
  return {
    width: img.naturalWidth,
    height: img.naturalHeight,
    draw: (ctx, w, h) => ctx.drawImage(img, 0, 0, w, h),
    cleanup: () => URL.revokeObjectURL(objectUrl),
  }
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), mimeType, quality)
  })
}

function replaceExtension(filename: string, ext: string): string {
  const dotIndex = filename.lastIndexOf('.')
  const stem = dotIndex > 0 ? filename.slice(0, dotIndex) : filename
  return `${stem}${ext}`
}

/**
 * Resize and compress large JPEG/PNG/WebP images in the browser before upload.
 * Skips GIFs (to preserve animation) and small images already under 2048px and 1.5 MB.
 * Falls back to the original file if compression fails or does not reduce size.
 */
export async function compressImageForUpload(file: File): Promise<File> {
  if (!COMPRESSIBLE_TYPES.has(file.type)) {
    return file
  }

  let loaded: LoadedImage | null = null
  try {
    loaded = await loadImageForCanvas(file)
    const { width, height } = loaded
    if (width <= 0 || height <= 0) return file

    const needsResize = width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION
    if (!needsResize && file.size <= SIZE_THRESHOLD_BYTES) {
      return file
    }

    const scale = needsResize
      ? Math.min(MAX_IMAGE_DIMENSION / width, MAX_IMAGE_DIMENSION / height)
      : 1
    const targetWidth = Math.max(1, Math.round(width * scale))
    const targetHeight = Math.max(1, Math.round(height * scale))

    const canvas = document.createElement('canvas')
    canvas.width = targetWidth
    canvas.height = targetHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return file

    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    loaded.draw(ctx, targetWidth, targetHeight)

    let blob = await canvasToBlob(canvas, 'image/webp', COMPRESSION_QUALITY)
    let outExt = '.webp'
    if (!blob || blob.type !== 'image/webp') {
      blob = await canvasToBlob(canvas, 'image/jpeg', COMPRESSION_QUALITY)
      outExt = '.jpg'
    }

    if (!blob || (!needsResize && blob.size >= file.size)) {
      return file
    }

    return new File([blob], replaceExtension(file.name, outExt), {
      type: blob.type,
      lastModified: file.lastModified,
    })
  } catch {
    return file
  } finally {
    loaded?.cleanup()
  }
}

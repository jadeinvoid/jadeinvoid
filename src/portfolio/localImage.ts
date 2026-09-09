export const MAX_LOCAL_IMAGE_BYTES = 3_000_000
export const MAX_LOCAL_IMAGE_LABEL = '3 MB'
export const MAX_UPLOAD_IMAGE_BYTES = 30_000_000
export const MAX_UPLOAD_IMAGE_LABEL = '30 MB'

// Base64 adds roughly one third to the source size, plus a short data URL prefix.
export const MAX_LOCAL_IMAGE_DATA_URL_LENGTH = Math.ceil(MAX_LOCAL_IMAGE_BYTES * 4 / 3) + 256

export function localImageSizeMessage() {
  return `Images must be smaller than ${MAX_LOCAL_IMAGE_LABEL} for local saving.`
}

export function uploadImageSizeMessage() {
  return `Images must be smaller than ${MAX_UPLOAD_IMAGE_LABEL} before optimization.`
}

export interface OptimizedLocalImage {
  src: string
  thumbnailSrc: string
  fullSrc: string
}

const THUMBNAIL_MAX_EDGE = 640
const DISPLAY_MAX_EDGE = 2400
const FULL_MAX_EDGE = 4000

function readFile(file: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Invalid image data'))
    reader.onerror = () => reject(reader.error ?? new Error('This image could not be read.'))
    reader.readAsDataURL(file)
  })
}

export function containedImageSize(width: number, height: number, maxEdge: number) {
  const scale = Math.min(1, maxEdge / Math.max(width, height))
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) }
}

function renderVariant(bitmap: ImageBitmap, maxEdge: number, quality: number) {
  const size = containedImageSize(bitmap.width, bitmap.height, maxEdge)
  const canvas = document.createElement('canvas')
  canvas.width = size.width
  canvas.height = size.height
  const context = canvas.getContext('2d')
  if (!context) return Promise.reject(new Error('Image canvas is not available'))
  context.drawImage(bitmap, 0, 0, size.width, size.height)
  return new Promise<Blob>((resolve, reject) => canvas.toBlob((blob) => {
    canvas.width = 1
    canvas.height = 1
    if (blob) resolve(blob)
    else reject(new Error('This image could not be optimized.'))
  }, 'image/webp', quality))
}

export async function optimizeLocalImage(file: File): Promise<OptimizedLocalImage> {
  if (!file.type.startsWith('image/')) throw new Error('Choose an image file.')
  if (file.size > MAX_UPLOAD_IMAGE_BYTES) throw new Error(uploadImageSizeMessage())

  const original = await readFile(file)
  // Keep vector artwork vector, and avoid flattening animated images.
  if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
    return { src: original, thumbnailSrc: original, fullSrc: original }
  }

  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  } catch {
    // Some browser-supported image formats cannot be decoded by createImageBitmap.
    return { src: original, thumbnailSrc: original, fullSrc: original }
  }

  try {
    // Encode sequentially to avoid holding three large canvas buffers at once.
    const thumbnailSrc = await readFile(await renderVariant(bitmap, THUMBNAIL_MAX_EDGE, 0.78))
    const src = await readFile(await renderVariant(bitmap, DISPLAY_MAX_EDGE, 0.84))
    const fullSrc = await readFile(await renderVariant(bitmap, FULL_MAX_EDGE, 0.9))
    return { src, thumbnailSrc, fullSrc }
  } finally {
    bitmap.close()
  }
}

export interface ThumbnailBackground {
  top: string
  bottom: string
  foreground: '#1f0f0f' | '#fff'
}

const SAMPLE_SIZE = 48
const QUANTIZATION_STEP = 32
const EDGE_BAND_RATIO = 0.16

function channelHex(channel: number) {
  return Math.round(channel).toString(16).padStart(2, '0')
}

function findRepresentativeColor(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  startY: number,
  endY: number,
  startX = 0,
  endX = width,
): [number, number, number] | null {
  const from = Math.max(0, Math.floor(startY))
  const to = Math.min(height, Math.ceil(endY))
  const left = Math.max(0, Math.floor(startX))
  const right = Math.min(width, Math.ceil(endX))
  if (from >= to || left >= right) return null

  const buckets = new Map<string, { red: number; green: number; blue: number; weight: number }>()

  for (let y = from; y < to; y += 1) {
    for (let x = left; x < right; x += 1) {
      const offset = (y * width + x) * 4
      const alpha = pixels[offset + 3] / 255
      if (alpha < 0.2) continue

      const red = pixels[offset]
      const green = pixels[offset + 1]
      const blue = pixels[offset + 2]
      const key = `${Math.floor(red / QUANTIZATION_STEP)}-${Math.floor(green / QUANTIZATION_STEP)}-${Math.floor(blue / QUANTIZATION_STEP)}`
      const bucket = buckets.get(key) ?? { red: 0, green: 0, blue: 0, weight: 0 }
      bucket.red += red * alpha
      bucket.green += green * alpha
      bucket.blue += blue * alpha
      bucket.weight += alpha
      buckets.set(key, bucket)
    }
  }

  const dominant = [...buckets.values()].sort((a, b) => b.weight - a.weight)[0]
  if (!dominant) return null

  const red = dominant.red / dominant.weight
  const green = dominant.green / dominant.weight
  const blue = dominant.blue / dominant.weight

  return [red, green, blue]
}

function colorDistance(first: [number, number, number], second: [number, number, number]) {
  return Math.hypot(first[0] - second[0], first[1] - second[1], first[2] - second[2])
}

function colorSaturation([red, green, blue]: [number, number, number]) {
  const maximum = Math.max(red, green, blue)
  const minimum = Math.min(red, green, blue)
  return maximum === 0 ? 0 : (maximum - minimum) / maximum
}

export function findThumbnailBackground(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
): ThumbnailBackground | null {
  if (width < 1 || height < 1) return null

  // Match the visible horizontal boundaries of a contained thumbnail. Sampling
  // the whole half can select an interior color that never reaches the edge.
  const band = Math.max(1, Math.round(height * EDGE_BAND_RATIO))
  let topColor = findRepresentativeColor(pixels, width, height, 0, band)
  let bottomColor = findRepresentativeColor(pixels, width, height, height - band, height)

  // A matching, saturated color in both upper corners usually means the
  // artwork has a deliberate solid backdrop behind its central subject.
  const cornerWidth = Math.max(1, Math.round(width * 0.18))
  const topLeft = findRepresentativeColor(pixels, width, height, 0, band, 0, cornerWidth)
  const topRight = findRepresentativeColor(pixels, width, height, 0, band, width - cornerWidth, width)
  if (topLeft && topRight && colorDistance(topLeft, topRight) < 42) {
    const cornerBackground: [number, number, number] = [
      (topLeft[0] + topRight[0]) / 2,
      (topLeft[1] + topRight[1]) / 2,
      (topLeft[2] + topRight[2]) / 2,
    ]
    if (colorSaturation(cornerBackground) >= 0.35) {
      topColor = cornerBackground
      bottomColor = cornerBackground
    }
  }
  const fallback = topColor ?? bottomColor
  if (!fallback) return null

  const [topRed, topGreen, topBlue] = topColor ?? fallback
  const [bottomRed, bottomGreen, bottomBlue] = bottomColor ?? fallback
  const top = `#${channelHex(topRed)}${channelHex(topGreen)}${channelHex(topBlue)}`
  const bottom = `#${channelHex(bottomRed)}${channelHex(bottomGreen)}${channelHex(bottomBlue)}`
  const bottomLuminance = (0.2126 * bottomRed + 0.7152 * bottomGreen + 0.0722 * bottomBlue) / 255

  return { top, bottom, foreground: bottomLuminance < 0.48 ? '#fff' : '#1f0f0f' }
}

export function extractThumbnailBackground(image: HTMLImageElement): ThumbnailBackground | null {
  const canvas = document.createElement('canvas')
  const scale = Math.min(1, SAMPLE_SIZE / Math.max(image.naturalWidth, image.naturalHeight))
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))

  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) return null

  try {
    context.drawImage(image, 0, 0, canvas.width, canvas.height)
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
    return findThumbnailBackground(imageData.data, canvas.width, canvas.height)
  } catch {
    // Cross-origin images can be displayed but cannot always be read by canvas.
    return null
  }
}

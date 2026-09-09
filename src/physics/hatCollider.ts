import type { CharacterPartDefinition } from '../types'
import { MODEL_COLLIDER_PRESENTATIONS } from './modelColliderPresentation'

export interface Point {
  x: number
  y: number
}

export interface HatColliderProfile {
  part: CharacterPartDefinition
  mediaType: 'image' | 'model'
  vertices: Point[]
  vertexSets: Point[][]
  imageWidth: number
  imageHeight: number
  imageLeft: number
  imageTop: number
  colliderSource: 'generated' | 'authored'
}

const profileCache = new Map<string, Promise<HatColliderProfile>>()
const TARGET_WIDTHS: Record<string, number> = {
  'hat-paperboat-2d': 160,
  'hat-beret-2': 144,
  'hat-magician': 132,
}

function cross(origin: Point, first: Point, second: Point) {
  return (first.x - origin.x) * (second.y - origin.y) - (first.y - origin.y) * (second.x - origin.x)
}

export function convexHull(points: Point[]) {
  if (points.length <= 3) return [...points]
  const sorted = [...points].sort((left, right) => left.x - right.x || left.y - right.y)
  const lower: Point[] = []
  for (const point of sorted) {
    while (lower.length >= 2 && cross(lower.at(-2)!, lower.at(-1)!, point) <= 0) lower.pop()
    lower.push(point)
  }
  const upper: Point[] = []
  for (let index = sorted.length - 1; index >= 0; index -= 1) {
    const point = sorted[index]
    while (upper.length >= 2 && cross(upper.at(-2)!, upper.at(-1)!, point) <= 0) upper.pop()
    upper.push(point)
  }
  lower.pop()
  upper.pop()
  return [...lower, ...upper]
}

function polygonCentroid(points: Point[]) {
  let area = 0
  let x = 0
  let y = 0
  for (let index = 0; index < points.length; index += 1) {
    const current = points[index]
    const next = points[(index + 1) % points.length]
    const factor = current.x * next.y - next.x * current.y
    area += factor
    x += (current.x + next.x) * factor
    y += (current.y + next.y) * factor
  }
  const divisor = area * 3
  if (Math.abs(divisor) < 0.001) return points[0] ?? { x: 0, y: 0 }
  return { x: x / divisor, y: y / divisor }
}

function simplifyHull(points: Point[], maximumPoints = 12) {
  if (points.length <= maximumPoints) return points
  return Array.from({ length: maximumPoints }, (_, index) => points[Math.floor(index * points.length / maximumPoints)])
}

function loadImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error(`Could not scan ${source}`))
    image.src = source
  })
}

async function scanHatCollider(part: CharacterPartDefinition): Promise<HatColliderProfile> {
  const image = await loadImage(part.src)
  const reduction = Math.min(1, 180 / Math.max(image.naturalWidth, image.naturalHeight))
  const width = Math.max(1, Math.round(image.naturalWidth * reduction))
  const height = Math.max(1, Math.round(image.naturalHeight * reduction))
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) throw new Error('Canvas scanning is unavailable')
  context.drawImage(image, 0, 0, width, height)
  const pixels = context.getImageData(0, 0, width, height).data
  const alphaAt = (x: number, y: number) => x < 0 || y < 0 || x >= width || y >= height
    ? 0
    : pixels[(y * width + x) * 4 + 3]
  const opaquePixels: Point[] = []
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (alphaAt(x, y) >= 96) opaquePixels.push({ x, y })
    }
  }
  const rawHull = simplifyHull(convexHull(opaquePixels))
  const hull = rawHull.length >= 3
    ? rawHull
    : [{ x: 0, y: 0 }, { x: width, y: 0 }, { x: width, y: height }, { x: 0, y: height }]
  const minX = Math.min(...hull.map((point) => point.x))
  const maxX = Math.max(...hull.map((point) => point.x))
  const visibleWidth = Math.max(1, maxX - minX)
  const scale = (TARGET_WIDTHS[part.id] ?? 176) / visibleWidth
  const centroid = polygonCentroid(hull)
  return {
    part,
    mediaType: 'image',
    vertices: hull.map((point) => ({ x: (point.x - centroid.x) * scale, y: (point.y - centroid.y) * scale })),
    vertexSets: [hull.map((point) => ({ x: (point.x - centroid.x) * scale, y: (point.y - centroid.y) * scale }))],
    imageWidth: width * scale,
    imageHeight: height * scale,
    imageLeft: -centroid.x * scale,
    imageTop: -centroid.y * scale,
    colliderSource: 'generated',
  }
}

function createModelCollider(part: CharacterPartDefinition): HatColliderProfile {
  const presentation = MODEL_COLLIDER_PRESENTATIONS.cap!
  const vertexSets = [
    [
      { x: -68, y: -28 },
      { x: 34, y: -34 },
      { x: 62, y: -10 },
      { x: 44, y: 6 },
      { x: -44, y: 8 },
      { x: -74, y: 2 },
    ],
    [
      { x: -74, y: 2 },
      { x: -44, y: 7 },
      { x: -24, y: 29 },
      { x: -54, y: 34 },
      { x: -72, y: 18 },
    ],
    [
      { x: 44, y: 5 },
      { x: 62, y: -10 },
      { x: 72, y: -8 },
      { x: 62, y: 30 },
      { x: 24, y: 27 },
    ],
  ]
  return {
    part,
    mediaType: 'model',
    vertices: [
      { x: -68, y: -28 },
      { x: 34, y: -34 },
      { x: 72, y: -8 },
      { x: 62, y: 30 },
      { x: -54, y: 34 },
      { x: -76, y: 8 },
    ],
    vertexSets,
    imageWidth: presentation.frame.width,
    imageHeight: presentation.frame.height,
    imageLeft: presentation.frame.left,
    imageTop: presentation.frame.top,
    colliderSource: 'generated',
  }
}

export function loadHatCollider(part: CharacterPartDefinition) {
  const cached = profileCache.get(part.id)
  if (cached) return cached
  const profile = part.src.endsWith('.glb')
    ? Promise.resolve(createModelCollider(part))
    : scanHatCollider(part)
  profileCache.set(part.id, profile)
  return profile
}

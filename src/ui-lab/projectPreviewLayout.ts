export interface ProjectPreviewPosition {
  left: string
  top: string
  width: string
  height: string
}

export interface PreviewRect {
  left: number
  top: number
  width: number
  height: number
}

export interface ProjectPreviewLayoutOptions {
  safeArea: typeof PROJECT_PREVIEW_SAFE_AREA
  count: number
  minWidth: number
  maxWidth: number
  minHeight: number
  maxHeight: number
  gap: number
  attempts: number
  fallback: PreviewRect[]
}

export function selectRandomProjectPreviews<T>(items: readonly T[], count: number, random: () => number = Math.random): T[] {
  const shuffled = [...items]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    const current = shuffled[index]
    shuffled[index] = shuffled[swapIndex]
    shuffled[swapIndex] = current
  }
  return shuffled.slice(0, Math.max(0, count))
}

// The character and falling hats occupy the left 37% of the stage. This safe
// area starts beyond them and leaves a small inset from every viewport edge.
export const PROJECT_PREVIEW_SAFE_AREA = {
  left: 38,
  top: 14,
  right: 96,
  bottom: 94,
}

const PROJECT_PREVIEW_LAYOUT: ProjectPreviewLayoutOptions = {
  safeArea: PROJECT_PREVIEW_SAFE_AREA,
  count: 3,
  minWidth: 18,
  maxWidth: 24,
  minHeight: 21,
  maxHeight: 26,
  gap: 2,
  attempts: 240,
  fallback: [
    { left: 39, top: 16, width: 23, height: 24 },
    { left: 70, top: 28, width: 23, height: 24 },
    { left: 48, top: 65, width: 23, height: 24 },
  ],
}

function randomBetween(min: number, max: number, random: () => number) {
  return min + random() * (max - min)
}

function overlaps(a: PreviewRect, b: PreviewRect, gap: number) {
  return !(
    a.left + a.width + gap <= b.left
    || b.left + b.width + gap <= a.left
    || a.top + a.height + gap <= b.top
    || b.top + b.height + gap <= a.top
  )
}

function toPosition(rect: PreviewRect): ProjectPreviewPosition {
  const percent = (value: number) => `${value.toFixed(2)}%`
  return {
    left: percent(rect.left),
    top: percent(rect.top),
    width: percent(rect.width),
    height: percent(rect.height),
  }
}

export function generateProjectPreviewPositions(random: () => number = Math.random, options: Partial<ProjectPreviewLayoutOptions> = {}): ProjectPreviewPosition[] {
  const layout = { ...PROJECT_PREVIEW_LAYOUT, ...options }
  const safeArea = layout.safeArea
  const placed: PreviewRect[] = []

  for (let attempt = 0; attempt < layout.attempts && placed.length < layout.count; attempt += 1) {
    const width = randomBetween(layout.minWidth, layout.maxWidth, random)
    const height = randomBetween(layout.minHeight, layout.maxHeight, random)
    const candidate = {
      left: randomBetween(safeArea.left, safeArea.right - width, random),
      top: randomBetween(safeArea.top, safeArea.bottom - height, random),
      width,
      height,
    }

    if (!placed.some((rect) => overlaps(rect, candidate, layout.gap))) placed.push(candidate)
  }

  return (placed.length === layout.count ? placed : layout.fallback).map(toPosition)
}

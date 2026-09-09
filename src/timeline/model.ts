import type { AnimationClip, ClipTransitionSettings, ClipVisualState } from './types'

export const CLIP_SNAP_MS = 50
export const MIN_CLIP_DURATION_MS = 100
export const MIN_PREVIEW_RANGE_MS = 50

export function snapTimeMs(value: number) {
  if (!Number.isFinite(value)) return 0
  return Math.round(value / CLIP_SNAP_MS) * CLIP_SNAP_MS
}

export function constrainClipBounds(startMs: number, durationMs: number) {
  return {
    startMs: Math.max(0, snapTimeMs(startMs)),
    durationMs: Math.max(MIN_CLIP_DURATION_MS, snapTimeMs(durationMs)),
  }
}

export function constrainPreviewRange(startMs: number, endMs: number, durationMs: number) {
  const duration = Math.max(MIN_PREVIEW_RANGE_MS, durationMs)
  const start = Math.max(0, Math.min(duration - MIN_PREVIEW_RANGE_MS, snapTimeMs(startMs)))
  const end = Math.max(start + MIN_PREVIEW_RANGE_MS, Math.min(duration, snapTimeMs(endMs)))
  return { previewStartMs: start, previewEndMs: end }
}

export function calculateClipProgress(clip: AnimationClip, currentTimeMs: number) {
  if (!clip.enabled || currentTimeMs < clip.startMs) return { phase: 'before' as const, progress: 0 }
  const elapsed = currentTimeMs - clip.startMs
  if (clip.loop) return { phase: 'during' as const, progress: (elapsed % clip.durationMs) / clip.durationMs }
  if (elapsed >= clip.durationMs) return { phase: 'after' as const, progress: 1 }
  return { phase: 'during' as const, progress: elapsed / clip.durationMs }
}

function cubicBezierCoordinate(t: number, a: number, b: number) {
  const inverse = 1 - t
  return 3 * inverse * inverse * t * a + 3 * inverse * t * t * b + t * t * t
}

function cubicBezierProgress(progress: number, x1: number, y1: number, x2: number, y2: number) {
  let low = 0
  let high = 1
  let parameter = progress
  for (let index = 0; index < 12; index += 1) {
    parameter = (low + high) / 2
    if (cubicBezierCoordinate(parameter, x1, x2) < progress) low = parameter
    else high = parameter
  }
  return cubicBezierCoordinate(parameter, y1, y2)
}

export function applyClipTransition(progress: number, transition: ClipTransitionSettings, durationMs = 1000) {
  const clamped = Math.max(0, Math.min(1, progress))
  if (clamped === 0 || clamped === 1) return clamped
  if (transition.type === 'spring') {
    const visualDurationMs = Math.max(50, transition.spring.visualDuration * 1000)
    const springProgress = Math.min(1, clamped * Math.max(1, durationMs) / visualDurationMs)
    const bounce = Math.max(0, Math.min(1, transition.spring.bounce))
    const damping = 7 + (1 - bounce) * 7
    const frequency = 8 + bounce * 8
    const response = 1 - Math.exp(-damping * springProgress) * Math.cos(frequency * springProgress)
    const endpoint = 1 - Math.exp(-damping) * Math.cos(frequency)
    return response / endpoint
  }
  if (transition.easing === 'linear') return clamped
  if (transition.easing === 'easeInOut') return cubicBezierProgress(clamped, 0.65, 0, 0.35, 1)
  if (transition.easing === 'circOut') return cubicBezierProgress(clamped, 0, 0.55, 0.45, 1)
  if (transition.easing === 'custom') return cubicBezierProgress(clamped, ...transition.bezier)
  return cubicBezierProgress(clamped, 0.22, 1, 0.36, 1)
}

export function interpolateClipState(from: ClipVisualState, to: ClipVisualState, progress: number): ClipVisualState {
  const interpolate = (start: number, end: number) => start + (end - start) * progress
  return {
    x: interpolate(from.x, to.x),
    y: interpolate(from.y, to.y),
    z: interpolate(from.z, to.z),
    scale: interpolate(from.scale, to.scale),
    rotateX: interpolate(from.rotateX, to.rotateX),
    rotateY: interpolate(from.rotateY, to.rotateY),
    rotateZ: interpolate(from.rotateZ, to.rotateZ),
    opacity: interpolate(from.opacity, to.opacity),
    blur: interpolate(from.blur, to.blur),
    borderRadius: interpolate(from.borderRadius, to.borderRadius),
  }
}

export function resolveAssetClipState(
  clips: readonly AnimationClip[],
  assetId: string,
  currentTimeMs: number,
  fallback: ClipVisualState,
) {
  const assetClips = clips
    .filter((clip) => clip.enabled && clip.assetId === assetId)
    .sort((a, b) => a.startMs - b.startMs || a.id.localeCompare(b.id))
  if (!assetClips.length) return { state: fallback, clipId: null, progress: 0, hasClips: false }

  const started = assetClips.filter((clip) => clip.startMs <= currentTimeMs)
  const clip = started.at(-1) ?? assetClips[0]
  const calculated = calculateClipProgress(clip, currentTimeMs)
  const localTimeMs = calculated.progress * clip.durationMs
  const frames = [
    { offsetMs: 0, state: clip.from },
    ...clip.keyframes,
    { offsetMs: clip.durationMs, state: clip.to },
  ].sort((a, b) => a.offsetMs - b.offsetMs)
  const nextFrameIndex = frames.findIndex((frame) => frame.offsetMs >= localTimeMs)
  const toFrame = frames[nextFrameIndex < 0 ? frames.length - 1 : nextFrameIndex]
  const fromFrame = frames[Math.max(0, (nextFrameIndex < 0 ? frames.length - 1 : nextFrameIndex) - 1)]
  const segmentDurationMs = Math.max(1, toFrame.offsetMs - fromFrame.offsetMs)
  const segmentProgress = toFrame === fromFrame ? 0 : (localTimeMs - fromFrame.offsetMs) / segmentDurationMs
  const progress = applyClipTransition(segmentProgress, clip.transition, segmentDurationMs)
  return {
    state: interpolateClipState(fromFrame.state, toFrame.state, progress),
    clipId: clip.id,
    progress: calculated.progress,
    hasClips: true,
  }
}

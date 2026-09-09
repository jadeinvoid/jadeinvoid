export const INTERACTION_TYPES = ['enter', 'idle', 'hover', 'press', 'exit', 'custom'] as const
export type InteractionType = typeof INTERACTION_TYPES[number]

export const CLIP_EASINGS = ['linear', 'easeOut', 'easeInOut', 'circOut', 'custom'] as const
export type ClipEasing = typeof CLIP_EASINGS[number]

export interface ClipVisualState {
  x: number
  y: number
  z: number
  scale: number
  rotateX: number
  rotateY: number
  rotateZ: number
  opacity: number
  blur: number
  borderRadius: number
}

export interface ClipTransitionSettings {
  type: 'tween' | 'spring'
  easing: ClipEasing
  bezier: [number, number, number, number]
  spring: {
    type: 'spring'
    visualDuration: number
    bounce: number
  }
}

export interface AnimationClip {
  id: string
  assetId: string
  label: string
  interactionType: InteractionType
  startMs: number
  durationMs: number
  enabled: boolean
  loop: boolean
  from: ClipVisualState
  to: ClipVisualState
  keyframes: ClipKeyframe[]
  transition: ClipTransitionSettings
}

export interface ClipKeyframe {
  id: string
  offsetMs: number
  state: ClipVisualState
}

export interface AssetTimelinePreview {
  state: ClipVisualState
  clipId: string | null
  progress: number
  hasClips: boolean
}

export type TimelinePreviewMap = Record<string, AssetTimelinePreview>

export interface TimelineMarker {
  id: string
  timeMs: number
  label: string
  color: string
}

export type TimelineZoom = 50 | 100 | 200

export interface TimelinePresetData {
  durationMs: number
  isLooping: boolean
  playbackRate: 0.5 | 1 | 2
  previewStartMs: number
  previewEndMs: number
  isPreviewRangeLooping: boolean
  zoomPxPerSecond: TimelineZoom
  clips: AnimationClip[]
  markers: TimelineMarker[]
}

export const DEFAULT_CLIP_TRANSITION: ClipTransitionSettings = {
  type: 'tween',
  easing: 'easeOut',
  bezier: [0.22, 1, 0.36, 1],
  spring: { type: 'spring', visualDuration: 0.55, bounce: 0.18 },
}

export const NEUTRAL_CLIP_STATE: ClipVisualState = {
  x: 0,
  y: 0,
  z: 0,
  scale: 1,
  rotateX: 0,
  rotateY: 0,
  rotateZ: 0,
  opacity: 1,
  blur: 0,
  borderRadius: 0,
}

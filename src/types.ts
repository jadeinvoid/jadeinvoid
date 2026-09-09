import type { ComponentType } from 'react'

export type AssetKind = 'model' | 'svg' | 'image'
export type WorkspaceMode = 'asset' | 'character' | 'hat' | 'ui' | 'content' | 'figma'
export type CharacterSlot = 'portrait' | 'eyes' | 'leftEye' | 'rightEye' | 'hand' | 'hat'

export interface AssetDefinition {
  id: string
  name: string
  kind: AssetKind
  src: string
  inlineComponent?: ComponentType<InlineSvgProps>
  note?: string
}

export interface InlineSvgProps {
  partMotion?: {
    y?: number | number[]
    rotate?: number | number[]
  }
  transition?: object
}

export interface LocalAsset extends AssetDefinition {
  objectUrl: string
}

export interface LayerTransform {
  x: number
  y: number
  scale: number
  rotate: number
  opacity: number
  zIndex: number
}

export interface CharacterPartDefinition {
  id: string
  name: string
  slot: CharacterSlot
  src: string
  frames?: readonly string[]
  width: number
  height: number
  defaultTransform: LayerTransform
}

export type MotionPresetName =
  | 'fade'
  | 'slide'
  | 'float'
  | 'pulse'
  | 'wobble'
  | 'rotate'
  | 'reveal'

export type ReducedMotionMode = 'system' | 'reduce' | 'force'

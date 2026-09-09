import type { ColliderPoint, ColliderProfileKey } from '../colliders/profiles'

export interface ModelColliderFrame {
  left: number
  top: number
  width: number
  height: number
  pixelsPerUnit: number
}

export interface ModelColliderPresentation {
  frame: ModelColliderFrame
  targetSize: number
  rotation: [number, number, number]
}

export interface ModelColliderTransform {
  offsetX: number
  offsetY: number
  offsetZ: number
  scaleX: number
  scaleY: number
  scaleZ: number
  rotateX: number
  rotateY: number
  rotateZ: number
}

export const IDENTITY_MODEL_COLLIDER_TRANSFORM: ModelColliderTransform = {
  offsetX: 0,
  offsetY: 0,
  offsetZ: 0,
  scaleX: 1,
  scaleY: 1,
  scaleZ: 1,
  rotateX: 0,
  rotateY: 0,
  rotateZ: 0,
}

/**
 * A model presentation is the single coordinate contract shared by the
 * Assets editor and runtime physics. New model assets opt in by adding one
 * profile here instead of introducing screen-specific offsets.
 */
export const MODEL_COLLIDER_PRESENTATIONS: Partial<Record<ColliderProfileKey, ModelColliderPresentation>> = {
  cap: {
    frame: {
      left: -78,
      top: -60,
      width: 156,
      height: 112,
      pixelsPerUnit: 78,
    },
    targetSize: 2.1,
    rotation: [0.12, Math.PI - 0.42, 0],
  },
}

export function getModelColliderPresentation(key: ColliderProfileKey) {
  return MODEL_COLLIDER_PRESENTATIONS[key] ?? null
}

export function colliderFrameCenter(frame: ModelColliderFrame): [number, number] {
  return [
    (frame.left + frame.width / 2) / frame.pixelsPerUnit,
    -(frame.top + frame.height / 2) / frame.pixelsPerUnit,
  ]
}

export function normalizedColliderPointToWorld(point: ColliderPoint, frame: ModelColliderFrame, scale = 1) {
  return {
    x: (frame.left + point.x * frame.width) / frame.pixelsPerUnit * scale,
    y: -(frame.top + point.y * frame.height) / frame.pixelsPerUnit * scale,
  }
}

export function resolveModelColliderTransform(authored: boolean, legacy: ModelColliderTransform): ModelColliderTransform {
  return authored ? IDENTITY_MODEL_COLLIDER_TRANSFORM : legacy
}

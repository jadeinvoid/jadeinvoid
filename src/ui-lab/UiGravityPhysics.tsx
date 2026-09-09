import { useMemo } from 'react'
import type { SandboxValues } from '../config/controls'
import type { SiteRuntimeConfig } from '../site/runtimeConfig'
import type { ColliderProfiles, HitboxProfiles } from '../colliders/profiles'
import { gravityHatParts, HatGravityCanvas, type GravityHatItem } from '../components/HatStackStage'
import { getUiCategory, type UiCategoryId } from './categories'

interface UiGravityPhysicsProps {
  values: SiteRuntimeConfig
  colliders: ColliderProfiles
  hitboxes: HitboxProfiles
  replayKey: number
  frozen: boolean
  interactionReady: boolean
  hoveredId: string | null
  onActivate: (id: string) => void
  onHoverChange: (id: string, hovered: boolean, anchorY?: number) => void
  onSettledChange: (id: string, settled: boolean) => void
  categoryIds: UiCategoryId[]
  isolateHovered: boolean
  characterWidthRatio: number
  headYOffset: number
  capColliderOffsetY?: number
  cameraZoomReferenceWidth?: number
  spawnYOffset?: number
  lockHorizontalPosition: boolean
  capLocksRotation: boolean
}

export function UiGravityPhysics({ values, colliders, hitboxes, replayKey, frozen, interactionReady, hoveredId, onActivate, onHoverChange, onSettledChange, categoryIds, isolateHovered, characterWidthRatio, headYOffset, capColliderOffsetY = 0, cameraZoomReferenceWidth, spawnYOffset = 0, lockHorizontalPosition, capLocksRotation }: UiGravityPhysicsProps) {
  const gravityItems = useMemo<GravityHatItem[]>(
    () => categoryIds.map(getUiCategory).map((category) => ({
      id: category.id,
      part: gravityHatParts[category.collider],
    })),
    [categoryIds],
  )
  return (
    <HatGravityCanvas
      items={gravityItems}
      values={values as SandboxValues}
      colliders={colliders}
      hitboxes={hitboxes}
      reduced={false}
      replayKey={replayKey}
      active
      frozen={frozen}
      hoveredId={hoveredId}
      isolateHovered={isolateHovered}
      className="ui-gravity-hats"
      headPosition={[values.hatLab.landingOffsetX, -1.3 + values.hatLab.landingOffsetY + headYOffset, 0]}
      headRadiusScale={0.82 * values.transform.scale * characterWidthRatio}
      capColliderOffsetY={capColliderOffsetY}
      cameraZoomReferenceWidth={cameraZoomReferenceWidth}
      spawnYOffset={spawnYOffset}
      lockHorizontalPosition={lockHorizontalPosition}
      capLocksRotation={capLocksRotation}
      showHitboxOutlines={false}
      onActivate={interactionReady ? onActivate : undefined}
      onHoverChange={interactionReady ? onHoverChange : undefined}
      onSettledChange={onSettledChange}
    />
  )
}

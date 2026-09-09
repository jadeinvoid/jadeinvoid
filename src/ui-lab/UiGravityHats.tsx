import { lazy, memo, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import type { SiteRuntimeConfig } from '../site/runtimeConfig'
import { getColliderProfile, type ColliderProfiles, type HitboxProfiles } from '../colliders/profiles'
import { getOrderedUiCategories, getUiCategory, type UiCategoryId } from './categories'
import { UiCap } from './UiCap'
import { areAllHatsSettled } from '../physics/hatSimulation'
import type { TimelinePreviewMap } from '../timeline/types'
import { getStageCenterYPercent } from './hatTitlePosition'

const UiGravityPhysics = lazy(() => import('./UiGravityPhysics').then((module) => ({ default: module.UiGravityPhysics })))
const WORK_CHARACTER_WIDTH_RATIO = 27 / 31
const WORK_HEAD_Y_OFFSET = -20 / 65
const DEFAULT_TITLE_Y = 26

/* ─────────────────────────────────────────────────────────
 * UI LAB FIXED TITLE STORYBOARD
 *
 *    0ms   frozen hat is hovered; title captures that hat's vertical center
 *  140ms   title fades in at the fixed x-axis and captured y-axis position
 *    0ms   pointer leaves; title fades without following the cursor or hat
 * ───────────────────────────────────────────────────────── */
function FixedHatTitle({ hoveredId, anchorY, visible }: { hoveredId: string | null; anchorY: number | null; visible: boolean }) {
  return (
    <div className="ui-gravity-title" data-visible={visible} aria-hidden="true" style={{ top: `${anchorY ?? DEFAULT_TITLE_Y}%` }}>
      {hoveredId ? getUiCategory(hoveredId as UiCategoryId).label : ''}
    </div>
  )
}

interface UiGravityHatsProps {
  values: SiteRuntimeConfig
  colliders: ColliderProfiles
  hitboxes: HitboxProfiles
  reduced: boolean
  replayKey: number
  onPreview: (category: UiCategoryId) => void
  onHoverPresenceChange: (present: boolean) => void
  onHoverCategoryChange?: (category: UiCategoryId | null) => void
  onActivate: (category: UiCategoryId) => void
  timelinePreview?: TimelinePreviewMap
  selectedCategory?: UiCategoryId
  selectedCharacterWidthRatio?: number
  selectedHeadYOffset?: number
  capColliderOffsetY?: number
  cameraZoomReferenceWidth?: number
  spawnYOffset?: number
  isolateHovered?: boolean
}

function UiGravityHatsComponent({ values, colliders, hitboxes, reduced, replayKey, onPreview, onHoverPresenceChange, onHoverCategoryChange, onActivate, timelinePreview = {}, selectedCategory, selectedCharacterWidthRatio = WORK_CHARACTER_WIDTH_RATIO, selectedHeadYOffset = WORK_HEAD_Y_OFFSET, capColliderOffsetY, cameraZoomReferenceWidth, spawnYOffset, isolateHovered = false }: UiGravityHatsProps) {
  const [settled, setSettled] = useState<Set<string>>(() => new Set())
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [titleY, setTitleY] = useState<number | null>(null)
  const [interactionReady, setInteractionReady] = useState(reduced)
  const hoveredIdRef = useRef<string | null>(null)
  const hoverIntent = useRef<number | undefined>(undefined)
  const categories = useMemo(() => selectedCategory
    ? [getUiCategory(selectedCategory)]
    : getOrderedUiCategories(values.hatLab.dropOrder).slice(0, values.hatLab.stackCount), [selectedCategory, values.hatLab.dropOrder, values.hatLab.stackCount])
  const categoryIds = useMemo(() => categories.map((category) => category.id), [categories])
  const frozen = reduced || areAllHatsSettled(categories.map((category) => category.id), settled)

  useEffect(() => {
    setInteractionReady(false)
    if (!frozen) return
    const timer = window.setTimeout(() => setInteractionReady(true), reduced ? 0 : 150)
    return () => window.clearTimeout(timer)
  }, [frozen, reduced, replayKey, values.hatLab.dropOrder, values.hatLab.stackCount])

  useEffect(() => {
    window.clearTimeout(hoverIntent.current)
    setSettled(new Set())
    setHoveredId(null)
    setTitleY(null)
    hoveredIdRef.current = null
    onHoverPresenceChange(false)
  }, [replayKey, selectedCategory, values.hatLab.dropOrder, values.hatLab.stackCount, values.hatLab.landingOffsetX, values.hatLab.landingOffsetY, colliders])

  useEffect(() => () => window.clearTimeout(hoverIntent.current), [])

  const hoverHat = (id: string | null, immediate = false, anchorY?: number) => {
    if (id && anchorY !== undefined) setTitleY(anchorY)
    if (hoveredIdRef.current === id) {
      if (immediate && id && (reduced || settled.has(id))) onPreview(id as UiCategoryId)
      return
    }
    window.clearTimeout(hoverIntent.current)
    hoverIntent.current = undefined
    hoveredIdRef.current = id
    setHoveredId(id)
    onHoverPresenceChange(id !== null)
    if (!id || (!reduced && !settled.has(id))) return
    if (immediate) onPreview(id as UiCategoryId)
    else hoverIntent.current = window.setTimeout(() => onPreview(id as UiCategoryId), 60)
  }
  const changeHoveredHat = (id: string, hovered: boolean, anchorY?: number) => {
    if (hovered) {
      onHoverCategoryChange?.(id as UiCategoryId)
      hoverHat(id, true, anchorY)
    } else if (hoveredIdRef.current === id) {
      onHoverCategoryChange?.(null)
      hoverHat(null)
    }
  }

  const activate = (id: string) => {
    if (reduced || settled.has(id)) onActivate(id as UiCategoryId)
  }

  if (reduced) {
    return (
      <>
        <div className="ui-gravity-static" aria-label="Category hats" data-frozen="true">
          {categories.map((category) => {
            const clipPreview = timelinePreview[`hat:${category.id}`]
            const clipVisual = clipPreview?.hasClips ? clipPreview.state : null
            const highlighted = hoveredId === category.id
            const dimmed = isolateHovered && hoveredId !== null && !highlighted
            return <button
              type="button"
              key={category.id}
              className={`ui-gravity-static-${category.id}${highlighted ? ' active' : ''}`}
              onPointerEnter={(event) => {
                onHoverCategoryChange?.(category.id)
                hoverHat(category.id, false, getStageCenterYPercent(event.currentTarget))
              }}
              onPointerLeave={() => {
                onHoverCategoryChange?.(null)
                hoverHat(null)
              }}
              onFocus={(event) => hoverHat(category.id, true, getStageCenterYPercent(event.currentTarget))}
              onBlur={() => hoverHat(null)}
              onClick={() => activate(category.id)}
              aria-label={category.label}
              style={{
                translate: clipVisual ? `${clipVisual.x}px ${clipVisual.y}px` : undefined,
                scale: clipVisual?.scale ?? 1,
                rotate: highlighted ? '0deg' : clipVisual ? `${clipVisual.rotateZ}deg` : undefined,
                opacity: (clipVisual?.opacity ?? 1) * (dimmed ? 0 : 1),
                filter: clipVisual ? `blur(${clipVisual.blur}px)` : undefined,
              }}
            >
              {category.hat.kind === 'model' ? <UiCap /> : <img src={category.hat.src} alt="" />}
              <svg className="ui-gravity-static-hitbox" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true">
                <polygon points={getColliderProfile(category.collider, hitboxes)!.outline.map(({ x, y }) => `${x * 1000},${y * 1000}`).join(' ')} />
              </svg>
            </button>
          })}
        </div>
        <FixedHatTitle hoveredId={hoveredId} anchorY={titleY} visible={hoveredId !== null} />
      </>
    )
  }

  return (
    <>
      <Suspense fallback={<div className="ui-gravity-hats" data-render-ready="false" aria-hidden="true" />}>
        <UiGravityPhysics
          values={values}
          colliders={colliders}
          hitboxes={hitboxes}
          replayKey={replayKey}
          frozen={frozen}
          interactionReady={interactionReady}
          hoveredId={hoveredId}
          isolateHovered={isolateHovered}
          characterWidthRatio={selectedCategory ? selectedCharacterWidthRatio : 1}
          headYOffset={selectedCategory ? selectedHeadYOffset : 0}
          capColliderOffsetY={capColliderOffsetY}
          cameraZoomReferenceWidth={cameraZoomReferenceWidth}
          spawnYOffset={spawnYOffset}
          lockHorizontalPosition={selectedCategory !== undefined}
          capLocksRotation={isolateHovered || selectedCategory !== undefined}
          onActivate={activate}
          onHoverChange={changeHoveredHat}
          onSettledChange={(id, isSettled) => {
            setSettled((current) => {
              const next = new Set(current)
              if (isSettled) next.add(id)
              else next.delete(id)
              return next
            })
          }}
          categoryIds={categoryIds}
        />
      </Suspense>
      <div
        className="ui-gravity-keyboard"
        aria-label="Settled category hats"
        data-frozen={frozen}
        data-interaction-ready={interactionReady}
        data-hovered-id={hoveredId ?? ''}
        data-settled-ids={[...settled].sort().join(',')}
      >
        {categories.map((category) => (
          <button
            type="button"
            key={category.id}
            disabled={!interactionReady}
            onFocus={() => hoverHat(category.id, true)}
            onBlur={() => hoverHat(null)}
            onClick={() => activate(category.id)}
          >
            {interactionReady ? category.label : `${category.label} falling`}
          </button>
        ))}
      </div>
      <FixedHatTitle hoveredId={hoveredId} anchorY={titleY} visible={interactionReady && hoveredId !== null} />
    </>
  )
}

const MemoizedUiGravityHats = memo(UiGravityHatsComponent)

export function UiGravityHats(props: UiGravityHatsProps) {
  return <MemoizedUiGravityHats {...props} />
}

import { useEffect, useRef, useState, type KeyboardEvent, type RefObject } from 'react'
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useSpring,
  type MotionValue,
  type Transition,
} from 'motion/react'
import type { SiteRuntimeConfig } from '../site/runtimeConfig'
import { getCharacterPart } from '../config/characterAssets'
import type { CharacterPartDefinition, CharacterSlot } from '../types'
import type { UiScreen } from './categories'
import type { AssetTimelinePreview, TimelinePreviewMap } from '../timeline/types'
import type { ColliderProfile } from '../colliders/profiles'
import { HAND_WAVE, useHandWaveStage } from '../animation/handWave'
import { useCharacterPartFrame } from '../animation/portraitFrames'

/* ─────────────────────────────────────────────────────────
 * UI LAB CHARACTER INTERACTION
 *
 * pointer move   eyes follow using Character cursor settings
 * pointer down   cursor hand swaps to its pressed artwork
 * idle           enabled layers reuse Character float motion
 * portrait       remains still while interactive layers animate
 * timed          eyes reuse Character blink interval + duration
 * 0–5000ms       hand waves, then fades out over 500ms
 * ───────────────────────────────────────────────────────── */

const CHARACTER_POSITIONS: Record<UiScreen | 'previewLanding', { left: string; top: string; width: string }> = {
  landing: { left: '5%', top: '39%', width: '31%' },
  preview: { left: '6%', top: '58%', width: '24%' },
  work: { left: '2%', top: '55%', width: '27%' },
  previewLanding: { left: '5%', top: '39%', width: '31%' },
}

const IDLE_TRANSITION: Transition = { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }

export interface UiCharacterPosition {
  left: string
  top: string
  width: string
  x?: number
}

interface UiLabCharacterProps {
  screen: UiScreen
  transition: Transition
  values: SiteRuntimeConfig
  reduced: boolean
  replayKey: number
  keepLandingPose?: boolean
  positionOverride?: UiCharacterPosition
  timelinePreview: TimelinePreviewMap
  timelineIsPlaying: boolean
  hitbox: ColliderProfile
  showHitbox: boolean
  speechBubbleOpen: boolean
  onSpeechBubbleToggle: () => void
  cursorFollowEnabled?: boolean
  forceTimedHandWave?: boolean
}

interface UiCharacterLayerProps {
  slot: CharacterSlot
  part: CharacterPartDefinition
  config: SiteRuntimeConfig['characterLayers'][CharacterSlot]
  reduced: boolean
  followX: MotionValue<number>
  followY: MotionValue<number>
  timelinePreview?: AssetTimelinePreview
  headAnchorRef?: RefObject<HTMLSpanElement | null>
  handWaveStage: number
  handWaveEnabled: boolean
  hitbox?: ColliderProfile
  showHitbox?: boolean
  onHitboxPointerDown?: () => void
  onHitboxPointerUp?: () => void
  onHitboxActivate?: () => void
}

function UiCharacterLayer({ slot, part, config, reduced, followX, followY, timelinePreview, headAnchorRef, handWaveStage, handWaveEnabled, hitbox, showHitbox = false, onHitboxPointerDown, onHitboxPointerUp, onHitboxActivate }: UiCharacterLayerProps) {
  const frameSrc = useCharacterPartFrame(part.src, part.frames)
  if (!config.visible) return null
  const clipDriven = Boolean(timelinePreview?.hasClips)
  const wavingHand = slot === 'hand' && handWaveEnabled
  const timelineDrivenHand = slot === 'hand' && clipDriven
  const layerMotionEnabled = slot !== 'portrait' && config.motionEnabled
  const visual = clipDriven ? timelinePreview!.state : {
    x: part.defaultTransform.x + config.x,
    y: part.defaultTransform.y + config.y,
    scale: part.defaultTransform.scale * config.scale,
    rotateZ: part.defaultTransform.rotate + config.rotate,
    opacity: part.defaultTransform.opacity * config.opacity,
  }
  const left = `${50 + visual.x / 4}%`
  const top = `${50 + visual.y / 4}%`

  return (
    <motion.div
      className="ui-character-layer"
      data-slot={slot}
      animate={{ left, top }}
      transition={reduced || clipDriven ? { duration: 0 } : { type: 'spring', stiffness: 520, damping: 42 }}
      style={{
        width: `${part.width / 4}%`,
        height: `${part.height / 4}%`,
        scale: visual.scale,
        rotate: visual.rotateZ,
        opacity: visual.opacity,
        zIndex: config.zIndex,
        transformOrigin: timelineDrivenHand ? HAND_WAVE.transformOrigin : undefined,
        visibility: wavingHand && handWaveStage >= 2 ? 'hidden' : 'visible',
        pointerEvents: 'none',
      }}
    >
      {headAnchorRef && <span ref={headAnchorRef} className="ui-character-head-anchor" aria-hidden="true" />}
      <motion.div
        className="ui-character-layer-motion"
        animate={wavingHand
          ? handWaveStage >= 1
            ? { y: 0, rotate: 0, opacity: 0 }
            : { y: 0, rotate: HAND_WAVE.rotations, opacity: 1 }
          : reduced || clipDriven || !layerMotionEnabled || config.idleAmount === 0
          ? { y: 0, rotate: 0 }
          : {
              y: [0, -config.idleAmount, 0],
              rotate: slot === 'hat' ? [-1.5, 1.5, -1.5] : 0,
            }}
        transition={wavingHand
          ? handWaveStage >= 1
            ? { duration: HAND_WAVE.fadeDuration, ease: HAND_WAVE.fadeEase }
            : { duration: HAND_WAVE.cycleDuration, repeat: Infinity, ease: HAND_WAVE.waveEase }
          : reduced || clipDriven || !layerMotionEnabled ? { duration: 0 } : IDLE_TRANSITION}
        whileHover={reduced || clipDriven || !layerMotionEnabled ? undefined : { y: config.hoverY, scale: config.hoverScale }}
        whileTap={reduced || clipDriven || !layerMotionEnabled ? undefined : { scale: config.pressScale }}
        style={wavingHand ? { transformOrigin: HAND_WAVE.transformOrigin } : undefined}
      >
        <motion.img src={frameSrc} alt="" draggable={false} style={{ x: followX, y: followY }} />
        {hitbox && (
          <svg
            className={`ui-character-hitbox${showHitbox ? ' visible' : ''}`}
            viewBox="0 0 1000 1000"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <polygon
              points={hitbox.outline.map(({ x, y }) => `${x * 1000},${y * 1000}`).join(' ')}
              onPointerDown={onHitboxPointerDown}
              onPointerUp={onHitboxPointerUp}
              onClick={onHitboxActivate}
            />
          </svg>
        )}
      </motion.div>
    </motion.div>
  )
}

export function UiLabCharacter({ screen, transition, values, reduced, replayKey, keepLandingPose = false, positionOverride, timelinePreview, timelineIsPlaying, hitbox, showHitbox, speechBubbleOpen, onSpeechBubbleToggle, cursorFollowEnabled = true, forceTimedHandWave = false }: UiLabCharacterProps) {
  const [blinking, setBlinking] = useState(false)
  const [handPressed, setHandPressed] = useState(false)
  const characterRef = useRef<HTMLDivElement>(null)
  const liveHeadRef = useRef<HTMLSpanElement>(null)
  const lastHeadOffset = useRef({ x: Number.NaN, y: Number.NaN })
  const lastGravityOffset = useRef({ hats: Number.NaN, static: Number.NaN })
  const rawFollowX = useMotionValue(0)
  const rawFollowY = useMotionValue(0)
  const followX = useSpring(rawFollowX, { stiffness: 240, damping: 26, mass: 0.45 })
  const followY = useSpring(rawFollowY, { stiffness: 240, damping: 26, mass: 0.45 })
  const stillX = useMotionValue(0)
  const stillY = useMotionValue(0)
  const handWaveEnabled = values.character.hand !== 'none'
    && values.characterLayers.hand.visible
    && (forceTimedHandWave || !timelinePreview[values.character.hand]?.hasClips)
  const handWaveStage = useHandWaveStage(handWaveEnabled)

  useAnimationFrame(() => {
    const stage = characterRef.current?.closest<HTMLElement>('.ui-lab-stage')
    const liveHead = liveHeadRef.current?.getBoundingClientRect()
    const portraitHitbox = characterRef.current?.querySelector<SVGPolygonElement>('.ui-character-hitbox polygon')?.getBoundingClientRect()
    if (!stage || !liveHead || !portraitHitbox) return
    const stageBounds = stage.getBoundingClientRect()
    const landing = CHARACTER_POSITIONS.landing
    const landingLeft = Number.parseFloat(landing.left) / 100
    const landingTop = Number.parseFloat(landing.top) / 100
    const landingWidth = Number.parseFloat(landing.width) / 100
    const restingHeadX = stageBounds.left + stageBounds.width * (landingLeft + landingWidth * 0.5)
    const restingHeadY = stageBounds.top + stageBounds.height * landingTop + stageBounds.width * landingWidth * 0.25
    const x = liveHead.left - restingHeadX
    const y = liveHead.top - restingHeadY
    if (Math.abs(x - lastHeadOffset.current.x) >= 0.01 || Math.abs(y - lastHeadOffset.current.y) >= 0.01) {
      lastHeadOffset.current = { x, y }
      stage.style.setProperty('--ui-character-head-x', `${x}px`)
      stage.style.setProperty('--ui-character-head-y', `${y}px`)
    }

    const hitboxCenterX = portraitHitbox.left + portraitHitbox.width / 2
    const syncGravityCenter = (selector: string, property: '--ui-gravity-align-x' | '--ui-gravity-static-align-x', key: 'hats' | 'static') => {
      const layer = stage.querySelector<HTMLElement>(selector)
      if (!layer) return
      const baseCenterX = stageBounds.left + layer.offsetLeft + layer.offsetWidth / 2
      const offset = hitboxCenterX - baseCenterX
      if (Math.abs(offset - lastGravityOffset.current[key]) < 0.01) return
      lastGravityOffset.current[key] = offset
      stage.style.setProperty(property, `${offset}px`)
    }
    syncGravityCenter('.ui-gravity-hats', '--ui-gravity-align-x', 'hats')
    syncGravityCenter('.ui-gravity-static', '--ui-gravity-static-align-x', 'static')
  })

  useEffect(() => {
    const stage = characterRef.current?.closest<HTMLElement>('.ui-lab-stage')
    return () => {
      stage?.style.removeProperty('--ui-character-head-x')
      stage?.style.removeProperty('--ui-character-head-y')
      stage?.style.removeProperty('--ui-gravity-align-x')
      stage?.style.removeProperty('--ui-gravity-static-align-x')
    }
  }, [])

  useEffect(() => {
    if (!values.character.blink || reduced) {
      setBlinking(false)
      return
    }
    let startTimer: number | undefined
    let closeTimer: number | undefined
    const scheduleBlink = () => {
      startTimer = window.setTimeout(() => {
        setBlinking(true)
        closeTimer = window.setTimeout(() => {
          setBlinking(false)
          scheduleBlink()
        }, values.character.blinkDuration * 1000)
      }, values.character.blinkInterval * 1000)
    }
    scheduleBlink()
    return () => {
      if (startTimer) window.clearTimeout(startTimer)
      if (closeTimer) window.clearTimeout(closeTimer)
    }
  }, [reduced, values.character.blink, values.character.blinkDuration, values.character.blinkInterval])

  useEffect(() => {
    const resetFollow = () => {
      rawFollowX.set(0)
      rawFollowY.set(0)
    }
    if (!cursorFollowEnabled || !values.character.cursorFollow || reduced || timelineIsPlaying) {
      resetFollow()
      return
    }

    const handlePointerMove = (event: PointerEvent) => {
      const bounds = characterRef.current?.getBoundingClientRect()
      if (!bounds?.width || !bounds.height) return
      const normalizedX = Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / bounds.width - 0.5) * 2))
      const normalizedY = Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / bounds.height - 0.5) * 2))
      rawFollowX.set(normalizedX * values.character.cursorFollowAmount)
      rawFollowY.set(normalizedY * values.character.cursorFollowAmount)
    }
    const handlePointerOut = (event: PointerEvent) => {
      if (!event.relatedTarget) resetFollow()
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerout', handlePointerOut)
    window.addEventListener('pointercancel', resetFollow)
    window.addEventListener('blur', resetFollow)
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerout', handlePointerOut)
      window.removeEventListener('pointercancel', resetFollow)
      window.removeEventListener('blur', resetFollow)
    }
  }, [cursorFollowEnabled, rawFollowX, rawFollowY, reduced, timelineIsPlaying, values.character.cursorFollow, values.character.cursorFollowAmount])

  useEffect(() => {
    const releaseHand = () => setHandPressed(false)
    window.addEventListener('pointerup', releaseHand)
    window.addEventListener('pointercancel', releaseHand)
    window.addEventListener('blur', releaseHand)
    return () => {
      window.removeEventListener('pointerup', releaseHand)
      window.removeEventListener('pointercancel', releaseHand)
      window.removeEventListener('blur', releaseHand)
    }
  }, [])

  const pairedEyeId = blinking ? 'eyes-closed' : values.character.eyes
  const leftEyeId = blinking ? 'eye-closed-left' : values.character.leftEye
  const rightEyeId = blinking ? 'eye-closed-right' : values.character.rightEye
  const handId = handPressed && values.character.hand === 'hand-cursor'
    ? 'hand-cursor-click'
    : values.character.hand
  const layers: Array<{ slot: CharacterSlot; id: string; timelineId: string; followsCursor?: boolean }> = [
    { slot: 'portrait', id: values.character.portrait, timelineId: values.character.portrait },
    ...(values.character.eyeMode === 'paired'
      ? [{ slot: 'eyes' as const, id: pairedEyeId, timelineId: values.character.eyes, followsCursor: true }]
      : [
          { slot: 'leftEye' as const, id: leftEyeId, timelineId: values.character.leftEye, followsCursor: true },
          { slot: 'rightEye' as const, id: rightEyeId, timelineId: values.character.rightEye, followsCursor: true },
        ]),
    ...(handId === 'none' ? [] : [{ slot: 'hand' as const, id: handId, timelineId: values.character.hand }]),
    ...(values.character.hat === 'none' ? [] : [{ slot: 'hat' as const, id: values.character.hat, timelineId: values.character.hat }]),
  ]
  const position = positionOverride ?? (keepLandingPose ? CHARACTER_POSITIONS.previewLanding : CHARACTER_POSITIONS[screen])
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.repeat || (event.key !== 'Enter' && event.key !== ' ')) return
    event.preventDefault()
    onSpeechBubbleToggle()
  }

  return (
    <motion.div
      ref={characterRef}
      className="ui-character"
      animate={position}
      transition={transition}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      data-cursor-passive="true"
      aria-expanded={speechBubbleOpen}
      aria-label="Interactive character preview"
    >
      <motion.div
        className="ui-character-composition-scale"
        animate={{ scale: values.transform.scale }}
        transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 38 }}
      >
        <div className="ui-character-composition">
          {layers.map(({ slot, id, timelineId, followsCursor }) => {
            const part = getCharacterPart(id)
            if (!part) return null
            const follows = Boolean(cursorFollowEnabled && followsCursor && values.characterLayers[slot].motionEnabled)
            return (
              <UiCharacterLayer
                key={slot}
                slot={slot}
                part={part}
                config={values.characterLayers[slot]}
                reduced={reduced}
                followX={follows ? followX : stillX}
                followY={follows ? followY : stillY}
                timelinePreview={timelinePreview[timelineId]}
                headAnchorRef={slot === 'portrait' ? liveHeadRef : undefined}
                handWaveStage={handWaveStage}
                handWaveEnabled={handWaveEnabled}
                hitbox={slot === 'portrait' ? hitbox : undefined}
                showHitbox={slot === 'portrait' && showHitbox}
                onHitboxPointerDown={slot === 'portrait' ? () => { if (!timelineIsPlaying) setHandPressed(true) } : undefined}
                onHitboxPointerUp={slot === 'portrait' ? () => setHandPressed(false) : undefined}
                onHitboxActivate={slot === 'portrait' ? onSpeechBubbleToggle : undefined}
              />
            )
          })}
        </div>
      </motion.div>
    </motion.div>
  )
}

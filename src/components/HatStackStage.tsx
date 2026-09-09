import { Component, Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState, type ErrorInfo, type ReactNode, type RefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Html, Line, useGLTF, useTexture } from '@react-three/drei'
import { BallCollider, ConvexHullCollider, CuboidCollider, MeshCollider, Physics, RigidBody, useBeforePhysicsStep, type RapierRigidBody } from '@react-three/rapier'
import earcut from 'earcut'
import { Box3, DoubleSide, Group, MathUtils, Mesh, MeshBasicMaterial, Quaternion, SRGBColorSpace, Vector3, type Material, type OrthographicCamera, type Texture } from 'three'
import { characterParts } from '../config/characterAssets'
import { assets } from '../config/assets'
import type { SandboxValues } from '../config/controls'
import { getColliderProfile, resolveColliderProfileKey, type ColliderProfile, type ColliderProfiles, type HitboxProfiles } from '../colliders/profiles'
import { loadHatCollider, type HatColliderProfile, type Point } from '../physics/hatCollider'
import { advanceHatDrop, advanceHatSettle, getHatVisualLayer, HAT_FIXED_TIME_STEP, HAT_SETTLE_STEPS } from '../physics/hatSimulation'
import type { CharacterPartDefinition } from '../types'
import { moveHatInOrder, parseHatOrder, type HatCategoryId } from '../config/hatLayout'
import { getStageCenterYPercent } from '../ui-lab/hatTitlePosition'
import { getModelColliderPresentation, normalizedColliderPointToWorld, resolveModelColliderTransform } from '../physics/modelColliderPresentation'

interface HatStackStageProps {
  values: SandboxValues
  colliders: ColliderProfiles
  reduced: boolean
  dropKey: number
  resetKey: number
  active: boolean
  onOrderChange: (order: string) => void
  onLandingOffsetChange: (x: number, y: number) => void
}

export interface GravityHatItem {
  id: string
  part: CharacterPartDefinition
}

interface HatGravityCanvasProps {
  items: GravityHatItem[]
  values: SandboxValues
  colliders: ColliderProfiles
  hitboxes?: HitboxProfiles
  reduced: boolean
  replayKey: number
  active: boolean
  className: string
  showPortrait?: boolean
  headPosition?: [number, number, number]
  headRadiusScale?: number
  maxCount?: number
  frozen?: boolean
  hoveredId?: string | null
  isolateHovered?: boolean
  capColliderOffsetY?: number
  capLocksRotation?: boolean
  cameraZoomReferenceWidth?: number
  spawnYOffset?: number
  lockHorizontalPosition?: boolean
  showHitboxOutlines?: boolean
  onActivate?: (id: string) => void
  onHoverChange?: (id: string, hovered: boolean, anchorY?: number) => void
  onSettledChange?: (id: string, settled: boolean) => void
}

const capAsset = assets.find((asset) => asset.id === 'hat-cap-3d')!
const stackCap: CharacterPartDefinition = {
  id: capAsset.id,
  name: capAsset.name,
  slot: 'hat',
  src: capAsset.src,
  width: 156,
  height: 112,
  defaultTransform: { x: 0, y: 0, scale: 1, rotate: 0, opacity: 1, zIndex: 6 },
}
const stackHatIds = ['hat-paperboat-2d', 'hat-beret-2', 'hat-magician']
const stackHats = [...stackHatIds.map((id) => characterParts.find((part) => part.id === id)!), stackCap]
export const gravityHatParts = {
  'paper-boat': stackHats[0],
  beret: stackHats[1],
  magician: stackHats[2],
  cap: stackHats[3],
} as const
const gravityHatPartsByCategory: Record<HatCategoryId, CharacterPartDefinition> = {
  ux: gravityHatParts['paper-boat'],
  illustration: gravityHatParts.beret,
  visual: gravityHatParts.cap,
  other: gravityHatParts.magician,
}
const gravityHatLabels: Record<HatCategoryId, string> = {
  ux: 'Paper Boat',
  illustration: 'Beret',
  visual: 'Cap',
  other: 'Magician',
}
const stackTextureSources = stackHats
  .filter((part) => !part.src.endsWith('.glb'))
  .map((part) => part.src)
const headPortraitSrc = '/character/portrait/no-eyes/portrait1.png'
// useLoader caches by the entire URL list. Preloading a batch does not warm
// single-URL useTexture calls: a later hat would suspend the visible world.
const stackSceneTextureSources = [...stackTextureSources, headPortraitSrc]
const HAT_LAB_PORTRAIT_POSITION: [number, number, number] = [0, -3.05, -0.5]

/* ─────────────────────────────────────────────────────────
 * UI LAB HAT HOVER STORYBOARD
 *
 *    0ms   hat rises without changing size
 * ongoing  hat floats vertically and wobbles around its upright pose
 *    0ms   pointer leaves; hat eases back into the settled stack
 * ───────────────────────────────────────────────────────── */
const UI_HAT_HOVER = {
  lift: 0.11,
  floatDistance: 0.045,
  floatFrequency: 2.4,
  wobbleAngle: MathUtils.degToRad(2.25),
  wobbleFrequency: 1.8,
  capFacingWobble: 0.035,
  response: 14,
} as const
const PIXELS_PER_UNIT = 78
const DEPTH = 0.16
const BASE_CAMERA_ZOOM = 65

useGLTF.preload(stackCap.src)
useTexture.preload(stackSceneTextureSources)

function configureStackTextureColors(textures: Texture[]) {
  // Drei uploads the whole batch before later hats mount. Tag these PNG colour
  // maps before that upload; Fiber's automatic map conversion would be too late.
  for (const texture of textures) {
    if (texture.colorSpace === SRGBColorSpace) continue
    texture.colorSpace = SRGBColorSpace
    texture.needsUpdate = true
  }
}

function useStackSceneTexture(source: string) {
  const textures = useTexture(stackSceneTextureSources, configureStackTextureColors)
  return textures[stackSceneTextureSources.indexOf(source)]
}

function useDocumentVisible() {
  const [visible, setVisible] = useState(() => typeof document === 'undefined' || !document.hidden)
  useEffect(() => {
    const updateVisibility = () => setVisible(!document.hidden)
    document.addEventListener('visibilitychange', updateVisibility)
    return () => document.removeEventListener('visibilitychange', updateVisibility)
  }, [])
  return visible
}

function ResetClockOnResume({ running }: { running: boolean }) {
  const clock = useThree((state) => state.clock)
  useLayoutEffect(() => {
    if (running) clock.start()
  }, [clock, running])
  return null
}

function ResponsiveCameraZoom({ referenceWidth }: { referenceWidth: number }) {
  const camera = useThree((state) => state.camera) as OrthographicCamera
  const canvasWidth = useThree((state) => state.size.width)
  useLayoutEffect(() => {
    camera.zoom = BASE_CAMERA_ZOOM * canvasWidth / referenceWidth
    camera.updateProjectionMatrix()
  }, [camera, canvasWidth, referenceWidth])
  return null
}

function applyStackAssist(rigidBody: RapierRigidBody | null, amount: number, targetX: number) {
  if (!rigidBody || rigidBody.isSleeping() || amount === 0) return
  const position = rigidBody.translation()
  const velocity = rigidBody.linvel()
  const distance = position.x - targetX
  if (Math.abs(distance) <= 0.02 && Math.abs(velocity.x) <= 0.02) return
  const stepRatio = HAT_FIXED_TIME_STEP * 60
  rigidBody.setLinvel({
    x: velocity.x * Math.pow(0.92, stepRatio) - distance * amount * 0.035 * stepRatio,
    y: velocity.y,
    z: 0,
  }, true)
}

function useHatSettled(body: React.RefObject<RapierRigidBody | null>, itemId: string, onSettledChange?: (id: string, settled: boolean) => void) {
  const [settled, setSettled] = useState(false)
  const stableSteps = useRef(0)
  const settledRef = useRef(false)
  useBeforePhysicsStep(() => {
    if (!body.current) return
    const linear = body.current.linvel()
    const angular = body.current.angvel()
    stableSteps.current = advanceHatSettle(
      stableSteps.current,
      linear.x ** 2 + linear.y ** 2 + linear.z ** 2,
      angular.x ** 2 + angular.y ** 2 + angular.z ** 2,
    )
    const nextSettled = stableSteps.current === HAT_SETTLE_STEPS
    if (nextSettled === settledRef.current) return
    settledRef.current = nextSettled
    setSettled(nextSettled)
    onSettledChange?.(itemId, nextSettled)
  })
  return settled
}

function applyOverride(profile: HatColliderProfile, override: ColliderProfile | null): HatColliderProfile {
  if (!override) return profile
  const vertices = override.outline.map(({ x, y }) => ({
    x: profile.imageLeft + x * profile.imageWidth,
    y: profile.imageTop + y * profile.imageHeight,
  }))
  return { ...profile, vertices, vertexSets: [vertices], colliderSource: 'authored' }
}

function worldOutline(profile: HatColliderProfile): Point[] {
  return profile.vertices.map(({ x, y }) => ({ x: x / PIXELS_PER_UNIT, y: -y / PIXELS_PER_UNIT }))
}

function worldVertexSet(vertices: Point[], scale: number): Point[] {
  return vertices.map(({ x, y }) => ({ x: x / PIXELS_PER_UNIT * scale, y: -y / PIXELS_PER_UNIT * scale }))
}

function worldHitboxOutline(profile: HatColliderProfile, hitbox: ColliderProfile, scale: number): Point[] {
  return hitbox.outline.map(({ x, y }) => ({
    x: (profile.imageLeft + x * profile.imageWidth) / PIXELS_PER_UNIT * scale,
    y: -(profile.imageTop + y * profile.imageHeight) / PIXELS_PER_UNIT * scale,
  }))
}

function trianglePrisms(outline: Point[]) {
  const indices = earcut(outline.flatMap(({ x, y }) => [x, y]))
  const prisms: Float32Array[] = []
  for (let index = 0; index < indices.length; index += 3) {
    const triangle = [outline[indices[index]], outline[indices[index + 1]], outline[indices[index + 2]]]
    prisms.push(new Float32Array(triangle.flatMap(({ x, y }) => [x, y, -DEPTH, x, y, DEPTH])))
  }
  return prisms
}

function HatHitbox({ profile, hitbox, index, itemId, scale, visible, interactive, onActivate, onHoverChange }: {
  profile: HatColliderProfile
  hitbox: ColliderProfile
  index: number
  itemId: string
  scale: number
  visible: boolean
  interactive: boolean
  onActivate?: () => void
  onHoverChange?: (hovered: boolean, anchorY?: number) => void
}) {
  const outline = useMemo(() => worldHitboxOutline(profile, hitbox, scale), [hitbox, profile, scale])
  const bounds = useMemo(() => {
    const minX = Math.min(...outline.map(({ x }) => x))
    const maxX = Math.max(...outline.map(({ x }) => x))
    const minY = Math.min(...outline.map(({ y }) => y))
    const maxY = Math.max(...outline.map(({ y }) => y))
    const width = Math.max(0.001, maxX - minX)
    const height = Math.max(0.001, maxY - minY)
    return {
      centerX: (minX + maxX) / 2,
      centerY: (minY + maxY) / 2,
      width,
      height,
      clipPath: `polygon(${outline.map(({ x, y }) => `${(x - minX) / width * 100}% ${(maxY - y) / height * 100}%`).join(',')})`,
    }
  }, [outline])
  const anchor = useRef<Group>(null)
  const button = useRef<HTMLButtonElement>(null)
  const worldQuaternion = useMemo(() => new Quaternion(), [])
  const visualLayer = getHatVisualLayer(index)
  useFrame(() => {
    if (!anchor.current || !button.current) return
    anchor.current.getWorldQuaternion(worldQuaternion)
    button.current.style.rotate = `${-2 * Math.atan2(worldQuaternion.z, worldQuaternion.w)}rad`
  })
  return (
    <>
      <group ref={anchor} position={[bounds.centerX, bounds.centerY, visualLayer.z + 0.01]}>
        <Html
          center
          distanceFactor={1}
          zIndexRange={[100 + index, 100 + index]}
          wrapperClass="ui-gravity-dom-root"
          style={{ pointerEvents: 'none' }}
        >
          <button
            ref={button}
            type="button"
            className="ui-gravity-dom-hitbox"
            tabIndex={-1}
            aria-label={`Preview ${itemId}`}
            aria-hidden={!interactive}
            style={{
              width: `${bounds.width}px`,
              height: `${bounds.height}px`,
              clipPath: bounds.clipPath,
              pointerEvents: interactive ? 'auto' : 'none',
            }}
            onPointerEnter={(event) => {
              if (!interactive) return
              event.stopPropagation()
              onHoverChange?.(true, getStageCenterYPercent(event.currentTarget))
            }}
            onPointerLeave={(event) => {
              event.stopPropagation()
              if (interactive) onHoverChange?.(false)
            }}
            onClick={(event) => {
              if (!interactive) return
              event.stopPropagation()
              onActivate?.()
            }}
          />
        </Html>
      </group>
      {visible && (
        <Line
          points={[...outline.map(({ x, y }) => [x, y, visualLayer.z + 0.03] as [number, number, number]), [outline[0].x, outline[0].y, visualLayer.z + 0.03]]}
          color="#67e3ff"
          lineWidth={2.5}
          depthTest={false}
          raycast={() => null}
        />
      )}
    </>
  )
}

function HatSprite({ profile, index, scale, showCollider, dimmed, highlighted, body }: {
  profile: HatColliderProfile
  index: number
  scale: number
  showCollider: boolean
  dimmed: boolean
  highlighted: boolean
  body: RefObject<RapierRigidBody | null>
}) {
  const texture = useStackSceneTexture(profile.part.src)
  const material = useRef<MeshBasicMaterial>(null)
  const visual = useRef<Mesh>(null)
  const outline = useMemo(
    () => worldOutline(profile).map(({ x, y }) => ({ x: x * scale, y: y * scale })),
    [profile, scale],
  )
  const prisms = useMemo(() => trianglePrisms(outline), [outline])
  const width = profile.imageWidth / PIXELS_PER_UNIT * scale
  const height = profile.imageHeight / PIXELS_PER_UNIT * scale
  const imageX = (profile.imageLeft + profile.imageWidth / 2) / PIXELS_PER_UNIT * scale
  const imageY = -(profile.imageTop + profile.imageHeight / 2) / PIXELS_PER_UNIT * scale
  const visualLayer = getHatVisualLayer(index)
  useFrame(({ clock }, delta) => {
    if (material.current) material.current.opacity = MathUtils.damp(material.current.opacity, dimmed ? 0 : 1, 12, delta)
    if (!visual.current) return
    const elapsed = clock.getElapsedTime()
    const rotation = body.current?.rotation()
    const bodyAngle = rotation ? 2 * Math.atan2(rotation.z, rotation.w) : 0
    const float = highlighted
      ? UI_HAT_HOVER.lift + Math.sin(elapsed * UI_HAT_HOVER.floatFrequency) * UI_HAT_HOVER.floatDistance
      : 0
    const wobble = highlighted
      ? Math.sin(elapsed * UI_HAT_HOVER.wobbleFrequency) * UI_HAT_HOVER.wobbleAngle
      : 0
    const visualScale = MathUtils.damp(visual.current.scale.x, 1, UI_HAT_HOVER.response, delta)
    visual.current.scale.setScalar(visualScale)
    visual.current.rotation.z = MathUtils.damp(visual.current.rotation.z, highlighted ? -bodyAngle + wobble : 0, UI_HAT_HOVER.response, delta)
    visual.current.position.y = MathUtils.damp(visual.current.position.y, imageY + float, UI_HAT_HOVER.response, delta)
  })

  return (
    <>
      {prisms.map((vertices, index) => <ConvexHullCollider key={index} args={[vertices]} />)}
      <mesh
        ref={visual}
        position={[imageX, imageY, visualLayer.z]}
        renderOrder={visualLayer.renderOrder}
        raycast={() => undefined}
      >
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial ref={material} map={texture} transparent alphaTest={0.08} depthWrite={false} depthTest={false} side={DoubleSide} />
      </mesh>
      {showCollider && (
        <Line
          points={[...outline.map(({ x, y }) => [x, y, 0.2] as [number, number, number]), [outline[0].x, outline[0].y, 0.2]]}
          color="#c6ff3d"
          lineWidth={1.5}
          depthTest={false}
          raycast={() => null}
        />
      )}
    </>
  )
}

function DynamicPngHat({ profile, hitbox, index, values, itemId, interactionReady, highlighted, dimmed, showHitboxOutline, spawnYOffset, lockHorizontalPosition, onActivate, onHoverChange, onSettledChange }: {
  profile: HatColliderProfile
  hitbox: ColliderProfile
  index: number
  values: SandboxValues
  itemId: string
  interactionReady: boolean
  highlighted: boolean
  dimmed: boolean
  showHitboxOutline: boolean
  spawnYOffset: number
  lockHorizontalPosition: boolean
  onActivate?: (id: string) => void
  onHoverChange?: (id: string, hovered: boolean, anchorY?: number) => void
  onSettledChange?: (id: string, settled: boolean) => void
}) {
  const body = useRef<RapierRigidBody>(null)
  const settled = useHatSettled(body, itemId, onSettledChange)
  useBeforePhysicsStep(() => applyStackAssist(body.current, values.hatLab.stackAssist, values.hatLab.landingOffsetX))
  return (
    <RigidBody
      ref={body}
      colliders={false}
      position={[
        values.hatLab.landingOffsetX + ([0, -0.38, 0.3][index] ?? 0) * values.hatLab.dropSpread / 54,
        values.hatLab.landingOffsetY + 2.8 + index * 0.9 + spawnYOffset,
        0,
      ]}
      rotation={[0, 0, [-0.14, 0.2, -0.25][index] ?? 0]}
      angularVelocity={[0, 0, ([0.16, -0.22, 0.19][index] ?? 0) * values.hatLab.spin / 75]}
      enabledTranslations={[!lockHorizontalPosition, true, false]}
      enabledRotations={[false, false, true]}
      restitution={values.hatLab.bounce}
      friction={values.hatLab.friction}
      linearDamping={values.hatLab.airDrag * 15}
      angularDamping={0.45 + values.hatLab.stackAssist}
      additionalSolverIterations={2}
      ccd
      canSleep
    >
      <HatSprite
        profile={profile}
        index={index}
        scale={values.hatLab.hatScale}
        showCollider={values.hatLab.showColliders}
        dimmed={dimmed}
        highlighted={highlighted}
        body={body}
      />
      <HatHitbox
        profile={profile}
        hitbox={hitbox}
        index={index}
        itemId={itemId}
        scale={values.hatLab.hatScale}
        visible={showHitboxOutline && (values.hitbox.showOverlay || highlighted)}
        interactive={settled && interactionReady && Boolean(onActivate)}
        onActivate={() => onActivate?.(itemId)}
        onHoverChange={(hovered, anchorY) => onHoverChange?.(itemId, hovered, anchorY)}
      />
    </RigidBody>
  )
}

function CapModel({ profile, hitbox, values, index, itemId, interactionReady, highlighted, dimmed, showHitboxOutline, capColliderOffsetY, capLocksRotation, spawnYOffset, lockHorizontalPosition, onActivate, onHoverChange, onSettledChange }: {
  profile: HatColliderProfile
  hitbox: ColliderProfile
  values: SandboxValues
  index: number
  itemId: string
  interactionReady: boolean
  highlighted: boolean
  dimmed: boolean
  showHitboxOutline: boolean
  capColliderOffsetY: number
  capLocksRotation: boolean
  spawnYOffset: number
  lockHorizontalPosition: boolean
  onActivate?: (id: string) => void
  onHoverChange?: (id: string, hovered: boolean, anchorY?: number) => void
  onSettledChange?: (id: string, settled: boolean) => void
}) {
  const gltf = useGLTF(stackCap.src)
  const body = useRef<RapierRigidBody>(null)
  const interaction = useRef<Group>(null)
  const visual = useRef<Group>(null)
  const settled = useHatSettled(body, itemId, onSettledChange)
  const visualLayer = getHatVisualLayer(index)
  const usesAuthoredCollider = profile.colliderSource === 'authored'
  const presentation = getModelColliderPresentation('cap')!
  const colliderTransform = resolveModelColliderTransform(usesAuthoredCollider, {
    ...values.capCollider,
    offsetY: values.capCollider.offsetY + capColliderOffsetY,
  })
  const colliderOutlines = useMemo(
    () => profile.vertexSets.map((vertices) => usesAuthoredCollider
      ? vertices.map((point) => normalizedColliderPointToWorld({
          x: (point.x - profile.imageLeft) / profile.imageWidth,
          y: (point.y - profile.imageTop) / profile.imageHeight,
        }, presentation.frame, values.hatLab.hatScale))
      : worldVertexSet(vertices, values.hatLab.hatScale)),
    [presentation.frame, profile, usesAuthoredCollider, values.hatLab.hatScale],
  )
  const colliderPrisms = useMemo(
    () => colliderOutlines.flatMap((outline) => trianglePrisms(outline)),
    [colliderOutlines],
  )
  const normalized = useMemo(() => {
    const clone = gltf.scene.clone(true)
    const colliderModel = gltf.scene.clone(true)
    const materials: Array<{ material: Material; opacity: number }> = []
    clone.traverse((child) => {
      if (child instanceof Mesh) {
        child.material = Array.isArray(child.material)
          ? child.material.map((material) => {
              const orderedMaterial = material.clone()
              orderedMaterial.transparent = true
              orderedMaterial.needsUpdate = true
              materials.push({ material: orderedMaterial, opacity: orderedMaterial.opacity })
              return orderedMaterial
            })
          : (() => {
              const orderedMaterial = child.material.clone()
              orderedMaterial.transparent = true
              orderedMaterial.needsUpdate = true
              materials.push({ material: orderedMaterial, opacity: orderedMaterial.opacity })
              return orderedMaterial
            })()
        child.renderOrder = visualLayer.renderOrder
        child.raycast = () => undefined
      }
    })
    colliderModel.traverse((child) => {
      if (child instanceof Mesh) {
        child.material = new MeshBasicMaterial({
          color: '#67e3ff',
          wireframe: true,
          transparent: true,
          opacity: 0,
          depthWrite: false,
          depthTest: false,
        })
        child.renderOrder = 200 + index
        child.raycast = () => undefined
      }
    })
    const bounds = new Box3().setFromObject(clone)
    const center = bounds.getCenter(new Vector3())
    const size = bounds.getSize(new Vector3())
    return { model: clone, colliderModel, center, materials, scale: presentation.targetSize / Math.max(size.x, size.y, size.z, 0.001) }
  }, [gltf.scene, index, presentation.targetSize, visualLayer.renderOrder])

  useEffect(() => {
    normalized.colliderModel.traverse((child) => {
      if (child instanceof Mesh && child.material instanceof MeshBasicMaterial) {
        child.material.opacity = !usesAuthoredCollider && values.hatLab.showColliders ? 0.5 : 0
      }
    })
  }, [normalized.colliderModel, usesAuthoredCollider, values.hatLab.showColliders])

  useBeforePhysicsStep(() => applyStackAssist(body.current, values.hatLab.stackAssist, values.hatLab.landingOffsetX))
  useFrame(({ clock }, delta) => {
    normalized.materials.forEach(({ material, opacity }) => {
      material.opacity = MathUtils.damp(material.opacity, dimmed ? 0 : opacity, 12, delta)
    })
    if (!interaction.current || !visual.current) return
    const elapsed = clock.getElapsedTime()
    const rotation = body.current?.rotation()
    const bodyAngle = rotation ? 2 * Math.atan2(rotation.z, rotation.w) : 0
    const baseScale = normalized.scale * values.hatLab.hatScale
    const float = highlighted
      ? UI_HAT_HOVER.lift + Math.sin(elapsed * UI_HAT_HOVER.floatFrequency) * UI_HAT_HOVER.floatDistance
      : 0
    const wobble = highlighted
      ? Math.sin(elapsed * UI_HAT_HOVER.wobbleFrequency) * UI_HAT_HOVER.wobbleAngle
      : 0
    const visualScale = MathUtils.damp(interaction.current.scale.x, baseScale, UI_HAT_HOVER.response, delta)
    interaction.current.scale.setScalar(visualScale)
    interaction.current.rotation.z = MathUtils.damp(interaction.current.rotation.z, (capLocksRotation || highlighted) ? -bodyAngle + wobble : 0, UI_HAT_HOVER.response, delta)
    interaction.current.position.y = MathUtils.damp(interaction.current.position.y, float, UI_HAT_HOVER.response, delta)
    const fallingAmount = settled ? 0 : 0.14
    const hoverAmount = settled && interactionReady && highlighted ? UI_HAT_HOVER.capFacingWobble : 0
    const amount = fallingAmount + hoverAmount
    const targetX = 0.12 + Math.sin(elapsed * 2.4) * amount
    const targetY = Math.PI - 0.42 + Math.sin(elapsed * 1.8 + 0.7) * amount * 1.35
    visual.current.rotation.x = MathUtils.damp(visual.current.rotation.x, targetX, 7, delta)
    visual.current.rotation.y = MathUtils.damp(visual.current.rotation.y, targetY, 7, delta)
  })

  return (
    <RigidBody
      ref={body}
      colliders={false}
      position={[
        values.hatLab.landingOffsetX + ([0, -0.38, 0.3, 0][index] ?? 0) * values.hatLab.dropSpread / 54,
        values.hatLab.landingOffsetY + (index === 3 ? 5.6 : 2.8 + index * 0.9) + spawnYOffset,
        0,
      ]}
      enabledTranslations={[!lockHorizontalPosition, true, false]}
      enabledRotations={[false, false, !capLocksRotation]}
      angularVelocity={[0, 0, capLocksRotation ? 0 : 0.05 * values.hatLab.spin / 75]}
      restitution={values.hatLab.bounce}
      friction={values.hatLab.friction}
      linearDamping={values.hatLab.airDrag * 10}
      angularDamping={0.55}
      additionalSolverIterations={2}
      ccd
      canSleep
    >
      <group
        ref={interaction}
        position={[0, 0, visualLayer.z]}
        scale={normalized.scale * values.hatLab.hatScale}
      >
        <group ref={visual} rotation={presentation.rotation}>
          <primitive
            object={normalized.model}
            position={[-normalized.center.x, -normalized.center.y, -normalized.center.z]}
            dispose={null}
          />
        </group>
      </group>
      <HatHitbox
        profile={profile}
        hitbox={hitbox}
        index={index}
        itemId={itemId}
        scale={values.hatLab.hatScale}
        visible={showHitboxOutline && (values.hitbox.showOverlay || highlighted)}
        interactive={settled && interactionReady && Boolean(onActivate)}
        onActivate={() => onActivate?.(itemId)}
        onHoverChange={(hovered, anchorY) => onHoverChange?.(itemId, hovered, anchorY)}
      />
      {usesAuthoredCollider
        ? <group
            position={[colliderTransform.offsetX, colliderTransform.offsetY, colliderTransform.offsetZ]}
            scale={[colliderTransform.scaleX, colliderTransform.scaleY, colliderTransform.scaleZ]}
            rotation={[
              MathUtils.degToRad(colliderTransform.rotateX),
              MathUtils.degToRad(colliderTransform.rotateY),
              MathUtils.degToRad(colliderTransform.rotateZ),
            ]}
          >
            {colliderPrisms.map((vertices, colliderIndex) => <ConvexHullCollider key={colliderIndex} args={[vertices]} />)}
            {values.hatLab.showColliders && colliderOutlines.map((outline, outlineIndex) => (
              <Line
                key={outlineIndex}
                points={[...outline.map(({ x, y }) => [x, y, 0.2] as [number, number, number]), [outline[0].x, outline[0].y, 0.2]]}
                color="#67e3ff"
                lineWidth={1.5}
                depthTest={false}
                raycast={() => null}
              />
            ))}
          </group>
        : <MeshCollider
            key={`${values.hatLab.hatScale}:${capColliderOffsetY}:${Object.values(values.capCollider).join(',')}`}
            type="hull"
          >
            <group
              position={[colliderTransform.offsetX, colliderTransform.offsetY, colliderTransform.offsetZ]}
              scale={[colliderTransform.scaleX, colliderTransform.scaleY, colliderTransform.scaleZ]}
              rotation={[
                MathUtils.degToRad(colliderTransform.rotateX),
                MathUtils.degToRad(colliderTransform.rotateY),
                MathUtils.degToRad(colliderTransform.rotateZ),
              ]}
            >
              <group scale={normalized.scale * values.hatLab.hatScale} rotation={presentation.rotation}>
                <primitive
                  object={normalized.colliderModel}
                  position={[-normalized.center.x, -normalized.center.y, -normalized.center.z]}
                  dispose={null}
                />
              </group>
            </group>
          </MeshCollider>}
    </RigidBody>
  )
}

class StackModelBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('Stacked GLB hat failed to load', error, info) }
  render() { return this.state.failed ? <group /> : this.props.children }
}

function Head({ values, position = [0, -2.35, 0], showPortrait = true, radiusScale = 1 }: {
  values: SandboxValues
  position?: [number, number, number]
  showPortrait?: boolean
  radiusScale?: number
}) {
  const portrait = useStackSceneTexture(headPortraitSrc)
  const radius = values.hatLab.headWidth / 150 * radiusScale
  return (
    <>
      <RigidBody type="fixed" colliders={false} position={position}>
        <BallCollider args={[radius]} scale={[1, 0.62 + values.hatLab.headCurve / 120, 1]} friction={0.9} />
      </RigidBody>
      {showPortrait && (
        <mesh position={HAT_LAB_PORTRAIT_POSITION} renderOrder={-1}>
          <planeGeometry args={[4.3, 4.3]} />
          <meshBasicMaterial map={portrait} transparent opacity={0.24} depthWrite={false} />
        </mesh>
      )}
    </>
  )
}

function DroppingHats({ items, values, hitboxes, reduced, resetKey, maxCount, interactionReady, hoveredId, isolateHovered, showHitboxOutlines, capColliderOffsetY, capLocksRotation, spawnYOffset, lockHorizontalPosition, onActivate, onHoverChange, onSettledChange }: {
  items: Array<{ id: string; profile: HatColliderProfile }>
  values: SandboxValues
  hitboxes: HitboxProfiles
  reduced: boolean
  resetKey: number
  maxCount: number
  interactionReady: boolean
  hoveredId: string | null
  isolateHovered: boolean
  showHitboxOutlines: boolean
  capColliderOffsetY: number
  capLocksRotation: boolean
  spawnYOffset: number
  lockHorizontalPosition: boolean
  onActivate?: (id: string) => void
  onHoverChange?: (id: string, hovered: boolean, anchorY?: number) => void
  onSettledChange?: (id: string, settled: boolean) => void
}) {
  const initialCount = reduced ? items.length : Math.min(1, items.length)
  const [activeCount, setActiveCount] = useState(initialCount)
  const activeCountRef = useRef(initialCount)
  const elapsedRef = useRef(0)
  const droppingRef = useRef(!reduced && items.length > 1)
  const previousResetKey = useRef(resetKey)

  useEffect(() => {
    const count = reduced ? items.length : Math.min(1, items.length)
    activeCountRef.current = count
    elapsedRef.current = 0
    droppingRef.current = !reduced && count < items.length
    setActiveCount(count)
  }, [items.length, reduced])

  useEffect(() => {
    if (previousResetKey.current !== resetKey) {
      activeCountRef.current = 0
      elapsedRef.current = 0
      droppingRef.current = false
      setActiveCount(0)
    }
    previousResetKey.current = resetKey
  }, [resetKey])

  useBeforePhysicsStep(() => {
    if (!droppingRef.current) return
    const interval = Math.max(0.22, values.hatLab.dropInterval + 0.52)
    const progress = advanceHatDrop({ activeCount: activeCountRef.current, elapsed: elapsedRef.current }, items.length, interval)
    elapsedRef.current = progress.elapsed
    if (progress.activeCount === activeCountRef.current) return
    activeCountRef.current = progress.activeCount
    droppingRef.current = progress.activeCount < items.length
    setActiveCount(progress.activeCount)
  })

  return items.slice(0, Math.min(activeCount, maxCount)).map(({ id, profile }, index) => {
    const hitbox = getColliderProfile(profile.part.id, hitboxes)!
    return profile.mediaType === 'model' ? (
      <StackModelBoundary key={profile.part.id}>
        <Suspense fallback={null}>
          <CapModel
            profile={profile}
            hitbox={hitbox}
            values={values}
            index={index}
            itemId={id}
            interactionReady={interactionReady}
            highlighted={hoveredId === id}
            dimmed={isolateHovered && hoveredId !== null && hoveredId !== id}
            showHitboxOutline={showHitboxOutlines}
            capColliderOffsetY={capColliderOffsetY}
            capLocksRotation={capLocksRotation}
            spawnYOffset={spawnYOffset}
            lockHorizontalPosition={lockHorizontalPosition}
            onActivate={onActivate}
            onHoverChange={onHoverChange}
            onSettledChange={onSettledChange}
          />
        </Suspense>
      </StackModelBoundary>
    ) : (
      <DynamicPngHat
        key={profile.part.id}
        profile={profile}
        hitbox={hitbox}
        index={index}
        values={values}
        itemId={id}
        interactionReady={interactionReady}
        highlighted={hoveredId === id}
        dimmed={isolateHovered && hoveredId !== null && hoveredId !== id}
        showHitboxOutline={showHitboxOutlines}
        spawnYOffset={spawnYOffset}
        lockHorizontalPosition={lockHorizontalPosition}
        onActivate={onActivate}
        onHoverChange={onHoverChange}
        onSettledChange={onSettledChange}
      />
    )
  })
}

function StackWorld({ items, values, hitboxes, reduced, running, frozen, hoveredId, isolateHovered, showHitboxOutlines, capColliderOffsetY, capLocksRotation, spawnYOffset, lockHorizontalPosition, dropKey, resetKey, showPortrait, headPosition, headRadiusScale, maxCount, onActivate, onHoverChange, onSettledChange }: {
  items: Array<{ id: string; profile: HatColliderProfile }>
  values: SandboxValues
  hitboxes: HitboxProfiles
  reduced: boolean
  running: boolean
  frozen: boolean
  hoveredId: string | null
  isolateHovered: boolean
  showHitboxOutlines: boolean
  capColliderOffsetY: number
  capLocksRotation: boolean
  spawnYOffset: number
  lockHorizontalPosition: boolean
  dropKey: number
  resetKey: number
  showPortrait: boolean
  headPosition: [number, number, number]
  headRadiusScale: number
  maxCount: number
  onActivate?: (id: string) => void
  onHoverChange?: (id: string, hovered: boolean, anchorY?: number) => void
  onSettledChange?: (id: string, settled: boolean) => void
}) {

  return (
    <>
      <ambientLight intensity={2.2} />
      <directionalLight intensity={4.4} position={[3, 5, 5]} />
      <Physics
        gravity={[0, -Math.max(1, values.hatLab.gravity / 260), 0]}
        paused={!running || frozen}
        timeStep={HAT_FIXED_TIME_STEP}
      >
        <Head values={values} position={headPosition} showPortrait={showPortrait} radiusScale={headRadiusScale} />
        <RigidBody type="fixed" colliders={false}>
          <CuboidCollider args={[0.18, 5, 1]} position={[headPosition[0] - 1.8, values.hatLab.landingOffsetY, 0]} />
          <CuboidCollider args={[0.18, 5, 1]} position={[headPosition[0] + 1.8, values.hatLab.landingOffsetY, 0]} />
          <CuboidCollider args={[5, 0.3, 1]} position={[headPosition[0], headPosition[1] - 0.9, 0]} />
        </RigidBody>
        <DroppingHats
          key={`${dropKey}:${values.hatLab.dropOrder}:${values.hatLab.landingOffsetX}:${values.hatLab.landingOffsetY}`}
          items={items}
          values={values}
          hitboxes={hitboxes}
          reduced={reduced}
          resetKey={resetKey}
          maxCount={maxCount}
          interactionReady={Boolean(onActivate)}
          hoveredId={hoveredId}
          isolateHovered={isolateHovered}
          showHitboxOutlines={showHitboxOutlines}
          capColliderOffsetY={capColliderOffsetY}
          capLocksRotation={capLocksRotation}
          spawnYOffset={spawnYOffset}
          lockHorizontalPosition={lockHorizontalPosition}
          onActivate={onActivate}
          onHoverChange={onHoverChange}
          onSettledChange={onSettledChange}
        />
      </Physics>
    </>
  )
}

function ReadyStackWorld(props: Parameters<typeof StackWorld>[0]) {
  useTexture(stackSceneTextureSources, configureStackTextureColors)
  useGLTF(stackCap.src)
  return <StackWorld {...props} />
}

function SceneReady({ onReady }: { onReady: () => void }) {
  const notified = useRef(false)
  useFrame(() => {
    if (notified.current) return
    notified.current = true
    onReady()
  })
  return null
}

function HatLayoutEditor({ values, onOrderChange, onLandingOffsetChange }: {
  values: SandboxValues
  onOrderChange: (order: string) => void
  onLandingOffsetChange: (x: number, y: number) => void
}) {
  const order = parseHatOrder(values.hatLab.dropOrder)
  const [draftTarget, setDraftTarget] = useState<{ x: number; y: number } | null>(null)
  const target = draftTarget ?? { x: values.hatLab.landingOffsetX, y: values.hatLab.landingOffsetY }
  const dragStart = useRef<{ pointerX: number; pointerY: number; x: number; y: number } | null>(null)

  const targetFromPointer = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragStart.current) return null
    const x = dragStart.current.x + (event.clientX - dragStart.current.pointerX) / 65
    const y = dragStart.current.y - (event.clientY - dragStart.current.pointerY) / 65
    return {
      x: Math.round(Math.max(-1, Math.min(1, x)) * 100) / 100,
      y: Math.round(Math.max(-1, Math.min(1, y)) * 100) / 100,
    }
  }
  const updateDrag = (event: React.PointerEvent<HTMLButtonElement>) => {
    const next = targetFromPointer(event)
    if (next) setDraftTarget(next)
  }
  const finishDrag = (event: React.PointerEvent<HTMLButtonElement>) => {
    const next = targetFromPointer(event)
    if (!next) return
    event.currentTarget.releasePointerCapture(event.pointerId)
    dragStart.current = null
    onLandingOffsetChange(next.x, next.y)
    setDraftTarget(null)
  }

  return (
    <>
      <div className="hat-order-editor" aria-label="Hat drop order">
        <strong>DROP ORDER</strong>
        {order.map((id, index) => (
          <div key={id}>
            <span>{index + 1}</span>
            <b>{gravityHatLabels[id]}</b>
            <button type="button" disabled={index === 0} aria-label={`Move ${gravityHatLabels[id]} earlier`} onClick={() => onOrderChange(moveHatInOrder(values.hatLab.dropOrder, id, -1))}>&uarr;</button>
            <button type="button" disabled={index === order.length - 1} aria-label={`Move ${gravityHatLabels[id]} later`} onClick={() => onOrderChange(moveHatInOrder(values.hatLab.dropOrder, id, 1))}>&darr;</button>
          </div>
        ))}
      </div>
      <button
        type="button"
        className="hat-landing-target"
        aria-label="Drag stack landing target"
        style={{
          '--landing-target-x': `${target.x * 65}px`,
          '--landing-target-y': `${target.y * -65}px`,
        } as React.CSSProperties}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId)
          dragStart.current = { pointerX: event.clientX, pointerY: event.clientY, x: target.x, y: target.y }
        }}
        onPointerMove={updateDrag}
        onPointerUp={finishDrag}
        onPointerCancel={() => {
          dragStart.current = null
          setDraftTarget(null)
        }}
      >
        <span>LAND</span>
      </button>
    </>
  )
}

function useGravityProfiles(items: GravityHatItem[], colliders: ColliderProfiles) {
  const [profiles, setProfiles] = useState<Array<{ id: string; profile: HatColliderProfile }>>([])
  const [profileError, setProfileError] = useState('')
  useEffect(() => {
    let cancelled = false
    setProfileError('')
    void Promise.all(items.map(async ({ id, part }) => ({ id, profile: await loadHatCollider(part) }))).then((baseProfiles) => {
      if (cancelled) return
      setProfiles(baseProfiles.map(({ id, profile }) => {
        const key = resolveColliderProfileKey(profile.part.id)
        return { id, profile: applyOverride(profile, key ? colliders[key] ?? null : null) }
      }))
    }).catch((error: unknown) => {
      if (!cancelled) setProfileError(error instanceof Error ? error.message : 'Hat collider scan failed')
    })
    return () => { cancelled = true }
  }, [colliders, items])
  const requestedProfiles = useMemo(() => {
    const byId = new Map(profiles.map((entry) => [entry.id, entry]))
    const ordered = items.map((item) => byId.get(item.id)).filter((entry) => entry !== undefined)
    return ordered.length === items.length ? ordered : []
  }, [items, profiles])
  return { profiles: requestedProfiles, profileError }
}

export function HatGravityCanvas({
  items,
  values,
  colliders,
  hitboxes = {},
  reduced,
  replayKey,
  active,
  className,
  showPortrait = false,
  headPosition = [0, -1.3, 0],
  headRadiusScale = 0.82,
  maxCount = items.length,
  frozen = false,
  hoveredId = null,
  isolateHovered = false,
  capColliderOffsetY = 0,
  capLocksRotation = false,
  cameraZoomReferenceWidth,
  spawnYOffset = 0,
  lockHorizontalPosition = false,
  showHitboxOutlines = true,
  onActivate,
  onHoverChange,
  onSettledChange,
}: HatGravityCanvasProps) {
  // Pointer hitboxes and physics colliders are intentionally independent.
  // Reusing the cap hitbox here changes the cap's physical hull only in UI/Figma
  // modes and makes it intersect otherwise-correct authored hat colliders.
  const { profiles, profileError } = useGravityProfiles(items, colliders)
  const documentVisible = useDocumentVisible()
  const [sceneReady, setSceneReady] = useState(false)
  const running = active && documentVisible && sceneReady

  useEffect(() => () => { document.body.style.cursor = '' }, [])

  if (profileError) return active ? <div className="hat-stack-status error">{profileError}</div> : null
  if (!profiles.length) return active ? <div className="hat-stack-status">Loading hat physics...</div> : null

  return (
    <div
      className={`${className}${sceneReady ? ' is-render-ready' : ''}`}
      aria-label="Interactive falling category hats"
      data-render-ready={sceneReady}
    >
      <Canvas
        orthographic
        camera={{ position: [0, 0.8, 12], zoom: 65 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true }}
      >
        {cameraZoomReferenceWidth && <ResponsiveCameraZoom referenceWidth={cameraZoomReferenceWidth} />}
        {showPortrait && <color attach="background" args={[values.scene.background]} />}
        <ResetClockOnResume running={running} />
        <Suspense fallback={null}>
          <ReadyStackWorld
            items={profiles}
            values={values}
            hitboxes={hitboxes}
            reduced={reduced}
            running={running}
            frozen={frozen}
            hoveredId={hoveredId}
            isolateHovered={isolateHovered}
            capColliderOffsetY={capColliderOffsetY}
            capLocksRotation={capLocksRotation}
            spawnYOffset={spawnYOffset}
            lockHorizontalPosition={lockHorizontalPosition}
            showHitboxOutlines={showHitboxOutlines}
            dropKey={replayKey}
            resetKey={0}
            showPortrait={showPortrait}
            headPosition={headPosition}
            headRadiusScale={headRadiusScale}
            maxCount={maxCount}
            onActivate={onActivate}
            onHoverChange={onHoverChange}
            onSettledChange={onSettledChange}
          />
          <SceneReady onReady={() => setSceneReady(true)} />
        </Suspense>
      </Canvas>
    </div>
  )
}

export function HatStackStage({ values, colliders, reduced, dropKey, resetKey, active, onOrderChange, onLandingOffsetChange }: HatStackStageProps) {
  const items = useMemo<GravityHatItem[]>(() => parseHatOrder(values.hatLab.dropOrder).map((id) => ({ id, part: gravityHatPartsByCategory[id] })), [values.hatLab.dropOrder])
  const { profiles, profileError } = useGravityProfiles(items, colliders)
  const documentVisible = useDocumentVisible()
  const running = active && documentVisible

  if (profileError) return active ? <div className="hat-stack-status error">{profileError}</div> : null
  if (!profiles.length) return active ? <div className="hat-stack-status">Loading 3D physics...</div> : null

  return (
    <div
      className={`hat-stack-stage${active ? '' : ' inactive'}`}
      aria-hidden={!active}
      aria-label="3D hat physics simulator with editable 2D collider profiles"
    >
      <Canvas
        orthographic
        camera={{ position: [0, 0.8, 12], zoom: 65 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true }}
        style={{ backgroundColor: values.scene.background }}
        onCreated={({ gl }) => {
          gl.setClearColor(values.scene.background)
          gl.clear()
        }}
      >
        <color attach="background" args={[values.scene.background]} />
        <ResetClockOnResume running={running} />
        <Suspense fallback={null}>
          <ReadyStackWorld
            items={profiles}
            values={values}
            hitboxes={{}}
            reduced={reduced}
            running={running}
            frozen={false}
            hoveredId={null}
            isolateHovered={false}
            capColliderOffsetY={0}
            capLocksRotation={false}
            spawnYOffset={0}
            lockHorizontalPosition={false}
            showHitboxOutlines
            dropKey={dropKey}
            resetKey={resetKey}
            showPortrait
            headPosition={[values.hatLab.landingOffsetX, -2.35 + values.hatLab.landingOffsetY, 0]}
            headRadiusScale={1}
            maxCount={values.hatLab.stackCount}
          />
        </Suspense>
      </Canvas>
      {active && <HatLayoutEditor values={values} onOrderChange={onOrderChange} onLandingOffsetChange={onLandingOffsetChange} />}
      <div className="hat-stack-legend" aria-hidden="true">
        <span>AUTHORED OUTLINES / GLB MESH</span>
        <span>RAPIER 3D</span>
      </div>
    </div>
  )
}

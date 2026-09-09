import { Suspense, useLayoutEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { Box3, Mesh, OrthographicCamera, Sphere, Vector3, type Group } from 'three'

/* ─────────────────────────────────────────────────────────
 * CAP Y-SPIN STORYBOARD
 *
 *    0.0s   cap starts at its authored three-quarter angle
 *    2.6s   cap completes one quarter-turn around its vertical Y axis
 *    5.2s   cap reveals its back at the half-turn
 *    7.7s   cap completes three quarters of the rotation
 *   10.3s   cap returns to its starting face and continues seamlessly
 * ───────────────────────────────────────────────────────── */

const capSrc = '/landing-page-hats/hat-cap.glb?v=seam-padding-1'
const MAX_CAMERA_ZOOM = 76
const CAMERA_FRAME_WIDTH = 3
const CAMERA_FRAME_HEIGHT = 2.8
const RESPONSIVE_FILL_SCALE = 1.2
const CAP_Y_SPIN = {
  restingXRotation: 0.08,
  forwardXRotation: -Math.PI / 6,
  baseYRotation: Math.PI - 0.38,
  cycleDuration: 10.3,
  safeRadius: 0.9,
}
useGLTF.preload(capSrc)

export function getCapCameraZoom(width: number, height: number) {
  if (width <= 0 || height <= 0) return MAX_CAMERA_ZOOM
  const fitZoom = Math.min(
    width / CAMERA_FRAME_WIDTH,
    height / CAMERA_FRAME_HEIGHT,
  )
  return Math.min(MAX_CAMERA_ZOOM, RESPONSIVE_FILL_SCALE * fitZoom)
}

function ResponsiveCapCamera() {
  const camera = useThree((state) => state.camera)
  const size = useThree((state) => state.size)

  useLayoutEffect(() => {
    if (!(camera instanceof OrthographicCamera)) return
    camera.zoom = getCapCameraZoom(size.width, size.height)
    camera.updateProjectionMatrix()
  }, [camera, size.height, size.width])

  return null
}

function CapModel({ offsetX = 0, offsetY = 0, scaleMultiplier = 1, animateYSpin = false, useSpinScale = animateYSpin, spinSpeed = 1 }: { offsetX?: number; offsetY?: number; scaleMultiplier?: number; animateYSpin?: boolean; useSpinScale?: boolean; spinSpeed?: number }) {
  const gltf = useGLTF(capSrc)
  const groupRef = useRef<Group>(null)
  const normalized = useMemo(() => {
    const model = gltf.scene.clone(true)
    model.updateMatrixWorld(true)
    const bounds = new Box3().setFromObject(model)
    const center = bounds.getCenter(new Vector3())
    const size = bounds.getSize(new Vector3())
    const sphere = bounds.getBoundingSphere(new Sphere())
    const vertexCenter = new Vector3()
    const vertex = new Vector3()
    let vertexCount = 0

    model.traverse((object) => {
      if (!(object instanceof Mesh)) return
      const positions = object.geometry.getAttribute('position')
      if (!positions) return
      for (let index = 0; index < positions.count; index += 1) {
        vertex.fromBufferAttribute(positions, index).applyMatrix4(object.matrixWorld)
        vertexCenter.add(vertex)
        vertexCount += 1
      }
    })

    if (vertexCount > 0) vertexCenter.multiplyScalar(1 / vertexCount)
    else vertexCenter.copy(center)

    // Rotate around the mesh's horizontal centroid while retaining the authored vertical framing.
    const pivot = new Vector3(vertexCenter.x, center.y, vertexCenter.z)
    return {
      model,
      pivot,
      scale: 2.3 / Math.max(size.x, size.y, size.z, 0.001),
      rotationSafeScale: CAP_Y_SPIN.safeRadius / Math.max(sphere.radius, 0.001),
    }
  }, [gltf.scene])

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const spin = clock.getElapsedTime() * spinSpeed * Math.PI * 2 / CAP_Y_SPIN.cycleDuration
    groupRef.current.rotation.y = CAP_Y_SPIN.baseYRotation + (animateYSpin ? spin : 0)
  })

  return (
    <group ref={groupRef} position={[offsetX, offsetY, 0]} rotation={[0, CAP_Y_SPIN.baseYRotation, 0]}>
      <group
        scale={(useSpinScale ? normalized.rotationSafeScale : normalized.scale) * scaleMultiplier}
        rotation={[animateYSpin ? CAP_Y_SPIN.forwardXRotation : CAP_Y_SPIN.restingXRotation, 0, -0.06]}
      >
        <primitive object={normalized.model} position={[-normalized.pivot.x, -normalized.pivot.y, -normalized.pivot.z]} />
      </group>
    </group>
  )
}

export function UiCap({ modelOffsetX = 0, modelOffsetY = 0, modelScale = 1, animateYSpin = false, useSpinScale = animateYSpin, spinSpeed = 1 }: { modelOffsetX?: number; modelOffsetY?: number; modelScale?: number; animateYSpin?: boolean; useSpinScale?: boolean; spinSpeed?: number } = {}) {
  return (
    <Canvas className="ui-cap-canvas" data-cap-model-scale={modelScale} data-cap-spin-speed={spinSpeed} orthographic camera={{ position: [0, 0, 5], zoom: MAX_CAMERA_ZOOM }} dpr={[1, 1.5]}>
      <ResponsiveCapCamera />
      <ambientLight intensity={2.2} />
      <directionalLight position={[3, 5, 5]} intensity={4.2} />
      <Suspense fallback={null}><CapModel offsetX={modelOffsetX} offsetY={modelOffsetY} scaleMultiplier={modelScale} animateYSpin={animateYSpin} useSpinScale={useSpinScale} spinSpeed={spinSpeed} /></Suspense>
    </Canvas>
  )
}

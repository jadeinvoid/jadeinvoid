import type { DialConfig, ResolvedValues } from 'dialkit'
import { assetOptions, hatAssetOptions } from './assets'
import { characterPartOptions } from './characterAssets'
import { DEFAULT_HAT_ORDER, HAT_ORDER_OPTIONS } from './hatLayout'

interface LayerControlConfig extends DialConfig {
  visible: boolean
  motionEnabled: boolean
  x: [number, number, number, number]
  y: [number, number, number, number]
  scale: [number, number, number, number]
  rotate: [number, number, number, number]
  opacity: [number, number, number, number]
  zIndex: [number, number, number, number]
  idleAmount: [number, number, number, number]
  hoverY: [number, number, number, number]
  hoverScale: [number, number, number, number]
  pressScale: [number, number, number, number]
}

function layerControls(x: number, y: number, scale: number, rotate: number, zIndex: number, motionEnabled = true): LayerControlConfig {
  return {
    visible: true,
    motionEnabled,
    x: [x, -250, 250, 1],
    y: [y, -250, 250, 1],
    scale: [scale, 0.01, 3, 0.01],
    rotate: [rotate, -180, 180, 1],
    opacity: [1, 0, 1, 0.01],
    zIndex: [zIndex, 0, 20, 1],
    idleAmount: [0, 0, 30, 0.5],
    hoverY: [0, -100, 100, 1],
    hoverScale: [1.04, 0.5, 2, 0.01],
    pressScale: [0.96, 0.5, 1.5, 0.01],
  }
}

export const sandboxConfig = {
  workspace: {
    mode: {
      type: 'select',
      options: [
        { value: 'asset', label: 'Single Asset' },
        { value: 'character', label: 'Character Composer' },
        { value: 'hat', label: 'Hat Lab' },
        { value: 'ui', label: 'UI Lab' },
        { value: 'content', label: 'Content' },
        { value: 'figma', label: 'Figma Lab' },
      ],
      default: 'asset',
    },
  },
  asset: {
    selected: { type: 'select', options: assetOptions, default: 'hat-cap-3d' },
    reducedMotion: {
      type: 'select',
      options: [
        { value: 'system', label: 'Follow system' },
        { value: 'reduce', label: 'Reduce motion' },
        { value: 'force', label: 'Force motion' },
      ],
      default: 'system',
    },
    loadLocalFile: { type: 'action', label: 'Choose local file' },
  },
  character: {
    portrait: { type: 'select', options: characterPartOptions('portrait'), default: 'portrait-1' },
    eyeMode: { type: 'select', options: ['paired', 'individual'], default: 'paired' },
    eyes: { type: 'select', options: characterPartOptions('eyes'), default: 'eyes-open' },
    leftEye: { type: 'select', options: characterPartOptions('leftEye'), default: 'eye-open-left' },
    rightEye: { type: 'select', options: characterPartOptions('rightEye'), default: 'eye-open-right' },
    hand: { type: 'select', options: characterPartOptions('hand', true), default: 'hand-cursor' },
    hat: { type: 'select', options: characterPartOptions('hat', true), default: 'hat-paperboat-2d' },
    blink: true as boolean,
    blinkInterval: [3.2, 0.5, 12, 0.1],
    blinkDuration: [0.13, 0.05, 0.8, 0.01],
    cursorFollow: true as boolean,
    cursorFollowAmount: [7, 0, 30, 0.5],
  },
  characterLayers: {
    portrait: layerControls(0, 0, 1, 0, 1),
    eyes: layerControls(0, 0, 1, 0, 3),
    leftEye: layerControls(0, 0, 1, 0, 3),
    rightEye: layerControls(0, 0, 1, 0, 3),
    hand: layerControls(0, 0, 1, 0, 5),
    hat: layerControls(0, 0, 1, 0, 6, false),
  },
  hatLab: {
    view: { type: 'select', options: ['single', 'stack'], default: 'single' },
    selected: { type: 'select', options: hatAssetOptions, default: 'hat-cap-3d' },
    stackCount: [4, 1, 4, 1],
    dropOrder: { type: 'select', options: HAT_ORDER_OPTIONS, default: DEFAULT_HAT_ORDER },
    landingOffsetX: [0, -1, 1, 0.01],
    landingOffsetY: [0, -1, 1, 0.01],
    hatScale: [1, 0.5, 1.5, 0.01],
    gravity: [1500, 100, 4000, 50],
    bounce: [0.16, 0, 0.9, 0.01],
    friction: [0.78, 0, 1, 0.01],
    airDrag: [0.025, 0, 0.2, 0.005],
    dropInterval: [0.24, 0, 1.5, 0.01],
    dropSpread: [54, 0, 220, 1],
    spin: [75, 0, 360, 1],
    stackAssist: [0.72, 0, 1, 0.01],
    headWidth: [230, 100, 360, 1],
    headCurve: [30, 0, 100, 1],
    showColliders: false as boolean,
    dropStack: { type: 'action', label: 'Drop stack' },
    resetStack: { type: 'action', label: 'Clear stack' },
  },
  uiLab: {
    screen: {
      type: 'select',
      options: [
        { value: 'landing', label: 'Landing' },
        { value: 'preview', label: 'Category Preview' },
        { value: 'work', label: 'Work List' },
      ],
      default: 'landing',
    },
    category: {
      type: 'select',
      options: [
        { value: 'ux', label: 'UX Design' },
        { value: 'illustration', label: 'Illustration' },
        { value: 'visual', label: 'Visual Design' },
        { value: 'other', label: 'Others' },
      ],
      default: 'ux',
    },
    background: '#fffaf0',
    frameColor: '#ff4f9a',
    strokeFrequency: [75, 0, 100, 1],
    strokeWiggle: [30, 0, 100, 1],
    strokeSmoothen: [50, 0, 100, 1],
    projectStagger: [0.09, 0, 0.5, 0.01],
    hoverGrace: [0.18, 0, 1, 0.01],
    transition: { type: 'spring', visualDuration: 0.5, bounce: 0.16 },
    openCategory: { type: 'action', label: 'Open category' },
    returnLanding: { type: 'action', label: 'Return to landing' },
  },
  collider: {
    editing: false as boolean,
    showOverlay: true as boolean,
    resetProfile: { type: 'action', label: 'Reset collider' },
  },
  hitbox: {
    editing: false as boolean,
    showOverlay: false as boolean,
    resetProfile: { type: 'action', label: 'Reset hitbox' },
  },
  capCollider: {
    showPreview: true as boolean,
    offsetX: [0, -3, 3, 0.01],
    offsetY: [0, -3, 3, 0.01],
    offsetZ: [0, -3, 3, 0.01],
    scaleX: [1, 0.25, 2, 0.01],
    scaleY: [1, 0.25, 2, 0.01],
    scaleZ: [1, 0.25, 2, 0.01],
    rotateX: [0, -180, 180, 1],
    rotateY: [0, -180, 180, 1],
    rotateZ: [0, -180, 180, 1],
  },
  transform: {
    x: [0, -500, 500, 1],
    y: [0, -500, 500, 1],
    z: [0, -10, 10, 0.01],
    scale: [1, 0.05, 4, 0.01],
    rotateX: [0, -180, 180, 1],
    rotateY: [0, -180, 180, 1],
    rotateZ: [0, -180, 180, 1],
    opacity: [1, 0, 1, 0.01],
    blur: [0, 0, 40, 0.5],
    borderRadius: [0, 0, 100, 1],
    zIndex: [1, -10, 100, 1],
  },
  motion: {
    preset: {
      type: 'select',
      options: ['fade', 'slide', 'float', 'pulse', 'wobble', 'rotate', 'reveal'],
      default: 'float',
    },
    transitionMode: {
      type: 'select',
      options: ['spring', 'tween'],
      default: 'spring',
    },
    easing: {
      type: 'select',
      options: ['easeOut', 'easeInOut', 'linear', 'circOut', 'custom'],
      default: 'easeOut',
    },
    duration: [0.8, 0.05, 8, 0.05],
    delay: [0, 0, 4, 0.05],
    repeat: [0, 0, 20, 1],
    loop: true as boolean,
    hoverScale: [1.06, 0.5, 2, 0.01],
    pressScale: [0.96, 0.5, 1.5, 0.01],
    mask: {
      type: 'select',
      options: ['none', 'inset', 'circle', 'wipe'],
      default: 'none',
    },
    bezierX1: [0.22, 0, 1, 0.01],
    bezierY1: [1, -1, 2, 0.01],
    bezierX2: [0.36, 0, 1, 0.01],
    bezierY2: [1, -1, 2, 0.01],
    replay: { type: 'action', label: 'Motion Test' },
  },
  spring: {
    transition: { type: 'spring', visualDuration: 0.55, bounce: 0.18 },
  },
  scene: {
    background: '#0b0e10',
    shadows: true as boolean,
    autoRotate: false as boolean,
    autoRotateSpeed: [0.65, -5, 5, 0.05],
    resetView: { type: 'action', label: 'Reset stage' },
  },
  camera: {
    x: [0, -20, 20, 0.1],
    y: [1.2, -20, 20, 0.1],
    z: [5, 0.1, 30, 0.1],
    fov: [42, 15, 100, 1],
    targetX: [0, -10, 10, 0.1],
    targetY: [0, -10, 10, 0.1],
    targetZ: [0, -10, 10, 0.1],
  },
  lighting: {
    ambientIntensity: [1.2, 0, 5, 0.05],
    directionalIntensity: [3.5, 0, 12, 0.1],
    x: [4, -20, 20, 0.1],
    y: [7, -20, 20, 0.1],
    z: [5, -20, 20, 0.1],
  },
  export: {
    showPanel: true as boolean,
    savePreset: { type: 'action', label: 'New experiment' },
    createSnapshot: { type: 'action', label: 'Create snapshot' },
    openHistory: { type: 'action', label: 'Snapshot history' },
    downloadJson: { type: 'action', label: 'Download experiment' },
    importJson: { type: 'action', label: 'Import experiment' },
  },
} satisfies DialConfig

export type SandboxValues = ResolvedValues<typeof sandboxConfig>

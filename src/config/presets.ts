import type { DialKitValueUpdates } from 'dialkit'
import type { sandboxConfig } from './controls'

export type SandboxPreset = DialKitValueUpdates<typeof sandboxConfig>

export const starterPresets: Record<string, SandboxPreset> = {
  'Soft UI': {
    motion: { preset: 'fade', transitionMode: 'spring', hoverScale: 1.03, pressScale: 0.98 },
    spring: { transition: { type: 'spring', visualDuration: 0.65, bounce: 0.08 } },
    scene: { background: '#101416', autoRotate: false },
    lighting: { ambientIntensity: 1.6, directionalIntensity: 2.8 },
  },
  'Snappy HUD': {
    motion: { preset: 'slide', transitionMode: 'spring', hoverScale: 1.08, pressScale: 0.92 },
    spring: { transition: { type: 'spring', stiffness: 520, damping: 32, mass: 0.7 } },
    scene: { background: '#07090a', autoRotate: false },
    lighting: { ambientIntensity: 0.8, directionalIntensity: 5 },
  },
  'Cinematic Float': {
    motion: { preset: 'float', transitionMode: 'tween', easing: 'easeInOut', duration: 2.6, loop: true },
    transform: { rotateY: -8, scale: 1.08 },
    scene: { background: '#0b0c12', autoRotate: true, autoRotateSpeed: 0.3 },
    lighting: { ambientIntensity: 1, directionalIntensity: 4.2 },
  },
}

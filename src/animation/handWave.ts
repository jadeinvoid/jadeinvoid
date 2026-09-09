import { useEffect, useState } from 'react'

/* ─────────────────────────────────────────────────────────
 * HAND WAVE STORYBOARD
 *
 * Read top-to-bottom. Each value is ms after entering the view.
 *
 *    0ms   hand appears on view entry or page refresh and begins waving
 * 5000ms   hand stops waving and fades opacity 1 → 0
 * 5500ms   hand is hidden and no longer interactive
 * ───────────────────────────────────────────────────────── */

export const HAND_WAVE_TIMING = {
  fadeOut: 5_000, // stop waving and begin fading
  hidden:  5_500, // hide after the fade completes
}

export const HAND_WAVE = {
  rotations:     [0, -20, 16, -20, 16, 0], // degrees through one wave cycle
  cycleDuration: 0.8,                       // seconds per wave cycle
  fadeDuration:  0.5,                       // seconds to fade away
  transformOrigin: '55% 82%',               // pivot around the wrist
  waveEase:      'easeInOut' as const,      // smooth direction changes
  fadeEase:      'easeOut' as const,        // gentle exit
}

export function useHandWaveStage(enabled: boolean) {
  const [stage, setStage] = useState(0)

  useEffect(() => {
    setStage(0)
    if (!enabled) return

    const timers = [
      window.setTimeout(() => setStage(1), HAND_WAVE_TIMING.fadeOut),
      window.setTimeout(() => setStage(2), HAND_WAVE_TIMING.hidden),
    ]

    return () => timers.forEach(window.clearTimeout)
  }, [enabled])

  return stage
}

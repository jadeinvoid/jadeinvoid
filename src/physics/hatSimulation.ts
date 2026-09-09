export const HAT_FIXED_TIME_STEP = 1 / 60
export const HAT_SETTLE_STEPS = 30
const HAT_SETTLE_SPEED_SQUARED = 0.05 ** 2

export interface HatDropProgress {
  activeCount: number
  elapsed: number
}

export function advanceHatDrop(
  progress: HatDropProgress,
  total: number,
  interval: number,
): HatDropProgress {
  const elapsed = progress.elapsed + HAT_FIXED_TIME_STEP
  const additions = Math.floor((elapsed + 1e-9) / interval)
  if (additions === 0) return { ...progress, elapsed }
  return {
    activeCount: Math.min(total, progress.activeCount + additions),
    elapsed: Math.max(0, elapsed - additions * interval),
  }
}

export function areAllHatsSettled(ids: readonly string[], settled: ReadonlySet<string>) {
  return ids.length > 0 && ids.every((id) => settled.has(id))
}

export function advanceHatSettle(stableSteps: number, linearSpeedSquared: number, angularSpeedSquared: number) {
  if (linearSpeedSquared > HAT_SETTLE_SPEED_SQUARED || angularSpeedSquared > HAT_SETTLE_SPEED_SQUARED) return 0
  return Math.min(HAT_SETTLE_STEPS, stableSteps + 1)
}

export function getHatVisualLayer(index: number) {
  return {
    z: 0.03 + index * 0.04,
    renderOrder: 20 + index,
  }
}

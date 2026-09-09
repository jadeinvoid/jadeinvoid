import type { ColorConfig, DialConfig, DialValue, SelectConfig, TextConfig } from 'dialkit'
import { sandboxConfig, type SandboxValues } from '../config/controls'
import type { SandboxPreset } from '../config/presets'
import type { ExperimentV1 } from '../experiment'
import type { ColliderProfiles, HitboxProfiles } from '../colliders/profiles'

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends readonly unknown[]
    ? T[K]
    : T[K] extends object
      ? DeepPartial<T[K]>
      : T[K]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function resolveConfig(config: DialConfig): Record<string, unknown> {
  const output: Record<string, unknown> = {}
  for (const [key, definition] of Object.entries(config)) {
    if (key === '_collapsed') continue
    if (Array.isArray(definition)) {
      output[key] = (definition as readonly unknown[])[0]
    } else if (typeof definition !== 'object' || definition === null) {
      output[key] = definition
    } else if (definition.type === 'select') {
      const select = definition as SelectConfig
      const first = select.options[0]
      output[key] = select.default ?? (typeof first === 'string' ? first : first.value)
    } else if (definition.type === 'color') {
      output[key] = (definition as ColorConfig).default ?? '#000000'
    } else if (definition.type === 'text') {
      output[key] = (definition as TextConfig).default ?? ''
    } else if (definition.type === 'action' || definition.type === 'spring' || definition.type === 'easing') {
      output[key] = { ...definition }
    } else {
      output[key] = resolveConfig(definition as DialConfig)
    }
  }
  return output
}

export function createDefaultSandboxValues(): SandboxValues {
  return resolveConfig(sandboxConfig) as SandboxValues
}

export function mergeSandboxPatch<T>(current: T, patch: DeepPartial<T>): T {
  if (!isRecord(current) || !isRecord(patch)) return Object.is(current, patch) ? current : patch as T
  let changed = false
  const next: Record<string, unknown> = { ...current }
  for (const [key, patchValue] of Object.entries(patch)) {
    if (patchValue === undefined) continue
    const currentValue = (current as Record<string, unknown>)[key]
    const merged = isRecord(currentValue) && isRecord(patchValue)
      ? mergeSandboxPatch(currentValue, patchValue)
      : patchValue
    if (!Object.is(merged, currentValue)) {
      next[key] = merged
      changed = true
    }
  }
  return changed ? next as T : current
}

export function getSandboxValue(values: SandboxValues, path: string): unknown {
  return path.split('.').reduce<unknown>((current, key) => isRecord(current) ? current[key] : undefined, values)
}

export function setSandboxValue(values: SandboxValues, path: string, value: DialValue): SandboxValues {
  const keys = path.split('.')
  const update = (current: unknown, index: number): unknown => {
    if (index === keys.length) return Object.is(current, value) ? current : value
    if (!isRecord(current)) return current
    const key = keys[index]
    const child = update(current[key], index + 1)
    if (Object.is(child, current[key])) return current
    return { ...current, [key]: child }
  }
  return update(values, 0) as SandboxValues
}

export function applyPresetToState(current: SandboxValues, preset: SandboxPreset): SandboxValues {
  const defaults = createDefaultSandboxValues()
  const next = mergeSandboxPatch(defaults, preset as DeepPartial<SandboxValues>)
  return mergeSandboxPatch(next, {
    workspace: { mode: current.workspace.mode },
    asset: {
      selected: current.asset.selected,
      reducedMotion: current.asset.reducedMotion,
    },
    character: current.character,
    hatLab: current.hatLab,
  })
}

export function applyExperimentToState(experiment: ExperimentV1): SandboxValues {
  let next = mergeSandboxPatch(
    createDefaultSandboxValues(),
    experiment.controls as DeepPartial<SandboxValues>,
  )
  next = setSandboxValue(next, 'workspace.mode', experiment.mode)

  if (experiment.subject.type === 'asset') {
    next = setSandboxValue(next, 'asset.selected', experiment.subject.source === 'local' ? 'local' : experiment.subject.assetId)
  } else if (experiment.subject.type === 'hat') {
    next = setSandboxValue(next, 'hatLab.selected', experiment.subject.assetId)
  } else if (experiment.subject.type === 'character') {
    next = setSandboxValue(next, 'character.portrait', experiment.subject.portraitId)
    next = setSandboxValue(next, 'character.eyeMode', experiment.subject.eyeIds.length > 1 ? 'individual' : 'paired')
    if (experiment.subject.eyeIds.length > 1) {
      next = setSandboxValue(next, 'character.leftEye', experiment.subject.eyeIds[0])
      next = setSandboxValue(next, 'character.rightEye', experiment.subject.eyeIds[1])
    } else {
      next = setSandboxValue(next, 'character.eyes', experiment.subject.eyeIds[0])
    }
    next = setSandboxValue(next, 'character.hand', experiment.subject.handId ?? 'none')
    next = setSandboxValue(next, 'character.hat', experiment.subject.hatId ?? 'none')
  } else {
    next = setSandboxValue(next, 'uiLab.category', experiment.subject.categoryId)
  }
  return next
}

export function applyExperimentToWorkspace(experiment: ExperimentV1): { values: SandboxValues; colliders: ColliderProfiles; hitboxes: HitboxProfiles } {
  return {
    values: applyExperimentToState(experiment),
    colliders: experiment.version === 2 ? experiment.colliders : {},
    hitboxes: experiment.version === 2 ? experiment.hitboxes : {},
  }
}

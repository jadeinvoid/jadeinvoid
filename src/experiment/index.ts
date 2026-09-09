import type { AssetDefinition, LocalAsset, WorkspaceMode } from '../types'
import type { DialConfig } from 'dialkit'
import { sandboxConfig, type SandboxValues } from '../config/controls'
import {
  migrateRetiredAssetId,
  migrateRetiredCharacterHatId,
  migrateRetiredCharacterSubjectHatId,
} from '../config/assetMigrations'
import { recoverColliderProfiles, validateColliderProfiles, type ColliderProfiles, type HitboxProfiles } from '../colliders/profiles'

export const EXPERIMENT_FORMAT = 'asset-motion-sandbox' as const
export const EXPERIMENT_VERSION = 2 as const
export const EXPERIMENT_LIBRARY_KEY = 'asset-motion-sandbox:experiments:v2'
export const EXPERIMENT_LIBRARY_V1_KEY = 'asset-motion-sandbox:experiments:v1'
const LEGACY_PRESET_KEY = 'asset-motion-sandbox:user-presets'

export type ExperimentSubject =
  | { type: 'asset'; source: 'registry'; assetId: string }
  | { type: 'asset'; source: 'local'; name: string; mediaType: string; requiresRelink: true }
  | { type: 'character'; portraitId: string; eyeIds: string[]; handId: string | null; hatId: string | null }
  | { type: 'hat'; assetId: string }
  | { type: 'ui'; categoryId: string }

interface ExperimentBase {
  format: typeof EXPERIMENT_FORMAT
  id: string
  name: string
  mode: WorkspaceMode
  subject: ExperimentSubject
  controls: Record<string, unknown>
  metadata: {
    createdAt: string
    updatedAt: string
    appVersion: string
  }
}

export interface LegacyExperimentV1 extends ExperimentBase {
  version: 1
}

export interface ExperimentV2 extends ExperimentBase {
  version: 2
  colliders: ColliderProfiles
  hitboxes: HitboxProfiles
}

/** Compatibility document type retained for existing consumers during the V2 transition. */
export type ExperimentV1 = LegacyExperimentV1 | ExperimentV2

export interface ExperimentLibraryV2 {
  format: 'asset-motion-sandbox-library'
  version: 2
  items: ExperimentV2[]
}

interface CreateExperimentInput {
  name: string
  values: SandboxValues
  activeAsset: AssetDefinition
  localAsset?: LocalAsset | null
  existing?: ExperimentV1
  colliders?: ColliderProfiles
  hitboxes?: HitboxProfiles
}

function createId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `experiment-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function toSerializableControls(values: SandboxValues): Record<string, unknown> {
  const { loadLocalFile: _loadLocalFile, ...asset } = values.asset
  const { replay: _replay, ...motion } = values.motion
  const { resetView: _resetView, ...scene } = values.scene
  const { dropStack: _dropStack, resetStack: _resetStack, ...hatLab } = values.hatLab
  const { openCategory: _openCategory, returnLanding: _returnLanding, ...uiLab } = values.uiLab

  return {
    workspace: values.workspace,
    asset,
    character: values.character,
    characterLayers: values.characterLayers,
    hatLab,
    uiLab,
    capCollider: values.capCollider,
    transform: values.transform,
    motion,
    spring: values.spring,
    scene,
    camera: values.camera,
    lighting: values.lighting,
  }
}

function createSubject(values: SandboxValues, activeAsset: AssetDefinition, localAsset?: LocalAsset | null): ExperimentSubject {
  const mode = values.workspace.mode as WorkspaceMode
  if (mode === 'character') {
    const eyeIds = values.character.eyeMode === 'paired'
      ? [values.character.eyes]
      : [values.character.leftEye, values.character.rightEye]
    return {
      type: 'character',
      portraitId: values.character.portrait,
      eyeIds,
      handId: values.character.hand === 'none' ? null : values.character.hand,
      hatId: values.character.hat === 'none' ? null : values.character.hat,
    }
  }
  if (mode === 'hat') return { type: 'hat', assetId: values.hatLab.selected }
  if (mode === 'ui') return { type: 'ui', categoryId: values.uiLab.category }
  if (values.asset.selected === 'local' && localAsset) {
    return {
      type: 'asset',
      source: 'local',
      name: localAsset.name,
      mediaType: localAsset.kind,
      requiresRelink: true,
    }
  }
  return { type: 'asset', source: 'registry', assetId: activeAsset.id }
}

export function createExperiment({ name, values, activeAsset, localAsset, existing, colliders, hitboxes }: CreateExperimentInput): ExperimentV2 {
  const now = new Date().toISOString()
  return {
    format: EXPERIMENT_FORMAT,
    version: EXPERIMENT_VERSION,
    id: existing?.id ?? createId(),
    name,
    mode: values.workspace.mode as WorkspaceMode,
    subject: createSubject(values, activeAsset, localAsset),
    controls: toSerializableControls(values),
    colliders: recoverColliderProfiles(colliders ?? (existing?.version === 2 ? existing.colliders : {})),
    hitboxes: recoverColliderProfiles(hitboxes ?? (existing?.version === 2 ? existing.hitboxes : {})),
    metadata: {
      createdAt: existing?.metadata.createdAt ?? now,
      updatedAt: now,
      appVersion: '0.2.0',
    },
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function validateTransition(value: unknown, path: string) {
  if (!isRecord(value)) throw new Error(`${path} must be a transition object.`)
  if (value.type === 'spring') {
    for (const key of ['stiffness', 'damping', 'mass', 'visualDuration', 'bounce']) {
      const item = value[key]
      if (item !== undefined && (typeof item !== 'number' || !Number.isFinite(item))) {
        throw new Error(`${path}.${key} must be a finite number.`)
      }
    }
    return { ...value, type: 'spring' }
  }
  if (value.type === 'easing') {
    if (typeof value.duration !== 'number' || !Number.isFinite(value.duration)) {
      throw new Error(`${path}.duration must be a finite number.`)
    }
    if (!Array.isArray(value.ease) || value.ease.length !== 4 || value.ease.some((item) => typeof item !== 'number' || !Number.isFinite(item))) {
      throw new Error(`${path}.ease must contain four finite numbers.`)
    }
    return { type: 'easing', duration: value.duration, ease: value.ease }
  }
  throw new Error(`${path} has an unsupported transition type.`)
}

function validateControls(input: unknown, config: DialConfig, path = 'controls'): Record<string, unknown> {
  if (!isRecord(input)) throw new Error(`${path} must be an object.`)
  const output: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(input)) {
    const definition = config[key]
    const controlPath = `${path}.${key}`
    if (definition === undefined || key === '_collapsed') throw new Error(`${controlPath} is not a recognized control.`)

    if (Array.isArray(definition)) {
      if (typeof value !== 'number' || !Number.isFinite(value)) throw new Error(`${controlPath} must be a finite number.`)
      if (value < definition[1] || value > definition[2]) throw new Error(`${controlPath} is outside its supported range.`)
      output[key] = value
      continue
    }
    if (typeof definition === 'boolean') {
      if (typeof value !== 'boolean') throw new Error(`${controlPath} must be a boolean.`)
      output[key] = value
      continue
    }
    if (typeof definition === 'number') {
      if (typeof value !== 'number' || !Number.isFinite(value)) throw new Error(`${controlPath} must be a finite number.`)
      output[key] = value
      continue
    }
    if (typeof definition === 'string') {
      if (typeof value !== 'string') throw new Error(`${controlPath} must be text.`)
      output[key] = value
      continue
    }
    if (!isRecord(definition)) throw new Error(`${controlPath} has an unsupported definition.`)

    const typedDefinition = definition as Record<string, unknown>
    if (typedDefinition.type === 'action') throw new Error(`${controlPath} is an action and cannot be imported.`)
    if (typedDefinition.type === 'select') {
      const options = (typedDefinition.options as Array<string | { value: string }>).map((option) => typeof option === 'string' ? option : option.value)
      if (typeof value !== 'string' || !options.includes(value)) throw new Error(`${controlPath} is not a supported option.`)
      output[key] = value
      continue
    }
    if (typedDefinition.type === 'color' || typedDefinition.type === 'text') {
      if (typeof value !== 'string') throw new Error(`${controlPath} must be text.`)
      output[key] = value
      continue
    }
    if (typedDefinition.type === 'spring' || typedDefinition.type === 'easing') {
      output[key] = validateTransition(value, controlPath)
      continue
    }
    output[key] = validateControls(value, definition as DialConfig, controlPath)
  }

  return output
}

export function validateSandboxControls(input: unknown) {
  return validateControls(input, sandboxConfig)
}

function migrateRetiredControlIds(controls: Record<string, unknown>) {
  const migrated = { ...controls }
  if (isRecord(controls.asset) && 'selected' in controls.asset) {
    migrated.asset = { ...controls.asset, selected: migrateRetiredAssetId(controls.asset.selected) }
  }
  if (isRecord(controls.character) && 'hat' in controls.character) {
    migrated.character = { ...controls.character, hat: migrateRetiredCharacterHatId(controls.character.hat) }
  }
  if (isRecord(controls.hatLab) && 'selected' in controls.hatLab) {
    migrated.hatLab = { ...controls.hatLab, selected: migrateRetiredAssetId(controls.hatLab.selected) }
  }
  return migrated
}

function stripLegacyActions(input: Record<string, unknown>, config: DialConfig): Record<string, unknown> {
  const output: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(input)) {
    const definition = config[key]
    if (definition === undefined || key === '_collapsed') continue
    if (isRecord(definition) && definition.type === 'action') continue
    if (isRecord(value) && isRecord(definition) && !('type' in definition)) {
      output[key] = stripLegacyActions(value, definition as DialConfig)
    } else {
      output[key] = value
    }
  }
  return output
}

export function parseExperiment(raw: string | unknown): ExperimentV2 {
  const value: unknown = typeof raw === 'string' ? JSON.parse(raw) : raw
  if (!isRecord(value) || value.format !== EXPERIMENT_FORMAT) {
    throw new Error('This file is not an Asset Motion Sandbox experiment.')
  }
  if (value.version !== 1 && value.version !== EXPERIMENT_VERSION) {
    throw new Error(`Unsupported experiment version: ${String(value.version)}`)
  }
  if (!['asset', 'character', 'hat', 'ui'].includes(String(value.mode))) {
    throw new Error('Experiment mode is invalid.')
  }
  if (typeof value.id !== 'string' || typeof value.name !== 'string' || !isRecord(value.controls)) {
    throw new Error('Experiment metadata or controls are incomplete.')
  }
  if (!isRecord(value.subject) || !isRecord(value.metadata)) {
    throw new Error('Experiment subject or metadata is incomplete.')
  }
  if (value.mode === 'asset') {
    if (value.subject.type !== 'asset' || !['registry', 'local'].includes(String(value.subject.source))) {
      throw new Error('Asset experiment subject is invalid.')
    }
    if (value.subject.source === 'registry' && typeof value.subject.assetId !== 'string') {
      throw new Error('Asset experiment is missing its registry ID.')
    }
    if (value.subject.source === 'local' && (
      typeof value.subject.name !== 'string'
      || typeof value.subject.mediaType !== 'string'
      || value.subject.requiresRelink !== true
    )) {
      throw new Error('Local asset experiment is missing relink metadata.')
    }
  }
  if (value.mode === 'hat' && (value.subject.type !== 'hat' || typeof value.subject.assetId !== 'string')) {
    throw new Error('Hat experiment subject is invalid.')
  }
  if (value.mode === 'ui' && (
    value.subject.type !== 'ui'
    || !['ux', 'illustration', 'visual', 'other'].includes(String(value.subject.categoryId))
  )) {
    throw new Error('UI experiment subject is invalid.')
  }
  if (value.mode === 'character' && (
    value.subject.type !== 'character'
    || typeof value.subject.portraitId !== 'string'
    || !Array.isArray(value.subject.eyeIds)
    || value.subject.eyeIds.length < 1
    || value.subject.eyeIds.length > 2
    || value.subject.eyeIds.some((id) => typeof id !== 'string')
    || (value.subject.handId !== null && typeof value.subject.handId !== 'string')
    || (value.subject.hatId !== null && typeof value.subject.hatId !== 'string')
  )) {
    throw new Error('Character experiment subject is invalid.')
  }
  const migratedControls = migrateRetiredControlIds(value.controls)
  const migratedSubject = {
    ...value.subject,
    ...((value.subject.type === 'asset' || value.subject.type === 'hat') && typeof value.subject.assetId === 'string'
      ? { assetId: migrateRetiredAssetId(value.subject.assetId) }
      : {}),
    ...(value.subject.type === 'character'
      ? { hatId: migrateRetiredCharacterSubjectHatId(value.subject.hatId) }
      : {}),
  }
  const controls = validateControls(migratedControls, sandboxConfig)
  const colliders = value.version === 2 ? validateColliderProfiles(value.colliders) : {}
  const hitboxes = value.version === 2
    ? validateColliderProfiles(value.hitboxes ?? value.colliders, 'hitboxes')
    : {}
  const modeControl = (controls.workspace as { mode?: unknown } | undefined)?.mode
  if (modeControl !== undefined && modeControl !== value.mode) {
    throw new Error('Experiment mode does not match its control state.')
  }
  return {
    ...value,
    version: EXPERIMENT_VERSION,
    subject: migratedSubject,
    controls,
    colliders,
    hitboxes,
  } as unknown as ExperimentV2
}

export function serializeExperiment(experiment: ExperimentV1) {
  return JSON.stringify(parseExperiment(experiment), null, 2)
}

function parseLibrary(raw: string): ExperimentV2[] | null {
  const library: unknown = JSON.parse(raw)
  if (!isRecord(library)
    || library.format !== 'asset-motion-sandbox-library'
    || (library.version !== 1 && library.version !== 2)
    || !Array.isArray(library.items)) return null
  return library.items.flatMap((item) => {
    try {
      return [parseExperiment(item)]
    } catch {
      return []
    }
  })
}

export function readExperimentLibrary(): ExperimentV1[] {
  try {
    const raw = localStorage.getItem(EXPERIMENT_LIBRARY_KEY)
    if (raw) return parseLibrary(raw) ?? []

    const previous = localStorage.getItem(EXPERIMENT_LIBRARY_V1_KEY)
    if (previous) {
      const migrated = parseLibrary(previous) ?? []
      writeExperimentLibrary(migrated)
      return migrated
    }
    return readLegacyPresets()
  } catch {
    return []
  }
}

function readLegacyPresets(): ExperimentV2[] {
  try {
    const legacy = JSON.parse(localStorage.getItem(LEGACY_PRESET_KEY) ?? '{}') as Record<string, Record<string, unknown>>
    return Object.entries(legacy).flatMap(([name, controls], index) => {
      try {
        const asset = controls.asset as { selected?: string } | undefined
        const migratedControls = validateControls({
          ...migrateRetiredControlIds(stripLegacyActions(controls, sandboxConfig)),
          workspace: { mode: 'asset' },
        }, sandboxConfig)
        const now = new Date().toISOString()
        return [{
          format: EXPERIMENT_FORMAT,
          version: EXPERIMENT_VERSION,
          id: `legacy-${index}-${name.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')}`,
          name,
          mode: 'asset' as const,
          subject: { type: 'asset' as const, source: 'registry' as const, assetId: migrateRetiredAssetId(asset?.selected ?? 'hat-cap-3d') as string },
          controls: migratedControls,
          colliders: {},
          hitboxes: {},
          metadata: { createdAt: now, updatedAt: now, appVersion: 'legacy' },
        }]
      } catch {
        return []
      }
    })
  } catch {
    return []
  }
}

export function writeExperimentLibrary(items: ExperimentV1[]) {
  const library: ExperimentLibraryV2 = {
    format: 'asset-motion-sandbox-library',
    version: 2,
    items: items.flatMap((item) => {
      try {
        return [parseExperiment(item)]
      } catch {
        return []
      }
    }),
  }
  localStorage.setItem(EXPERIMENT_LIBRARY_KEY, JSON.stringify(library))
}

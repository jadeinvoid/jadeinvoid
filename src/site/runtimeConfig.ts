import type { SandboxValues } from '../config/controls'
import { createDefaultSandboxValues } from '../state/sandboxState'

/**
 * The deliberately small contract shared by Studio previews and the public site.
 * Authoring-only controls must not cross this boundary.
 */
export type SiteRuntimeConfig = Pick<
  SandboxValues,
  'uiLab' | 'character' | 'characterLayers' | 'transform' | 'hatLab' | 'hitbox' | 'capCollider' | 'scene'
>

export function toSiteRuntimeConfig(values: SandboxValues): SiteRuntimeConfig {
  return structuredClone({
    uiLab: values.uiLab,
    character: values.character,
    characterLayers: values.characterLayers,
    transform: values.transform,
    hatLab: values.hatLab,
    hitbox: values.hitbox,
    capCollider: values.capCollider,
    scene: values.scene,
  })
}

export function createDefaultSiteRuntimeConfig(): SiteRuntimeConfig {
  return toSiteRuntimeConfig(createDefaultSandboxValues())
}

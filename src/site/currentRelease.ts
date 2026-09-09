import { WORK_LISTS } from '../figma-lab/workListData'
import type { SiteRelease } from './release'
import { SITE_RELEASE_FORMAT, SITE_RELEASE_VERSION } from './release'
import { createDefaultSiteRuntimeConfig } from './runtimeConfig'
import publishedRelease from './publishedRelease.json'
import siteAssets from '../../site-assets.json'

/**
 * Checked-in production release. Studio exports replace this data through the
 * reviewed publishing workflow; the public app never reads browser drafts.
 */
const bootstrapRelease: SiteRelease = {
  format: SITE_RELEASE_FORMAT,
  version: SITE_RELEASE_VERSION,
  id: 'bootstrap-release',
  createdAt: '2026-09-08T00:00:00.000Z',
  content: structuredClone(WORK_LISTS),
  runtime: createDefaultSiteRuntimeConfig(),
  colliders: {},
  hitboxes: {},
  timeline: { durationMs: 0, clips: [] },
  assets: [...siteAssets],
}

function isPublishedRelease(value: unknown): value is SiteRelease {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<SiteRelease>
  return candidate.format === SITE_RELEASE_FORMAT
    && candidate.version === SITE_RELEASE_VERSION
    && typeof candidate.id === 'string'
    && Boolean(candidate.content)
    && Boolean(candidate.runtime)
}

export const CURRENT_SITE_RELEASE = isPublishedRelease(publishedRelease)
  ? publishedRelease
  : bootstrapRelease

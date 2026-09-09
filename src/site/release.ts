import type { ColliderProfiles, HitboxProfiles } from '../colliders/profiles'
import type { SandboxValues } from '../config/controls'
import type { PortfolioContent } from '../portfolio/PortfolioContentContext'
import type { AnimationClip } from '../timeline/types'
import { toSiteRuntimeConfig, type SiteRuntimeConfig } from './runtimeConfig'
import baseSiteAssets from '../../site-assets.json'

export const SITE_RELEASE_FORMAT = 'choja-site-release' as const
export const SITE_RELEASE_VERSION = 1 as const

export interface SiteRelease {
  format: typeof SITE_RELEASE_FORMAT
  version: typeof SITE_RELEASE_VERSION
  id: string
  createdAt: string
  content: PortfolioContent
  runtime: SiteRuntimeConfig
  colliders: ColliderProfiles
  hitboxes: HitboxProfiles
  timeline: {
    durationMs: number
    clips: AnimationClip[]
  }
  assets: string[]
}

interface CreateSiteReleaseInput {
  content: PortfolioContent
  values: SandboxValues
  colliders?: ColliderProfiles
  hitboxes?: HitboxProfiles
  timeline?: { durationMs: number; clips: AnimationClip[] }
  now?: Date
}

function releaseId(date: Date) {
  return `release-${date.toISOString().replaceAll(/[-:.TZ]/g, '').slice(0, 14)}`
}

export function createSiteRelease({ content, values, colliders = {}, hitboxes = {}, timeline, now = new Date() }: CreateSiteReleaseInput): SiteRelease {
  const assets = new Set(baseSiteAssets)
  const addAsset = (source?: string) => {
    if (source?.startsWith('/')) assets.add(source.slice(1))
  }
  for (const work of Object.values(content)) {
    for (const project of work.projects) {
      for (const block of project.blocks) {
        if (block.type === 'image' || block.type === 'video') {
          addAsset(block.src)
          addAsset(block.thumbnailSrc)
          if (block.type === 'image') addAsset(block.fullSrc)
        }
      }
      for (const media of project.media) {
        if (media.type === 'image') {
          addAsset(media.src)
          addAsset(media.thumbnailSrc)
          addAsset(media.fullSrc)
        } else if (media.type === 'gallery') {
          media.images.forEach((image) => {
            addAsset(image.src)
            addAsset(image.thumbnailSrc)
            addAsset(image.fullSrc)
          })
        }
      }
    }
  }
  return {
    format: SITE_RELEASE_FORMAT,
    version: SITE_RELEASE_VERSION,
    id: releaseId(now),
    createdAt: now.toISOString(),
    content: structuredClone(content),
    runtime: toSiteRuntimeConfig(values),
    colliders: structuredClone(colliders),
    hitboxes: structuredClone(hitboxes),
    timeline: structuredClone(timeline ?? { durationMs: 0, clips: [] }),
    assets: [...assets].sort(),
  }
}

export function validateSiteRelease(release: SiteRelease): string[] {
  const errors: string[] = []
  const slugs = new Set<string>()
  const validateMediaSource = (projectSlug: string, mediaId: string, source?: string) => {
    if (source?.startsWith('data:')) errors.push(`${projectSlug}/${mediaId}: local media must be uploaded before publishing`)
  }

  if (!Array.isArray(release.assets) || !release.assets.length) errors.push('Release asset manifest is empty')

  for (const [category, work] of Object.entries(release.content)) {
    for (const project of work.projects) {
      if (!project.slug.trim()) errors.push(`${category}: a project is missing its slug`)
      if (slugs.has(project.slug)) errors.push(`Duplicate project slug: ${project.slug}`)
      slugs.add(project.slug)

      for (const block of project.blocks) {
        if (block.type === 'image' || block.type === 'video') validateMediaSource(project.slug, block.id, block.src)
      }
      for (const [index, media] of project.media.entries()) {
        if (media.type === 'image') validateMediaSource(project.slug, media.id ?? `media-${index}`, media.src)
        if (media.type === 'gallery') media.images.forEach((image, imageIndex) => {
          validateMediaSource(project.slug, `gallery-${index}-${imageIndex}`, image.src)
        })
      }
    }
  }

  return errors
}

export function serializeSiteRelease(release: SiteRelease) {
  return `${JSON.stringify(release, null, 2)}\n`
}

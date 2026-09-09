import { describe, expect, it } from 'vitest'
import { WORK_LISTS } from '../figma-lab/workListData'
import { createDefaultSandboxValues } from '../state/sandboxState'
import { createSiteRelease, validateSiteRelease } from './release'
import { toSiteRuntimeConfig } from './runtimeConfig'

describe('site release', () => {
  it('creates a deterministic, valid release envelope', () => {
    const release = createSiteRelease({
      content: structuredClone(WORK_LISTS),
      values: createDefaultSandboxValues(),
      now: new Date('2026-09-08T12:34:56.000Z'),
    })

    expect(release.id).toBe('release-20260908123456')
    expect(validateSiteRelease(release)).toEqual([])
    expect(release.runtime).not.toHaveProperty('workspace')
    expect(release.runtime).not.toHaveProperty('export')
    expect(release.timeline).toEqual({ durationMs: 0, clips: [] })
    expect(release.timeline).toEqual({ durationMs: 0, clips: [] })
  })

  it('blocks duplicate slugs and browser-local media', () => {
    const content = structuredClone(WORK_LISTS)
    content.ux.projects[0].slug = content.illustration.projects[0].slug
    content.ux.projects[0].blocks = [{
      id: 'local-image',
      type: 'image',
      src: 'data:image/png;base64,abc',
      alt: '',
      caption: '',
    }]
    const release = createSiteRelease({ content, values: createDefaultSandboxValues() })

    expect(validateSiteRelease(release)).toEqual(expect.arrayContaining([
      expect.stringContaining('Duplicate project slug'),
      expect.stringContaining('local media'),
    ]))
  })

  it('migrates the complete public runtime config and portfolio content', () => {
    const values = createDefaultSandboxValues()
    values.uiLab.frameColor = '#123456'
    values.hatLab.stackCount = 2
    const content = structuredClone(WORK_LISTS)
    content.ux.projects[0].summary = 'Published from the Content workspace.'

    const release = createSiteRelease({ content, values })

    expect(release.runtime).toEqual(toSiteRuntimeConfig(values))
    expect(release.content).toEqual(content)
    expect(release.content).not.toBe(content)
  })
})

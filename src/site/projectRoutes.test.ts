import { describe, expect, it } from 'vitest'
import { CURRENT_SITE_RELEASE } from './currentRelease'
import { createProjectRoutes } from './projectRoutes'

describe('public project routes', () => {
  it('uses actual published titles and resolves every new and legacy URL', () => {
    const content = CURRENT_SITE_RELEASE.content
    const routes = createProjectRoutes(content)
    const paths = new Set<string>()
    for (const work of Object.values(content)) {
      for (const project of work.projects) {
        const href = routes.href(project.slug)
        const slug = decodeURIComponent(href.split('?')[0].slice('/work/'.length))
        expect(slug).not.toBe(project.slug)
        expect(routes.find(slug)?.project).toBe(project)
        expect(routes.find(project.slug)?.project).toBe(project)
        paths.add(slug)
      }
    }
    expect(paths.size).toBe(Object.values(content).flatMap((work) => work.projects).length)
    expect(routes.href('making-complex-tools-feel-obvious')).toBe('/work/waypoint?category=ux')
    expect(decodeURIComponent(routes.href('characters-with-something-to-say')))
      .toBe('/work/천도제-reincarnation-2026?category=illustration')
    expect(routes.find('missing-project')).toBeNull()
  })

  it('handles duplicate titles and uses updated titles without changing internal IDs', () => {
    const content = structuredClone(CURRENT_SITE_RELEASE.content)
    const [first, second, third] = content.ux.projects
    first.title = 'A New Title!'
    second.title = 'A New Title!'
    third.title = 'A New Title 2'
    const routes = createProjectRoutes(content)
    expect(routes.href(first.slug)).toBe('/work/a-new-title?category=ux')
    expect(routes.href(second.slug)).toBe('/work/a-new-title-2?category=ux')
    expect(routes.href(third.slug)).toBe('/work/a-new-title-2-2?category=ux')
    expect(routes.find(first.slug)?.project).toBe(first)
  })
})

import { findWorkProject } from '../figma-lab/workListData'
import type { PortfolioContent } from '../portfolio/PortfolioContentContext'
import type { UiCategoryId } from '../ui-lab/categories'

export function createProjectRoutes(content: PortfolioContent) {
  // The stored slug is also used as an internal ID. Keep it stable while giving
  // public pages URLs based on their current titles, including non-Latin titles.
  const used = new Set<string>()
  const routes = Object.entries(content).flatMap(([category, work]) =>
    work.projects.map((project, index) => {
      const base = project.title.normalize('NFKC').toLowerCase()
        .replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '') || project.slug
      let slug = base
      let suffix = 2
      while (used.has(slug)) slug = `${base}-${suffix++}`
      used.add(slug)
      return { category: category as UiCategoryId, index, project, slug }
    }),
  )

  return {
    href(projectSlug: string) {
      const route = routes.find(({ project }) => project.slug === projectSlug)
      if (!route) throw new Error(`Unknown project: ${projectSlug}`)
      return `/work/${encodeURIComponent(route.slug)}?category=${route.category}`
    },
    find(slug: string) {
      return routes.find((route) => route.slug === slug) ?? findWorkProject(slug, content)
    },
  }
}

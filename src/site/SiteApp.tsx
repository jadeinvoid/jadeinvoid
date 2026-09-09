import { useEffect, useMemo, useState } from 'react'
import { FigmaLandingPage } from '../figma-lab/FigmaLandingPage'
import { FigmaMobileCategoryScreen } from '../figma-lab/FigmaMobileCategoryScreen'
import { FigmaMobileContact } from '../figma-lab/FigmaMobileContact'
import { FigmaMobileWorkList } from '../figma-lab/FigmaMobileWorkList'
import { FigmaProjectsWorkList } from '../figma-lab/FigmaProjectsWorkList'
import { FigmaWorkDetail } from '../figma-lab/FigmaWorkDetail'
import { findWorkProject, type WorkListProject } from '../figma-lab/workListData'
import { PortfolioContentProvider, usePortfolioContent } from '../portfolio/PortfolioContentContext'
import { uiCategories, type UiCategoryId } from '../ui-lab/categories'
import { resolveAssetClipState } from '../timeline/model'
import type { TimelinePreviewMap } from '../timeline/types'
import { CURRENT_SITE_RELEASE } from './currentRelease'

const CATEGORY_IDS = new Set(uiCategories.map((category) => category.id))
const IGNORE_CATEGORY_CHANGE = (_category: UiCategoryId) => undefined

function useMobileViewport() {
  const query = '(max-width: 640px)'
  const [mobile, setMobile] = useState(() => window.matchMedia(query).matches)

  useEffect(() => {
    const media = window.matchMedia(query)
    const update = () => setMobile(media.matches)
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  return mobile
}

export function normalizeSitePath(location: string) {
  // `navigate` receives an href (which may include search/hash), while the
  // popstate listener receives `window.location.pathname`. Keep one canonical
  // pathname for route matching so navigation behaves the same as a reload.
  const pathname = location.split(/[?#]/, 1)[0]
  const path = pathname.replace(/\/+$/, '')
  return path || '/'
}

/** Plays the authored Studio timeline once when the public landing page opens. */
function useReleaseTimeline(active: boolean, reduced: boolean) {
  const timeline = CURRENT_SITE_RELEASE.timeline
  const [currentTimeMs, setCurrentTimeMs] = useState(0)

  useEffect(() => {
    if (!active || reduced || !timeline.clips.length || timeline.durationMs <= 0) {
      setCurrentTimeMs(0)
      return
    }
    const startedAt = performance.now()
    let frame = 0
    const advance = (now: number) => {
      const elapsed = Math.min(timeline.durationMs, now - startedAt)
      setCurrentTimeMs(elapsed)
      if (elapsed < timeline.durationMs) frame = window.requestAnimationFrame(advance)
    }
    frame = window.requestAnimationFrame(advance)
    return () => window.cancelAnimationFrame(frame)
  }, [active, reduced, timeline])

  const preview = useMemo<TimelinePreviewMap>(() => Object.fromEntries(
    [...new Set(timeline.clips.map((clip) => clip.assetId))].map((assetId) => {
      const clip = timeline.clips.find((candidate) => candidate.assetId === assetId)!
      return [assetId, resolveAssetClipState(timeline.clips, assetId, currentTimeMs, clip.from)]
    }),
  ), [currentTimeMs, timeline])
  return { preview, isPlaying: active && !reduced && currentTimeMs < timeline.durationMs }
}

function SiteRouter() {
  const { content } = usePortfolioContent()
  const mobile = useMobileViewport()
  const [path, setPath] = useState(() => normalizeSitePath(window.location.pathname))
  const [replayKey] = useState(0)
  const release = CURRENT_SITE_RELEASE
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const releaseTimeline = useReleaseTimeline(path === '/', reduced)

  useEffect(() => {
    const update = () => setPath(normalizeSitePath(window.location.pathname))
    window.addEventListener('popstate', update)
    return () => window.removeEventListener('popstate', update)
  }, [])

  const navigate = (nextPath: string) => {
    const next = normalizeSitePath(nextPath)
    if (next !== path || `${window.location.pathname}${window.location.search}${window.location.hash}` !== nextPath) {
      window.history.pushState({}, '', nextPath)
    }
    setPath(next)
    window.scrollTo({ top: 0 })
  }

  const openProject = (category: UiCategoryId, project: WorkListProject) => {
    navigate(`/work/${encodeURIComponent(project.slug)}?category=${category}`)
  }

  const categoryMatch = path.match(/^\/projects\/([^/]+)$/)
  const routeCategory = categoryMatch && CATEGORY_IDS.has(categoryMatch[1] as UiCategoryId)
    ? categoryMatch[1] as UiCategoryId
    : 'ux'
  const workMatch = path.match(/^\/work\/([^/]+)$/)
  const workLocation = useMemo(
    () => workMatch ? findWorkProject(decodeURIComponent(workMatch[1]), content) : null,
    [content, path],
  )

  useEffect(() => {
    if (path !== '/contact' || mobile) return
    const frame = window.requestAnimationFrame(() => {
      document.querySelector('#figma-landing-contact')?.scrollIntoView()
    })
    return () => window.cancelAnimationFrame(frame)
  }, [mobile, path])

  if (workMatch && workLocation) {
    return <FigmaWorkDetail
      values={release.runtime}
      reduced={reduced}
      category={workLocation.category}
      project={workLocation.project}
      onNavigateLanding={() => navigate('/')}
      onBack={() => navigate(`/projects/${workLocation.category}`)}
      onContact={() => navigate('/contact')}
      onNavigateProjects={() => navigate('/projects')}
      onOpenProject={openProject}
      fieldNoteBreakpoint={mobile ? 'mobile' : 'desktop'}
      showCustomCursor={!mobile}
    />
  }

  if (path === '/contact' && mobile) {
    return <FigmaMobileContact
      values={release.runtime}
      reduced={reduced}
      replayKey={replayKey}
      onNavigateLanding={() => navigate('/')}
      onNavigateProjects={() => navigate('/projects')}
    />
  }

  if (path === '/projects' && mobile) {
    return <FigmaMobileCategoryScreen
      values={release.runtime}
      reduced={reduced}
      onBack={() => navigate('/')}
      onContact={() => navigate('/contact')}
      onSelectCategory={(category) => navigate(`/projects/${category}`)}
    />
  }

  if ((path === '/projects' || categoryMatch) && !mobile) {
    return <FigmaProjectsWorkList
      key={routeCategory}
      values={release.runtime}
      reduced={reduced}
      initialCategory={routeCategory}
      onNavigateLanding={() => navigate('/')}
      onBack={() => navigate('/')}
      onContact={() => navigate('/contact')}
      onCategoryChange={(category) => window.history.replaceState({}, '', `/projects/${category}`)}
      onOpenProject={openProject}
      showCustomCursor
    />
  }

  if (categoryMatch && mobile) {
    return <FigmaMobileWorkList
      key={routeCategory}
      values={release.runtime}
      reduced={reduced}
      category={routeCategory}
      onNavigateLanding={() => navigate('/')}
      onBack={() => navigate('/projects')}
      onContact={() => navigate('/contact')}
      onCategoryChange={(category) => navigate(`/projects/${category}`)}
      onOpenProject={openProject}
    />
  }

  if (path !== '/' && path !== '/contact') {
    return <main className="site-not-found"><p>404</p><h1>This page wandered off.</h1><button type="button" onClick={() => navigate('/')}>Back home</button></main>
  }

  return <FigmaLandingPage
    values={release.runtime}
    reduced={reduced}
    replayKey={replayKey}
    colliders={release.colliders}
    hitboxes={release.hitboxes}
    timelinePreview={releaseTimeline.preview}
    timelineIsPlaying={releaseTimeline.isPlaying}
    onCategoryChange={IGNORE_CATEGORY_CHANGE}
    onNavigateProjects={() => navigate('/projects')}
    onNavigateContact={() => navigate('/contact')}
    mobile={mobile}
    onOpenMobileWorkList={(category) => navigate(`/projects/${category}`)}
    onOpenProject={openProject}
  />
}

export function SiteApp() {
  return (
    <PortfolioContentProvider initialContent={CURRENT_SITE_RELEASE.content}>
      <div className="site-root" data-release={CURRENT_SITE_RELEASE.id}>
        <SiteRouter />
      </div>
    </PortfolioContentProvider>
  )
}

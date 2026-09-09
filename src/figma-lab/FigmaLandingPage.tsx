import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, type Transition } from 'motion/react'
import type { SiteRuntimeConfig } from '../site/runtimeConfig'
import { getColliderProfile, type ColliderProfiles, type HitboxProfiles } from '../colliders/profiles'
import type { TimelinePreviewMap } from '../timeline/types'
import { UiGravityHats } from '../ui-lab/UiGravityHats'
import { UiLabCharacter } from '../ui-lab/UiLabCharacter'
import { UiLabCursor } from '../ui-lab/UiLabCursor'
import { UiCap } from '../ui-lab/UiCap'
import { RoughFrame } from '../ui-lab/RoughFrame'
import { UiCharacterSpeechBubble } from '../ui-lab/UiCharacterSpeech'
import { getUiCategory, uiCategories, type UiCategoryId } from '../ui-lab/categories'
import { selectRandomProjectPreviews, type ProjectPreviewPosition } from '../ui-lab/projectPreviewLayout'
import { usePortfolioContent } from '../portfolio/PortfolioContentContext'
import { FigmaHatWorkListExtension, WORK_STAGE, WORK_TIMING } from './FigmaHatWorkListExtension'
import { FigmaHeaderLogo } from './FigmaHeaderLogo'
import { MOBILE_HAT_FLOAT } from './mobileHatFloat'
import { resolveFirstWorkCategoryThumbnail, resolveWorkProjectThumbnail, type WorkListProject } from './workListData'

/* ─────────────────────────────────────────────────────────
 * LANDING TEXT STORYBOARD
 *
 *    0ms   character starts 2cqw higher beneath the hat stack
 *  180ms   hat instruction rises 10px → 0 and fades in
 *  720ms   contact copy rises 14px → 0 and fades in
 *  hover   instruction fades out; enlarged previews step down above the expertise bubble
 *  scroll  character follows the viewport → portrait centers against the contact copy
 *  click   landing character translates left on x only; projects slide from right
 *  wide    1440px composition expands to 1728px; hats enter directly beneath the header
 *  mobile  four hats float only on the screen's vertical axis in 3.8–4.7s loops
 *  mobile  character remains centered; eye position stays neutral
 * ───────────────────────────────────────────────────────── */

const TIMING = {
  instruction: 180, // ms after mount before the hat instruction appears
  contact: 720, // ms after mount before the contact block appears
}

const TEXT = {
  instructionOffsetY: 10, // px the instruction rises from
  contactOffsetY: 14, // px the contact block rises from
}

const CHARACTER_SCROLL = {
  startLiftWidthRatio: 0.02, // portion of page width lifted toward the hat stack at scroll start
  referenceWidth: 1440, // keep the authored lift stable in ultra-wide viewports
}

const MOBILE_CHARACTER = {
  left: 'calc(50% - 150px)', // shifts the transparent-padded portrait 10px right for optical centering
  top: '322px', // preserves the previous visual center after scaling up
  size: '320px', // makes the transparent-padded portrait read clearly larger on mobile
}

const LANDING_CHARACTER_POSITION = {
  // This visual baseline persists into work so that transition is horizontal-only.
  left: 'var(--landing-character-left)',
  top: 'calc(45% + var(--landing-rig-offset-y))',
  width: '31%',
  x: 0,
}

export const CONTACT_LINKS = [
  { label: '/linkedin', href: 'https://www.linkedin.com/in/jadeyejincho/' },
  { label: '/github', href: 'https://github.com/jadeinvoid' },
  { label: '/artstation', href: 'https://www.artstation.com/jadeyejincho' },
  { label: '/itch.io', href: 'https://am-i-jade.itch.io/' },
] as const

const WORK_CHARACTER_POSITION = {
  // Keep the authored landing coordinates mounted; a measured x transform moves
  // this same portrait to the work rail without snapping between CSS variables.
  left: LANDING_CHARACTER_POSITION.left,
  top: LANDING_CHARACTER_POSITION.top,
  width: '31%',
}

const WORK_CHARACTER_SHIFT = {
  railWidthRatio: 0.2667, // mirrors the work grid's 26.67% left boundary
  opticalNudgeX: 20, // px rightward correction within the supporting rail
}

const EMPTY_TIMELINE_PREVIEW: TimelinePreviewMap = {}
const IGNORE_CATEGORY = (_category: UiCategoryId) => undefined
const IGNORE_HOVER_PRESENCE = (_present: boolean) => undefined

const LANDING_HAT_PHYSICS = {
  characterWidthRatio: 1,
  headYOffset: 0,
  cameraZoomReferenceWidth: 1725 * 0.31 * 1.13,
  spawnYOffset: 4.8,
}

const CATEGORY_PREVIEW = {
  reveal: 0, // ms after a hat hover before frames enter
  offsetY: 10, // px each frame rises from
  stagger: 0.055, // seconds between frame entrances
  stackStart: 1, // later thumbnails paint above earlier thumbnails as complete cards
  count: 3,
  slotSize: { width: 41.6, height: 58.8 },
  slots: [
    // Percentages use the collision-safe area to the right of the character rig.
    { left: 0, top: 2 },
    { left: 29.2, top: 12 },
    { left: 58.4, top: 22 },
  ],
}

function createCategoryPreviewPositions(): ProjectPreviewPosition[] {
  return CATEGORY_PREVIEW.slots.map((slot) => ({
    left: `${slot.left}%`,
    top: `${slot.top}%`,
    width: `${CATEGORY_PREVIEW.slotSize.width}%`,
    height: `${CATEGORY_PREVIEW.slotSize.height}%`,
  }))
}

interface FigmaLandingPageProps {
  values: SiteRuntimeConfig
  reduced: boolean
  replayKey: number
  colliders: ColliderProfiles
  hitboxes: HitboxProfiles
  timelinePreview: TimelinePreviewMap
  timelineIsPlaying: boolean
  onCategoryChange: (category: UiCategoryId) => void
  onNavigateProjects: () => void
  onNavigateContact?: () => void
  mobile?: boolean
  onOpenMobileWorkList?: (category: UiCategoryId) => void
  onOpenProject: (category: UiCategoryId, project: WorkListProject) => void
}

export function syncProjectPreviewThumbnailRatio(event: React.SyntheticEvent<HTMLImageElement>) {
  const image = event.currentTarget
  if (!image.naturalWidth || !image.naturalHeight) return

  const card = image.closest<HTMLElement>('.figma-landing-category-frame')
  if (!card) return

  const aspectRatio = image.naturalWidth / image.naturalHeight
  card.style.setProperty('--thumbnail-aspect-ratio', String(aspectRatio))
  card.style.setProperty('--thumbnail-aspect-ratio-inverse', String(1 / aspectRatio))
  card.classList.add('is-thumbnail-sized')
}

export function FigmaLandingPage({
  values,
  reduced,
  replayKey,
  colliders,
  hitboxes,
  timelinePreview,
  timelineIsPlaying,
  onCategoryChange,
  onNavigateProjects,
  onNavigateContact,
  mobile = false,
  onOpenMobileWorkList,
  onOpenProject,
}: FigmaLandingPageProps) {
  const { content } = usePortfolioContent()
  const pageRef = useRef<HTMLElement>(null)
  const mobileUxCategoryRef = useRef<HTMLButtonElement>(null)
  const [stage, setStage] = useState(reduced ? 2 : 0)
  const [hoveredCategory, setHoveredCategory] = useState<UiCategoryId | null>(null)
  const [previewProjectSlugs, setPreviewProjectSlugs] = useState<string[]>([])
  const [previewStage, setPreviewStage] = useState(0)
  const [workCategory, setWorkCategory] = useState<UiCategoryId | null>(null)
  const [workStage, setWorkStage] = useState(0)
  const [workCharacterShiftX, setWorkCharacterShiftX] = useState(0)
  const previousWorkCategory = useRef<UiCategoryId | null>(null)
  const workExitTarget = useRef<'landing' | 'contact' | null>(null)
  const previewPositions = useMemo(
    () => hoveredCategory ? createCategoryPreviewPositions() : [],
    [hoveredCategory],
  )
  const previewProjects = hoveredCategory
    ? previewProjectSlugs.map((slug) => content[hoveredCategory].projects.find((project) => project.slug === slug))
    : []
  const expertise = hoveredCategory ? content[hoveredCategory].explanation : null
  const workPresentationActive = workCategory !== null && workStage !== WORK_STAGE.exiting
  const hatTimelinePreview = useMemo(() => {
    const entries = Object.entries(timelinePreview).filter(([assetId]) => assetId.startsWith('hat:'))
    return entries.length ? Object.fromEntries(entries) : EMPTY_TIMELINE_PREVIEW
  }, [timelinePreview])
  const transition: Transition = reduced ? { duration: 0 } : values.uiLab.transition as Transition
  const stroke = {
    frequency: values.uiLab.strokeFrequency,
    wiggle: values.uiLab.strokeWiggle,
    smoothen: values.uiLab.strokeSmoothen,
  }

  useEffect(() => {
    if (reduced) {
      setStage(2)
      return
    }
    setStage(0)
    const timers = [
      window.setTimeout(() => setStage(1), TIMING.instruction),
      window.setTimeout(() => setStage(2), TIMING.contact),
    ]
    return () => timers.forEach(window.clearTimeout)
  }, [reduced, replayKey])

  useEffect(() => {
    if (!hoveredCategory) {
      setPreviewStage(0)
      return
    }
    setPreviewStage(0)
    const timer = window.setTimeout(() => setPreviewStage(1), reduced ? 0 : CATEGORY_PREVIEW.reveal)
    return () => window.clearTimeout(timer)
  }, [hoveredCategory, reduced])

  useEffect(() => {
    setHoveredCategory(null)
    setWorkCategory(null)
    setWorkStage(0)
    workExitTarget.current = null
  }, [replayKey])

  useEffect(() => {
    const previousCategory = previousWorkCategory.current
    previousWorkCategory.current = workCategory
    if (!workCategory) {
      setWorkStage(0)
      return
    }
    if (previousCategory !== null) {
      setWorkStage(WORK_STAGE.panel)
      return
    }
    if (reduced) {
      setWorkStage(WORK_STAGE.panel)
      return
    }
    setWorkStage(0)
    const timers = [
      window.setTimeout(() => setWorkStage(WORK_STAGE.character), WORK_TIMING.characterShift),
      window.setTimeout(() => setWorkStage(WORK_STAGE.hats), WORK_TIMING.hatScatter),
      window.setTimeout(() => setWorkStage(WORK_STAGE.panel), WORK_TIMING.panelReveal),
    ]
    return () => timers.forEach(window.clearTimeout)
  }, [reduced, workCategory])

  useEffect(() => {
    const page = pageRef.current
    const scroller = page?.closest<HTMLElement>('.figma-preview-pane, .site-root')
    const characterScroll = page?.querySelector<HTMLElement>('.figma-landing-character-scroll')
    const character = page?.querySelector<HTMLElement>('.ui-character')
    const portraitHitbox = character?.querySelector<SVGPolygonElement>('.ui-character-hitbox polygon')
    if (!page || !scroller || !characterScroll || !character || !portraitHitbox) return

    if (workCategory) {
      scroller.scrollTop = 0
      // Preserve the landing pose's optical lift so the work storyboard changes
      // only x; clearing this offset would introduce a visible downward jump.
      const startLift = Math.min(page.getBoundingClientRect().width, CHARACTER_SCROLL.referenceWidth)
        * CHARACTER_SCROLL.startLiftWidthRatio
      characterScroll.style.setProperty('transform', `translate3d(0, ${-startLift}px, 0)`)
      return
    }

    const contact = page.querySelector<HTMLElement>('.figma-landing-contact')
    if (!contact) return

    let currentOffset = 0
    const syncCharacterToScroll = () => {
      const pageBounds = page.getBoundingClientRect()
      const hitboxBounds = portraitHitbox.getBoundingClientRect()
      const contactBounds = contact.getBoundingClientRect()
      const startLift = Math.min(pageBounds.width, CHARACTER_SCROLL.referenceWidth)
        * CHARACTER_SCROLL.startLiftWidthRatio
      const characterVisualTop = hitboxBounds.top - pageBounds.top - currentOffset - startLift
      const contactTop = contactBounds.top - pageBounds.top
      const centeredContactTop = contactTop + (contactBounds.height - hitboxBounds.height) / 2
      const dockTop = Math.min(centeredContactTop, pageBounds.height - hitboxBounds.height)
      const dockingDistance = Math.max(0, dockTop - characterVisualTop)
      const scrollRange = Math.max(scroller.scrollHeight - scroller.clientHeight, Number.EPSILON)
      const scrollProgress = Math.min(scroller.scrollTop / scrollRange, 1)
      const scrollOffset = dockingDistance <= scrollRange
        ? Math.min(scroller.scrollTop, dockingDistance)
        : dockingDistance * scrollProgress
      currentOffset = scrollOffset - startLift
      characterScroll.style.setProperty('transform', `translate3d(0, ${currentOffset}px, 0)`)
    }

    const resizeObserver = new ResizeObserver(syncCharacterToScroll)
    resizeObserver.observe(page)
    scroller.addEventListener('scroll', syncCharacterToScroll, { passive: true })
    window.addEventListener('resize', syncCharacterToScroll)
    syncCharacterToScroll()
    return () => {
      resizeObserver.disconnect()
      scroller.removeEventListener('scroll', syncCharacterToScroll)
      window.removeEventListener('resize', syncCharacterToScroll)
      characterScroll.style.removeProperty('transform')
    }
  }, [workCategory, mobile])

  useEffect(() => {
    if (!workCategory) return
    const page = pageRef.current
    const character = page?.querySelector<HTMLElement>('.figma-landing-animation .ui-character')
    if (!page || !character) return

    const syncHorizontalShift = () => {
      const targetLeft = (page.clientWidth * WORK_CHARACTER_SHIFT.railWidthRatio - character.offsetWidth) / 2
        + WORK_CHARACTER_SHIFT.opticalNudgeX
      setWorkCharacterShiftX(targetLeft - character.offsetLeft)
    }
    const resizeObserver = new ResizeObserver(syncHorizontalShift)
    resizeObserver.observe(page)
    syncHorizontalShift()
    return () => resizeObserver.disconnect()
  }, [workCategory])

  const activateCategory = useCallback((category: UiCategoryId) => {
    const page = pageRef.current
    const character = page?.querySelector<HTMLElement>('.figma-landing-animation .ui-character')
    if (page && character) {
      const targetLeft = (page.clientWidth * WORK_CHARACTER_SHIFT.railWidthRatio - character.offsetWidth) / 2
        + WORK_CHARACTER_SHIFT.opticalNudgeX
      setWorkCharacterShiftX(targetLeft - character.offsetLeft)
    }
    onCategoryChange(category)
    setHoveredCategory(null)
    workExitTarget.current = null
    setWorkCategory(category)
  }, [onCategoryChange])

  const changeHoveredCategory = useCallback((category: UiCategoryId | null) => {
    if (category && category !== hoveredCategory) {
      setPreviewProjectSlugs(selectRandomProjectPreviews(
        content[category].projects,
        CATEGORY_PREVIEW.count,
      ).map((project) => project.slug))
    }
    setHoveredCategory(category)
  }, [content, hoveredCategory])

  const beginWorkExit = (target: 'landing' | 'contact') => {
    if (!workCategory || workStage === WORK_STAGE.exiting) return
    workExitTarget.current = target
    setWorkStage(WORK_STAGE.exiting)
  }

  const completeWorkExit = () => {
    const target = workExitTarget.current
    setWorkCategory(null)
    setWorkStage(WORK_STAGE.idle)
    workExitTarget.current = null
    if (target === 'contact') {
      window.requestAnimationFrame(() => pageRef.current?.querySelector('#figma-landing-contact')?.scrollIntoView())
    }
  }

  const scrollToMobileWork = () => {
    const page = pageRef.current
    const target = mobileUxCategoryRef.current
    const scroller = page?.closest<HTMLElement>('.figma-preview-pane')
    const header = page?.querySelector<HTMLElement>('.figma-landing-header-wrap')
    if (!target || !scroller || !header) return

    scroller.scrollTo({
      top: scroller.scrollTop
        + target.getBoundingClientRect().top
        - scroller.getBoundingClientRect().top
        - header.getBoundingClientRect().height,
      behavior: reduced ? 'auto' : 'smooth',
    })
  }

  if (mobile) {
    return (
      <main ref={pageRef} className="figma-landing-page figma-mobile-landing-page" data-figma-node="118:22" data-view="landing">
        <div className="figma-mobile-landing-header-spacer" aria-hidden="true" />
        <header className="figma-landing-header-wrap">
          <RoughFrame className="figma-landing-header" color={values.uiLab.frameColor} {...stroke}>
            <FigmaHeaderLogo disabled />
            <nav aria-label="Landing navigation">
              <button type="button" onClick={onNavigateProjects}>Projects</button>
              <a href="/contact" onClick={(event) => { event.preventDefault(); onNavigateContact?.() }}>Contact</a>
            </nav>
          </RoughFrame>
        </header>
        <div className="figma-mobile-landing-header-gap" aria-hidden="true" />

        <section className="figma-mobile-landing-hero">
          <div className="figma-mobile-landing-hats" aria-hidden="true">
            {uiCategories.map((category) => (
              <motion.span
                key={category.id}
                className={`figma-mobile-landing-hat ${category.id}`}
                animate={reduced ? { y: 0 } : {
                  y: [0, -MOBILE_HAT_FLOAT[category.id].y, 0, MOBILE_HAT_FLOAT[category.id].y * 0.35, 0],
                }}
                transition={reduced ? { duration: 0 } : {
                  duration: MOBILE_HAT_FLOAT[category.id].duration,
                  delay: MOBILE_HAT_FLOAT[category.id].delay,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <span className="figma-mobile-landing-hat-art">
                  {category.hat.kind === 'model' ? <UiCap animateYSpin={!reduced} modelScale={1.173} spinSpeed={0.5} /> : <img src={category.hat.src} alt="" />}
                </span>
              </motion.span>
            ))}
          </div>
          <p className="figma-mobile-landing-intro">Hello, my name is Jade Cho.<br />I am a creative builder<br />wearing many hats!</p>
          <div className="figma-mobile-landing-character ui-lab-stage" style={{ '--ui-bg': '#fff', '--ui-pink': values.uiLab.frameColor } as React.CSSProperties}>
            <UiLabCharacter
              screen="landing"
              positionOverride={{ left: MOBILE_CHARACTER.left, top: MOBILE_CHARACTER.top, width: MOBILE_CHARACTER.size }}
              transition={transition}
              values={values}
              reduced={reduced}
              replayKey={replayKey}
              timelinePreview={timelinePreview}
              timelineIsPlaying={timelineIsPlaying}
              hitbox={getColliderProfile('portrait', hitboxes)!}
              showHitbox={values.hitbox.showOverlay}
              speechBubbleOpen={false}
              onSpeechBubbleToggle={() => undefined}
              cursorFollowEnabled={false}
              forceTimedHandWave
            />
          </div>
          <div className="figma-mobile-landing-prompt">
            <p>Tap on the thumbnails to see more work</p>
            <button type="button" aria-label="Scroll to UX Design" onClick={scrollToMobileWork}>›</button>
          </div>
        </section>

        <section className="figma-mobile-landing-categories" aria-label="Work categories">
          {uiCategories.map((category) => {
            const thumbnail = resolveFirstWorkCategoryThumbnail(content[category.id].projects)
            return (
              <button
                ref={category.id === 'ux' ? mobileUxCategoryRef : undefined}
                type="button"
                key={category.id}
                onClick={() => onOpenMobileWorkList?.(category.id)}
                aria-label={`View ${category.label} work`}
              >
                <span>{category.label}</span>
                <RoughFrame color={values.uiLab.frameColor} {...stroke}>
                  {thumbnail && <img src={thumbnail.thumbnailSrc ?? thumbnail.src} alt="" />}
                </RoughFrame>
              </button>
            )
          })}
        </section>
      </main>
    )
  }

  return (
    <main ref={pageRef} className="figma-landing-page" data-figma-node="1:3" data-view={workCategory ? 'work' : 'landing'}>
      <UiLabCursor stageRef={pageRef} reduced={reduced} />
      <header className="figma-landing-header-wrap">
        <RoughFrame className="figma-landing-header" color={values.uiLab.frameColor} {...stroke}>
          <FigmaHeaderLogo
            disabled={!workCategory}
            onNavigateLanding={() => beginWorkExit('landing')}
          />
          <nav aria-label="Landing navigation">
            <button type="button" onClick={onNavigateProjects}>Projects</button>
            <a
              href="#figma-landing-contact"
              onClick={(event) => {
                if (onNavigateContact) {
                  event.preventDefault()
                  onNavigateContact()
                  return
                }
                if (!workCategory) return
                event.preventDefault()
                beginWorkExit('contact')
              }}
            >Contact</a>
          </nav>
        </RoughFrame>
      </header>

      <section className="figma-landing-hero">
        <AnimatePresence>
          {hoveredCategory && !workCategory && (
            <motion.section
              key={hoveredCategory}
              className="figma-landing-category-preview"
              data-category={hoveredCategory}
              aria-label={`${getUiCategory(hoveredCategory).label} project previews`}
              exit={{ opacity: 0 }}
              transition={transition}
            >
              {previewPositions.map((frame, index) => {
                const project = previewProjects[index]
                const thumbnail = project ? resolveWorkProjectThumbnail(project) : null
                return (
                  <motion.article
                    key={`${hoveredCategory}-${project?.slug ?? `empty-${index}`}`}
                    className={`figma-landing-category-frame${thumbnail ? ' has-thumbnail' : ''}`}
                    aria-label={project?.title ?? 'Empty project preview'}
                    style={{ ...frame, zIndex: CATEGORY_PREVIEW.stackStart + index }}
                    initial={false}
                    animate={{
                      opacity: previewStage >= 1 ? 1 : 0,
                      y: previewStage >= 1 ? 0 : CATEGORY_PREVIEW.offsetY,
                    }}
                    transition={{ ...transition, delay: reduced ? 0 : index * CATEGORY_PREVIEW.stagger }}
                  >
                    <RoughFrame color={values.uiLab.frameColor} {...stroke}>
                      {thumbnail && (
                        <img
                          className="figma-landing-category-thumbnail"
                          src={thumbnail.thumbnailSrc ?? thumbnail.src}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          onLoad={syncProjectPreviewThumbnailRatio}
                        />
                      )}
                    </RoughFrame>
                  </motion.article>
                )
              })}
            </motion.section>
          )}
        </AnimatePresence>

        <div
          className="figma-landing-animation ui-lab-stage"
          style={{ '--ui-bg': '#fff', '--ui-pink': values.uiLab.frameColor } as React.CSSProperties}
        >
          <div className="figma-landing-character-scroll">
            <UiLabCharacter
              screen={workPresentationActive && workStage >= WORK_STAGE.character ? 'work' : 'landing'}
              positionOverride={workPresentationActive && workStage >= WORK_STAGE.character
                ? { ...WORK_CHARACTER_POSITION, x: workCharacterShiftX }
                : LANDING_CHARACTER_POSITION}
              transition={transition}
              values={values}
              reduced={reduced}
              replayKey={replayKey}
              timelinePreview={timelinePreview}
              timelineIsPlaying={timelineIsPlaying}
              hitbox={getColliderProfile('portrait', hitboxes)!}
              showHitbox={values.hitbox.showOverlay}
              speechBubbleOpen={!workCategory && hoveredCategory !== null}
              onSpeechBubbleToggle={() => undefined}
            />
          </div>
          <UiGravityHats
            values={values}
            colliders={colliders}
            hitboxes={hitboxes}
            reduced={reduced}
            replayKey={replayKey}
            timelinePreview={hatTimelinePreview}
            selectedCategory={workPresentationActive ? workCategory : undefined}
            selectedCharacterWidthRatio={LANDING_HAT_PHYSICS.characterWidthRatio}
            selectedHeadYOffset={LANDING_HAT_PHYSICS.headYOffset}
            cameraZoomReferenceWidth={LANDING_HAT_PHYSICS.cameraZoomReferenceWidth}
            spawnYOffset={LANDING_HAT_PHYSICS.spawnYOffset}
            isolateHovered={!workPresentationActive}
            onPreview={workCategory ? IGNORE_CATEGORY : onCategoryChange}
            onHoverPresenceChange={IGNORE_HOVER_PRESENCE}
            onHoverCategoryChange={workCategory ? undefined : changeHoveredCategory}
            onActivate={workCategory ? () => undefined : activateCategory}
          />
          <AnimatePresence>
            {hoveredCategory && expertise && !workCategory && (
              <UiCharacterSpeechBubble
                key={hoveredCategory}
                className="figma-landing-expertise-bubble"
                color={values.uiLab.frameColor}
                stroke={stroke}
                reduced={reduced}
                content="intro"
                introTitle=""
                introBody={expertise}
                cornerRadius={40}
              />
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {!hoveredCategory && !workCategory && (
            <motion.p
              key="hat-instruction"
              className="figma-landing-instruction"
              initial={false}
              animate={{
                opacity: stage >= 1 ? 1 : 0,
                y: stage >= 1 ? 0 : TEXT.instructionOffsetY,
              }}
              exit={{ opacity: 0, y: TEXT.instructionOffsetY }}
              transition={transition}
            >
              Click on the hats to see my work
            </motion.p>
          )}
        </AnimatePresence>
      </section>

      <AnimatePresence>
        {workCategory
          ? <FigmaHatWorkListExtension
              values={values}
              reduced={reduced}
              category={workCategory}
              stage={workStage}
              transition={transition}
              onBack={() => beginWorkExit('landing')}
              onOpenProject={onOpenProject}
              onSelectCategory={activateCategory}
              onExitComplete={completeWorkExit}
            />
          : <motion.section
              key="contact"
              id="figma-landing-contact"
              className="figma-landing-contact"
              initial={false}
              animate={{ opacity: stage >= 2 ? 1 : 0, y: stage >= 2 ? 0 : TEXT.contactOffsetY }}
              transition={transition}
            >
              <h1>Open to collaboration and curious conversations.</h1>
              <p>I’m currently looking for work in Canada.<br />If you’re interested in working with me, please don’t hesitate to get in touch!</p>
              <a className="figma-landing-email" href="mailto:hello@choja.design">hello@choja.design</a>
              <div className="figma-landing-social" aria-label="Social profiles">
                {CONTACT_LINKS.map(({ label, href }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer">{label}</a>
                ))}
              </div>
            </motion.section>}
      </AnimatePresence>
    </main>
  )
}

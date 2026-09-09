import { useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, type Transition } from 'motion/react'
import type { SiteRuntimeConfig } from '../site/runtimeConfig'
import { RoughFrame } from '../ui-lab/RoughFrame'
import { UiCap } from '../ui-lab/UiCap'
import { UiLabCursor } from '../ui-lab/UiLabCursor'
import { uiCategories, type UiCategoryId } from '../ui-lab/categories'
import { WORK_HAT_INTERACTION } from './workHatInteraction'
import { resolveWorkProjectThumbnail, type WorkListProject } from './workListData'
import { FigmaWorkProjectArt } from './FigmaWorkProjectArt'
import { FigmaHeaderLogo } from './FigmaHeaderLogo'
import { usePortfolioContent } from '../portfolio/PortfolioContentContext'

/* ─────────────────────────────────────────────────────────
 * CATEGORY HAT INTERACTION
 *
 *  rest   every unselected hat shares one clipped x-position
 *  click  selected hat glides to the measured left edge of its label
 *  hover  hat wobbles ±2.25deg without interrupting its sideways movement
 * ───────────────────────────────────────────────────────── */

const PATH_TWO_LABELS: Record<UiCategoryId, string> = {
  ux: 'UX Design',
  illustration: 'Illustration',
  visual: 'Visual Design',
  other: 'Others',
}

const PATH_TWO_HOVER_SHIFT_X = 18
const PATH_TWO_WOBBLE_ANGLE = 4

interface FigmaProjectsWorkListProps {
  values: SiteRuntimeConfig
  reduced: boolean
  initialCategory?: UiCategoryId
  onNavigateLanding?: () => void
  onBack: () => void
  onContact: () => void
  onCategoryChange: (category: UiCategoryId) => void
  onOpenProject: (category: UiCategoryId, project: WorkListProject) => void
  showCustomCursor?: boolean
}

export function FigmaProjectsWorkList({
  values,
  reduced,
  initialCategory = 'ux',
  onNavigateLanding,
  onBack,
  onContact,
  onCategoryChange,
  onOpenProject,
  showCustomCursor = true,
}: FigmaProjectsWorkListProps) {
  const pageRef = useRef<HTMLElement>(null)
  const { content } = usePortfolioContent()
  const categoryRailRef = useRef<HTMLElement>(null)
  const selectionRunRef = useRef(0)
  const [category, setCategory] = useState<UiCategoryId>(initialCategory)
  const [hoveredCategory, setHoveredCategory] = useState<UiCategoryId | null>(null)
  const [selectedAnimation, setSelectedAnimation] = useState<{ id: UiCategoryId; run: number } | null>(null)
  const work = content[category]
  const transition: Transition = reduced ? { duration: 0 } : { duration: 0.2, ease: 'easeOut' }
  const stroke = {
    frequency: values.uiLab.strokeFrequency,
    wiggle: values.uiLab.strokeWiggle,
    smoothen: values.uiLab.strokeSmoothen,
  }
  const selectCategory = (nextCategory: UiCategoryId) => {
    setHoveredCategory(null)
    selectionRunRef.current += 1
    setSelectedAnimation({ id: nextCategory, run: selectionRunRef.current })
    if (nextCategory === category) return
    setCategory(nextCategory)
    onCategoryChange(nextCategory)
  }

  useLayoutEffect(() => {
    const rail = categoryRailRef.current
    if (!rail) return
    const buttons = [...rail.querySelectorAll<HTMLElement>('.figma-projects-work-category')]
    const syncSelectedHatEdges = () => buttons.forEach((button) => {
      const label = button.querySelector<HTMLElement>('.figma-projects-work-category-label-copy')
      if (!label) return
      const buttonBounds = button.getBoundingClientRect()
      const labelBounds = label.getBoundingClientRect()
      button.style.setProperty('--path-two-hat-selected-x', `${labelBounds.left - buttonBounds.left}px`)
    })
    const resizeObserver = new ResizeObserver(syncSelectedHatEdges)
    buttons.forEach((button) => {
      resizeObserver.observe(button)
      const label = button.querySelector<HTMLElement>('.figma-projects-work-category-label-copy')
      if (label) resizeObserver.observe(label)
    })
    syncSelectedHatEdges()
    document.fonts?.ready.then(syncSelectedHatEdges)
    return () => resizeObserver.disconnect()
  }, [])

  return (
    <main
      ref={pageRef}
      className="figma-landing-page figma-projects-work-page"
      data-figma-node="107:397"
      data-category={category}
      data-view="projects-work"
    >
      {showCustomCursor && <UiLabCursor stageRef={pageRef} reduced={reduced} />}
      <header className="figma-landing-header-wrap">
        <RoughFrame className="figma-landing-header" color={values.uiLab.frameColor} {...stroke}>
          <FigmaHeaderLogo onNavigateLanding={onNavigateLanding} />
          <nav aria-label="Projects navigation">
            <span aria-current="page">Projects</span>
            <button type="button" onClick={onContact}>Contact</button>
          </nav>
        </RoughFrame>
      </header>

      <section className="figma-projects-work-layout">
        <div className="figma-projects-work-controls">
          <button type="button" className="figma-projects-work-back" onClick={onBack}>← back</button>

          <nav ref={categoryRailRef} className="figma-projects-work-categories" aria-label="Work categories">
            {uiCategories.map((item) => {
              const active = item.id === category
              const floating = hoveredCategory === item.id && !reduced
              const selectionWobble = selectedAnimation?.id === item.id && !reduced
              const selectionDirection = selectionWobble && selectedAnimation?.run % 2 === 0 ? -1 : 1
              const modelHat = item.hat.kind === 'model'
              const wobbling = floating || selectionWobble
              return (
                <motion.button
                  type="button"
                  className={`figma-projects-work-category category-${item.id}${active ? ' active' : ''}`}
                  key={item.id}
                  aria-pressed={active}
                  onClick={() => selectCategory(item.id)}
                  onHoverStart={() => setHoveredCategory(item.id)}
                  onHoverEnd={() => setHoveredCategory(null)}
                  onFocus={() => setHoveredCategory(item.id)}
                  onBlur={() => setHoveredCategory(null)}
                  whileTap={reduced ? undefined : WORK_HAT_INTERACTION.press}
                >
                  <span className="figma-projects-work-category-label"><span className="figma-projects-work-category-label-copy">{PATH_TWO_LABELS[item.id]}</span></span>
                  <motion.span
                    className="figma-projects-work-hat"
                    aria-hidden="true"
                    initial={false}
                    animate={{
                      x: floating && !active ? -PATH_TWO_HOVER_SHIFT_X : 0,
                      y: 0,
                      rotate: wobbling
                        ? [
                            0,
                            PATH_TWO_WOBBLE_ANGLE * selectionDirection,
                            0,
                            -PATH_TWO_WOBBLE_ANGLE * selectionDirection,
                            0,
                          ]
                        : 0,
                    }}
                    transition={wobbling
                      ? {
                          x: { duration: 0.18, ease: 'easeOut' },
                          rotate: {
                            duration: WORK_HAT_INTERACTION.wobbleDuration,
                            repeat: floating ? Infinity : 0,
                            ease: 'easeInOut',
                          },
                        }
                      : modelHat
                        ? { duration: 0 }
                        : WORK_HAT_INTERACTION.spring}
                    onAnimationComplete={() => {
                      if (!floating && selectedAnimation?.id === item.id) {
                        const completedRun = selectedAnimation.run
                        setSelectedAnimation((current) => current?.id === item.id && current.run === completedRun ? null : current)
                      }
                    }}
                  >
                    {item.hat.kind === 'image'
                      ? <img src={item.hat.src} alt="" />
                      : <UiCap modelScale={1.53} />}
                  </motion.span>
                </motion.button>
              )
            })}
          </nav>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.h1
            className="figma-projects-work-title"
            key={`title-${category}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={transition}
          >
            {PATH_TWO_LABELS[category]}
          </motion.h1>
        </AnimatePresence>

        <section className="figma-projects-work-grid" aria-label={`${PATH_TWO_LABELS[category]} projects`}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              className="figma-projects-work-grid-content"
              key={category}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={transition}
            >
              {[0, 1, 2, 3].map((row) => (
                <div className={`figma-projects-work-row row-${row + 1}`} key={row}>
                  {work.projects.slice(row * 2, row * 2 + 2).map((project, index) => {
                    const projectIndex = row * 2 + index
                    const thumbnail = resolveWorkProjectThumbnail(project)
                    return (
                      <motion.article
                        className="figma-projects-work-project"
                        key={project.title}
                        initial={reduced ? false : { opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={reduced ? { duration: 0 } : { ...transition, delay: projectIndex * values.uiLab.projectStagger }}
                      >
                        <RoughFrame color={values.uiLab.frameColor} {...stroke}>
                          <FigmaWorkProjectArt index={projectIndex} thumbnail={thumbnail} />
                          <div className="figma-projects-work-project-copy" style={{ background: 'var(--work-card-copy-background, #eee9e1)' }}>
                            <h2>{project.title}</h2>
                            <p>{project.meta}</p>
                          </div>
                          <button
                            type="button"
                            className="figma-work-project-link"
                            aria-label={`Open ${project.title}`}
                            onClick={() => onOpenProject(category, project)}
                          />
                        </RoughFrame>
                      </motion.article>
                    )
                  })}
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </section>
      </section>
    </main>
  )
}

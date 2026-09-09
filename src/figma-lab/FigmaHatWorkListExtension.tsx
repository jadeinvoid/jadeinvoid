import { useState } from 'react'
import { AnimatePresence, motion, type Transition } from 'motion/react'
import type { SiteRuntimeConfig } from '../site/runtimeConfig'
import { RoughFrame } from '../ui-lab/RoughFrame'
import { UiCap } from '../ui-lab/UiCap'
import { getUiCategory, uiCategories, type UiCategoryId } from '../ui-lab/categories'
import { WORK_HAT_INTERACTION as HAT_INTERACTION } from './workHatInteraction'
import { resolveWorkProjectThumbnail, type WorkListProject } from './workListData'
import { usePortfolioContent } from '../portfolio/PortfolioContentContext'
import { FigmaWorkProjectArt } from './FigmaWorkProjectArt'

/* ─────────────────────────────────────────────────────────
 * IN-PLACE HAT WORK EXTENSION
 *
 *    0ms   landing remains mounted; selected hat begins its gravity drop
 *   80ms   character moves into its fixed left-side work pose
 *  180ms   remaining hats settle around the fixed character
 *  360ms   project panel slides 100% → 0 from the right
 *          cards reveal inside the moving panel (staggered)
 *   hover  available hat lifts, straightens, and reveals its category
 *   click  hats glide to their next slots while category content crossfades
 * compact  supporting copy and available hats render at 1 → 1.15 scale
 *   back   supporting copy fades; complete panel slides 0 → 100% right
 *   done   landing state restores only after the panel is offscreen
 * ───────────────────────────────────────────────────────── */

export const WORK_TIMING = {
  characterShift: 80, // character begins moving into its fixed work pose
  hatScatter: 180, // remaining hats fall around the character
  panelReveal: 360, // project panel enters from beyond the right edge
}

export const WORK_STAGE = {
  idle: 0,
  character: 1,
  hats: 2,
  panel: 3,
  exiting: 4,
} as const

const SCATTER = {
  initialY: -120,
  spring: { type: 'spring' as const, stiffness: 230, damping: 20, mass: 0.8 },
  positions: [
    { left: '0%', top: '52%', rotate: 27 },
    { left: '32%', top: '58%', rotate: -8 },
    { left: '64%', top: '51%', rotate: 8 },
  ],
}

const CATEGORY_SWITCH = {
  contentOffsetX: 14,
  copyOffsetY: 7,
  transition: { duration: 0.2, ease: 'easeOut' as const },
}

const PANEL = {
  hiddenX: '100%',
  spring: { type: 'spring' as const, stiffness: 250, damping: 28, mass: 0.9 },
}

const AUXILIARY_EXIT = {
  duration: 0.14,
  ease: 'easeOut' as const,
}

interface FigmaHatWorkListExtensionProps {
  values: SiteRuntimeConfig
  reduced: boolean
  category: UiCategoryId
  stage: number
  transition: Transition
  onBack: () => void
  onOpenProject: (category: UiCategoryId, project: WorkListProject) => void
  onSelectCategory: (category: UiCategoryId) => void
  onExitComplete: () => void
}

export function FigmaHatWorkListExtension({
  values,
  reduced,
  category,
  stage,
  transition,
  onBack,
  onOpenProject,
  onSelectCategory,
  onExitComplete,
}: FigmaHatWorkListExtensionProps) {
  const { content } = usePortfolioContent()
  const [hoveredCategory, setHoveredCategory] = useState<UiCategoryId | null>(null)
  const selectedCategory = getUiCategory(category)
  const work = content[category]
  const otherCategories = uiCategories.filter((item) => item.id !== category)
  const hoveredIndex = hoveredCategory === null
    ? -1
    : otherCategories.findIndex((item) => item.id === hoveredCategory)
  const hoveredItem = hoveredIndex >= 0 ? otherCategories[hoveredIndex] : null
  const hoveredPosition = hoveredIndex >= 0 ? SCATTER.positions[hoveredIndex] : null
  const exiting = stage === WORK_STAGE.exiting
  const supportingContentVisible = stage >= WORK_STAGE.hats && !exiting
  const panelVisible = stage === WORK_STAGE.panel
  const stroke = {
    frequency: values.uiLab.strokeFrequency,
    wiggle: values.uiLab.strokeWiggle,
    smoothen: values.uiLab.strokeSmoothen,
  }
  const activateCategory = (nextCategory: UiCategoryId) => {
    if (!supportingContentVisible) return
    setHoveredCategory(null)
    onSelectCategory(nextCategory)
  }
  return (
    <section className="figma-hat-work-extension" data-figma-node="107:230" data-category={category} aria-label={`${selectedCategory.label} work list`}>
      <div className="figma-hat-work-scatter" aria-label="Other work categories">
        <div className="figma-hat-work-scatter-zone" onPointerLeave={() => setHoveredCategory(null)}>
          <AnimatePresence initial={false}>
            {otherCategories.map((item, index) => {
            const position = SCATTER.positions[index]
            const hovered = hoveredCategory === item.id
            const floating = hovered && !reduced
            const className = `figma-hat-work-scatter-item figma-hat-work-scatter-${item.id}`
            const hostAnimation = {
              left: position.left,
              top: position.top,
              opacity: supportingContentVisible ? 1 : 0,
            }
            const visualAnimation = {
              y: supportingContentVisible
                ? floating
                  ? [
                      -HAT_INTERACTION.lift,
                      -HAT_INTERACTION.lift - HAT_INTERACTION.floatDistance,
                      -HAT_INTERACTION.lift,
                      -HAT_INTERACTION.lift + HAT_INTERACTION.floatDistance,
                      -HAT_INTERACTION.lift,
                    ]
                  : hovered ? -HAT_INTERACTION.lift : 0
                : SCATTER.initialY,
              scale: 1,
              rotate: supportingContentVisible
                ? floating
                  ? [0, HAT_INTERACTION.wobbleAngle, 0, -HAT_INTERACTION.wobbleAngle, 0]
                  : hovered ? 0 : position.rotate
                : 0,
            }
            const hostTransition = reduced
              ? { duration: 0 }
              : exiting
                ? AUXILIARY_EXIT
                : stage >= WORK_STAGE.panel
                  ? HAT_INTERACTION.spring
                  : { ...SCATTER.spring, delay: index * 0.07 }
            const visualTransition = reduced
              ? { duration: 0 }
              : exiting
                ? AUXILIARY_EXIT
                : floating
                  ? {
                      y: { duration: HAT_INTERACTION.floatDuration, repeat: Infinity, ease: 'easeInOut' as const },
                      rotate: { duration: HAT_INTERACTION.wobbleDuration, repeat: Infinity, ease: 'easeInOut' as const },
                    }
                  : stage >= WORK_STAGE.panel
                    ? HAT_INTERACTION.spring
                    : { ...SCATTER.spring, delay: index * 0.07 }

            return (
              <motion.button
                key={item.id}
                type="button"
                className={className}
                initial={{ opacity: 0, scale: 0.88, y: -HAT_INTERACTION.lift }}
                animate={hostAnimation}
                exit={{ opacity: 0, scale: 0.88, y: -HAT_INTERACTION.lift }}
                transition={hostTransition}
                whileTap={reduced ? undefined : HAT_INTERACTION.press}
                onHoverStart={() => setHoveredCategory(item.id)}
                onHoverEnd={() => setHoveredCategory(null)}
                onFocus={() => setHoveredCategory(item.id)}
                onBlur={() => setHoveredCategory(null)}
                onClick={() => activateCategory(item.id)}
                tabIndex={supportingContentVisible ? 0 : -1}
                aria-label={`View ${item.label} work`}
              >
                {item.hat.kind === 'image'
                  ? <motion.img
                      className="figma-hat-work-scatter-art"
                      src={item.hat.src}
                      alt=""
                      initial={false}
                      animate={visualAnimation}
                      transition={visualTransition}
                    />
                  : <motion.div
                      className="figma-hat-work-scatter-art figma-hat-work-scatter-art-model"
                      initial={false}
                      animate={visualAnimation}
                      transition={visualTransition}
                    >
                      <UiCap />
                    </motion.div>}
              </motion.button>
            )
            })}
          </AnimatePresence>
          <AnimatePresence>
            {hoveredItem && hoveredPosition && supportingContentVisible && (
              <motion.span
                key={hoveredItem.id}
                className="figma-hat-work-scatter-label"
                style={{ left: hoveredPosition.left, top: hoveredPosition.top }}
                initial={{ opacity: 0, y: HAT_INTERACTION.labelOffsetY }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: HAT_INTERACTION.labelOffsetY }}
                transition={reduced ? { duration: 0 } : HAT_INTERACTION.spring}
                aria-hidden="true"
              >
                {hoveredItem.label}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      <motion.button
        type="button"
        className="figma-hat-work-back"
        onClick={onBack}
        disabled={exiting}
        initial={false}
        animate={{ opacity: supportingContentVisible ? 1 : 0, y: supportingContentVisible ? 0 : 8 }}
        transition={reduced ? { duration: 0 } : exiting ? AUXILIARY_EXIT : transition}
      >
        ← back
      </motion.button>

      <motion.section
        className="figma-hat-work-explanation"
        aria-label={`${selectedCategory.label} expertise`}
        initial={false}
        animate={{ opacity: supportingContentVisible ? 1 : 0, y: supportingContentVisible ? 0 : 12 }}
        transition={reduced ? { duration: 0 } : exiting ? AUXILIARY_EXIT : transition}
      >
        <RoughFrame color={values.uiLab.frameColor} {...stroke}>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.p
              key={category}
              initial={{ opacity: 0, y: CATEGORY_SWITCH.copyOffsetY }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -CATEGORY_SWITCH.copyOffsetY }}
              transition={reduced ? { duration: 0 } : CATEGORY_SWITCH.transition}
            >
              {work.explanation}
            </motion.p>
          </AnimatePresence>
        </RoughFrame>
      </motion.section>

      <motion.section
        className="figma-hat-work-project-panel"
        initial={false}
        animate={{ x: panelVisible ? 0 : PANEL.hiddenX }}
        transition={reduced ? { duration: 0 } : PANEL.spring}
        onAnimationComplete={(definition) => {
          const reachedHiddenPosition = typeof definition === 'object'
            && definition !== null
            && 'x' in definition
            && definition.x === PANEL.hiddenX
          if (exiting && reachedHiddenPosition) onExitComplete()
        }}
      >
        <h1 className="figma-hat-work-title">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={category}
              initial={{ opacity: 0, y: CATEGORY_SWITCH.copyOffsetY }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -CATEGORY_SWITCH.copyOffsetY }}
              transition={reduced ? { duration: 0 } : CATEGORY_SWITCH.transition}
            >
              {selectedCategory.label}
            </motion.span>
          </AnimatePresence>
        </h1>
        <section className="figma-hat-work-grid" aria-label={`${selectedCategory.label} projects`}>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={category}
              className="figma-hat-work-grid-content"
              initial={{ opacity: 0, x: CATEGORY_SWITCH.contentOffsetX }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -CATEGORY_SWITCH.contentOffsetX }}
              transition={reduced ? { duration: 0 } : CATEGORY_SWITCH.transition}
            >
              {[0, 1, 2].map((row) => (
                <div className={`figma-hat-work-row row-${row + 1}`} key={row}>
                  {work.projects.slice(row * 2, row * 2 + 2).map((project, index) => {
                    const projectIndex = row * 2 + index
                    const thumbnail = resolveWorkProjectThumbnail(project)
                    return (
                      <motion.article
                        className="figma-hat-work-project"
                        key={project.title}
                        initial={false}
                        animate={{ opacity: stage >= WORK_STAGE.panel ? 1 : 0, y: stage >= WORK_STAGE.panel ? 0 : 18 }}
                        transition={{ ...transition, delay: reduced ? 0 : projectIndex * values.uiLab.projectStagger }}
                      >
                        <RoughFrame color={values.uiLab.frameColor} {...stroke}>
                          <FigmaWorkProjectArt index={projectIndex} thumbnail={thumbnail} />
                          <div className="figma-hat-work-project-copy" style={{ background: 'var(--work-card-copy-background, #eee9e1)' }}>
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
      </motion.section>
    </section>
  )
}

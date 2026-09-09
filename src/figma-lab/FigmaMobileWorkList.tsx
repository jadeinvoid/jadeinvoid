import { AnimatePresence, motion, type Transition } from 'motion/react'
import type { SiteRuntimeConfig } from '../site/runtimeConfig'
import { RoughFrame } from '../ui-lab/RoughFrame'
import { UiCap } from '../ui-lab/UiCap'
import { uiCategories, type UiCategoryId } from '../ui-lab/categories'
import { FigmaHeaderLogo } from './FigmaHeaderLogo'
import { FigmaWorkProjectArt } from './FigmaWorkProjectArt'
import { MOBILE_HAT_FLOAT } from './mobileHatFloat'
import { resolveWorkProjectThumbnail, type WorkImage, type WorkListProject } from './workListData'
import { usePortfolioContent } from '../portfolio/PortfolioContentContext'

/* ─────────────────────────────────────────────────────────
 * MOBILE WORK-LIST HAT
 *
 *  mount  the selected category hat is already visible beside its title
 *  loop   it keeps the shared mobile float distance, duration, and phase
 *  swap   previous/next replaces the hat, title, and full project list
 * ───────────────────────────────────────────────────────── */

const MOBILE_WORK_LABELS: Record<UiCategoryId, string> = {
  ux: 'UX Design',
  illustration: 'Illustration',
  visual: 'Visual Design',
  other: 'Others',
}

const MOBILE_WORK_FALLBACK_THUMBNAILS: Record<UiCategoryId, WorkImage[]> = {
  ux: [
    { src: '/work_design/ItsyBitsy/screenshot-2026-09-06_16-36-52.png', alt: 'ItsyBitsy interface' },
    { src: '/work_design/Waypoint/1.png', alt: 'Waypoint case study' },
    { src: '/work_design/UX_caseStudy_1/images/slide-01-title.png', alt: 'Marine database UX case study' },
    { src: '/work_design/Waypoint/4.png', alt: 'Waypoint comparison interface' },
    { src: '/work_design/UX_caseStudy_1/images/slide-04-search-wireframe.png', alt: 'Search wireframe' },
    { src: '/work_design/Waypoint/8.png', alt: 'Waypoint source interface' },
    { src: '/work_design/UX_caseStudy_1/images/slide-06-filter-wireframe.png', alt: 'Filter wireframe' },
    { src: '/work_design/Waypoint/10.png', alt: 'Waypoint final interface' },
  ],
  illustration: [
    { src: '/work_illustration/Animation/cheondoje-portfolio-slide/cheondoje-thumbnail.png', alt: 'Cheondoje animation' },
    { src: '/work_illustration/Amphibitopia/Amphibitopia1.jpg', alt: 'Amphibitopia illustration' },
    { src: '/work_illustration/Concept Art/SDD/main.png', alt: 'Character concept art' },
    { src: '/work_illustration/Concept Art/LL/website/coverImage_copy.png', alt: 'Environment concept art' },
    { src: '/work_illustration/Concept Art/HanselGretel/HG_BG.jpg', alt: 'Hansel and Gretel background' },
    { src: '/work_illustration/Concept Art/Side Scroller/website/ChoJ_GDES3117_S002_A4Main Screen iPad.jpg', alt: 'Side scroller concept' },
    { src: '/work_illustration/lionfish.jpg', alt: 'Lionfish illustration' },
    { src: '/work_illustration/bg_6.jpg', alt: 'Illustrated environment' },
  ],
  visual: [
    { src: '/work_design/BathRelief_Package/BathRelief_Thumbnail_1.png', alt: 'Bath Relief packaging' },
    { src: '/work_design/Grapefruits/Frame 6.png', alt: 'Grapefruits visual identity' },
    { src: '/work_design/FigmaTUI/Title-Page.png', alt: 'Figma TUI visual system' },
    { src: '/work_design/BathRelief_Package/BathRelief_Inclusivity.png', alt: 'Bath Relief inclusive package system' },
    { src: '/work_design/Grapefruits/Frame 7 (1).png', alt: 'Grapefruits motion frame' },
    { src: '/work_design/FigmaTUI/lazygit-style.png', alt: 'Figma TUI terminal style' },
    { src: '/work_design/BathRelief_Package/BathRelief_MockUp1.png', alt: 'Bath Relief mockup' },
    { src: '/work_design/BathRelief_Package/BathRelief_MockUp2.png', alt: 'Bath Relief package detail' },
  ],
  other: [
    { src: '/work_others/pfp2.jpeg', alt: 'Portrait study' },
    { src: '/work_others/sketches/intertwined.jpeg', alt: 'Intertwined sketch' },
    { src: '/work_others/sketches/crash.jpg', alt: 'Crash sketch' },
    { src: '/work_others/sketches/branch.png', alt: 'Branch sketch' },
    { src: '/work_others/sketches/plant.jpg', alt: 'Plant sketch' },
    { src: '/work_others/sketches/tree.png', alt: 'Tree sketch' },
    { src: '/work_others/sketches/vent2.jpg', alt: 'Vent study' },
    { src: '/work_others/sketches/ver4.jpg', alt: 'Visual experiment' },
  ],
}

const MOBILE_WORK_HAT_ROTATION: Record<UiCategoryId, number> = {
  ux: 0,
  illustration: 0,
  visual: -16,
  other: -12,
}

interface FigmaMobileWorkListProps {
  values: SiteRuntimeConfig
  reduced: boolean
  category: UiCategoryId
  onNavigateLanding: () => void
  onBack: () => void
  onContact: () => void
  onCategoryChange: (category: UiCategoryId) => void
  onOpenProject: (category: UiCategoryId, project: WorkListProject) => void
}

export function FigmaMobileWorkList({
  values,
  reduced,
  category,
  onNavigateLanding,
  onBack,
  onContact,
  onCategoryChange,
  onOpenProject,
}: FigmaMobileWorkListProps) {
  const { content } = usePortfolioContent()
  const requestedCategoryIndex = uiCategories.findIndex((item) => item.id === category)
  const categoryIndex = requestedCategoryIndex < 0 ? 0 : requestedCategoryIndex
  const activeCategory = uiCategories[categoryIndex]
  const work = content[activeCategory.id]
  const previous = uiCategories[(categoryIndex - 1 + uiCategories.length) % uiCategories.length]
  const next = uiCategories[(categoryIndex + 1) % uiCategories.length]
  const float = MOBILE_HAT_FLOAT[activeCategory.id]
  const transition: Transition = reduced ? { duration: 0 } : { duration: 0.22, ease: 'easeOut' }
  const stroke = {
    frequency: values.uiLab.strokeFrequency,
    wiggle: values.uiLab.strokeWiggle,
    smoothen: values.uiLab.strokeSmoothen,
  }

  return (
    <main
      className="figma-landing-page figma-mobile-work-page"
      data-figma-node="142:99"
      data-flow-role="work-list"
      data-category={activeCategory.id}
      data-view="projects-work"
    >
      <header className="figma-landing-header-wrap">
        <RoughFrame className="figma-landing-header" color={values.uiLab.frameColor} {...stroke}>
          <FigmaHeaderLogo onNavigateLanding={onNavigateLanding} />
          <nav aria-label="Projects navigation">
            <button type="button" aria-current="page" onClick={onBack}>Projects</button>
            <button type="button" onClick={onContact}>Contact</button>
          </nav>
        </RoughFrame>
      </header>

      <button type="button" className="figma-mobile-work-back" onClick={onBack}>← back</button>

      <section className={`figma-mobile-work-heading category-${activeCategory.id}`}>
          <motion.span
            className="figma-mobile-work-hat"
            key={`hat-${activeCategory.id}`}
            animate={reduced ? { y: 0 } : { y: [0, -float.y, 0, float.y * 0.35, 0] }}
            transition={reduced ? { duration: 0 } : {
              duration: float.duration,
              delay: float.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            aria-hidden="true"
          >
            <span
              className="figma-mobile-work-hat-art"
              style={{ '--mobile-work-hat-rotation': `${MOBILE_WORK_HAT_ROTATION[activeCategory.id]}deg` } as React.CSSProperties}
            >
              {activeCategory.hat.kind === 'model'
                ? <UiCap modelOffsetX={-0.25} modelOffsetY={0.28} modelScale={1.16} useSpinScale />
                : <img src={activeCategory.hat.src} alt="" />}
            </span>
          </motion.span>
          <h1>{MOBILE_WORK_LABELS[activeCategory.id]}</h1>
      </section>

      <AnimatePresence mode="wait" initial={false}>
        <motion.section
          className="figma-mobile-work-projects"
          aria-label={`${MOBILE_WORK_LABELS[activeCategory.id]} projects`}
          key={`projects-${activeCategory.id}`}
          initial={reduced ? false : { opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={transition}
        >
          {work.projects.map((project, index) => {
            const fallbackThumbnails = MOBILE_WORK_FALLBACK_THUMBNAILS[activeCategory.id]
            const thumbnail = resolveWorkProjectThumbnail(project) ?? fallbackThumbnails[index % fallbackThumbnails.length]
            return (
              <article className="figma-mobile-work-project" key={project.slug}>
                <RoughFrame color={values.uiLab.frameColor} borderPlacement="outside" {...stroke}>
                  <FigmaWorkProjectArt index={index} thumbnail={thumbnail} />
                  <button
                    type="button"
                    className="figma-work-project-link"
                    aria-label={`Open ${project.title}`}
                    onClick={() => onOpenProject(activeCategory.id, project)}
                  />
                </RoughFrame>
                <h2>{project.title}</h2>
              </article>
            )
          })}
        </motion.section>
      </AnimatePresence>

      <nav className="figma-mobile-work-category-nav" aria-label="Browse work categories">
        <button type="button" onClick={() => onCategoryChange(previous.id)}>← {MOBILE_WORK_LABELS[previous.id]}</button>
        <button type="button" onClick={() => onCategoryChange(next.id)}>{MOBILE_WORK_LABELS[next.id]} →</button>
      </nav>
    </main>
  )
}

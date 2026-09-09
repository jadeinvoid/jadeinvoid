import { motion } from 'motion/react'
import type { SiteRuntimeConfig } from '../site/runtimeConfig'
import { RoughFrame } from '../ui-lab/RoughFrame'
import { UiCap } from '../ui-lab/UiCap'
import { uiCategories, type UiCategoryId } from '../ui-lab/categories'
import { FigmaHeaderLogo } from './FigmaHeaderLogo'
import { MOBILE_HAT_FLOAT } from './mobileHatFloat'

/* ─────────────────────────────────────────────────────────
 * MOBILE CATEGORY HAT INTERACTION
 *
 *  rest   each hat sits at 20% opacity around its category label
 *  loop   hats reuse the mobile landing's vertical float distance and timing
 *  hover  the float continues unchanged with no hover-specific response
 * ───────────────────────────────────────────────────────── */

const MOBILE_CATEGORY_LABELS: Record<UiCategoryId, string> = {
  ux: 'UX Design',
  illustration: 'Illustration',
  visual: 'Visual Design',
  other: 'Others',
}

const MOBILE_CATEGORY_ROTATION: Record<UiCategoryId, number> = {
  ux: 27.16,
  illustration: 26.44,
  visual: -23.14,
  other: -18.06,
}

interface FigmaMobileCategoryScreenProps {
  values: SiteRuntimeConfig
  reduced: boolean
  onBack: () => void
  onContact: () => void
  onSelectCategory: (category: UiCategoryId) => void
}

export function FigmaMobileCategoryScreen({ values, reduced, onBack, onContact, onSelectCategory }: FigmaMobileCategoryScreenProps) {
  const stroke = {
    frequency: values.uiLab.strokeFrequency,
    wiggle: values.uiLab.strokeWiggle,
    smoothen: values.uiLab.strokeSmoothen,
  }

  return (
    <main className="figma-landing-page figma-mobile-category-page" data-figma-node="175:104" data-flow-role="work-list-category">
      <header className="figma-landing-header-wrap">
        <RoughFrame className="figma-landing-header" color={values.uiLab.frameColor} {...stroke}>
          <FigmaHeaderLogo onNavigateLanding={onBack} />
          <nav aria-label="Category navigation">
            <span aria-current="page">Projects</span>
            <button type="button" onClick={onContact}>Contact</button>
          </nav>
        </RoughFrame>
      </header>
      <section className="figma-mobile-category-layout" aria-label="Work categories">
        {uiCategories.map((category) => {
          const float = MOBILE_HAT_FLOAT[category.id]

          return (
            <button
              type="button"
              className={`figma-mobile-category-choice category-${category.id}`}
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              aria-label={`View ${category.label} work`}
            >
              <motion.span
                className="figma-mobile-category-hat"
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
                  className="figma-mobile-category-hat-art"
                  style={{ '--mobile-category-hat-rotation': `${MOBILE_CATEGORY_ROTATION[category.id]}deg` } as React.CSSProperties}
                >
                  {category.hat.kind === 'model'
                    ? <UiCap modelOffsetX={-0.45} modelOffsetY={0.35} modelScale={1.3} animateYSpin={!reduced} />
                    : <img src={category.hat.src} alt="" />}
                </span>
              </motion.span>
              <strong>{MOBILE_CATEGORY_LABELS[category.id]}</strong>
            </button>
          )
        })}
      </section>
    </main>
  )
}

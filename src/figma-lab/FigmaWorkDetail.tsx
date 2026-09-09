import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { motion } from 'motion/react'
import type { SiteRuntimeConfig } from '../site/runtimeConfig'
import { RoughFrame } from '../ui-lab/RoughFrame'
import { UiLabCursor } from '../ui-lab/UiLabCursor'
import type { UiCategoryId } from '../ui-lab/categories'
import { getAdjacentWorkProjects, type WorkListProject } from './workListData'
import { usePortfolioContent } from '../portfolio/PortfolioContentContext'
import { getFieldNoteLayout, toFieldNoteBlocks, toFieldNoteProject } from '../portfolio/fieldNoteProject'
import { WorkDetailRenderer } from '../ui-lab/work-details/WorkDetailRenderer'
import type { FieldNoteBreakpoint } from '../ui-lab/work-details/fieldNoteLayout'
import { MarkdownContent } from '../ui-lab/work-details/MarkdownContent'
import { MediaLightbox } from '../components/MediaLightbox'
import { YouTubeEmbed } from '../components/YouTubeEmbed'
import { FigmaHeaderLogo } from './FigmaHeaderLogo'

function ExpandableProjectImage({ src, fullSrc, alt, caption }: { src: string; fullSrc?: string; alt: string; caption: string }) {
  const [expanded, setExpanded] = useState(false)
  return <>
    <figure className="figma-work-detail-image">
      <button type="button" className="figma-work-detail-image-expand" aria-label={`Expand image${alt ? `: ${alt}` : ''}`} onClick={() => setExpanded(true)}><img src={src} alt={alt} loading="lazy" decoding="async" /></button>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
    {expanded && <MediaLightbox media={[{ src: fullSrc ?? src, alt, caption }]} activeIndex={0} label="Expanded project image" onClose={() => setExpanded(false)} />}
  </>
}

function ProjectYouTubeVideo({ url, title, caption }: { url: string; title: string; caption: string }) {
  return (
    <figure className="figma-work-detail-youtube">
      <YouTubeEmbed value={url} title={title} />
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  )
}

function ProjectLocalVideo({ src, title, caption }: { src: string; title: string; caption: string }) {
  if (!src) return null
  return (
    <figure className="figma-work-detail-video">
      <video src={src} aria-label={title || 'Project video'} controls playsInline preload="metadata" />
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  )
}

interface FigmaWorkDetailProps {
  values: SiteRuntimeConfig
  reduced: boolean
  category: UiCategoryId
  project: WorkListProject
  onNavigateLanding?: () => void
  onBack: () => void
  onContact: () => void
  onNavigateProjects: () => void
  onOpenProject: (category: UiCategoryId, project: WorkListProject) => void
  fieldNoteBreakpoint?: FieldNoteBreakpoint
  fieldNoteShowEmptyMedia?: boolean
  showCustomCursor?: boolean
}

export function FigmaWorkDetail({
  values,
  reduced,
  category,
  project,
  onNavigateLanding,
  onBack,
  onContact,
  onNavigateProjects,
  onOpenProject,
  fieldNoteBreakpoint = 'desktop',
  fieldNoteShowEmptyMedia = false,
  showCustomCursor = true,
}: FigmaWorkDetailProps) {
  const { content } = usePortfolioContent()
  const pageRef = useRef<HTMLElement>(null)
  const [expanded, setExpanded] = useState(false)
  const adjacent = getAdjacentWorkProjects(category, project.slug, content)
  const summary = project.summary || `${project.meta}. A concise project summary will be added here.`
  const fullTextContent = project.fullTextContent ?? project.rationale.join('\n\n')
  const hasFullText = fullTextContent.trim().length > 0
  const fullTextParagraphs = fullTextContent.split(/\n\s*\n/).filter((paragraph) => paragraph.trim().length > 0)
  const stroke = {
    frequency: values.uiLab.strokeFrequency,
    wiggle: values.uiLab.strokeWiggle,
    smoothen: values.uiLab.strokeSmoothen,
  }

  useEffect(() => setExpanded(false), [project.slug])

  useLayoutEffect(() => {
    const scroller = pageRef.current?.closest<HTMLElement>('.figma-preview-pane')
    if (scroller) scroller.scrollTop = 0
  }, [project.slug])

  if (project.template === 'field-note') {
    const fieldNoteProject = toFieldNoteProject(project)
    const fieldNoteLayout = getFieldNoteLayout(project, fieldNoteBreakpoint)
    const fieldNoteBlocks = toFieldNoteBlocks(project.blocks)
    return (
      <main
        ref={pageRef}
        className="figma-landing-page figma-work-detail-page figma-field-note-detail-page"
        data-figma-node="107:318"
        data-category={category}
        style={{ '--ui-bg': values.uiLab.background, '--ui-pink': values.uiLab.frameColor } as CSSProperties}
      >
        {showCustomCursor && <UiLabCursor stageRef={pageRef} reduced={reduced} />}
        <header className="figma-landing-header-wrap">
          <RoughFrame className="figma-landing-header" color={values.uiLab.frameColor} {...stroke}>
            <FigmaHeaderLogo onNavigateLanding={onNavigateLanding} />
            <nav aria-label="Project detail navigation">
              <button type="button" onClick={onNavigateProjects}>Projects</button>
              <button type="button" onClick={onContact}>Contact</button>
            </nav>
          </RoughFrame>
        </header>

        <section className="figma-field-note-detail-layout" data-project-template={project.template}>
          <div className="figma-work-detail-back-rail">
            <button type="button" className="figma-work-detail-back" onClick={onBack}>← back</button>
          </div>
          <WorkDetailRenderer
            project={fieldNoteProject}
            template="field-note"
            reduced={reduced}
            frameColor={values.uiLab.frameColor}
            stroke={stroke}
            fieldNoteLayout={fieldNoteLayout}
            fieldNoteBreakpoint={fieldNoteBreakpoint}
            fieldNoteShowEmptyMedia={fieldNoteShowEmptyMedia}
            fieldNoteBlocks={fieldNoteBlocks}
            fieldNoteFullText={fullTextParagraphs}
            fieldNoteFullTextFormat={project.fullTextFormat ?? 'plain'}
            fieldNoteFullTextContent={fullTextContent}
            fieldNoteFullTextExpanded={expanded}
            onFieldNoteFullTextToggle={() => setExpanded((current) => !current)}
            onBack={onBack}
            onPrevious={() => adjacent.previous && onOpenProject(category, adjacent.previous)}
            onNext={() => adjacent.next && onOpenProject(category, adjacent.next)}
          />
        </section>
      </main>
    )
  }

  return (
    <main ref={pageRef} className="figma-landing-page figma-work-detail-page" data-figma-node="107:318" data-category={category}>
      {showCustomCursor && <UiLabCursor stageRef={pageRef} reduced={reduced} />}
      <header className="figma-landing-header-wrap">
        <RoughFrame className="figma-landing-header" color={values.uiLab.frameColor} {...stroke}>
          <FigmaHeaderLogo onNavigateLanding={onNavigateLanding} />
          <nav aria-label="Project detail navigation">
            <button type="button" onClick={onNavigateProjects}>Projects</button>
            <button type="button" onClick={onContact}>Contact</button>
          </nav>
        </RoughFrame>
      </header>

      <section className="figma-work-detail-layout" data-project-template={project.template}>
        <div className="figma-work-detail-back-rail">
          <button type="button" className="figma-work-detail-back" onClick={onBack}>← back</button>
        </div>
        <div className="figma-work-detail-content">
          <h1>{project.title}</h1>
          <RoughFrame className="figma-work-detail-frame" color={values.uiLab.frameColor} {...stroke}>
            <section className="figma-work-detail-carousel" aria-label={`${project.title} media`}>
              <button type="button" aria-label="Previous media" disabled>‹</button>
              <RoughFrame className="figma-work-detail-media" color={values.uiLab.frameColor} {...stroke} />
              <button type="button" aria-label="Next media" disabled>›</button>
            </section>

            <div className="figma-work-detail-copy">
              <p>{summary}</p>
              {hasFullText && <button
                type="button"
                className="figma-work-detail-disclosure"
                aria-expanded={expanded}
                aria-controls={`project-rationale-${project.slug}`}
                onClick={() => setExpanded((current) => !current)}
              >
                <span aria-hidden="true">⌄</span>
                {expanded ? 'Hide full text' : 'See full text'}
              </button>}
              {hasFullText && expanded && (
                <motion.div
                  id={`project-rationale-${project.slug}`}
                  className="figma-work-detail-rationale"
                  initial={reduced ? false : { opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={reduced ? { duration: 0 } : { duration: 0.18, ease: 'easeOut' }}
                >
                  {project.fullTextFormat === 'markdown'
                    ? <MarkdownContent content={fullTextContent} />
                    : fullTextParagraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                </motion.div>
              )}
              {project.blocks.length > 0 && (
                <div className="figma-work-detail-blocks">
                  {project.blocks.map((block) => block.type === 'text'
                    ? <div key={block.id} className="figma-work-detail-text-block" style={{ '--figma-work-detail-text-width': `${block.width}%` } as CSSProperties}>
                      {block.style === 'heading'
                        ? <h2>{block.content}</h2>
                        : block.style === 'quote'
                          ? <blockquote>{block.content}</blockquote>
                          : <p>{block.content}</p>}
                    </div>
                    : block.type === 'image'
                      ? block.src && block.showInProject !== false ? <ExpandableProjectImage key={block.id} src={block.src} fullSrc={block.fullSrc} alt={block.alt} caption={block.caption} /> : null
                      : block.type === 'video'
                        ? <ProjectLocalVideo key={block.id} src={block.src} title={block.title} caption={block.caption} />
                        : <ProjectYouTubeVideo key={block.id} url={block.url} title={block.title} caption={block.caption} />)}
                </div>
              )}
            </div>
          </RoughFrame>

          <nav className="figma-work-detail-project-nav" aria-label="Adjacent projects">
            <button
              type="button"
              disabled={!adjacent.previous}
              onClick={() => adjacent.previous && onOpenProject(category, adjacent.previous)}
            >← previous work</button>
            <button
              type="button"
              disabled={!adjacent.next}
              onClick={() => adjacent.next && onOpenProject(category, adjacent.next)}
            >next work →</button>
          </nav>
        </div>
      </section>
    </main>
  )
}

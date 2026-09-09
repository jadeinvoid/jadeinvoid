import { useState, type CSSProperties, type DragEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'
import { motion } from 'motion/react'
import { RoughDivider, RoughFrame } from '../RoughFrame'
import { createDefaultFieldNoteLayout, moveFieldNoteBlock, type FieldNoteBlockId, type FieldNoteBreakpoint, type FieldNoteBreakpointLayout, type FieldNoteBuiltInBlockId } from './fieldNoteLayout'
import type { FieldNoteCustomBlock, FieldNoteImageBlock, FieldNoteTextBlock, FieldNoteVideoBlock, FieldNoteYouTubeBlock } from './fieldNoteContent'
import type { WorkDetailProject, WorkDetailTemplateId } from './workDetailTypes'
import { InlineMarkdownContent, MarkdownContent } from './MarkdownContent'
import { MAX_LOCAL_IMAGE_BYTES, localImageSizeMessage } from '../../portfolio/localImage'
import { MAX_LOCAL_VIDEO_LABEL, readLocalVideo } from '../../portfolio/localVideo'
import { MediaLightbox } from '../../components/MediaLightbox'
import { createYouTubeEmbedUrl, YouTubeEmbed } from '../../components/YouTubeEmbed'
import './work-details.css'

/* ─────────────────────────────────────────────────────────
 * WORK DETAIL ENTRANCE STORYBOARD
 *
 * Read top-to-bottom. Each `at` value is ms after mount.
 *
 *    0ms   title and project context settle into place
 *  100ms   primary media rises 14px → 0px
 *  180ms   supporting sections rise (staggered 70ms)
 * ───────────────────────────────────────────────────────── */

const TIMING = {
  title: 0,       // title and project context appear
  primary: 100,   // primary media enters
  sections: 180,  // supporting sections begin
}

const ENTRANCE = {
  offsetY: 14,
  sectionStagger: 0.07,
  spring: { type: 'spring' as const, visualDuration: 0.42, bounce: 0.08 },
}

interface WorkDetailRendererProps {
  project: WorkDetailProject
  template: WorkDetailTemplateId
  reduced: boolean
  frameColor: string
  stroke: {
    frequency: number
    wiggle: number
    smoothen: number
  }
  onBack: () => void
  onPrevious: () => void
  onNext: () => void
  fieldNoteLayout?: FieldNoteBreakpointLayout
  fieldNoteBreakpoint?: FieldNoteBreakpoint
  fieldNoteEditing?: boolean
  fieldNoteShowEmptyMedia?: boolean
  fieldNoteBlocks?: FieldNoteCustomBlock[]
  fieldNoteFullText?: string[]
  fieldNoteFullTextFormat?: 'plain' | 'markdown'
  fieldNoteFullTextContent?: string
  fieldNoteFullTextExpanded?: boolean
  onFieldNoteFullTextToggle?: () => void
  onFieldNoteLayoutChange?: (patch: Partial<FieldNoteBreakpointLayout>) => void
  onFieldNoteBlockChange?: (id: string, patch: Partial<FieldNoteCustomBlock>) => void
  onFieldNoteBlockDelete?: (id: string) => void
}

type TemplateContentProps = Omit<WorkDetailRendererProps, 'template'>

function entrance(at: number, reduced: boolean, index = 0) {
  return {
    initial: reduced ? false as const : { opacity: 0, y: ENTRANCE.offsetY },
    animate: { opacity: 1, y: 0 },
    transition: reduced
      ? { duration: 0 }
      : { ...ENTRANCE.spring, delay: at / 1000 + index * ENTRANCE.sectionStagger },
  }
}

function MediaPanel({ project, index, reduced, feature = false, onExpand }: { project: WorkDetailProject; index: number; reduced: boolean; feature?: boolean; onExpand?: (index: number) => void }) {
  const media = project.media[index]
  return (
    <motion.figure
      className={`ui-wd-media tone-${media.tone}${feature ? ' feature' : ''}`}
      {...entrance(index === 0 ? TIMING.primary : TIMING.sections, reduced, index)}
    >
      <div className={`ui-wd-media-art${media.src ? ' has-image' : ''}`} aria-hidden={!media.src}>
        {media.src && <button type="button" className="ui-wd-media-expand" aria-label={`Expand image${media.alt || media.label ? `: ${media.alt || media.label}` : ''}`} onClick={() => onExpand?.(index)}><img src={media.src} alt={media.alt || media.label} loading={index === 0 ? 'eager' : 'lazy'} decoding="async" /><span className="ui-wd-expand-arrow" aria-hidden="true">{'->'}</span></button>}
      </div>
      {(media.label || media.caption) && <figcaption>{media.label && <strong>{media.label}</strong>}<span>{media.caption}</span></figcaption>}
    </motion.figure>
  )
}

function ProjectMediaLightbox({ project, sourceIndex, frameColor, stroke, onSourceIndexChange, onClose }: { project: WorkDetailProject; sourceIndex: number; frameColor: string; stroke: WorkDetailRendererProps['stroke']; onSourceIndexChange: (index: number) => void; onClose: () => void }) {
  const media = project.media.flatMap((item, index) => item.src ? [{ src: item.fullSrc ?? item.src, alt: item.alt || item.label, caption: item.caption || item.label, sourceIndex: index }] : [])
  const activeIndex = Math.max(0, media.findIndex((item) => item.sourceIndex === sourceIndex))
  if (!media.length) return null
  return <MediaLightbox media={media} activeIndex={activeIndex} label={`${project.title} expanded carousel`} roughFrame={{ color: frameColor, ...stroke }} onActiveIndexChange={(index) => onSourceIndexChange(media[index]?.sourceIndex ?? sourceIndex)} onClose={onClose} />
}

function ProjectFacts({ project }: { project: WorkDetailProject }) {
  const facts = ([
    ['Year', project.year, project.factVisibility?.year ?? true],
    ['Role', project.role, project.factVisibility?.role ?? true],
    ['Scope', project.services.join(' · '), project.factVisibility?.scope ?? true],
  ] satisfies [string, string, boolean][]).filter(([, , visible]) => visible)
  if (!facts.length) return null
  return (
    <dl className="ui-wd-facts">
      {facts.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
    </dl>
  )
}

function WorkDetailEnding({ onBack, onPrevious, onNext, roughDivider }: Pick<WorkDetailRendererProps, 'onBack' | 'onPrevious' | 'onNext'> & { roughDivider?: Pick<WorkDetailRendererProps, 'frameColor' | 'stroke'> }) {
  return (
    <nav className="ui-wd-ending" aria-label="Continue browsing work">
      {roughDivider && <RoughDivider className="ui-wd-ending-divider" color={roughDivider.frameColor} {...roughDivider.stroke} />}
      <button type="button" onClick={onPrevious}>← Previous work</button>
      <button type="button" onClick={onBack}>All work</button>
      <button type="button" onClick={onNext}>Next work →</button>
    </nav>
  )
}

function CaseStudyTemplate({ project, reduced, frameColor, stroke, onBack, onPrevious, onNext }: TemplateContentProps) {
  const [expandedMediaIndex, setExpandedMediaIndex] = useState<number | null>(null)
  return (
    <article className="ui-wd-template ui-wd-case-study">
      <div className="ui-wd-case-study-content">
        <motion.h1 {...entrance(TIMING.title, reduced)}>{project.title}</motion.h1>
        <RoughFrame className="ui-wd-case-study-frame" color={frameColor} {...stroke}>
          <motion.header className="ui-wd-case-intro" {...entrance(TIMING.title, reduced)}>
            <span className="ui-wd-kicker">Case study / {project.year}</span>
            <p>{project.overview}</p>
          </motion.header>
          <MediaPanel project={project} index={0} reduced={reduced} feature onExpand={setExpandedMediaIndex} />
          <motion.section className="ui-wd-case-context" {...entrance(TIMING.sections, reduced)}>
            <ProjectFacts project={project} />
            <div><span className="ui-wd-label">Outcome</span><p>{project.outcome}</p></div>
          </motion.section>
          <section className="ui-wd-process" aria-labelledby="ui-wd-process-title">
            <motion.h2 id="ui-wd-process-title" {...entrance(TIMING.sections, reduced)}>How it took shape</motion.h2>
            <ol>{project.process.map((step, index) => <motion.li key={step} {...entrance(TIMING.sections, reduced, index)}><span>{String(index + 1).padStart(2, '0')}</span>{step}</motion.li>)}</ol>
          </section>
          <div className="ui-wd-case-media">{project.media.slice(1).map((_, index) => <MediaPanel key={project.media[index + 1].id} project={project} index={index + 1} reduced={reduced} onExpand={setExpandedMediaIndex} />)}</div>
        </RoughFrame>
        <WorkDetailEnding onBack={onBack} onPrevious={onPrevious} onNext={onNext} />
        {expandedMediaIndex !== null && <ProjectMediaLightbox project={project} sourceIndex={expandedMediaIndex} frameColor={frameColor} stroke={stroke} onSourceIndexChange={setExpandedMediaIndex} onClose={() => setExpandedMediaIndex(null)} />}
      </div>
    </article>
  )
}

function VisualStoryTemplate({ project, reduced, frameColor, stroke, onBack, onPrevious, onNext }: TemplateContentProps) {
  const [expandedMediaIndex, setExpandedMediaIndex] = useState<number | null>(null)
  return (
    <article className="ui-wd-template ui-wd-visual-story">
      <motion.header {...entrance(TIMING.title, reduced)}>
        <span className="ui-wd-kicker">Visual story / {project.meta}</span>
        <h1>{project.title}</h1>
        <p className="ui-wd-visual-dek">{project.overview}</p>
      </motion.header>
      <RoughFrame className="ui-wd-visual-frame" color={frameColor} {...stroke}>
        <div className="ui-wd-visual-grid">
          {project.media.map((_, index) => <MediaPanel key={project.media[index].id} project={project} index={index} reduced={reduced} feature={index === 0} onExpand={setExpandedMediaIndex} />)}
        </div>
      </RoughFrame>
      <motion.section className="ui-wd-visual-context" {...entrance(TIMING.sections, reduced)}>
        <ProjectFacts project={project} />
        <div><span className="ui-wd-label">What stayed</span><p>{project.outcome}</p></div>
      </motion.section>
      <WorkDetailEnding onBack={onBack} onPrevious={onPrevious} onNext={onNext} />
      {expandedMediaIndex !== null && <ProjectMediaLightbox project={project} sourceIndex={expandedMediaIndex} frameColor={frameColor} stroke={stroke} onSourceIndexChange={setExpandedMediaIndex} onClose={() => setExpandedMediaIndex(null)} />}
    </article>
  )
}

function FieldNoteTextCustomBlock({ block, editing, onChange, onDelete }: { block: FieldNoteTextBlock; editing: boolean; onChange?: (patch: Partial<FieldNoteTextBlock>) => void; onDelete?: () => void }) {
  return (
    <div className={`ui-wd-custom-text style-${block.style} align-${block.align}`} style={{ '--ui-wd-custom-text-width': `${block.width}%` } as CSSProperties}>
      {editing && (
        <div className="ui-wd-custom-tools">
          <label>Style<select aria-label="Text style" value={block.style} onChange={(event) => onChange?.({ style: event.currentTarget.value as FieldNoteTextBlock['style'] })}><option value="paragraph">Paragraph</option><option value="heading">Heading</option><option value="quote">Quote</option></select></label>
          <label>Align<select aria-label="Text alignment" value={block.align} onChange={(event) => onChange?.({ align: event.currentTarget.value as FieldNoteTextBlock['align'] })}><option value="left">Left</option><option value="center">Center</option><option value="right">Right</option></select></label>
          <label className="ui-wd-text-width">Width <output>{Math.round(block.width)}%</output><input aria-label="Text width" type="range" min="25" max="100" step="5" value={block.width} onChange={(event) => onChange?.({ width: Number(event.currentTarget.value) })} /></label>
          <button type="button" className="ui-wd-delete-block" onClick={onDelete}>Delete</button>
        </div>
      )}
      {editing ? (
        <textarea aria-label="Edit text block" rows={block.style === 'heading' ? 2 : 5} value={block.content} placeholder="Start writing…" onChange={(event) => onChange?.({ content: event.currentTarget.value })} />
      ) : block.style === 'heading' ? (
        <h2>{block.content}</h2>
      ) : block.style === 'quote' ? (
        <blockquote>{block.content}</blockquote>
      ) : (
        <p>{block.content}</p>
      )}
    </div>
  )
}

function FieldNoteImageCustomBlock({ block, editing, frameColor, stroke, onChange, onDelete }: { block: FieldNoteImageBlock; editing: boolean; frameColor: string; stroke: WorkDetailRendererProps['stroke']; onChange?: (patch: Partial<FieldNoteImageBlock>) => void; onDelete?: () => void }) {
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState(false)
  const readImage = (file?: File) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Choose an image file.')
      return
    }
    if (file.size > MAX_LOCAL_IMAGE_BYTES) {
      setError(localImageSizeMessage())
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setError('')
        onChange?.({ src: reader.result, alt: block.alt || file.name.replace(/\.[^.]+$/, '') })
      }
    }
    reader.onerror = () => setError('This image could not be read.')
    reader.readAsDataURL(file)
  }

  return (
    <figure className={`ui-wd-custom-image align-${block.align}`} style={{ '--ui-wd-custom-image-width': `${block.width}%` } as CSSProperties}>
      {editing && (
        <div className="ui-wd-custom-tools image-tools">
          <label>Align<select aria-label="Image alignment" value={block.align} onChange={(event) => onChange?.({ align: event.currentTarget.value as FieldNoteImageBlock['align'] })}><option value="left">Left</option><option value="center">Center</option><option value="right">Right</option></select></label>
          <label className="ui-wd-image-width">Width <output>{Math.round(block.width)}%</output><input aria-label="Image width" type="range" min="25" max="100" value={block.width} onChange={(event) => onChange?.({ width: Number(event.currentTarget.value) })} /></label>
          <button type="button" className="ui-wd-delete-block" onClick={onDelete}>Delete</button>
        </div>
      )}
      <RoughFrame className={`ui-wd-custom-image-frame${block.src ? ' has-image' : ''}`} color={frameColor} borderPlacement="outside" {...stroke}>
        {block.src ? <button type="button" className="ui-wd-custom-image-expand" aria-label={`Expand image${block.alt ? `: ${block.alt}` : ''}`} onClick={() => setExpanded(true)}><img src={block.src} alt={block.alt} loading="lazy" decoding="async" /></button> : <div className="ui-wd-image-placeholder"><span aria-hidden="true">▧</span><strong>Add an image</strong><small>Upload a file or paste an image URL</small></div>}
      </RoughFrame>
      {editing && (
        <div className="ui-wd-image-fields">
          <label className="ui-wd-upload-button">Upload image<input aria-label="Upload image" type="file" accept="image/*" onChange={(event) => readImage(event.currentTarget.files?.[0])} /></label>
          <label>Image URL<input aria-label="Image URL" type="url" value={block.src.startsWith('data:') ? '' : block.src} placeholder="https://…" onChange={(event) => { setError(''); onChange?.({ src: event.currentTarget.value }) }} /></label>
          <label>Alt text<input aria-label="Image alt text" type="text" value={block.alt} placeholder="Describe the image" onChange={(event) => onChange?.({ alt: event.currentTarget.value })} /></label>
          {error && <p className="ui-wd-image-error" role="alert">{error}</p>}
        </div>
      )}
      {editing ? <input className="ui-wd-caption-input" aria-label="Image caption" value={block.caption} placeholder="Write a caption…" onChange={(event) => onChange?.({ caption: event.currentTarget.value })} /> : block.caption ? <figcaption>{block.caption}</figcaption> : null}
      {expanded && <MediaLightbox media={[{ src: block.fullSrc ?? block.src, alt: block.alt, caption: block.caption }]} activeIndex={0} label="Expanded project image" roughFrame={{ color: frameColor, ...stroke }} onClose={() => setExpanded(false)} />}
    </figure>
  )
}

function FieldNoteYouTubeCustomBlock({ block, editing, frameColor, stroke, onChange, onDelete }: { block: FieldNoteYouTubeBlock; editing: boolean; frameColor: string; stroke: WorkDetailRendererProps['stroke']; onChange?: (patch: Partial<FieldNoteYouTubeBlock>) => void; onDelete?: () => void }) {
  const valid = Boolean(createYouTubeEmbedUrl(block.url))
  return (
    <figure className={`ui-wd-custom-youtube align-${block.align}`} style={{ '--ui-wd-custom-youtube-width': `${block.width}%` } as CSSProperties}>
      {editing && (
        <div className="ui-wd-custom-tools image-tools">
          <label>Align<select aria-label="YouTube alignment" value={block.align} onChange={(event) => onChange?.({ align: event.currentTarget.value as FieldNoteYouTubeBlock['align'] })}><option value="left">Left</option><option value="center">Center</option><option value="right">Right</option></select></label>
          <label className="ui-wd-image-width">Width <output>{Math.round(block.width)}%</output><input aria-label="YouTube width" type="range" min="25" max="100" value={block.width} onChange={(event) => onChange?.({ width: Number(event.currentTarget.value) })} /></label>
          <button type="button" className="ui-wd-delete-block" onClick={onDelete}>Delete</button>
        </div>
      )}
      <RoughFrame className="ui-wd-custom-youtube-frame" color={frameColor} borderPlacement="outside" {...stroke}>
        {valid ? <YouTubeEmbed value={block.url} title={block.title} /> : <div className="ui-wd-image-placeholder"><span aria-hidden="true">▶</span><strong>Add a YouTube video</strong><small>Paste a YouTube URL to embed it</small></div>}
      </RoughFrame>
      {editing && (
        <div className="ui-wd-youtube-fields">
          <label>YouTube URL<input aria-label="YouTube URL" type="url" value={block.url} placeholder="https://www.youtube.com/watch?v=…" onChange={(event) => onChange?.({ url: event.currentTarget.value })} /></label>
          <label>Accessible title<input aria-label="YouTube title" value={block.title} placeholder="Describe the video" onChange={(event) => onChange?.({ title: event.currentTarget.value })} /></label>
          {block.url && !valid && <p className="ui-wd-image-error" role="alert">Paste a valid YouTube video URL.</p>}
        </div>
      )}
      {editing ? <input className="ui-wd-caption-input" aria-label="YouTube caption" value={block.caption} placeholder="Write a caption…" onChange={(event) => onChange?.({ caption: event.currentTarget.value })} /> : block.caption ? <figcaption>{block.caption}</figcaption> : null}
    </figure>
  )
}

function FieldNoteVideoCustomBlock({ block, editing, frameColor, stroke, onChange, onDelete }: { block: FieldNoteVideoBlock; editing: boolean; frameColor: string; stroke: WorkDetailRendererProps['stroke']; onChange?: (patch: Partial<FieldNoteVideoBlock>) => void; onDelete?: () => void }) {
  const [error, setError] = useState('')
  const readVideo = async (file?: File) => {
    if (!file) return
    setError('Reading video…')
    try {
      const src = await readLocalVideo(file)
      setError('')
      onChange?.({ src, title: block.title || file.name.replace(/\.[^.]+$/, '') })
    } catch (readError) {
      setError(readError instanceof Error ? readError.message : 'This video could not be read.')
    }
  }

  return (
    <figure className={`ui-wd-custom-video align-${block.align}`} style={{ '--ui-wd-custom-video-width': `${block.width}%` } as CSSProperties}>
      {editing && (
        <div className="ui-wd-custom-tools image-tools">
          <label>Align<select aria-label="Video alignment" value={block.align} onChange={(event) => onChange?.({ align: event.currentTarget.value as FieldNoteVideoBlock['align'] })}><option value="left">Left</option><option value="center">Center</option><option value="right">Right</option></select></label>
          <label className="ui-wd-image-width">Width <output>{Math.round(block.width)}%</output><input aria-label="Video width" type="range" min="25" max="100" value={block.width} onChange={(event) => onChange?.({ width: Number(event.currentTarget.value) })} /></label>
          <button type="button" className="ui-wd-delete-block" onClick={onDelete}>Delete</button>
        </div>
      )}
      <RoughFrame className="ui-wd-custom-video-frame" color={frameColor} borderPlacement="outside" {...stroke}>
        {block.src
          ? <video src={block.src} aria-label={block.title || 'Project video'} controls playsInline preload="metadata" />
          : <div className="ui-wd-image-placeholder"><span aria-hidden="true">▶</span><strong>Add a video</strong><small>Upload a file or paste a direct video URL</small></div>}
      </RoughFrame>
      {editing && (
        <div className="ui-wd-video-fields">
          <label className="ui-wd-upload-button">Upload video<input aria-label="Upload video" type="file" accept="video/*" onChange={(event) => { void readVideo(event.currentTarget.files?.[0]); event.currentTarget.value = '' }} /></label>
          <label>Video URL<input aria-label="Video URL" type="url" value={block.src.startsWith('data:') ? '' : block.src} placeholder="https://…/video.mp4" onChange={(event) => { setError(''); onChange?.({ src: event.currentTarget.value }) }} /></label>
          <label>Accessible title<input aria-label="Video title" value={block.title} placeholder="Describe the video" onChange={(event) => onChange?.({ title: event.currentTarget.value })} /></label>
          <small>Local videos: {MAX_LOCAL_VIDEO_LABEL} max</small>
          {error && <p className="ui-wd-image-error" role="alert">{error}</p>}
        </div>
      )}
      {editing ? <input className="ui-wd-caption-input" aria-label="Video caption" value={block.caption} placeholder="Write a caption…" onChange={(event) => onChange?.({ caption: event.currentTarget.value })} /> : block.caption ? <figcaption>{block.caption}</figcaption> : null}
    </figure>
  )
}

function FieldNoteTemplate({ project, reduced, frameColor, stroke, onBack, onPrevious, onNext, fieldNoteLayout, fieldNoteBreakpoint = 'desktop', fieldNoteEditing = false, fieldNoteShowEmptyMedia = false, fieldNoteBlocks = [], fieldNoteFullText = [], fieldNoteFullTextFormat = 'plain', fieldNoteFullTextContent = '', fieldNoteFullTextExpanded = false, onFieldNoteFullTextToggle, onFieldNoteLayoutChange, onFieldNoteBlockChange, onFieldNoteBlockDelete }: TemplateContentProps) {
  const layout = fieldNoteLayout ?? createDefaultFieldNoteLayout()[fieldNoteBreakpoint]
  const [activeSlide, setActiveSlide] = useState(0)
  const [expandedMediaIndex, setExpandedMediaIndex] = useState<number | null>(null)
  const [draggedBlock, setDraggedBlock] = useState<FieldNoteBlockId | null>(null)
  const style = {
    '--ui-wd-note-title-width': `${layout.titleWidth}px`,
    '--ui-wd-note-copy-width': `${layout.copyWidth}px`,
    '--ui-wd-note-media-gap': `${layout.mediaGap}px`,
    '--ui-wd-note-media-height': `${layout.mediaHeight}px`,
    '--ui-wd-note-second-offset': `${layout.secondOffset}px`,
    '--ui-wd-note-body-gap': `${layout.bodyGap}px`,
    '--ui-wd-note-slides-per-view': layout.slidesPerView,
    '--ui-wd-note-active-slide': activeSlide,
    '--ui-wd-note-title-x': `${layout.titleX}px`,
    '--ui-wd-note-title-y': `${layout.titleY}px`,
  } as CSSProperties

  const beginResize = (event: ReactPointerEvent<HTMLButtonElement>, field: 'copyWidth' | 'mediaHeight' | 'mediaGap') => {
    event.preventDefault()
    const horizontal = field === 'copyWidth' || field === 'mediaGap'
    const start = horizontal ? event.clientX : event.clientY
    const initial = layout[field]
    const target = event.currentTarget
    target.setPointerCapture(event.pointerId)
    const move = (moveEvent: PointerEvent) => {
      const delta = (horizontal ? moveEvent.clientX : moveEvent.clientY) - start
      const limits = field === 'copyWidth' ? [220, 900] : field === 'mediaGap' ? [0, 80] : [100, 520]
      onFieldNoteLayoutChange?.({ [field]: Math.min(limits[1], Math.max(limits[0], initial + delta)) })
    }
    const end = () => {
      target.removeEventListener('pointermove', move)
      target.removeEventListener('pointerup', end)
      target.removeEventListener('pointercancel', end)
    }
    target.addEventListener('pointermove', move)
    target.addEventListener('pointerup', end)
    target.addEventListener('pointercancel', end)
  }

  const beginTitleMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.preventDefault()
    const startX = event.clientX
    const startY = event.clientY
    const initialX = layout.titleX
    const initialY = layout.titleY
    const target = event.currentTarget
    target.setPointerCapture(event.pointerId)
    const move = (moveEvent: PointerEvent) => onFieldNoteLayoutChange?.({
      titleX: Math.min(300, Math.max(-300, initialX + moveEvent.clientX - startX)),
      titleY: Math.min(200, Math.max(-200, initialY + moveEvent.clientY - startY)),
    })
    const end = () => {
      target.removeEventListener('pointermove', move)
      target.removeEventListener('pointerup', end)
      target.removeEventListener('pointercancel', end)
    }
    target.addEventListener('pointermove', move)
    target.addEventListener('pointerup', end)
    target.addEventListener('pointercancel', end)
  }

  const dragProps = (id: FieldNoteBlockId) => ({
    draggable: fieldNoteEditing,
    onDragStartCapture: (event: DragEvent<HTMLElement>) => {
      setDraggedBlock(id)
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData('text/plain', id)
    },
    onDragOverCapture: (event: DragEvent<HTMLElement>) => {
      if (fieldNoteEditing) event.preventDefault()
    },
    onDropCapture: (event: DragEvent<HTMLElement>) => {
      event.preventDefault()
      if (draggedBlock && draggedBlock !== id) onFieldNoteLayoutChange?.({ order: moveFieldNoteBlock(layout.order, draggedBlock, id) })
      setDraggedBlock(null)
    },
    onDragEndCapture: () => setDraggedBlock(null),
  })

  const editHeader = (label: string) => fieldNoteEditing ? <span className="ui-wd-block-handle" aria-hidden="true">⋮⋮ {label}</span> : null

  const hasFullText = fieldNoteFullTextFormat === 'markdown'
    ? fieldNoteFullTextContent.trim().length > 0
    : fieldNoteFullText.some((paragraph) => paragraph.trim().length > 0)
  const fullTextContent = hasFullText ? <>
    <button type="button" className="ui-wd-note-disclosure" aria-expanded={fieldNoteFullTextExpanded} aria-controls={`field-note-full-text-${project.id}`} onClick={onFieldNoteFullTextToggle}><span aria-hidden="true">⌄</span>{fieldNoteFullTextExpanded ? 'Hide full text' : 'See full text'}</button>
    {fieldNoteFullTextExpanded && <motion.div id={`field-note-full-text-${project.id}`} className="ui-wd-note-full-text" initial={reduced ? false : { opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={reduced ? { duration: 0 } : { duration: .18, ease: 'easeOut' }}>
      {fieldNoteFullTextFormat === 'markdown' ? <MarkdownContent content={fieldNoteFullTextContent} /> : fieldNoteFullText.map((paragraph, index) => <p key={`${index}-${paragraph}`}>{paragraph}</p>)}
      <button type="button" className="ui-wd-note-disclosure is-bottom" aria-label="Collapse full text" onClick={onFieldNoteFullTextToggle}><span aria-hidden="true">⌃</span>Hide full text</button>
    </motion.div>}
  </> : null

  const footerContent = (project.footerEnabled ?? true) ? <>
    <div><span className="ui-wd-label">{project.sectionLabels?.outcome ?? 'A useful result'}</span><p><InlineMarkdownContent content={project.outcome} /></p></div>
    <div><span className="ui-wd-label">{project.sectionLabels?.process ?? 'Things worth keeping'}</span><ul>{project.process.filter((step) => step.trim()).map((step, index) => <li key={`${index}-${step}`}><InlineMarkdownContent content={step} /></li>)}</ul></div>
    <div><span className="ui-wd-label">{project.sectionLabels?.credits ?? 'Credits'}</span>{project.credits.filter((credit) => credit.trim()).map((credit, index) => <p key={`${index}-${credit}`}><InlineMarkdownContent content={credit} /></p>)}</div>
  </> : null

  const mediaStrip = (
    <div className={`ui-wd-note-strip is-${layout.mediaMode}`}>
      <div className="ui-wd-note-track" data-item-count={Math.min(project.media.length, 3)}>
        {project.media.map((_, index) => <MediaPanel key={project.media[index].id} project={project} index={index} reduced={reduced} onExpand={setExpandedMediaIndex} />)}
      </div>
      {fieldNoteEditing && layout.mediaMode === 'grid' && <button type="button" className="ui-wd-gap-handle" aria-label="Adjust image gap" onPointerDown={(event) => beginResize(event, 'mediaGap')}><span>↔</span></button>}
      {layout.mediaMode === 'carousel' && (
        <div className="ui-wd-carousel-controls">
          <button type="button" aria-label="Previous slide" onClick={() => setActiveSlide((current) => current > 0 ? current - 1 : layout.loop ? project.media.length - 1 : 0)}><span aria-hidden="true">{'<'}</span></button>
          {layout.showDots && <div>{project.media.map((media, index) => <button key={media.id} type="button" aria-label={`Go to slide ${index + 1}`} aria-current={activeSlide === index} onClick={() => setActiveSlide(index)} />)}</div>}
          <button type="button" aria-label="Next slide" onClick={() => setActiveSlide((current) => current < project.media.length - 1 ? current + 1 : layout.loop ? 0 : current)}><span aria-hidden="true">{'>'}</span></button>
        </div>
      )}
      {layout.mediaMode === 'carousel' && project.media.some((item) => item.src) && <button type="button" className="ui-wd-carousel-expand" aria-label="Expand carousel" onClick={() => setExpandedMediaIndex(project.media[activeSlide]?.src ? activeSlide : project.media.findIndex((item) => item.src))}><span className="ui-wd-expand-arrow" aria-hidden="true">{'->'}</span></button>}
    </div>
  )

  const renderMediaBlock = (embedded = false) => (
    <section
      key={embedded ? 'body-media' : 'media'}
      className={`${embedded ? '' : 'ui-wd-editable-block '}ui-wd-note-media-block${embedded ? ' is-in-body' : ''}`}
      data-field-note-block={embedded ? undefined : 'media'}
      {...(embedded ? {} : dragProps('media'))}
    >
      {!embedded && editHeader('Media')}
      {layout.mediaMode === 'carousel'
        ? <RoughFrame className="ui-wd-note-media-frame" color={frameColor} {...stroke}>{mediaStrip}</RoughFrame>
        : <div className="ui-wd-note-media-frame">{mediaStrip}</div>}
      {fieldNoteEditing && <button type="button" className="ui-wd-resize-handle media" aria-label="Resize media height" onPointerDown={(event) => beginResize(event, 'mediaHeight')} />}
    </section>
  )

  const blocks: Record<FieldNoteBuiltInBlockId, ReactNode> = {
    intro: (
      <motion.header key="intro" className="ui-wd-editable-block" data-field-note-block="intro" {...dragProps('intro')} {...entrance(TIMING.title, reduced)}>
        {editHeader('Introduction')}
        <div className="ui-wd-note-copy">
          <div className="ui-wd-note-title-wrap">
            <h1>{project.title}</h1>
            {fieldNoteEditing && <button type="button" className="ui-wd-title-move-handle" aria-label="Move field note title" onPointerDown={beginTitleMove}>↔</button>}
          </div>
          <p><InlineMarkdownContent content={project.overview} /></p>
          {fieldNoteEditing && <button type="button" className="ui-wd-resize-handle copy" aria-label="Resize introduction text" onPointerDown={(event) => beginResize(event, 'copyWidth')} />}
        </div>
        <ProjectFacts project={project} />
      </motion.header>
    ),
    media: layout.mediaEnabled && (project.media.length > 0 || fieldNoteShowEmptyMedia) ? renderMediaBlock() : null,
    fullText: fullTextContent ? (
      <motion.section key="fullText" className="ui-wd-note-body ui-wd-note-full-text-panel ui-wd-editable-block" data-field-note-block="fullText" {...dragProps('fullText')} {...entrance(TIMING.sections, reduced)}>
        <RoughDivider className="ui-wd-note-body-divider" color={frameColor} {...stroke} />
        {editHeader('Full text')}
        {fullTextContent}
      </motion.section>
    ) : null,
    footer: footerContent ? (
      <motion.section key="footer" className="ui-wd-note-body ui-wd-note-footer ui-wd-editable-block" data-field-note-block="footer" {...dragProps('footer')} {...entrance(TIMING.sections, reduced)}>
        <RoughDivider className="ui-wd-note-body-divider" color={frameColor} {...stroke} />
        {editHeader('Footer')}
        {footerContent}
      </motion.section>
    ) : null,
  }

  const renderBlock = (id: FieldNoteBlockId) => {
    if (id === 'intro' || id === 'media' || id === 'fullText' || id === 'footer') return blocks[id]
    const custom = fieldNoteBlocks.find((block) => `custom:${block.id}` === id)
    if (!custom) return null
    return (
      <motion.section key={id} className="ui-wd-custom-block ui-wd-editable-block" data-field-note-block={id} {...dragProps(id)} {...entrance(TIMING.sections, reduced)}>
        {editHeader(custom.type === 'text' ? 'Text' : custom.type === 'image' ? 'Image' : custom.type === 'video' ? 'Video' : 'YouTube')}
        {custom.type === 'text'
          ? <FieldNoteTextCustomBlock block={custom} editing={fieldNoteEditing} onChange={(patch) => onFieldNoteBlockChange?.(custom.id, patch)} onDelete={() => onFieldNoteBlockDelete?.(custom.id)} />
          : custom.type === 'image'
            ? <FieldNoteImageCustomBlock block={custom} editing={fieldNoteEditing} frameColor={frameColor} stroke={stroke} onChange={(patch) => onFieldNoteBlockChange?.(custom.id, patch)} onDelete={() => onFieldNoteBlockDelete?.(custom.id)} />
            : custom.type === 'video'
              ? <FieldNoteVideoCustomBlock block={custom} editing={fieldNoteEditing} frameColor={frameColor} stroke={stroke} onChange={(patch) => onFieldNoteBlockChange?.(custom.id, patch)} onDelete={() => onFieldNoteBlockDelete?.(custom.id)} />
              : <FieldNoteYouTubeCustomBlock block={custom} editing={fieldNoteEditing} frameColor={frameColor} stroke={stroke} onChange={(patch) => onFieldNoteBlockChange?.(custom.id, patch)} onDelete={() => onFieldNoteBlockDelete?.(custom.id)} />}
      </motion.section>
    )
  }

  return (
    <article className={`ui-wd-template ui-wd-field-note${fieldNoteEditing ? ' is-editing' : ''}`} data-field-note-breakpoint={fieldNoteBreakpoint} data-intro-layout={layout.introLayout} style={style}>
      {layout.order.map(renderBlock)}
      <WorkDetailEnding onBack={onBack} onPrevious={onPrevious} onNext={onNext} roughDivider={{ frameColor, stroke }} />
      {expandedMediaIndex !== null && <ProjectMediaLightbox project={project} sourceIndex={expandedMediaIndex} frameColor={frameColor} stroke={stroke} onSourceIndexChange={(index) => {
        setExpandedMediaIndex(index)
        setActiveSlide(index)
      }} onClose={() => setExpandedMediaIndex(null)} />}
    </article>
  )
}

export function WorkDetailRenderer(props: WorkDetailRendererProps) {
  if (props.template === 'visual-story') return <VisualStoryTemplate {...props} />
  if (props.template === 'field-note') return <FieldNoteTemplate {...props} />
  return <CaseStudyTemplate {...props} />
}

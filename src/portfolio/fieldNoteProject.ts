import type { WorkListProject, WorkProjectBlock } from '../figma-lab/workListData'
import type { FieldNoteCustomBlock } from '../ui-lab/work-details/fieldNoteContent'
import {
  createDefaultFieldNoteLayout,
  normalizeFieldNoteLayout,
  type FieldNoteBlockId,
  type FieldNoteBreakpoint,
  type FieldNoteBreakpointLayout,
} from '../ui-lab/work-details/fieldNoteLayout'
import { UI_LAB_WORK_DETAIL_PROJECTS } from '../ui-lab/work-details/workDetailData'
import type { WorkDetailProject } from '../ui-lab/work-details/workDetailTypes'

const UI_LAB_SOURCE_BY_SLUG: Record<string, string> = {
  'making-complex-tools-feel-obvious': 'complex-tools',
  'a-kinder-way-through-the-workflow': 'kinder-workflow',
  'from-loose-ideas-to-a-system': 'loose-ideas',
}

function findUiLabProject(project: WorkListProject) {
  const sourceId = UI_LAB_SOURCE_BY_SLUG[project.slug]
  return UI_LAB_WORK_DETAIL_PROJECTS.find((item) => item.id === sourceId || item.title === project.title)
}

export function toFieldNoteProject(project: WorkListProject): WorkDetailProject {
  const source = findUiLabProject(project) ?? UI_LAB_WORK_DETAIL_PROJECTS[0]
  const projectImages = project.media.flatMap((media) => media.type === 'image'
    ? [media]
    : media.type === 'gallery'
      ? media.images
      : []).filter((image) => image.showInProject !== false)
  const tones = ['pink', 'blue', 'gold', 'green', 'violet'] as const
  return {
    ...source,
    id: project.slug,
    title: project.title,
    meta: project.meta,
    year: project.year ?? source.year,
    role: project.role ?? source.role,
    services: project.services ?? source.services,
    overview: project.introduction ?? (project.summary || source.overview),
    outcome: project.fieldNoteFooter?.outcome ?? source.outcome,
    process: project.fieldNoteFooter?.process ?? source.process,
    credits: project.credits ?? source.credits,
    sectionLabels: project.fieldNoteLabels,
    factVisibility: project.fieldNoteFactVisibility,
    footerEnabled: project.fieldNoteFooterEnabled ?? true,
    footerPlacement: project.fieldNoteFooterPlacement ?? 'below',
    media: projectImages.map((image, index) => ({
      id: `${project.slug}-media-${index}`,
      label: image.alt || '',
      caption: image.caption || '',
      tone: tones[index % tones.length],
      src: image.src,
      thumbnailSrc: image.thumbnailSrc,
      fullSrc: image.fullSrc,
      alt: image.alt,
    })),
    template: 'field-note',
  }
}

export function toFieldNoteBlocks(blocks: WorkProjectBlock[]): FieldNoteCustomBlock[] {
  return blocks.filter((block) => block.type !== 'image' || block.showInProject !== false).map((block) => block.type === 'text'
    ? { ...block, align: 'left' as const }
    : { ...block, align: 'center' as const, width: 100 })
}

export function getFieldNoteLayout(project: WorkListProject, breakpoint: FieldNoteBreakpoint = 'desktop'): FieldNoteBreakpointLayout {
  const saved = project.fieldNoteLayout
    ? normalizeFieldNoteLayout(project.fieldNoteLayout)[breakpoint]
    : createDefaultFieldNoteLayout()[breakpoint]
  const availableCustomBlocks = new Set(project.blocks.map((block) => `custom:${block.id}` as FieldNoteBlockId))
  const order = saved.order.filter((id) => !id.startsWith('custom:') || availableCustomBlocks.has(id))
  const missingCustomBlocks = [...availableCustomBlocks].filter((id) => !order.includes(id))
  const fullTextIndex = order.indexOf('fullText')
  order.splice(fullTextIndex < 0 ? order.length : fullTextIndex, 0, ...missingCustomBlocks)
  return { ...saved, order }
}

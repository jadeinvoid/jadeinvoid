import type { UiCategoryId } from '../ui-lab/categories'
import type { FieldNoteLayout } from '../ui-lab/work-details/fieldNoteLayout'

export interface WorkImage {
  src: string
  thumbnailSrc?: string
  fullSrc?: string
  alt: string
  caption?: string
  showInProject?: boolean
}

export type WorkProjectMedia =
  | ({ type: 'image'; id?: string } & WorkImage)
  | { type: 'youtube'; videoId: string; title: string }
  | { type: 'gallery'; title: string; images: WorkImage[] }

export type WorkProjectTemplate = 'case-study' | 'visual-story' | 'field-note'

export type WorkProjectBlock =
  | { id: string; type: 'text'; content: string; style: 'paragraph' | 'heading' | 'quote'; width: number }
  | { id: string; type: 'image'; src: string; thumbnailSrc?: string; fullSrc?: string; alt: string; caption: string; showInProject?: boolean }
  | { id: string; type: 'video'; src: string; thumbnailSrc?: string; title: string; caption: string }
  | { id: string; type: 'youtube'; url: string; title: string; caption: string }

export interface WorkListProject {
  slug: string
  title: string
  meta: string
  summary: string
  introduction?: string
  fullTextFormat?: 'plain' | 'markdown'
  fullTextContent?: string
  year?: string
  role?: string
  services?: string[]
  credits?: string[]
  fieldNoteLabels?: {
    outcome: string
    process: string
    credits: string
  }
  fieldNoteFooter?: {
    outcome: string
    process: string[]
  }
  fieldNoteFooterEnabled?: boolean
  fieldNoteFooterPlacement?: 'above' | 'below'
  fieldNoteFactVisibility?: {
    year: boolean
    role: boolean
    scope: boolean
  }
  rationale: string[]
  media: WorkProjectMedia[]
  template: WorkProjectTemplate
  blocks: WorkProjectBlock[]
  thumbnail?: { source: 'block' | 'media'; id: string }
  fieldNoteLayout?: FieldNoteLayout
}

export interface WorkListCategory {
  explanation: string
  projects: WorkListProject[]
}

export interface WorkProjectLocation {
  category: UiCategoryId
  index: number
  project: WorkListProject
}

export function createWorkImageId() {
  return `image-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

export function resolveWorkProjectThumbnail(project: WorkListProject): WorkImage | null {
  if (!project.thumbnail) return null
  if (project.thumbnail.source === 'block') {
    const block = project.blocks.find((item) => item.type === 'image' && item.id === project.thumbnail?.id)
      ?? project.blocks.find((item) => item.type === 'video' && item.id === project.thumbnail?.id)
    if (block?.type === 'image' && block.src) return block
    if (block?.type === 'video' && block.thumbnailSrc) return { src: block.thumbnailSrc, alt: block.title }
    return null
  }
  const media = project.media.find((item) => item.type === 'image' && item.id === project.thumbnail?.id)
  return media?.type === 'image' && media.src ? media : null
}

export function resolveFirstWorkCategoryThumbnail(projects: WorkListProject[]): WorkImage | null {
  for (const project of projects) {
    const thumbnail = resolveWorkProjectThumbnail(project)
    if (thumbnail) return thumbnail
  }
  return null
}

interface WorkListProjectSeed {
  title: string
  meta: string
}

function slugifyProjectTitle(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function defineProjects(projects: WorkListProjectSeed[]): WorkListProject[] {
  return projects.map((project) => ({
    ...project,
    slug: slugifyProjectTitle(project.title),
    summary: '',
    rationale: [],
    media: [],
    template: 'case-study',
    blocks: [],
  }))
}

export const WORK_LISTS: Record<UiCategoryId, WorkListCategory> = {
  ux: {
    explanation: 'Reshaping fragmented flow into a one unified, useful and approachable experiences.',
    projects: defineProjects([
      { title: 'Making complex tools feel obvious', meta: 'Product design / Research' },
      { title: 'A kinder way through the workflow', meta: 'UX strategy / Prototyping' },
      { title: 'Field notes for better decisions', meta: 'Research / Synthesis' },
      { title: 'From loose ideas to a system', meta: 'Interaction / Design systems' },
      { title: 'Testing the path before building', meta: 'Prototype / Usability' },
      { title: 'Small details, clearer outcomes', meta: 'Product polish / Accessibility' },
      { title: 'Finding the signal in the noise', meta: 'Discovery / Information architecture' },
      { title: 'A service shaped around people', meta: 'Service design / Journey mapping' },
    ]),
  },
  illustration: {
    explanation: 'Creating illustration that have distinct and expressive voices with stylistic versatility.',
    projects: defineProjects([
      { title: 'Characters with something to say', meta: 'Character design / Editorial' },
      { title: 'A small world of odd creatures', meta: 'Illustration / Storytelling' },
      { title: 'Drawing ideas into focus', meta: 'Concept art / Direction' },
      { title: 'Pictures for curious readers', meta: 'Editorial / Publishing' },
      { title: 'Loose lines and lively gestures', meta: 'Sketchbook / Studies' },
      { title: 'Tiny narratives, big feelings', meta: 'Personal work / Series' },
      { title: 'Scenes from an imaginary place', meta: 'World building / Narrative' },
      { title: 'An image for the front page', meta: 'Editorial / Commission' },
    ]),
  },
  visual: {
    explanation: 'Always looking for opportunities to create something fun, try something new, and expand across different domains.',
    projects: defineProjects([
      { title: 'An identity built to move', meta: 'Brand system / Motion' },
      { title: 'A campaign with many voices', meta: 'Art direction / Campaign' },
      { title: 'Making information feel inviting', meta: 'Editorial / Layout' },
      { title: 'A flexible family of graphics', meta: 'Visual system / Toolkit' },
      { title: 'Type, rhythm, and a little friction', meta: 'Typography / Exploration' },
      { title: 'Digital moments with character', meta: 'Web design / Direction' },
      { title: 'A language for the whole family', meta: 'Identity / Guidelines' },
      { title: 'Posters that refuse to whisper', meta: 'Campaign / Print' },
    ]),
  },
  other: {
    explanation: 'Experiments, archived works, odd jobs and side quests.',
    projects: defineProjects([
      { title: 'A playful prototype in a weekend', meta: 'Experiment / Creative code' },
      { title: 'Objects made for the occasion', meta: 'Making / Collaboration' },
      { title: 'Notes from an unfinished idea', meta: 'Process / Research' },
      { title: 'A tiny tool for a real need', meta: 'Utility / Prototype' },
      { title: 'Posters, fragments, and tests', meta: 'Selected explorations' },
      { title: 'The projects between projects', meta: 'Miscellany / Archive' },
      { title: 'A strange little interaction', meta: 'Creative code / Study' },
      { title: 'Things learned while making', meta: 'Process / Collection' },
    ]),
  },
}

export function findWorkProject(slug: string, lists: Record<UiCategoryId, WorkListCategory> = WORK_LISTS): WorkProjectLocation | null {
  for (const [category, work] of Object.entries(lists) as [UiCategoryId, WorkListCategory][]) {
    const index = work.projects.findIndex((project) => project.slug === slug)
    if (index >= 0) return { category, index, project: work.projects[index] }
  }
  return null
}

export function getAdjacentWorkProjects(category: UiCategoryId, slug: string, lists: Record<UiCategoryId, WorkListCategory> = WORK_LISTS) {
  const projects = lists[category].projects
  const index = projects.findIndex((project) => project.slug === slug)
  if (index < 0) return { previous: null, next: null }
  return {
    previous: projects[index - 1] ?? null,
    next: projects[index + 1] ?? null,
  }
}

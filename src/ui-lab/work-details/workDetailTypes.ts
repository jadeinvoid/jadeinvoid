export type WorkDetailTemplateId = 'case-study' | 'visual-story' | 'field-note'

export type WorkDetailMediaTone = 'pink' | 'blue' | 'green' | 'violet' | 'gold'

export interface WorkDetailMedia {
  id: string
  label: string
  caption: string
  tone: WorkDetailMediaTone
  src?: string
  thumbnailSrc?: string
  fullSrc?: string
  alt?: string
}

export interface WorkDetailProject {
  id: string
  title: string
  meta: string
  year: string
  role: string
  services: string[]
  overview: string
  outcome: string
  process: string[]
  credits: string[]
  sectionLabels?: {
    outcome: string
    process: string
    credits: string
  }
  factVisibility?: {
    year: boolean
    role: boolean
    scope: boolean
  }
  footerEnabled?: boolean
  footerPlacement?: 'above' | 'below'
  media: WorkDetailMedia[]
  template: WorkDetailTemplateId
}

export interface WorkDetailTemplateDefinition {
  id: WorkDetailTemplateId
  label: string
  shortLabel: string
  description: string
  idealFor: string
  structure: string
}

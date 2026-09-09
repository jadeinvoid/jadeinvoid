import { MAX_LOCAL_IMAGE_DATA_URL_LENGTH } from '../../portfolio/localImage'
import { MAX_LOCAL_VIDEO_DATA_URL_LENGTH } from '../../portfolio/localVideo'

export type FieldNoteTextStyle = 'paragraph' | 'heading' | 'quote'
export type FieldNoteBlockAlign = 'left' | 'center' | 'right'

interface FieldNoteCustomBlockBase {
  id: string
  align: FieldNoteBlockAlign
}

export interface FieldNoteTextBlock extends FieldNoteCustomBlockBase {
  type: 'text'
  content: string
  style: FieldNoteTextStyle
  width: number
}

export interface FieldNoteImageBlock extends FieldNoteCustomBlockBase {
  type: 'image'
  src: string
  thumbnailSrc?: string
  fullSrc?: string
  alt: string
  caption: string
  width: number
}

export interface FieldNoteYouTubeBlock extends FieldNoteCustomBlockBase {
  type: 'youtube'
  url: string
  title: string
  caption: string
  width: number
}

export interface FieldNoteVideoBlock extends FieldNoteCustomBlockBase {
  type: 'video'
  src: string
  title: string
  caption: string
  width: number
}

export type FieldNoteCustomBlock = FieldNoteTextBlock | FieldNoteImageBlock | FieldNoteVideoBlock | FieldNoteYouTubeBlock
export type FieldNoteContentLibrary = Record<string, FieldNoteCustomBlock[]>

export const FIELD_NOTE_CONTENT_KEY = 'asset-motion-sandbox:ui-lab:field-note-content:v1'

function align(value: unknown): FieldNoteBlockAlign {
  return value === 'center' || value === 'right' ? value : 'left'
}

function safeString(value: unknown, fallback = '', maxLength = 50_000) {
  return typeof value === 'string' ? value.slice(0, maxLength) : fallback
}

function normalizeBlock(value: unknown): FieldNoteCustomBlock | null {
  if (!value || typeof value !== 'object') return null
  const input = value as Partial<FieldNoteCustomBlock>
  const id = safeString(input.id).replace(/[^a-zA-Z0-9_-]/g, '')
  if (!id) return null
  if (input.type === 'text') {
    const width = typeof input.width === 'number' && Number.isFinite(input.width) ? input.width : 100
    return {
      id,
      type: 'text',
      content: safeString(input.content),
      style: input.style === 'heading' || input.style === 'quote' ? input.style : 'paragraph',
      align: align(input.align),
      width: Math.min(100, Math.max(25, width)),
    }
  }
  if (input.type === 'image') {
    const width = typeof input.width === 'number' && Number.isFinite(input.width) ? input.width : 100
    return {
      id,
      type: 'image',
      src: safeString(input.src, '', MAX_LOCAL_IMAGE_DATA_URL_LENGTH),
      alt: safeString(input.alt),
      caption: safeString(input.caption),
      width: Math.min(100, Math.max(25, width)),
      align: align(input.align),
    }
  }
  if (input.type === 'youtube') {
    const width = typeof input.width === 'number' && Number.isFinite(input.width) ? input.width : 100
    return {
      id,
      type: 'youtube',
      url: safeString(input.url, '', 2_000),
      title: safeString(input.title, '', 500),
      caption: safeString(input.caption, '', 2_000),
      width: Math.min(100, Math.max(25, width)),
      align: align(input.align),
    }
  }
  if (input.type === 'video') {
    const width = typeof input.width === 'number' && Number.isFinite(input.width) ? input.width : 100
    return {
      id,
      type: 'video',
      src: safeString(input.src, '', MAX_LOCAL_VIDEO_DATA_URL_LENGTH),
      title: safeString(input.title, '', 500),
      caption: safeString(input.caption, '', 2_000),
      width: Math.min(100, Math.max(25, width)),
      align: align(input.align),
    }
  }
  return null
}

export function createFieldNoteCustomBlock(type: 'text' | 'image' | 'video' | 'youtube', id: string): FieldNoteCustomBlock {
  if (type === 'text') return { id, type, content: '', style: 'paragraph', align: 'left', width: 100 }
  if (type === 'image') return { id, type, src: '', alt: '', caption: '', width: 100, align: 'center' }
  if (type === 'video') return { id, type, src: '', title: '', caption: '', width: 100, align: 'center' }
  return { id, type, url: '', title: '', caption: '', width: 100, align: 'center' }
}

export function readFieldNoteContent(storage: Storage): FieldNoteContentLibrary {
  try {
    const raw = storage.getItem(FIELD_NOTE_CONTENT_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
    return Object.fromEntries(Object.entries(parsed).map(([projectId, blocks]) => [
      projectId,
      Array.isArray(blocks) ? blocks.map(normalizeBlock).filter((block): block is FieldNoteCustomBlock => block !== null) : [],
    ]))
  } catch {
    return {}
  }
}

export function writeFieldNoteContent(storage: Storage, content: FieldNoteContentLibrary) {
  storage.setItem(FIELD_NOTE_CONTENT_KEY, JSON.stringify(content))
}

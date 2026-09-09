export type FieldNoteBreakpoint = 'desktop' | 'tablet' | 'mobile'
export type FieldNoteBuiltInBlockId = 'intro' | 'media' | 'fullText' | 'footer'
export type FieldNoteBlockId = FieldNoteBuiltInBlockId | `custom:${string}`
export type FieldNoteMediaMode = 'grid' | 'carousel'
export type FieldNoteMediaPlacement = 'header' | 'body'
export type FieldNoteIntroLayout = 'split' | 'stacked' | 'reversed'

export interface FieldNoteBreakpointLayout {
  order: FieldNoteBlockId[]
  titleWidth: number
  copyWidth: number
  mediaGap: number
  mediaHeight: number
  secondOffset: number
  bodyGap: number
  mediaMode: FieldNoteMediaMode
  mediaEnabled: boolean
  mediaPlacement: FieldNoteMediaPlacement
  slidesPerView: number
  loop: boolean
  showDots: boolean
  titleX: number
  titleY: number
  introLayout: FieldNoteIntroLayout
}

export type FieldNoteLayout = Record<FieldNoteBreakpoint, FieldNoteBreakpointLayout>
export type FieldNoteLayoutLibrary = Record<string, FieldNoteLayout>

export const FIELD_NOTE_LAYOUTS_KEY = 'asset-motion-sandbox:ui-lab:field-note-layouts:v1'

const BLOCKS: FieldNoteBuiltInBlockId[] = ['intro', 'media', 'fullText', 'footer']

export function isFieldNoteBlockId(value: unknown): value is FieldNoteBlockId {
  return typeof value === 'string' && (BLOCKS.includes(value as FieldNoteBuiltInBlockId) || /^custom:[a-zA-Z0-9_-]+$/.test(value))
}

export function createDefaultFieldNoteLayout(): FieldNoteLayout {
  return {
    desktop: {
      order: [...BLOCKS], titleWidth: 600, copyWidth: 600, mediaGap: 14, mediaHeight: 170,
      secondOffset: 28, bodyGap: 54, mediaMode: 'grid', mediaEnabled: true, mediaPlacement: 'header', slidesPerView: 1, loop: true, showDots: true,
      titleX: 0, titleY: 0, introLayout: 'split',
    },
    tablet: {
      order: [...BLOCKS], titleWidth: 500, copyWidth: 500, mediaGap: 12, mediaHeight: 185,
      secondOffset: 18, bodyGap: 36, mediaMode: 'grid', mediaEnabled: true, mediaPlacement: 'header', slidesPerView: 1, loop: true, showDots: true,
      titleX: 0, titleY: 0, introLayout: 'stacked',
    },
    mobile: {
      order: [...BLOCKS], titleWidth: 340, copyWidth: 340, mediaGap: 10, mediaHeight: 220,
      secondOffset: 0, bodyGap: 24, mediaMode: 'carousel', mediaEnabled: true, mediaPlacement: 'header', slidesPerView: 1, loop: true, showDots: true,
      titleX: 0, titleY: 0, introLayout: 'stacked',
    },
  }
}

function finite(value: unknown, fallback: number, min: number, max: number) {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.min(max, Math.max(min, value))
    : fallback
}

function normalizeOrder(value: unknown, fallback: FieldNoteBlockId[]) {
  if (!Array.isArray(value)) return [...fallback]
  const migrated = value.flatMap((item) => item === 'body' ? ['fullText', 'footer'] : [item])
  const order = migrated.filter(isFieldNoteBlockId)
  const unique = [...new Set(order)]
  const hasBuiltIns = BLOCKS.every((block) => unique.includes(block))
  return hasBuiltIns ? unique : [...fallback]
}

function normalizeBreakpoint(value: unknown, fallback: FieldNoteBreakpointLayout): FieldNoteBreakpointLayout {
  const input = value && typeof value === 'object' ? value as Partial<FieldNoteBreakpointLayout> : {}
  return {
    order: normalizeOrder(input.order, fallback.order),
    titleWidth: finite(input.titleWidth, fallback.titleWidth, 180, 1000),
    copyWidth: finite(input.copyWidth, fallback.copyWidth, 220, 900),
    mediaGap: finite(input.mediaGap, fallback.mediaGap, 0, 80),
    mediaHeight: finite(input.mediaHeight, fallback.mediaHeight, 100, 520),
    secondOffset: finite(input.secondOffset, fallback.secondOffset, -100, 140),
    bodyGap: finite(input.bodyGap, fallback.bodyGap, 0, 120),
    mediaMode: input.mediaMode === 'carousel' ? 'carousel' : 'grid',
    mediaEnabled: typeof input.mediaEnabled === 'boolean' ? input.mediaEnabled : fallback.mediaEnabled,
    mediaPlacement: input.mediaPlacement === 'body' ? 'body' : 'header',
    slidesPerView: finite(input.slidesPerView, fallback.slidesPerView, 1, 3),
    loop: typeof input.loop === 'boolean' ? input.loop : fallback.loop,
    showDots: typeof input.showDots === 'boolean' ? input.showDots : fallback.showDots,
    titleX: finite(input.titleX, fallback.titleX, -300, 300),
    titleY: finite(input.titleY, fallback.titleY, -200, 200),
    introLayout: input.introLayout === 'split' || input.introLayout === 'stacked' || input.introLayout === 'reversed'
      ? input.introLayout
      : fallback.introLayout,
  }
}

export function normalizeFieldNoteLayout(value: unknown): FieldNoteLayout {
  const defaults = createDefaultFieldNoteLayout()
  const input = value && typeof value === 'object' ? value as Partial<FieldNoteLayout> : {}
  return {
    desktop: normalizeBreakpoint(input.desktop, defaults.desktop),
    tablet: normalizeBreakpoint(input.tablet, defaults.tablet),
    mobile: normalizeBreakpoint(input.mobile, defaults.mobile),
  }
}

export function readFieldNoteLayouts(storage: Storage): FieldNoteLayoutLibrary {
  try {
    const raw = storage.getItem(FIELD_NOTE_LAYOUTS_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
    return Object.fromEntries(Object.entries(parsed).map(([id, value]) => [id, normalizeFieldNoteLayout(value)]))
  } catch {
    return {}
  }
}

export function writeFieldNoteLayouts(storage: Storage, layouts: FieldNoteLayoutLibrary) {
  storage.setItem(FIELD_NOTE_LAYOUTS_KEY, JSON.stringify(layouts))
}

export function moveFieldNoteBlock(order: FieldNoteBlockId[], source: FieldNoteBlockId, target: FieldNoteBlockId) {
  if (source === target) return order
  const next = order.filter((id) => id !== source)
  next.splice(next.indexOf(target), 0, source)
  return next
}

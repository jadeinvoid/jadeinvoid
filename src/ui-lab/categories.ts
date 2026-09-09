import type { HatColliderProfileKey } from '../colliders/profiles'
import { parseHatOrder, type HatCategoryId } from '../config/hatLayout'

export type UiCategoryId = HatCategoryId
export type UiScreen = 'landing' | 'preview' | 'work'

export interface UiCategory {
  id: UiCategoryId
  label: string
  shortLabel: string
  hat: { kind: 'image'; src: string } | { kind: 'model'; src: string }
  collider: HatColliderProfileKey
}

export const uiCategories: UiCategory[] = [
  {
    id: 'ux',
    label: 'UX Design',
    shortLabel: 'UX',
    hat: { kind: 'image', src: '/landing-page-hats/hat-paperboat.png' },
    collider: 'paper-boat',
  },
  {
    id: 'illustration',
    label: 'Illustration',
    shortLabel: 'ILL',
    hat: { kind: 'image', src: '/landing-page-hats/hat-beret-2.png' },
    collider: 'beret',
  },
  {
    id: 'visual',
    label: 'Visual Design',
    shortLabel: 'VIS',
    hat: { kind: 'model', src: '/landing-page-hats/hat-cap.glb' },
    collider: 'cap',
  },
  {
    id: 'other',
    label: 'Others',
    shortLabel: 'ETC',
    hat: { kind: 'image', src: '/landing-page-hats/hat-magician.png' },
    collider: 'magician',
  },
]

export const uiProjects = [
  { title: 'Making complex tools feel obvious', meta: 'Product design / Research' },
  { title: 'A kinder way through the workflow', meta: 'UX strategy / Prototyping' },
  { title: 'Turning loose ideas into systems', meta: 'Interaction / Design systems' },
  { title: 'Experiments, sketches, and odd jobs', meta: 'Selected explorations' },
]

export function getUiCategory(id: UiCategoryId) {
  return uiCategories.find((category) => category.id === id) ?? uiCategories[0]
}

export function getOrderedUiCategories(order: string) {
  return parseHatOrder(order).map((id) => getUiCategory(id))
}

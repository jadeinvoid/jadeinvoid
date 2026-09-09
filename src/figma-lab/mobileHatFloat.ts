import type { UiCategoryId } from '../ui-lab/categories'

export const MOBILE_HAT_FLOAT: Record<UiCategoryId, { y: number; duration: number; delay: number }> = {
  ux: { y: 8, duration: 4.2, delay: 0.2 },
  illustration: { y: 7, duration: 4.7, delay: 0.8 },
  visual: { y: 9, duration: 3.8, delay: 0.5 },
  other: { y: 8, duration: 4.4, delay: 0 },
}

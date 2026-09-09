export const HAT_CATEGORY_IDS = ['ux', 'illustration', 'visual', 'other'] as const
export type HatCategoryId = typeof HAT_CATEGORY_IDS[number]

export const DEFAULT_HAT_ORDER = HAT_CATEGORY_IDS.join(',')

const labels: Record<HatCategoryId, string> = {
  ux: 'Paper Boat',
  illustration: 'Beret',
  visual: 'Cap',
  other: 'Magician',
}

function permutations<T>(items: readonly T[]): T[][] {
  if (items.length <= 1) return [Array.from(items)]
  return items.flatMap((item, index) => permutations([...items.slice(0, index), ...items.slice(index + 1)]).map((rest) => [item, ...rest]))
}

export const HAT_ORDER_OPTIONS = permutations(HAT_CATEGORY_IDS).map((order) => ({
  value: order.join(','),
  label: order.map((id) => labels[id]).join(' / '),
}))

export function parseHatOrder(value: string): HatCategoryId[] {
  const order = value.split(',')
  return order.length === HAT_CATEGORY_IDS.length
    && new Set(order).size === HAT_CATEGORY_IDS.length
    && order.every((id): id is HatCategoryId => HAT_CATEGORY_IDS.includes(id as HatCategoryId))
    ? order
    : [...HAT_CATEGORY_IDS]
}

export function moveHatInOrder(value: string, id: HatCategoryId, direction: -1 | 1) {
  const order = parseHatOrder(value)
  const index = order.indexOf(id)
  const target = index + direction
  if (target < 0 || target >= order.length) return order.join(',')
  const next = [...order]
  ;[next[index], next[target]] = [next[target], next[index]]
  return next.join(',')
}

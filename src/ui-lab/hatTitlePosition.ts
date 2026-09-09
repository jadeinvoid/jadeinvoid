export function getStageCenterYPercent(element: HTMLElement) {
  const stage = element.closest<HTMLElement>('.ui-lab-stage')
  if (!stage) return undefined
  const elementBounds = element.getBoundingClientRect()
  const stageBounds = stage.getBoundingClientRect()
  if (stageBounds.height === 0) return undefined
  return ((elementBounds.top + elementBounds.height / 2 - stageBounds.top) / stageBounds.height) * 100
}

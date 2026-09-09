import type { CharacterPartDefinition, CharacterSlot } from '../types'

const fullCanvas = { x: 0, y: 0, scale: 1, rotate: 0, opacity: 1, zIndex: 1 }
const animatedPortraitFrames = [1, 4, 2].map((frame) => `/character/portrait/no-eyes/portrait${frame}.png`)

export const characterParts: CharacterPartDefinition[] = [
  ...[1, 2, 3, 4].map((frame) => ({
    id: `portrait-${frame}`,
    name: `Portrait ${frame}`,
    slot: 'portrait' as const,
    src: `/character/portrait/no-eyes/portrait${frame}.png`,
    width: 400,
    height: 400,
    defaultTransform: { ...fullCanvas, zIndex: 1 },
  })),
  {
    id: 'portrait-animated',
    name: 'Portrait Animated / 3 Frames',
    slot: 'portrait',
    src: animatedPortraitFrames[0],
    frames: animatedPortraitFrames,
    width: 400,
    height: 400,
    defaultTransform: { ...fullCanvas, zIndex: 1 },
  },
  {
    id: 'eyes-open',
    name: 'Eyes Open',
    slot: 'eyes',
    src: '/character/eyes/eyes-open.png',
    width: 400,
    height: 400,
    defaultTransform: { ...fullCanvas, zIndex: 3 },
  },
  {
    id: 'eyes-closed',
    name: 'Eyes Closed',
    slot: 'eyes',
    src: '/character/eyes/eye-closed.png',
    width: 400,
    height: 400,
    defaultTransform: { ...fullCanvas, zIndex: 3 },
  },
  ...(['left', 'right'] as const).flatMap((side) => [
    {
      id: `eye-open-${side}`,
      name: `${side === 'left' ? 'Left' : 'Right'} Eye Open`,
      slot: side === 'left' ? 'leftEye' as const : 'rightEye' as const,
      src: `/character/eyes/individual/eye-open-${side}.png`,
      width: 400,
      height: 400,
      defaultTransform: { ...fullCanvas, zIndex: 3 },
    },
    {
      id: `eye-closed-${side}`,
      name: `${side === 'left' ? 'Left' : 'Right'} Eye Closed`,
      slot: side === 'left' ? 'leftEye' as const : 'rightEye' as const,
      src: `/character/eyes/individual/eye-closed-${side}.png`,
      width: 400,
      height: 400,
      defaultTransform: { ...fullCanvas, zIndex: 3 },
    },
  ]),
  {
    id: 'hand-cursor',
    name: 'Cursor Hand',
    slot: 'hand',
    src: '/character/hand/cursor-hand.png',
    width: 150,
    height: 150,
    defaultTransform: { x: 118, y: 112, scale: 1, rotate: -8, opacity: 1, zIndex: 5 },
  },
  {
    id: 'hand-cursor-click',
    name: 'Cursor Hand Click',
    slot: 'hand',
    src: '/character/hand/cursor-hand-click.png',
    width: 150,
    height: 150,
    defaultTransform: { x: 118, y: 112, scale: 1, rotate: -8, opacity: 1, zIndex: 5 },
  },
  {
    id: 'hand-landing',
    name: 'Landing Hand',
    slot: 'hand',
    src: '/character/hand/landing-hand.png',
    width: 150,
    height: 150,
    defaultTransform: { x: 116, y: 115, scale: 1, rotate: -6, opacity: 1, zIndex: 5 },
  },
  {
    id: 'hand-heart',
    name: 'Heart Hand',
    slot: 'hand',
    src: '/character/hand/heart-hand.png',
    width: 200,
    height: 150,
    defaultTransform: { x: 92, y: 118, scale: 1, rotate: 0, opacity: 1, zIndex: 5 },
  },
  {
    id: 'hand-large-heart',
    name: 'Large Heart Hand',
    slot: 'hand',
    src: '/character/hand/largeheart-hand.png',
    width: 200,
    height: 150,
    defaultTransform: { x: 92, y: 112, scale: 1, rotate: 0, opacity: 1, zIndex: 5 },
  },
  {
    id: 'hat-paperboat-2d',
    name: 'Paper Boat',
    slot: 'hat',
    src: '/landing-page-hats/hat-paperboat.png',
    width: 374,
    height: 220,
    defaultTransform: { x: 0, y: -104, scale: 0.56, rotate: 0, opacity: 1, zIndex: 6 },
  },
  {
    id: 'hat-beret-2',
    name: 'Beret',
    slot: 'hat',
    src: '/landing-page-hats/hat-beret-2.png',
    width: 467,
    height: 394,
    defaultTransform: { x: 0, y: -112, scale: 0.5, rotate: 0, opacity: 1, zIndex: 6 },
  },
  {
    id: 'hat-magician',
    name: 'Magician Hat',
    slot: 'hat',
    src: '/landing-page-hats/hat-magician.png',
    width: 352,
    height: 352,
    defaultTransform: { x: 2, y: -125, scale: 0.6, rotate: 2, opacity: 1, zIndex: 6 },
  },
]

export function characterPartOptions(slot: CharacterSlot, includeNone = false) {
  const options = characterParts
    .filter((part) => part.slot === slot)
    .map(({ id, name }) => ({ value: id, label: name }))
  return includeNone ? [{ value: 'none', label: 'None' }, ...options] : options
}

export function getCharacterPart(id: string) {
  return characterParts.find((part) => part.id === id)
}

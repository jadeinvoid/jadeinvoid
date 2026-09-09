import type { AssetDefinition, AssetKind } from '../types'
import { PaperBoatSvg } from '../components/PaperBoatSvg'

export const assets: AssetDefinition[] = [
  {
    id: 'hat-cap-3d',
    name: 'Cap / GLB',
    kind: 'model',
    src: '/landing-page-hats/hat-cap.glb',
    note: 'Existing binary glTF sample',
  },
  {
    id: 'paper-boat-svg',
    name: 'Paper Boat / Inline SVG',
    kind: 'svg',
    src: '/landing-page-hats/hat-paperboat.svg',
    inlineComponent: PaperBoatSvg,
    note: 'React version exposes separate animated SVG paths',
  },
  {
    id: 'paper-boat-png',
    name: 'Paper Boat / PNG',
    kind: 'image',
    src: '/landing-page-hats/hat-paperboat.png',
  },
  {
    id: 'portrait',
    name: 'UI Character Portrait / PNG',
    kind: 'image',
    src: '/character/portrait/no-eyes/portrait1.png',
    note: 'Portrait used by the UI Lab character rig',
  },
  {
    id: 'cursor-hand',
    name: 'Cursor Hand / PNG',
    kind: 'image',
    src: '/character/hand/cursor-hand.png',
  },
  {
    id: 'hat-beret-alt-2d',
    name: 'Beret / PNG',
    kind: 'image',
    src: '/landing-page-hats/hat-beret-2.png',
  },
  {
    id: 'hat-magician-2d',
    name: 'Magician Hat / PNG',
    kind: 'image',
    src: '/landing-page-hats/hat-magician.png',
  },
]

export const hatAssets = assets.filter((asset) => asset.id.startsWith('hat-') || asset.id === 'paper-boat-png' || asset.id === 'paper-boat-svg')
export const hatAssetOptions = hatAssets.map(({ id, name }) => ({ value: id, label: name }))

export const assetOptions = [
  ...assets.map(({ id, name }) => ({ value: id, label: name })),
  { value: 'local', label: 'Local file' },
]

export function inferAssetKind(fileName: string): AssetKind | null {
  const extension = fileName.split('.').pop()?.toLowerCase()
  if (extension === 'glb' || extension === 'gltf') return 'model'
  if (extension === 'svg') return 'svg'
  if (['png', 'jpg', 'jpeg', 'webp', 'avif', 'gif'].includes(extension ?? '')) return 'image'
  return null
}

const retiredIds: Record<string, string> = {
  'hat-beret': 'hat-beret-2',
  'hat-beret-2d': 'hat-beret-alt-2d',
  'hat-cap-2d': 'hat-cap-3d',
}

export function migrateRetiredAssetId(value: unknown) {
  return typeof value === 'string' ? retiredIds[value] ?? value : value
}

export function migrateRetiredCharacterHatId(value: unknown) {
  if (value === 'hat-cap-2d') return 'none'
  return migrateRetiredAssetId(value)
}

export function migrateRetiredCharacterSubjectHatId(value: unknown) {
  if (value === 'hat-cap-2d') return null
  return migrateRetiredAssetId(value)
}

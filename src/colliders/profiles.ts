export const COLLIDER_PROFILE_KEYS = ['paper-boat', 'beret', 'cap', 'magician', 'portrait'] as const

export type ColliderProfileKey = typeof COLLIDER_PROFILE_KEYS[number]
export type HatColliderProfileKey = Exclude<ColliderProfileKey, 'portrait'>

export interface ColliderPoint {
  x: number
  y: number
}

export interface ColliderProfile {
  outline: ColliderPoint[]
}

/** User-authored profiles override only the asset boundaries they customize. */
export type ColliderProfiles = Partial<Record<ColliderProfileKey, ColliderProfile>>
export type HitboxProfiles = ColliderProfiles

export const DEFAULT_COLLIDER_PROFILES: Readonly<Record<ColliderProfileKey, ColliderProfile>> = {
  'paper-boat': {
    outline: [
      { x: 0.03, y: 0.56 },
      { x: 0.2, y: 0.15 },
      { x: 0.48, y: 0.03 },
      { x: 0.76, y: 0.16 },
      { x: 0.98, y: 0.58 },
      { x: 0.79, y: 0.88 },
      { x: 0.22, y: 0.88 },
    ],
  },
  beret: {
    outline: [
      { x: 0.04, y: 0.58 },
      { x: 0.12, y: 0.3 },
      { x: 0.38, y: 0.08 },
      { x: 0.69, y: 0.04 },
      { x: 0.91, y: 0.23 },
      { x: 0.98, y: 0.6 },
      { x: 0.84, y: 0.8 },
      { x: 0.19, y: 0.8 },
    ],
  },
  cap: {
    outline: [
      { x: 10 / 156, y: 32 / 112 },
      { x: 112 / 156, y: 26 / 112 },
      { x: 150 / 156, y: 52 / 112 },
      { x: 140 / 156, y: 90 / 112 },
      { x: 24 / 156, y: 94 / 112 },
      { x: 2 / 156, y: 68 / 112 },
    ],
  },
  magician: {
    outline: [
      { x: 0.07, y: 0.88 },
      { x: 0.2, y: 0.72 },
      { x: 0.3, y: 0.14 },
      { x: 0.43, y: 0.04 },
      { x: 0.66, y: 0.06 },
      { x: 0.76, y: 0.72 },
      { x: 0.94, y: 0.88 },
      { x: 0.84, y: 0.98 },
      { x: 0.16, y: 0.98 },
    ],
  },
  portrait: {
    outline: [
      { x: 0.38, y: 0.1 },
      { x: 0.52, y: 0.09 },
      { x: 0.65, y: 0.15 },
      { x: 0.72, y: 0.28 },
      { x: 0.74, y: 0.48 },
      { x: 0.81, y: 0.5 },
      { x: 0.82, y: 0.57 },
      { x: 0.76, y: 0.6 },
      { x: 0.7, y: 0.59 },
      { x: 0.67, y: 0.68 },
      { x: 0.58, y: 0.76 },
      { x: 0.66, y: 0.84 },
      { x: 0.71, y: 0.95 },
      { x: 0.29, y: 0.96 },
      { x: 0.2, y: 0.91 },
      { x: 0.28, y: 0.77 },
      { x: 0.33, y: 0.71 },
      { x: 0.27, y: 0.66 },
      { x: 0.24, y: 0.59 },
      { x: 0.15, y: 0.6 },
      { x: 0.08, y: 0.57 },
      { x: 0.1, y: 0.51 },
      { x: 0.23, y: 0.48 },
      { x: 0.24, y: 0.29 },
      { x: 0.3, y: 0.17 },
    ],
  },
}

const PROFILE_ALIASES: Readonly<Record<string, ColliderProfileKey>> = {
  'paper-boat': 'paper-boat',
  'paper-boat-png': 'paper-boat',
  'hat-paperboat-2d': 'paper-boat',
  beret: 'beret',
  'hat-beret-alt-2d': 'beret',
  'hat-beret-2': 'beret',
  'hat-beret-2d': 'beret',
  'hat-beret': 'beret',
  cap: 'cap',
  'hat-cap-3d': 'cap',
  magician: 'magician',
  'hat-magician-2d': 'magician',
  'hat-magician': 'magician',
  portrait: 'portrait',
  'portrait-1': 'portrait',
  'portrait-2': 'portrait',
  'portrait-3': 'portrait',
  'portrait-4': 'portrait',
  'portrait-animated': 'portrait',
}

export function resolveColliderProfileKey(assetOrCharacterId: string): ColliderProfileKey | null {
  return PROFILE_ALIASES[assetOrCharacterId] ?? null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function validateColliderProfile(value: unknown, path = 'collider'): ColliderProfile {
  if (!isRecord(value) || Object.keys(value).some((key) => key !== 'outline') || !Array.isArray(value.outline)) {
    throw new Error(`${path} must contain one outline.`)
  }
  if (value.outline.length < 3 || value.outline.length > 64) {
    throw new Error(`${path}.outline must contain between 3 and 64 points.`)
  }

  const outline = value.outline.map((point, index): ColliderPoint => {
    if (!isRecord(point) || Object.keys(point).some((key) => key !== 'x' && key !== 'y')) {
      throw new Error(`${path}.outline[${index}] must be an x/y point.`)
    }
    const { x, y } = point
    if (typeof x !== 'number' || !Number.isFinite(x) || typeof y !== 'number' || !Number.isFinite(y)) {
      throw new Error(`${path}.outline[${index}] coordinates must be finite numbers.`)
    }
    if (x < -0.25 || x > 1.25 || y < -0.25 || y > 1.25) {
      throw new Error(`${path}.outline[${index}] coordinates are outside the normalized bounds.`)
    }
    return { x, y }
  })

  outline.forEach((point, index) => {
    const previous = outline[(index + outline.length - 1) % outline.length]
    if (point.x === previous.x && point.y === previous.y) {
      throw new Error(`${path}.outline contains adjacent duplicate points.`)
    }
  })
  const area = outline.reduce((sum, point, index) => {
    const next = outline[(index + 1) % outline.length]
    return sum + point.x * next.y - next.x * point.y
  }, 0) / 2
  if (Math.abs(area) < 0.0001) throw new Error(`${path}.outline must enclose an area.`)

  const orientation = (a: ColliderPoint, b: ColliderPoint, c: ColliderPoint) => (
    Math.sign((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x))
  )
  for (let first = 0; first < outline.length; first += 1) {
    const firstNext = (first + 1) % outline.length
    for (let second = first + 1; second < outline.length; second += 1) {
      const secondNext = (second + 1) % outline.length
      if (first === secondNext || firstNext === second || firstNext === secondNext) continue
      const intersects = orientation(outline[first], outline[firstNext], outline[second])
        !== orientation(outline[first], outline[firstNext], outline[secondNext])
        && orientation(outline[second], outline[secondNext], outline[first])
        !== orientation(outline[second], outline[secondNext], outline[firstNext])
      if (intersects) throw new Error(`${path}.outline cannot cross itself.`)
    }
  }
  return { outline }
}

export function validateColliderProfiles(value: unknown, path = 'colliders'): ColliderProfiles {
  if (!isRecord(value)) throw new Error(`${path} must be an object.`)
  const profiles: ColliderProfiles = {}
  for (const [key, profile] of Object.entries(value)) {
    if (!COLLIDER_PROFILE_KEYS.includes(key as ColliderProfileKey)) {
      throw new Error(`${path}.${key} is not a recognized collider profile.`)
    }
    profiles[key as ColliderProfileKey] = validateColliderProfile(profile, `${path}.${key}`)
  }
  return profiles
}

/** Drops malformed overrides independently so one bad profile cannot discard the workspace. */
export function recoverColliderProfiles(value: unknown): ColliderProfiles {
  if (!isRecord(value)) return {}
  const profiles: ColliderProfiles = {}
  for (const key of COLLIDER_PROFILE_KEYS) {
    if (!(key in value)) continue
    try {
      profiles[key] = validateColliderProfile(value[key], `colliders.${key}`)
    } catch {
      // Invalid user geometry falls back to the built-in profile for this key.
    }
  }
  return profiles
}

export function getColliderProfile(keyOrId: ColliderProfileKey | string, overrides: ColliderProfiles = {}): ColliderProfile | null {
  const key = resolveColliderProfileKey(keyOrId)
  return key ? overrides[key] ?? DEFAULT_COLLIDER_PROFILES[key] : null
}

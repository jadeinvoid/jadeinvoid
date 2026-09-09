import { useLayoutEffect, useRef } from 'react'
import type { WorkImage } from './workListData'
import { extractThumbnailBackground } from './thumbnailBackground'

interface FigmaWorkProjectArtProps {
  index: number
  thumbnail: WorkImage | null
}

export function FigmaWorkProjectArt({ index, thumbnail }: FigmaWorkProjectArtProps) {
  const artRef = useRef<HTMLDivElement>(null)
  const src = thumbnail ? thumbnail.thumbnailSrc ?? thumbnail.src : ''

  const syncCardBackground = (image: HTMLImageElement) => {
    const color = extractThumbnailBackground(image)
    const card = image.closest<HTMLElement>('.ui-rough-frame')
    if (!color || !card) return
    card.style.setProperty('--work-card-background', `linear-gradient(to bottom, ${color.top}, ${color.bottom})`)
    card.style.setProperty('--work-card-copy-background', color.bottom)
    card.style.setProperty('--work-card-foreground', color.foreground)
  }

  useLayoutEffect(() => {
    const card = artRef.current?.closest<HTMLElement>('.ui-rough-frame')
    card?.style.removeProperty('--work-card-background')
    card?.style.removeProperty('--work-card-copy-background')
    card?.style.removeProperty('--work-card-foreground')

    const image = artRef.current?.querySelector<HTMLImageElement>('.ui-project-art-image')
    if (image?.complete && image.naturalWidth > 0) syncCardBackground(image)

    return () => {
      card?.style.removeProperty('--work-card-background')
      card?.style.removeProperty('--work-card-copy-background')
      card?.style.removeProperty('--work-card-foreground')
    }
  }, [src])

  return (
    <div
      ref={artRef}
      className={`ui-project-art art-${index % 4 + 1}${thumbnail ? ' has-thumbnail' : ''}`}
      style={thumbnail ? { background: 'var(--work-card-background, #eee9e1)' } : undefined}
    >
      {thumbnail && (
        <img
          className="ui-project-art-image"
          src={src}
          alt=""
          loading="lazy"
          decoding="async"
          style={{ objectFit: 'contain', objectPosition: 'center' }}
          onLoad={(event) => syncCardBackground(event.currentTarget)}
        />
      )}
    </div>
  )
}

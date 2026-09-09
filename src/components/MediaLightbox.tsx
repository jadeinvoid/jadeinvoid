import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { RoughFrame } from '../ui-lab/RoughFrame'
import './media-lightbox.css'

export interface LightboxMedia {
  src: string
  alt: string
  caption?: string
}

interface MediaLightboxProps {
  media: LightboxMedia[]
  activeIndex: number
  label: string
  onActiveIndexChange?: (index: number) => void
  onClose: () => void
  roughFrame?: {
    color: string
    frequency: number
    wiggle: number
    smoothen: number
  }
}

export function MediaLightbox({ media, activeIndex, label, onActiveIndexChange, onClose, roughFrame }: MediaLightboxProps) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const activeMedia = media[activeIndex]
  const hasMultiple = media.length > 1

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (!hasMultiple || !onActiveIndexChange) return
      if (event.key === 'ArrowLeft') onActiveIndexChange((activeIndex - 1 + media.length) % media.length)
      if (event.key === 'ArrowRight') onActiveIndexChange((activeIndex + 1) % media.length)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [activeIndex, hasMultiple, media.length, onActiveIndexChange, onClose])

  if (!activeMedia) return null

  const goTo = (index: number) => onActiveIndexChange?.((index + media.length) % media.length)

  const surface = (
    <div className="media-lightbox__surface">
      <button ref={closeRef} type="button" className="media-lightbox__close" aria-label="Close expanded media" onClick={onClose}>
        <span aria-hidden="true">x</span>
      </button>
      <div className="media-lightbox__image-wrap">
        <img src={activeMedia.src} alt={activeMedia.alt} />
      </div>
      {activeMedia.caption && <p className="media-lightbox__caption">{activeMedia.caption}</p>}
      {hasMultiple && (
        <div className="media-lightbox__controls">
          <button type="button" aria-label="Previous expanded slide" onClick={() => goTo(activeIndex - 1)}><span aria-hidden="true">{'<'}</span></button>
          <div aria-label="Expanded carousel slides">
            {media.map((item, index) => <button key={`${item.src}-${index}`} type="button" aria-label={`Go to expanded slide ${index + 1}`} aria-current={activeIndex === index} onClick={() => goTo(index)} />)}
          </div>
          <button type="button" aria-label="Next expanded slide" onClick={() => goTo(activeIndex + 1)}><span aria-hidden="true">{'>'}</span></button>
        </div>
      )}
    </div>
  )

  return createPortal(
    <div className={`media-lightbox${roughFrame ? ' has-rough-frame' : ''}`} role="dialog" aria-modal="true" aria-label={label} onMouseDown={(event) => {
      const target = event.target as HTMLElement
      if (!target.closest('img, button')) onClose()
    }}>
      {roughFrame ? <RoughFrame className="media-lightbox__frame" borderPlacement="outside" {...roughFrame}>{surface}</RoughFrame> : surface}
    </div>,
    document.body,
  )
}

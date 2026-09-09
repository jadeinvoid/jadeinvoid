import { useId, type PropsWithChildren } from 'react'

interface RoughFrameProps extends PropsWithChildren {
  className?: string
  color: string
  frequency: number
  wiggle: number
  smoothen: number
  borderPlacement?: 'inside' | 'outside'
  tail?: 'left' | 'bottom-left'
  cornerRadius?: number
}

interface RoughDividerProps {
  className?: string
  color: string
  frequency: number
  wiggle: number
  smoothen: number
}

export function RoughFrame({ children, className = '', color, frequency, wiggle, smoothen, borderPlacement = 'inside', tail, cornerRadius }: RoughFrameProps) {
  const filterId = `rough-${useId().replaceAll(':', '')}`
  const baseFrequency = 0.008 + frequency * 0.0005
  const displacement = wiggle * 0.15
  const smoothing = smoothen * 0.02
  const borderOutset = 7 + displacement
  const borderStyle = borderPlacement === 'outside'
    ? { width: `calc(100% + ${borderOutset * 2}px)`, height: `calc(100% + ${borderOutset * 2}px)`, transform: `translate(${-borderOutset}px, ${-borderOutset}px)` }
    : undefined

  return (
    <div
      className={`ui-rough-frame${borderPlacement === 'outside' ? ' is-border-outside' : ''} ${className}`}
      style={{ '--rough-color': color, '--rough-border-outset': `${borderOutset}px`, borderRadius: cornerRadius } as React.CSSProperties}
    >
      {children}
      <svg className="ui-rough-border" aria-hidden="true" style={borderStyle}>
        <defs>
          <filter id={filterId} x="-2%" y="-4%" width="104%" height="108%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency={baseFrequency} numOctaves="2" seed="11" result="noise" />
            <feGaussianBlur in="noise" stdDeviation={smoothing} result="smoothedNoise" />
            <feDisplacementMap
              in="SourceGraphic"
              in2="smoothedNoise"
              scale={displacement}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
        <rect
          x="5"
          y="5"
          width="calc(100% - 10px)"
          height="calc(100% - 10px)"
          rx={cornerRadius}
          ry={cornerRadius}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#${filterId})`}
        />
      </svg>
      {tail && (
        <svg className={`ui-rough-tail ui-rough-tail-${tail}`} viewBox="0 0 44 60" aria-hidden="true">
          <path className="ui-rough-tail-fill" d="M 43 4 L 4 30 L 43 56 Z" />
          <path
            d="M 43 4 L 4 30 L 43 56"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter={`url(#${filterId})`}
          />
        </svg>
      )}
      {tail === 'bottom-left' && <span className="ui-rough-tail-cover ui-rough-tail-cover-bottom-left" aria-hidden="true" />}
    </div>
  )
}

export function RoughDivider({ className = '', color, frequency, wiggle, smoothen }: RoughDividerProps) {
  const filterId = `rough-line-${useId().replaceAll(':', '')}`
  const baseFrequency = 0.008 + frequency * 0.0005
  const displacement = wiggle * 0.15
  const smoothing = smoothen * 0.02

  return (
    <svg className={`ui-rough-divider ${className}`} viewBox="0 0 1000 18" preserveAspectRatio="none" aria-hidden="true" style={{ color }}>
      <defs>
        <filter id={filterId} x="-2%" y="-120%" width="104%" height="340%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency={baseFrequency} numOctaves="2" seed="17" result="noise" />
          <feGaussianBlur in="noise" stdDeviation={smoothing} result="smoothedNoise" />
          <feDisplacementMap in="SourceGraphic" in2="smoothedNoise" scale={displacement} xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
      <path d="M 5 9 L 995 9" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" filter={`url(#${filterId})`} />
    </svg>
  )
}

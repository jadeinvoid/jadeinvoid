import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { RoughFrame } from './RoughFrame'

/* ─────────────────────────────────────────────────────────
 * CHARACTER SPEECH BUBBLE STORYBOARD
 *
 *    0ms   bubble fades in, scale 0.86 → 1 and rises 10px → 0
 * 8000ms   introduction dismisses automatically
 * 5000ms   summoned prompt dismisses automatically
 * ───────────────────────────────────────────────────────── */

const TIMING = {
  introBubbleDismiss: 8000, // ms before the introduction dismisses
  promptBubbleDismiss: 5000, // ms before a summoned prompt dismisses
}

const SPEECH_BUBBLE = {
  initialScale: 0.86, // compact scale before appearing
  finalScale: 1, // resting scale
  offsetY: 10, // px the bubble rises from
  spring: { type: 'spring' as const, stiffness: 500, damping: 30 },
  exit: { duration: 0.16, ease: 'easeIn' as const },
  promptText: 'Psst—click a hat to explore my work.',
}

export type SpeechBubbleContent = 'intro' | 'prompt'

interface StrokeSettings {
  frequency: number
  wiggle: number
  smoothen: number
}

export function useCharacterSpeech(initialContent: SpeechBubbleContent | null) {
  const [content, setContent] = useState<SpeechBubbleContent | null>(initialContent)

  useEffect(() => {
    if (!content) return
    const dismissTimer = window.setTimeout(
      () => setContent(null),
      content === 'intro' ? TIMING.introBubbleDismiss : TIMING.promptBubbleDismiss,
    )
    return () => window.clearTimeout(dismissTimer)
  }, [content])

  return {
    content,
    toggle: () => setContent((current) => current ? null : 'prompt'),
  }
}

export function UiCharacterSpeechBubble({
  color,
  stroke,
  reduced,
  content,
  introTitle = 'Hello, I’m Jade.',
  introBody = 'I turn tangled problems into friendly experiences.',
  className = '',
  tail = 'left',
  cornerRadius,
  accessibleText,
}: {
  color: string
  stroke: StrokeSettings
  reduced: boolean
  content: SpeechBubbleContent
  introTitle?: string
  introBody?: string
  className?: string
  tail?: 'left' | 'bottom-left'
  cornerRadius?: number
  accessibleText?: string
}) {
  return (
    <motion.aside
      className={`ui-character-speech${content === 'intro' ? ' ui-character-speech-intro-bubble' : ''}${className ? ` ${className}` : ''}`}
      role="status"
      aria-label={accessibleText}
      initial={{ opacity: 0, scale: SPEECH_BUBBLE.initialScale, y: SPEECH_BUBBLE.offsetY }}
      animate={{ opacity: 1, scale: SPEECH_BUBBLE.finalScale, y: 0 }}
      exit={{
        opacity: 0,
        scale: SPEECH_BUBBLE.initialScale,
        y: SPEECH_BUBBLE.offsetY,
        transition: reduced ? { duration: 0 } : SPEECH_BUBBLE.exit,
      }}
      transition={reduced ? { duration: 0 } : SPEECH_BUBBLE.spring}
    >
      <RoughFrame color={color} tail={tail} cornerRadius={cornerRadius} {...stroke}>
        {content === 'intro' ? (
          <div className="ui-character-speech-intro" aria-hidden={accessibleText ? 'true' : undefined}>
            {introTitle && <p>{introTitle}</p>}
            <strong>{introBody}</strong>
          </div>
        ) : (
          <p>{SPEECH_BUBBLE.promptText}</p>
        )}
      </RoughFrame>
    </motion.aside>
  )
}

import { useEffect, useState } from 'react'
import { AnimatePresence } from 'motion/react'
import type { SiteRuntimeConfig } from '../site/runtimeConfig'
import { RoughFrame } from '../ui-lab/RoughFrame'
import { UiCharacterSpeechBubble } from '../ui-lab/UiCharacterSpeech'
import { FigmaHeaderLogo } from './FigmaHeaderLogo'
import { CONTACT_LINKS } from './FigmaLandingPage'

/* ─────────────────────────────────────────────────────────
 * MOBILE CONTACT STORYBOARD
 *
 *    0ms   contact screen rests with the speech bubble hidden
 *  160ms   bubble rises 10px → 0 and springs from scale 0.86 → 1
 *  720ms   message begins typing one character every 24ms
 * reduced  bubble and complete message render immediately
 * ───────────────────────────────────────────────────────── */

const TIMING = {
  bubbleAppears: 160, // ms after mount before the bubble enters
  typingStarts: 720, // ms after mount before the first character appears
  typingInterval: 24, // ms between typed characters
}

const CONTACT_MESSAGE = 'I’m currently looking for work in Canada.\nIf you’re interested in working with me, please don’t hesitate to get in touch!'

const CONTACT_CHARACTER = {
  src: '/character/portrait/Untitled_Artwork-1.png', // shared character portrait used by the desktop experience
  alt: 'Illustrated portrait of Jade',
}

interface FigmaMobileContactProps {
  values: SiteRuntimeConfig
  reduced: boolean
  replayKey: number
  onNavigateLanding: () => void
  onNavigateProjects: () => void
}

export function FigmaMobileContact({
  values,
  reduced,
  replayKey,
  onNavigateLanding,
  onNavigateProjects,
}: FigmaMobileContactProps) {
  const completeStage = CONTACT_MESSAGE.length + 2
  const [stage, setStage] = useState(reduced ? completeStage : 0)
  const typedCharacterCount = reduced ? CONTACT_MESSAGE.length : Math.max(0, stage - 2)
  const typedMessage = CONTACT_MESSAGE.slice(0, typedCharacterCount)
  const stroke = {
    frequency: values.uiLab.strokeFrequency,
    wiggle: values.uiLab.strokeWiggle,
    smoothen: values.uiLab.strokeSmoothen,
  }

  useEffect(() => {
    if (reduced) {
      setStage(completeStage)
      return
    }

    setStage(0)
    let typingTimer: number | undefined
    const bubbleTimer = window.setTimeout(() => setStage(1), TIMING.bubbleAppears)
    const typingStartTimer = window.setTimeout(() => {
      setStage(2)
      typingTimer = window.setInterval(() => {
        setStage((current) => {
          if (current >= completeStage) {
            if (typingTimer !== undefined) window.clearInterval(typingTimer)
            return current
          }
          return current + 1
        })
      }, TIMING.typingInterval)
    }, TIMING.typingStarts)

    return () => {
      window.clearTimeout(bubbleTimer)
      window.clearTimeout(typingStartTimer)
      if (typingTimer !== undefined) window.clearInterval(typingTimer)
    }
  }, [completeStage, reduced, replayKey])

  return (
    <main
      className="figma-landing-page figma-mobile-contact-page"
      data-figma-node="142:79"
      data-flow-role="contact"
      data-animation-stage={stage}
      data-typed-character-count={typedCharacterCount}
    >
      <header className="figma-landing-header-wrap">
        <RoughFrame className="figma-landing-header" color={values.uiLab.frameColor} {...stroke}>
          <FigmaHeaderLogo onNavigateLanding={onNavigateLanding} />
          <nav aria-label="Contact navigation">
            <button type="button" onClick={onNavigateProjects}>Projects</button>
            <span aria-current="page">Contact</span>
          </nav>
        </RoughFrame>
      </header>

      <section className="figma-mobile-contact-intro" aria-labelledby="figma-mobile-contact-heading">
        <h1 id="figma-mobile-contact-heading">Open to collaboration and<br />curious conversations.</h1>
        <AnimatePresence>
          {stage >= 1 && (
            <UiCharacterSpeechBubble
              className="figma-mobile-contact-bubble"
              color={values.uiLab.frameColor}
              stroke={stroke}
              reduced={reduced}
              content="intro"
              introTitle=""
              introBody={typedMessage}
              tail="bottom-left"
              cornerRadius={40}
              accessibleText={CONTACT_MESSAGE.replace('\n', ' ')}
            />
          )}
        </AnimatePresence>
        <img className="figma-mobile-contact-character" src={CONTACT_CHARACTER.src} alt={CONTACT_CHARACTER.alt} />
        <a className="figma-mobile-contact-email" href="mailto:hello@choja.design">hello@choja.design</a>
      </section>

      <section className="figma-mobile-contact-social" aria-labelledby="figma-mobile-contact-social-heading">
        <h2 id="figma-mobile-contact-social-heading">or, find me at</h2>
        <RoughFrame color={values.uiLab.frameColor} {...stroke}>
          <div>
            {CONTACT_LINKS.map(({ label, href }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer">{label}</a>
            ))}
          </div>
        </RoughFrame>
      </section>
    </main>
  )
}

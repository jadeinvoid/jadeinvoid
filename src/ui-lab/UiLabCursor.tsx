import { useEffect, useRef, useState, type RefObject } from 'react'

const OPEN_HAND = '/character/hand/cursor-hand.png'
const CLICK_HAND = '/character/hand/cursor-hand-click.png'
const HOVER_FRAME_DURATION = 220
const INTERACTIVE_SELECTOR = 'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [role="button"]'
const PASSIVE_CURSOR_SELECTOR = '[data-cursor-passive="true"]'
const NATIVE_CURSOR_SELECTOR = 'video[controls]'

function localPointerPosition(stage: HTMLElement, clientX: number, clientY: number) {
  const bounds = stage.getBoundingClientRect()
  const measuredScaleX = stage.offsetWidth > 0 ? bounds.width / stage.offsetWidth : 1
  const measuredScaleY = stage.offsetHeight > 0 ? bounds.height / stage.offsetHeight : 1
  const scaleX = Math.abs(measuredScaleX - 1) < .01 ? 1 : measuredScaleX
  const scaleY = Math.abs(measuredScaleY - 1) < .01 ? 1 : measuredScaleY
  return {
    x: (clientX - bounds.left) / (scaleX || 1),
    y: (clientY - bounds.top) / (scaleY || 1),
  }
}

interface UiLabCursorProps {
  stageRef: RefObject<HTMLElement | null>
  reduced: boolean
}

export function UiLabCursor({ stageRef, reduced }: UiLabCursorProps) {
  const cursorRef = useRef<HTMLSpanElement>(null)
  const [visible, setVisible] = useState(false)
  const [hoveringInteractive, setHoveringInteractive] = useState(false)
  const [hoverClickFrame, setHoverClickFrame] = useState(false)
  const [pressed, setPressed] = useState(false)

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return

    let lastPointer: { clientX: number; clientY: number } | null = null

    const positionCursor = (clientX: number, clientY: number) => {
      const position = localPointerPosition(stage, clientX, clientY)
      cursorRef.current?.style.setProperty('transform', `translate3d(${position.x}px, ${position.y}px, 0)`)
    }
    const syncCursor = () => {
      if (!lastPointer) return
      positionCursor(lastPointer.clientX, lastPointer.clientY)
    }
    const moveCursor = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return
      lastPointer = { clientX: event.clientX, clientY: event.clientY }
      positionCursor(event.clientX, event.clientY)
      const target = event.target instanceof Element ? event.target : null
      const usesNativeCursor = Boolean(target?.closest(NATIVE_CURSOR_SELECTOR))
      const usesPassiveCursor = Boolean(target?.closest(PASSIVE_CURSOR_SELECTOR))
      setHoveringInteractive(!usesNativeCursor && !usesPassiveCursor && Boolean(target?.closest(INTERACTIVE_SELECTOR)))
      setVisible(!usesNativeCursor)
    }
    const hideCursor = () => {
      lastPointer = null
      setVisible(false)
      setHoveringInteractive(false)
      setPressed(false)
    }
    const pressCursor = (event: PointerEvent) => {
      if (event.pointerType !== 'touch') setPressed(true)
    }
    const releaseCursor = () => setPressed(false)

    stage.addEventListener('pointermove', moveCursor, true)
    stage.addEventListener('pointerleave', hideCursor)
    stage.addEventListener('pointerdown', pressCursor, true)
    window.addEventListener('pointerup', releaseCursor)
    window.addEventListener('pointercancel', releaseCursor)
    window.addEventListener('blur', hideCursor)
    window.addEventListener('scroll', syncCursor, true)
    window.addEventListener('resize', syncCursor)
    return () => {
      stage.removeEventListener('pointermove', moveCursor, true)
      stage.removeEventListener('pointerleave', hideCursor)
      stage.removeEventListener('pointerdown', pressCursor, true)
      window.removeEventListener('pointerup', releaseCursor)
      window.removeEventListener('pointercancel', releaseCursor)
      window.removeEventListener('blur', hideCursor)
      window.removeEventListener('scroll', syncCursor, true)
      window.removeEventListener('resize', syncCursor)
    }
  }, [stageRef])

  useEffect(() => {
    setHoverClickFrame(hoveringInteractive)
    if (!hoveringInteractive || reduced) return
    const timer = window.setInterval(() => setHoverClickFrame((frame) => !frame), HOVER_FRAME_DURATION)
    return () => window.clearInterval(timer)
  }, [hoveringInteractive, reduced])

  const useClickHand = pressed || (hoveringInteractive && hoverClickFrame)
  return (
    <span
      ref={cursorRef}
      className="ui-lab-cursor"
      data-visible={visible}
      data-interactive={hoveringInteractive}
      aria-hidden="true"
    >
      <img
        data-click-frame={useClickHand}
        src={useClickHand ? CLICK_HAND : OPEN_HAND}
        alt=""
        draggable={false}
      />
    </span>
  )
}

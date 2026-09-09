import { useEffect, useState } from 'react'

/* ─────────────────────────────────────────────────────────
 * PORTRAIT FRAME STORYBOARD
 *
 * Read top-to-bottom. Each value is ms after the frames preload.
 *
 *   0ms   portrait 1 is visible
 *  800ms  portrait 1 → portrait 4
 * 1600ms  portrait 4 → portrait 2
 * 2400ms  portrait 2 → portrait 1; sequence repeats
 * ───────────────────────────────────────────────────────── */

export const PORTRAIT_FRAME_TIMING = {
  advance: 800, // milliseconds each drawing remains visible (1.25 FPS)
}

export function useCharacterPartFrame(fallbackSrc: string, frames?: readonly string[]) {
  const [stage, setStage] = useState(0)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setStage(0)
    setReady(false)
    if (!frames || frames.length < 2) return

    let cancelled = false
    const preload = frames.map((src) => new Promise<void>((resolve) => {
      const image = new Image()
      image.onload = () => resolve()
      image.onerror = () => resolve()
      image.src = src
    }))

    void Promise.all(preload).then(() => {
      if (!cancelled) setReady(true)
    })

    return () => { cancelled = true }
  }, [frames])

  useEffect(() => {
    if (!ready || !frames || frames.length < 2) return

    let timer: number | undefined
    const stop = () => {
      if (timer !== undefined) window.clearInterval(timer)
      timer = undefined
    }
    const start = () => {
      if (document.hidden || timer !== undefined) return
      timer = window.setInterval(() => {
        setStage((current) => (current + 1) % frames.length)
      }, PORTRAIT_FRAME_TIMING.advance)
    }
    const handleVisibility = () => {
      if (document.hidden) stop()
      else start()
    }

    start()
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      stop()
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [frames, ready])

  return frames?.[stage] ?? fallbackSrc
}

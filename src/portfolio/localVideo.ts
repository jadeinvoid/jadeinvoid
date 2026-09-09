export const MAX_LOCAL_VIDEO_BYTES = 75 * 1024 * 1024
export const MAX_LOCAL_VIDEO_LABEL = '75 MB'
export const MAX_LOCAL_VIDEO_DATA_URL_LENGTH = Math.ceil(MAX_LOCAL_VIDEO_BYTES * 4 / 3) + 256

export function localVideoSizeMessage() {
  return `Choose a video smaller than ${MAX_LOCAL_VIDEO_LABEL}.`
}

export function readLocalVideo(file: File): Promise<string> {
  if (!file.type.startsWith('video/')) return Promise.reject(new Error('Choose a video file.'))
  if (file.size > MAX_LOCAL_VIDEO_BYTES) return Promise.reject(new Error(localVideoSizeMessage()))

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => typeof reader.result === 'string'
      ? resolve(reader.result)
      : reject(new Error('This video could not be read.'))
    reader.onerror = () => reject(new Error('This video could not be read.'))
    reader.readAsDataURL(file)
  })
}

export function captureVideoFirstFrame(src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    const timeout = window.setTimeout(() => finish(new Error('The first video frame took too long to load.')), 15_000)
    let settled = false

    const finish = (error?: Error, thumbnail?: string) => {
      if (settled) return
      settled = true
      window.clearTimeout(timeout)
      video.removeAttribute('src')
      video.load()
      if (error) reject(error)
      else resolve(thumbnail ?? '')
    }
    const capture = () => {
      if (!video.videoWidth || !video.videoHeight) {
        finish(new Error('The video does not contain a readable frame.'))
        return
      }
      const maxEdge = 640
      const scale = Math.min(1, maxEdge / Math.max(video.videoWidth, video.videoHeight))
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.round(video.videoWidth * scale))
      canvas.height = Math.max(1, Math.round(video.videoHeight * scale))
      try {
        const context = canvas.getContext('2d')
        if (!context) throw new Error('Video thumbnail canvas is unavailable.')
        context.drawImage(video, 0, 0, canvas.width, canvas.height)
        finish(undefined, canvas.toDataURL('image/webp', .82))
      } catch {
        finish(new Error('The first frame could not be captured. The video URL may not allow image capture.'))
      }
    }

    video.muted = true
    video.playsInline = true
    video.preload = 'auto'
    if (!src.startsWith('data:') && !src.startsWith('blob:')) video.crossOrigin = 'anonymous'
    video.addEventListener('loadeddata', capture, { once: true })
    video.addEventListener('error', () => finish(new Error('The video could not be loaded.')), { once: true })
    video.src = src
    video.load()
  })
}

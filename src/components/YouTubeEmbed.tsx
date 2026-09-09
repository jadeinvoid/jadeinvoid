import './YouTubeEmbed.css'

const YOUTUBE_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/

export function getYouTubeVideoId(value: string): string | null {
  const input = value.trim()
  if (YOUTUBE_ID_PATTERN.test(input)) return input

  let url: URL
  try {
    url = new URL(input)
  } catch {
    return null
  }

  const hostname = url.hostname.toLowerCase().replace(/^www\./, '')
  let candidate = ''
  if (hostname === 'youtu.be') candidate = url.pathname.split('/').filter(Boolean)[0] ?? ''
  if (hostname === 'youtube.com' || hostname === 'm.youtube.com' || hostname === 'music.youtube.com' || hostname === 'youtube-nocookie.com') {
    if (url.pathname === '/watch') candidate = url.searchParams.get('v') ?? ''
    else {
      const [kind, id] = url.pathname.split('/').filter(Boolean)
      if (kind === 'embed' || kind === 'shorts' || kind === 'live') candidate = id ?? ''
    }
  }
  return YOUTUBE_ID_PATTERN.test(candidate) ? candidate : null
}

export function createYouTubeEmbedUrl(value: string): string | null {
  const videoId = getYouTubeVideoId(value)
  return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}?rel=0` : null
}

export function YouTubeEmbed({ value, title, className = '' }: { value: string; title: string; className?: string }) {
  const src = createYouTubeEmbedUrl(value)
  if (!src) return null
  return (
    <div className={`youtube-embed${className ? ` ${className}` : ''}`}>
      <iframe
        src={src}
        title={title.trim() || 'YouTube video player'}
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  )
}

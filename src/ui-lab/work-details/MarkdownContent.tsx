import { Fragment, type ReactNode } from 'react'

function safeHref(href: string) {
  return /^(https?:\/\/|mailto:|\/|#)/i.test(href) ? href : '#'
}

function inlineMarkdown(text: string, keyPrefix: string): ReactNode[] {
  const token = /(`[^`]+`|\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_[^_]+_|\[[^\]]+\]\([^)]+\))/g
  return text.split(token).filter(Boolean).map((part, index) => {
    const key = `${keyPrefix}-${index}`
    if (part.startsWith('`') && part.endsWith('`')) return <code key={key}>{part.slice(1, -1)}</code>
    if ((part.startsWith('**') && part.endsWith('**')) || (part.startsWith('__') && part.endsWith('__'))) return <strong key={key}>{part.slice(2, -2)}</strong>
    if ((part.startsWith('*') && part.endsWith('*')) || (part.startsWith('_') && part.endsWith('_'))) return <em key={key}>{part.slice(1, -1)}</em>
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
    if (link) return <a key={key} href={safeHref(link[2])}>{link[1]}</a>
    return <Fragment key={key}>{part}</Fragment>
  })
}

export function InlineMarkdownContent({ content }: { content: string }) {
  const lines = content.replace(/\r\n?/g, '\n').split('\n')
  return <>{lines.map((line, index) => (
    <Fragment key={`line-${index}`}>
      {index > 0 && <br />}
      {inlineMarkdown(line, `line-${index}`)}
    </Fragment>
  ))}</>
}

function startsBlock(line: string) {
  return /^(#{1,6}\s|```|>\s?|[-*+]\s|\d+\.\s|(?:-{3,}|\*{3,}|_{3,})\s*$)/.test(line)
}

export function MarkdownContent({ content }: { content: string }) {
  const lines = content.replace(/\r\n?/g, '\n').split('\n')
  const blocks: ReactNode[] = []
  let index = 0

  while (index < lines.length) {
    const line = lines[index]
    if (!line.trim()) { index += 1; continue }

    if (line.startsWith('```')) {
      const language = line.slice(3).trim()
      const code: string[] = []
      index += 1
      while (index < lines.length && !lines[index].startsWith('```')) code.push(lines[index++])
      if (index < lines.length) index += 1
      blocks.push(<pre key={`code-${index}`}><code className={language ? `language-${language}` : undefined}>{code.join('\n')}</code></pre>)
      continue
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/)
    if (heading) {
      const level = heading[1].length
      const children = inlineMarkdown(heading[2], `heading-${index}`)
      blocks.push(level === 1 ? <h2 key={`heading-${index}`}>{children}</h2> : level === 2 ? <h3 key={`heading-${index}`}>{children}</h3> : <h4 key={`heading-${index}`}>{children}</h4>)
      index += 1
      continue
    }

    if (/^(?:-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
      blocks.push(<hr key={`rule-${index}`} />)
      index += 1
      continue
    }

    if (/^>\s?/.test(line)) {
      const quote: string[] = []
      while (index < lines.length && /^>\s?/.test(lines[index])) quote.push(lines[index++].replace(/^>\s?/, ''))
      blocks.push(<blockquote key={`quote-${index}`}>{inlineMarkdown(quote.join(' '), `quote-${index}`)}</blockquote>)
      continue
    }

    const unordered = /^[-*+]\s+/.test(line)
    const ordered = /^\d+\.\s+/.test(line)
    if (unordered || ordered) {
      const items: ReactNode[] = []
      const itemPattern = unordered ? /^[-*+]\s+(.+)$/ : /^\d+\.\s+(.+)$/
      while (index < lines.length) {
        const item = lines[index].match(itemPattern)
        if (!item) break
        items.push(<li key={`item-${index}`}>{inlineMarkdown(item[1], `item-${index}`)}</li>)
        index += 1
      }
      blocks.push(ordered ? <ol key={`list-${index}`}>{items}</ol> : <ul key={`list-${index}`}>{items}</ul>)
      continue
    }

    const paragraph = [line]
    index += 1
    while (index < lines.length && lines[index].trim() && !startsBlock(lines[index])) paragraph.push(lines[index++])
    blocks.push(<p key={`paragraph-${index}`}>{inlineMarkdown(paragraph.join(' '), `paragraph-${index}`)}</p>)
  }

  return <div className="ui-wd-markdown">{blocks}</div>
}

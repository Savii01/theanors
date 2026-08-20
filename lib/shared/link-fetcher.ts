export interface ExtractedLinkData {
  url: string
  authorName: string
  authorFirstName: string
  topic: string
  previewText: string
}

export function extractAuthorAndTopicFromUrl(urlStr: string): {
  authorName: string
  authorFirstName: string
  topic: string
} {
  try {
    const url = new URL(urlStr)
    const segments = url.pathname.split('/').filter(Boolean)
    const postSlug = segments[segments.length - 1] || ''

    const parts = postSlug.split('_')
    let authorName = ''
    let topic = ''

    if (parts.length >= 2) {
      const authorSlug = parts[0].replace(/-\d+.*$/, '')
      authorName = authorSlug
        .split('-')
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join(' ')
      topic = parts
        .slice(1)
        .join(' ')
        .replace(/-(activity|ugcPost|share)-\d+.*$/i, '')
        .replace(/[-_]/g, ' ')
    } else {
      const slugParts = postSlug.split('-')
      if (slugParts.length >= 2) {
        authorName = slugParts
          .slice(0, 2)
          .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
          .join(' ')
        topic = slugParts
          .slice(2)
          .join(' ')
          .replace(/-(activity|ugcPost|share)-\d+.*$/i, '')
          .replace(/[-_]/g, ' ')
      }
    }

    const authorFirstName = authorName.split(' ')[0] || ''
    return {
      authorName: authorName.trim(),
      authorFirstName: authorFirstName.trim(),
      topic: topic.trim(),
    }
  } catch {
    return { authorName: '', authorFirstName: '', topic: '' }
  }
}

export async function fetchLinkPreview(urlStr: string): Promise<ExtractedLinkData> {
  const { authorName, authorFirstName, topic } = extractAuthorAndTopicFromUrl(urlStr)
  let previewText = ''

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 3500)

    const res = await fetch(urlStr, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
      },
    })
    clearTimeout(timeout)

    if (res.ok) {
      const html = await res.text()
      const titleMatch =
        html.match(/<meta property="og:title" content="([^"]*)"/i) ||
        html.match(/<title>([^<]*)<\/title>/i)
      const descMatch =
        html.match(/<meta property="og:description" content="([^"]*)"/i) ||
        html.match(/<meta name="description" content="([^"]*)"/i)

      const title = titleMatch?.[1] || ''
      const desc = descMatch?.[1] || ''
      previewText = `${title ? title + ' — ' : ''}${desc}`.trim()
    }
  } catch {
    // Network fallback
  }

  return {
    url: urlStr,
    authorName,
    authorFirstName,
    topic,
    previewText: previewText || topic || 'LinkedIn network post',
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { stringify } from 'csv-stringify/sync'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const format = searchParams.get('format') || 'csv'

    const captions: Record<string, string> = {
      linkedin: searchParams.get('linkedin') || '',
      tiktok: searchParams.get('tiktok') || '',
      instagram: searchParams.get('instagram') || '',
      youtube_title: searchParams.get('youtube_title') || '',
      youtube_desc: searchParams.get('youtube_desc') || '',
    }

    if (format === 'csv') {
      const rows = Object.entries(captions).map(([platform, text]) => ({
        platform,
        caption: text,
      }))
      const csv = stringify(rows, { header: true })
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="captions.csv"',
        },
      })
    }

    if (format === 'srt') {
      let srt = ''
      let index = 1
      for (const text of Object.values(captions)) {
        if (text) {
          srt += `${index}\n00:00:00,000 --> 00:00:05,000\n${text}\n\n`
          index++
        }
      }
      return new NextResponse(srt, {
        headers: {
          'Content-Type': 'text/plain',
          'Content-Disposition': 'attachment; filename="captions.srt"',
        },
      })
    }

    return NextResponse.json(captions)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Export captions error:', message)
    return NextResponse.json({ error: 'Failed to export' }, { status: 500 })
  }
}

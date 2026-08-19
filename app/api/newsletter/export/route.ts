import { NextRequest, NextResponse } from 'next/server'
import { Document, Packer, Paragraph, TextRun } from 'docx'

export async function POST(req: NextRequest) {
  try {
    const { content } = await req.json()

    if (!content) {
      return NextResponse.json({ error: 'content is required' }, { status: 400 })
    }

    const doc = new Document({
      sections: [{
        children: content.split('\n').map((line: string) =>
          new Paragraph({
            children: [new TextRun({ text: line, size: 24 })],
          })
        ),
      }],
    })

    const buffer = await Packer.toBuffer(doc)

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': 'attachment; filename="newsletter.docx"',
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Export newsletter error:', message)
    return NextResponse.json({ error: 'Failed to export' }, { status: 500 })
  }
}

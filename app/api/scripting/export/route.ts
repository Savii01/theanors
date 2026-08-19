import { NextRequest, NextResponse } from 'next/server'
import { Document, Packer, Paragraph, TextRun } from 'docx'
import PDFDocument from 'pdfkit'

export async function POST(req: NextRequest) {
  try {
    const { content, format, title } = await req.json()

    if (!content || !format) {
      return NextResponse.json({ error: 'content and format are required' }, { status: 400 })
    }

    const filename = title || 'script'

    if (format === 'markdown') {
      return new NextResponse(content, {
        headers: {
          'Content-Type': 'text/markdown',
          'Content-Disposition': `attachment; filename="${filename}.md"`,
        },
      })
    }

    if (format === 'word') {
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
          'Content-Disposition': `attachment; filename="${filename}.docx"`,
        },
      })
    }

    if (format === 'pdf') {
      const doc = new PDFDocument()
      const chunks: Buffer[] = []
      doc.on('data', (chunk: Buffer) => chunks.push(chunk))

      doc.fontSize(11).font('Helvetica')
      doc.text(content)
      doc.end()

      await new Promise<void>((resolve) => doc.on('end', resolve))
      const buffer = Buffer.concat(chunks)

      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}.pdf"`,
        },
      })
    }

    return NextResponse.json({ error: 'Invalid format' }, { status: 400 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Export script error:', message)
    return NextResponse.json({ error: 'Failed to export' }, { status: 500 })
  }
}

'use client'

import { useEffect, useState, useRef } from 'react'
import { Loader2, AlertCircle, Download, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DocxPreviewProps {
  url: string
  onDownload?: () => void
}

export function DocxPreview({ url, onDownload }: DocxPreviewProps) {
  const [html, setHtml] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    abortRef.current = controller

    async function loadDocx() {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(url, { signal: controller.signal })
        if (!response.ok) throw new Error('Failed to fetch file')

        const buffer = await response.arrayBuffer()

        // Dynamic import to keep mammoth out of the initial bundle
        const mammoth = await import('mammoth')
        const result = await mammoth.convertToHtml({ arrayBuffer: buffer })

        if (!controller.signal.aborted) {
          setHtml(result.value)
          setLoading(false)
        }
      } catch (err: any) {
        if (err.name === 'AbortError') return
        console.error('DOCX preview error:', err)
        if (!controller.signal.aborted) {
          setError('Failed to parse document. Download to view in Word.')
          setLoading(false)
        }
      }
    }

    loadDocx()

    return () => {
      controller.abort()
    }
  }, [url])

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-white">
        <Loader2 className="h-12 w-12 animate-spin" />
        <p className="text-lg">Loading document...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-white max-w-md mx-auto px-4">
        <AlertCircle className="h-16 w-16 text-red-400" />
        <h3 className="text-xl font-semibold">Preview Unavailable</h3>
        <p className="text-gray-300 text-center">{error}</p>
        {onDownload && (
          <Button onClick={onDownload} variant="secondary" className="gap-2 mt-4">
            <Download className="h-4 w-4" />
            Download to View
          </Button>
        )}
      </div>
    )
  }

  if (!html) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-white">
        <FileText className="h-16 w-16 text-gray-400" />
        <p className="text-lg">Document is empty</p>
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col bg-white text-gray-900">
      {/* Document content */}
      <div
        className="flex-1 overflow-auto p-8 docx-preview max-w-4xl mx-auto w-full"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {/* Scoped styles for mammoth-generated HTML */}
      <style jsx global>{`
        .docx-preview {
          line-height: 1.6;
          font-size: 14px;
        }
        .docx-preview h1 {
          font-size: 1.75em;
          font-weight: 700;
          margin: 1em 0 0.5em;
        }
        .docx-preview h2 {
          font-size: 1.5em;
          font-weight: 600;
          margin: 0.8em 0 0.4em;
        }
        .docx-preview h3 {
          font-size: 1.25em;
          font-weight: 600;
          margin: 0.6em 0 0.3em;
        }
        .docx-preview p {
          margin: 0.5em 0;
        }
        .docx-preview table {
          border-collapse: collapse;
          width: 100%;
          margin: 1em 0;
        }
        .docx-preview td,
        .docx-preview th {
          border: 1px solid #e5e7eb;
          padding: 6px 10px;
          text-align: left;
        }
        .docx-preview th {
          background-color: #f9fafb;
          font-weight: 600;
        }
        .docx-preview img {
          max-width: 100%;
          height: auto;
        }
        .docx-preview ul,
        .docx-preview ol {
          padding-left: 2em;
          margin: 0.5em 0;
        }
        .docx-preview li {
          margin: 0.25em 0;
        }
      `}</style>
    </div>
  )
}

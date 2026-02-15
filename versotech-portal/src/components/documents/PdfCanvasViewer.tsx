'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'

let pdfjsPromise: Promise<typeof import('pdfjs-dist')> | null = null

function loadPdfjs() {
  if (!pdfjsPromise) {
    pdfjsPromise = import('pdfjs-dist').then((lib) => {
      lib.GlobalWorkerOptions.workerSrc =
        `https://unpkg.com/pdfjs-dist@${lib.version}/build/pdf.worker.min.mjs`
      return lib
    })
  }
  return pdfjsPromise
}

interface PdfCanvasViewerProps {
  url: string
  onError?: () => void
}

export function PdfCanvasViewer({ url, onError }: PdfCanvasViewerProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function render() {
      const canvasContainer = canvasRef.current
      const scrollContainer = scrollRef.current
      if (!canvasContainer || !scrollContainer) return

      canvasContainer.innerHTML = ''
      setLoading(true)

      try {
        const pdfjs = await loadPdfjs()
        const pdf = await pdfjs.getDocument(url).promise
        if (cancelled) return

        const availableWidth = scrollContainer.clientWidth - 32
        const dpr = window.devicePixelRatio || 1

        for (let i = 1; i <= pdf.numPages; i++) {
          if (cancelled) break

          const page = await pdf.getPage(i)
          const baseViewport = page.getViewport({ scale: 1 })
          const cssScale = Math.min(availableWidth / baseViewport.width, 2.5)
          const renderViewport = page.getViewport({ scale: cssScale * dpr })

          const canvas = document.createElement('canvas')
          canvas.width = renderViewport.width
          canvas.height = renderViewport.height
          canvas.style.width = `${Math.floor(renderViewport.width / dpr)}px`
          canvas.style.height = `${Math.floor(renderViewport.height / dpr)}px`
          canvas.style.margin = '0 auto 8px auto'
          canvas.style.display = 'block'
          canvas.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)'

          canvasContainer.appendChild(canvas)

          await page.render({ canvas, viewport: renderViewport }).promise
        }

        if (!cancelled) setLoading(false)
      } catch (err) {
        console.error('PDF render error:', err)
        if (!cancelled) onError?.()
      }
    }

    render()
    return () => { cancelled = true }
  }, [url, onError])

  return (
    <div ref={scrollRef} className="w-full h-full overflow-auto bg-gray-800 relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
      )}
      <div ref={canvasRef} className="py-4 px-4" />
    </div>
  )
}

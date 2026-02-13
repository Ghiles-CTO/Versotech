'use client'

import { useEffect, useState, useRef } from 'react'
import { Loader2, AlertCircle, Download, FileSpreadsheet } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ExcelPreviewProps {
  url: string
  onDownload?: () => void
}

interface SheetData {
  name: string
  rows: string[][]
}

export function ExcelPreview({ url, onDownload }: ExcelPreviewProps) {
  const [sheets, setSheets] = useState<SheetData[]>([])
  const [activeSheet, setActiveSheet] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    abortRef.current = controller

    async function loadExcel() {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(url, { signal: controller.signal })
        if (!response.ok) throw new Error('Failed to fetch file')

        const buffer = await response.arrayBuffer()

        // Dynamic import to keep xlsx out of the initial bundle
        const xlsxModule = await import('xlsx')
        const XLSX = xlsxModule.default || xlsxModule
        const workbook = XLSX.read(new Uint8Array(buffer), { type: 'array' })

        const parsed: SheetData[] = workbook.SheetNames
          .filter((name: string) => workbook.Sheets[name])
          .map((name: string) => {
            const sheet = workbook.Sheets[name]
            // Use sheet_to_json with header:1 to get raw 2D array — avoids sheet_to_html bugs
            const rows: string[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })
            return { name, rows }
          })

        if (!controller.signal.aborted) {
          setSheets(parsed)
          setActiveSheet(0)
          setLoading(false)
        }
      } catch (err: any) {
        if (err.name === 'AbortError') return
        console.error('Excel preview error:', err)
        if (!controller.signal.aborted) {
          setError('Failed to parse spreadsheet. Download to view in Excel.')
          setLoading(false)
        }
      }
    }

    loadExcel()

    return () => {
      controller.abort()
    }
  }, [url])

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-white">
        <Loader2 className="h-12 w-12 animate-spin" />
        <p className="text-lg">Loading spreadsheet...</p>
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

  const active = sheets[activeSheet]

  if (sheets.length === 0 || !active || active.rows.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-white">
        <FileSpreadsheet className="h-16 w-16 text-gray-400" />
        <p className="text-lg">Spreadsheet is empty</p>
      </div>
    )
  }

  const [headerRow, ...dataRows] = active.rows

  return (
    <div className="w-full h-full flex flex-col bg-white text-gray-900">
      {/* Sheet tabs */}
      {sheets.length > 1 && (
        <div className="flex items-center border-b bg-gray-50 px-2 gap-1 overflow-x-auto flex-shrink-0">
          {sheets.map((sheet, idx) => (
            <button
              key={sheet.name}
              onClick={() => setActiveSheet(idx)}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                idx === activeSheet
                  ? 'border-blue-600 text-blue-700 bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              {sheet.name}
            </button>
          ))}
        </div>
      )}

      {/* Table content */}
      <div className="flex-1 overflow-auto p-4">
        <table className="border-collapse w-full text-[13px]">
          <thead>
            <tr>
              {headerRow.map((cell, i) => (
                <th
                  key={i}
                  className="border border-gray-200 px-2.5 py-1.5 text-left whitespace-nowrap bg-gray-50 font-semibold sticky top-0"
                >
                  {String(cell ?? '')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataRows.map((row, ri) => (
              <tr key={ri} className="even:bg-gray-50 hover:bg-blue-50">
                {headerRow.map((_, ci) => (
                  <td
                    key={ci}
                    className="border border-gray-200 px-2.5 py-1.5 text-left whitespace-nowrap"
                  >
                    {String(row[ci] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

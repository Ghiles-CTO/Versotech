/**
 * Gotenberg Document Conversion Utilities
 *
 * Uses Gotenberg's LibreOffice endpoint to convert DOCX to PDF.
 * Gotenberg must be running at GOTENBERG_URL (default: http://gotenberg:3000)
 */

const GOTENBERG_URL = process.env.GOTENBERG_URL || 'http://gotenberg:3000'

export interface ConversionResult {
  success: boolean
  pdfBuffer?: Buffer
  error?: string
}

export interface HtmlToPdfOptions {
  paperWidth?: number
  paperHeight?: number
  marginTop?: number
  marginBottom?: number
  marginLeft?: number
  marginRight?: number
  preferCssPageSize?: boolean
  printBackground?: boolean
}

/**
 * Convert a DOCX file to PDF using Gotenberg's LibreOffice endpoint
 *
 * @param docxBuffer - The DOCX file as a Buffer
 * @param filename - Original filename (used for form data, optional)
 * @returns ConversionResult with PDF buffer on success
 */
export async function convertDocxToPdf(
  docxBuffer: Buffer,
  filename: string = 'document.docx'
): Promise<ConversionResult> {
  try {
    console.log('📄 [GOTENBERG] Starting DOCX to PDF conversion:', {
      input_size: docxBuffer.length,
      filename
    })

    // Gotenberg LibreOffice endpoint for document conversion
    const url = `${GOTENBERG_URL}/forms/libreoffice/convert`

    // Create form data with the file
    // Convert Buffer to Uint8Array for TypeScript Blob compatibility
    const formData = new FormData()
    const blob = new Blob([new Uint8Array(docxBuffer)], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    })
    formData.append('files', blob, filename)

    // Optional: Set PDF/A format for archival quality
    // formData.append('pdfFormat', 'PDF/A-1a')

    const response = await fetch(url, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ [GOTENBERG] Conversion failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      })
      return {
        success: false,
        error: `Gotenberg conversion failed: ${response.status} ${response.statusText}`
      }
    }

    // Get the PDF as ArrayBuffer
    const pdfArrayBuffer = await response.arrayBuffer()
    const pdfBuffer = Buffer.from(pdfArrayBuffer)

    console.log('✅ [GOTENBERG] Conversion successful:', {
      input_size: docxBuffer.length,
      output_size: pdfBuffer.length
    })

    return {
      success: true,
      pdfBuffer
    }
  } catch (error) {
    console.error('❌ [GOTENBERG] Conversion error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown conversion error'
    }
  }
}

/**
 * Check if Gotenberg is available and responding
 */
export async function checkGotenbergHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${GOTENBERG_URL}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000) // 5 second timeout
    })
    return response.ok
  } catch {
    return false
  }
}

/**
 * Convert HTML to PDF using Gotenberg's Chromium endpoint
 * (Alternative method if you have HTML content)
 */
export async function convertHtmlToPdf(
  htmlContent: string,
  filename: string = 'document.html',
  options: HtmlToPdfOptions = {}
): Promise<ConversionResult> {
  try {
    const url = `${GOTENBERG_URL}/forms/chromium/convert/html`

    const formData = new FormData()
    const blob = new Blob([htmlContent], { type: 'text/html' })
    formData.append('files', blob, filename)

    if (typeof options.paperWidth === 'number') formData.append('paperWidth', String(options.paperWidth))
    if (typeof options.paperHeight === 'number') formData.append('paperHeight', String(options.paperHeight))
    if (typeof options.marginTop === 'number') formData.append('marginTop', String(options.marginTop))
    if (typeof options.marginBottom === 'number') formData.append('marginBottom', String(options.marginBottom))
    if (typeof options.marginLeft === 'number') formData.append('marginLeft', String(options.marginLeft))
    if (typeof options.marginRight === 'number') formData.append('marginRight', String(options.marginRight))
    if (typeof options.preferCssPageSize === 'boolean') formData.append('preferCssPageSize', String(options.preferCssPageSize))
    if (typeof options.printBackground === 'boolean') formData.append('printBackground', String(options.printBackground))

    const response = await fetch(url, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      const errorText = await response.text()
      return {
        success: false,
        error: `HTML to PDF conversion failed: ${response.status} - ${errorText}`
      }
    }

    const pdfArrayBuffer = await response.arrayBuffer()
    return {
      success: true,
      pdfBuffer: Buffer.from(pdfArrayBuffer)
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

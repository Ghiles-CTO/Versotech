import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import archiver from 'archiver'

// Validation schema
const bulkDownloadSchema = z.object({
  document_ids: z.array(z.string().uuid()).min(1).max(100)
})

// POST /api/staff/documents/bulk-download - Download multiple documents as ZIP
export async function POST(request: NextRequest) {
  try {
    const authSupabase = await createClient()
    const { data: { user }, error: authError } = await authSupabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await authSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['staff_admin', 'staff_ops', 'staff_rm', 'ceo'].includes(profile.role)) {
      return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
    }

    const serviceSupabase = createServiceClient()

    // Parse and validate request body
    const body = await request.json()
    const validation = bulkDownloadSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 }
      )
    }

    const { document_ids } = validation.data

    // Fetch document metadata
    const { data: documents, error: fetchError } = await serviceSupabase
      .from('documents')
      .select('id, name, file_key')
      .in('id', document_ids)

    if (fetchError) {
      console.error('Error fetching documents:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch documents' },
        { status: 500 }
      )
    }

    if (!documents || documents.length === 0) {
      return NextResponse.json(
        { error: 'No documents found' },
        { status: 404 }
      )
    }

    // Filter documents that have file_key (exclude external links)
    const downloadableDocuments = documents.filter(doc => doc.file_key)

    if (downloadableDocuments.length === 0) {
      return NextResponse.json(
        { error: 'No downloadable files found (documents may be external links)' },
        { status: 400 }
      )
    }

    // Create ZIP archive
    const archive = archiver('zip', {
      zlib: { level: 5 } // Moderate compression for balance of speed/size
    })

    // Track errors during archive creation
    const errors: string[] = []

    // Create a readable stream buffer to collect the ZIP data
    const chunks: Uint8Array[] = []

    archive.on('data', (chunk: Buffer) => {
      chunks.push(new Uint8Array(chunk))
    })

    archive.on('warning', (err) => {
      console.warn('Archive warning:', err)
    })

    archive.on('error', (err) => {
      console.error('Archive error:', err)
      errors.push(err.message)
    })

    // Storage bucket for staff documents
    const storageBucket = process.env.NEXT_PUBLIC_STORAGE_BUCKET_NAME || 'documents'

    // Track filenames to handle duplicates
    const usedFilenames = new Map<string, number>()

    // Download and add each file to the archive
    for (const doc of downloadableDocuments) {
      try {
        const { data: fileData, error: downloadError } = await serviceSupabase.storage
          .from(storageBucket)
          .download(doc.file_key)

        if (downloadError || !fileData) {
          console.error(`Failed to download document ${doc.id}:`, downloadError)
          errors.push(`Failed to download: ${doc.name}`)
          continue
        }

        // Handle duplicate filenames by adding suffix
        let filename = doc.name
        const existingCount = usedFilenames.get(filename.toLowerCase())
        if (existingCount !== undefined) {
          const ext = filename.lastIndexOf('.')
          if (ext > 0) {
            filename = `${filename.slice(0, ext)} (${existingCount + 1})${filename.slice(ext)}`
          } else {
            filename = `${filename} (${existingCount + 1})`
          }
          usedFilenames.set(doc.name.toLowerCase(), existingCount + 1)
        } else {
          usedFilenames.set(filename.toLowerCase(), 1)
        }

        // Convert Blob to Buffer
        const arrayBuffer = await fileData.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // Add file to archive
        archive.append(buffer, { name: filename })
      } catch (err) {
        console.error(`Error processing document ${doc.id}:`, err)
        errors.push(`Error processing: ${doc.name}`)
      }
    }

    // Finalize the archive
    await archive.finalize()

    // Wait for archive to complete
    await new Promise<void>((resolve, reject) => {
      archive.on('end', resolve)
      archive.on('error', reject)
    })

    // Combine chunks into single buffer
    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0)
    const zipBuffer = new Uint8Array(totalLength)
    let offset = 0
    for (const chunk of chunks) {
      zipBuffer.set(chunk, offset)
      offset += chunk.length
    }

    // Generate filename with date
    const dateStr = new Date().toISOString().split('T')[0]
    const zipFilename = `documents-${dateStr}.zip`

    // Return the ZIP file
    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${zipFilename}"`,
        'Content-Length': zipBuffer.length.toString(),
        'X-Documents-Count': downloadableDocuments.length.toString(),
        'X-Errors-Count': errors.length.toString()
      }
    })

  } catch (error) {
    console.error('Bulk download error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

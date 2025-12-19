/**
 * Storage management for signature PDFs
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { SIGNATURE_CONFIG } from './config'

export class SignatureStorageManager {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Upload unsigned PDF to storage
   */
  async uploadUnsignedPDF(
    investorId: string,
    token: string,
    pdfBytes: Uint8Array,
    metadata: Record<string, string>
  ): Promise<string> {
    const path = SIGNATURE_CONFIG.storage.paths.unsigned(investorId, token)

    const { data, error } = await this.supabase.storage
      .from(SIGNATURE_CONFIG.storage.bucket)
      .upload(path, pdfBytes, {
        contentType: 'application/pdf',
        metadata
      })

    if (error) {
      throw new Error(`Failed to upload unsigned PDF: ${error.message}`)
    }

    return data.path
  }

  /**
   * Upload signed PDF to storage
   */
  async uploadSignedPDF(
    investorId: string,
    token: string,
    pdfBytes: Uint8Array,
    metadata: Record<string, string>
  ): Promise<string> {
    const path = SIGNATURE_CONFIG.storage.paths.signed(investorId, token)

    const { data, error } = await this.supabase.storage
      .from(SIGNATURE_CONFIG.storage.bucket)
      .upload(path, pdfBytes, {
        contentType: 'application/pdf',
        metadata
      })

    if (error) {
      throw new Error(`Failed to upload signed PDF: ${error.message}`)
    }

    return data.path
  }

  /**
   * Download PDF from storage
   */
  async downloadPDF(path: string): Promise<Uint8Array> {
    const { data, error } = await this.supabase.storage
      .from(SIGNATURE_CONFIG.storage.bucket)
      .download(path)

    if (error) {
      throw new Error(`Failed to download PDF: ${error.message}`)
    }

    return new Uint8Array(await data.arrayBuffer())
  }

  /**
   * Get signed URL for PDF
   */
  async getSignedUrl(path: string, expirySeconds: number = 3600): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from(SIGNATURE_CONFIG.storage.bucket)
      .createSignedUrl(path, expirySeconds)

    if (error) {
      throw new Error(`Failed to create signed URL: ${error.message}`)
    }

    return data.signedUrl
  }
}

/**
 * Download PDF from external URL (e.g., Google Drive)
 */
export async function downloadPDFFromUrl(url: string): Promise<Uint8Array> {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to download PDF: ${response.statusText}`)
  }

  return new Uint8Array(await response.arrayBuffer())
}

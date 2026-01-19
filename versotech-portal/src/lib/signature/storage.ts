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
   *
   * Handles files from both 'signatures' and 'deal-documents' buckets:
   * - Paths starting with 'subscriptions/', 'introducer-agreements/', 'placement-agreements/' are in 'deal-documents'
   * - All other paths are in 'signatures' bucket
   */
  async downloadPDF(path: string): Promise<Uint8Array> {
    // Determine bucket based on path pattern
    const bucket = (path.startsWith('subscriptions/') || path.startsWith('introducer-agreements/') || path.startsWith('placement-agreements/'))
      ? 'deal-documents'
      : SIGNATURE_CONFIG.storage.bucket

    const { data, error } = await this.supabase.storage
      .from(bucket)
      .download(path)

    if (error) {
      throw new Error(`Failed to download PDF: ${error.message}`)
    }

    return new Uint8Array(await data.arrayBuffer())
  }

  /**
   * Get signed URL for PDF
   *
   * Handles files from both 'signatures' and 'deal-documents' buckets:
   * - Paths starting with 'subscriptions/' are in 'deal-documents' (certificates)
   * - All other paths are in 'signatures' bucket
   */
  async getSignedUrl(path: string, expirySeconds: number = 3600): Promise<string> {
    // Determine bucket based on path pattern
    // Documents in deal-documents bucket: subscriptions/, introducer-agreements/, placement-agreements/
    const bucket = (path.startsWith('subscriptions/') || path.startsWith('introducer-agreements/') || path.startsWith('placement-agreements/'))
      ? 'deal-documents'
      : SIGNATURE_CONFIG.storage.bucket

    const { data, error } = await this.supabase.storage
      .from(bucket)
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

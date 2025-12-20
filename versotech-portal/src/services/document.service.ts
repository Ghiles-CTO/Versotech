/**
 * Document Service
 * Centralized service for all document-related API operations
 */

import { DocumentError, DocumentUrlResponse } from '@/types/document-viewer.types'

export class DocumentService {
  /**
   * Validate that a URL is a valid storage URL from Supabase
   */
  private static isValidStorageUrl(url: string): boolean {
    if (!url) return false

    // Check if it's a valid HTTPS URL
    if (!url.startsWith('https://')) return false

    // Check if it's from Supabase storage or a blob URL
    return (
      url.includes('supabase.co/storage') ||
      url.includes('supabase.com/storage') ||
      url.startsWith('blob:')
    )
  }

  /**
   * Parse and validate API response
   */
  private static async parseResponse(
    response: Response
  ): Promise<DocumentUrlResponse> {
    let data: any

    try {
      data = await response.json()
    } catch (e) {
      throw new DocumentError(
        'Invalid response from server',
        response.status,
        e
      )
    }

    // Check for error response
    if (!response.ok) {
      const errorMessage = data.error || data.message || 'Failed to load document'
      throw new DocumentError(errorMessage, response.status, data)
    }

    // Validate required fields - check for both 'url' and 'download_url' for compatibility
    const downloadUrl = data.url || data.download_url
    if (!downloadUrl) {
      throw new DocumentError(
        'No download URL in response',
        500,
        data
      )
    }

    // Validate URL format
    if (!this.isValidStorageUrl(downloadUrl)) {
      throw new DocumentError(
        'Invalid download URL format',
        500,
        data
      )
    }

    // Normalize response to always have both fields for compatibility
    data.url = downloadUrl
    data.download_url = downloadUrl

    return data as DocumentUrlResponse
  }

  /**
   * Get preview URL for a general document
   */
  static async getPreviewUrl(documentId: string): Promise<DocumentUrlResponse> {
    try {
      const response = await fetch(
        `/api/documents/${documentId}/download?mode=preview`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      return await this.parseResponse(response)
    } catch (error) {
      if (error instanceof DocumentError) {
        throw error
      }

      throw new DocumentError(
        'Network error while loading preview',
        0,
        error
      )
    }
  }

  /**
   * Get download URL for a general document
   */
  static async getDownloadUrl(documentId: string): Promise<DocumentUrlResponse> {
    try {
      const response = await fetch(
        `/api/documents/${documentId}/download?mode=download`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      return await this.parseResponse(response)
    } catch (error) {
      if (error instanceof DocumentError) {
        throw error
      }

      throw new DocumentError(
        'Network error while loading download',
        0,
        error
      )
    }
  }

  /**
   * Get preview URL for a deal data room document
   */
  static async getDealDocumentPreviewUrl(
    dealId: string,
    documentId: string
  ): Promise<DocumentUrlResponse> {
    try {
      const response = await fetch(
        `/api/deals/${dealId}/documents/${documentId}/download?mode=preview`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      return await this.parseResponse(response)
    } catch (error) {
      if (error instanceof DocumentError) {
        throw error
      }

      throw new DocumentError(
        'Network error while loading deal document preview',
        0,
        error
      )
    }
  }

  /**
   * Get download URL for a deal data room document
   */
  static async getDealDocumentDownloadUrl(
    dealId: string,
    documentId: string
  ): Promise<DocumentUrlResponse> {
    try {
      const response = await fetch(
        `/api/deals/${dealId}/documents/${documentId}/download?mode=download`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      return await this.parseResponse(response)
    } catch (error) {
      if (error instanceof DocumentError) {
        throw error
      }

      throw new DocumentError(
        'Network error while loading deal document download',
        0,
        error
      )
    }
  }

  /**
   * Map HTTP status codes to user-friendly error messages
   */
  static getErrorMessage(error: DocumentError): string {
    switch (error.statusCode) {
      case 401:
        return 'You do not have permission to view this document.'
      case 403:
        return 'Access to this document is forbidden.'
      case 404:
        return 'Document not found or has been deleted.'
      case 413:
        return 'File is too large to process.'
      case 500:
        return 'Server error while loading document. Please try again.'
      case 0:
        return 'Network error. Please check your connection and try again.'
      default:
        return error.message || 'Failed to load document preview.'
    }
  }
}

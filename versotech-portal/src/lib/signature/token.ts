/**
 * Token generation and validation utilities
 */

import crypto from 'crypto'
import { SIGNATURE_CONFIG } from './config'

/**
 * Generate a cryptographically secure signing token
 */
export function generateSignatureToken(): string {
  return crypto
    .randomBytes(SIGNATURE_CONFIG.token.lengthBytes)
    .toString('hex')
}

/**
 * Calculate token expiry date
 */
export function calculateTokenExpiry(days?: number): Date {
  const expiry = new Date()
  expiry.setDate(expiry.getDate() + (days || SIGNATURE_CONFIG.token.expiryDays))
  return expiry
}

/**
 * Check if token has expired
 */
export function isTokenExpired(expiresAt: string | Date): boolean {
  return new Date() > new Date(expiresAt)
}

/**
 * Generate signing URL from token
 */
export function generateSigningUrl(token: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL
  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_APP_URL is not configured')
  }
  return `${baseUrl}/sign/${token}`
}

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
 * Get the application base URL with fallbacks for different environments
 * Always returns URL WITHOUT trailing slash to prevent double-slash issues
 */
export function getAppUrl(): string {
  let url: string

  // Priority order: NEXT_PUBLIC_APP_URL > VERCEL_URL > NEXT_PUBLIC_SITE_URL
  if (process.env.NEXT_PUBLIC_APP_URL) {
    url = process.env.NEXT_PUBLIC_APP_URL
  } else if (process.env.VERCEL_URL) {
    // Vercel automatically provides VERCEL_URL in production
    url = `https://${process.env.VERCEL_URL}`
  } else if (process.env.NEXT_PUBLIC_SITE_URL) {
    url = process.env.NEXT_PUBLIC_SITE_URL
  } else if (typeof window !== 'undefined') {
    // Browser fallback (client-side only)
    url = window.location.origin
  } else if (process.env.NODE_ENV === 'production') {
    // Server-side: NEVER use localhost in production
    throw new Error('App URL must be configured in production. Set NEXT_PUBLIC_APP_URL, VERCEL_URL, or NEXT_PUBLIC_SITE_URL environment variable.')
  } else {
    // Development fallback only
    url = 'http://localhost:3000'
  }

  // Remove trailing slash to prevent double-slash issues (e.g., https://app.com//path)
  return url.replace(/\/+$/, '')
}

/**
 * Generate signing URL from token
 */
export function generateSigningUrl(token: string): string {
  const baseUrl = getAppUrl()
  return `${baseUrl}/sign/${token}`
}

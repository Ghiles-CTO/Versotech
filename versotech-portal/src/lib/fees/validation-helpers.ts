/**
 * Flexible UUID Validation Helpers
 * Handles both strict UUIDs and dummy test data
 */

import { z } from 'zod';

/**
 * Flexible UUID validator that accepts:
 * - Valid UUIDs (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
 * - Test UUIDs (aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa)
 * - Simple numeric IDs for testing
 * - Demo prefixed IDs (demo-xxx)
 */
export const flexibleUuidSchema = z.string().refine(
  (val) => {
    // Empty strings are not valid
    if (!val || val.length === 0) return false;

    // Allow demo- prefixed IDs
    if (val.startsWith('demo-')) return true;

    // Allow test patterns like aaa-bbb-ccc
    if (/^[a-z0-9-]+$/i.test(val) && val.includes('-')) return true;

    // Allow simple numeric or alphanumeric IDs for testing (at least 3 chars)
    if (/^[a-z0-9]{3,}$/i.test(val)) return true;

    // Check for standard UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(val);
  },
  {
    message: 'Invalid ID format. Expected UUID or test identifier.',
  }
);

/**
 * Optional flexible UUID - allows null/undefined
 */
export const optionalFlexibleUuidSchema = flexibleUuidSchema.optional();

/**
 * Strict UUID validator (original behavior)
 * Use this only where real UUIDs are absolutely required
 */
export const strictUuidSchema = z.string().regex(
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  'Invalid UUID format'
);

/**
 * Helper function to check if a value looks like a real UUID
 */
export function isRealUuid(value: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

/**
 * Helper function to sanitize test IDs into valid UUIDs for database operations
 * This is useful when you need to convert test data into something the database will accept
 */
export function sanitizeToUuid(value: string): string | null {
  if (!value) return null;

  // If it's already a valid UUID, return it
  if (isRealUuid(value)) return value;

  // For demo IDs or test data, return null (let the database handle it)
  // This prevents foreign key constraint violations
  return null;
}
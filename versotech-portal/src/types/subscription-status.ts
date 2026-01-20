/**
 * Subscription Status Types
 *
 * The subscription workflow involves 3 interconnected status systems:
 * 1. Submission Status - Tracks investor submission review
 * 2. Pack Status - Tracks document generation/signing
 * 3. Subscription Status - Tracks financial lifecycle
 *
 * This file provides type-safe enums and utilities for all status values.
 */

// ============================================================================
// SUBMISSION STATUS
// Used in: deal_subscription_submissions table
// Flow: pending_review → approved/rejected
// ============================================================================

export const SubmissionStatus = {
  PENDING_REVIEW: 'pending_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
} as const;

export type SubmissionStatusType = (typeof SubmissionStatus)[keyof typeof SubmissionStatus];

export const SUBMISSION_STATUS_LABELS: Record<SubmissionStatusType, string> = {
  [SubmissionStatus.PENDING_REVIEW]: 'Pending Review',
  [SubmissionStatus.APPROVED]: 'Approved',
  [SubmissionStatus.REJECTED]: 'Rejected',
  [SubmissionStatus.CANCELLED]: 'Cancelled',
};

export const SUBMISSION_STATUS_COLORS: Record<SubmissionStatusType, string> = {
  [SubmissionStatus.PENDING_REVIEW]: 'bg-yellow-900 text-yellow-200',
  [SubmissionStatus.APPROVED]: 'bg-green-900 text-green-200',
  [SubmissionStatus.REJECTED]: 'bg-red-900 text-red-200',
  [SubmissionStatus.CANCELLED]: 'bg-gray-900 text-gray-200',
};

// ============================================================================
// PACK STATUS
// Used in: documents table (subscription packs)
// Flow: no_pack → draft → final → pending_signature → signed
// ============================================================================

export const PackStatus = {
  NO_PACK: 'no_pack',
  DRAFT: 'draft',
  FINAL: 'final',
  PENDING_SIGNATURE: 'pending_signature',
  SIGNED: 'signed',
} as const;

export type PackStatusType = (typeof PackStatus)[keyof typeof PackStatus];

export const PACK_STATUS_LABELS: Record<PackStatusType, string> = {
  [PackStatus.NO_PACK]: 'No Document Generated',
  [PackStatus.DRAFT]: 'System Generated Draft',
  [PackStatus.FINAL]: 'Staff Uploaded Final',
  [PackStatus.PENDING_SIGNATURE]: 'Sent for Signatures',
  [PackStatus.SIGNED]: 'All Parties Signed',
};

export const PACK_STATUS_COLORS: Record<PackStatusType, string> = {
  [PackStatus.NO_PACK]: 'bg-gray-700 text-gray-300',
  [PackStatus.DRAFT]: 'bg-purple-900 text-purple-200',
  [PackStatus.FINAL]: 'bg-cyan-900 text-cyan-200',
  [PackStatus.PENDING_SIGNATURE]: 'bg-amber-900 text-amber-200',
  [PackStatus.SIGNED]: 'bg-green-900 text-green-200',
};

// ============================================================================
// SUBSCRIPTION STATUS
// Used in: subscriptions table
// Flow: pending → committed → partially_funded → funded → active → closed/cancelled
// ============================================================================

export const SubscriptionStatus = {
  PENDING: 'pending',
  COMMITTED: 'committed',
  PARTIALLY_FUNDED: 'partially_funded',
  FUNDED: 'funded',
  ACTIVE: 'active',
  CLOSED: 'closed',
  CANCELLED: 'cancelled',
} as const;

export type SubscriptionStatusType = (typeof SubscriptionStatus)[keyof typeof SubscriptionStatus];

export const SUBSCRIPTION_STATUS_LABELS: Record<SubscriptionStatusType, string> = {
  [SubscriptionStatus.PENDING]: 'Pending',
  [SubscriptionStatus.COMMITTED]: 'Committed',
  [SubscriptionStatus.PARTIALLY_FUNDED]: 'Partially Funded',
  [SubscriptionStatus.FUNDED]: 'Funded',
  [SubscriptionStatus.ACTIVE]: 'Active',
  [SubscriptionStatus.CLOSED]: 'Closed',
  [SubscriptionStatus.CANCELLED]: 'Cancelled',
};

export const SUBSCRIPTION_STATUS_COLORS: Record<SubscriptionStatusType, string> = {
  [SubscriptionStatus.PENDING]: 'bg-yellow-900 text-yellow-200',
  [SubscriptionStatus.COMMITTED]: 'bg-blue-900 text-blue-200',
  [SubscriptionStatus.PARTIALLY_FUNDED]: 'bg-indigo-900 text-indigo-200',
  [SubscriptionStatus.FUNDED]: 'bg-emerald-900 text-emerald-200',
  [SubscriptionStatus.ACTIVE]: 'bg-green-900 text-green-200',
  [SubscriptionStatus.CLOSED]: 'bg-gray-900 text-gray-200',
  [SubscriptionStatus.CANCELLED]: 'bg-red-900 text-red-200',
};

// ============================================================================
// VALID TRANSITIONS (for future state machine enforcement)
// ============================================================================

export const VALID_SUBSCRIPTION_TRANSITIONS: Record<SubscriptionStatusType, SubscriptionStatusType[]> = {
  [SubscriptionStatus.PENDING]: [SubscriptionStatus.COMMITTED, SubscriptionStatus.CANCELLED],
  [SubscriptionStatus.COMMITTED]: [SubscriptionStatus.PARTIALLY_FUNDED, SubscriptionStatus.FUNDED, SubscriptionStatus.ACTIVE, SubscriptionStatus.CANCELLED],
  [SubscriptionStatus.PARTIALLY_FUNDED]: [SubscriptionStatus.FUNDED, SubscriptionStatus.ACTIVE, SubscriptionStatus.CANCELLED],
  [SubscriptionStatus.FUNDED]: [SubscriptionStatus.ACTIVE, SubscriptionStatus.CANCELLED],
  [SubscriptionStatus.ACTIVE]: [SubscriptionStatus.CLOSED, SubscriptionStatus.CANCELLED],
  [SubscriptionStatus.CLOSED]: [], // Terminal state
  [SubscriptionStatus.CANCELLED]: [], // Terminal state
};

/**
 * Check if a status transition is valid
 */
export function isValidTransition(
  from: SubscriptionStatusType,
  to: SubscriptionStatusType
): boolean {
  return VALID_SUBSCRIPTION_TRANSITIONS[from]?.includes(to) ?? false;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Determine pack status from document data
 */
export function getPackStatusFromDocument(document: {
  status?: string;
  pack_type?: string;
} | null): PackStatusType {
  if (!document) return PackStatus.NO_PACK;

  const status = document.status?.toLowerCase();
  const packType = document.pack_type?.toLowerCase();

  if (status === 'signed' || status === 'completed') return PackStatus.SIGNED;
  if (status === 'pending_signature') return PackStatus.PENDING_SIGNATURE;
  if (packType === 'final' || status === 'final') return PackStatus.FINAL;
  if (packType === 'draft' || status === 'draft') return PackStatus.DRAFT;

  return PackStatus.NO_PACK;
}

/**
 * Get all status values as arrays (useful for dropdowns, filters)
 */
export const ALL_SUBMISSION_STATUSES = Object.values(SubmissionStatus);
export const ALL_PACK_STATUSES = Object.values(PackStatus);
export const ALL_SUBSCRIPTION_STATUSES = Object.values(SubscriptionStatus);

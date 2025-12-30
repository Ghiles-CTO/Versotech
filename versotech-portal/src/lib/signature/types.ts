/**
 * Type definitions for the signature system
 */

export type DocumentType = 'nda' | 'subscription' | 'amendment' | 'introducer_agreement' | 'placement_agreement' | 'other'
export type SignerRole = 'investor' | 'admin' | 'arranger' | 'introducer' | 'commercial_partner'
export type SignaturePosition = 'party_a' | 'party_b'
export type SignatureStatus = 'pending' | 'signed' | 'expired' | 'cancelled'

export interface SignatureRequestRecord {
  id: string
  workflow_run_id?: string // Optional - only for n8n generated documents
  investor_id: string
  signer_email: string
  signer_name: string
  document_type: DocumentType
  signing_token: string
  token_expires_at: string
  google_drive_file_id?: string
  google_drive_url?: string
  unsigned_pdf_path?: string
  unsigned_pdf_size?: number
  signed_pdf_path?: string
  signed_pdf_size?: number
  signature_data_url?: string
  signature_timestamp?: string
  signature_ip_address?: string
  status: SignatureStatus
  email_sent_at?: string
  email_opened_at?: string
  signer_role: SignerRole
  signature_position: SignaturePosition
  subscription_id?: string // For manually uploaded subscription packs
  document_id?: string // For manually uploaded documents
  introducer_id?: string // For introducer agreement signing
  introducer_agreement_id?: string // For introducer agreement signing
  placement_id?: string // For placement agreement signing (commercial partner ID)
  placement_agreement_id?: string // For placement agreement signing
  created_at: string
  updated_at: string
  created_by?: string
}

export interface CreateSignatureRequestParams {
  workflow_run_id?: string // Optional - only for n8n generated documents
  investor_id: string
  signer_email: string
  signer_name: string
  document_type: DocumentType
  google_drive_file_id?: string
  google_drive_url?: string
  signer_role: SignerRole
  signature_position: SignaturePosition
  deal_id?: string // Direct deal reference for VERSOSign arranger/lawyer queries
  subscription_id?: string // For manually uploaded subscription packs
  document_id?: string // For manually uploaded documents
  introducer_id?: string // For introducer agreement signing
  introducer_agreement_id?: string // For introducer agreement signing
  placement_id?: string // For placement agreement signing (commercial partner ID)
  placement_agreement_id?: string // For placement agreement signing
}

export interface CreateSignatureRequestResult {
  success: boolean
  signature_request_id?: string
  signing_url?: string
  expires_at?: string
  error?: string
}

export interface SignatureRequestPublicView {
  id: string
  signer_name: string
  signer_email: string
  document_type: string
  unsigned_pdf_url: string | null
  google_drive_url: string | null
  status: string
  expires_at: string
}

export interface SubmitSignatureParams {
  token: string
  signature_data_url: string
  ip_address: string
}

export interface SubmitSignatureResult {
  success: boolean
  message?: string
  signed_pdf_path?: string
  error?: string
}

export interface EmbedSignatureParams {
  pdfBytes: Uint8Array
  signatureDataUrl: string
  signerName: string
  signaturePosition: SignaturePosition
  timestamp?: Date
}

export interface PostSignatureHandlerParams {
  signatureRequest: SignatureRequestRecord
  signedPdfPath: string
  signedPdfBytes: Uint8Array
  supabase: any
}

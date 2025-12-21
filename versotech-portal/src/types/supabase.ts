export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      activity_feed: {
        Row: {
          activity_type: string
          created_at: string | null
          created_by: string | null
          description: string
          entity_id: string
          id: string
          investor_id: string | null
          metadata: Json | null
          title: string
        }
        Insert: {
          activity_type: string
          created_at?: string | null
          created_by?: string | null
          description: string
          entity_id: string
          id?: string
          investor_id?: string | null
          metadata?: Json | null
          title: string
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          created_by?: string | null
          description?: string
          entity_id?: string
          id?: string
          investor_id?: string | null
          metadata?: Json | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_feed_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_feed_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "investors"
            referencedColumns: ["id"]
          },
        ]
      }
      allocations: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          deal_id: string | null
          id: string
          investor_id: string | null
          status: Database["public"]["Enums"]["allocation_status_enum"] | null
          unit_price: number
          units: number
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          deal_id?: string | null
          id?: string
          investor_id?: string | null
          status?: Database["public"]["Enums"]["allocation_status_enum"] | null
          unit_price: number
          units: number
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          deal_id?: string | null
          id?: string
          investor_id?: string | null
          status?: Database["public"]["Enums"]["allocation_status_enum"] | null
          unit_price?: number
          units?: number
        }
        Relationships: [
          {
            foreignKeyName: "allocations_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "allocations_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "allocations_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "investors"
            referencedColumns: ["id"]
          },
        ]
      }
      approval_history: {
        Row: {
          action: string
          actor_id: string
          approval_id: string
          created_at: string | null
          id: string
          metadata: Json | null
          notes: string | null
        }
        Insert: {
          action: string
          actor_id: string
          approval_id: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
        }
        Update: {
          action?: string
          actor_id?: string
          approval_id?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "approval_history_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approval_history_approval_id_fkey"
            columns: ["approval_id"]
            isOneToOne: false
            referencedRelation: "approvals"
            referencedColumns: ["id"]
          },
        ]
      }
      approvals: {
        Row: {
          action: string | null
          actual_processing_time_hours: number | null
          approved_at: string | null
          approved_by: string | null
          assigned_to: string | null
          created_at: string | null
          entity_id: string | null
          entity_metadata: Json | null
          entity_type: string | null
          id: string
          notes: string | null
          priority: string | null
          rejection_reason: string | null
          related_deal_id: string | null
          related_investor_id: string | null
          request_reason: string | null
          requested_by: string | null
          requires_secondary_approval: boolean | null
          resolved_at: string | null
          secondary_approved_at: string | null
          secondary_approved_by: string | null
          secondary_approver_role: string | null
          sla_breach_at: string | null
          sla_paused_at: string | null
          sla_resumed_at: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          action?: string | null
          actual_processing_time_hours?: number | null
          approved_at?: string | null
          approved_by?: string | null
          assigned_to?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_metadata?: Json | null
          entity_type?: string | null
          id?: string
          notes?: string | null
          priority?: string | null
          rejection_reason?: string | null
          related_deal_id?: string | null
          related_investor_id?: string | null
          request_reason?: string | null
          requested_by?: string | null
          requires_secondary_approval?: boolean | null
          resolved_at?: string | null
          secondary_approved_at?: string | null
          secondary_approved_by?: string | null
          secondary_approver_role?: string | null
          sla_breach_at?: string | null
          sla_paused_at?: string | null
          sla_resumed_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          action?: string | null
          actual_processing_time_hours?: number | null
          approved_at?: string | null
          approved_by?: string | null
          assigned_to?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_metadata?: Json | null
          entity_type?: string | null
          id?: string
          notes?: string | null
          priority?: string | null
          rejection_reason?: string | null
          related_deal_id?: string | null
          related_investor_id?: string | null
          request_reason?: string | null
          requested_by?: string | null
          requires_secondary_approval?: boolean | null
          resolved_at?: string | null
          secondary_approved_at?: string | null
          secondary_approved_by?: string | null
          secondary_approver_role?: string | null
          sla_breach_at?: string | null
          sla_paused_at?: string | null
          sla_resumed_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "approvals_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approvals_decided_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approvals_related_deal_id_fkey"
            columns: ["related_deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approvals_related_investor_id_fkey"
            columns: ["related_investor_id"]
            isOneToOne: false
            referencedRelation: "investors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approvals_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approvals_secondary_approved_by_fkey"
            columns: ["secondary_approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      arranger_entities: {
        Row: {
          address: string | null
          created_at: string | null
          created_by: string | null
          email: string | null
          id: string
          kyc_approved_at: string | null
          kyc_approved_by: string | null
          kyc_expires_at: string | null
          kyc_notes: string | null
          kyc_status: string | null
          legal_name: string
          license_expiry_date: string | null
          license_number: string | null
          license_type: string | null
          logo_url: string | null
          metadata: Json | null
          phone: string | null
          registration_number: string | null
          regulator: string | null
          status: string | null
          tax_id: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          id?: string
          kyc_approved_at?: string | null
          kyc_approved_by?: string | null
          kyc_expires_at?: string | null
          kyc_notes?: string | null
          kyc_status?: string | null
          legal_name: string
          license_expiry_date?: string | null
          license_number?: string | null
          license_type?: string | null
          logo_url?: string | null
          metadata?: Json | null
          phone?: string | null
          registration_number?: string | null
          regulator?: string | null
          status?: string | null
          tax_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          id?: string
          kyc_approved_at?: string | null
          kyc_approved_by?: string | null
          kyc_expires_at?: string | null
          kyc_notes?: string | null
          kyc_status?: string | null
          legal_name?: string
          license_expiry_date?: string | null
          license_number?: string | null
          license_type?: string | null
          logo_url?: string | null
          metadata?: Json | null
          phone?: string | null
          registration_number?: string | null
          regulator?: string | null
          status?: string | null
          tax_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "arranger_entities_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "arranger_entities_kyc_approved_by_fkey"
            columns: ["kyc_approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "arranger_entities_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      arranger_members: {
        Row: {
          arranger_id: string
          created_at: string
          created_by: string | null
          effective_from: string | null
          effective_to: string | null
          email: string | null
          full_name: string
          id: string
          id_expiry_date: string | null
          id_number: string | null
          id_type: string | null
          is_active: boolean
          is_beneficial_owner: boolean
          is_signatory: boolean
          nationality: string | null
          ownership_percentage: number | null
          phone: string | null
          residential_city: string | null
          residential_country: string | null
          residential_postal_code: string | null
          residential_state: string | null
          residential_street: string | null
          role: string
          role_title: string | null
          updated_at: string
        }
        Insert: {
          arranger_id: string
          created_at?: string
          created_by?: string | null
          effective_from?: string | null
          effective_to?: string | null
          email?: string | null
          full_name: string
          id?: string
          id_expiry_date?: string | null
          id_number?: string | null
          id_type?: string | null
          is_active?: boolean
          is_beneficial_owner?: boolean
          is_signatory?: boolean
          nationality?: string | null
          ownership_percentage?: number | null
          phone?: string | null
          residential_city?: string | null
          residential_country?: string | null
          residential_postal_code?: string | null
          residential_state?: string | null
          residential_street?: string | null
          role: string
          role_title?: string | null
          updated_at?: string
        }
        Update: {
          arranger_id?: string
          created_at?: string
          created_by?: string | null
          effective_from?: string | null
          effective_to?: string | null
          email?: string | null
          full_name?: string
          id?: string
          id_expiry_date?: string | null
          id_number?: string | null
          id_type?: string | null
          is_active?: boolean
          is_beneficial_owner?: boolean
          is_signatory?: boolean
          nationality?: string | null
          ownership_percentage?: number | null
          phone?: string | null
          residential_city?: string | null
          residential_country?: string | null
          residential_postal_code?: string | null
          residential_state?: string | null
          residential_street?: string | null
          role?: string
          role_title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "arranger_members_arranger_fk"
            columns: ["arranger_id"]
            isOneToOne: false
            referencedRelation: "arranger_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "arranger_members_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      arranger_users: {
        Row: {
          arranger_id: string
          created_at: string
          created_by: string | null
          is_primary: boolean
          role: string
          user_id: string
        }
        Insert: {
          arranger_id: string
          created_at?: string
          created_by?: string | null
          is_primary?: boolean
          role?: string
          user_id: string
        }
        Update: {
          arranger_id?: string
          created_at?: string
          created_by?: string | null
          is_primary?: boolean
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "arranger_users_arranger_fk"
            columns: ["arranger_id"]
            isOneToOne: false
            referencedRelation: "arranger_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "arranger_users_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "arranger_users_user_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          action_details: Json | null
          actor_email: string | null
          actor_id: string | null
          actor_name: string | null
          actor_role: string | null
          after_value: Json | null
          before_value: Json | null
          compliance_flag: boolean | null
          compliance_notes: string | null
          compliance_review_status: string | null
          compliance_reviewed_at: string | null
          compliance_reviewer_id: string | null
          created_at: string
          entity_id: string | null
          entity_name: string | null
          entity_type: string | null
          event_type: string
          id: string
          ip_address: unknown
          retention_category: string | null
          retention_expiry: string | null
          risk_level: string | null
          timestamp: string
          user_agent: string | null
        }
        Insert: {
          action: string
          action_details?: Json | null
          actor_email?: string | null
          actor_id?: string | null
          actor_name?: string | null
          actor_role?: string | null
          after_value?: Json | null
          before_value?: Json | null
          compliance_flag?: boolean | null
          compliance_notes?: string | null
          compliance_review_status?: string | null
          compliance_reviewed_at?: string | null
          compliance_reviewer_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_name?: string | null
          entity_type?: string | null
          event_type: string
          id?: string
          ip_address?: unknown
          retention_category?: string | null
          retention_expiry?: string | null
          risk_level?: string | null
          timestamp?: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          action_details?: Json | null
          actor_email?: string | null
          actor_id?: string | null
          actor_name?: string | null
          actor_role?: string | null
          after_value?: Json | null
          before_value?: Json | null
          compliance_flag?: boolean | null
          compliance_notes?: string | null
          compliance_review_status?: string | null
          compliance_reviewed_at?: string | null
          compliance_reviewer_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_name?: string | null
          entity_type?: string | null
          event_type?: string
          id?: string
          ip_address?: unknown
          retention_category?: string | null
          retention_expiry?: string | null
          risk_level?: string | null
          timestamp?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_compliance_reviewer_id_fkey"
            columns: ["compliance_reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_report_templates: {
        Row: {
          config: Json
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          output_format: string[] | null
          report_type: string
        }
        Insert: {
          config: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          output_format?: string[] | null
          report_type: string
        }
        Update: {
          config?: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          output_format?: string[] | null
          report_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_report_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_webhook_events: {
        Row: {
          event_type: string
          id: string
          payload: Json
          received_at: string
          related_deal_id: string | null
          related_investor_id: string | null
        }
        Insert: {
          event_type: string
          id?: string
          payload: Json
          received_at?: string
          related_deal_id?: string | null
          related_investor_id?: string | null
        }
        Update: {
          event_type?: string
          id?: string
          payload?: Json
          received_at?: string
          related_deal_id?: string | null
          related_investor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "automation_webhook_events_related_deal_id_fkey"
            columns: ["related_deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_webhook_events_related_investor_id_fkey"
            columns: ["related_investor_id"]
            isOneToOne: false
            referencedRelation: "investors"
            referencedColumns: ["id"]
          },
        ]
      }
      bank_transactions: {
        Row: {
          account_ref: string | null
          amount: number | null
          bank_reference: string | null
          counterparty: string | null
          counterparty_account: string | null
          created_at: string | null
          currency: string | null
          discrepancy_amount: number | null
          id: string
          import_batch_id: string | null
          match_confidence: number | null
          match_group_id: string | null
          match_notes: string | null
          matched_invoice_ids: string[] | null
          matched_subscription_id: string | null
          memo: string | null
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string | null
          updated_at: string | null
          value_date: string | null
        }
        Insert: {
          account_ref?: string | null
          amount?: number | null
          bank_reference?: string | null
          counterparty?: string | null
          counterparty_account?: string | null
          created_at?: string | null
          currency?: string | null
          discrepancy_amount?: number | null
          id?: string
          import_batch_id?: string | null
          match_confidence?: number | null
          match_group_id?: string | null
          match_notes?: string | null
          matched_invoice_ids?: string[] | null
          matched_subscription_id?: string | null
          memo?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
          updated_at?: string | null
          value_date?: string | null
        }
        Update: {
          account_ref?: string | null
          amount?: number | null
          bank_reference?: string | null
          counterparty?: string | null
          counterparty_account?: string | null
          created_at?: string | null
          currency?: string | null
          discrepancy_amount?: number | null
          id?: string
          import_batch_id?: string | null
          match_confidence?: number | null
          match_group_id?: string | null
          match_notes?: string | null
          matched_invoice_ids?: string[] | null
          matched_subscription_id?: string | null
          memo?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
          updated_at?: string | null
          value_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bank_transactions_matched_subscription_id_fkey"
            columns: ["matched_subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_transactions_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      capital_call_items: {
        Row: {
          balance_due: number | null
          bank_transaction_ids: string[] | null
          called_amount: number
          capital_call_id: string
          created_at: string | null
          due_date: string
          id: string
          investor_id: string
          notes: string | null
          paid_amount: number
          paid_date: string | null
          status: string | null
          subscription_id: string
          updated_at: string | null
        }
        Insert: {
          balance_due?: number | null
          bank_transaction_ids?: string[] | null
          called_amount: number
          capital_call_id: string
          created_at?: string | null
          due_date: string
          id?: string
          investor_id: string
          notes?: string | null
          paid_amount?: number
          paid_date?: string | null
          status?: string | null
          subscription_id: string
          updated_at?: string | null
        }
        Update: {
          balance_due?: number | null
          bank_transaction_ids?: string[] | null
          called_amount?: number
          capital_call_id?: string
          created_at?: string | null
          due_date?: string
          id?: string
          investor_id?: string
          notes?: string | null
          paid_amount?: number
          paid_date?: string | null
          status?: string | null
          subscription_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "capital_call_items_capital_call_id_fkey"
            columns: ["capital_call_id"]
            isOneToOne: false
            referencedRelation: "capital_calls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "capital_call_items_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "investors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "capital_call_items_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      capital_calls: {
        Row: {
          call_pct: number | null
          due_date: string | null
          id: string
          name: string | null
          status: string | null
          vehicle_id: string | null
        }
        Insert: {
          call_pct?: number | null
          due_date?: string | null
          id?: string
          name?: string | null
          status?: string | null
          vehicle_id?: string | null
        }
        Update: {
          call_pct?: number | null
          due_date?: string | null
          id?: string
          name?: string | null
          status?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "capital_calls_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "entity_action_center_summary"
            referencedColumns: ["vehicle_id"]
          },
          {
            foreignKeyName: "capital_calls_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      cashflows: {
        Row: {
          amount: number | null
          date: string | null
          id: string
          investor_id: string | null
          ref_id: string | null
          type: string | null
          vehicle_id: string | null
        }
        Insert: {
          amount?: number | null
          date?: string | null
          id?: string
          investor_id?: string | null
          ref_id?: string | null
          type?: string | null
          vehicle_id?: string | null
        }
        Update: {
          amount?: number | null
          date?: string | null
          id?: string
          investor_id?: string | null
          ref_id?: string | null
          type?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cashflows_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "investors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cashflows_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "entity_action_center_summary"
            referencedColumns: ["vehicle_id"]
          },
          {
            foreignKeyName: "cashflows_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      commercial_partner_clients: {
        Row: {
          client_email: string | null
          client_investor_id: string | null
          client_name: string
          client_phone: string | null
          client_type: string
          commercial_partner_id: string
          created_at: string
          created_by: string | null
          created_for_deal_id: string | null
          id: string
          is_active: boolean
          updated_at: string
        }
        Insert: {
          client_email?: string | null
          client_investor_id?: string | null
          client_name: string
          client_phone?: string | null
          client_type?: string
          commercial_partner_id: string
          created_at?: string
          created_by?: string | null
          created_for_deal_id?: string | null
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Update: {
          client_email?: string | null
          client_investor_id?: string | null
          client_name?: string
          client_phone?: string | null
          client_type?: string
          commercial_partner_id?: string
          created_at?: string
          created_by?: string | null
          created_for_deal_id?: string | null
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "commercial_partner_clients_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cp_clients_cp_fk"
            columns: ["commercial_partner_id"]
            isOneToOne: false
            referencedRelation: "commercial_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cp_clients_deal_fk"
            columns: ["created_for_deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cp_clients_investor_fk"
            columns: ["client_investor_id"]
            isOneToOne: false
            referencedRelation: "investors"
            referencedColumns: ["id"]
          },
        ]
      }
      commercial_partner_members: {
        Row: {
          commercial_partner_id: string
          created_at: string
          created_by: string | null
          effective_from: string | null
          effective_to: string | null
          email: string | null
          full_name: string
          id: string
          id_expiry_date: string | null
          id_number: string | null
          id_type: string | null
          is_active: boolean
          is_beneficial_owner: boolean
          is_signatory: boolean
          nationality: string | null
          ownership_percentage: number | null
          phone: string | null
          residential_city: string | null
          residential_country: string | null
          residential_postal_code: string | null
          residential_state: string | null
          residential_street: string | null
          role: string
          role_title: string | null
          updated_at: string
        }
        Insert: {
          commercial_partner_id: string
          created_at?: string
          created_by?: string | null
          effective_from?: string | null
          effective_to?: string | null
          email?: string | null
          full_name: string
          id?: string
          id_expiry_date?: string | null
          id_number?: string | null
          id_type?: string | null
          is_active?: boolean
          is_beneficial_owner?: boolean
          is_signatory?: boolean
          nationality?: string | null
          ownership_percentage?: number | null
          phone?: string | null
          residential_city?: string | null
          residential_country?: string | null
          residential_postal_code?: string | null
          residential_state?: string | null
          residential_street?: string | null
          role: string
          role_title?: string | null
          updated_at?: string
        }
        Update: {
          commercial_partner_id?: string
          created_at?: string
          created_by?: string | null
          effective_from?: string | null
          effective_to?: string | null
          email?: string | null
          full_name?: string
          id?: string
          id_expiry_date?: string | null
          id_number?: string | null
          id_type?: string | null
          is_active?: boolean
          is_beneficial_owner?: boolean
          is_signatory?: boolean
          nationality?: string | null
          ownership_percentage?: number | null
          phone?: string | null
          residential_city?: string | null
          residential_country?: string | null
          residential_postal_code?: string | null
          residential_state?: string | null
          residential_street?: string | null
          role?: string
          role_title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "commercial_partner_members_cp_fk"
            columns: ["commercial_partner_id"]
            isOneToOne: false
            referencedRelation: "commercial_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commercial_partner_members_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      commercial_partner_users: {
        Row: {
          can_execute_for_clients: boolean
          can_sign: boolean
          commercial_partner_id: string
          created_at: string
          created_by: string | null
          is_primary: boolean
          role: string
          user_id: string
        }
        Insert: {
          can_execute_for_clients?: boolean
          can_sign?: boolean
          commercial_partner_id: string
          created_at?: string
          created_by?: string | null
          is_primary?: boolean
          role?: string
          user_id: string
        }
        Update: {
          can_execute_for_clients?: boolean
          can_sign?: boolean
          commercial_partner_id?: string
          created_at?: string
          created_by?: string | null
          is_primary?: boolean
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "commercial_partner_users_cp_fk"
            columns: ["commercial_partner_id"]
            isOneToOne: false
            referencedRelation: "commercial_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commercial_partner_users_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commercial_partner_users_user_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      commercial_partners: {
        Row: {
          account_manager_id: string | null
          address_line_1: string | null
          address_line_2: string | null
          city: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          contract_document_id: string | null
          contract_end_date: string | null
          contract_start_date: string | null
          country: string | null
          cp_type: string
          created_at: string
          created_by: string | null
          id: string
          jurisdiction: string | null
          kyc_approved_at: string | null
          kyc_approved_by: string | null
          kyc_expires_at: string | null
          kyc_notes: string | null
          kyc_status: string | null
          legal_name: string | null
          logo_url: string | null
          name: string
          notes: string | null
          payment_terms: string | null
          postal_code: string | null
          regulatory_number: string | null
          regulatory_status: string | null
          status: string
          type: string
          updated_at: string
          website: string | null
        }
        Insert: {
          account_manager_id?: string | null
          address_line_1?: string | null
          address_line_2?: string | null
          city?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contract_document_id?: string | null
          contract_end_date?: string | null
          contract_start_date?: string | null
          country?: string | null
          cp_type: string
          created_at?: string
          created_by?: string | null
          id?: string
          jurisdiction?: string | null
          kyc_approved_at?: string | null
          kyc_approved_by?: string | null
          kyc_expires_at?: string | null
          kyc_notes?: string | null
          kyc_status?: string | null
          legal_name?: string | null
          logo_url?: string | null
          name: string
          notes?: string | null
          payment_terms?: string | null
          postal_code?: string | null
          regulatory_number?: string | null
          regulatory_status?: string | null
          status?: string
          type: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          account_manager_id?: string | null
          address_line_1?: string | null
          address_line_2?: string | null
          city?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contract_document_id?: string | null
          contract_end_date?: string | null
          contract_start_date?: string | null
          country?: string | null
          cp_type?: string
          created_at?: string
          created_by?: string | null
          id?: string
          jurisdiction?: string | null
          kyc_approved_at?: string | null
          kyc_approved_by?: string | null
          kyc_expires_at?: string | null
          kyc_notes?: string | null
          kyc_status?: string | null
          legal_name?: string | null
          logo_url?: string | null
          name?: string
          notes?: string | null
          payment_terms?: string | null
          postal_code?: string | null
          regulatory_number?: string | null
          regulatory_status?: string | null
          status?: string
          type?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commercial_partners_account_manager_id_fkey"
            columns: ["account_manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commercial_partners_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commercial_partners_kyc_approved_by_fkey"
            columns: ["kyc_approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          company_stage: string | null
          created_at: string
          created_by: string | null
          description: string | null
          headquarters_city: string | null
          headquarters_country: string | null
          id: string
          industry: string | null
          legal_name: string | null
          logo_url: string | null
          name: string
          sector: string | null
          sub_industry: string | null
          ticker_symbol: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          company_stage?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          headquarters_city?: string | null
          headquarters_country?: string | null
          id?: string
          industry?: string | null
          legal_name?: string | null
          logo_url?: string | null
          name: string
          sector?: string | null
          sub_industry?: string | null
          ticker_symbol?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          company_stage?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          headquarters_city?: string | null
          headquarters_country?: string | null
          id?: string
          industry?: string | null
          legal_name?: string | null
          logo_url?: string | null
          name?: string
          sector?: string | null
          sub_industry?: string | null
          ticker_symbol?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      company_valuations: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          funding_round: string | null
          id: string
          source: string | null
          valuation_amount: number
          valuation_currency: string
          valuation_date: string
          valuation_type: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          funding_round?: string | null
          id?: string
          source?: string | null
          valuation_amount: number
          valuation_currency?: string
          valuation_date: string
          valuation_type?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          funding_round?: string | null
          id?: string
          source?: string | null
          valuation_amount?: number
          valuation_currency?: string
          valuation_date?: string
          valuation_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_valuations_company_fk"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_valuations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_alerts: {
        Row: {
          alert_type: string
          assigned_to: string | null
          audit_log_id: string | null
          created_at: string | null
          description: string | null
          id: string
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          alert_type: string
          assigned_to?: string | null
          audit_log_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          alert_type?: string
          assigned_to?: string | null
          audit_log_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_alerts_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_alerts_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          created_at: string
          is_muted: boolean
          is_pinned: boolean
          joined_at: string
          last_notified_at: string | null
          last_read_at: string | null
          participant_role: Database["public"]["Enums"]["participant_role_enum"]
          updated_at: string
          user_id: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          is_muted?: boolean
          is_pinned?: boolean
          joined_at?: string
          last_notified_at?: string | null
          last_read_at?: string | null
          participant_role?: Database["public"]["Enums"]["participant_role_enum"]
          updated_at?: string
          user_id: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          is_muted?: boolean
          is_pinned?: boolean
          joined_at?: string
          last_notified_at?: string | null
          last_read_at?: string | null
          participant_role?: Database["public"]["Enums"]["participant_role_enum"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          archived_at: string | null
          created_at: string
          created_by: string | null
          deal_id: string | null
          id: string
          last_message_at: string | null
          last_message_id: string | null
          metadata: Json
          owner_team: string | null
          preview: string | null
          subject: string | null
          type: Database["public"]["Enums"]["conversation_type_enum"]
          updated_at: string
          visibility: Database["public"]["Enums"]["conversation_visibility_enum"]
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          created_by?: string | null
          deal_id?: string | null
          id?: string
          last_message_at?: string | null
          last_message_id?: string | null
          metadata?: Json
          owner_team?: string | null
          preview?: string | null
          subject?: string | null
          type?: Database["public"]["Enums"]["conversation_type_enum"]
          updated_at?: string
          visibility?: Database["public"]["Enums"]["conversation_visibility_enum"]
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          created_by?: string | null
          deal_id?: string | null
          id?: string
          last_message_at?: string | null
          last_message_id?: string | null
          metadata?: Json
          owner_team?: string | null
          preview?: string | null
          subject?: string | null
          type?: Database["public"]["Enums"]["conversation_type_enum"]
          updated_at?: string
          visibility?: Database["public"]["Enums"]["conversation_visibility_enum"]
        }
        Relationships: [
          {
            foreignKeyName: "conversations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      counterparty_entity_members: {
        Row: {
          counterparty_entity_id: string
          created_at: string | null
          created_by: string | null
          effective_from: string | null
          effective_to: string | null
          email: string | null
          full_name: string
          id: string
          id_expiry_date: string | null
          id_number: string | null
          id_type: string | null
          is_active: boolean | null
          is_beneficial_owner: boolean | null
          kyc_approved_at: string | null
          kyc_approved_by: string | null
          kyc_expiry_date: string | null
          kyc_status: string | null
          nationality: string | null
          ownership_percentage: number | null
          phone: string | null
          residential_city: string | null
          residential_country: string | null
          residential_postal_code: string | null
          residential_state: string | null
          residential_street: string | null
          role: string
          role_title: string | null
          updated_at: string | null
        }
        Insert: {
          counterparty_entity_id: string
          created_at?: string | null
          created_by?: string | null
          effective_from?: string | null
          effective_to?: string | null
          email?: string | null
          full_name: string
          id?: string
          id_expiry_date?: string | null
          id_number?: string | null
          id_type?: string | null
          is_active?: boolean | null
          is_beneficial_owner?: boolean | null
          kyc_approved_at?: string | null
          kyc_approved_by?: string | null
          kyc_expiry_date?: string | null
          kyc_status?: string | null
          nationality?: string | null
          ownership_percentage?: number | null
          phone?: string | null
          residential_city?: string | null
          residential_country?: string | null
          residential_postal_code?: string | null
          residential_state?: string | null
          residential_street?: string | null
          role: string
          role_title?: string | null
          updated_at?: string | null
        }
        Update: {
          counterparty_entity_id?: string
          created_at?: string | null
          created_by?: string | null
          effective_from?: string | null
          effective_to?: string | null
          email?: string | null
          full_name?: string
          id?: string
          id_expiry_date?: string | null
          id_number?: string | null
          id_type?: string | null
          is_active?: boolean | null
          is_beneficial_owner?: boolean | null
          kyc_approved_at?: string | null
          kyc_approved_by?: string | null
          kyc_expiry_date?: string | null
          kyc_status?: string | null
          nationality?: string | null
          ownership_percentage?: number | null
          phone?: string | null
          residential_city?: string | null
          residential_country?: string | null
          residential_postal_code?: string | null
          residential_state?: string | null
          residential_street?: string | null
          role?: string
          role_title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "counterparty_entity_members_counterparty_entity_id_fkey"
            columns: ["counterparty_entity_id"]
            isOneToOne: false
            referencedRelation: "investor_counterparty"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "counterparty_entity_members_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "counterparty_entity_members_kyc_approved_by_fkey"
            columns: ["kyc_approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dashboard_preferences: {
        Row: {
          custom_metrics: Json | null
          id: string
          layout_config: Json | null
          notification_settings: Json | null
          theme_settings: Json | null
          updated_at: string | null
          user_id: string | null
          widget_order: string[] | null
        }
        Insert: {
          custom_metrics?: Json | null
          id?: string
          layout_config?: Json | null
          notification_settings?: Json | null
          theme_settings?: Json | null
          updated_at?: string | null
          user_id?: string | null
          widget_order?: string[] | null
        }
        Update: {
          custom_metrics?: Json | null
          id?: string
          layout_config?: Json | null
          notification_settings?: Json | null
          theme_settings?: Json | null
          updated_at?: string | null
          user_id?: string | null
          widget_order?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "dashboard_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_activity_events: {
        Row: {
          deal_id: string
          event_type: string
          id: string
          investor_id: string | null
          occurred_at: string
          payload: Json
        }
        Insert: {
          deal_id: string
          event_type: string
          id?: string
          investor_id?: string | null
          occurred_at?: string
          payload?: Json
        }
        Update: {
          deal_id?: string
          event_type?: string
          id?: string
          investor_id?: string | null
          occurred_at?: string
          payload?: Json
        }
        Relationships: [
          {
            foreignKeyName: "deal_activity_events_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_activity_events_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "investors"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_data_room_access: {
        Row: {
          auto_granted: boolean
          deal_id: string
          expires_at: string | null
          granted_at: string
          granted_by: string | null
          id: string
          investor_id: string
          last_warning_sent_at: string | null
          notes: string | null
          revoked_at: string | null
          revoked_by: string | null
        }
        Insert: {
          auto_granted?: boolean
          deal_id: string
          expires_at?: string | null
          granted_at?: string
          granted_by?: string | null
          id?: string
          investor_id: string
          last_warning_sent_at?: string | null
          notes?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
        }
        Update: {
          auto_granted?: boolean
          deal_id?: string
          expires_at?: string | null
          granted_at?: string
          granted_by?: string | null
          id?: string
          investor_id?: string
          last_warning_sent_at?: string | null
          notes?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deal_data_room_access_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_data_room_access_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_data_room_access_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "investors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_data_room_access_revoked_by_fkey"
            columns: ["revoked_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_data_room_documents: {
        Row: {
          created_at: string
          created_by: string | null
          deal_id: string
          document_expires_at: string | null
          document_notes: string | null
          external_link: string | null
          file_key: string | null
          file_name: string | null
          file_size_bytes: number | null
          folder: string | null
          id: string
          is_featured: boolean | null
          metadata_json: Json | null
          mime_type: string | null
          replaced_by_id: string | null
          tags: string[] | null
          updated_at: string
          version: number
          visible_to_investors: boolean
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deal_id: string
          document_expires_at?: string | null
          document_notes?: string | null
          external_link?: string | null
          file_key?: string | null
          file_name?: string | null
          file_size_bytes?: number | null
          folder?: string | null
          id?: string
          is_featured?: boolean | null
          metadata_json?: Json | null
          mime_type?: string | null
          replaced_by_id?: string | null
          tags?: string[] | null
          updated_at?: string
          version?: number
          visible_to_investors?: boolean
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deal_id?: string
          document_expires_at?: string | null
          document_notes?: string | null
          external_link?: string | null
          file_key?: string | null
          file_name?: string | null
          file_size_bytes?: number | null
          folder?: string | null
          id?: string
          is_featured?: boolean | null
          metadata_json?: Json | null
          mime_type?: string | null
          replaced_by_id?: string | null
          tags?: string[] | null
          updated_at?: string
          version?: number
          visible_to_investors?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "deal_data_room_documents_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_data_room_documents_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_data_room_documents_replaced_by_id_fkey"
            columns: ["replaced_by_id"]
            isOneToOne: false
            referencedRelation: "deal_data_room_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_faqs: {
        Row: {
          answer: string
          created_at: string
          created_by: string | null
          deal_id: string
          display_order: number
          id: string
          question: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          answer: string
          created_at?: string
          created_by?: string | null
          deal_id: string
          display_order?: number
          id?: string
          question: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          answer?: string
          created_at?: string
          created_by?: string | null
          deal_id?: string
          display_order?: number
          id?: string
          question?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deal_faqs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_faqs_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_faqs_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_fee_structures: {
        Row: {
          allocation_up_to: number | null
          archived_at: string | null
          arranger_person_name: string | null
          arranger_person_title: string | null
          capital_call_timeline: string | null
          carried_interest_percent: number | null
          completion_date_text: string | null
          created_at: string
          created_by: string | null
          deal_id: string
          effective_at: string | null
          escrow_fee_text: string | null
          exclusive_arranger: string | null
          id: string
          in_principle_approval_text: string | null
          interest_confirmation_deadline: string | null
          issue_within_business_days: number | null
          issuer: string | null
          issuer_signatory_name: string | null
          issuer_signatory_title: string | null
          legal_counsel: string | null
          management_fee_clause: string | null
          management_fee_percent: number | null
          maximum_ticket: number | null
          minimum_ticket: number | null
          opportunity_summary: string | null
          payment_deadline_days: number | null
          performance_fee_clause: string | null
          price_per_share_text: string | null
          published_at: string | null
          purchaser: string | null
          recital_b_html: string | null
          seller: string | null
          share_certificates_note: string | null
          status: string
          structure: string | null
          subject_to_change_note: string | null
          subscription_fee_percent: number | null
          subscription_pack_note: string | null
          term_sheet_attachment_key: string | null
          term_sheet_date: string | null
          term_sheet_html: string | null
          transaction_type: string | null
          updated_at: string
          validity_date: string | null
          vehicle: string | null
          version: number
          wire_account_holder: string | null
          wire_bank_address: string | null
          wire_bank_name: string | null
          wire_bic: string | null
          wire_contact_email: string | null
          wire_description_format: string | null
          wire_escrow_agent: string | null
          wire_iban: string | null
          wire_law_firm_address: string | null
          wire_reference_format: string | null
        }
        Insert: {
          allocation_up_to?: number | null
          archived_at?: string | null
          arranger_person_name?: string | null
          arranger_person_title?: string | null
          capital_call_timeline?: string | null
          carried_interest_percent?: number | null
          completion_date_text?: string | null
          created_at?: string
          created_by?: string | null
          deal_id: string
          effective_at?: string | null
          escrow_fee_text?: string | null
          exclusive_arranger?: string | null
          id?: string
          in_principle_approval_text?: string | null
          interest_confirmation_deadline?: string | null
          issue_within_business_days?: number | null
          issuer?: string | null
          issuer_signatory_name?: string | null
          issuer_signatory_title?: string | null
          legal_counsel?: string | null
          management_fee_clause?: string | null
          management_fee_percent?: number | null
          maximum_ticket?: number | null
          minimum_ticket?: number | null
          opportunity_summary?: string | null
          payment_deadline_days?: number | null
          performance_fee_clause?: string | null
          price_per_share_text?: string | null
          published_at?: string | null
          purchaser?: string | null
          recital_b_html?: string | null
          seller?: string | null
          share_certificates_note?: string | null
          status?: string
          structure?: string | null
          subject_to_change_note?: string | null
          subscription_fee_percent?: number | null
          subscription_pack_note?: string | null
          term_sheet_attachment_key?: string | null
          term_sheet_date?: string | null
          term_sheet_html?: string | null
          transaction_type?: string | null
          updated_at?: string
          validity_date?: string | null
          vehicle?: string | null
          version?: number
          wire_account_holder?: string | null
          wire_bank_address?: string | null
          wire_bank_name?: string | null
          wire_bic?: string | null
          wire_contact_email?: string | null
          wire_description_format?: string | null
          wire_escrow_agent?: string | null
          wire_iban?: string | null
          wire_law_firm_address?: string | null
          wire_reference_format?: string | null
        }
        Update: {
          allocation_up_to?: number | null
          archived_at?: string | null
          arranger_person_name?: string | null
          arranger_person_title?: string | null
          capital_call_timeline?: string | null
          carried_interest_percent?: number | null
          completion_date_text?: string | null
          created_at?: string
          created_by?: string | null
          deal_id?: string
          effective_at?: string | null
          escrow_fee_text?: string | null
          exclusive_arranger?: string | null
          id?: string
          in_principle_approval_text?: string | null
          interest_confirmation_deadline?: string | null
          issue_within_business_days?: number | null
          issuer?: string | null
          issuer_signatory_name?: string | null
          issuer_signatory_title?: string | null
          legal_counsel?: string | null
          management_fee_clause?: string | null
          management_fee_percent?: number | null
          maximum_ticket?: number | null
          minimum_ticket?: number | null
          opportunity_summary?: string | null
          payment_deadline_days?: number | null
          performance_fee_clause?: string | null
          price_per_share_text?: string | null
          published_at?: string | null
          purchaser?: string | null
          recital_b_html?: string | null
          seller?: string | null
          share_certificates_note?: string | null
          status?: string
          structure?: string | null
          subject_to_change_note?: string | null
          subscription_fee_percent?: number | null
          subscription_pack_note?: string | null
          term_sheet_attachment_key?: string | null
          term_sheet_date?: string | null
          term_sheet_html?: string | null
          transaction_type?: string | null
          updated_at?: string
          validity_date?: string | null
          vehicle?: string | null
          version?: number
          wire_account_holder?: string | null
          wire_bank_address?: string | null
          wire_bank_name?: string | null
          wire_bic?: string | null
          wire_contact_email?: string | null
          wire_description_format?: string | null
          wire_escrow_agent?: string | null
          wire_iban?: string | null
          wire_law_firm_address?: string | null
          wire_reference_format?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deal_fee_structures_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_fee_structures_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_lawyer_assignments: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          completed_at: string | null
          created_at: string | null
          deal_id: string
          id: string
          lawyer_id: string
          notes: string | null
          role: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          completed_at?: string | null
          created_at?: string | null
          deal_id: string
          id?: string
          lawyer_id: string
          notes?: string | null
          role?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          completed_at?: string | null
          created_at?: string | null
          deal_id?: string
          id?: string
          lawyer_id?: string
          notes?: string | null
          role?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deal_lawyer_assignments_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_lawyer_assignments_lawyer_id_fkey"
            columns: ["lawyer_id"]
            isOneToOne: false
            referencedRelation: "lawyers"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_memberships: {
        Row: {
          accepted_at: string | null
          data_room_granted_at: string | null
          deal_id: string
          dispatched_at: string | null
          interest_confirmed_at: string | null
          investor_id: string | null
          invited_at: string | null
          invited_by: string | null
          nda_signed_at: string | null
          referred_by_entity_id: string | null
          referred_by_entity_type: string | null
          role: Database["public"]["Enums"]["deal_member_role"]
          user_id: string
          viewed_at: string | null
        }
        Insert: {
          accepted_at?: string | null
          data_room_granted_at?: string | null
          deal_id: string
          dispatched_at?: string | null
          interest_confirmed_at?: string | null
          investor_id?: string | null
          invited_at?: string | null
          invited_by?: string | null
          nda_signed_at?: string | null
          referred_by_entity_id?: string | null
          referred_by_entity_type?: string | null
          role: Database["public"]["Enums"]["deal_member_role"]
          user_id: string
          viewed_at?: string | null
        }
        Update: {
          accepted_at?: string | null
          data_room_granted_at?: string | null
          deal_id?: string
          dispatched_at?: string | null
          interest_confirmed_at?: string | null
          investor_id?: string | null
          invited_at?: string | null
          invited_by?: string | null
          nda_signed_at?: string | null
          referred_by_entity_id?: string | null
          referred_by_entity_type?: string | null
          role?: Database["public"]["Enums"]["deal_member_role"]
          user_id?: string
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deal_memberships_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_memberships_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "investors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_memberships_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_memberships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_signatory_ndas: {
        Row: {
          created_at: string | null
          deal_id: string
          id: string
          investor_id: string
          member_id: string
          signature_data: Json | null
          signed_at: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          deal_id: string
          id?: string
          investor_id: string
          member_id: string
          signature_data?: Json | null
          signed_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          deal_id?: string
          id?: string
          investor_id?: string
          member_id?: string
          signature_data?: Json | null
          signed_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deal_signatory_ndas_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_signatory_ndas_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "investors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_signatory_ndas_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "investor_members"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_subscription_submissions: {
        Row: {
          approval_id: string | null
          approved_at: string | null
          approved_by: string | null
          counterparty_entity_id: string | null
          created_by: string | null
          deal_id: string
          decided_at: string | null
          decided_by: string | null
          formal_subscription_id: string | null
          id: string
          investor_id: string
          payload_json: Json
          rejected_at: string | null
          rejected_by: string | null
          rejection_reason: string | null
          status: string
          submitted_at: string
          subscription_type: string | null
        }
        Insert: {
          approval_id?: string | null
          approved_at?: string | null
          approved_by?: string | null
          counterparty_entity_id?: string | null
          created_by?: string | null
          deal_id: string
          decided_at?: string | null
          decided_by?: string | null
          formal_subscription_id?: string | null
          id?: string
          investor_id: string
          payload_json?: Json
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          status?: string
          submitted_at?: string
          subscription_type?: string | null
        }
        Update: {
          approval_id?: string | null
          approved_at?: string | null
          approved_by?: string | null
          counterparty_entity_id?: string | null
          created_by?: string | null
          deal_id?: string
          decided_at?: string | null
          decided_by?: string | null
          formal_subscription_id?: string | null
          id?: string
          investor_id?: string
          payload_json?: Json
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          status?: string
          submitted_at?: string
          subscription_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deal_subscription_submissions_approval_id_fkey"
            columns: ["approval_id"]
            isOneToOne: false
            referencedRelation: "approvals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_subscription_submissions_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_subscription_submissions_counterparty_entity_id_fkey"
            columns: ["counterparty_entity_id"]
            isOneToOne: false
            referencedRelation: "investor_counterparty"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_subscription_submissions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_subscription_submissions_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_subscription_submissions_decided_by_fkey"
            columns: ["decided_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_subscription_submissions_formal_subscription_id_fkey"
            columns: ["formal_subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_subscription_submissions_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "investors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_subscription_submissions_rejected_by_fkey"
            columns: ["rejected_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      deals: {
        Row: {
          arranger_entity_id: string | null
          close_at: string | null
          company_id: string | null
          company_logo_url: string | null
          company_name: string | null
          company_website: string | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          deal_round: string | null
          deal_type: Database["public"]["Enums"]["deal_type_enum"] | null
          description: string | null
          id: string
          investment_thesis: string | null
          location: string | null
          maximum_investment: number | null
          minimum_investment: number | null
          name: string
          offer_unit_price: number | null
          open_at: string | null
          raised_amount: number | null
          sector: string | null
          stage: string | null
          status: Database["public"]["Enums"]["deal_status_enum"] | null
          stock_type: string | null
          target_amount: number | null
          terms_schema: Json | null
          vehicle_id: string
        }
        Insert: {
          arranger_entity_id?: string | null
          close_at?: string | null
          company_id?: string | null
          company_logo_url?: string | null
          company_name?: string | null
          company_website?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          deal_round?: string | null
          deal_type?: Database["public"]["Enums"]["deal_type_enum"] | null
          description?: string | null
          id?: string
          investment_thesis?: string | null
          location?: string | null
          maximum_investment?: number | null
          minimum_investment?: number | null
          name: string
          offer_unit_price?: number | null
          open_at?: string | null
          raised_amount?: number | null
          sector?: string | null
          stage?: string | null
          status?: Database["public"]["Enums"]["deal_status_enum"] | null
          stock_type?: string | null
          target_amount?: number | null
          terms_schema?: Json | null
          vehicle_id: string
        }
        Update: {
          arranger_entity_id?: string | null
          close_at?: string | null
          company_id?: string | null
          company_logo_url?: string | null
          company_name?: string | null
          company_website?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          deal_round?: string | null
          deal_type?: Database["public"]["Enums"]["deal_type_enum"] | null
          description?: string | null
          id?: string
          investment_thesis?: string | null
          location?: string | null
          maximum_investment?: number | null
          minimum_investment?: number | null
          name?: string
          offer_unit_price?: number | null
          open_at?: string | null
          raised_amount?: number | null
          sector?: string | null
          stage?: string | null
          status?: Database["public"]["Enums"]["deal_status_enum"] | null
          stock_type?: string | null
          target_amount?: number | null
          terms_schema?: Json | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deals_arranger_entity_id_fkey"
            columns: ["arranger_entity_id"]
            isOneToOne: false
            referencedRelation: "arranger_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "entity_action_center_summary"
            referencedColumns: ["vehicle_id"]
          },
          {
            foreignKeyName: "deals_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      director_registry: {
        Row: {
          created_at: string | null
          created_by: string | null
          email: string | null
          full_name: string
          id: string
          id_number: string | null
          nationality: string | null
          notes: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          full_name: string
          id?: string
          id_number?: string | null
          nationality?: string | null
          notes?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          full_name?: string
          id?: string
          id_number?: string | null
          nationality?: string | null
          notes?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "director_registry_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      distribution_items: {
        Row: {
          balance_pending: number | null
          confirmed_date: string | null
          created_at: string | null
          distribution_amount: number
          distribution_id: string
          id: string
          investor_id: string
          notes: string | null
          sent_amount: number
          sent_date: string | null
          status: string | null
          subscription_id: string
          updated_at: string | null
          wire_reference: string | null
        }
        Insert: {
          balance_pending?: number | null
          confirmed_date?: string | null
          created_at?: string | null
          distribution_amount: number
          distribution_id: string
          id?: string
          investor_id: string
          notes?: string | null
          sent_amount?: number
          sent_date?: string | null
          status?: string | null
          subscription_id: string
          updated_at?: string | null
          wire_reference?: string | null
        }
        Update: {
          balance_pending?: number | null
          confirmed_date?: string | null
          created_at?: string | null
          distribution_amount?: number
          distribution_id?: string
          id?: string
          investor_id?: string
          notes?: string | null
          sent_amount?: number
          sent_date?: string | null
          status?: string | null
          subscription_id?: string
          updated_at?: string | null
          wire_reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "distribution_items_distribution_id_fkey"
            columns: ["distribution_id"]
            isOneToOne: false
            referencedRelation: "distributions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "distribution_items_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "investors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "distribution_items_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      distributions: {
        Row: {
          amount: number | null
          classification: string | null
          date: string | null
          id: string
          name: string | null
          vehicle_id: string | null
        }
        Insert: {
          amount?: number | null
          classification?: string | null
          date?: string | null
          id?: string
          name?: string | null
          vehicle_id?: string | null
        }
        Update: {
          amount?: number | null
          classification?: string | null
          date?: string | null
          id?: string
          name?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "distributions_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "entity_action_center_summary"
            referencedColumns: ["vehicle_id"]
          },
          {
            foreignKeyName: "distributions_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      document_approvals: {
        Row: {
          created_at: string | null
          document_id: string | null
          id: string
          requested_at: string | null
          requested_by: string | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          document_id?: string | null
          id?: string
          requested_at?: string | null
          requested_by?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          document_id?: string | null
          id?: string
          requested_at?: string | null
          requested_by?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_approvals_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_approvals_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_approvals_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      document_folders: {
        Row: {
          created_at: string | null
          created_by: string | null
          folder_type: string
          id: string
          name: string
          parent_folder_id: string | null
          path: string
          updated_at: string | null
          vehicle_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          folder_type: string
          id?: string
          name: string
          parent_folder_id?: string | null
          path: string
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          folder_type?: string
          id?: string
          name?: string
          parent_folder_id?: string | null
          path?: string
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_folders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_folders_parent_folder_id_fkey"
            columns: ["parent_folder_id"]
            isOneToOne: false
            referencedRelation: "document_folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_folders_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "entity_action_center_summary"
            referencedColumns: ["vehicle_id"]
          },
          {
            foreignKeyName: "document_folders_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      document_publishing_schedule: {
        Row: {
          created_at: string | null
          created_by: string | null
          document_id: string | null
          id: string
          publish_at: string
          published: boolean | null
          unpublish_at: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          document_id?: string | null
          id?: string
          publish_at: string
          published?: boolean | null
          unpublish_at?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          document_id?: string | null
          id?: string
          publish_at?: string
          published?: boolean | null
          unpublish_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_publishing_schedule_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_publishing_schedule_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      document_versions: {
        Row: {
          changes_description: string | null
          created_at: string | null
          created_by: string | null
          document_id: string | null
          file_key: string
          file_size_bytes: number | null
          id: string
          mime_type: string | null
          version_number: number
        }
        Insert: {
          changes_description?: string | null
          created_at?: string | null
          created_by?: string | null
          document_id?: string | null
          file_key: string
          file_size_bytes?: number | null
          id?: string
          mime_type?: string | null
          version_number: number
        }
        Update: {
          changes_description?: string | null
          created_at?: string | null
          created_by?: string | null
          document_id?: string | null
          file_key?: string
          file_size_bytes?: number | null
          id?: string
          mime_type?: string | null
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "document_versions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_versions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          arranger_entity_id: string | null
          created_at: string | null
          created_by: string | null
          current_version: number | null
          deal_id: string | null
          description: string | null
          entity_id: string | null
          external_url: string | null
          file_key: string
          file_size_bytes: number | null
          folder_id: string | null
          id: string
          is_published: boolean | null
          link_type: string | null
          mime_type: string | null
          name: string | null
          owner_investor_id: string | null
          owner_user_id: string | null
          published_at: string | null
          ready_for_signature: boolean | null
          signature_workflow_run_id: string | null
          status: string | null
          subscription_id: string | null
          subscription_submission_id: string | null
          tags: string[] | null
          type: string | null
          updated_at: string | null
          vehicle_id: string | null
          watermark: Json | null
        }
        Insert: {
          arranger_entity_id?: string | null
          created_at?: string | null
          created_by?: string | null
          current_version?: number | null
          deal_id?: string | null
          description?: string | null
          entity_id?: string | null
          external_url?: string | null
          file_key: string
          file_size_bytes?: number | null
          folder_id?: string | null
          id?: string
          is_published?: boolean | null
          link_type?: string | null
          mime_type?: string | null
          name?: string | null
          owner_investor_id?: string | null
          owner_user_id?: string | null
          published_at?: string | null
          ready_for_signature?: boolean | null
          signature_workflow_run_id?: string | null
          status?: string | null
          subscription_id?: string | null
          subscription_submission_id?: string | null
          tags?: string[] | null
          type?: string | null
          updated_at?: string | null
          vehicle_id?: string | null
          watermark?: Json | null
        }
        Update: {
          arranger_entity_id?: string | null
          created_at?: string | null
          created_by?: string | null
          current_version?: number | null
          deal_id?: string | null
          description?: string | null
          entity_id?: string | null
          external_url?: string | null
          file_key?: string
          file_size_bytes?: number | null
          folder_id?: string | null
          id?: string
          is_published?: boolean | null
          link_type?: string | null
          mime_type?: string | null
          name?: string | null
          owner_investor_id?: string | null
          owner_user_id?: string | null
          published_at?: string | null
          ready_for_signature?: boolean | null
          signature_workflow_run_id?: string | null
          status?: string | null
          subscription_id?: string | null
          subscription_submission_id?: string | null
          tags?: string[] | null
          type?: string | null
          updated_at?: string | null
          vehicle_id?: string | null
          watermark?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_arranger_entity_id_fkey"
            columns: ["arranger_entity_id"]
            isOneToOne: false
            referencedRelation: "arranger_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entity_action_center_summary"
            referencedColumns: ["vehicle_id"]
          },
          {
            foreignKeyName: "documents_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "document_folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_owner_investor_id_fkey"
            columns: ["owner_investor_id"]
            isOneToOne: false
            referencedRelation: "investors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_signature_workflow_run_id_fkey"
            columns: ["signature_workflow_run_id"]
            isOneToOne: false
            referencedRelation: "workflow_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_subscription_submission_id_fkey"
            columns: ["subscription_submission_id"]
            isOneToOne: false
            referencedRelation: "deal_subscription_submissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "entity_action_center_summary"
            referencedColumns: ["vehicle_id"]
          },
          {
            foreignKeyName: "documents_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      entity_directors: {
        Row: {
          created_at: string | null
          effective_from: string | null
          effective_to: string | null
          email: string | null
          full_name: string
          id: string
          notes: string | null
          role: string | null
          vehicle_id: string | null
        }
        Insert: {
          created_at?: string | null
          effective_from?: string | null
          effective_to?: string | null
          email?: string | null
          full_name: string
          id?: string
          notes?: string | null
          role?: string | null
          vehicle_id?: string | null
        }
        Update: {
          created_at?: string | null
          effective_from?: string | null
          effective_to?: string | null
          email?: string | null
          full_name?: string
          id?: string
          notes?: string | null
          role?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "entity_directors_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "entity_action_center_summary"
            referencedColumns: ["vehicle_id"]
          },
          {
            foreignKeyName: "entity_directors_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      entity_events: {
        Row: {
          changed_by: string | null
          created_at: string | null
          description: string | null
          event_type: string
          id: string
          payload: Json | null
          vehicle_id: string | null
        }
        Insert: {
          changed_by?: string | null
          created_at?: string | null
          description?: string | null
          event_type: string
          id?: string
          payload?: Json | null
          vehicle_id?: string | null
        }
        Update: {
          changed_by?: string | null
          created_at?: string | null
          description?: string | null
          event_type?: string
          id?: string
          payload?: Json | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "entity_events_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entity_events_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "entity_action_center_summary"
            referencedColumns: ["vehicle_id"]
          },
          {
            foreignKeyName: "entity_events_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      entity_flags: {
        Row: {
          created_at: string | null
          description: string | null
          due_date: string | null
          flag_type: Database["public"]["Enums"]["flag_type"]
          id: string
          is_resolved: boolean | null
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: Database["public"]["Enums"]["flag_severity"]
          status: string | null
          title: string
          updated_at: string | null
          vehicle_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          flag_type: Database["public"]["Enums"]["flag_type"]
          id?: string
          is_resolved?: boolean | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: Database["public"]["Enums"]["flag_severity"]
          status?: string | null
          title: string
          updated_at?: string | null
          vehicle_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          flag_type?: Database["public"]["Enums"]["flag_type"]
          id?: string
          is_resolved?: boolean | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: Database["public"]["Enums"]["flag_severity"]
          status?: string | null
          title?: string
          updated_at?: string | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "entity_flags_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entity_flags_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "entity_action_center_summary"
            referencedColumns: ["vehicle_id"]
          },
          {
            foreignKeyName: "entity_flags_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      entity_folders: {
        Row: {
          created_at: string | null
          description: string | null
          folder_name: string
          folder_type: Database["public"]["Enums"]["folder_type"]
          id: string
          is_default: boolean | null
          parent_folder_id: string | null
          updated_at: string | null
          vehicle_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          folder_name: string
          folder_type: Database["public"]["Enums"]["folder_type"]
          id?: string
          is_default?: boolean | null
          parent_folder_id?: string | null
          updated_at?: string | null
          vehicle_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          folder_name?: string
          folder_type?: Database["public"]["Enums"]["folder_type"]
          id?: string
          is_default?: boolean | null
          parent_folder_id?: string | null
          updated_at?: string | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "entity_folders_parent_folder_id_fkey"
            columns: ["parent_folder_id"]
            isOneToOne: false
            referencedRelation: "entity_folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entity_folders_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "entity_action_center_summary"
            referencedColumns: ["vehicle_id"]
          },
          {
            foreignKeyName: "entity_folders_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      entity_investors: {
        Row: {
          allocation_status: string | null
          created_at: string | null
          created_by: string | null
          id: string
          investor_id: string | null
          invite_sent_at: string | null
          notes: string | null
          relationship_role: string | null
          updated_at: string | null
          vehicle_id: string | null
        }
        Insert: {
          allocation_status?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          investor_id?: string | null
          invite_sent_at?: string | null
          notes?: string | null
          relationship_role?: string | null
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Update: {
          allocation_status?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          investor_id?: string | null
          invite_sent_at?: string | null
          notes?: string | null
          relationship_role?: string | null
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "entity_investors_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entity_investors_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "investors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entity_investors_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "entity_action_center_summary"
            referencedColumns: ["vehicle_id"]
          },
          {
            foreignKeyName: "entity_investors_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      entity_stakeholders: {
        Row: {
          company_name: string | null
          contact_person: string | null
          created_at: string | null
          effective_from: string | null
          effective_to: string | null
          email: string | null
          id: string
          notes: string | null
          phone: string | null
          role: Database["public"]["Enums"]["stakeholder_role"]
          updated_at: string | null
          vehicle_id: string
        }
        Insert: {
          company_name?: string | null
          contact_person?: string | null
          created_at?: string | null
          effective_from?: string | null
          effective_to?: string | null
          email?: string | null
          id?: string
          notes?: string | null
          phone?: string | null
          role: Database["public"]["Enums"]["stakeholder_role"]
          updated_at?: string | null
          vehicle_id: string
        }
        Update: {
          company_name?: string | null
          contact_person?: string | null
          created_at?: string | null
          effective_from?: string | null
          effective_to?: string | null
          email?: string | null
          id?: string
          notes?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["stakeholder_role"]
          updated_at?: string | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "entity_stakeholders_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "entity_action_center_summary"
            referencedColumns: ["vehicle_id"]
          },
          {
            foreignKeyName: "entity_stakeholders_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      esign_envelopes: {
        Row: {
          completed_at: string | null
          created_at: string | null
          envelope_id: string | null
          id: string
          recipient_email: string | null
          status: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          envelope_id?: string | null
          id?: string
          recipient_email?: string | null
          status?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          envelope_id?: string | null
          id?: string
          recipient_email?: string | null
          status?: string | null
        }
        Relationships: []
      }
      fee_components: {
        Row: {
          base_calculation: string | null
          calc_method:
            | Database["public"]["Enums"]["fee_calc_method_enum"]
            | null
          catchup_rate_bps: number | null
          created_at: string
          duration_periods: number | null
          duration_unit: string | null
          fee_plan_id: string | null
          flat_amount: number | null
          frequency: Database["public"]["Enums"]["fee_frequency_enum"] | null
          has_catchup: boolean
          has_high_water_mark: boolean
          hurdle_rate_bps: number | null
          id: string
          kind: Database["public"]["Enums"]["fee_component_kind_enum"]
          next_tier_component_id: string | null
          notes: string | null
          payment_schedule: string | null
          rate_bps: number | null
          tier_threshold_multiplier: number | null
          updated_at: string
        }
        Insert: {
          base_calculation?: string | null
          calc_method?:
            | Database["public"]["Enums"]["fee_calc_method_enum"]
            | null
          catchup_rate_bps?: number | null
          created_at?: string
          duration_periods?: number | null
          duration_unit?: string | null
          fee_plan_id?: string | null
          flat_amount?: number | null
          frequency?: Database["public"]["Enums"]["fee_frequency_enum"] | null
          has_catchup?: boolean
          has_high_water_mark?: boolean
          hurdle_rate_bps?: number | null
          id?: string
          kind: Database["public"]["Enums"]["fee_component_kind_enum"]
          next_tier_component_id?: string | null
          notes?: string | null
          payment_schedule?: string | null
          rate_bps?: number | null
          tier_threshold_multiplier?: number | null
          updated_at?: string
        }
        Update: {
          base_calculation?: string | null
          calc_method?:
            | Database["public"]["Enums"]["fee_calc_method_enum"]
            | null
          catchup_rate_bps?: number | null
          created_at?: string
          duration_periods?: number | null
          duration_unit?: string | null
          fee_plan_id?: string | null
          flat_amount?: number | null
          frequency?: Database["public"]["Enums"]["fee_frequency_enum"] | null
          has_catchup?: boolean
          has_high_water_mark?: boolean
          hurdle_rate_bps?: number | null
          id?: string
          kind?: Database["public"]["Enums"]["fee_component_kind_enum"]
          next_tier_component_id?: string | null
          notes?: string | null
          payment_schedule?: string | null
          rate_bps?: number | null
          tier_threshold_multiplier?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fee_components_fee_plan_id_fkey"
            columns: ["fee_plan_id"]
            isOneToOne: false
            referencedRelation: "fee_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_components_next_tier_component_id_fkey"
            columns: ["next_tier_component_id"]
            isOneToOne: false
            referencedRelation: "fee_components"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_events: {
        Row: {
          allocation_id: string | null
          allocation_type: string | null
          base_amount: number | null
          computed_amount: number
          created_at: string | null
          currency: string | null
          deal_id: string | null
          event_date: string
          fee_component_id: string | null
          fee_type:
            | Database["public"]["Enums"]["fee_component_kind_enum"]
            | null
          id: string
          investor_id: string | null
          invoice_id: string | null
          notes: string | null
          payment_id: string | null
          period_end_date: string | null
          period_start_date: string | null
          processed_at: string | null
          rate_bps: number | null
          source_ref: string | null
          status: Database["public"]["Enums"]["fee_event_status_enum"] | null
        }
        Insert: {
          allocation_id?: string | null
          allocation_type?: string | null
          base_amount?: number | null
          computed_amount: number
          created_at?: string | null
          currency?: string | null
          deal_id?: string | null
          event_date: string
          fee_component_id?: string | null
          fee_type?:
            | Database["public"]["Enums"]["fee_component_kind_enum"]
            | null
          id?: string
          investor_id?: string | null
          invoice_id?: string | null
          notes?: string | null
          payment_id?: string | null
          period_end_date?: string | null
          period_start_date?: string | null
          processed_at?: string | null
          rate_bps?: number | null
          source_ref?: string | null
          status?: Database["public"]["Enums"]["fee_event_status_enum"] | null
        }
        Update: {
          allocation_id?: string | null
          allocation_type?: string | null
          base_amount?: number | null
          computed_amount?: number
          created_at?: string | null
          currency?: string | null
          deal_id?: string | null
          event_date?: string
          fee_component_id?: string | null
          fee_type?:
            | Database["public"]["Enums"]["fee_component_kind_enum"]
            | null
          id?: string
          investor_id?: string | null
          invoice_id?: string | null
          notes?: string | null
          payment_id?: string | null
          period_end_date?: string | null
          period_start_date?: string | null
          processed_at?: string | null
          rate_bps?: number | null
          source_ref?: string | null
          status?: Database["public"]["Enums"]["fee_event_status_enum"] | null
        }
        Relationships: [
          {
            foreignKeyName: "fee_events_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_events_fee_component_id_fkey"
            columns: ["fee_component_id"]
            isOneToOne: false
            referencedRelation: "fee_components"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_events_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "investors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_events_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_events_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_plans: {
        Row: {
          created_at: string | null
          created_by: string | null
          deal_id: string | null
          description: string | null
          effective_from: string
          effective_until: string | null
          id: string
          is_active: boolean
          is_default: boolean | null
          name: string
          updated_at: string
          vehicle_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          deal_id?: string | null
          description?: string | null
          effective_from?: string
          effective_until?: string | null
          id?: string
          is_active?: boolean
          is_default?: boolean | null
          name: string
          updated_at?: string
          vehicle_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          deal_id?: string | null
          description?: string | null
          effective_from?: string
          effective_until?: string | null
          id?: string
          is_active?: boolean
          is_default?: boolean | null
          name?: string
          updated_at?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fee_plans_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_plans_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_plans_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "entity_action_center_summary"
            referencedColumns: ["vehicle_id"]
          },
          {
            foreignKeyName: "fee_plans_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_schedules: {
        Row: {
          allocation_id: string | null
          completed_periods: number | null
          created_at: string | null
          created_by: string | null
          deal_id: string | null
          end_date: string | null
          fee_component_id: string
          id: string
          investor_id: string
          next_due_date: string | null
          start_date: string
          status: string | null
          total_periods: number
          updated_at: string | null
        }
        Insert: {
          allocation_id?: string | null
          completed_periods?: number | null
          created_at?: string | null
          created_by?: string | null
          deal_id?: string | null
          end_date?: string | null
          fee_component_id: string
          id?: string
          investor_id: string
          next_due_date?: string | null
          start_date: string
          status?: string | null
          total_periods: number
          updated_at?: string | null
        }
        Update: {
          allocation_id?: string | null
          completed_periods?: number | null
          created_at?: string | null
          created_by?: string | null
          deal_id?: string | null
          end_date?: string | null
          fee_component_id?: string
          id?: string
          investor_id?: string
          next_due_date?: string | null
          start_date?: string
          status?: string | null
          total_periods?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fee_schedules_allocation_id_fkey"
            columns: ["allocation_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_schedules_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_schedules_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_schedules_fee_component_id_fkey"
            columns: ["fee_component_id"]
            isOneToOne: false
            referencedRelation: "fee_components"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_schedules_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "investors"
            referencedColumns: ["id"]
          },
        ]
      }
      import_batches: {
        Row: {
          bank_account_id: string
          created_at: string | null
          file_name: string
          id: string
          imported_by: string | null
          transaction_count: number
        }
        Insert: {
          bank_account_id: string
          created_at?: string | null
          file_name: string
          id?: string
          imported_by?: string | null
          transaction_count: number
        }
        Update: {
          bank_account_id?: string
          created_at?: string | null
          file_name?: string
          id?: string
          imported_by?: string | null
          transaction_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "import_batches_imported_by_fkey"
            columns: ["imported_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      introducer_agreements: {
        Row: {
          agreement_document_id: string | null
          agreement_type: string
          commission_cap_amount: number | null
          created_at: string
          created_by: string | null
          deal_types: string[] | null
          default_commission_bps: number
          effective_date: string | null
          exclusivity_level: string | null
          expiry_date: string | null
          id: string
          introducer_id: string
          payment_terms: string | null
          signed_date: string | null
          status: string
          territory: string | null
          updated_at: string
        }
        Insert: {
          agreement_document_id?: string | null
          agreement_type?: string
          commission_cap_amount?: number | null
          created_at?: string
          created_by?: string | null
          deal_types?: string[] | null
          default_commission_bps?: number
          effective_date?: string | null
          exclusivity_level?: string | null
          expiry_date?: string | null
          id?: string
          introducer_id: string
          payment_terms?: string | null
          signed_date?: string | null
          status?: string
          territory?: string | null
          updated_at?: string
        }
        Update: {
          agreement_document_id?: string | null
          agreement_type?: string
          commission_cap_amount?: number | null
          created_at?: string
          created_by?: string | null
          deal_types?: string[] | null
          default_commission_bps?: number
          effective_date?: string | null
          exclusivity_level?: string | null
          expiry_date?: string | null
          id?: string
          introducer_id?: string
          payment_terms?: string | null
          signed_date?: string | null
          status?: string
          territory?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "introducer_agreements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "introducer_agreements_doc_fk"
            columns: ["agreement_document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "introducer_agreements_introducer_fk"
            columns: ["introducer_id"]
            isOneToOne: false
            referencedRelation: "introducers"
            referencedColumns: ["id"]
          },
        ]
      }
      introducer_commissions: {
        Row: {
          accrual_amount: number
          approved_at: string | null
          approved_by: string | null
          base_amount: number | null
          basis_type: string | null
          created_at: string | null
          currency: string | null
          deal_id: string | null
          id: string
          introducer_id: string | null
          introduction_id: string | null
          investor_id: string | null
          invoice_id: string | null
          notes: string | null
          paid_at: string | null
          payment_due_date: string | null
          payment_reference: string | null
          rate_bps: number
          status: string | null
        }
        Insert: {
          accrual_amount: number
          approved_at?: string | null
          approved_by?: string | null
          base_amount?: number | null
          basis_type?: string | null
          created_at?: string | null
          currency?: string | null
          deal_id?: string | null
          id?: string
          introducer_id?: string | null
          introduction_id?: string | null
          investor_id?: string | null
          invoice_id?: string | null
          notes?: string | null
          paid_at?: string | null
          payment_due_date?: string | null
          payment_reference?: string | null
          rate_bps: number
          status?: string | null
        }
        Update: {
          accrual_amount?: number
          approved_at?: string | null
          approved_by?: string | null
          base_amount?: number | null
          basis_type?: string | null
          created_at?: string | null
          currency?: string | null
          deal_id?: string | null
          id?: string
          introducer_id?: string | null
          introduction_id?: string | null
          investor_id?: string | null
          invoice_id?: string | null
          notes?: string | null
          paid_at?: string | null
          payment_due_date?: string | null
          payment_reference?: string | null
          rate_bps?: number
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "introducer_commissions_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "introducer_commissions_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "introducer_commissions_introducer_id_fkey"
            columns: ["introducer_id"]
            isOneToOne: false
            referencedRelation: "introducers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "introducer_commissions_introduction_id_fkey"
            columns: ["introduction_id"]
            isOneToOne: false
            referencedRelation: "introductions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "introducer_commissions_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "investors"
            referencedColumns: ["id"]
          },
        ]
      }
      introducer_members: {
        Row: {
          created_at: string
          created_by: string | null
          effective_from: string | null
          effective_to: string | null
          email: string | null
          full_name: string
          id: string
          id_expiry_date: string | null
          id_number: string | null
          id_type: string | null
          introducer_id: string
          is_active: boolean
          is_beneficial_owner: boolean
          is_signatory: boolean
          nationality: string | null
          ownership_percentage: number | null
          phone: string | null
          residential_city: string | null
          residential_country: string | null
          residential_postal_code: string | null
          residential_state: string | null
          residential_street: string | null
          role: string
          role_title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          effective_from?: string | null
          effective_to?: string | null
          email?: string | null
          full_name: string
          id?: string
          id_expiry_date?: string | null
          id_number?: string | null
          id_type?: string | null
          introducer_id: string
          is_active?: boolean
          is_beneficial_owner?: boolean
          is_signatory?: boolean
          nationality?: string | null
          ownership_percentage?: number | null
          phone?: string | null
          residential_city?: string | null
          residential_country?: string | null
          residential_postal_code?: string | null
          residential_state?: string | null
          residential_street?: string | null
          role: string
          role_title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          effective_from?: string | null
          effective_to?: string | null
          email?: string | null
          full_name?: string
          id?: string
          id_expiry_date?: string | null
          id_number?: string | null
          id_type?: string | null
          introducer_id?: string
          is_active?: boolean
          is_beneficial_owner?: boolean
          is_signatory?: boolean
          nationality?: string | null
          ownership_percentage?: number | null
          phone?: string | null
          residential_city?: string | null
          residential_country?: string | null
          residential_postal_code?: string | null
          residential_state?: string | null
          residential_street?: string | null
          role?: string
          role_title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "introducer_members_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "introducer_members_introducer_fk"
            columns: ["introducer_id"]
            isOneToOne: false
            referencedRelation: "introducers"
            referencedColumns: ["id"]
          },
        ]
      }
      introducer_users: {
        Row: {
          can_sign: boolean
          created_at: string
          created_by: string | null
          introducer_id: string
          is_primary: boolean
          role: string
          user_id: string
        }
        Insert: {
          can_sign?: boolean
          created_at?: string
          created_by?: string | null
          introducer_id: string
          is_primary?: boolean
          role?: string
          user_id: string
        }
        Update: {
          can_sign?: boolean
          created_at?: string
          created_by?: string | null
          introducer_id?: string
          is_primary?: boolean
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "introducer_users_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "introducer_users_introducer_fk"
            columns: ["introducer_id"]
            isOneToOne: false
            referencedRelation: "introducers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "introducer_users_user_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      introducers: {
        Row: {
          agreement_doc_id: string | null
          agreement_expiry_date: string | null
          commission_cap_amount: number | null
          contact_name: string | null
          created_at: string | null
          created_by: string | null
          default_commission_bps: number | null
          email: string | null
          id: string
          legal_name: string | null
          logo_url: string | null
          notes: string | null
          payment_terms: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          agreement_doc_id?: string | null
          agreement_expiry_date?: string | null
          commission_cap_amount?: number | null
          contact_name?: string | null
          created_at?: string | null
          created_by?: string | null
          default_commission_bps?: number | null
          email?: string | null
          id?: string
          legal_name?: string | null
          logo_url?: string | null
          notes?: string | null
          payment_terms?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          agreement_doc_id?: string | null
          agreement_expiry_date?: string | null
          commission_cap_amount?: number | null
          contact_name?: string | null
          created_at?: string | null
          created_by?: string | null
          default_commission_bps?: number | null
          email?: string | null
          id?: string
          legal_name?: string | null
          logo_url?: string | null
          notes?: string | null
          payment_terms?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "introducers_agreement_doc_id_fkey"
            columns: ["agreement_doc_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "introducers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "introducers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      introductions: {
        Row: {
          commission_rate_override_bps: number | null
          created_at: string | null
          created_by: string | null
          deal_id: string | null
          id: string
          introduced_at: string | null
          introducer_id: string | null
          notes: string | null
          prospect_email: string | null
          prospect_investor_id: string | null
          status: string | null
        }
        Insert: {
          commission_rate_override_bps?: number | null
          created_at?: string | null
          created_by?: string | null
          deal_id?: string | null
          id?: string
          introduced_at?: string | null
          introducer_id?: string | null
          notes?: string | null
          prospect_email?: string | null
          prospect_investor_id?: string | null
          status?: string | null
        }
        Update: {
          commission_rate_override_bps?: number | null
          created_at?: string | null
          created_by?: string | null
          deal_id?: string | null
          id?: string
          introduced_at?: string | null
          introducer_id?: string | null
          notes?: string | null
          prospect_email?: string | null
          prospect_investor_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "introductions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "introductions_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "introductions_introducer_id_fkey"
            columns: ["introducer_id"]
            isOneToOne: false
            referencedRelation: "introducers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "introductions_prospect_investor_id_fkey"
            columns: ["prospect_investor_id"]
            isOneToOne: false
            referencedRelation: "investors"
            referencedColumns: ["id"]
          },
        ]
      }
      investor_counterparty: {
        Row: {
          created_at: string | null
          created_by: string | null
          entity_type: string
          formation_date: string | null
          id: string
          investor_id: string
          is_active: boolean | null
          jurisdiction: string | null
          kyc_completed_at: string | null
          kyc_expiry_date: string | null
          kyc_notes: string | null
          kyc_status: string | null
          legal_name: string
          notes: string | null
          registered_address: Json | null
          registration_number: string | null
          representative_email: string | null
          representative_name: string | null
          representative_phone: string | null
          representative_title: string | null
          tax_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          entity_type: string
          formation_date?: string | null
          id?: string
          investor_id: string
          is_active?: boolean | null
          jurisdiction?: string | null
          kyc_completed_at?: string | null
          kyc_expiry_date?: string | null
          kyc_notes?: string | null
          kyc_status?: string | null
          legal_name: string
          notes?: string | null
          registered_address?: Json | null
          registration_number?: string | null
          representative_email?: string | null
          representative_name?: string | null
          representative_phone?: string | null
          representative_title?: string | null
          tax_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          entity_type?: string
          formation_date?: string | null
          id?: string
          investor_id?: string
          is_active?: boolean | null
          jurisdiction?: string | null
          kyc_completed_at?: string | null
          kyc_expiry_date?: string | null
          kyc_notes?: string | null
          kyc_status?: string | null
          legal_name?: string
          notes?: string | null
          registered_address?: Json | null
          registration_number?: string | null
          representative_email?: string | null
          representative_name?: string | null
          representative_phone?: string | null
          representative_title?: string | null
          tax_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "investor_counterparty_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investor_counterparty_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "investors"
            referencedColumns: ["id"]
          },
        ]
      }
      investor_deal_holdings: {
        Row: {
          approval_id: string | null
          created_at: string
          currency: string
          deal_id: string
          effective_date: string | null
          funded_at: string | null
          funding_due_at: string | null
          id: string
          investor_id: string
          status: string
          subscribed_amount: number
          subscription_submission_id: string | null
          updated_at: string
        }
        Insert: {
          approval_id?: string | null
          created_at?: string
          currency?: string
          deal_id: string
          effective_date?: string | null
          funded_at?: string | null
          funding_due_at?: string | null
          id?: string
          investor_id: string
          status?: string
          subscribed_amount: number
          subscription_submission_id?: string | null
          updated_at?: string
        }
        Update: {
          approval_id?: string | null
          created_at?: string
          currency?: string
          deal_id?: string
          effective_date?: string | null
          funded_at?: string | null
          funding_due_at?: string | null
          id?: string
          investor_id?: string
          status?: string
          subscribed_amount?: number
          subscription_submission_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "investor_deal_holdings_approval_id_fkey"
            columns: ["approval_id"]
            isOneToOne: false
            referencedRelation: "approvals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investor_deal_holdings_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investor_deal_holdings_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "investors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investor_deal_holdings_subscription_submission_id_fkey"
            columns: ["subscription_submission_id"]
            isOneToOne: false
            referencedRelation: "deal_subscription_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      investor_deal_interest: {
        Row: {
          approval_id: string | null
          approved_at: string | null
          created_by: string | null
          deal_id: string
          id: string
          indicative_amount: number | null
          indicative_currency: string | null
          investor_id: string
          is_post_close: boolean
          notes: string | null
          status: string
          submitted_at: string
          updated_at: string
        }
        Insert: {
          approval_id?: string | null
          approved_at?: string | null
          created_by?: string | null
          deal_id: string
          id?: string
          indicative_amount?: number | null
          indicative_currency?: string | null
          investor_id: string
          is_post_close?: boolean
          notes?: string | null
          status?: string
          submitted_at?: string
          updated_at?: string
        }
        Update: {
          approval_id?: string | null
          approved_at?: string | null
          created_by?: string | null
          deal_id?: string
          id?: string
          indicative_amount?: number | null
          indicative_currency?: string | null
          investor_id?: string
          is_post_close?: boolean
          notes?: string | null
          status?: string
          submitted_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "investor_deal_interest_approval_id_fkey"
            columns: ["approval_id"]
            isOneToOne: false
            referencedRelation: "approvals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investor_deal_interest_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investor_deal_interest_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investor_deal_interest_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "investors"
            referencedColumns: ["id"]
          },
        ]
      }
      investor_interest_signals: {
        Row: {
          created_at: string
          created_by: string | null
          deal_id: string
          id: string
          investor_id: string
          metadata: Json | null
          signal_type: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deal_id: string
          id?: string
          investor_id: string
          metadata?: Json | null
          signal_type: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deal_id?: string
          id?: string
          investor_id?: string
          metadata?: Json | null
          signal_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "investor_interest_signals_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investor_interest_signals_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investor_interest_signals_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "investors"
            referencedColumns: ["id"]
          },
        ]
      }
      investor_members: {
        Row: {
          can_sign: boolean | null
          created_at: string | null
          created_by: string | null
          effective_from: string | null
          effective_to: string | null
          email: string | null
          full_name: string
          id: string
          id_expiry_date: string | null
          id_number: string | null
          id_type: string | null
          investor_id: string
          is_active: boolean | null
          is_beneficial_owner: boolean | null
          is_signatory: boolean | null
          kyc_approved_at: string | null
          kyc_approved_by: string | null
          kyc_expiry_date: string | null
          kyc_status: string | null
          nationality: string | null
          ownership_percentage: number | null
          phone: string | null
          residential_city: string | null
          residential_country: string | null
          residential_postal_code: string | null
          residential_state: string | null
          residential_street: string | null
          role: string
          role_title: string | null
          signature_specimen_uploaded_at: string | null
          signature_specimen_url: string | null
          updated_at: string | null
        }
        Insert: {
          can_sign?: boolean | null
          created_at?: string | null
          created_by?: string | null
          effective_from?: string | null
          effective_to?: string | null
          email?: string | null
          full_name: string
          id?: string
          id_expiry_date?: string | null
          id_number?: string | null
          id_type?: string | null
          investor_id: string
          is_active?: boolean | null
          is_beneficial_owner?: boolean | null
          is_signatory?: boolean | null
          kyc_approved_at?: string | null
          kyc_approved_by?: string | null
          kyc_expiry_date?: string | null
          kyc_status?: string | null
          nationality?: string | null
          ownership_percentage?: number | null
          phone?: string | null
          residential_city?: string | null
          residential_country?: string | null
          residential_postal_code?: string | null
          residential_state?: string | null
          residential_street?: string | null
          role: string
          role_title?: string | null
          signature_specimen_uploaded_at?: string | null
          signature_specimen_url?: string | null
          updated_at?: string | null
        }
        Update: {
          can_sign?: boolean | null
          created_at?: string | null
          created_by?: string | null
          effective_from?: string | null
          effective_to?: string | null
          email?: string | null
          full_name?: string
          id?: string
          id_expiry_date?: string | null
          id_number?: string | null
          id_type?: string | null
          investor_id?: string
          is_active?: boolean | null
          is_beneficial_owner?: boolean | null
          is_signatory?: boolean | null
          kyc_approved_at?: string | null
          kyc_approved_by?: string | null
          kyc_expiry_date?: string | null
          kyc_status?: string | null
          nationality?: string | null
          ownership_percentage?: number | null
          phone?: string | null
          residential_city?: string | null
          residential_country?: string | null
          residential_postal_code?: string | null
          residential_state?: string | null
          residential_street?: string | null
          role?: string
          role_title?: string | null
          signature_specimen_uploaded_at?: string | null
          signature_specimen_url?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "investor_members_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investor_members_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "investors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investor_members_kyc_approved_by_fkey"
            columns: ["kyc_approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      investor_notifications: {
        Row: {
          created_at: string
          id: string
          investor_id: string | null
          link: string | null
          message: string
          read_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          investor_id?: string | null
          link?: string | null
          message: string
          read_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          investor_id?: string | null
          link?: string | null
          message?: string
          read_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "investor_notifications_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "investors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investor_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      investor_terms: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          base_fee_plan_id: string | null
          created_at: string | null
          created_by: string | null
          deal_id: string | null
          effective_from: string
          effective_until: string | null
          id: string
          investor_id: string | null
          justification: string | null
          overrides: Json | null
          selected_fee_plan_id: string | null
          status: string | null
          updated_at: string
          vehicle_id: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          base_fee_plan_id?: string | null
          created_at?: string | null
          created_by?: string | null
          deal_id?: string | null
          effective_from?: string
          effective_until?: string | null
          id?: string
          investor_id?: string | null
          justification?: string | null
          overrides?: Json | null
          selected_fee_plan_id?: string | null
          status?: string | null
          updated_at?: string
          vehicle_id?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          base_fee_plan_id?: string | null
          created_at?: string | null
          created_by?: string | null
          deal_id?: string | null
          effective_from?: string
          effective_until?: string | null
          id?: string
          investor_id?: string | null
          justification?: string | null
          overrides?: Json | null
          selected_fee_plan_id?: string | null
          status?: string | null
          updated_at?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "investor_terms_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investor_terms_base_fee_plan_id_fkey"
            columns: ["base_fee_plan_id"]
            isOneToOne: false
            referencedRelation: "fee_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investor_terms_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investor_terms_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investor_terms_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "investors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investor_terms_selected_fee_plan_id_fkey"
            columns: ["selected_fee_plan_id"]
            isOneToOne: false
            referencedRelation: "fee_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investor_terms_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "entity_action_center_summary"
            referencedColumns: ["vehicle_id"]
          },
          {
            foreignKeyName: "investor_terms_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      investor_users: {
        Row: {
          can_sign: boolean
          created_at: string
          created_by: string | null
          investor_id: string
          is_primary: boolean
          role: string
          user_id: string
        }
        Insert: {
          can_sign?: boolean
          created_at?: string
          created_by?: string | null
          investor_id: string
          is_primary?: boolean
          role?: string
          user_id: string
        }
        Update: {
          can_sign?: boolean
          created_at?: string
          created_by?: string | null
          investor_id?: string
          is_primary?: boolean
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "investor_users_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investor_users_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "investors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investor_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      investors: {
        Row: {
          accreditation_expiry: string | null
          aml_last_reviewed_at: string | null
          aml_risk_rating: string | null
          archived_at: string | null
          city: string | null
          commercial_partner_id: string | null
          country: string | null
          country_of_incorporation: string | null
          created_at: string | null
          created_by: string | null
          display_name: string | null
          email: string | null
          entity_identifier: string | null
          id: string
          is_pep: boolean | null
          is_professional_investor: boolean | null
          is_qualified_purchaser: boolean | null
          is_sanctioned: boolean | null
          kyc_approved_by: string | null
          kyc_completed_at: string | null
          kyc_expiry_date: string | null
          kyc_status: string | null
          legal_name: string
          logo_url: string | null
          onboarding_status: string | null
          phone: string | null
          phone_mobile: string | null
          phone_office: string | null
          primary_rm: string | null
          registered_address: string | null
          representative_name: string | null
          representative_title: string | null
          residential_city: string | null
          residential_country: string | null
          residential_postal_code: string | null
          residential_state: string | null
          residential_street: string | null
          secondary_rm: string | null
          status: string | null
          tax_residency: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          accreditation_expiry?: string | null
          aml_last_reviewed_at?: string | null
          aml_risk_rating?: string | null
          archived_at?: string | null
          city?: string | null
          commercial_partner_id?: string | null
          country?: string | null
          country_of_incorporation?: string | null
          created_at?: string | null
          created_by?: string | null
          display_name?: string | null
          email?: string | null
          entity_identifier?: string | null
          id?: string
          is_pep?: boolean | null
          is_professional_investor?: boolean | null
          is_qualified_purchaser?: boolean | null
          is_sanctioned?: boolean | null
          kyc_approved_by?: string | null
          kyc_completed_at?: string | null
          kyc_expiry_date?: string | null
          kyc_status?: string | null
          legal_name: string
          logo_url?: string | null
          onboarding_status?: string | null
          phone?: string | null
          phone_mobile?: string | null
          phone_office?: string | null
          primary_rm?: string | null
          registered_address?: string | null
          representative_name?: string | null
          representative_title?: string | null
          residential_city?: string | null
          residential_country?: string | null
          residential_postal_code?: string | null
          residential_state?: string | null
          residential_street?: string | null
          secondary_rm?: string | null
          status?: string | null
          tax_residency?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          accreditation_expiry?: string | null
          aml_last_reviewed_at?: string | null
          aml_risk_rating?: string | null
          archived_at?: string | null
          city?: string | null
          commercial_partner_id?: string | null
          country?: string | null
          country_of_incorporation?: string | null
          created_at?: string | null
          created_by?: string | null
          display_name?: string | null
          email?: string | null
          entity_identifier?: string | null
          id?: string
          is_pep?: boolean | null
          is_professional_investor?: boolean | null
          is_qualified_purchaser?: boolean | null
          is_sanctioned?: boolean | null
          kyc_approved_by?: string | null
          kyc_completed_at?: string | null
          kyc_expiry_date?: string | null
          kyc_status?: string | null
          legal_name?: string
          logo_url?: string | null
          onboarding_status?: string | null
          phone?: string | null
          phone_mobile?: string | null
          phone_office?: string | null
          primary_rm?: string | null
          registered_address?: string | null
          representative_name?: string | null
          representative_title?: string | null
          residential_city?: string | null
          residential_country?: string | null
          residential_postal_code?: string | null
          residential_state?: string | null
          residential_street?: string | null
          secondary_rm?: string | null
          status?: string | null
          tax_residency?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "investors_commercial_partner_id_fkey"
            columns: ["commercial_partner_id"]
            isOneToOne: false
            referencedRelation: "commercial_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investors_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investors_kyc_approved_by_fkey"
            columns: ["kyc_approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investors_primary_rm_fkey"
            columns: ["primary_rm"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investors_secondary_rm_fkey"
            columns: ["secondary_rm"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      invite_links: {
        Row: {
          created_at: string | null
          created_by: string | null
          deal_id: string | null
          expires_at: string | null
          id: string
          max_uses: number | null
          role: Database["public"]["Enums"]["deal_member_role"]
          token_hash: string
          used_count: number | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          deal_id?: string | null
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          role: Database["public"]["Enums"]["deal_member_role"]
          token_hash: string
          used_count?: number | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          deal_id?: string | null
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          role?: Database["public"]["Enums"]["deal_member_role"]
          token_hash?: string
          used_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "invite_links_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invite_links_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_lines: {
        Row: {
          amount: number
          description: string | null
          fee_event_id: string | null
          id: string
          invoice_id: string | null
          kind: string | null
          quantity: number | null
          unit_price: number | null
        }
        Insert: {
          amount: number
          description?: string | null
          fee_event_id?: string | null
          id?: string
          invoice_id?: string | null
          kind?: string | null
          quantity?: number | null
          unit_price?: number | null
        }
        Update: {
          amount?: number
          description?: string | null
          fee_event_id?: string | null
          id?: string
          invoice_id?: string | null
          kind?: string | null
          quantity?: number | null
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_lines_fee_event_id_fkey"
            columns: ["fee_event_id"]
            isOneToOne: true
            referencedRelation: "fee_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_lines_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          auto_send_enabled: boolean | null
          balance_due: number | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          deal_id: string | null
          doc_id: string | null
          due_date: string | null
          generated_from: string | null
          id: string
          investor_id: string | null
          invoice_number: string | null
          match_status: string | null
          paid_amount: number
          paid_at: string | null
          reminder_days_before: number | null
          reminder_task_id: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["invoice_status_enum"] | null
          subtotal: number | null
          tax: number | null
          total: number | null
        }
        Insert: {
          auto_send_enabled?: boolean | null
          balance_due?: number | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          deal_id?: string | null
          doc_id?: string | null
          due_date?: string | null
          generated_from?: string | null
          id?: string
          investor_id?: string | null
          invoice_number?: string | null
          match_status?: string | null
          paid_amount?: number
          paid_at?: string | null
          reminder_days_before?: number | null
          reminder_task_id?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["invoice_status_enum"] | null
          subtotal?: number | null
          tax?: number | null
          total?: number | null
        }
        Update: {
          auto_send_enabled?: boolean | null
          balance_due?: number | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          deal_id?: string | null
          doc_id?: string | null
          due_date?: string | null
          generated_from?: string | null
          id?: string
          investor_id?: string | null
          invoice_number?: string | null
          match_status?: string | null
          paid_amount?: number
          paid_at?: string | null
          reminder_days_before?: number | null
          reminder_task_id?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["invoice_status_enum"] | null
          subtotal?: number | null
          tax?: number | null
          total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_doc_id_fkey"
            columns: ["doc_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "investors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_reminder_task_id_fkey"
            columns: ["reminder_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      kyc_submissions: {
        Row: {
          counterparty_entity_id: string | null
          counterparty_member_id: string | null
          created_at: string
          custom_label: string | null
          document_id: string | null
          document_type: string
          expiry_date: string | null
          id: string
          investor_id: string
          investor_member_id: string | null
          metadata: Json | null
          previous_submission_id: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          submitted_at: string
          updated_at: string
          version: number
        }
        Insert: {
          counterparty_entity_id?: string | null
          counterparty_member_id?: string | null
          created_at?: string
          custom_label?: string | null
          document_id?: string | null
          document_type: string
          expiry_date?: string | null
          id?: string
          investor_id: string
          investor_member_id?: string | null
          metadata?: Json | null
          previous_submission_id?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_at?: string
          updated_at?: string
          version?: number
        }
        Update: {
          counterparty_entity_id?: string | null
          counterparty_member_id?: string | null
          created_at?: string
          custom_label?: string | null
          document_id?: string | null
          document_type?: string
          expiry_date?: string | null
          id?: string
          investor_id?: string
          investor_member_id?: string | null
          metadata?: Json | null
          previous_submission_id?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_at?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_kyc_submissions_previous"
            columns: ["previous_submission_id"]
            isOneToOne: false
            referencedRelation: "kyc_submissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kyc_submissions_counterparty_entity_id_fkey"
            columns: ["counterparty_entity_id"]
            isOneToOne: false
            referencedRelation: "investor_counterparty"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kyc_submissions_counterparty_member_id_fkey"
            columns: ["counterparty_member_id"]
            isOneToOne: false
            referencedRelation: "counterparty_entity_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kyc_submissions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kyc_submissions_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "investors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kyc_submissions_investor_member_id_fkey"
            columns: ["investor_member_id"]
            isOneToOne: false
            referencedRelation: "investor_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kyc_submissions_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lawyer_members: {
        Row: {
          bar_jurisdiction: string | null
          bar_number: string | null
          created_at: string
          created_by: string | null
          effective_from: string | null
          effective_to: string | null
          email: string | null
          full_name: string
          id: string
          id_expiry_date: string | null
          id_number: string | null
          id_type: string | null
          is_active: boolean
          is_signatory: boolean
          lawyer_id: string
          nationality: string | null
          phone: string | null
          residential_city: string | null
          residential_country: string | null
          residential_postal_code: string | null
          residential_state: string | null
          residential_street: string | null
          role: string
          role_title: string | null
          updated_at: string
        }
        Insert: {
          bar_jurisdiction?: string | null
          bar_number?: string | null
          created_at?: string
          created_by?: string | null
          effective_from?: string | null
          effective_to?: string | null
          email?: string | null
          full_name: string
          id?: string
          id_expiry_date?: string | null
          id_number?: string | null
          id_type?: string | null
          is_active?: boolean
          is_signatory?: boolean
          lawyer_id: string
          nationality?: string | null
          phone?: string | null
          residential_city?: string | null
          residential_country?: string | null
          residential_postal_code?: string | null
          residential_state?: string | null
          residential_street?: string | null
          role: string
          role_title?: string | null
          updated_at?: string
        }
        Update: {
          bar_jurisdiction?: string | null
          bar_number?: string | null
          created_at?: string
          created_by?: string | null
          effective_from?: string | null
          effective_to?: string | null
          email?: string | null
          full_name?: string
          id?: string
          id_expiry_date?: string | null
          id_number?: string | null
          id_type?: string | null
          is_active?: boolean
          is_signatory?: boolean
          lawyer_id?: string
          nationality?: string | null
          phone?: string | null
          residential_city?: string | null
          residential_country?: string | null
          residential_postal_code?: string | null
          residential_state?: string | null
          residential_street?: string | null
          role?: string
          role_title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lawyer_members_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lawyer_members_lawyer_fk"
            columns: ["lawyer_id"]
            isOneToOne: false
            referencedRelation: "lawyers"
            referencedColumns: ["id"]
          },
        ]
      }
      lawyer_users: {
        Row: {
          can_sign: boolean
          created_at: string
          created_by: string | null
          is_primary: boolean
          lawyer_id: string
          role: string
          user_id: string
        }
        Insert: {
          can_sign?: boolean
          created_at?: string
          created_by?: string | null
          is_primary?: boolean
          lawyer_id: string
          role?: string
          user_id: string
        }
        Update: {
          can_sign?: boolean
          created_at?: string
          created_by?: string | null
          is_primary?: boolean
          lawyer_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lawyer_users_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lawyer_users_lawyer_fk"
            columns: ["lawyer_id"]
            isOneToOne: false
            referencedRelation: "lawyers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lawyer_users_user_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lawyers: {
        Row: {
          assigned_deals: string[] | null
          city: string | null
          country: string | null
          created_at: string
          created_by: string | null
          display_name: string
          firm_name: string
          id: string
          is_active: boolean
          kyc_approved_at: string | null
          kyc_approved_by: string | null
          kyc_expires_at: string | null
          kyc_notes: string | null
          kyc_status: string | null
          legal_entity_type: string | null
          logo_url: string | null
          onboarded_at: string | null
          postal_code: string | null
          primary_contact_email: string | null
          primary_contact_name: string | null
          primary_contact_phone: string | null
          registration_number: string | null
          specializations: string[] | null
          state_province: string | null
          street_address: string | null
          tax_id: string | null
          updated_at: string
        }
        Insert: {
          assigned_deals?: string[] | null
          city?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          display_name: string
          firm_name: string
          id?: string
          is_active?: boolean
          kyc_approved_at?: string | null
          kyc_approved_by?: string | null
          kyc_expires_at?: string | null
          kyc_notes?: string | null
          kyc_status?: string | null
          legal_entity_type?: string | null
          logo_url?: string | null
          onboarded_at?: string | null
          postal_code?: string | null
          primary_contact_email?: string | null
          primary_contact_name?: string | null
          primary_contact_phone?: string | null
          registration_number?: string | null
          specializations?: string[] | null
          state_province?: string | null
          street_address?: string | null
          tax_id?: string | null
          updated_at?: string
        }
        Update: {
          assigned_deals?: string[] | null
          city?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          display_name?: string
          firm_name?: string
          id?: string
          is_active?: boolean
          kyc_approved_at?: string | null
          kyc_approved_by?: string | null
          kyc_expires_at?: string | null
          kyc_notes?: string | null
          kyc_status?: string | null
          legal_entity_type?: string | null
          logo_url?: string | null
          onboarded_at?: string | null
          postal_code?: string | null
          primary_contact_email?: string | null
          primary_contact_name?: string | null
          primary_contact_phone?: string | null
          registration_number?: string | null
          specializations?: string[] | null
          state_province?: string | null
          street_address?: string | null
          tax_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lawyers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lawyers_kyc_approved_by_fkey"
            columns: ["kyc_approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      message_reads: {
        Row: {
          message_id: string
          read_at: string
          user_id: string
        }
        Insert: {
          message_id: string
          read_at?: string
          user_id: string
        }
        Update: {
          message_id?: string
          read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_reads_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_reads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string | null
          conversation_id: string
          created_at: string
          deleted_at: string | null
          edited_at: string | null
          file_key: string | null
          id: string
          message_type: Database["public"]["Enums"]["message_type_enum"]
          metadata: Json
          reply_to_message_id: string | null
          sender_id: string | null
        }
        Insert: {
          body?: string | null
          conversation_id: string
          created_at?: string
          deleted_at?: string | null
          edited_at?: string | null
          file_key?: string | null
          id?: string
          message_type?: Database["public"]["Enums"]["message_type_enum"]
          metadata?: Json
          reply_to_message_id?: string | null
          sender_id?: string | null
        }
        Update: {
          body?: string | null
          conversation_id?: string
          created_at?: string
          deleted_at?: string | null
          edited_at?: string | null
          file_key?: string | null
          id?: string
          message_type?: Database["public"]["Enums"]["message_type_enum"]
          metadata?: Json
          reply_to_message_id?: string | null
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_reply_to_message_id_fkey"
            columns: ["reply_to_message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_members: {
        Row: {
          created_at: string
          created_by: string | null
          effective_from: string | null
          effective_to: string | null
          email: string | null
          full_name: string
          id: string
          id_expiry_date: string | null
          id_number: string | null
          id_type: string | null
          is_active: boolean
          is_beneficial_owner: boolean
          is_signatory: boolean
          nationality: string | null
          ownership_percentage: number | null
          partner_id: string
          phone: string | null
          residential_city: string | null
          residential_country: string | null
          residential_postal_code: string | null
          residential_state: string | null
          residential_street: string | null
          role: string
          role_title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          effective_from?: string | null
          effective_to?: string | null
          email?: string | null
          full_name: string
          id?: string
          id_expiry_date?: string | null
          id_number?: string | null
          id_type?: string | null
          is_active?: boolean
          is_beneficial_owner?: boolean
          is_signatory?: boolean
          nationality?: string | null
          ownership_percentage?: number | null
          partner_id: string
          phone?: string | null
          residential_city?: string | null
          residential_country?: string | null
          residential_postal_code?: string | null
          residential_state?: string | null
          residential_street?: string | null
          role: string
          role_title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          effective_from?: string | null
          effective_to?: string | null
          email?: string | null
          full_name?: string
          id?: string
          id_expiry_date?: string | null
          id_number?: string | null
          id_type?: string | null
          is_active?: boolean
          is_beneficial_owner?: boolean
          is_signatory?: boolean
          nationality?: string | null
          ownership_percentage?: number | null
          partner_id?: string
          phone?: string | null
          residential_city?: string | null
          residential_country?: string | null
          residential_postal_code?: string | null
          residential_state?: string | null
          residential_street?: string | null
          role?: string
          role_title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_members_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_members_partner_fk"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_users: {
        Row: {
          can_sign: boolean
          created_at: string
          created_by: string | null
          is_primary: boolean
          partner_id: string
          role: string
          user_id: string
        }
        Insert: {
          can_sign?: boolean
          created_at?: string
          created_by?: string | null
          is_primary?: boolean
          partner_id: string
          role?: string
          user_id: string
        }
        Update: {
          can_sign?: boolean
          created_at?: string
          created_by?: string | null
          is_primary?: boolean
          partner_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_users_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_users_partner_fk"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_users_user_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      partners: {
        Row: {
          accreditation_status: string | null
          address_line_1: string | null
          address_line_2: string | null
          city: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          country: string | null
          created_at: string
          created_by: string | null
          id: string
          kyc_approved_at: string | null
          kyc_approved_by: string | null
          kyc_expires_at: string | null
          kyc_notes: string | null
          kyc_status: string | null
          legal_name: string | null
          logo_url: string | null
          name: string
          notes: string | null
          partner_type: string
          postal_code: string | null
          preferred_geographies: string[] | null
          preferred_sectors: string[] | null
          relationship_manager_id: string | null
          status: string
          type: string
          typical_investment_max: number | null
          typical_investment_min: number | null
          updated_at: string
          website: string | null
        }
        Insert: {
          accreditation_status?: string | null
          address_line_1?: string | null
          address_line_2?: string | null
          city?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          kyc_approved_at?: string | null
          kyc_approved_by?: string | null
          kyc_expires_at?: string | null
          kyc_notes?: string | null
          kyc_status?: string | null
          legal_name?: string | null
          logo_url?: string | null
          name: string
          notes?: string | null
          partner_type: string
          postal_code?: string | null
          preferred_geographies?: string[] | null
          preferred_sectors?: string[] | null
          relationship_manager_id?: string | null
          status?: string
          type: string
          typical_investment_max?: number | null
          typical_investment_min?: number | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          accreditation_status?: string | null
          address_line_1?: string | null
          address_line_2?: string | null
          city?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          kyc_approved_at?: string | null
          kyc_approved_by?: string | null
          kyc_expires_at?: string | null
          kyc_notes?: string | null
          kyc_status?: string | null
          legal_name?: string | null
          logo_url?: string | null
          name?: string
          notes?: string | null
          partner_type?: string
          postal_code?: string | null
          preferred_geographies?: string[] | null
          preferred_sectors?: string[] | null
          relationship_manager_id?: string | null
          status?: string
          type?: string
          typical_investment_max?: number | null
          typical_investment_min?: number | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partners_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partners_kyc_approved_by_fkey"
            columns: ["kyc_approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partners_relationship_manager_id_fkey"
            columns: ["relationship_manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number | null
          bank_txn_id: string | null
          created_at: string | null
          currency: string | null
          id: string
          investor_id: string | null
          invoice_id: string | null
          method: string | null
          paid_at: string | null
          status: Database["public"]["Enums"]["payment_status_enum"] | null
        }
        Insert: {
          amount?: number | null
          bank_txn_id?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          investor_id?: string | null
          invoice_id?: string | null
          method?: string | null
          paid_at?: string | null
          status?: Database["public"]["Enums"]["payment_status_enum"] | null
        }
        Update: {
          amount?: number | null
          bank_txn_id?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          investor_id?: string | null
          invoice_id?: string | null
          method?: string | null
          paid_at?: string | null
          status?: Database["public"]["Enums"]["payment_status_enum"] | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "investors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_snapshots: {
        Row: {
          contributed: number | null
          created_at: string | null
          distributed: number | null
          dpi: number | null
          id: string
          investor_id: string | null
          irr_gross: number | null
          irr_net: number | null
          nav_value: number | null
          snapshot_date: string
          tvpi: number | null
          vehicle_id: string | null
        }
        Insert: {
          contributed?: number | null
          created_at?: string | null
          distributed?: number | null
          dpi?: number | null
          id?: string
          investor_id?: string | null
          irr_gross?: number | null
          irr_net?: number | null
          nav_value?: number | null
          snapshot_date: string
          tvpi?: number | null
          vehicle_id?: string | null
        }
        Update: {
          contributed?: number | null
          created_at?: string | null
          distributed?: number | null
          dpi?: number | null
          id?: string
          investor_id?: string | null
          irr_gross?: number | null
          irr_net?: number | null
          nav_value?: number | null
          snapshot_date?: string
          tvpi?: number | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "performance_snapshots_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "investors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_snapshots_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "entity_action_center_summary"
            referencedColumns: ["vehicle_id"]
          },
          {
            foreignKeyName: "performance_snapshots_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      placement_agreements: {
        Row: {
          agreement_document_id: string | null
          agreement_type: string
          commercial_partner_id: string
          commission_cap_amount: number | null
          created_at: string
          created_by: string | null
          deal_types: string[] | null
          default_commission_bps: number
          effective_date: string | null
          exclusivity_level: string | null
          expiry_date: string | null
          id: string
          payment_terms: string | null
          signed_date: string | null
          status: string
          territory: string | null
          updated_at: string
        }
        Insert: {
          agreement_document_id?: string | null
          agreement_type?: string
          commercial_partner_id: string
          commission_cap_amount?: number | null
          created_at?: string
          created_by?: string | null
          deal_types?: string[] | null
          default_commission_bps?: number
          effective_date?: string | null
          exclusivity_level?: string | null
          expiry_date?: string | null
          id?: string
          payment_terms?: string | null
          signed_date?: string | null
          status?: string
          territory?: string | null
          updated_at?: string
        }
        Update: {
          agreement_document_id?: string | null
          agreement_type?: string
          commercial_partner_id?: string
          commission_cap_amount?: number | null
          created_at?: string
          created_by?: string | null
          deal_types?: string[] | null
          default_commission_bps?: number
          effective_date?: string | null
          exclusivity_level?: string | null
          expiry_date?: string | null
          id?: string
          payment_terms?: string | null
          signed_date?: string | null
          status?: string
          territory?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "placement_agreements_cp_fk"
            columns: ["commercial_partner_id"]
            isOneToOne: false
            referencedRelation: "commercial_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "placement_agreements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "placement_agreements_doc_fk"
            columns: ["agreement_document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      positions: {
        Row: {
          as_of_date: string | null
          cost_basis: number | null
          id: string
          investor_id: string | null
          last_nav: number | null
          units: number | null
          vehicle_id: string | null
        }
        Insert: {
          as_of_date?: string | null
          cost_basis?: number | null
          id?: string
          investor_id?: string | null
          last_nav?: number | null
          units?: number | null
          vehicle_id?: string | null
        }
        Update: {
          as_of_date?: string | null
          cost_basis?: number | null
          id?: string
          investor_id?: string | null
          last_nav?: number | null
          units?: number | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "positions_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "investors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "positions_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "entity_action_center_summary"
            referencedColumns: ["vehicle_id"]
          },
          {
            foreignKeyName: "positions_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          deleted_at: string | null
          display_name: string | null
          email: string | null
          has_seen_intro_video: boolean | null
          id: string
          last_login_at: string | null
          office_location: string | null
          password_set: boolean | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          title: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          deleted_at?: string | null
          display_name?: string | null
          email?: string | null
          has_seen_intro_video?: boolean | null
          id: string
          last_login_at?: string | null
          office_location?: string | null
          password_set?: boolean | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          deleted_at?: string | null
          display_name?: string | null
          email?: string | null
          has_seen_intro_video?: boolean | null
          id?: string
          last_login_at?: string | null
          office_location?: string | null
          password_set?: boolean | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      reconciliation_matches: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          bank_transaction_id: string | null
          created_at: string | null
          id: string
          invoice_id: string | null
          match_confidence: number | null
          match_reason: string | null
          match_type: string
          matched_amount: number
          notes: string | null
          status: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          bank_transaction_id?: string | null
          created_at?: string | null
          id?: string
          invoice_id?: string | null
          match_confidence?: number | null
          match_reason?: string | null
          match_type: string
          matched_amount: number
          notes?: string | null
          status?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          bank_transaction_id?: string | null
          created_at?: string | null
          id?: string
          invoice_id?: string | null
          match_confidence?: number | null
          match_reason?: string | null
          match_type?: string
          matched_amount?: number
          notes?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reconciliation_matches_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reconciliation_matches_bank_transaction_id_fkey"
            columns: ["bank_transaction_id"]
            isOneToOne: false
            referencedRelation: "bank_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reconciliation_matches_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      reconciliations: {
        Row: {
          bank_transaction_id: string | null
          id: string
          invoice_id: string | null
          matched_amount: number | null
          matched_at: string | null
          matched_by: string | null
        }
        Insert: {
          bank_transaction_id?: string | null
          id?: string
          invoice_id?: string | null
          matched_amount?: number | null
          matched_at?: string | null
          matched_by?: string | null
        }
        Update: {
          bank_transaction_id?: string | null
          id?: string
          invoice_id?: string | null
          matched_amount?: number | null
          matched_at?: string | null
          matched_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reconciliations_bank_transaction_id_fkey"
            columns: ["bank_transaction_id"]
            isOneToOne: false
            referencedRelation: "bank_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reconciliations_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reconciliations_matched_by_fkey"
            columns: ["matched_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      report_requests: {
        Row: {
          created_at: string | null
          created_by: string | null
          filters: Json | null
          id: string
          investor_id: string | null
          result_doc_id: string | null
          status: Database["public"]["Enums"]["report_status_enum"] | null
          vehicle_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          filters?: Json | null
          id?: string
          investor_id?: string | null
          result_doc_id?: string | null
          status?: Database["public"]["Enums"]["report_status_enum"] | null
          vehicle_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          filters?: Json | null
          id?: string
          investor_id?: string | null
          result_doc_id?: string | null
          status?: Database["public"]["Enums"]["report_status_enum"] | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "report_requests_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_requests_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "investors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_requests_result_doc_id_fkey"
            columns: ["result_doc_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_requests_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "entity_action_center_summary"
            referencedColumns: ["vehicle_id"]
          },
          {
            foreignKeyName: "report_requests_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      request_tickets: {
        Row: {
          assigned_to: string | null
          category: string | null
          created_at: string | null
          created_by: string | null
          deal_id: string | null
          details: string | null
          due_date: string | null
          id: string
          investor_id: string | null
          linked_workflow_run: string | null
          priority: Database["public"]["Enums"]["request_priority_enum"] | null
          result_doc_id: string | null
          status: Database["public"]["Enums"]["request_status_enum"] | null
          subject: string | null
        }
        Insert: {
          assigned_to?: string | null
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          deal_id?: string | null
          details?: string | null
          due_date?: string | null
          id?: string
          investor_id?: string | null
          linked_workflow_run?: string | null
          priority?: Database["public"]["Enums"]["request_priority_enum"] | null
          result_doc_id?: string | null
          status?: Database["public"]["Enums"]["request_status_enum"] | null
          subject?: string | null
        }
        Update: {
          assigned_to?: string | null
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          deal_id?: string | null
          details?: string | null
          due_date?: string | null
          id?: string
          investor_id?: string | null
          linked_workflow_run?: string | null
          priority?: Database["public"]["Enums"]["request_priority_enum"] | null
          result_doc_id?: string | null
          status?: Database["public"]["Enums"]["request_status_enum"] | null
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "request_tickets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "request_tickets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "request_tickets_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "request_tickets_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "investors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "request_tickets_result_doc_id_fkey"
            columns: ["result_doc_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      share_lots: {
        Row: {
          acquired_at: string | null
          created_at: string | null
          currency: string | null
          deal_id: string | null
          id: string
          lockup_until: string | null
          source_id: string | null
          status: string | null
          unit_cost: number
          units_remaining: number
          units_total: number
        }
        Insert: {
          acquired_at?: string | null
          created_at?: string | null
          currency?: string | null
          deal_id?: string | null
          id?: string
          lockup_until?: string | null
          source_id?: string | null
          status?: string | null
          unit_cost: number
          units_remaining: number
          units_total: number
        }
        Update: {
          acquired_at?: string | null
          created_at?: string | null
          currency?: string | null
          deal_id?: string | null
          id?: string
          lockup_until?: string | null
          source_id?: string | null
          status?: string | null
          unit_cost?: number
          units_remaining?: number
          units_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "share_lots_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "share_lots_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "share_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      share_sources: {
        Row: {
          contract_doc_id: string | null
          counterparty_name: string | null
          id: string
          kind: string
          notes: string | null
        }
        Insert: {
          contract_doc_id?: string | null
          counterparty_name?: string | null
          id?: string
          kind: string
          notes?: string | null
        }
        Update: {
          contract_doc_id?: string | null
          counterparty_name?: string | null
          id?: string
          kind?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "share_sources_contract_doc_id_fkey"
            columns: ["contract_doc_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      signature_requests: {
        Row: {
          created_at: string | null
          created_by: string | null
          deal_id: string | null
          document_id: string | null
          document_type: string
          email_error: string | null
          email_message_id: string | null
          email_opened_at: string | null
          email_sent_at: string | null
          google_drive_file_id: string | null
          google_drive_url: string | null
          id: string
          investor_id: string | null
          member_id: string | null
          signature_data_url: string | null
          signature_ip_address: string | null
          signature_position: string
          signature_timestamp: string | null
          signed_pdf_path: string | null
          signed_pdf_size: number | null
          signer_email: string
          signer_name: string
          signer_role: string
          signing_token: string
          status: string
          subscription_id: string | null
          token_expires_at: string
          unsigned_pdf_path: string | null
          unsigned_pdf_size: number | null
          updated_at: string | null
          workflow_run_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          deal_id?: string | null
          document_id?: string | null
          document_type: string
          email_error?: string | null
          email_message_id?: string | null
          email_opened_at?: string | null
          email_sent_at?: string | null
          google_drive_file_id?: string | null
          google_drive_url?: string | null
          id?: string
          investor_id?: string | null
          member_id?: string | null
          signature_data_url?: string | null
          signature_ip_address?: string | null
          signature_position: string
          signature_timestamp?: string | null
          signed_pdf_path?: string | null
          signed_pdf_size?: number | null
          signer_email: string
          signer_name: string
          signer_role: string
          signing_token: string
          status?: string
          subscription_id?: string | null
          token_expires_at: string
          unsigned_pdf_path?: string | null
          unsigned_pdf_size?: number | null
          updated_at?: string | null
          workflow_run_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          deal_id?: string | null
          document_id?: string | null
          document_type?: string
          email_error?: string | null
          email_message_id?: string | null
          email_opened_at?: string | null
          email_sent_at?: string | null
          google_drive_file_id?: string | null
          google_drive_url?: string | null
          id?: string
          investor_id?: string | null
          member_id?: string | null
          signature_data_url?: string | null
          signature_ip_address?: string | null
          signature_position?: string
          signature_timestamp?: string | null
          signed_pdf_path?: string | null
          signed_pdf_size?: number | null
          signer_email?: string
          signer_name?: string
          signer_role?: string
          signing_token?: string
          status?: string
          subscription_id?: string | null
          token_expires_at?: string
          unsigned_pdf_path?: string | null
          unsigned_pdf_size?: number | null
          updated_at?: string | null
          workflow_run_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "signature_requests_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "signature_requests_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "signature_requests_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "signature_requests_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "investors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "signature_requests_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "investor_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "signature_requests_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "signature_requests_workflow_run_id_fkey"
            columns: ["workflow_run_id"]
            isOneToOne: false
            referencedRelation: "workflow_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_filter_views: {
        Row: {
          created_at: string | null
          entity_type: string
          filters: Json
          id: string
          is_default: boolean | null
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          entity_type: string
          filters?: Json
          id?: string
          is_default?: boolean | null
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          entity_type?: string
          filters?: Json
          id?: string
          is_default?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_filter_views_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_permissions: {
        Row: {
          expires_at: string | null
          granted_at: string | null
          granted_by: string | null
          id: string
          permission: string
          user_id: string
        }
        Insert: {
          expires_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          permission: string
          user_id: string
        }
        Update: {
          expires_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          permission?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_permissions_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_permissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_fingerprints: {
        Row: {
          created_at: string | null
          fingerprint: string
          subscription_id: string
        }
        Insert: {
          created_at?: string | null
          fingerprint: string
          subscription_id: string
        }
        Update: {
          created_at?: string | null
          fingerprint?: string
          subscription_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_fingerprints_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_import_results: {
        Row: {
          created_at: string
          entity_investor_id: string | null
          id: string
          investor_deal_holding_id: string | null
          investor_id: string
          run_id: string
          subscription_id: string | null
          vehicle_id: string
        }
        Insert: {
          created_at?: string
          entity_investor_id?: string | null
          id?: string
          investor_deal_holding_id?: string | null
          investor_id: string
          run_id: string
          subscription_id?: string | null
          vehicle_id: string
        }
        Update: {
          created_at?: string
          entity_investor_id?: string | null
          id?: string
          investor_deal_holding_id?: string | null
          investor_id?: string
          run_id?: string
          subscription_id?: string | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_import_results_entity_investor_id_fkey"
            columns: ["entity_investor_id"]
            isOneToOne: false
            referencedRelation: "entity_investors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_import_results_investor_deal_holding_id_fkey"
            columns: ["investor_deal_holding_id"]
            isOneToOne: false
            referencedRelation: "investor_deal_holdings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_import_results_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "subscription_workbook_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_import_results_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_workbook_runs: {
        Row: {
          created_at: string
          dry_run: boolean | null
          executed_by: string | null
          id: string
          notes: string | null
          run_state: string
          source_filename: string
          source_hash: string | null
        }
        Insert: {
          created_at?: string
          dry_run?: boolean | null
          executed_by?: string | null
          id?: string
          notes?: string | null
          run_state?: string
          source_filename: string
          source_hash?: string | null
        }
        Update: {
          created_at?: string
          dry_run?: boolean | null
          executed_by?: string | null
          id?: string
          notes?: string | null
          run_state?: string
          source_filename?: string
          source_hash?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          acknowledgement_notes: string | null
          activated_at: string | null
          bd_fee_amount: number | null
          bd_fee_percent: number | null
          capital_calls_total: number | null
          commitment: number | null
          committed_at: string | null
          contract_date: string | null
          cost_per_share: number | null
          created_at: string | null
          currency: string | null
          current_nav: number | null
          deal_id: string | null
          distributions_total: number | null
          effective_date: string | null
          fee_plan_id: string | null
          finra_fee_amount: number | null
          funded_amount: number | null
          funded_at: string | null
          funding_due_at: string | null
          id: string
          introducer_id: string | null
          introduction_id: string | null
          investor_id: string | null
          management_fee_amount: number | null
          management_fee_frequency: string | null
          management_fee_percent: number | null
          num_shares: number | null
          opportunity_name: string | null
          outstanding_amount: number | null
          pack_generated_at: string | null
          pack_sent_at: string | null
          performance_fee_tier1_percent: number | null
          performance_fee_tier1_threshold: number | null
          performance_fee_tier2_percent: number | null
          performance_fee_tier2_threshold: number | null
          price_per_share: number | null
          proxy_authorization_doc_id: string | null
          proxy_commercial_partner_id: string | null
          proxy_user_id: string | null
          signed_at: string | null
          signed_doc_id: string | null
          sourcing_contract_ref: string | null
          spread_fee_amount: number | null
          spread_per_share: number | null
          status: string | null
          submitted_by_proxy: boolean | null
          subscription_date: string | null
          subscription_fee_amount: number | null
          subscription_fee_percent: number | null
          subscription_number: number
          units: number | null
          vehicle_id: string | null
        }
        Insert: {
          acknowledgement_notes?: string | null
          activated_at?: string | null
          bd_fee_amount?: number | null
          bd_fee_percent?: number | null
          capital_calls_total?: number | null
          commitment?: number | null
          committed_at?: string | null
          contract_date?: string | null
          cost_per_share?: number | null
          created_at?: string | null
          currency?: string | null
          current_nav?: number | null
          deal_id?: string | null
          distributions_total?: number | null
          effective_date?: string | null
          fee_plan_id?: string | null
          finra_fee_amount?: number | null
          funded_amount?: number | null
          funded_at?: string | null
          funding_due_at?: string | null
          id?: string
          introducer_id?: string | null
          introduction_id?: string | null
          investor_id?: string | null
          management_fee_amount?: number | null
          management_fee_frequency?: string | null
          management_fee_percent?: number | null
          num_shares?: number | null
          opportunity_name?: string | null
          outstanding_amount?: number | null
          pack_generated_at?: string | null
          pack_sent_at?: string | null
          performance_fee_tier1_percent?: number | null
          performance_fee_tier1_threshold?: number | null
          performance_fee_tier2_percent?: number | null
          performance_fee_tier2_threshold?: number | null
          price_per_share?: number | null
          proxy_authorization_doc_id?: string | null
          proxy_commercial_partner_id?: string | null
          proxy_user_id?: string | null
          signed_at?: string | null
          signed_doc_id?: string | null
          sourcing_contract_ref?: string | null
          spread_fee_amount?: number | null
          spread_per_share?: number | null
          status?: string | null
          submitted_by_proxy?: boolean | null
          subscription_date?: string | null
          subscription_fee_amount?: number | null
          subscription_fee_percent?: number | null
          subscription_number?: number
          units?: number | null
          vehicle_id?: string | null
        }
        Update: {
          acknowledgement_notes?: string | null
          activated_at?: string | null
          bd_fee_amount?: number | null
          bd_fee_percent?: number | null
          capital_calls_total?: number | null
          commitment?: number | null
          committed_at?: string | null
          contract_date?: string | null
          cost_per_share?: number | null
          created_at?: string | null
          currency?: string | null
          current_nav?: number | null
          deal_id?: string | null
          distributions_total?: number | null
          effective_date?: string | null
          fee_plan_id?: string | null
          finra_fee_amount?: number | null
          funded_amount?: number | null
          funded_at?: string | null
          funding_due_at?: string | null
          id?: string
          introducer_id?: string | null
          introduction_id?: string | null
          investor_id?: string | null
          management_fee_amount?: number | null
          management_fee_frequency?: string | null
          management_fee_percent?: number | null
          num_shares?: number | null
          opportunity_name?: string | null
          outstanding_amount?: number | null
          pack_generated_at?: string | null
          pack_sent_at?: string | null
          performance_fee_tier1_percent?: number | null
          performance_fee_tier1_threshold?: number | null
          performance_fee_tier2_percent?: number | null
          performance_fee_tier2_threshold?: number | null
          price_per_share?: number | null
          proxy_authorization_doc_id?: string | null
          proxy_commercial_partner_id?: string | null
          proxy_user_id?: string | null
          signed_at?: string | null
          signed_doc_id?: string | null
          sourcing_contract_ref?: string | null
          spread_fee_amount?: number | null
          spread_per_share?: number | null
          status?: string | null
          submitted_by_proxy?: boolean | null
          subscription_date?: string | null
          subscription_fee_amount?: number | null
          subscription_fee_percent?: number | null
          subscription_number?: number
          units?: number | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_fee_plan_id_fkey"
            columns: ["fee_plan_id"]
            isOneToOne: false
            referencedRelation: "fee_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_introducer_id_fkey"
            columns: ["introducer_id"]
            isOneToOne: false
            referencedRelation: "introducers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_introduction_id_fkey"
            columns: ["introduction_id"]
            isOneToOne: false
            referencedRelation: "introductions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "investors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_proxy_authorization_doc_id_fkey"
            columns: ["proxy_authorization_doc_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_proxy_commercial_partner_id_fkey"
            columns: ["proxy_commercial_partner_id"]
            isOneToOne: false
            referencedRelation: "commercial_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "entity_action_center_summary"
            referencedColumns: ["vehicle_id"]
          },
          {
            foreignKeyName: "subscriptions_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      suggested_matches: {
        Row: {
          amount_difference: number | null
          bank_transaction_id: string | null
          confidence: number
          created_at: string | null
          id: string
          invoice_id: string | null
          match_reason: string
          subscription_id: string | null
        }
        Insert: {
          amount_difference?: number | null
          bank_transaction_id?: string | null
          confidence: number
          created_at?: string | null
          id?: string
          invoice_id?: string | null
          match_reason: string
          subscription_id?: string | null
        }
        Update: {
          amount_difference?: number | null
          bank_transaction_id?: string | null
          confidence?: number
          created_at?: string | null
          id?: string
          invoice_id?: string | null
          match_reason?: string
          subscription_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "suggested_matches_bank_transaction_id_fkey"
            columns: ["bank_transaction_id"]
            isOneToOne: false
            referencedRelation: "bank_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suggested_matches_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suggested_matches_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      system_metrics: {
        Row: {
          created_at: string | null
          id: string
          metadata: Json | null
          metric_type: string
          timestamp: string
          unit: string | null
          value: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          metric_type: string
          timestamp?: string
          unit?: string | null
          value: number
        }
        Update: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          metric_type?: string
          timestamp?: string
          unit?: string | null
          value?: number
        }
        Relationships: []
      }
      task_actions: {
        Row: {
          action_config: Json | null
          action_type: string
          task_id: string
        }
        Insert: {
          action_config?: Json | null
          action_type: string
          task_id: string
        }
        Update: {
          action_config?: Json | null
          action_type?: string
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_actions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: true
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_dependencies: {
        Row: {
          depends_on_task_id: string
          task_id: string
        }
        Insert: {
          depends_on_task_id: string
          task_id: string
        }
        Update: {
          depends_on_task_id?: string
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_dependencies_depends_on_task_id_fkey"
            columns: ["depends_on_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_dependencies_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_templates: {
        Row: {
          category: string
          created_at: string | null
          default_due_days: number | null
          description: string | null
          estimated_minutes: number | null
          id: string
          kind: string
          prerequisite_task_kinds: string[] | null
          priority: string | null
          title: string
          trigger_event: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          default_due_days?: number | null
          description?: string | null
          estimated_minutes?: number | null
          id?: string
          kind: string
          prerequisite_task_kinds?: string[] | null
          priority?: string | null
          title: string
          trigger_event?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          default_due_days?: number | null
          description?: string | null
          estimated_minutes?: number | null
          id?: string
          kind?: string
          prerequisite_task_kinds?: string[] | null
          priority?: string | null
          title?: string
          trigger_event?: string | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          category: string | null
          completed_at: string | null
          completed_by: string | null
          completion_reason: string | null
          created_at: string | null
          description: string | null
          due_at: string | null
          estimated_minutes: number | null
          id: string
          instructions: Json | null
          kind: string | null
          owner_investor_id: string | null
          owner_user_id: string | null
          priority: string | null
          related_entity_id: string | null
          related_entity_type: string | null
          started_at: string | null
          status: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          completed_at?: string | null
          completed_by?: string | null
          completion_reason?: string | null
          created_at?: string | null
          description?: string | null
          due_at?: string | null
          estimated_minutes?: number | null
          id?: string
          instructions?: Json | null
          kind?: string | null
          owner_investor_id?: string | null
          owner_user_id?: string | null
          priority?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          started_at?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          completed_at?: string | null
          completed_by?: string | null
          completion_reason?: string | null
          created_at?: string | null
          description?: string | null
          due_at?: string | null
          estimated_minutes?: number | null
          id?: string
          instructions?: Json | null
          kind?: string | null
          owner_investor_id?: string | null
          owner_user_id?: string | null
          priority?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          started_at?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_owner_investor_id_fkey"
            columns: ["owner_investor_id"]
            isOneToOne: false
            referencedRelation: "investors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      term_sheets: {
        Row: {
          created_at: string | null
          created_by: string | null
          currency: string | null
          deal_id: string | null
          doc_id: string | null
          fee_plan_id: string | null
          id: string
          investor_id: string | null
          price_per_unit: number | null
          status: string | null
          supersedes_id: string | null
          terms_data: Json | null
          valid_until: string | null
          version: number | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          deal_id?: string | null
          doc_id?: string | null
          fee_plan_id?: string | null
          id?: string
          investor_id?: string | null
          price_per_unit?: number | null
          status?: string | null
          supersedes_id?: string | null
          terms_data?: Json | null
          valid_until?: string | null
          version?: number | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          deal_id?: string | null
          doc_id?: string | null
          fee_plan_id?: string | null
          id?: string
          investor_id?: string | null
          price_per_unit?: number | null
          status?: string | null
          supersedes_id?: string | null
          terms_data?: Json | null
          valid_until?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "term_sheets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "term_sheets_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "term_sheets_doc_id_fkey"
            columns: ["doc_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "term_sheets_fee_plan_id_fkey"
            columns: ["fee_plan_id"]
            isOneToOne: false
            referencedRelation: "fee_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "term_sheets_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "investors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "term_sheets_supersedes_id_fkey"
            columns: ["supersedes_id"]
            isOneToOne: false
            referencedRelation: "term_sheets"
            referencedColumns: ["id"]
          },
        ]
      }
      valuations: {
        Row: {
          as_of_date: string
          id: string
          nav_per_unit: number | null
          nav_total: number | null
          vehicle_id: string | null
        }
        Insert: {
          as_of_date: string
          id?: string
          nav_per_unit?: number | null
          nav_total?: number | null
          vehicle_id?: string | null
        }
        Update: {
          as_of_date?: string
          id?: string
          nav_per_unit?: number | null
          nav_total?: number | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "valuations_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "entity_action_center_summary"
            referencedColumns: ["vehicle_id"]
          },
          {
            foreignKeyName: "valuations_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          arranger_entity_id: string | null
          created_at: string | null
          currency: string | null
          domicile: string | null
          entity_code: string | null
          formation_date: string | null
          former_entity: string | null
          id: string
          investment_name: string | null
          issuer_gp_name: string | null
          issuer_gp_rcc_number: string | null
          issuer_rcc_number: string | null
          issuer_website: string | null
          legal_jurisdiction: string | null
          logo_url: string | null
          name: string
          notes: string | null
          platform: string | null
          registration_number: string | null
          reporting_type: Database["public"]["Enums"]["reporting_type"] | null
          requires_reporting: boolean | null
          series_number: string | null
          series_short_title: string | null
          status: Database["public"]["Enums"]["entity_status"] | null
          type: Database["public"]["Enums"]["vehicle_type"] | null
          website_url: string | null
        }
        Insert: {
          arranger_entity_id?: string | null
          created_at?: string | null
          currency?: string | null
          domicile?: string | null
          entity_code?: string | null
          formation_date?: string | null
          former_entity?: string | null
          id?: string
          investment_name?: string | null
          issuer_gp_name?: string | null
          issuer_gp_rcc_number?: string | null
          issuer_rcc_number?: string | null
          issuer_website?: string | null
          legal_jurisdiction?: string | null
          logo_url?: string | null
          name: string
          notes?: string | null
          platform?: string | null
          registration_number?: string | null
          reporting_type?: Database["public"]["Enums"]["reporting_type"] | null
          requires_reporting?: boolean | null
          series_number?: string | null
          series_short_title?: string | null
          status?: Database["public"]["Enums"]["entity_status"] | null
          type?: Database["public"]["Enums"]["vehicle_type"] | null
          website_url?: string | null
        }
        Update: {
          arranger_entity_id?: string | null
          created_at?: string | null
          currency?: string | null
          domicile?: string | null
          entity_code?: string | null
          formation_date?: string | null
          former_entity?: string | null
          id?: string
          investment_name?: string | null
          issuer_gp_name?: string | null
          issuer_gp_rcc_number?: string | null
          issuer_rcc_number?: string | null
          issuer_website?: string | null
          legal_jurisdiction?: string | null
          logo_url?: string | null
          name?: string
          notes?: string | null
          platform?: string | null
          registration_number?: string | null
          reporting_type?: Database["public"]["Enums"]["reporting_type"] | null
          requires_reporting?: boolean | null
          series_number?: string | null
          series_short_title?: string | null
          status?: Database["public"]["Enums"]["entity_status"] | null
          type?: Database["public"]["Enums"]["vehicle_type"] | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_arranger_entity_id_fkey"
            columns: ["arranger_entity_id"]
            isOneToOne: false
            referencedRelation: "arranger_entities"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_run_logs: {
        Row: {
          created_at: string | null
          id: string
          log_level: string | null
          message: string | null
          metadata: Json | null
          step_name: string
          step_status: string | null
          workflow_run_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          log_level?: string | null
          message?: string | null
          metadata?: Json | null
          step_name: string
          step_status?: string | null
          workflow_run_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          log_level?: string | null
          message?: string | null
          metadata?: Json | null
          step_name?: string
          step_status?: string | null
          workflow_run_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_run_logs_workflow_run_id_fkey"
            columns: ["workflow_run_id"]
            isOneToOne: false
            referencedRelation: "workflow_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_runs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          created_tasks: string[] | null
          duration_ms: number | null
          entity_id: string | null
          entity_type: string | null
          error_message: string | null
          id: string
          idempotency_token: string | null
          input_params: Json | null
          output_data: Json | null
          queued_at: string | null
          result_doc_id: string | null
          signing_in_progress: boolean | null
          signing_locked_at: string | null
          signing_locked_by: string | null
          started_at: string | null
          status: string | null
          triggered_by: string | null
          updated_at: string | null
          webhook_signature: string | null
          workflow_id: string | null
          workflow_key: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          created_tasks?: string[] | null
          duration_ms?: number | null
          entity_id?: string | null
          entity_type?: string | null
          error_message?: string | null
          id?: string
          idempotency_token?: string | null
          input_params?: Json | null
          output_data?: Json | null
          queued_at?: string | null
          result_doc_id?: string | null
          signing_in_progress?: boolean | null
          signing_locked_at?: string | null
          signing_locked_by?: string | null
          started_at?: string | null
          status?: string | null
          triggered_by?: string | null
          updated_at?: string | null
          webhook_signature?: string | null
          workflow_id?: string | null
          workflow_key?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          created_tasks?: string[] | null
          duration_ms?: number | null
          entity_id?: string | null
          entity_type?: string | null
          error_message?: string | null
          id?: string
          idempotency_token?: string | null
          input_params?: Json | null
          output_data?: Json | null
          queued_at?: string | null
          result_doc_id?: string | null
          signing_in_progress?: boolean | null
          signing_locked_at?: string | null
          signing_locked_by?: string | null
          started_at?: string | null
          status?: string | null
          triggered_by?: string | null
          updated_at?: string | null
          webhook_signature?: string | null
          workflow_id?: string | null
          workflow_key?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_runs_signing_locked_by_fkey"
            columns: ["signing_locked_by"]
            isOneToOne: false
            referencedRelation: "signature_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_runs_triggered_by_fkey"
            columns: ["triggered_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_runs_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflows: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          input_schema: Json | null
          is_active: boolean | null
          key: string
          n8n_webhook_url: string
          name: string | null
          required_role: string | null
          required_title: string[] | null
          trigger_type: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          input_schema?: Json | null
          is_active?: boolean | null
          key: string
          n8n_webhook_url: string
          name?: string | null
          required_role?: string | null
          required_title?: string[] | null
          trigger_type?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          input_schema?: Json | null
          is_active?: boolean | null
          key?: string
          n8n_webhook_url?: string
          name?: string | null
          required_role?: string | null
          required_title?: string[] | null
          trigger_type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      entity_action_center_summary: {
        Row: {
          critical_flags: number | null
          earliest_due_date: string | null
          entity_code: string | null
          info_flags: number | null
          last_flag_update: string | null
          platform: string | null
          total_unresolved_flags: number | null
          vehicle_id: string | null
          vehicle_name: string | null
          vehicle_status: Database["public"]["Enums"]["entity_status"] | null
          warning_flags: number | null
        }
        Relationships: []
      }
      folder_hierarchy: {
        Row: {
          depth: number | null
          folder_type: string | null
          full_path: string | null
          id: string | null
          indented_name: string | null
          path: string | null
          vehicle_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      accrue_quarterly_management_fees: {
        Args: { p_deal_id: string; p_quarter_end_date: string }
        Returns: {
          fee_amount: number
          fee_event_id: string
          investor_id: string
        }[]
      }
      aggregate_fee_events_by_date: {
        Args: { start_date: string }
        Returns: {
          amount: number
          date: string
        }[]
      }
      aggregate_subscriptions_by_date: {
        Args: { start_date: string }
        Returns: {
          amount: number
          date: string
        }[]
      }
      apply_match: {
        Args: { p_approved_by: string; p_match_id: string }
        Returns: undefined
      }
      auto_create_deal_folder_for_existing: {
        Args: { p_created_by?: string; p_deal_id: string }
        Returns: undefined
      }
      auto_create_vehicle_folders_for_existing: {
        Args: { p_created_by?: string; p_vehicle_id: string }
        Returns: undefined
      }
      calculate_investor_kpis: {
        Args: { as_of_date?: string; investor_ids: string[] }
        Returns: {
          current_nav: number
          dpi: number
          irr_estimate: number
          total_commitment: number
          total_contributed: number
          total_cost_basis: number
          total_distributions: number
          total_positions: number
          total_vehicles: number
          tvpi: number
          unfunded_commitment: number
          unrealized_gain: number
          unrealized_gain_pct: number
        }[]
      }
      calculate_investor_kpis_with_deals: {
        Args: { as_of_date?: string; investor_ids: string[] }
        Returns: {
          current_nav: number
          dpi: number
          irr_estimate: number
          pending_allocations: number
          total_commitment: number
          total_contributed: number
          total_cost_basis: number
          total_deal_value: number
          total_deals: number
          total_distributions: number
          total_positions: number
          total_vehicles: number
          tvpi: number
          unfunded_commitment: number
          unrealized_gain: number
          unrealized_gain_pct: number
        }[]
      }
      calculate_management_fee: {
        Args: {
          p_base_amount: number
          p_period_days: number
          p_rate_bps: number
        }
        Returns: number
      }
      calculate_performance_fee: {
        Args: {
          p_carry_rate_bps: number
          p_contributed_capital: number
          p_exit_proceeds: number
          p_hurdle_rate_bps: number
          p_years_held: number
        }
        Returns: number
      }
      calculate_subscription_fee: {
        Args: { p_commitment_amount: number; p_rate_bps: number }
        Returns: number
      }
      check_all_signatories_signed: {
        Args: { p_deal_id: string; p_investor_id: string }
        Returns: {
          all_signed: boolean
          pending_signatories: Json
          signed_count: number
          total_signatories: number
        }[]
      }
      check_auto_approval_criteria: {
        Args: { p_approval_id: string }
        Returns: boolean
      }
      check_entity_compliance: {
        Args: never
        Returns: {
          issues_found: number
          vehicle_id: string
        }[]
      }
      create_default_entity_folders: {
        Args: { p_vehicle_id: string }
        Returns: undefined
      }
      create_default_vehicle_folders: {
        Args: { p_created_by: string; p_vehicle_id: string }
        Returns: undefined
      }
      create_tasks_from_templates: {
        Args: {
          p_investor_id: string
          p_trigger_event: string
          p_user_id: string
        }
        Returns: {
          category: string | null
          completed_at: string | null
          completed_by: string | null
          completion_reason: string | null
          created_at: string | null
          description: string | null
          due_at: string | null
          estimated_minutes: number | null
          id: string
          instructions: Json | null
          kind: string | null
          owner_investor_id: string | null
          owner_user_id: string | null
          priority: string | null
          related_entity_id: string | null
          related_entity_type: string | null
          started_at: string | null
          status: string | null
          title: string | null
          updated_at: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "tasks"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      dispatch_to_deal: {
        Args: {
          p_deal_id: string
          p_entity_id: string
          p_entity_type: string
          p_investor_id?: string
          p_user_id: string
        }
        Returns: string
      }
      ensure_entity_default_folders: {
        Args: { p_actor?: string; p_vehicle_id: string }
        Returns: undefined
      }
      fn_compute_fee_events: {
        Args: { p_as_of_date?: string; p_deal_id: string }
        Returns: number
      }
      fn_deal_inventory_summary: {
        Args: { p_deal_id: string }
        Returns: {
          allocated_units: number
          available_units: number
          reserved_units: number
          total_units: number
        }[]
      }
      fn_expire_reservations: { Args: never; Returns: number }
      fn_finalize_allocation: {
        Args: { p_approver_id: string; p_reservation_id: string }
        Returns: string
      }
      fn_invoice_fees: {
        Args: {
          p_deal_id: string
          p_investor_id?: string
          p_up_to_date?: string
        }
        Returns: string
      }
      fn_reserve_inventory: {
        Args: {
          p_deal_id: string
          p_hold_minutes?: number
          p_investor_id: string
          p_proposed_unit_price: number
          p_requested_units: number
        }
        Returns: string
      }
      get_applicable_fee_plan: {
        Args: {
          p_as_of_date?: string
          p_deal_id: string
          p_investor_id: string
        }
        Returns: {
          components: Json
          fee_plan_id: string
          fee_plan_name: string
          overrides: Json
        }[]
      }
      get_approval_stats: {
        Args: { p_staff_id?: string }
        Returns: {
          approval_rate_24h: number
          avg_processing_time_hours: number
          overdue_count: number
          total_approved_30d: number
          total_awaiting_info: number
          total_pending: number
          total_rejected_30d: number
        }[]
      }
      get_conversation_unread_counts: {
        Args: { p_conversation_ids: string[]; p_user_id: string }
        Returns: {
          conversation_id: string
          unread_count: number
        }[]
      }
      get_dashboard_counts: {
        Args: { month_start: string }
        Returns: {
          active_deals: number
          active_lps: number
          active_requests: number
          active_workflows: number
          compliant_investors: number
          high_priority_kyc: number
          pending_kyc: number
          total_investors: number
          workflow_runs_mtd: number
        }[]
      }
      get_folder_path: { Args: { p_folder_id: string }; Returns: string }
      get_investor_capital_summary: {
        Args: { p_investor_ids: string[] }
        Returns: {
          current_nav: number
          investor_id: string
          last_capital_call_date: string
          last_distribution_date: string
          position_count: number
          total_commitment: number
          total_contributed: number
          total_distributed: number
          unfunded_commitment: number
          vehicle_count: number
        }[]
      }
      get_investor_journey_stage: {
        Args: { p_deal_id: string; p_investor_id: string }
        Returns: {
          completed_at: string
          is_current: boolean
          stage_name: string
          stage_number: number
        }[]
      }
      get_investor_kpi_details: {
        Args: { as_of_date?: string; investor_ids: string[]; kpi_type: string }
        Returns: {
          id: string
          metadata: Json
          name: string
          percentage: number
          type: string
          value: number
        }[]
      }
      get_investor_vehicle_breakdown: {
        Args: { investor_ids: string[] }
        Returns: {
          as_of_date: string
          commitment: number
          contributed: number
          cost_basis: number
          current_value: number
          distributed: number
          id: string
          logo_url: string
          name: string
          nav_per_unit: number
          units: number
          unrealized_gain: number
          unrealized_gain_pct: number
          vehicle_type: string
        }[]
      }
      get_latest_valuations: {
        Args: never
        Returns: {
          as_of_date: string
          nav_per_unit: number
          vehicle_id: string
        }[]
      }
      get_my_investor_ids: { Args: never; Returns: string[] }
      get_or_create_investor: {
        Args: { p_name: string; p_type: string }
        Returns: string
      }
      get_or_create_vehicle: { Args: { p_code: string }; Returns: string }
      get_portfolio_trends: {
        Args: { days_back?: number; investor_ids: string[] }
        Returns: {
          nav_change: number
          nav_change_pct: number
          performance_change: number
          period_days: number
        }[]
      }
      get_reconciliation_summary: {
        Args: never
        Returns: {
          match_rate: number
          matched_transactions: number
          pending_amount: number
          reconciled_amount: number
          total_transactions: number
          unmatched_transactions: number
        }[]
      }
      get_subscription_amount: { Args: { p_payload: Json }; Returns: number }
      get_task_progress_by_category: {
        Args: { p_investor_id?: string; p_user_id: string }
        Returns: {
          category: string
          completed_tasks: number
          percentage: number
          total_tasks: number
        }[]
      }
      get_unread_message_count: { Args: { p_user_id: string }; Returns: number }
      get_user_personas: {
        Args: { p_user_id?: string }
        Returns: {
          can_execute_for_clients: boolean
          can_sign: boolean
          entity_id: string
          entity_logo_url: string
          entity_name: string
          is_primary: boolean
          persona_type: string
          role_in_entity: string
        }[]
      }
      has_document_access: { Args: { p_document_id: string }; Returns: boolean }
      has_vehicle_access: { Args: { p_vehicle_id: string }; Returns: boolean }
      is_ceo: { Args: never; Returns: boolean }
      is_staff: { Args: never; Returns: boolean }
      is_staff_user: { Args: never; Returns: boolean }
      is_user_dispatched_to_deal: {
        Args: { p_deal_id: string }
        Returns: boolean
      }
      log_audit_event: {
        Args: {
          p_action: string
          p_action_details: Json
          p_actor_id: string
          p_after: Json
          p_before: Json
          p_compliance_flag: boolean
          p_entity_id: string
          p_entity_name: string
          p_entity_type: string
          p_event_type: string
          p_retention_category: string
          p_risk_level: string
        }
        Returns: string
      }
      mark_compliance_review: {
        Args: {
          p_audit_log_id: string
          p_notes: string
          p_reviewer_id: string
          p_status: string
        }
        Returns: undefined
      }
      mark_conversation_read: {
        Args: { p_conversation_id: string; p_user_id: string }
        Returns: undefined
      }
      mark_overdue_tasks: {
        Args: never
        Returns: {
          updated_count: number
        }[]
      }
      publish_scheduled_documents: {
        Args: never
        Returns: {
          document_id: string
          published_count: number
        }[]
      }
      revoke_dispatch: {
        Args: { p_deal_id: string; p_user_id: string }
        Returns: boolean
      }
      run_auto_match: {
        Args: never
        Returns: {
          confidence: number
          invoice_id: string
          reason: string
          transaction_id: string
        }[]
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      unpublish_expired_documents: {
        Args: never
        Returns: {
          document_id: string
          unpublished_count: number
        }[]
      }
      user_has_deal_access: {
        Args: { target_deal_id: string }
        Returns: boolean
      }
      user_is_staff: { Args: never; Returns: boolean }
      user_linked_to_investor: {
        Args: { target_investor_id: string }
        Returns: boolean
      }
      user_requires_dispatch: { Args: never; Returns: boolean }
    }
    Enums: {
      allocation_status_enum:
        | "pending_review"
        | "approved"
        | "rejected"
        | "settled"
      conversation_type_enum: "dm" | "group" | "deal_room" | "broadcast"
      conversation_visibility_enum: "investor" | "internal" | "deal"
      convo_type_enum: "dm" | "group" | "deal_room" | "broadcast"
      deal_member_role:
        | "investor"
        | "co_investor"
        | "spouse"
        | "advisor"
        | "lawyer"
        | "banker"
        | "introducer"
        | "viewer"
        | "verso_staff"
        | "partner_investor"
        | "introducer_investor"
        | "commercial_partner_investor"
        | "commercial_partner_proxy"
        | "arranger"
      deal_status_enum:
        | "draft"
        | "open"
        | "allocation_pending"
        | "closed"
        | "cancelled"
      deal_type_enum:
        | "equity_secondary"
        | "equity_primary"
        | "credit_trade_finance"
        | "other"
      entity_status: "LIVE" | "CLOSED" | "TBD"
      fee_calc_method_enum:
        | "percent_of_investment"
        | "percent_per_annum"
        | "percent_of_profit"
        | "per_unit_spread"
        | "fixed"
        | "percent_of_commitment"
        | "percent_of_nav"
        | "fixed_amount"
      fee_component_kind_enum:
        | "subscription"
        | "management"
        | "performance"
        | "spread_markup"
        | "flat"
        | "other"
        | "bd_fee"
        | "finra_fee"
      fee_event_status_enum:
        | "accrued"
        | "invoiced"
        | "voided"
        | "paid"
        | "waived"
        | "disputed"
        | "cancelled"
      fee_frequency_enum:
        | "one_time"
        | "annual"
        | "quarterly"
        | "monthly"
        | "on_exit"
        | "on_event"
      flag_severity: "critical" | "warning" | "info" | "success"
      flag_type:
        | "compliance_issue"
        | "missing_documents"
        | "expiring_documents"
        | "reporting_due"
        | "approval_required"
        | "action_required"
        | "information_needed"
        | "review_required"
      folder_type:
        | "kyc"
        | "legal"
        | "redemption_closure"
        | "financial_statements"
        | "tax_documents"
        | "board_minutes"
        | "investor_agreements"
        | "compliance"
        | "correspondence"
        | "other"
      invoice_status_enum:
        | "draft"
        | "sent"
        | "paid"
        | "partially_paid"
        | "cancelled"
        | "overdue"
        | "disputed"
      kyc_status_type:
        | "not_started"
        | "in_progress"
        | "pending_review"
        | "approved"
        | "rejected"
        | "expired"
        | "renewal_required"
      message_type_enum: "text" | "system" | "file"
      participant_role_enum: "owner" | "member" | "viewer"
      payment_status_enum: "received" | "applied" | "refunded"
      report_status_enum: "queued" | "processing" | "ready" | "failed"
      reporting_type:
        | "Not Required"
        | "Company Only"
        | "Online only"
        | "Company + Online"
      request_priority_enum: "low" | "normal" | "high" | "urgent"
      request_status_enum:
        | "open"
        | "assigned"
        | "in_progress"
        | "ready"
        | "closed"
        | "awaiting_info"
        | "cancelled"
      reservation_status_enum: "pending" | "approved" | "expired" | "cancelled"
      stakeholder_role:
        | "lawyer"
        | "accountant"
        | "administrator"
        | "auditor"
        | "strategic_partner"
        | "director"
        | "other"
      user_role:
        | "investor"
        | "staff_admin"
        | "staff_ops"
        | "staff_rm"
        | "arranger"
        | "introducer"
        | "partner"
        | "commercial_partner"
        | "lawyer"
        | "ceo"
      vehicle_type:
        | "fund"
        | "spv"
        | "securitization"
        | "note"
        | "other"
        | "real_estate"
        | "private_equity"
        | "venture_capital"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      allocation_status_enum: [
        "pending_review",
        "approved",
        "rejected",
        "settled",
      ],
      conversation_type_enum: ["dm", "group", "deal_room", "broadcast"],
      conversation_visibility_enum: ["investor", "internal", "deal"],
      convo_type_enum: ["dm", "group", "deal_room", "broadcast"],
      deal_member_role: [
        "investor",
        "co_investor",
        "spouse",
        "advisor",
        "lawyer",
        "banker",
        "introducer",
        "viewer",
        "verso_staff",
        "partner_investor",
        "introducer_investor",
        "commercial_partner_investor",
        "commercial_partner_proxy",
        "arranger",
      ],
      deal_status_enum: [
        "draft",
        "open",
        "allocation_pending",
        "closed",
        "cancelled",
      ],
      deal_type_enum: [
        "equity_secondary",
        "equity_primary",
        "credit_trade_finance",
        "other",
      ],
      entity_status: ["LIVE", "CLOSED", "TBD"],
      fee_calc_method_enum: [
        "percent_of_investment",
        "percent_per_annum",
        "percent_of_profit",
        "per_unit_spread",
        "fixed",
        "percent_of_commitment",
        "percent_of_nav",
        "fixed_amount",
      ],
      fee_component_kind_enum: [
        "subscription",
        "management",
        "performance",
        "spread_markup",
        "flat",
        "other",
        "bd_fee",
        "finra_fee",
      ],
      fee_event_status_enum: [
        "accrued",
        "invoiced",
        "voided",
        "paid",
        "waived",
        "disputed",
        "cancelled",
      ],
      fee_frequency_enum: [
        "one_time",
        "annual",
        "quarterly",
        "monthly",
        "on_exit",
        "on_event",
      ],
      flag_severity: ["critical", "warning", "info", "success"],
      flag_type: [
        "compliance_issue",
        "missing_documents",
        "expiring_documents",
        "reporting_due",
        "approval_required",
        "action_required",
        "information_needed",
        "review_required",
      ],
      folder_type: [
        "kyc",
        "legal",
        "redemption_closure",
        "financial_statements",
        "tax_documents",
        "board_minutes",
        "investor_agreements",
        "compliance",
        "correspondence",
        "other",
      ],
      invoice_status_enum: [
        "draft",
        "sent",
        "paid",
        "partially_paid",
        "cancelled",
        "overdue",
        "disputed",
      ],
      kyc_status_type: [
        "not_started",
        "in_progress",
        "pending_review",
        "approved",
        "rejected",
        "expired",
        "renewal_required",
      ],
      message_type_enum: ["text", "system", "file"],
      participant_role_enum: ["owner", "member", "viewer"],
      payment_status_enum: ["received", "applied", "refunded"],
      report_status_enum: ["queued", "processing", "ready", "failed"],
      reporting_type: [
        "Not Required",
        "Company Only",
        "Online only",
        "Company + Online",
      ],
      request_priority_enum: ["low", "normal", "high", "urgent"],
      request_status_enum: [
        "open",
        "assigned",
        "in_progress",
        "ready",
        "closed",
        "awaiting_info",
        "cancelled",
      ],
      reservation_status_enum: ["pending", "approved", "expired", "cancelled"],
      stakeholder_role: [
        "lawyer",
        "accountant",
        "administrator",
        "auditor",
        "strategic_partner",
        "director",
        "other",
      ],
      user_role: [
        "investor",
        "staff_admin",
        "staff_ops",
        "staff_rm",
        "arranger",
        "introducer",
        "partner",
        "commercial_partner",
        "lawyer",
        "ceo",
      ],
      vehicle_type: [
        "fund",
        "spv",
        "securitization",
        "note",
        "other",
        "real_estate",
        "private_equity",
        "venture_capital",
      ],
    },
  },
} as const


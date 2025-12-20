/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

/** Hierarchical view of document folders with SECURITY INVOKER for proper RLS enforcement */
export interface FolderHierarchy {
  /** @format uuid */
  id?: string;
  /** @format text */
  indented_name?: string;
  /** @format text */
  path?: string;
  /** @format text */
  folder_type?: string;
  /** @format uuid */
  vehicle_id?: string;
  /** @format integer */
  depth?: number;
  /** @format text */
  full_path?: string;
}

export interface Investors {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /** @format text */
  legal_name: string;
  /** @format text */
  type?: string;
  /**
   * @format text
   * @default "pending"
   */
  kyc_status?: string;
  /** @format text */
  country?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at?: string;
  /** @format text */
  display_name?: string;
  /** @format text */
  email?: string;
  /** @format text */
  phone?: string;
  /** @format text */
  country_of_incorporation?: string;
  /** @format text */
  tax_residency?: string;
  /** @format text */
  entity_identifier?: string;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  primary_rm?: string;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  secondary_rm?: string;
  /**
   * @format text
   * @default "active"
   */
  status?: string;
  /**
   * @format text
   * @default "pending"
   */
  onboarding_status?: string;
  /** @format timestamp with time zone */
  kyc_completed_at?: string;
  /** @format date */
  kyc_expiry_date?: string;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  kyc_approved_by?: string;
  /** @format text */
  aml_risk_rating?: string;
  /** @format timestamp with time zone */
  aml_last_reviewed_at?: string;
  /**
   * @format boolean
   * @default false
   */
  is_pep?: boolean;
  /**
   * @format boolean
   * @default false
   */
  is_sanctioned?: boolean;
  /**
   * @format boolean
   * @default false
   */
  is_professional_investor?: boolean;
  /**
   * @format boolean
   * @default false
   */
  is_qualified_purchaser?: boolean;
  /** @format date */
  accreditation_expiry?: string;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  created_by?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  updated_at?: string;
  /** @format timestamp with time zone */
  archived_at?: string;
  /**
   * Registered address of the investor entity
   * @format text
   */
  registered_address?: string;
  /**
   * City for NDA Party A (City, Country Code format)
   * @format text
   */
  city?: string;
  /**
   * Name of authorized representative for corporate entities
   * @format text
   */
  representative_name?: string;
  /**
   * Title of authorized representative
   * @format text
   */
  representative_title?: string;
  /**
   * Residential address street (required for contracts)
   * @format text
   */
  residential_street?: string;
  /**
   * Residential address city
   * @format text
   */
  residential_city?: string;
  /**
   * Residential address state/province
   * @format text
   */
  residential_state?: string;
  /**
   * Residential address postal/zip code
   * @format text
   */
  residential_postal_code?: string;
  /**
   * Residential address country
   * @format text
   */
  residential_country?: string;
  /**
   * Mobile phone number (primary contact)
   * @format text
   */
  phone_mobile?: string;
  /**
   * Office/work phone number
   * @format text
   */
  phone_office?: string;
  /** @format text */
  logo_url?: string;
}

/** Members (directors, shareholders, beneficial owners) of entity-type investors */
export interface InvestorMembers {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /**
   * References investors where type IN (entity, institution)
   *
   * Note:
   * This is a Foreign Key to `investors.id`.<fk table='investors' column='id'/>
   * @format uuid
   */
  investor_id: string;
  /** @format text */
  full_name: string;
  /** @format text */
  role: string;
  /** @format text */
  role_title?: string;
  /** @format text */
  email?: string;
  /** @format text */
  phone?: string;
  /** @format text */
  residential_street?: string;
  /** @format text */
  residential_city?: string;
  /** @format text */
  residential_state?: string;
  /** @format text */
  residential_postal_code?: string;
  /** @format text */
  residential_country?: string;
  /** @format text */
  nationality?: string;
  /** @format text */
  id_type?: string;
  /** @format text */
  id_number?: string;
  /** @format date */
  id_expiry_date?: string;
  /** @format numeric */
  ownership_percentage?: number;
  /**
   * @format boolean
   * @default false
   */
  is_beneficial_owner?: boolean;
  /**
   * @format text
   * @default "pending"
   */
  kyc_status?: string;
  /** @format timestamp with time zone */
  kyc_approved_at?: string;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  kyc_approved_by?: string;
  /** @format date */
  kyc_expiry_date?: string;
  /**
   * @format boolean
   * @default true
   */
  is_active?: boolean;
  /**
   * @format date
   * @default "CURRENT_DATE"
   */
  effective_from?: string;
  /** @format date */
  effective_to?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  updated_at?: string;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  created_by?: string;
}

export interface ImportBatches {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /** @format text */
  bank_account_id: string;
  /** @format text */
  file_name: string;
  /** @format integer */
  transaction_count: number;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  imported_by?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at?: string;
}

/** Links multiple users to commercial partner entities. WHO CAN LOGIN as this commercial partner. */
export interface CommercialPartnerUsers {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * This is a Foreign Key to `commercial_partners.id`.<fk table='commercial_partners' column='id'/>
   * @format uuid
   */
  commercial_partner_id: string;
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  user_id: string;
  /**
   * @format text
   * @default "contact"
   */
  role: string;
  /**
   * @format boolean
   * @default false
   */
  is_primary: boolean;
  /**
   * Whether this user can sign documents and execute transactions on behalf of clients (proxy mode).
   * @format boolean
   * @default false
   */
  can_execute_for_clients: boolean;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at: string;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  created_by?: string;
  /**
   * @format boolean
   * @default false
   */
  can_sign: boolean;
}

export interface Payments {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /**
   * Note:
   * This is a Foreign Key to `investors.id`.<fk table='investors' column='id'/>
   * @format uuid
   */
  investor_id?: string;
  /**
   * Note:
   * This is a Foreign Key to `invoices.id`.<fk table='invoices' column='id'/>
   * @format uuid
   */
  invoice_id?: string;
  /** @format numeric */
  amount?: number;
  /**
   * @format text
   * @default "USD"
   */
  currency?: string;
  /** @format timestamp with time zone */
  paid_at?: string;
  /** @format text */
  method?: string;
  /** @format uuid */
  bank_txn_id?: string;
  /**
   * @format public.payment_status_enum
   * @default "received"
   */
  status?: "received" | "applied" | "refunded";
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at?: string;
}

/** Master registry of all directors that can be assigned to entities */
export interface DirectorRegistry {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /** @format text */
  full_name: string;
  /** @format text */
  email?: string;
  /** @format text */
  phone?: string;
  /** @format text */
  nationality?: string;
  /**
   * Passport or National ID number
   * @format text
   */
  id_number?: string;
  /** @format text */
  notes?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at?: string;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  created_by?: string;
  /** @format timestamp with time zone */
  updated_at?: string;
}

export interface ShareLots {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /**
   * Note:
   * This is a Foreign Key to `deals.id`.<fk table='deals' column='id'/>
   * @format uuid
   */
  deal_id?: string;
  /**
   * Note:
   * This is a Foreign Key to `share_sources.id`.<fk table='share_sources' column='id'/>
   * @format uuid
   */
  source_id?: string;
  /** @format numeric */
  units_total: number;
  /** @format numeric */
  unit_cost: number;
  /**
   * @format text
   * @default "USD"
   */
  currency?: string;
  /** @format date */
  acquired_at?: string;
  /** @format date */
  lockup_until?: string;
  /** @format numeric */
  units_remaining: number;
  /**
   * @format text
   * @default "available"
   */
  status?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at?: string;
}

/** Stores saved filter combinations for staff users. */
export interface StaffFilterViews {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  user_id: string;
  /** @format text */
  name: string;
  /** @format text */
  entity_type: string;
  /** @format jsonb */
  filters: any;
  /**
   * @format boolean
   * @default false
   */
  is_default?: boolean;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  updated_at?: string;
}

/** Tracks all stakeholders (lawyers, accountants, auditors, etc.) associated with each entity/vehicle */
export interface EntityStakeholders {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /**
   * Note:
   * This is a Foreign Key to `vehicles.id`.<fk table='vehicles' column='id'/>
   * @format uuid
   */
  vehicle_id: string;
  /**
   * Type of stakeholder: lawyer, accountant, administrator, auditor, strategic_partner, director, other
   * @format public.stakeholder_role
   */
  role:
    | "lawyer"
    | "accountant"
    | "administrator"
    | "auditor"
    | "strategic_partner"
    | "director"
    | "other";
  /** @format text */
  company_name?: string;
  /** @format text */
  contact_person?: string;
  /** @format text */
  email?: string;
  /** @format text */
  phone?: string;
  /**
   * Date when this stakeholder relationship became active
   * @format date
   */
  effective_from?: string;
  /**
   * Date when this stakeholder relationship ended (NULL if still active)
   * @format date
   */
  effective_to?: string;
  /** @format text */
  notes?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  updated_at?: string;
}

/** Members (directors, trustees, partners) of counterparty entities that investors invest through */
export interface CounterpartyEntityMembers {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /**
   * References investor_counterparty table
   *
   * Note:
   * This is a Foreign Key to `investor_counterparty.id`.<fk table='investor_counterparty' column='id'/>
   * @format uuid
   */
  counterparty_entity_id: string;
  /** @format text */
  full_name: string;
  /** @format text */
  role: string;
  /** @format text */
  role_title?: string;
  /** @format text */
  email?: string;
  /** @format text */
  phone?: string;
  /** @format text */
  residential_street?: string;
  /** @format text */
  residential_city?: string;
  /** @format text */
  residential_state?: string;
  /** @format text */
  residential_postal_code?: string;
  /** @format text */
  residential_country?: string;
  /** @format text */
  nationality?: string;
  /** @format text */
  id_type?: string;
  /** @format text */
  id_number?: string;
  /** @format date */
  id_expiry_date?: string;
  /** @format numeric */
  ownership_percentage?: number;
  /**
   * @format boolean
   * @default false
   */
  is_beneficial_owner?: boolean;
  /**
   * @format text
   * @default "pending"
   */
  kyc_status?: string;
  /** @format timestamp with time zone */
  kyc_approved_at?: string;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  kyc_approved_by?: string;
  /** @format date */
  kyc_expiry_date?: string;
  /**
   * @format boolean
   * @default true
   */
  is_active?: boolean;
  /**
   * @format date
   * @default "CURRENT_DATE"
   */
  effective_from?: string;
  /** @format date */
  effective_to?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  updated_at?: string;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  created_by?: string;
}

/** Commercial partner organizations (placement agents, distributors, wealth managers). Follows investors pattern. */
export interface CommercialPartners {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /** @format text */
  name: string;
  /** @format text */
  legal_name?: string;
  /** @format text */
  type: string;
  /** @format text */
  cp_type: string;
  /**
   * @format text
   * @default "active"
   */
  status: string;
  /** @format text */
  regulatory_status?: string;
  /** @format text */
  regulatory_number?: string;
  /** @format text */
  jurisdiction?: string;
  /** @format text */
  contact_name?: string;
  /** @format text */
  contact_email?: string;
  /** @format text */
  contact_phone?: string;
  /** @format text */
  website?: string;
  /** @format text */
  address_line_1?: string;
  /** @format text */
  address_line_2?: string;
  /** @format text */
  city?: string;
  /** @format text */
  postal_code?: string;
  /** @format text */
  country?: string;
  /** @format text */
  payment_terms?: string;
  /** @format date */
  contract_start_date?: string;
  /** @format date */
  contract_end_date?: string;
  /** @format uuid */
  contract_document_id?: string;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  account_manager_id?: string;
  /** @format text */
  notes?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at: string;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  created_by?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  updated_at: string;
  /**
   * @format text
   * @default "not_started"
   */
  kyc_status?: string;
  /** @format timestamp with time zone */
  kyc_approved_at?: string;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  kyc_approved_by?: string;
  /** @format timestamp with time zone */
  kyc_expires_at?: string;
  /** @format text */
  kyc_notes?: string;
  /** @format text */
  logo_url?: string;
}

/** Personnel/compliance tracking for introducer entities. Directors, UBOs, signatories. */
export interface IntroducerMembers {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /**
   * Note:
   * This is a Foreign Key to `introducers.id`.<fk table='introducers' column='id'/>
   * @format uuid
   */
  introducer_id: string;
  /** @format text */
  full_name: string;
  /** @format text */
  role: string;
  /** @format text */
  role_title?: string;
  /** @format text */
  email?: string;
  /** @format text */
  phone?: string;
  /** @format text */
  residential_street?: string;
  /** @format text */
  residential_city?: string;
  /** @format text */
  residential_state?: string;
  /** @format text */
  residential_postal_code?: string;
  /** @format text */
  residential_country?: string;
  /** @format text */
  nationality?: string;
  /** @format text */
  id_type?: string;
  /** @format text */
  id_number?: string;
  /** @format date */
  id_expiry_date?: string;
  /** @format numeric */
  ownership_percentage?: number;
  /**
   * @format boolean
   * @default false
   */
  is_beneficial_owner: boolean;
  /**
   * @format boolean
   * @default false
   */
  is_signatory: boolean;
  /**
   * @format boolean
   * @default true
   */
  is_active: boolean;
  /** @format date */
  effective_from?: string;
  /** @format date */
  effective_to?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at: string;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  created_by?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  updated_at: string;
}

export interface Subscriptions {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /**
   * Note:
   * This is a Foreign Key to `investors.id`.<fk table='investors' column='id'/>
   * @format uuid
   */
  investor_id?: string;
  /**
   * Note:
   * This is a Foreign Key to `vehicles.id`.<fk table='vehicles' column='id'/>
   * @format uuid
   */
  vehicle_id?: string;
  /** @format numeric */
  commitment?: number;
  /**
   * @format text
   * @default "USD"
   */
  currency?: string;
  /**
   * @format text
   * @default "pending"
   */
  status?: string;
  /** @format uuid */
  signed_doc_id?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at?: string;
  /** @format timestamp with time zone */
  committed_at?: string;
  /** @format date */
  effective_date?: string;
  /** @format date */
  funding_due_at?: string;
  /** @format numeric */
  units?: number;
  /** @format text */
  acknowledgement_notes?: string;
  /**
   * Sequential number for multiple subscriptions per investor-vehicle pair. First subscription is #1, follow-on investments are #2, #3, etc. Auto-assigned by trigger on INSERT.
   * @format integer
   */
  subscription_number: number;
  /**
   * Price per share that investor paid (entry price)
   * @format numeric
   */
  price_per_share?: number;
  /**
   * Cost per share that VERSO paid to acquire
   * @format numeric
   */
  cost_per_share?: number;
  /**
   * Number of shares invested
   * @format numeric
   */
  num_shares?: number;
  /**
   * Spread per share (price_per_share - cost_per_share)
   * @format numeric
   */
  spread_per_share?: number;
  /**
   * Total spread fees earned (spread_per_share * num_shares) - PRIMARY REVENUE
   * @format numeric
   */
  spread_fee_amount?: number;
  /**
   * Subscription fee percentage charged to investor
   * @format numeric
   */
  subscription_fee_percent?: number;
  /**
   * Total subscription fee amount
   * @format numeric
   */
  subscription_fee_amount?: number;
  /**
   * Business development / introducer commission percentage
   * @format numeric
   */
  bd_fee_percent?: number;
  /**
   * Total BD/introducer commission amount
   * @format numeric
   */
  bd_fee_amount?: number;
  /**
   * FINRA regulatory fees
   * @format numeric
   */
  finra_fee_amount?: number;
  /**
   * Performance fee tier 1 percentage (carry)
   * @format numeric
   */
  performance_fee_tier1_percent?: number;
  /**
   * Threshold for tier 1 performance fee
   * @format numeric
   */
  performance_fee_tier1_threshold?: number;
  /**
   * Performance fee tier 2 percentage (carry)
   * @format numeric
   */
  performance_fee_tier2_percent?: number;
  /**
   * Threshold for tier 2 performance fee
   * @format numeric
   */
  performance_fee_tier2_threshold?: number;
  /**
   * Name of the investment opportunity/deal
   * @format text
   */
  opportunity_name?: string;
  /**
   * Date of subscription contract
   * @format date
   */
  contract_date?: string;
  /**
   * Reference to sourcing contract document
   * @format text
   */
  sourcing_contract_ref?: string;
  /**
   * Foreign key to introducers table if subscription came through introducer
   *
   * Note:
   * This is a Foreign Key to `introducers.id`.<fk table='introducers' column='id'/>
   * @format uuid
   */
  introducer_id?: string;
  /**
   * Foreign key to introductions table linking to specific introduction record
   *
   * Note:
   * This is a Foreign Key to `introductions.id`.<fk table='introductions' column='id'/>
   * @format uuid
   */
  introduction_id?: string;
  /**
   * Amount actually funded by investor (may differ from commitment)
   * @format numeric
   * @default 0
   */
  funded_amount?: number;
  /**
   * Calculated: commitment - funded_amount
   * @format numeric
   */
  outstanding_amount?: number;
  /**
   * Total capital calls issued to this investor
   * @format numeric
   * @default 0
   */
  capital_calls_total?: number;
  /**
   * Total distributions paid to this investor
   * @format numeric
   * @default 0
   */
  distributions_total?: number;
  /**
   * Current net asset value of this subscription position
   * @format numeric
   */
  current_nav?: number;
  /**
   * References the fee plan that was used to populate this subscription fees
   *
   * Note:
   * This is a Foreign Key to `fee_plans.id`.<fk table='fee_plans' column='id'/>
   * @format uuid
   */
  fee_plan_id?: string;
  /**
   * Management fee as percentage (e.g., 2.5 for 2.5%)
   * @format numeric
   */
  management_fee_percent?: number;
  /**
   * Fixed management fee amount if applicable
   * @format numeric
   */
  management_fee_amount?: number;
  /**
   * How often management fees are charged
   * @format text
   */
  management_fee_frequency?: string;
  /**
   * The deal that led to this subscription (for tracking deal flow to committed subscriptions)
   *
   * Note:
   * This is a Foreign Key to `deals.id`.<fk table='deals' column='id'/>
   * @format uuid
   */
  deal_id?: string;
  /**
   * Date when the subscription was formally created/approved
   * @format timestamp with time zone
   * @default "now()"
   */
  subscription_date?: string;
  /**
   * When subscription pack was generated (Stage 6)
   * @format timestamp with time zone
   */
  pack_generated_at?: string;
  /**
   * When subscription pack was sent for signing (Stage 7)
   * @format timestamp with time zone
   */
  pack_sent_at?: string;
  /**
   * When all signatories completed signing (Stage 8)
   * @format timestamp with time zone
   */
  signed_at?: string;
  /**
   * When funds were received (Stage 9)
   * @format timestamp with time zone
   */
  funded_at?: string;
  /**
   * When investment became active (Stage 10)
   * @format timestamp with time zone
   */
  activated_at?: string;
}

/** Participants in a conversation with read state and preferences. */
export interface ConversationParticipants {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * This is a Foreign Key to `conversations.id`.<fk table='conversations' column='id'/>
   * @format uuid
   */
  conversation_id: string;
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  user_id: string;
  /**
   * Role within the conversation (owner/member/viewer).
   * @format public.participant_role_enum
   * @default "member"
   */
  participant_role: "owner" | "member" | "viewer";
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  joined_at: string;
  /**
   * Last time participant read the conversation.
   * @format timestamp with time zone
   */
  last_read_at?: string;
  /** @format timestamp with time zone */
  last_notified_at?: string;
  /**
   * @format boolean
   * @default false
   */
  is_muted: boolean;
  /**
   * @format boolean
   * @default false
   */
  is_pinned: boolean;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  updated_at: string;
}

/** Structured term sheet data for each deal version (draft/published/archived). */
export interface DealFeeStructures {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /**
   * Note:
   * This is a Foreign Key to `deals.id`.<fk table='deals' column='id'/>
   * @format uuid
   */
  deal_id: string;
  /**
   * @format text
   * @default "draft"
   */
  status: string;
  /**
   * @format integer
   * @default 1
   */
  version: number;
  /** @format date */
  term_sheet_date?: string;
  /** @format text */
  transaction_type?: string;
  /** @format text */
  opportunity_summary?: string;
  /** @format text */
  issuer?: string;
  /** @format text */
  vehicle?: string;
  /** @format text */
  exclusive_arranger?: string;
  /** @format text */
  purchaser?: string;
  /** @format text */
  seller?: string;
  /** @format text */
  structure?: string;
  /** @format numeric */
  allocation_up_to?: number;
  /** @format text */
  price_per_share_text?: string;
  /** @format numeric */
  minimum_ticket?: number;
  /** @format numeric */
  maximum_ticket?: number;
  /** @format numeric */
  subscription_fee_percent?: number;
  /** @format numeric */
  management_fee_percent?: number;
  /** @format numeric */
  carried_interest_percent?: number;
  /** @format text */
  legal_counsel?: string;
  /** @format timestamp with time zone */
  interest_confirmation_deadline?: string;
  /** @format text */
  capital_call_timeline?: string;
  /** @format text */
  completion_date_text?: string;
  /** @format text */
  in_principle_approval_text?: string;
  /** @format text */
  subscription_pack_note?: string;
  /** @format text */
  share_certificates_note?: string;
  /** @format text */
  subject_to_change_note?: string;
  /** @format timestamp with time zone */
  validity_date?: string;
  /** @format text */
  term_sheet_html?: string;
  /** @format text */
  term_sheet_attachment_key?: string;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  created_by?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  updated_at: string;
  /** @format timestamp with time zone */
  effective_at?: string;
  /** @format timestamp with time zone */
  published_at?: string;
  /** @format timestamp with time zone */
  archived_at?: string;
  /**
   * Escrow bank name
   * @format text
   */
  wire_bank_name?: string;
  /** @format text */
  wire_bank_address?: string;
  /** @format text */
  wire_account_holder?: string;
  /** @format text */
  wire_escrow_agent?: string;
  /** @format text */
  wire_law_firm_address?: string;
  /**
   * Escrow account IBAN
   * @format text
   */
  wire_iban?: string;
  /**
   * Bank BIC/SWIFT code
   * @format text
   */
  wire_bic?: string;
  /** @format text */
  wire_reference_format?: string;
  /** @format text */
  wire_description_format?: string;
  /** @format text */
  wire_contact_email?: string;
  /**
   * Full legal text for management fee clause
   * @format text
   */
  management_fee_clause?: string;
  /**
   * Full legal text for performance/carried interest clause
   * @format text
   */
  performance_fee_clause?: string;
  /** @format text */
  escrow_fee_text?: string;
  /**
   * HTML for Recital B describing the investment
   * @format text
   */
  recital_b_html?: string;
  /**
   * @format integer
   * @default 10
   */
  payment_deadline_days?: number;
  /**
   * @format integer
   * @default 5
   */
  issue_within_business_days?: number;
  /** @format text */
  arranger_person_name?: string;
  /** @format text */
  arranger_person_title?: string;
  /** @format text */
  issuer_signatory_name?: string;
  /** @format text */
  issuer_signatory_title?: string;
}

export interface TaskTemplates {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /** @format text */
  kind: string;
  /** @format text */
  category: string;
  /** @format text */
  title: string;
  /** @format text */
  description?: string;
  /**
   * @format text
   * @default "medium"
   */
  priority?: string;
  /** @format integer */
  estimated_minutes?: number;
  /** @format integer */
  default_due_days?: number;
  /** @format text[] */
  prerequisite_task_kinds?: string[];
  /** @format text */
  trigger_event?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at?: string;
}

/** Partner organizations (co-investors, syndicates, strategic partners). Follows investors pattern. */
export interface Partners {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /** @format text */
  name: string;
  /** @format text */
  legal_name?: string;
  /** @format text */
  type: string;
  /** @format text */
  partner_type: string;
  /**
   * @format text
   * @default "active"
   */
  status: string;
  /** @format text */
  accreditation_status?: string;
  /** @format text */
  contact_name?: string;
  /** @format text */
  contact_email?: string;
  /** @format text */
  contact_phone?: string;
  /** @format text */
  website?: string;
  /** @format text */
  address_line_1?: string;
  /** @format text */
  address_line_2?: string;
  /** @format text */
  city?: string;
  /** @format text */
  postal_code?: string;
  /** @format text */
  country?: string;
  /** @format numeric */
  typical_investment_min?: number;
  /** @format numeric */
  typical_investment_max?: number;
  /** @format text[] */
  preferred_sectors?: string[];
  /** @format text[] */
  preferred_geographies?: string[];
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  relationship_manager_id?: string;
  /** @format text */
  notes?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at: string;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  created_by?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  updated_at: string;
  /**
   * @format text
   * @default "not_started"
   */
  kyc_status?: string;
  /** @format timestamp with time zone */
  kyc_approved_at?: string;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  kyc_approved_by?: string;
  /** @format timestamp with time zone */
  kyc_expires_at?: string;
  /** @format text */
  kyc_notes?: string;
  /** @format text */
  logo_url?: string;
}

/** Tracks red/yellow/green flags and action items for the entity action center */
export interface EntityFlags {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /**
   * Note:
   * This is a Foreign Key to `vehicles.id`.<fk table='vehicles' column='id'/>
   * @format uuid
   */
  vehicle_id: string;
  /**
   * Type of flag: compliance_issue, missing_documents, expiring_documents, reporting_due, etc.
   * @format public.flag_type
   */
  flag_type:
    | "compliance_issue"
    | "missing_documents"
    | "expiring_documents"
    | "reporting_due"
    | "approval_required"
    | "action_required"
    | "information_needed"
    | "review_required";
  /**
   * Severity level: critical (red), warning (yellow), info (blue), success (green)
   * @format public.flag_severity
   * @default "warning"
   */
  severity: "critical" | "warning" | "info" | "success";
  /** @format text */
  title: string;
  /** @format text */
  description?: string;
  /**
   * Whether this flag has been resolved/cleared
   * @format boolean
   * @default false
   */
  is_resolved?: boolean;
  /** @format timestamp with time zone */
  resolved_at?: string;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  resolved_by?: string;
  /** @format text */
  resolution_notes?: string;
  /**
   * Optional due date for resolving this flag
   * @format date
   */
  due_date?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  updated_at?: string;
  /**
   * @format text
   * @default "open"
   */
  status?: string;
}

export interface ReconciliationMatches {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /**
   * Note:
   * This is a Foreign Key to `bank_transactions.id`.<fk table='bank_transactions' column='id'/>
   * @format uuid
   */
  bank_transaction_id?: string;
  /**
   * Note:
   * This is a Foreign Key to `invoices.id`.<fk table='invoices' column='id'/>
   * @format uuid
   */
  invoice_id?: string;
  /** @format text */
  match_type: string;
  /** @format numeric */
  matched_amount: number;
  /** @format integer */
  match_confidence?: number;
  /** @format text */
  match_reason?: string;
  /**
   * @format text
   * @default "suggested"
   */
  status?: string;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  approved_by?: string;
  /** @format timestamp with time zone */
  approved_at?: string;
  /** @format text */
  notes?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at?: string;
}

export interface Vehicles {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /** @format text */
  name: string;
  /** @format text */
  domicile?: string;
  /**
   * @format text
   * @default "USD"
   */
  currency?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at?: string;
  /** @format public.vehicle_type */
  type?:
    | "fund"
    | "spv"
    | "securitization"
    | "note"
    | "other"
    | "real_estate"
    | "private_equity"
    | "venture_capital";
  /** @format date */
  formation_date?: string;
  /** @format text */
  legal_jurisdiction?: string;
  /** @format text */
  registration_number?: string;
  /** @format text */
  notes?: string;
  /**
   * Reference code like VC101, VC106, IN101, RE1, used for identification
   * @format text
   */
  entity_code?: string;
  /**
   * Platform identifier: VC1SCSP, VC2SCSP, REC, VCL
   * @format text
   */
  platform?: string;
  /**
   * The actual investment name (e.g., CRANS, USDC INDIA, REVOLUT)
   * @format text
   */
  investment_name?: string;
  /**
   * Legacy entity name for tracking history
   * @format text
   */
  former_entity?: string;
  /**
   * Current status of the entity: LIVE, CLOSED, or TBD
   * @format public.entity_status
   * @default "LIVE"
   */
  status?: "LIVE" | "CLOSED" | "TBD";
  /**
   * Type of reporting required for this entity
   * @format public.reporting_type
   * @default "Not Required"
   */
  reporting_type?:
    | "Not Required"
    | "Company Only"
    | "Online only"
    | "Company + Online";
  /**
   * Whether this entity requires regular reporting
   * @format boolean
   * @default false
   */
  requires_reporting?: boolean;
  /** @format text */
  logo_url?: string;
  /** @format text */
  website_url?: string;
  /**
   * Series identifier (e.g., VC203, VC204)
   * @format text
   */
  series_number?: string;
  /**
   * Short name for series (e.g., XAI, Revolut)
   * @format text
   */
  series_short_title?: string;
  /**
   * General Partner legal entity name
   * @format text
   */
  issuer_gp_name?: string;
  /**
   * GP registration/RCC number
   * @format text
   */
  issuer_gp_rcc_number?: string;
  /**
   * Vehicle RCC/registration number
   * @format text
   */
  issuer_rcc_number?: string;
  /**
   * Issuer website URL
   * @format text
   */
  issuer_website?: string;
  /**
   * Regulated entity that manages this vehicle/fund
   *
   * Note:
   * This is a Foreign Key to `arranger_entities.id`.<fk table='arranger_entities' column='id'/>
   * @format uuid
   */
  arranger_entity_id?: string;
}

/** Scheduled publishing and unpublishing of documents */
export interface DocumentPublishingSchedule {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /**
   * Note:
   * This is a Foreign Key to `documents.id`.<fk table='documents' column='id'/>
   * @format uuid
   */
  document_id?: string;
  /** @format timestamp with time zone */
  publish_at: string;
  /** @format timestamp with time zone */
  unpublish_at?: string;
  /**
   * @format boolean
   * @default false
   */
  published?: boolean;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  created_by?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  updated_at?: string;
}

export interface Reconciliations {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /**
   * Note:
   * This is a Foreign Key to `invoices.id`.<fk table='invoices' column='id'/>
   * @format uuid
   */
  invoice_id?: string;
  /**
   * Note:
   * This is a Foreign Key to `bank_transactions.id`.<fk table='bank_transactions' column='id'/>
   * @format uuid
   */
  bank_transaction_id?: string;
  /** @format numeric */
  matched_amount?: number;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  matched_at?: string;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  matched_by?: string;
}

export interface TaskActions {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * This is a Foreign Key to `tasks.id`.<fk table='tasks' column='id'/>
   * @format uuid
   */
  task_id: string;
  /** @format text */
  action_type: string;
  /** @format jsonb */
  action_config?: any;
}

export interface TermSheets {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /**
   * Note:
   * This is a Foreign Key to `deals.id`.<fk table='deals' column='id'/>
   * @format uuid
   */
  deal_id?: string;
  /**
   * Note:
   * This is a Foreign Key to `investors.id`.<fk table='investors' column='id'/>
   * @format uuid
   */
  investor_id?: string;
  /**
   * Note:
   * This is a Foreign Key to `fee_plans.id`.<fk table='fee_plans' column='id'/>
   * @format uuid
   */
  fee_plan_id?: string;
  /** @format numeric */
  price_per_unit?: number;
  /**
   * @format text
   * @default "USD"
   */
  currency?: string;
  /** @format timestamp with time zone */
  valid_until?: string;
  /**
   * @format text
   * @default "draft"
   */
  status?: string;
  /**
   * @format integer
   * @default 1
   */
  version?: number;
  /**
   * Note:
   * This is a Foreign Key to `term_sheets.id`.<fk table='term_sheets' column='id'/>
   * @format uuid
   */
  supersedes_id?: string;
  /**
   * Note:
   * This is a Foreign Key to `documents.id`.<fk table='documents' column='id'/>
   * @format uuid
   */
  doc_id?: string;
  /** @format jsonb */
  terms_data?: any;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  created_by?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at?: string;
}

/** Links multiple users to partner entities. WHO CAN LOGIN as this partner. */
export interface PartnerUsers {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * This is a Foreign Key to `partners.id`.<fk table='partners' column='id'/>
   * @format uuid
   */
  partner_id: string;
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  user_id: string;
  /**
   * @format text
   * @default "member"
   */
  role: string;
  /**
   * @format boolean
   * @default false
   */
  is_primary: boolean;
  /**
   * Whether this user can sign documents (NDA, subscription pack, etc.) on behalf of the partner entity.
   * @format boolean
   * @default false
   */
  can_sign: boolean;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at: string;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  created_by?: string;
}

/** Approval workflow for document publishing */
export interface DocumentApprovals {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /**
   * Note:
   * This is a Foreign Key to `documents.id`.<fk table='documents' column='id'/>
   * @format uuid
   */
  document_id?: string;
  /**
   * @format text
   * @default "pending"
   */
  status?: string;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  requested_by?: string;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  reviewed_by?: string;
  /** @format text */
  review_notes?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  requested_at?: string;
  /** @format timestamp with time zone */
  reviewed_at?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  updated_at?: string;
}

/** Granular permission system for staff users */
export interface StaffPermissions {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  user_id: string;
  /** @format text */
  permission: string;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  granted_by?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  granted_at?: string;
  /** @format timestamp with time zone */
  expires_at?: string;
}

/** Tracks e-signature requests for NDAs, subscription agreements, and other documents */
export interface SignatureRequests {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /**
   * Optional workflow run ID - only populated for n8n generated documents. NULL for manually uploaded documents.
   *
   * Note:
   * This is a Foreign Key to `workflow_runs.id`.<fk table='workflow_runs' column='id'/>
   * @format uuid
   */
  workflow_run_id?: string;
  /**
   * Note:
   * This is a Foreign Key to `investors.id`.<fk table='investors' column='id'/>
   * @format uuid
   */
  investor_id?: string;
  /** @format text */
  signer_email: string;
  /** @format text */
  signer_name: string;
  /** @format text */
  document_type: string;
  /**
   * Cryptographically secure random token for signing URL
   * @format text
   */
  signing_token: string;
  /**
   * Token expiration timestamp (default 7 days from creation)
   * @format timestamp with time zone
   */
  token_expires_at: string;
  /**
   * Source file ID from Google Drive (from n8n workflow)
   * @format text
   */
  google_drive_file_id?: string;
  /** @format text */
  google_drive_url?: string;
  /**
   * Supabase Storage path for unsigned PDF
   * @format text
   */
  unsigned_pdf_path?: string;
  /** @format integer */
  unsigned_pdf_size?: number;
  /**
   * Supabase Storage path for signed PDF with stamped signature
   * @format text
   */
  signed_pdf_path?: string;
  /** @format integer */
  signed_pdf_size?: number;
  /**
   * Base64 encoded signature image from canvas
   * @format text
   */
  signature_data_url?: string;
  /** @format timestamp with time zone */
  signature_timestamp?: string;
  /** @format text */
  signature_ip_address?: string;
  /**
   * Current status: pending, signed, expired, cancelled
   * @format text
   * @default "pending"
   */
  status: string;
  /** @format timestamp with time zone */
  email_sent_at?: string;
  /** @format timestamp with time zone */
  email_opened_at?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  updated_at?: string;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  created_by?: string;
  /**
   * Role of the signer: investor or admin
   * @format text
   */
  signer_role: string;
  /**
   * Position in signature table: party_a (left) or party_b (right)
   * @format text
   */
  signature_position: string;
  /**
   * Resend message ID for tracking email delivery
   * @format text
   */
  email_message_id?: string;
  /**
   * Error message if email send failed
   * @format text
   */
  email_error?: string;
  /**
   * Direct link to subscription for manually uploaded subscription packs
   *
   * Note:
   * This is a Foreign Key to `subscriptions.id`.<fk table='subscriptions' column='id'/>
   * @format uuid
   */
  subscription_id?: string;
  /**
   * Direct link to document being signed
   *
   * Note:
   * This is a Foreign Key to `documents.id`.<fk table='documents' column='id'/>
   * @format uuid
   */
  document_id?: string;
}

/** Frequently asked questions for deals, managed by staff and viewable by investors with active data room access */
export interface DealFaqs {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /**
   * The deal this FAQ belongs to
   *
   * Note:
   * This is a Foreign Key to `deals.id`.<fk table='deals' column='id'/>
   * @format uuid
   */
  deal_id: string;
  /**
   * The FAQ question text
   * @format text
   */
  question: string;
  /**
   * The FAQ answer text
   * @format text
   */
  answer: string;
  /**
   * Order in which FAQs appear (lower numbers first). Auto-assigned based on creation order.
   * @format integer
   * @default 0
   */
  display_order: number;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  updated_at: string;
  /**
   * Staff member who created this FAQ
   *
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  created_by?: string;
  /**
   * Staff member who last updated this FAQ
   *
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  updated_by?: string;
}

export interface InviteLinks {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /**
   * Note:
   * This is a Foreign Key to `deals.id`.<fk table='deals' column='id'/>
   * @format uuid
   */
  deal_id?: string;
  /** @format public.deal_member_role */
  role:
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
    | "commercial_partner_proxy";
  /** @format text */
  token_hash: string;
  /** @format timestamp with time zone */
  expires_at?: string;
  /**
   * @format integer
   * @default 1
   */
  max_uses?: number;
  /**
   * @format integer
   * @default 0
   */
  used_count?: number;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  created_by?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at?: string;
}

export interface Tasks {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  owner_user_id?: string;
  /**
   *
   * Task types:
   * - Onboarding: onboarding_profile, onboarding_bank_details
   * - KYC: kyc_individual
   * - Compliance: compliance_nda, compliance_subscription_agreement, compliance_tax_forms
   * - Deals: deal_nda_signature
   * - Investment: investment_allocation_confirmation, investment_capital_call_response
   * - Signatures: subscription_pack_signature (investor signs), countersignature (staff signs)
   * - Other: other (generic tasks)
   * @format text
   */
  kind?: string;
  /** @format timestamp with time zone */
  due_at?: string;
  /**
   * @format text
   * @default "pending"
   */
  status?: string;
  /** @format text */
  related_entity_type?: string;
  /** @format uuid */
  related_entity_id?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at?: string;
  /**
   * Note:
   * This is a Foreign Key to `investors.id`.<fk table='investors' column='id'/>
   * @format uuid
   */
  owner_investor_id?: string;
  /** @format text */
  category?: string;
  /**
   * @format text
   * @default "Untitled Task"
   */
  title?: string;
  /** @format text */
  description?: string;
  /**
   * @format text
   * @default "medium"
   */
  priority?: string;
  /** @format integer */
  estimated_minutes?: number;
  /** @format text */
  completion_reason?: string;
  /** @format timestamp with time zone */
  completed_at?: string;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  completed_by?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  updated_at?: string;
  /**
   * Timestamp when task was marked as in_progress
   * @format timestamp with time zone
   */
  started_at?: string;
  /**
   * Structured instructions and steps for completing the task
   * @format jsonb
   */
  instructions?: any;
}

/** Underlying companies/startups that deals are about */
export interface Companies {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /** @format text */
  name: string;
  /** @format text */
  legal_name?: string;
  /** @format text */
  ticker_symbol?: string;
  /** @format text */
  sector?: string;
  /** @format text */
  industry?: string;
  /** @format text */
  sub_industry?: string;
  /** @format text */
  company_stage?: string;
  /** @format text */
  headquarters_city?: string;
  /** @format text */
  headquarters_country?: string;
  /** @format text */
  description?: string;
  /** @format text */
  website?: string;
  /** @format text */
  logo_url?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at: string;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  created_by?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  updated_at: string;
}

export interface InvestorTerms {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /**
   * Note:
   * This is a Foreign Key to `deals.id`.<fk table='deals' column='id'/>
   * @format uuid
   */
  deal_id?: string;
  /**
   * Note:
   * This is a Foreign Key to `investors.id`.<fk table='investors' column='id'/>
   * @format uuid
   */
  investor_id?: string;
  /**
   * Note:
   * This is a Foreign Key to `fee_plans.id`.<fk table='fee_plans' column='id'/>
   * @format uuid
   */
  selected_fee_plan_id?: string;
  /** @format jsonb */
  overrides?: any;
  /**
   * @format text
   * @default "active"
   */
  status?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at?: string;
  /**
   * Note:
   * This is a Foreign Key to `vehicles.id`.<fk table='vehicles' column='id'/>
   * @format uuid
   */
  vehicle_id?: string;
  /**
   * Note:
   * This is a Foreign Key to `fee_plans.id`.<fk table='fee_plans' column='id'/>
   * @format uuid
   */
  base_fee_plan_id?: string;
  /** @format text */
  justification?: string;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  approved_by?: string;
  /** @format timestamp with time zone */
  approved_at?: string;
  /**
   * @format date
   * @default "CURRENT_DATE"
   */
  effective_from: string;
  /** @format date */
  effective_until?: string;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  created_by?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  updated_at: string;
}

export interface Profiles {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   */
  id: string;
  /**
   * @format public.user_role
   * @default "investor"
   */
  role:
    | "investor"
    | "staff_admin"
    | "staff_ops"
    | "staff_rm"
    | "arranger"
    | "introducer"
    | "partner"
    | "commercial_partner"
    | "lawyer"
    | "ceo";
  /** @format text */
  display_name?: string;
  /** @format public.citext */
  email?: string;
  /** @format text */
  title?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at?: string;
  /**
   * URL to profile avatar image in storage bucket
   * @format text
   */
  avatar_url?: string;
  /**
   * User phone number (mainly for staff)
   * @format text
   */
  phone?: string;
  /**
   * Office location (mainly for staff)
   * @format text
   */
  office_location?: string;
  /**
   * User biography or description
   * @format text
   */
  bio?: string;
  /**
   * Timestamp of last login
   * @format timestamp with time zone
   */
  last_login_at?: string;
  /**
   * Timestamp of last profile update
   * @format timestamp with time zone
   * @default "now()"
   */
  updated_at?: string;
  /**
   * Tracks whether user has seen the intro video on first login. Once true, never shows again.
   * @format boolean
   * @default false
   */
  has_seen_intro_video?: boolean;
  /**
   * Tracks if user has set password after invitation. False for invited users until they set password.
   * @format boolean
   * @default false
   */
  password_set?: boolean;
  /**
   * Soft delete timestamp - null means active, populated means deactivated
   * @format timestamp with time zone
   */
  deleted_at?: string;
}

/** Personnel tracking for law firms - partners, associates, etc. */
export interface LawyerMembers {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /**
   * Note:
   * This is a Foreign Key to `lawyers.id`.<fk table='lawyers' column='id'/>
   * @format uuid
   */
  lawyer_id: string;
  /** @format text */
  full_name: string;
  /** @format text */
  role: string;
  /** @format text */
  role_title?: string;
  /** @format text */
  email?: string;
  /** @format text */
  phone?: string;
  /** @format text */
  bar_number?: string;
  /** @format text */
  bar_jurisdiction?: string;
  /** @format text */
  residential_street?: string;
  /** @format text */
  residential_city?: string;
  /** @format text */
  residential_state?: string;
  /** @format text */
  residential_postal_code?: string;
  /** @format text */
  residential_country?: string;
  /** @format text */
  nationality?: string;
  /** @format text */
  id_type?: string;
  /** @format text */
  id_number?: string;
  /** @format date */
  id_expiry_date?: string;
  /**
   * @format boolean
   * @default true
   */
  is_active: boolean;
  /** @format date */
  effective_from?: string;
  /** @format date */
  effective_to?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at: string;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  created_by?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  updated_at: string;
  /**
   * @format boolean
   * @default false
   */
  is_signatory: boolean;
}

export interface IntroducerCommissions {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /**
   * Note:
   * This is a Foreign Key to `introducers.id`.<fk table='introducers' column='id'/>
   * @format uuid
   */
  introducer_id?: string;
  /**
   * Note:
   * This is a Foreign Key to `deals.id`.<fk table='deals' column='id'/>
   * @format uuid
   */
  deal_id?: string;
  /**
   * Note:
   * This is a Foreign Key to `investors.id`.<fk table='investors' column='id'/>
   * @format uuid
   */
  investor_id?: string;
  /** @format text */
  basis_type?: string;
  /** @format integer */
  rate_bps: number;
  /** @format numeric */
  accrual_amount: number;
  /**
   * @format text
   * @default "USD"
   */
  currency?: string;
  /**
   * @format text
   * @default "accrued"
   */
  status?: string;
  /** @format uuid */
  invoice_id?: string;
  /** @format timestamp with time zone */
  paid_at?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at?: string;
  /**
   * Note:
   * This is a Foreign Key to `introductions.id`.<fk table='introductions' column='id'/>
   * @format uuid
   */
  introduction_id?: string;
  /** @format numeric */
  base_amount?: number;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  approved_by?: string;
  /** @format timestamp with time zone */
  approved_at?: string;
  /** @format date */
  payment_due_date?: string;
  /** @format text */
  payment_reference?: string;
  /** @format text */
  notes?: string;
}

export interface InvestorUsers {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * This is a Foreign Key to `investors.id`.<fk table='investors' column='id'/>
   * @format uuid
   */
  investor_id: string;
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  user_id: string;
  /**
   * @format text
   * @default "member"
   */
  role: string;
  /**
   * @format boolean
   * @default false
   */
  is_primary: boolean;
  /**
   * @format boolean
   * @default false
   */
  can_sign: boolean;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at: string;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  created_by?: string;
}

export interface EntityDirectors {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /**
   * Note:
   * This is a Foreign Key to `vehicles.id`.<fk table='vehicles' column='id'/>
   * @format uuid
   */
  vehicle_id?: string;
  /** @format text */
  full_name: string;
  /** @format text */
  role?: string;
  /** @format text */
  email?: string;
  /**
   * @format date
   * @default "CURRENT_DATE"
   */
  effective_from?: string;
  /** @format date */
  effective_to?: string;
  /** @format text */
  notes?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at?: string;
}

export interface WorkflowRuns {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /**
   * Note:
   * This is a Foreign Key to `workflows.id`.<fk table='workflows' column='id'/>
   * @format uuid
   */
  workflow_id?: string;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  triggered_by?: string;
  /** @format jsonb */
  input_params?: any;
  /**
   * @format text
   * @default "queued"
   */
  status?: string;
  /** @format uuid */
  result_doc_id?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  updated_at?: string;
  /** @format text */
  workflow_key?: string;
  /** @format text */
  entity_type?: string;
  /** @format uuid */
  entity_id?: string;
  /** @format jsonb */
  output_data?: any;
  /** @format text */
  error_message?: string;
  /** @format text */
  webhook_signature?: string;
  /** @format text */
  idempotency_token?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  queued_at?: string;
  /** @format timestamp with time zone */
  started_at?: string;
  /** @format timestamp with time zone */
  completed_at?: string;
  /** @format integer */
  duration_ms?: number;
  /** @format uuid[] */
  created_tasks?: string[];
  /**
   * Lock flag for progressive signing. TRUE when a signature is being processed, NULL when available. Used to prevent race conditions.
   * @format boolean
   */
  signing_in_progress?: boolean;
  /**
   * References the signature_request that currently holds the lock. NULL when unlocked. FK constraint ensures referential integrity.
   *
   * Note:
   * This is a Foreign Key to `signature_requests.id`.<fk table='signature_requests' column='id'/>
   * @format uuid
   */
  signing_locked_by?: string;
  /**
   * Timestamp when the lock was acquired. Used for detecting stale locks and debugging race conditions.
   * @format timestamp with time zone
   */
  signing_locked_at?: string;
}

/** Personnel/compliance tracking for commercial partner entities. Directors, UBOs, signatories. */
export interface CommercialPartnerMembers {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /**
   * Note:
   * This is a Foreign Key to `commercial_partners.id`.<fk table='commercial_partners' column='id'/>
   * @format uuid
   */
  commercial_partner_id: string;
  /** @format text */
  full_name: string;
  /** @format text */
  role: string;
  /** @format text */
  role_title?: string;
  /** @format text */
  email?: string;
  /** @format text */
  phone?: string;
  /** @format text */
  residential_street?: string;
  /** @format text */
  residential_city?: string;
  /** @format text */
  residential_state?: string;
  /** @format text */
  residential_postal_code?: string;
  /** @format text */
  residential_country?: string;
  /** @format text */
  nationality?: string;
  /** @format text */
  id_type?: string;
  /** @format text */
  id_number?: string;
  /** @format date */
  id_expiry_date?: string;
  /** @format numeric */
  ownership_percentage?: number;
  /**
   * @format boolean
   * @default false
   */
  is_beneficial_owner: boolean;
  /**
   * @format boolean
   * @default false
   */
  is_signatory: boolean;
  /**
   * @format boolean
   * @default true
   */
  is_active: boolean;
  /** @format date */
  effective_from?: string;
  /** @format date */
  effective_to?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at: string;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  created_by?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  updated_at: string;
}

/** Per-investor capital call payment tracking for reconciliation */
export interface CapitalCallItems {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /**
   * Note:
   * This is a Foreign Key to `capital_calls.id`.<fk table='capital_calls' column='id'/>
   * @format uuid
   */
  capital_call_id: string;
  /**
   * Note:
   * This is a Foreign Key to `subscriptions.id`.<fk table='subscriptions' column='id'/>
   * @format uuid
   */
  subscription_id: string;
  /**
   * Note:
   * This is a Foreign Key to `investors.id`.<fk table='investors' column='id'/>
   * @format uuid
   */
  investor_id: string;
  /**
   * Amount this investor owes for this capital call
   * @format numeric
   */
  called_amount: number;
  /**
   * Amount paid so far (sum of matched bank transactions)
   * @format numeric
   * @default 0
   */
  paid_amount: number;
  /**
   * Remaining amount owed (auto-calculated)
   * @format numeric
   */
  balance_due?: number;
  /** @format date */
  due_date: string;
  /** @format date */
  paid_date?: string;
  /**
   * @format text
   * @default "pending"
   */
  status?: string;
  /**
   * Array of bank_transactions.id that were matched to this item
   * @format uuid[]
   */
  bank_transaction_ids?: string[];
  /** @format text */
  notes?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  updated_at?: string;
}

export interface SuggestedMatches {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /**
   * Note:
   * This is a Foreign Key to `bank_transactions.id`.<fk table='bank_transactions' column='id'/>
   * @format uuid
   */
  bank_transaction_id?: string;
  /**
   * Note:
   * This is a Foreign Key to `invoices.id`.<fk table='invoices' column='id'/>
   * @format uuid
   */
  invoice_id?: string;
  /** @format integer */
  confidence: number;
  /** @format text */
  match_reason: string;
  /** @format numeric */
  amount_difference?: number;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at?: string;
  /**
   * Match suggestion for subscription-based reconciliation
   *
   * Note:
   * This is a Foreign Key to `subscriptions.id`.<fk table='subscriptions' column='id'/>
   * @format uuid
   */
  subscription_id?: string;
}

/** Investor expressions of interest captured prior to formal commitments. */
export interface InvestorDealInterest {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /**
   * Note:
   * This is a Foreign Key to `deals.id`.<fk table='deals' column='id'/>
   * @format uuid
   */
  deal_id: string;
  /**
   * Note:
   * This is a Foreign Key to `investors.id`.<fk table='investors' column='id'/>
   * @format uuid
   */
  investor_id: string;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  created_by?: string;
  /** @format numeric */
  indicative_amount?: number;
  /** @format text */
  indicative_currency?: string;
  /** @format text */
  notes?: string;
  /**
   * @format text
   * @default "pending_review"
   */
  status: string;
  /**
   * Note:
   * This is a Foreign Key to `approvals.id`.<fk table='approvals' column='id'/>
   * @format uuid
   */
  approval_id?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  submitted_at: string;
  /** @format timestamp with time zone */
  approved_at?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  updated_at: string;
  /**
   * True if this interest was expressed for a closed deal (future similar opportunities). Post-close interests are auto-approved and do not trigger the approval workflow.
   * @format boolean
   * @default false
   */
  is_post_close: boolean;
}

/** Tracks recurring fee schedules for automatic generation */
export interface FeeSchedules {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /**
   * Note:
   * This is a Foreign Key to `fee_components.id`.<fk table='fee_components' column='id'/>
   * @format uuid
   */
  fee_component_id: string;
  /**
   * Note:
   * This is a Foreign Key to `investors.id`.<fk table='investors' column='id'/>
   * @format uuid
   */
  investor_id: string;
  /**
   * Note:
   * This is a Foreign Key to `deals.id`.<fk table='deals' column='id'/>
   * @format uuid
   */
  deal_id?: string;
  /**
   * Note:
   * This is a Foreign Key to `subscriptions.id`.<fk table='subscriptions' column='id'/>
   * @format uuid
   */
  allocation_id?: string;
  /** @format date */
  start_date: string;
  /** @format date */
  end_date?: string;
  /**
   * Total number of fee periods (e.g., 3 for "3 years")
   * @format integer
   */
  total_periods: number;
  /**
   * Number of periods already invoiced
   * @format integer
   * @default 0
   */
  completed_periods?: number;
  /**
   * Date when next fee event should be generated
   * @format date
   */
  next_due_date?: string;
  /**
   * @format text
   * @default "active"
   */
  status?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  updated_at?: string;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  created_by?: string;
}

export interface FeeComponents {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /**
   * Note:
   * This is a Foreign Key to `fee_plans.id`.<fk table='fee_plans' column='id'/>
   * @format uuid
   */
  fee_plan_id?: string;
  /** @format public.fee_component_kind_enum */
  kind:
    | "subscription"
    | "management"
    | "performance"
    | "spread_markup"
    | "flat"
    | "other"
    | "bd_fee"
    | "finra_fee";
  /** @format public.fee_calc_method_enum */
  calc_method?:
    | "percent_of_investment"
    | "percent_per_annum"
    | "percent_of_profit"
    | "per_unit_spread"
    | "fixed"
    | "percent_of_commitment"
    | "percent_of_nav"
    | "fixed_amount";
  /** @format integer */
  rate_bps?: number;
  /** @format numeric */
  flat_amount?: number;
  /**
   * @format public.fee_frequency_enum
   * @default "one_time"
   */
  frequency?:
    | "one_time"
    | "annual"
    | "quarterly"
    | "monthly"
    | "on_exit"
    | "on_event";
  /** @format integer */
  hurdle_rate_bps?: number;
  /** @format text */
  notes?: string;
  /** @format text */
  base_calculation?: string;
  /**
   * @format boolean
   * @default false
   */
  has_catchup: boolean;
  /** @format integer */
  catchup_rate_bps?: number;
  /**
   * @format boolean
   * @default false
   */
  has_high_water_mark: boolean;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  updated_at: string;
  /**
   * Number of periods the fee applies (e.g., 3 for "3 years"). NULL = indefinite/life of vehicle
   * @format integer
   */
  duration_periods?: number;
  /**
   * Unit for duration_periods: years, months, quarters, or life_of_vehicle
   * @format text
   */
  duration_unit?: string;
  /**
   * upfront = all periods paid at once, recurring = invoiced per period, on_demand = manual
   * @format text
   * @default "recurring"
   */
  payment_schedule?: string;
  /**
   * Threshold for this tier (e.g., 10.00 for "10x return"). NULL = no threshold
   * @format numeric
   */
  tier_threshold_multiplier?: number;
  /**
   * Link to next tier fee component for tiered performance fees
   *
   * Note:
   * This is a Foreign Key to `fee_components.id`.<fk table='fee_components' column='id'/>
   * @format uuid
   */
  next_tier_component_id?: string;
}

export interface InvoiceLines {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /**
   * Note:
   * This is a Foreign Key to `invoices.id`.<fk table='invoices' column='id'/>
   * @format uuid
   */
  invoice_id?: string;
  /** @format text */
  kind?: string;
  /** @format text */
  description?: string;
  /** @format numeric */
  quantity?: number;
  /** @format numeric */
  unit_price?: number;
  /** @format numeric */
  amount: number;
  /**
   * Note:
   * This is a Foreign Key to `fee_events.id`.<fk table='fee_events' column='id'/>
   * @format uuid
   */
  fee_event_id?: string;
}

export interface FeePlans {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /**
   * Note:
   * This is a Foreign Key to `deals.id`.<fk table='deals' column='id'/>
   * @format uuid
   */
  deal_id?: string;
  /** @format text */
  name: string;
  /** @format text */
  description?: string;
  /**
   * @format boolean
   * @default false
   */
  is_default?: boolean;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at?: string;
  /**
   * Note:
   * This is a Foreign Key to `vehicles.id`.<fk table='vehicles' column='id'/>
   * @format uuid
   */
  vehicle_id?: string;
  /**
   * @format boolean
   * @default true
   */
  is_active: boolean;
  /**
   * @format date
   * @default "CURRENT_DATE"
   */
  effective_from: string;
  /** @format date */
  effective_until?: string;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  created_by?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  updated_at: string;
}

export interface WorkflowRunLogs {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /**
   * Note:
   * This is a Foreign Key to `workflow_runs.id`.<fk table='workflow_runs' column='id'/>
   * @format uuid
   */
  workflow_run_id: string;
  /** @format text */
  step_name: string;
  /** @format text */
  step_status?: string;
  /**
   * @format text
   * @default "info"
   */
  log_level?: string;
  /** @format text */
  message?: string;
  /** @format jsonb */
  metadata?: any;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at?: string;
}

/** Captures analytics events for the deal workflow (interest approvals, NDA completion, subscription funding, etc.). */
export interface DealActivityEvents {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /**
   * Note:
   * This is a Foreign Key to `deals.id`.<fk table='deals' column='id'/>
   * @format uuid
   */
  deal_id: string;
  /**
   * Note:
   * This is a Foreign Key to `investors.id`.<fk table='investors' column='id'/>
   * @format uuid
   */
  investor_id?: string;
  /** @format text */
  event_type: string;
  /** @format jsonb */
  payload: any;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  occurred_at: string;
}

export interface FeeEvents {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /**
   * Note:
   * This is a Foreign Key to `deals.id`.<fk table='deals' column='id'/>
   * @format uuid
   */
  deal_id?: string;
  /**
   * Note:
   * This is a Foreign Key to `investors.id`.<fk table='investors' column='id'/>
   * @format uuid
   */
  investor_id?: string;
  /**
   * Note:
   * This is a Foreign Key to `fee_components.id`.<fk table='fee_components' column='id'/>
   * @format uuid
   */
  fee_component_id?: string;
  /** @format date */
  event_date: string;
  /** @format numeric */
  base_amount?: number;
  /** @format numeric */
  computed_amount: number;
  /**
   * @format text
   * @default "USD"
   */
  currency?: string;
  /** @format text */
  source_ref?: string;
  /**
   * @format public.fee_event_status_enum
   * @default "accrued"
   */
  status?:
    | "accrued"
    | "invoiced"
    | "voided"
    | "paid"
    | "waived"
    | "disputed"
    | "cancelled";
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at?: string;
  /** @format public.fee_component_kind_enum */
  fee_type?:
    | "subscription"
    | "management"
    | "performance"
    | "spread_markup"
    | "flat"
    | "other"
    | "bd_fee"
    | "finra_fee";
  /**
   * Polymorphic reference: stores either allocations.id OR subscriptions.id. No FK constraint to allow both uses. Check allocation_type column to determine which table is referenced.
   * @format uuid
   */
  allocation_id?: string;
  /** @format integer */
  rate_bps?: number;
  /**
   * Note:
   * This is a Foreign Key to `invoices.id`.<fk table='invoices' column='id'/>
   * @format uuid
   */
  invoice_id?: string;
  /**
   * Note:
   * This is a Foreign Key to `payments.id`.<fk table='payments' column='id'/>
   * @format uuid
   */
  payment_id?: string;
  /** @format timestamp with time zone */
  processed_at?: string;
  /** @format text */
  notes?: string;
  /** @format date */
  period_start_date?: string;
  /** @format date */
  period_end_date?: string;
  /**
   * Indicates whether allocation_id references allocations or subscriptions table. Used for polymorphic relationship tracking.
   * @format text
   */
  allocation_type?: string;
}

/** Links investors to vehicles (funds/SPVs). Multiple subscriptions per investor-vehicle pair are supported. Subscriptions are fetched via JOIN on (vehicle_id, investor_id), not via subscription_id FK. */
export interface EntityInvestors {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /**
   * Note:
   * This is a Foreign Key to `vehicles.id`.<fk table='vehicles' column='id'/>
   * @format uuid
   */
  vehicle_id?: string;
  /**
   * Note:
   * This is a Foreign Key to `investors.id`.<fk table='investors' column='id'/>
   * @format uuid
   */
  investor_id?: string;
  /** @format text */
  relationship_role?: string;
  /**
   * @format text
   * @default "pending"
   */
  allocation_status?: string;
  /** @format timestamp with time zone */
  invite_sent_at?: string;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  created_by?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  updated_at?: string;
  /** @format text */
  notes?: string;
}

export interface Positions {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /**
   * Note:
   * This is a Foreign Key to `investors.id`.<fk table='investors' column='id'/>
   * @format uuid
   */
  investor_id?: string;
  /**
   * Note:
   * This is a Foreign Key to `vehicles.id`.<fk table='vehicles' column='id'/>
   * @format uuid
   */
  vehicle_id?: string;
  /** @format numeric */
  units?: number;
  /** @format numeric */
  cost_basis?: number;
  /** @format numeric */
  last_nav?: number;
  /** @format date */
  as_of_date?: string;
}

export interface Approvals {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /** @format text */
  entity_type?: string;
  /** @format uuid */
  entity_id?: string;
  /** @format text */
  action?: string;
  /**
   * @format text
   * @default "pending"
   */
  status?: string;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  requested_by?: string;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  assigned_to?: string;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  approved_by?: string;
  /** @format timestamp with time zone */
  approved_at?: string;
  /** @format text */
  notes?: string;
  /**
   * @format text
   * @default "medium"
   */
  priority?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at?: string;
  /** @format jsonb */
  entity_metadata?: any;
  /** @format text */
  request_reason?: string;
  /** @format text */
  rejection_reason?: string;
  /** @format timestamp with time zone */
  sla_breach_at?: string;
  /** @format timestamp with time zone */
  sla_paused_at?: string;
  /** @format timestamp with time zone */
  sla_resumed_at?: string;
  /** @format numeric */
  actual_processing_time_hours?: number;
  /**
   * @format boolean
   * @default false
   */
  requires_secondary_approval?: boolean;
  /** @format text */
  secondary_approver_role?: string;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  secondary_approved_by?: string;
  /** @format timestamp with time zone */
  secondary_approved_at?: string;
  /**
   * Note:
   * This is a Foreign Key to `deals.id`.<fk table='deals' column='id'/>
   * @format uuid
   */
  related_deal_id?: string;
  /**
   * Note:
   * This is a Foreign Key to `investors.id`.<fk table='investors' column='id'/>
   * @format uuid
   */
  related_investor_id?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  updated_at?: string;
  /** @format timestamp with time zone */
  resolved_at?: string;
}

/** Commercial partner placement agreements for commission structures */
export interface PlacementAgreements {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /**
   * Note:
   * This is a Foreign Key to `commercial_partners.id`.<fk table='commercial_partners' column='id'/>
   * @format uuid
   */
  commercial_partner_id: string;
  /**
   * @format text
   * @default "standard"
   */
  agreement_type: string;
  /**
   * Note:
   * This is a Foreign Key to `documents.id`.<fk table='documents' column='id'/>
   * @format uuid
   */
  agreement_document_id?: string;
  /** @format date */
  signed_date?: string;
  /** @format date */
  effective_date?: string;
  /** @format date */
  expiry_date?: string;
  /**
   * @format integer
   * @default 0
   */
  default_commission_bps: number;
  /** @format numeric */
  commission_cap_amount?: number;
  /** @format text */
  payment_terms?: string;
  /** @format text */
  territory?: string;
  /** @format text[] */
  deal_types?: string[];
  /** @format text */
  exclusivity_level?: string;
  /**
   * @format text
   * @default "draft"
   */
  status: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at: string;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  created_by?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  updated_at: string;
}

export interface EntityEvents {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /**
   * Note:
   * This is a Foreign Key to `vehicles.id`.<fk table='vehicles' column='id'/>
   * @format uuid
   */
  vehicle_id?: string;
  /** @format text */
  event_type: string;
  /** @format text */
  description?: string;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  changed_by?: string;
  /** @format jsonb */
  payload?: any;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at?: string;
}

/** Tracks KYC document submissions from investors and their approval status */
export interface KycSubmissions {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /**
   * The investor that owns this submission. Always required.
   *
   * Note:
   * This is a Foreign Key to `investors.id`.<fk table='investors' column='id'/>
   * @format uuid
   */
  investor_id: string;
  /**
   * Document type identifier. Can be predefined type (government_id, proof_of_address, etc.) or custom type. When custom_label is set, that label should be displayed instead.
   * @format text
   */
  document_type: string;
  /**
   * Note:
   * This is a Foreign Key to `documents.id`.<fk table='documents' column='id'/>
   * @format uuid
   */
  document_id?: string;
  /**
   * Approval status: pending, under_review, approved, rejected, expired
   * @format text
   * @default "pending"
   */
  status: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  submitted_at: string;
  /** @format timestamp with time zone */
  reviewed_at?: string;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  reviewed_by?: string;
  /** @format text */
  rejection_reason?: string;
  /** @format date */
  expiry_date?: string;
  /**
   * Additional metadata like file_size, mime_type, original_filename
   * @format jsonb
   */
  metadata?: any;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  updated_at: string;
  /**
   * Version number of this submission (increments with each re-upload for same document type)
   * @format integer
   * @default 1
   */
  version: number;
  /**
   * Reference to the previous version of this submission (if this is a re-upload)
   *
   * Note:
   * This is a Foreign Key to `kyc_submissions.id`.<fk table='kyc_submissions' column='id'/>
   * @format uuid
   */
  previous_submission_id?: string;
  /**
   * Optional. If set, this KYC is for a specific counterparty entity owned by the investor.
   *
   * Note:
   * This is a Foreign Key to `investor_counterparty.id`.<fk table='investor_counterparty' column='id'/>
   * @format uuid
   */
  counterparty_entity_id?: string;
  /**
   * User-provided label for custom document types. When set, this overrides the display of document_type for user-facing labels.
   * @format text
   */
  custom_label?: string;
  /**
   * Links KYC doc to specific member of entity-type investor
   *
   * Note:
   * This is a Foreign Key to `investor_members.id`.<fk table='investor_members' column='id'/>
   * @format uuid
   */
  investor_member_id?: string;
  /**
   * Links KYC doc to specific member of counterparty entity
   *
   * Note:
   * This is a Foreign Key to `counterparty_entity_members.id`.<fk table='counterparty_entity_members' column='id'/>
   * @format uuid
   */
  counterparty_member_id?: string;
}

/** Stores investor-related entities (Trust, LLC, etc.) used for subscriptions */
export interface InvestorCounterparty {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /**
   * Note:
   * This is a Foreign Key to `investors.id`.<fk table='investors' column='id'/>
   * @format uuid
   */
  investor_id: string;
  /** @format text */
  entity_type: string;
  /** @format text */
  legal_name: string;
  /** @format text */
  registration_number?: string;
  /** @format text */
  jurisdiction?: string;
  /** @format text */
  tax_id?: string;
  /** @format date */
  formation_date?: string;
  /** @format jsonb */
  registered_address?: any;
  /** @format text */
  representative_name?: string;
  /** @format text */
  representative_title?: string;
  /** @format text */
  representative_email?: string;
  /** @format text */
  representative_phone?: string;
  /**
   * @format text
   * @default "pending"
   */
  kyc_status?: string;
  /** @format timestamp with time zone */
  kyc_completed_at?: string;
  /** @format date */
  kyc_expiry_date?: string;
  /** @format text */
  kyc_notes?: string;
  /** @format text */
  notes?: string;
  /**
   * @format boolean
   * @default true
   */
  is_active?: boolean;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  created_by?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  updated_at?: string;
}

/** Message-level read receipts for compliance and realtime indicators. */
export interface MessageReads {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * This is a Foreign Key to `messages.id`.<fk table='messages' column='id'/>
   * @format uuid
   */
  message_id: string;
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  user_id: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  read_at: string;
}

/** Historical valuation data for companies */
export interface CompanyValuations {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /**
   * Note:
   * This is a Foreign Key to `companies.id`.<fk table='companies' column='id'/>
   * @format uuid
   */
  company_id: string;
  /** @format date */
  valuation_date: string;
  /** @format numeric */
  valuation_amount: number;
  /**
   * @format text
   * @default "USD"
   */
  valuation_currency: string;
  /**
   * @format text
   * @default "post_money"
   */
  valuation_type: string;
  /** @format text */
  source?: string;
  /** @format text */
  funding_round?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at: string;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  created_by?: string;
}

/** Tracks per-investor holdings/allocations for each deal once subscriptions are confirmed. */
export interface InvestorDealHoldings {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /**
   * Note:
   * This is a Foreign Key to `investors.id`.<fk table='investors' column='id'/>
   * @format uuid
   */
  investor_id: string;
  /**
   * Note:
   * This is a Foreign Key to `deals.id`.<fk table='deals' column='id'/>
   * @format uuid
   */
  deal_id: string;
  /**
   * Note:
   * This is a Foreign Key to `deal_subscription_submissions.id`.<fk table='deal_subscription_submissions' column='id'/>
   * @format uuid
   */
  subscription_submission_id?: string;
  /**
   * Note:
   * This is a Foreign Key to `approvals.id`.<fk table='approvals' column='id'/>
   * @format uuid
   */
  approval_id?: string;
  /**
   * @format text
   * @default "pending_funding"
   */
  status: string;
  /** @format numeric */
  subscribed_amount: number;
  /**
   * @format text
   * @default "USD"
   */
  currency: string;
  /** @format date */
  effective_date?: string;
  /** @format timestamp with time zone */
  funding_due_at?: string;
  /** @format timestamp with time zone */
  funded_at?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  updated_at: string;
}

/** Tracks SHA256 fingerprints of imported subscriptions for idempotency. Fingerprint = hash(investor_id:vehicle_id:commitment:effective_date). Allows safe re-runs of migration scripts - duplicates are skipped, legitimate follow-on investments are imported. */
export interface SubscriptionFingerprints {
  /**
   * SHA256 hash of investor_id:vehicle_id:commitment:effective_date. Used to detect exact duplicate imports.
   *
   * Note:
   * This is a Primary Key.<pk/>
   * @format text
   */
  fingerprint: string;
  /**
   * Reference to the subscription this fingerprint represents. Cascades on delete.
   *
   * Note:
   * This is a Foreign Key to `subscriptions.id`.<fk table='subscriptions' column='id'/>
   * @format uuid
   */
  subscription_id: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at?: string;
}

/** Post-NDA subscription submissions awaiting staff approval. */
export interface DealSubscriptionSubmissions {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /**
   * Note:
   * This is a Foreign Key to `deals.id`.<fk table='deals' column='id'/>
   * @format uuid
   */
  deal_id: string;
  /**
   * Note:
   * This is a Foreign Key to `investors.id`.<fk table='investors' column='id'/>
   * @format uuid
   */
  investor_id: string;
  /** @format jsonb */
  payload_json: any;
  /**
   * @format text
   * @default "pending_review"
   */
  status: string;
  /**
   * Note:
   * This is a Foreign Key to `approvals.id`.<fk table='approvals' column='id'/>
   * @format uuid
   */
  approval_id?: string;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  created_by?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  submitted_at: string;
  /** @format timestamp with time zone */
  decided_at?: string;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  decided_by?: string;
  /**
   * Staff member who approved the subscription
   *
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  approved_by?: string;
  /**
   * Timestamp when subscription was approved
   * @format timestamp with time zone
   */
  approved_at?: string;
  /**
   * Staff member who rejected the subscription
   *
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  rejected_by?: string;
  /**
   * Timestamp when subscription was rejected
   * @format timestamp with time zone
   */
  rejected_at?: string;
  /**
   * Reason for rejection
   * @format text
   */
  rejection_reason?: string;
  /**
   * Whether investor is subscribing personally or through a counterparty entity
   * @format text
   * @default "personal"
   */
  subscription_type?: string;
  /**
   * The counterparty entity used for subscription (if subscription_type = entity)
   *
   * Note:
   * This is a Foreign Key to `investor_counterparty.id`.<fk table='investor_counterparty' column='id'/>
   * @format uuid
   */
  counterparty_entity_id?: string;
  /**
   * Links to the formal subscription record created when this submission is approved
   *
   * Note:
   * This is a Foreign Key to `subscriptions.id`.<fk table='subscriptions' column='id'/>
   * @format uuid
   */
  formal_subscription_id?: string;
}

/** Personnel/compliance tracking for partner entities. Directors, UBOs, signatories. */
export interface PartnerMembers {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /**
   * Note:
   * This is a Foreign Key to `partners.id`.<fk table='partners' column='id'/>
   * @format uuid
   */
  partner_id: string;
  /** @format text */
  full_name: string;
  /** @format text */
  role: string;
  /** @format text */
  role_title?: string;
  /** @format text */
  email?: string;
  /** @format text */
  phone?: string;
  /** @format text */
  residential_street?: string;
  /** @format text */
  residential_city?: string;
  /** @format text */
  residential_state?: string;
  /** @format text */
  residential_postal_code?: string;
  /** @format text */
  residential_country?: string;
  /** @format text */
  nationality?: string;
  /** @format text */
  id_type?: string;
  /** @format text */
  id_number?: string;
  /** @format date */
  id_expiry_date?: string;
  /** @format numeric */
  ownership_percentage?: number;
  /**
   * @format boolean
   * @default false
   */
  is_beneficial_owner: boolean;
  /**
   * @format boolean
   * @default false
   */
  is_signatory: boolean;
  /**
   * @format boolean
   * @default true
   */
  is_active: boolean;
  /** @format date */
  effective_from?: string;
  /** @format date */
  effective_to?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at: string;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  created_by?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  updated_at: string;
}

export interface Invoices {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /**
   * Note:
   * This is a Foreign Key to `investors.id`.<fk table='investors' column='id'/>
   * @format uuid
   */
  investor_id?: string;
  /**
   * Note:
   * This is a Foreign Key to `deals.id`.<fk table='deals' column='id'/>
   * @format uuid
   */
  deal_id?: string;
  /** @format date */
  due_date?: string;
  /**
   * @format text
   * @default "USD"
   */
  currency?: string;
  /** @format numeric */
  subtotal?: number;
  /** @format numeric */
  tax?: number;
  /** @format numeric */
  total?: number;
  /**
   * @format public.invoice_status_enum
   * @default "draft"
   */
  status?:
    | "draft"
    | "sent"
    | "paid"
    | "partially_paid"
    | "cancelled"
    | "overdue"
    | "disputed";
  /** @format text */
  generated_from?: string;
  /**
   * Note:
   * This is a Foreign Key to `documents.id`.<fk table='documents' column='id'/>
   * @format uuid
   */
  doc_id?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at?: string;
  /** @format timestamp with time zone */
  sent_at?: string;
  /** @format timestamp with time zone */
  paid_at?: string;
  /**
   * @format numeric
   * @default 0
   */
  paid_amount: number;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  created_by?: string;
  /** @format numeric */
  balance_due?: number;
  /** @format text */
  invoice_number?: string;
  /**
   * @format text
   * @default "unmatched"
   */
  match_status?: string;
  /**
   * Task created for invoice reminder
   *
   * Note:
   * This is a Foreign Key to `tasks.id`.<fk table='tasks' column='id'/>
   * @format uuid
   */
  reminder_task_id?: string;
  /**
   * Whether this invoice should be auto-sent on due date
   * @format boolean
   * @default false
   */
  auto_send_enabled?: boolean;
  /**
   * Days before due_date to send reminder
   * @format integer
   * @default 7
   */
  reminder_days_before?: number;
}

export interface Allocations {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /**
   * Note:
   * This is a Foreign Key to `deals.id`.<fk table='deals' column='id'/>
   * @format uuid
   */
  deal_id?: string;
  /**
   * Note:
   * This is a Foreign Key to `investors.id`.<fk table='investors' column='id'/>
   * @format uuid
   */
  investor_id?: string;
  /** @format numeric */
  unit_price: number;
  /** @format numeric */
  units: number;
  /**
   * @format public.allocation_status_enum
   * @default "pending_review"
   */
  status?: "pending_review" | "approved" | "rejected" | "settled";
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  approved_by?: string;
  /** @format timestamp with time zone */
  approved_at?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at?: string;
}

/** Controls which investors can see data room documents and for how long. */
export interface DealDataRoomAccess {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /**
   * Note:
   * This is a Foreign Key to `deals.id`.<fk table='deals' column='id'/>
   * @format uuid
   */
  deal_id: string;
  /**
   * Note:
   * This is a Foreign Key to `investors.id`.<fk table='investors' column='id'/>
   * @format uuid
   */
  investor_id: string;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  granted_by?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  granted_at: string;
  /** @format timestamp with time zone */
  expires_at?: string;
  /** @format timestamp with time zone */
  revoked_at?: string;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  revoked_by?: string;
  /**
   * @format boolean
   * @default false
   */
  auto_granted: boolean;
  /** @format text */
  notes?: string;
  /**
   * Timestamp of last expiry warning notification sent to investor to prevent spam
   * @format timestamp with time zone
   */
  last_warning_sent_at?: string;
}

export interface EsignEnvelopes {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /** @format text */
  envelope_id?: string;
  /** @format text */
  status?: string;
  /** @format public.citext */
  recipient_email?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at?: string;
  /** @format timestamp with time zone */
  completed_at?: string;
}

export interface Workflows {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /** @format text */
  key: string;
  /** @format text */
  n8n_webhook_url: string;
  /** @format jsonb */
  input_schema?: any;
  /** @format text[] */
  required_title?: string[];
  /** @format text */
  name?: string;
  /** @format text */
  description?: string;
  /** @format text */
  category?: string;
  /** @format text */
  required_role?: string;
  /**
   * @format boolean
   * @default true
   */
  is_active?: boolean;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  updated_at?: string;
  /**
   * @format text
   * @default "manual"
   */
  trigger_type?: string;
}

export interface Deals {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /**
   * Note:
   * This is a Foreign Key to `vehicles.id`.<fk table='vehicles' column='id'/>
   * @format uuid
   */
  vehicle_id: string;
  /** @format text */
  name: string;
  /**
   * @format public.deal_type_enum
   * @default "equity_secondary"
   */
  deal_type?:
    | "equity_secondary"
    | "equity_primary"
    | "credit_trade_finance"
    | "other";
  /**
   * @format public.deal_status_enum
   * @default "open"
   */
  status?: "draft" | "open" | "allocation_pending" | "closed" | "cancelled";
  /**
   * @format text
   * @default "USD"
   */
  currency?: string;
  /** @format timestamp with time zone */
  open_at?: string;
  /** @format timestamp with time zone */
  close_at?: string;
  /** @format jsonb */
  terms_schema?: any;
  /** @format numeric */
  offer_unit_price?: number;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  created_by?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at?: string;
  /** @format text */
  description?: string;
  /** @format text */
  investment_thesis?: string;
  /** @format numeric */
  minimum_investment?: number;
  /** @format numeric */
  maximum_investment?: number;
  /** @format numeric */
  target_amount?: number;
  /**
   * @format numeric
   * @default 0
   */
  raised_amount?: number;
  /** @format text */
  company_name?: string;
  /** @format text */
  company_logo_url?: string;
  /** @format text */
  sector?: string;
  /** @format text */
  stage?: string;
  /** @format text */
  location?: string;
  /** @format text */
  company_website?: string;
  /**
   * Regulated entity that arranged/structured this deal
   *
   * Note:
   * This is a Foreign Key to `arranger_entities.id`.<fk table='arranger_entities' column='id'/>
   * @format uuid
   */
  arranger_entity_id?: string;
  /**
   * The underlying company this deal relates to
   *
   * Note:
   * This is a Foreign Key to `companies.id`.<fk table='companies' column='id'/>
   * @format uuid
   */
  company_id?: string;
  /**
   * Type of stock/instrument for this deal
   * @format text
   */
  stock_type?: string;
  /**
   * Investment round (seed, series_a, etc.)
   * @format text
   */
  deal_round?: string;
}

/** Links multiple users to introducers. WHO CAN LOGIN as this introducer. */
export interface IntroducerUsers {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * This is a Foreign Key to `introducers.id`.<fk table='introducers' column='id'/>
   * @format uuid
   */
  introducer_id: string;
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  user_id: string;
  /**
   * @format text
   * @default "contact"
   */
  role: string;
  /**
   * @format boolean
   * @default false
   */
  is_primary: boolean;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at: string;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  created_by?: string;
  /**
   * @format boolean
   * @default false
   */
  can_sign: boolean;
}

/** Law firm entities that provide legal services for deals */
export interface Lawyers {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /** @format text */
  firm_name: string;
  /** @format text */
  display_name: string;
  /** @format text */
  legal_entity_type?: string;
  /** @format text */
  registration_number?: string;
  /** @format text */
  tax_id?: string;
  /** @format text */
  primary_contact_name?: string;
  /** @format text */
  primary_contact_email?: string;
  /** @format text */
  primary_contact_phone?: string;
  /** @format text */
  street_address?: string;
  /** @format text */
  city?: string;
  /** @format text */
  state_province?: string;
  /** @format text */
  postal_code?: string;
  /** @format text */
  country?: string;
  /** @format text[] */
  specializations?: string[];
  /**
   * @format boolean
   * @default true
   */
  is_active: boolean;
  /** @format timestamp with time zone */
  onboarded_at?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at: string;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  created_by?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  updated_at: string;
  /** @format text */
  logo_url?: string;
  /**
   * @format text
   * @default "not_started"
   */
  kyc_status?: string;
  /** @format timestamp with time zone */
  kyc_approved_at?: string;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  kyc_approved_by?: string;
  /** @format timestamp with time zone */
  kyc_expires_at?: string;
  /** @format text */
  kyc_notes?: string;
}

/** Introducer fee agreements for referral commissions */
export interface IntroducerAgreements {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /**
   * Note:
   * This is a Foreign Key to `introducers.id`.<fk table='introducers' column='id'/>
   * @format uuid
   */
  introducer_id: string;
  /**
   * @format text
   * @default "standard"
   */
  agreement_type: string;
  /**
   * Note:
   * This is a Foreign Key to `documents.id`.<fk table='documents' column='id'/>
   * @format uuid
   */
  agreement_document_id?: string;
  /** @format date */
  signed_date?: string;
  /** @format date */
  effective_date?: string;
  /** @format date */
  expiry_date?: string;
  /**
   * @format integer
   * @default 0
   */
  default_commission_bps: number;
  /** @format numeric */
  commission_cap_amount?: number;
  /** @format text */
  payment_terms?: string;
  /** @format text */
  territory?: string;
  /** @format text[] */
  deal_types?: string[];
  /** @format text */
  exclusivity_level?: string;
  /**
   * @format text
   * @default "draft"
   */
  status: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at: string;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  created_by?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  updated_at: string;
}

/** Summary of entity flags per vehicle with SECURITY INVOKER for proper RLS enforcement */
export interface EntityActionCenterSummary {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   */
  vehicle_id?: string;
  /** @format text */
  vehicle_name?: string;
  /** @format text */
  entity_code?: string;
  /** @format text */
  platform?: string;
  /** @format public.entity_status */
  vehicle_status?: "LIVE" | "CLOSED" | "TBD";
  /** @format bigint */
  critical_flags?: number;
  /** @format bigint */
  warning_flags?: number;
  /** @format bigint */
  info_flags?: number;
  /** @format bigint */
  total_unresolved_flags?: number;
  /** @format date */
  earliest_due_date?: string;
  /** @format timestamp with time zone */
  last_flag_update?: string;
}

export interface SubscriptionImportResults {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /**
   * Note:
   * This is a Foreign Key to `subscription_workbook_runs.id`.<fk table='subscription_workbook_runs' column='id'/>
   * @format uuid
   */
  run_id: string;
  /**
   * Note:
   * This is a Foreign Key to `subscriptions.id`.<fk table='subscriptions' column='id'/>
   * @format uuid
   */
  subscription_id?: string;
  /**
   * Note:
   * This is a Foreign Key to `entity_investors.id`.<fk table='entity_investors' column='id'/>
   * @format uuid
   */
  entity_investor_id?: string;
  /**
   * Note:
   * This is a Foreign Key to `investor_deal_holdings.id`.<fk table='investor_deal_holdings' column='id'/>
   * @format uuid
   */
  investor_deal_holding_id?: string;
  /** @format uuid */
  investor_id: string;
  /** @format uuid */
  vehicle_id: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at: string;
}

export interface AuditReportTemplates {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /** @format text */
  name: string;
  /** @format text */
  description?: string;
  /** @format text */
  report_type: string;
  /** @format jsonb */
  config: any;
  /** @format text[] */
  output_format?: string[];
  /**
   * @format boolean
   * @default true
   */
  is_active?: boolean;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  created_by?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at?: string;
}

export interface RequestTickets {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /**
   * Note:
   * This is a Foreign Key to `investors.id`.<fk table='investors' column='id'/>
   * @format uuid
   */
  investor_id?: string;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  created_by?: string;
  /** @format text */
  category?: string;
  /** @format text */
  subject?: string;
  /** @format text */
  details?: string;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  assigned_to?: string;
  /** @format uuid */
  linked_workflow_run?: string;
  /**
   * Note:
   * This is a Foreign Key to `documents.id`.<fk table='documents' column='id'/>
   * @format uuid
   */
  result_doc_id?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at?: string;
  /**
   * Note:
   * This is a Foreign Key to `deals.id`.<fk table='deals' column='id'/>
   * @format uuid
   */
  deal_id?: string;
  /**
   * @format public.request_status_enum
   * @default "open"
   */
  status?:
    | "open"
    | "assigned"
    | "in_progress"
    | "ready"
    | "closed"
    | "awaiting_info"
    | "cancelled";
  /**
   * @format public.request_priority_enum
   * @default "normal"
   */
  priority?: "low" | "normal" | "high" | "urgent";
  /**
   * Deadline for completing the request
   * @format timestamp with time zone
   */
  due_date?: string;
}

/** Individual messages including attachments and system notices. */
export interface Messages {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /**
   * Note:
   * This is a Foreign Key to `conversations.id`.<fk table='conversations' column='id'/>
   * @format uuid
   */
  conversation_id: string;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  sender_id?: string;
  /** @format text */
  body?: string;
  /**
   * text/system/file indicator for rendering and permissions.
   * @format public.message_type_enum
   * @default "text"
   */
  message_type: "text" | "system" | "file";
  /** @format text */
  file_key?: string;
  /**
   * Note:
   * This is a Foreign Key to `messages.id`.<fk table='messages' column='id'/>
   * @format uuid
   */
  reply_to_message_id?: string;
  /**
   * JSON metadata for reactions, attachments, or workflow references.
   * @format jsonb
   */
  metadata: any;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at: string;
  /** @format timestamp with time zone */
  edited_at?: string;
  /** @format timestamp with time zone */
  deleted_at?: string;
}

export interface ApprovalHistory {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /**
   * Note:
   * This is a Foreign Key to `approvals.id`.<fk table='approvals' column='id'/>
   * @format uuid
   */
  approval_id: string;
  /** @format text */
  action: string;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  actor_id: string;
  /** @format text */
  notes?: string;
  /** @format jsonb */
  metadata?: any;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at?: string;
}

/** Signals captured when investors express general interest in closed deals. */
export interface InvestorInterestSignals {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /**
   * Note:
   * This is a Foreign Key to `investors.id`.<fk table='investors' column='id'/>
   * @format uuid
   */
  investor_id: string;
  /**
   * Note:
   * This is a Foreign Key to `deals.id`.<fk table='deals' column='id'/>
   * @format uuid
   */
  deal_id: string;
  /** @format text */
  signal_type: string;
  /** @format jsonb */
  metadata?: any;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  created_by?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at: string;
}

/** Tracks all activities and interactions for audit and timeline. */
export interface ActivityFeed {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /** @format text */
  activity_type: string;
  /** @format uuid */
  entity_id: string;
  /**
   * Note:
   * This is a Foreign Key to `investors.id`.<fk table='investors' column='id'/>
   * @format uuid
   */
  investor_id?: string;
  /** @format text */
  title: string;
  /** @format text */
  description: string;
  /** @format jsonb */
  metadata?: any;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  created_by?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at?: string;
}

/** Links multiple users to arranger entities. WHO CAN LOGIN as this arranger. */
export interface ArrangerUsers {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * This is a Foreign Key to `arranger_entities.id`.<fk table='arranger_entities' column='id'/>
   * @format uuid
   */
  arranger_id: string;
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  user_id: string;
  /**
   * @format text
   * @default "member"
   */
  role: string;
  /**
   * @format boolean
   * @default false
   */
  is_primary: boolean;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at: string;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  created_by?: string;
}

export interface ShareSources {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /** @format text */
  kind: string;
  /** @format text */
  counterparty_name?: string;
  /**
   * Note:
   * This is a Foreign Key to `documents.id`.<fk table='documents' column='id'/>
   * @format uuid
   */
  contract_doc_id?: string;
  /** @format text */
  notes?: string;
}

export interface BankTransactions {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /** @format text */
  account_ref?: string;
  /** @format numeric */
  amount?: number;
  /**
   * @format text
   * @default "USD"
   */
  currency?: string;
  /** @format date */
  value_date?: string;
  /** @format text */
  memo?: string;
  /** @format text */
  counterparty?: string;
  /** @format uuid */
  import_batch_id?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at?: string;
  /** @format text */
  counterparty_account?: string;
  /** @format text */
  bank_reference?: string;
  /**
   * @format text
   * @default "unmatched"
   */
  status?: string;
  /** @format uuid[] */
  matched_invoice_ids?: string[];
  /**
   * Confidence score 0-100 from auto-matching algorithm
   * @format integer
   */
  match_confidence?: number;
  /** @format text */
  match_notes?: string;
  /** @format uuid */
  match_group_id?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  updated_at?: string;
  /**
   * Links to the subscription this transaction was matched to
   *
   * Note:
   * This is a Foreign Key to `subscriptions.id`.<fk table='subscriptions' column='id'/>
   * @format uuid
   */
  matched_subscription_id?: string;
  /**
   * Expected amount - actual amount (for flagging differences)
   * @format numeric
   */
  discrepancy_amount?: number;
  /**
   * User notes explaining how discrepancy was resolved
   * @format text
   */
  resolution_notes?: string;
  /**
   * Staff member who resolved the discrepancy
   *
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  resolved_by?: string;
  /**
   * When the discrepancy was resolved
   * @format timestamp with time zone
   */
  resolved_at?: string;
}

export interface Documents {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /**
   * Note:
   * This is a Foreign Key to `investors.id`.<fk table='investors' column='id'/>
   * @format uuid
   */
  owner_investor_id?: string;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  owner_user_id?: string;
  /**
   * Vehicle this document belongs to. Auto-populated from deal.vehicle_id when document is uploaded to a deal.
   *
   * Note:
   * This is a Foreign Key to `vehicles.id`.<fk table='vehicles' column='id'/>
   * @format uuid
   */
  vehicle_id?: string;
  /** @format text */
  type?: string;
  /** @format text */
  file_key: string;
  /** @format jsonb */
  watermark?: any;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  created_by?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at?: string;
  /**
   * Deal this document belongs to. When set, entity_id and vehicle_id are auto-populated from deal.vehicle_id.
   *
   * Note:
   * This is a Foreign Key to `deals.id`.<fk table='deals' column='id'/>
   * @format uuid
   */
  deal_id?: string;
  /**
   * Entity (vehicle) this document belongs to. Auto-populated from deal.vehicle_id when document is uploaded to a deal.
   *
   * Note:
   * This is a Foreign Key to `vehicles.id`.<fk table='vehicles' column='id'/>
   * @format uuid
   */
  entity_id?: string;
  /**
   * Note:
   * This is a Foreign Key to `document_folders.id`.<fk table='document_folders' column='id'/>
   * @format uuid
   */
  folder_id?: string;
  /** @format text */
  name?: string;
  /** @format text */
  description?: string;
  /** @format text[] */
  tags?: string[];
  /**
   * Current version number for display
   * @format integer
   * @default 1
   */
  current_version?: number;
  /**
   * Workflow status: draft → pending_approval → approved → published → archived
   * @format text
   * @default "draft"
   */
  status?: string;
  /** @format bigint */
  file_size_bytes?: number;
  /** @format text */
  mime_type?: string;
  /**
   * Whether document is visible to investors
   * @format boolean
   * @default false
   */
  is_published?: boolean;
  /** @format timestamp with time zone */
  published_at?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  updated_at?: string;
  /** @format text */
  external_url?: string;
  /** @format text */
  link_type?: string;
  /**
   * Links document to a formal subscription record
   *
   * Note:
   * This is a Foreign Key to `subscriptions.id`.<fk table='subscriptions' column='id'/>
   * @format uuid
   */
  subscription_id?: string;
  /**
   * Links document to the original submission/approval
   *
   * Note:
   * This is a Foreign Key to `deal_subscription_submissions.id`.<fk table='deal_subscription_submissions' column='id'/>
   * @format uuid
   */
  subscription_submission_id?: string;
  /**
   * Indicates if document is ready to be sent for signatures
   * @format boolean
   * @default false
   */
  ready_for_signature?: boolean;
  /**
   * Links to the workflow run that manages the signature process
   *
   * Note:
   * This is a Foreign Key to `workflow_runs.id`.<fk table='workflow_runs' column='id'/>
   * @format uuid
   */
  signature_workflow_run_id?: string;
  /**
   * Documents uploaded for arranger entity (KYC, licenses, certificates)
   *
   * Note:
   * This is a Foreign Key to `arranger_entities.id`.<fk table='arranger_entities' column='id'/>
   * @format uuid
   */
  arranger_entity_id?: string;
}

/** Links profiles to lawyer entities for portal access */
export interface LawyerUsers {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * This is a Foreign Key to `lawyers.id`.<fk table='lawyers' column='id'/>
   * @format uuid
   */
  lawyer_id: string;
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  user_id: string;
  /**
   * @format text
   * @default "member"
   */
  role: string;
  /**
   * @format boolean
   * @default false
   */
  is_primary: boolean;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at: string;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  created_by?: string;
  /**
   * @format boolean
   * @default false
   */
  can_sign: boolean;
}

export interface SubscriptionWorkbookRuns {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /** @format text */
  source_filename: string;
  /** @format text */
  source_hash?: string;
  /**
   * @format boolean
   * @default false
   */
  dry_run?: boolean;
  /** @format text */
  executed_by?: string;
  /**
   * @format text
   * @default "importing"
   */
  run_state: string;
  /** @format text */
  notes?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at: string;
}

export interface Valuations {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /**
   * Note:
   * This is a Foreign Key to `vehicles.id`.<fk table='vehicles' column='id'/>
   * @format uuid
   */
  vehicle_id?: string;
  /** @format date */
  as_of_date: string;
  /** @format numeric */
  nav_total?: number;
  /** @format numeric */
  nav_per_unit?: number;
}

/** Version history for documents with change tracking */
export interface DocumentVersions {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /**
   * Note:
   * This is a Foreign Key to `documents.id`.<fk table='documents' column='id'/>
   * @format uuid
   */
  document_id?: string;
  /** @format integer */
  version_number: number;
  /** @format text */
  file_key: string;
  /** @format bigint */
  file_size_bytes?: number;
  /** @format text */
  mime_type?: string;
  /** @format text */
  changes_description?: string;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  created_by?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at?: string;
}

export interface ReportRequests {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /**
   * Note:
   * This is a Foreign Key to `investors.id`.<fk table='investors' column='id'/>
   * @format uuid
   */
  investor_id?: string;
  /**
   * Note:
   * This is a Foreign Key to `vehicles.id`.<fk table='vehicles' column='id'/>
   * @format uuid
   */
  vehicle_id?: string;
  /** @format jsonb */
  filters?: any;
  /**
   * Note:
   * This is a Foreign Key to `documents.id`.<fk table='documents' column='id'/>
   * @format uuid
   */
  result_doc_id?: string;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  created_by?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at?: string;
  /**
   * @format public.report_status_enum
   * @default "queued"
   */
  status?: "queued" | "processing" | "ready" | "failed";
}

/** Audit log of inbound automation webhooks (n8n). */
export interface AutomationWebhookEvents {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /** @format text */
  event_type: string;
  /**
   * Note:
   * This is a Foreign Key to `deals.id`.<fk table='deals' column='id'/>
   * @format uuid
   */
  related_deal_id?: string;
  /**
   * Note:
   * This is a Foreign Key to `investors.id`.<fk table='investors' column='id'/>
   * @format uuid
   */
  related_investor_id?: string;
  /** @format jsonb */
  payload: any;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  received_at: string;
}

export interface TaskDependencies {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * This is a Foreign Key to `tasks.id`.<fk table='tasks' column='id'/>
   * @format uuid
   */
  task_id: string;
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * This is a Foreign Key to `tasks.id`.<fk table='tasks' column='id'/>
   * @format uuid
   */
  depends_on_task_id: string;
}

/** Regulated financial entities (arrangers/advisors) that structure deals and manage vehicles */
export interface ArrangerEntities {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /** @format text */
  legal_name: string;
  /** @format text */
  registration_number?: string;
  /** @format text */
  tax_id?: string;
  /** @format text */
  regulator?: string;
  /** @format text */
  license_number?: string;
  /** @format text */
  license_type?: string;
  /** @format date */
  license_expiry_date?: string;
  /** @format text */
  email?: string;
  /** @format text */
  phone?: string;
  /** @format text */
  address?: string;
  /**
   * @format text
   * @default "draft"
   */
  kyc_status?: string;
  /** @format timestamp with time zone */
  kyc_approved_at?: string;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  kyc_approved_by?: string;
  /** @format timestamp with time zone */
  kyc_expires_at?: string;
  /** @format text */
  kyc_notes?: string;
  /**
   * Flexible JSONB field for beneficial owners, key personnel, insurance details, etc.
   * @format jsonb
   */
  metadata?: any;
  /**
   * @format text
   * @default "active"
   */
  status?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at?: string;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  created_by?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  updated_at?: string;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  updated_by?: string;
  /** @format text */
  logo_url?: string;
}

export interface Introductions {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /**
   * Note:
   * This is a Foreign Key to `introducers.id`.<fk table='introducers' column='id'/>
   * @format uuid
   */
  introducer_id?: string;
  /** @format public.citext */
  prospect_email?: string;
  /**
   * Note:
   * This is a Foreign Key to `investors.id`.<fk table='investors' column='id'/>
   * @format uuid
   */
  prospect_investor_id?: string;
  /**
   * Note:
   * This is a Foreign Key to `deals.id`.<fk table='deals' column='id'/>
   * @format uuid
   */
  deal_id?: string;
  /**
   * @format text
   * @default "invited"
   */
  status?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at?: string;
  /**
   * @format date
   * @default "CURRENT_DATE"
   */
  introduced_at?: string;
  /** @format integer */
  commission_rate_override_bps?: number;
  /** @format text */
  notes?: string;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  created_by?: string;
}

export interface DealMemberships {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * This is a Foreign Key to `deals.id`.<fk table='deals' column='id'/>
   * @format uuid
   */
  deal_id: string;
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  user_id: string;
  /**
   * Note:
   * This is a Foreign Key to `investors.id`.<fk table='investors' column='id'/>
   * @format uuid
   */
  investor_id?: string;
  /** @format public.deal_member_role */
  role:
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
    | "commercial_partner_proxy";
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  invited_by?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  invited_at?: string;
  /** @format timestamp with time zone */
  accepted_at?: string;
  /**
   * When IO was dispatched to this member (Stage 1: Received)
   * @format timestamp with time zone
   */
  dispatched_at?: string;
  /**
   * When member first viewed the IO (Stage 2: Viewed)
   * @format timestamp with time zone
   */
  viewed_at?: string;
  /**
   * When member confirmed interest (Stage 3)
   * @format timestamp with time zone
   */
  interest_confirmed_at?: string;
  /**
   * When all signatories completed NDA (Stage 4)
   * @format timestamp with time zone
   */
  nda_signed_at?: string;
  /**
   * When data room access was granted (Stage 5)
   * @format timestamp with time zone
   */
  data_room_granted_at?: string;
}

export interface DashboardPreferences {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  user_id?: string;
  /** @format jsonb */
  layout_config?: any;
  /** @format text[] */
  widget_order?: string[];
  /** @format jsonb */
  custom_metrics?: any;
  /** @format jsonb */
  notification_settings?: any;
  /** @format jsonb */
  theme_settings?: any;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  updated_at?: string;
}

/** Per-investor distribution payment tracking */
export interface DistributionItems {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /**
   * Note:
   * This is a Foreign Key to `distributions.id`.<fk table='distributions' column='id'/>
   * @format uuid
   */
  distribution_id: string;
  /**
   * Note:
   * This is a Foreign Key to `subscriptions.id`.<fk table='subscriptions' column='id'/>
   * @format uuid
   */
  subscription_id: string;
  /**
   * Note:
   * This is a Foreign Key to `investors.id`.<fk table='investors' column='id'/>
   * @format uuid
   */
  investor_id: string;
  /**
   * Amount this investor should receive
   * @format numeric
   */
  distribution_amount: number;
  /**
   * Amount sent so far
   * @format numeric
   * @default 0
   */
  sent_amount: number;
  /** @format numeric */
  balance_pending?: number;
  /** @format date */
  sent_date?: string;
  /**
   * Wire confirmation number or reference
   * @format text
   */
  wire_reference?: string;
  /** @format date */
  confirmed_date?: string;
  /**
   * @format text
   * @default "pending"
   */
  status?: string;
  /** @format text */
  notes?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  updated_at?: string;
}

/** Hierarchical folder structure for organizing documents by vehicle and category */
export interface DocumentFolders {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /**
   * Note:
   * This is a Foreign Key to `document_folders.id`.<fk table='document_folders' column='id'/>
   * @format uuid
   */
  parent_folder_id?: string;
  /** @format text */
  name: string;
  /**
   * Full path from root, e.g. /VERSO Fund I/Reports
   * @format text
   */
  path: string;
  /**
   * Note:
   * This is a Foreign Key to `vehicles.id`.<fk table='vehicles' column='id'/>
   * @format uuid
   */
  vehicle_id?: string;
  /**
   * Type: vehicle_root (top-level), category (Agreements/KYC/etc), custom (user-created)
   * @format text
   */
  folder_type: string;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  created_by?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  updated_at?: string;
}

export interface CapitalCalls {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /**
   * Note:
   * This is a Foreign Key to `vehicles.id`.<fk table='vehicles' column='id'/>
   * @format uuid
   */
  vehicle_id?: string;
  /** @format text */
  name?: string;
  /** @format numeric */
  call_pct?: number;
  /** @format date */
  due_date?: string;
  /**
   * @format text
   * @default "draft"
   */
  status?: string;
}

/** Document folder structure for organizing entity/vehicle documents */
export interface EntityFolders {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /**
   * Note:
   * This is a Foreign Key to `vehicles.id`.<fk table='vehicles' column='id'/>
   * @format uuid
   */
  vehicle_id: string;
  /**
   * Type of folder: kyc, legal, redemption_closure, financial_statements, etc.
   * @format public.folder_type
   */
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
    | "other";
  /** @format text */
  folder_name: string;
  /** @format text */
  description?: string;
  /**
   * Whether this is a system-created default folder
   * @format boolean
   * @default false
   */
  is_default?: boolean;
  /**
   * Optional parent folder for creating folder hierarchies
   *
   * Note:
   * This is a Foreign Key to `entity_folders.id`.<fk table='entity_folders' column='id'/>
   * @format uuid
   */
  parent_folder_id?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  updated_at?: string;
}

export interface ComplianceAlerts {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /** @format uuid */
  audit_log_id?: string;
  /** @format text */
  alert_type: string;
  /**
   * @format text
   * @default "medium"
   */
  severity?: string;
  /** @format text */
  title: string;
  /** @format text */
  description?: string;
  /**
   * @format text
   * @default "open"
   */
  status?: string;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  assigned_to?: string;
  /** @format text */
  resolution_notes?: string;
  /** @format timestamp with time zone */
  resolved_at?: string;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  resolved_by?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  updated_at?: string;
}

/** Clients that commercial partners act on behalf of (proxy mode). Links CP to investors or stores info for new clients. */
export interface CommercialPartnerClients {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /**
   * Note:
   * This is a Foreign Key to `commercial_partners.id`.<fk table='commercial_partners' column='id'/>
   * @format uuid
   */
  commercial_partner_id: string;
  /** @format text */
  client_name: string;
  /**
   * Note:
   * This is a Foreign Key to `investors.id`.<fk table='investors' column='id'/>
   * @format uuid
   */
  client_investor_id?: string;
  /** @format text */
  client_email?: string;
  /** @format text */
  client_phone?: string;
  /**
   * @format text
   * @default "individual"
   */
  client_type: string;
  /**
   * Note:
   * This is a Foreign Key to `deals.id`.<fk table='deals' column='id'/>
   * @format uuid
   */
  created_for_deal_id?: string;
  /**
   * @format boolean
   * @default true
   */
  is_active: boolean;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at: string;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  created_by?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  updated_at: string;
}

/** Personnel/compliance tracking for arranger entities. Directors, UBOs, signatories. */
export interface ArrangerMembers {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /**
   * Note:
   * This is a Foreign Key to `arranger_entities.id`.<fk table='arranger_entities' column='id'/>
   * @format uuid
   */
  arranger_id: string;
  /** @format text */
  full_name: string;
  /** @format text */
  role: string;
  /** @format text */
  role_title?: string;
  /** @format text */
  email?: string;
  /** @format text */
  phone?: string;
  /** @format text */
  residential_street?: string;
  /** @format text */
  residential_city?: string;
  /** @format text */
  residential_state?: string;
  /** @format text */
  residential_postal_code?: string;
  /** @format text */
  residential_country?: string;
  /** @format text */
  nationality?: string;
  /** @format text */
  id_type?: string;
  /** @format text */
  id_number?: string;
  /** @format date */
  id_expiry_date?: string;
  /** @format numeric */
  ownership_percentage?: number;
  /**
   * @format boolean
   * @default false
   */
  is_beneficial_owner: boolean;
  /**
   * @format boolean
   * @default false
   */
  is_signatory: boolean;
  /**
   * @format boolean
   * @default true
   */
  is_active: boolean;
  /** @format date */
  effective_from?: string;
  /** @format date */
  effective_to?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at: string;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  created_by?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  updated_at: string;
}

export interface Distributions {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /**
   * Note:
   * This is a Foreign Key to `vehicles.id`.<fk table='vehicles' column='id'/>
   * @format uuid
   */
  vehicle_id?: string;
  /** @format text */
  name?: string;
  /** @format numeric */
  amount?: number;
  /** @format date */
  date?: string;
  /** @format text */
  classification?: string;
}

/** Documents made available in the investor data room with visibility flags. */
export interface DealDataRoomDocuments {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /**
   * Note:
   * This is a Foreign Key to `deals.id`.<fk table='deals' column='id'/>
   * @format uuid
   */
  deal_id: string;
  /** @format text */
  folder?: string;
  /** @format text */
  file_key?: string;
  /** @format text */
  file_name?: string;
  /**
   * @format boolean
   * @default false
   */
  visible_to_investors: boolean;
  /** @format jsonb */
  metadata_json?: any;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  created_by?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  updated_at: string;
  /**
   * Array of tags for document categorization and search
   * @format text[]
   */
  tags?: string[];
  /**
   * Optional expiry timestamp for time-limited documents
   * @format timestamp with time zone
   */
  document_expires_at?: string;
  /**
   * Internal notes about the document
   * @format text
   */
  document_notes?: string;
  /**
   * Document version number, increments with replacements
   * @format integer
   * @default 1
   */
  version: number;
  /**
   * ID of the document that replaced this version (forms version chain)
   *
   * Note:
   * This is a Foreign Key to `deal_data_room_documents.id`.<fk table='deal_data_room_documents' column='id'/>
   * @format uuid
   */
  replaced_by_id?: string;
  /**
   * File size in bytes for display and validation
   * @format bigint
   */
  file_size_bytes?: number;
  /**
   * MIME type of the uploaded file
   * @format text
   */
  mime_type?: string;
  /**
   * External link to document (e.g., Google Drive link) instead of uploaded file
   * @format text
   */
  external_link?: string;
  /**
   * When true, document appears in featured section at top of data room
   * @format boolean
   * @default false
   */
  is_featured?: boolean;
}

/** Real-time system performance metrics for super admin dashboard */
export interface SystemMetrics {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /** @format text */
  metric_type: string;
  /** @format numeric */
  value: number;
  /** @format text */
  unit?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  timestamp: string;
  /** @format jsonb */
  metadata?: any;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at?: string;
}

export interface Cashflows {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /**
   * Note:
   * This is a Foreign Key to `investors.id`.<fk table='investors' column='id'/>
   * @format uuid
   */
  investor_id?: string;
  /**
   * Note:
   * This is a Foreign Key to `vehicles.id`.<fk table='vehicles' column='id'/>
   * @format uuid
   */
  vehicle_id?: string;
  /** @format text */
  type?: string;
  /** @format numeric */
  amount?: number;
  /** @format date */
  date?: string;
  /** @format uuid */
  ref_id?: string;
}

/** Conversation metadata for investor/staff messages and deal rooms. */
export interface Conversations {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /** @format text */
  subject?: string;
  /**
   * Latest text preview used for inbox listing.
   * @format text
   */
  preview?: string;
  /**
   * @format public.conversation_type_enum
   * @default "dm"
   */
  type: "dm" | "group" | "deal_room" | "broadcast";
  /**
   * Visibility scope used by staff filters (investor/internal/deal).
   * @format public.conversation_visibility_enum
   * @default "internal"
   */
  visibility: "investor" | "internal" | "deal";
  /**
   * Optional staff team identifier owning the conversation.
   * @format text
   */
  owner_team?: string;
  /**
   * Note:
   * This is a Foreign Key to `deals.id`.<fk table='deals' column='id'/>
   * @format uuid
   */
  deal_id?: string;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  created_by?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  updated_at: string;
  /** @format timestamp with time zone */
  last_message_at?: string;
  /** @format uuid */
  last_message_id?: string;
  /** @format timestamp with time zone */
  archived_at?: string;
  /**
   * JSON metadata such as pinned flags, workflow bindings, or escalation status.
   * @format jsonb
   */
  metadata: any;
}

/** Stores notification entries delivered to investors and staff for deal workflow events. */
export interface InvestorNotifications {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  user_id: string;
  /**
   * Note:
   * This is a Foreign Key to `investors.id`.<fk table='investors' column='id'/>
   * @format uuid
   */
  investor_id?: string;
  /** @format text */
  title: string;
  /** @format text */
  message: string;
  /** @format text */
  link?: string;
  /** @format timestamp with time zone */
  read_at?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at: string;
}

export interface PerformanceSnapshots {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /**
   * Note:
   * This is a Foreign Key to `investors.id`.<fk table='investors' column='id'/>
   * @format uuid
   */
  investor_id?: string;
  /**
   * Note:
   * This is a Foreign Key to `vehicles.id`.<fk table='vehicles' column='id'/>
   * @format uuid
   */
  vehicle_id?: string;
  /** @format date */
  snapshot_date: string;
  /** @format numeric */
  nav_value?: number;
  /** @format numeric */
  contributed?: number;
  /** @format numeric */
  distributed?: number;
  /** @format numeric */
  dpi?: number;
  /** @format numeric */
  tvpi?: number;
  /** @format numeric */
  irr_gross?: number;
  /** @format numeric */
  irr_net?: number;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at?: string;
}

export interface Introducers {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  user_id?: string;
  /** @format text */
  legal_name?: string;
  /**
   * Note:
   * This is a Foreign Key to `documents.id`.<fk table='documents' column='id'/>
   * @format uuid
   */
  agreement_doc_id?: string;
  /**
   * @format integer
   * @default 0
   */
  default_commission_bps?: number;
  /**
   * @format text
   * @default "active"
   */
  status?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at?: string;
  /** @format text */
  contact_name?: string;
  /** @format text */
  email?: string;
  /** @format numeric */
  commission_cap_amount?: number;
  /** @format text */
  payment_terms?: string;
  /** @format date */
  agreement_expiry_date?: string;
  /** @format text */
  notes?: string;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  created_by?: string;
  /** @format text */
  logo_url?: string;
}

/** Immutable audit trail for all system activities with rich metadata. Replaced legacy audit_log table on 2025-11-15. */
export interface AuditLogs {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @format uuid
   * @default "gen_random_uuid()"
   */
  id: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  timestamp: string;
  /**
   * High-level event category
   * @format text
   */
  event_type: string;
  /**
   * Specific action performed
   * @format text
   */
  action: string;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  actor_id?: string;
  /** @format text */
  actor_email?: string;
  /** @format text */
  actor_name?: string;
  /** @format text */
  actor_role?: string;
  /** @format text */
  entity_type?: string;
  /** @format uuid */
  entity_id?: string;
  /** @format text */
  entity_name?: string;
  /** @format jsonb */
  action_details?: any;
  /** @format jsonb */
  before_value?: any;
  /** @format jsonb */
  after_value?: any;
  /** @format inet */
  ip_address?: string;
  /** @format text */
  user_agent?: string;
  /**
   * Risk assessment of the action
   * @format text
   */
  risk_level?: string;
  /**
   * Whether this event requires compliance review
   * @format boolean
   * @default false
   */
  compliance_flag?: boolean;
  /** @format text */
  compliance_review_status?: string;
  /**
   * Note:
   * This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
   * @format uuid
   */
  compliance_reviewer_id?: string;
  /** @format timestamp with time zone */
  compliance_reviewed_at?: string;
  /** @format text */
  compliance_notes?: string;
  /**
   * Data retention category determining how long to keep this record
   * @format text
   */
  retention_category?: string;
  /** @format date */
  retention_expiry?: string;
  /**
   * @format timestamp with time zone
   * @default "now()"
   */
  created_at: string;
}

# Introducer Agreement - n8n Placeholder Reference (REAL DB FIELDS)

## Overview

This document describes all placeholders used in the Introducer Agreement HTML template.
The template uses a **3-party structure** (Vehicle/Issuer + Arranger + Introducer) and includes:
- **Schedule I**: Dynamic subscriber table (pre-rendered HTML)
- **Conditional Performance Fee**: Only shown when performance fee > 0
- **Conditional Signature Blocks**: Entity (2 signatories) vs Individual (1 signatory)

---

## Database Tables Used

| Table | Purpose |
|-------|---------|
| `introducer_agreements` | Main agreement record with all fee terms |
| `introducers` | Introducer entity details |
| `deals` | Deal/company information |
| `fee_plans` | Agreement duration |
| `vehicles` | Vehicle/Issuer details (NEW) |
| `arranger_entities` | Arranger entity details (NEW) |
| `subscriptions` | Schedule I subscriber data (NEW) |

---

## NEW: Vehicle/Issuer Fields (Party 1)

| DB Column | Source Table | HTML Placeholder | Notes |
|-----------|--------------|------------------|-------|
| `name` | `vehicles` | `{{ $json.vehicle_name }}` | Vehicle name |
| - | Hardcoded | `{{ $json.vehicle_description }}` | "a Luxembourg special limited partnership..." |
| `address` | `vehicles` | `{{ $json.vehicle_address }}` | Registered office |
| `domicile` | `vehicles` | `{{ $json.vehicle_registration_country }}` | e.g., "Luxembourg" |
| `registration_number` | `vehicles` | `{{ $json.vehicle_registration_number }}` | RCC number |
| `issuer_gp_name` | `vehicles` | `{{ $json.vehicle_gp_name }}` | General Partner name |
| `issuer_gp_description` | `vehicles` | `{{ $json.vehicle_gp_description }}` | GP entity type (default: "a private limited liability company") |
| `issuer_gp_address` | `vehicles` | `{{ $json.vehicle_gp_address }}` | GP registered office (falls back to vehicle address) |
| `issuer_gp_rcc_number` | `vehicles` | `{{ $json.vehicle_gp_registration_number }}` | GP RCC number |

---

## NEW: Arranger Fields (Party 2)

| DB Column | Source Table | HTML Placeholder | Notes |
|-----------|--------------|------------------|-------|
| `legal_name` | `arranger_entities` | `{{ $json.arranger_name }}` | Default: "VERSO Management Ltd" |
| `address` + `city` + `country` | `arranger_entities` | `{{ $json.arranger_address }}` | Computed from parts |
| `registration_number` | `arranger_entities` | `{{ $json.arranger_registration_number }}` | Default: "1901463" |

---

## Introducer Fields (Party 3)

| DB Column | Source Table | HTML Placeholder | Transform |
|-----------|--------------|------------------|-----------|
| `legal_name` | `introducers` | `{{ $json.introducer_name }}` | Direct |
| `contact_name` | `introducers` | `{{ $json.introducer_signatory_name }}` | Direct |
| `type` | `introducers` | `{{ $json.introducer_type }}` | "entity" or "individual" |
| `address_*` fields | `introducers` | `{{ $json.introducer_address }}` | Computed from parts |

---

## NEW: Schedule I Fields (Pre-rendered HTML)

| Placeholder | Description | Notes |
|-------------|-------------|-------|
| `{{ $json.schedule_table_html }}` | Pre-rendered HTML table rows | From `subscriptions` table |
| `{{ $json.schedule_total_capital }}` | Sum of all commitments | Formatted as "USD X,XXX.XX" |
| `{{ $json.schedule_total_fee }}` | Sum of all BI fees | Formatted as "USD X,XXX.XX" |
| `{{ $json.schedule_subscriber_count }}` | Number of subscribers | Integer |

### Schedule I Data Source

Data comes from `subscriptions` where:
- `introducer_id` = current introducer
- `deal_id` = current deal
- `status` IN ('signed', 'funded', 'active')

Columns displayed:
| Column | DB Field |
|--------|----------|
| Subscribers | `investor.legal_name` |
| Capital USD | `commitment` |
| BI Fee% | `bd_fee_percent` |
| Share Count | `num_shares` |
| Total BI Fee USD | `bd_fee_amount` |

---

## NEW: Conditional Flags

| Placeholder | Type | Description |
|-------------|------|-------------|
| `{{ $json.has_performance_fee }}` | Boolean | True if `performance_fee_bps > 0` |
| `{{ $json.is_entity }}` | Boolean | True if `introducer.type === 'entity'` |
| `{{ $json.is_individual }}` | Boolean | True if `introducer.type === 'individual'` |

---

## NEW: Pre-rendered Conditional HTML

These are pre-rendered in the API to simplify n8n template logic:

| Placeholder | Description | Shown When |
|-------------|-------------|------------|
| `{{ $json.performance_fee_html }}` | Performance Fee Determination section | `has_performance_fee` |
| `{{ $json.performance_fee_example_html }}` | Numerical example for performance fee | `has_performance_fee` |
| `{{ $json.performance_fee_payment_html }}` | Payment terms for performance fee | `has_performance_fee` |
| `{{ $json.entity_signature_html }}` | 2 signature blocks for entity | `is_entity` |
| `{{ $json.individual_signature_html }}` | 1 signature block for individual | `is_individual` |

---

## Agreement Identifiers

| DB Column | HTML Placeholder | Notes |
|-----------|------------------|-------|
| `id` | `{{ $json.agreement_id }}` | UUID |
| `reference_number` | `{{ $json.reference_number }}` | Format: YYYYMMDDSEQ (e.g., 20260108001) |
| - | `{{ $json.document_id }}` | Same as reference_number |

---

## Date Fields

| DB Column | HTML Placeholder | Transform |
|-----------|------------------|-----------|
| `effective_date` | `{{ $json.agreement_date }}` | Format: "January 7, 2026" |
| `effective_date` | `{{ $json.effective_date }}` | Same format |

---

## Fee Configuration

| DB Column | HTML Placeholder | Transform |
|-----------|------------------|-----------|
| `default_commission_bps` | `{{ $json.subscription_fee_percent }}` | Divide by 100 (200 → "2.00") |
| `default_commission_bps` | `{{ $json.subscription_fee_decimal }}` | Divide by 10000 (200 → "0.0200") |
| `performance_fee_bps` | `{{ $json.performance_fee_percent }}` | Divide by 100 (1000 → "10.00") |
| `performance_fee_bps` | `{{ $json.performance_fee_decimal }}` | Divide by 10000 (1000 → "0.10") |
| `hurdle_rate_bps` | `{{ $json.hurdle_rate_text }}` | null/0 → "with no hurdle rate" |
| `has_performance_cap`, `performance_cap_percent` | `{{ $json.performance_cap_text }}` | false → "and no cap" |
| `subscription_fee_payment_days` | `{{ $json.subscription_fee_payment_days }}` | Default: 3 |
| `performance_fee_payment_days` | `{{ $json.performance_fee_payment_days }}` | Default: 10 |

---

## Agreement Terms

| DB Column | HTML Placeholder | Transform |
|-----------|------------------|-----------|
| `non_circumvention_months` | `{{ $json.non_circumvention_period }}` | null → "an indefinite period of time" |
| `vat_registration_number` | `{{ $json.vat_registration_text }}` | null → "", else " VAT Registration: XXX" |
| `governing_law` | `{{ $json.governing_law }}` | Default: "British Virgin Islands" |
| `agreement_duration_months` | `{{ $json.agreement_duration_months }}` | Default: 36 |

---

## Company/Deal

| DB Column | HTML Placeholder | Notes |
|-----------|------------------|-------|
| `company_name` | `{{ $json.company_name }}` | Falls back to deal.name |
| `id` | `{{ $json.deal_id }}` | UUID |

---

## VERSO Representative

| Placeholder | Default Value |
|-------------|---------------|
| `{{ $json.verso_representative_name }}` | "Julien MACHOT" |
| `{{ $json.verso_representative_title }}` | "Managing Partner" |

---

## Example Calculations

| Placeholder | Computation |
|-------------|-------------|
| `{{ $json.example_shares }}` | 10,000 |
| `{{ $json.example_price_per_share }}` | From deal's `offer_unit_price` or 23.52 |
| `{{ $json.example_purchase_price }}` | shares x price |
| `{{ $json.example_introduction_fee }}` | purchase_price x subscription_fee_decimal |
| `{{ $json.example_redemption_price }}` | 50.00 |
| `{{ $json.example_redemption_total }}` | shares x redemption_price |
| `{{ $json.example_profit }}` | redemption_total - purchase_price |
| `{{ $json.example_performance_fee }}` | profit x performance_fee_decimal |

---

## Raw Values (for n8n calculations)

| Placeholder | Type | Description |
|-------------|------|-------------|
| `{{ $json.raw_subscription_fee_bps }}` | Integer | Basis points (200 = 2%) |
| `{{ $json.raw_performance_fee_bps }}` | Integer | Basis points |
| `{{ $json.raw_hurdle_rate_bps }}` | Integer | Basis points or null |
| `{{ $json.raw_has_performance_cap }}` | Boolean | |
| `{{ $json.raw_performance_cap_percent }}` | Number | Percentage |

---

## Field Validation Checklist

| Placeholder | Required | Default |
|-------------|----------|---------|
| `reference_number` | Yes | Generated |
| `agreement_date` | Yes | Today |
| `vehicle_name` | Yes | - |
| `vehicle_gp_name` | Yes | - |
| `arranger_name` | No | "VERSO Management Ltd" |
| `introducer_name` | Yes | - |
| `introducer_address` | Yes | - |
| `company_name` | Yes | - |
| `subscription_fee_percent` | Yes | "0.00" |
| `performance_fee_percent` | No | "0.00" |
| `schedule_table_html` | No | Placeholder message |
| `entity_signature_html` | Conditional | - |
| `individual_signature_html` | Conditional | - |

---

## Complete Placeholder List (Alphabetical)

```
agreement_date
agreement_id
arranger_address
arranger_name
arranger_registration_number
company_name
deal_id
document_id
effective_date
entity_signature_html
example_introduction_fee
example_performance_fee
example_price_per_share
example_profit
example_purchase_price
example_redemption_price
example_redemption_total
example_shares
governing_law
has_performance_fee
hurdle_rate_text
individual_signature_html
introducer_address
introducer_email
introducer_name
introducer_signatory_name
introducer_type
is_entity
is_individual
non_circumvention_period
performance_cap_text
performance_fee_decimal
performance_fee_example_html
performance_fee_html
performance_fee_payment_html
performance_fee_percent
performance_fee_payment_days
raw_has_performance_cap
raw_hurdle_rate_bps
raw_performance_cap_percent
raw_performance_fee_bps
raw_subscription_fee_bps
reference_number
schedule_subscriber_count
schedule_table_html
schedule_total_capital
schedule_total_fee
subscription_fee_decimal
subscription_fee_payment_days
subscription_fee_percent
vat_registration_text
vehicle_address
vehicle_description
vehicle_gp_address
vehicle_gp_description
vehicle_gp_name
vehicle_gp_registration_number
vehicle_name
vehicle_registration_country
vehicle_registration_number
verso_representative_name
verso_representative_title
```

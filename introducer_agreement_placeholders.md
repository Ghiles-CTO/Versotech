# Introducer Agreement - n8n Placeholder Reference (REAL DB FIELDS)

## Database Tables Used

| Table | Purpose |
|-------|---------|
| `introducer_agreements` | Main agreement record with all fee terms |
| `introducers` | Introducer entity details |
| `deals` | Deal/company information |
| `fee_plans` | Agreement duration |

---

## REAL Database Fields → HTML Placeholders

### From `introducer_agreements`

| DB Column | HTML Placeholder | Transform |
|-----------|------------------|-----------|
| `reference_number` | `{{ $json.reference_number }}` | Direct |
| `effective_date` | `{{ $json.agreement_date }}`, `{{ $json.effective_date }}` | Format as "January 7, 2026" |
| `default_commission_bps` | `{{ $json.subscription_fee_percent }}` | Divide by 100 (200 → "2.00") |
| `default_commission_bps` | `{{ $json.subscription_fee_decimal }}` | Divide by 10000 (200 → "0.02") |
| `performance_fee_bps` | `{{ $json.performance_fee_percent }}` | Divide by 100 (1000 → "10.00") |
| `performance_fee_bps` | `{{ $json.performance_fee_decimal }}` | Divide by 10000 (1000 → "0.10") |
| `hurdle_rate_bps` | `{{ $json.hurdle_rate_text }}` | Compute: null/0 → "with no hurdle rate", else "with a X% hurdle rate" |
| `has_performance_cap` | (used in computation) | Boolean |
| `performance_cap_percent` | `{{ $json.performance_cap_text }}` | Compute: false → "and no cap", else "with a X% cap" |
| `subscription_fee_payment_days` | `{{ $json.subscription_fee_payment_days }}` | Direct (default: 3) |
| `performance_fee_payment_days` | `{{ $json.performance_fee_payment_days }}` | Direct (default: 10) |
| `non_circumvention_months` | `{{ $json.non_circumvention_period }}` | Compute: null → "an indefinite period of time", else "a period of X months" |
| `vat_registration_number` | `{{ $json.vat_registration_text }}` | Compute: null → "", else " VAT Registration: XXX" |
| `governing_law` | `{{ $json.governing_law }}` | Direct (default: "British Virgin Islands") |

### From `introducers`

| DB Column | HTML Placeholder | Transform |
|-----------|------------------|-----------|
| `legal_name` | `{{ $json.introducer_name }}` | Direct |
| `contact_name` | `{{ $json.introducer_signatory_name }}` | Direct |
| `address_line_1` | (used in computation) | |
| `address_line_2` | (used in computation) | |
| `city` | (used in computation) | |
| `state_province` | (used in computation) | |
| `postal_code` | (used in computation) | |
| `country` | (used in computation) | |
| **Computed** | `{{ $json.introducer_address }}` | Concatenate: `address_line_1, address_line_2, city, state_province postal_code, country` |

### From `deals`

| DB Column | HTML Placeholder | Transform |
|-----------|------------------|-----------|
| `company_name` | `{{ $json.company_name }}` | Direct |
| `name` | (alternative if company_name is null) | |

### From `fee_plans`

| DB Column | HTML Placeholder | Transform |
|-----------|------------------|-----------|
| `agreement_duration_months` | `{{ $json.agreement_duration_months }}` | Direct (default: 36) |

### Hardcoded Values

| Placeholder | Value | Notes |
|-------------|-------|-------|
| `{{ $json.verso_representative_name }}` | `Julien MACHOT` | Or from settings |
| `{{ $json.verso_representative_title }}` | `Managing Partner` | Or from settings |

### Example Calculation Fields (Optional - for numerical example)

These are computed at generation time:

| Placeholder | Computation |
|-------------|-------------|
| `{{ $json.example_shares }}` | Hardcoded: 10,000 |
| `{{ $json.example_price_per_share }}` | From deal's `offer_unit_price` or hardcoded |
| `{{ $json.example_purchase_price }}` | shares × price |
| `{{ $json.example_introduction_fee }}` | purchase_price × subscription_fee_decimal |
| `{{ $json.example_redemption_price }}` | Hardcoded: 50.00 (or 2× purchase price) |
| `{{ $json.example_redemption_total }}` | shares × redemption_price |
| `{{ $json.example_profit }}` | redemption_total - purchase_price |
| `{{ $json.example_performance_fee }}` | profit × performance_fee_decimal |

---

## n8n Function Node - Data Transformation

```javascript
// n8n Function node to transform database data to HTML placeholders
const data = $input.first().json;

// === INTRODUCER ADDRESS (build from components) ===
const addressParts = [
  data.address_line_1,
  data.address_line_2,
  data.city,
  [data.state_province, data.postal_code].filter(Boolean).join(' '),
  data.country
].filter(Boolean);
const introducer_address = addressParts.join(', ');

// === NON-CIRCUMVENTION TEXT ===
let non_circumvention_period;
if (data.non_circumvention_months === null || data.non_circumvention_months === undefined) {
  non_circumvention_period = 'an indefinite period of time';
} else {
  non_circumvention_period = `a period of ${data.non_circumvention_months} months`;
}

// === HURDLE RATE TEXT ===
let hurdle_rate_text;
if (!data.hurdle_rate_bps || data.hurdle_rate_bps === 0) {
  hurdle_rate_text = 'with no hurdle rate';
} else {
  hurdle_rate_text = `with a ${(data.hurdle_rate_bps / 100).toFixed(2)}% hurdle rate`;
}

// === PERFORMANCE CAP TEXT ===
let performance_cap_text;
if (!data.has_performance_cap || data.has_performance_cap === false) {
  performance_cap_text = ' and no cap';
} else {
  performance_cap_text = ` with a ${data.performance_cap_percent}% cap`;
}

// === VAT TEXT ===
let vat_registration_text = '';
if (data.vat_registration_number) {
  vat_registration_text = ` VAT Registration: ${data.vat_registration_number}`;
}

// === FEE CALCULATIONS ===
const subscription_fee_bps = data.default_commission_bps || 0;
const performance_fee_bps = data.performance_fee_bps || 0;
const subscription_fee_percent = (subscription_fee_bps / 100).toFixed(2);
const subscription_fee_decimal = (subscription_fee_bps / 10000).toFixed(4);
const performance_fee_percent = (performance_fee_bps / 100).toFixed(2);
const performance_fee_decimal = (performance_fee_bps / 10000).toFixed(2);

// === DATE FORMATTING ===
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

// === EXAMPLE CALCULATIONS ===
const example_shares = 10000;
const example_price_per_share = data.offer_unit_price || 23.52;
const example_redemption_price = 50.00;
const example_purchase_price = example_shares * example_price_per_share;
const example_introduction_fee = example_purchase_price * (subscription_fee_bps / 10000);
const example_redemption_total = example_shares * example_redemption_price;
const example_profit = example_redemption_total - example_purchase_price;
const example_performance_fee = example_profit * (performance_fee_bps / 10000);

// === OUTPUT ===
return {
  json: {
    // Document ID
    document_id: data.reference_number,

    // Reference & Date
    reference_number: data.reference_number,
    agreement_date: formatDate(data.effective_date),
    effective_date: formatDate(data.effective_date),

    // Introducer Info
    introducer_name: data.legal_name,
    introducer_address: introducer_address,
    introducer_signatory_name: data.contact_name,

    // Company/Deal
    company_name: data.company_name || data.deal_name,

    // VERSO Info (hardcoded or from settings)
    verso_representative_name: 'Julien MACHOT',
    verso_representative_title: 'Managing Partner',

    // Computed Text Fields
    non_circumvention_period: non_circumvention_period,
    hurdle_rate_text: hurdle_rate_text,
    performance_cap_text: performance_cap_text,
    vat_registration_text: vat_registration_text,

    // Fee Percentages
    subscription_fee_percent: subscription_fee_percent,
    subscription_fee_decimal: subscription_fee_decimal,
    performance_fee_percent: performance_fee_percent,
    performance_fee_decimal: performance_fee_decimal,

    // Payment Days
    subscription_fee_payment_days: data.subscription_fee_payment_days || 3,
    performance_fee_payment_days: data.performance_fee_payment_days || 10,

    // Agreement Terms
    governing_law: data.governing_law || 'British Virgin Islands',
    agreement_duration_months: data.agreement_duration_months || 36,

    // Example Calculations (formatted)
    example_shares: example_shares.toLocaleString(),
    example_price_per_share: example_price_per_share.toFixed(2),
    example_purchase_price: example_purchase_price.toLocaleString(),
    example_introduction_fee: example_introduction_fee.toLocaleString(),
    example_redemption_price: example_redemption_price.toFixed(2),
    example_redemption_total: example_redemption_total.toLocaleString(),
    example_profit: example_profit.toLocaleString(),
    example_performance_fee: example_performance_fee.toLocaleString(),
  }
};
```

---

## SQL Query to Get All Data

```sql
SELECT
  -- From introducer_agreements
  ia.reference_number,
  ia.effective_date,
  ia.default_commission_bps,
  ia.performance_fee_bps,
  ia.hurdle_rate_bps,
  ia.has_performance_cap,
  ia.performance_cap_percent,
  ia.subscription_fee_payment_days,
  ia.performance_fee_payment_days,
  ia.non_circumvention_months,
  ia.vat_registration_number,
  ia.governing_law,

  -- From introducers
  i.legal_name,
  i.contact_name,
  i.address_line_1,
  i.address_line_2,
  i.city,
  i.state_province,
  i.postal_code,
  i.country,

  -- From deals
  d.company_name,
  d.name AS deal_name,
  d.offer_unit_price,

  -- From fee_plans
  fp.agreement_duration_months

FROM introducer_agreements ia
JOIN introducers i ON i.id = ia.introducer_id
JOIN deals d ON d.id = ia.deal_id
LEFT JOIN fee_plans fp ON fp.id = ia.fee_plan_id
WHERE ia.id = '{{ agreement_id }}';
```

---

## Field Validation Checklist

| Placeholder | Required | Default |
|-------------|----------|---------|
| `reference_number` | ✅ Yes | - |
| `agreement_date` | ✅ Yes | - |
| `introducer_name` | ✅ Yes | - |
| `introducer_address` | ✅ Yes | - |
| `introducer_signatory_name` | ✅ Yes | - |
| `company_name` | ✅ Yes | - |
| `subscription_fee_percent` | ✅ Yes | "0.00" |
| `performance_fee_percent` | ❌ No | "0.00" |
| `subscription_fee_payment_days` | ❌ No | 3 |
| `performance_fee_payment_days` | ❌ No | 10 |
| `governing_law` | ❌ No | "British Virgin Islands" |
| `agreement_duration_months` | ❌ No | 36 |
| `non_circumvention_period` | ❌ No | "an indefinite period of time" |

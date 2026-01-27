# Arranger Guide: Term Sheet Management

Configure and manage the investment terms for your deals.

---

## Overview

The **Term Sheet** defines the investment terms that investors agree to when subscribing. It includes fees, structure, and key conditions.

> **Important**: The term sheet is **the source of truth for investment parameters** like minimum/maximum investment, target raise, unit price, and fee structures. These are NOT set in the deal creation form—only the deal name is required during creation. Configure all investment terms here.

---

## Accessing Term Sheet

1. Navigate to your deal
2. Click the **"Term Sheet"** tab
3. View or edit term sheet details

---

## Term Sheet Components

### 1. Investment Summary

| Field | Description | Example |
|-------|-------------|---------|
| **Investment Type** | Nature of investment | Private Equity, Real Estate |
| **Target Return** | Expected performance | 15-20% IRR |
| **Investment Period** | Expected hold time | 3-5 years |
| **Minimum Investment** | Lowest amount accepted | $250,000 |
| **Maximum Investment** | Highest amount accepted | $5,000,000 |

### 2. Fee Structure

| Fee Type | Description | Typical Range |
|----------|-------------|---------------|
| **Management Fee** | Annual fee on committed capital | 1-2% |
| **Performance Fee** | Carried interest on profits | 15-20% |
| **Acquisition Fee** | Fee on deal acquisition | 0-2% |
| **Disposition Fee** | Fee on exit/sale | 0-1% |
| **Hurdle Rate** | Preferred return threshold | 6-8% |

### 3. Key Dates

| Date | Purpose |
|------|---------|
| **Open Date** | When subscriptions accepted |
| **First Close** | Initial closing target |
| **Final Close** | Last date to subscribe |
| **Expected Exit** | Anticipated exit timeline |

### 4. Waterfall Structure

Define how returns are distributed:

```
1. Return of Capital (100% to investors)
2. Preferred Return (8% to investors)
3. Catch-up (20% to GP until equalized)
4. Carried Interest (80/20 split)
```

---

## Editing Term Sheet

### Step 1: Enter Edit Mode

1. On the Term Sheet tab
2. Click **"Edit Term Sheet"**
3. Form becomes editable

### Step 2: Update Sections

Navigate through sections:
- **Summary** - Basic terms
- **Fees** - Fee structure
- **Dates** - Timeline
- **Distribution** - Waterfall

### Step 3: Save Changes

1. Review all changes
2. Click **"Save Term Sheet"**
3. Changes are versioned

---

## Fee Configuration

### Management Fee

Configure annual management fee:

| Setting | Options |
|---------|---------|
| **Rate** | Percentage (e.g., 1.5%) |
| **Basis** | Committed capital, Invested capital, NAV |
| **Frequency** | Annual, Quarterly, Monthly |
| **Calculation** | Advance, Arrears |

### Performance Fee (Carry)

Configure carried interest:

| Setting | Options |
|---------|---------|
| **Rate** | Percentage (e.g., 20%) |
| **Hurdle** | Preferred return threshold |
| **Catch-up** | GP catch-up percentage |
| **European/American** | Waterfall style |

### Other Fees

Add additional fees as needed:
1. Click **"+ Add Fee"**
2. Select fee type
3. Enter rate and terms
4. Save

---

## Publishing Term Sheet

### Draft vs Published

| Status | Visibility | Editing |
|--------|------------|---------|
| `draft` | Arranger only | Full editing |
| `published` | Investors can view | Limited editing |

### Publishing Process

1. Complete all required fields
2. Click **"Publish Term Sheet"**
3. Confirm publication
4. Investors can now view terms

### Editing Published Terms

Changes after publication:
- Require re-confirmation from subscribed investors
- Are tracked in version history
- May require regulatory disclosures

---

## Share Classes

For deals with multiple share classes:

### Creating Share Classes

1. Click **"+ Add Share Class"**
2. Define class characteristics:
   - Class name (e.g., "Class A", "Founder")
   - Minimum investment
   - Fee structure (may differ)
   - Voting rights
   - Priority in distributions

### Example Structure

| Class | Minimum | Mgmt Fee | Carry |
|-------|---------|----------|-------|
| Class A | $1M | 1.25% | 15% |
| Class B | $250K | 1.50% | 20% |
| Founder | $5M | 0.75% | 10% |

---

## Term Sheet Document

### Auto-Generated Document

The platform can generate a PDF term sheet:
1. Click **"Generate PDF"**
2. Review the document
3. Download or share

### Custom Term Sheet

Upload your own:
1. Click **"Upload Custom"**
2. Select your PDF
3. Replaces auto-generated version

---

## Investor Term Sheet View

### What Investors See

Investors view the term sheet from:
- Deal detail page
- Data room documents
- Subscription form review

### Presentation

Terms are displayed as:
- Formatted summary table
- Downloadable PDF
- Part of subscription pack

---

## Version History

Track changes over time:

1. Go to Term Sheet tab
2. Click **"Version History"**
3. See all changes:
   - Date of change
   - Who made change
   - What changed
   - Compare versions

### Reverting Changes

To revert to previous version:
1. Select the version
2. Click **"Restore This Version"**
3. Confirm the action

---

## Best Practices

### Completeness

Ensure all fields are filled:
- Incomplete terms confuse investors
- May delay subscriptions
- Required for deal opening

### Clarity

Write clear, understandable terms:
- Avoid excessive jargon
- Define uncommon terms
- Use consistent formatting

### Accuracy

Verify calculations:
- Fee percentages add up
- Date ranges make sense
- Minimums align with deal target

---

## Common Issues

### "Cannot publish term sheet"

Check required fields:
1. All fee types specified
2. Key dates entered
3. Minimum investment set
4. Waterfall structure defined

### "Investor says terms are different"

Version mismatch:
1. Check which version they saw
2. Review version history
3. Clarify current terms

---

## Next Steps

With term sheet configured:

1. [Set Up Fee Plans](./05-fee-plan-setup.md) for commissions
2. [Prepare Data Room](./08-data-room-management.md)
3. [Open Deal](./03-creating-deals.md) for subscriptions

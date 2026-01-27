# Arranger Guide: Creating Vehicles

Learn how to create and configure investment vehicles (funds) on Versotech.

---

## Overview

A **Vehicle** is the legal fund structure that holds deals and investor positions. Before creating deals, you need at least one vehicle.

---

## Vehicle Concepts

### What is a Vehicle?

A vehicle represents:
- A legal entity (LP, Ltd, SPV, etc.)
- With defined service providers
- That can hold multiple deals
- Where investors hold positions

### Vehicle Types

| Type | Description |
|------|-------------|
| **Limited Partnership** | Traditional fund structure |
| **SPV** | Special Purpose Vehicle for single deals |
| **SPC** | Segregated Portfolio Company |
| **Unit Trust** | Trust-based structure |

---

## Creating a New Vehicle

### Step 1: Access Vehicle Creation

1. Navigate to **Vehicles** in the left sidebar
2. Click **"+ New Vehicle"**
3. The creation wizard opens

### Step 2: Basic Information

Complete the first section:

| Field | Description | Example |
|-------|-------------|---------|
| **Vehicle Name** | Legal name | "VERSO Capital Partners LP" |
| **Short Name** | Display name | "VCP" |
| **Vehicle Type** | Structure type | Limited Partnership |
| **Jurisdiction** | Registration location | Cayman Islands |
| **Currency** | Base currency | USD |

### Step 3: Legal Details

| Field | Description |
|-------|-------------|
| **Registration Number** | Official registration ID |
| **Formation Date** | When vehicle was established |
| **Registered Address** | Official legal address |
| **LEI** | Legal Entity Identifier (if applicable) |

### Step 4: Service Providers

Add key service providers for the vehicle:

| Provider | Role |
|----------|------|
| **Administrator** | NAV calculation, investor services |
| **Custodian** | Asset safekeeping |
| **Auditor** | Annual audit |
| **Legal Counsel** | Legal matters |
| **Lawyer** | Document signing, certifications |

For each provider, enter:
- Company name
- Contact person
- Email
- Phone

### Step 5: Arranger Assignment

The vehicle is automatically assigned to your organization. You can also:
- Add co-arrangers (if applicable)
- Set primary contact

### Step 6: Review and Create

1. Review all entered information
2. Click **"Create Vehicle"**
3. Vehicle status is set to `draft`

---

## Vehicle Statuses

| Status | Meaning | Actions Available |
|--------|---------|-------------------|
| `draft` | Just created, configuring | Edit all fields |
| `active` | Accepting deals | Create deals, modify limited fields |
| `closed` | No new deals | View only, reporting |

---

## Activating a Vehicle

Before creating deals, activate the vehicle:

1. Go to **Vehicle Details**
2. Verify all required fields complete
3. Click **"Activate Vehicle"**
4. Confirm the action
5. Status changes to `active`

---

## Vehicle Configuration

### Documents Tab

Upload key vehicle documents:
- Limited Partnership Agreement
- Private Placement Memorandum
- Subscription Agreement templates
- Tax forms

### Settings Tab

Configure vehicle-level settings:
- Default fee structure
- Investor eligibility requirements
- Reporting preferences

### Team Tab

Manage who can access this vehicle:
- Add/remove team members
- Set permission levels
- Assign responsibilities

---

## Best Practices

### Naming Conventions

Use consistent naming:
```
[SPONSOR] [STRATEGY] [VINTAGE] [STRUCTURE]
Example: "VERSO Real Estate 2024 LP"
```

### Service Provider Setup

Ensure accurate service provider details:
- Email addresses must be deliverable
- Contact names should be current
- Phone numbers should include country codes

### Document Completeness

Before going active:
- ✅ All legal documents uploaded
- ✅ Service providers confirmed
- ✅ Team access configured
- ✅ Lawyer assigned (for signing)

---

## Managing Multiple Vehicles

### Vehicle List View

The Vehicles page shows all your vehicles:
- Status badges
- AUM summary
- Active deals count
- Quick actions

### Filtering and Sorting

Filter vehicles by:
- Status (Draft, Active, Closed)
- Type
- Jurisdiction
- Creation date

---

## Editing a Vehicle

### Draft Vehicles

All fields editable:
1. Click on the vehicle
2. Click **"Edit"**
3. Make changes
4. Click **"Save"**

### Active Vehicles

Limited editing (to maintain integrity):
- Can update contact details
- Can add service providers
- Cannot change legal structure
- Cannot change jurisdiction

### Requesting Changes

For locked fields on active vehicles:
1. Contact VERSO operations
2. Explain required changes
3. Changes made with audit trail

---

## Vehicle Closure

When a vehicle is no longer accepting new deals:

1. Ensure all deals are closed
2. Go to **Vehicle Settings**
3. Click **"Close Vehicle"**
4. Confirm closure

Closed vehicles:
- Still visible for reporting
- Positions remain active
- No new deals can be created

---

## Common Issues

### "Cannot create deal - vehicle not active"

Activate the vehicle first:
1. Check all required fields are complete
2. Click "Activate Vehicle"
3. Then create deals

### "Missing service provider"

Some fields are required:
1. Check which provider is missing
2. Add the required information
3. Try again

---

## Next Steps

With your vehicle created:

1. [Create Deals](./03-creating-deals.md) within the vehicle
2. [Manage Term Sheets](./04-term-sheet-management.md)
3. [Set Up Fee Plans](./05-fee-plan-setup.md)

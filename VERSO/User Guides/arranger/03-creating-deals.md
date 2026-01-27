# Arranger Guide: Creating Deals

Learn how to create investment opportunities (deals) within your vehicles.

---

## Overview

A **Deal** is a specific investment opportunity within a vehicle. Investors subscribe to deals, not directly to vehicles.

---

## Deal vs Vehicle

| Concept | Purpose | Example |
|---------|---------|---------|
| **Vehicle** | Legal structure, holds positions | "VERSO Private Equity LP" |
| **Deal** | Investment opportunity | "Series A - TechCo Acquisition" |

One vehicle can have multiple deals.

---

## Creating a New Deal

### Step 1: Navigate to Deal Creation

Option A: From Vehicles
1. Go to **Vehicles** → Select your vehicle
2. Click **"+ New Deal"**

Option B: From Deals
1. Go to **Deals**
2. Click **"+ New Deal"**
3. Select the vehicle

### Step 2: The 3-Step Wizard

The deal creation wizard has three steps:

---

## Step 1: Basic Information

| Field | Description | Required |
|-------|-------------|----------|
| **Deal Name** | Descriptive name | Yes |
| **Description** | Brief summary | No |
| **Vehicle** | Which fund | Yes |

> **Important**: The deal creation form only requires the deal name. All investment terms (target raise, minimum/maximum investment, unit price, etc.) are configured in the **Term Sheet** after the deal is created. See [Term Sheet Management](./04-term-sheet-management.md) for details.

### Deal Name Best Practices

Include relevant details:
```
[VEHICLE SHORT] - [ASSET/COMPANY] [TYPE]
Example: "VRE - Miami Tower Acquisition"
Example: "VPE - Series B TechStartup"
```

### Arranger Auto-Population

When you select a vehicle, the **arranger is automatically populated** from the vehicle's `arranger_entity_id`. This ensures:
- Consistent arranger assignment across deals
- Proper commission tracking
- Correct approval workflows

---

## Step 2: Vehicle Selection

When you select a vehicle:
- The deal is linked to that vehicle's legal structure
- The **arranger is auto-populated** from the vehicle's arranger entity
- Fee plans will be created for this specific deal

---

## Step 3: Review & Create

Review the deal name and vehicle selection, then:
1. Click **"Create Deal"**
2. Deal is created in `draft` status
3. You're redirected to deal details

> **Next Step**: After creating the deal, you'll configure investment terms (target raise, min/max investment, unit price, fees, dates) in the **Term Sheet** tab. See [Term Sheet Management](./04-term-sheet-management.md).

---

## Deal Statuses

| Status | Meaning | Actions |
|--------|---------|---------|
| `draft` | Configuring, not visible | Edit everything |
| `open` | Accepting interest | Limited edits, full operations |
| `allocation_pending` | Interest closed, allocating | No new interest |
| `fully_subscribed` | Target reached | Processing existing |
| `closed` | Deal complete | View/report only |

---

## Opening a Deal

When ready to accept investors:

### Prerequisites

Before opening:
- ✅ Term sheet configured
- ✅ Fee plans set up (if applicable)
- ✅ Data room prepared
- ✅ All required documents uploaded

### To Open

1. Go to deal detail page
2. Click **"Open Deal"**
3. Confirm the action
4. Status changes to `open`
5. Deal becomes visible to eligible investors

---

## Deal Configuration Tabs

After creation, the deal detail page has several tabs:

### Overview Tab
- Summary information
- Fundraising progress
- Key metrics

### Term Sheet Tab
- Investment terms
- Fee structure
- Key dates
- See [Term Sheet Management](./04-term-sheet-management.md)

### Fee Plans Tab
- Commission arrangements
- Introducer/partner fee plans
- See [Fee Plan Setup](./05-fee-plan-setup.md)

### Data Room Tab
- Document management
- Access control
- See [Data Room Management](./08-data-room-management.md)

### Subscriptions Tab
- All subscriptions for this deal
- Status tracking
- See [Monitoring Subscriptions](./09-monitoring-subscriptions.md)

### Activity Tab
- Timeline of all deal events
- User actions
- System updates

---

## Editing a Deal

### Draft Deals

All fields can be edited:
1. Go to deal detail
2. Click **"Edit Deal"**
3. Modify fields
4. Click **"Save"**

### Open Deals

Limited editing to protect investor expectations:

| Can Edit | Cannot Edit |
|----------|-------------|
| Description | Target raise |
| Target close date | Minimum investment |
| Documents | Currency |
| Fee plans | Vehicle |

---

## Duplicating a Deal

To create a similar deal:

1. Go to existing deal
2. Click **"..."** menu → **"Duplicate"**
3. Enter new name
4. Review/modify copied details
5. Save as new draft

---

## Deal Visibility

### Public Deals

- Visible to all approved investors
- Listed in Opportunities

### Private Deals

- Only visible to explicitly added investors
- Invitation only

### By Invitation

- Visible to those you share with
- Can be shared via link or dispatch

---

## Fundraising Progress

The deal shows fundraising metrics:

```
Target: $10,000,000
Subscribed: $7,500,000 (75%)
Funded: $6,000,000 (60%)
Remaining: $2,500,000
```

### Progress Categories

| Category | Definition |
|----------|------------|
| **Interest** | Expressions of interest |
| **Subscribed** | Approved subscriptions |
| **Committed** | Signed subscription docs |
| **Funded** | Money received |

---

## Common Issues

### "Vehicle not selectable"

Vehicle must be `active`:
1. Go to Vehicles
2. Activate the vehicle
3. Return to deal creation

### "Cannot open deal"

Check requirements:
1. Term sheet must be complete
2. Required documents uploaded
3. All mandatory fields filled

---

## Next Steps

After creating your deal:

1. [Configure Term Sheet](./04-term-sheet-management.md)
2. [Set Up Fee Plans](./05-fee-plan-setup.md)
3. [Prepare Data Room](./08-data-room-management.md)
4. [Dispatch to Network](./07-dispatching-investors.md)

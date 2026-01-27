# VERSO Email Templates - Complete Inventory

**Document Purpose:** Client review of all automated emails sent by the VERSO platform
**Current sender:** `VERSO <onboarding@resend.dev>` (will change to `noreply@versoholdings.com` after domain verification)
**Last updated:** January 2026

---

## Overview

The VERSO platform has **31 notification types** defined in the system. Of these:
- **21 types send emails** (listed below with ✉️)
- **10 types are portal-only** (in-app notifications, no email)
- **2 features have TODO placeholders** (emails not yet implemented)

### Email Categories
- Invitation emails (5 types)
- Password & security alerts (4 types)
- Document signature requests (1 type - currently disabled)
- Investor notifications (8 types)
- Introducer notifications (5 types that send email + 8 portal-only)
- Partner notifications (2 types that send email + 4 portal-only)
- Commercial partner notifications (6 types)

---

## 1. INVITATION EMAILS

### 1.1 Staff Invitation ✉️
| Field | Value |
|-------|-------|
| **Recipients** | New staff members (administrators, operations, relationship managers, CEO) |
| **Subject** | `Welcome to VERSO - Your Account Details` |
| **Trigger** | When a staff admin invites a new team member |

**Email content:**
> **Welcome to VERSO**
>
> Hi [Name],
>
> You've been invited to join VERSO as a [Job Title].
>
> **Your Login Credentials**
> - Email: [their email]
> - Temporary Password: [auto-generated password]
>
> **Important:** Please change your password immediately after your first login for security purposes.
>
> [Login to VERSO button]
>
> If you have any questions, please contact your administrator.

---

### 1.2 Investor Invitation ✉️
| Field | Value |
|-------|-------|
| **Recipients** | Investors being onboarded to the platform |
| **Subject** | `You've been invited to join [Entity Name] on VERSO` |
| **Trigger** | After CEO approval of the invitation request |

**Email content:**
> **[VERSO logo]**
>
> You have been invited to join **[Entity Name]** on the VERSO Investment Platform.
>
> This secure platform provides you with comprehensive access to your investment portfolio, performance analytics, and exclusive deal opportunities.
>
> Click the button below to set up your account and access the platform.
>
> [Accept Invitation button]

---

### 1.3 Professional Partner Invitation ✉️
| Field | Value |
|-------|-------|
| **Recipients** | Arrangers, lawyers, introducers, partners, commercial partners |
| **Subject** | `You've been invited to join [Entity Name] on VERSO` |
| **Trigger** | After CEO approval of the invitation request |

**Email content:**
> **[VERSO logo]**
>
> You have been invited to join **[Entity Name]** on the VERSO Platform.
>
> This platform provides access to deal management, document processing, and collaboration tools for your organization.
>
> Click the button below to set up your account and get started.
>
> [Accept Invitation button]

---

### 1.4 Staff Role Invitation ✉️
| Field | Value |
|-------|-------|
| **Recipients** | Users being added as VERSO staff |
| **Subject** | `Welcome to VERSO - You've been invited as [Role Name]` |
| **Trigger** | When invited as internal staff |

**Email content:**
> **[VERSO logo]**
>
> You have been invited to join **VERSO** as a **[Role Name]**.
>
> As a member of the VERSO team, you'll have access to investor management, deal operations, and administrative tools.
>
> Click the button below to set up your password and access your dashboard.
>
> [Accept Invitation button]

---

### 1.5 Invitation Reminder (Automated) ✉️
| Field | Value |
|-------|-------|
| **Recipients** | Anyone with a pending invitation |
| **Subject** | Same as original invitation |
| **Trigger** | Automatically every 3 days, up to 2 reminders total |

**Email content:** Same as original invitation email with "Reminder" prefix

---

## 2. PASSWORD & SECURITY EMAILS

### 2.1 Password Reset ✉️
| Field | Value |
|-------|-------|
| **Recipients** | Any user who requests a password reset |
| **Subject** | `Reset Your Password - VERSO` |
| **Trigger** | When user clicks "Forgot Password" or admin initiates reset |

**Email content:**
> **[VERSO logo]**
>
> Dear [Name],
>
> We received a request to reset the password for your VERSO account.
>
> Click the button below to create a new password. For security reasons, this link will expire in 1 hour.
>
> [Reset Password button]
>
> **Didn't request this?**
> If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
>
> If you're having trouble clicking the button, copy and paste the following link into your browser:
> [full URL]

---

### 2.2 Account Deactivated Alert ✉️
| Field | Value |
|-------|-------|
| **Recipients** | User whose account was deactivated |
| **Subject** | `Security Alert: Account Deactivated - VERSO` |
| **Trigger** | When admin deactivates a user account |

**Email content:**
> **Security Alert**
>
> Hi [Name],
>
> **Account Deactivated**
> [Details about why account was deactivated]
>
> If you did not authorize this change or have any concerns, please contact your administrator immediately.
>
> **Action taken:** [timestamp]

---

### 2.3 Permissions Changed Alert ✉️
| Field | Value |
|-------|-------|
| **Recipients** | User whose permissions were modified |
| **Subject** | `Security Alert: Account Permissions Changed - VERSO` |
| **Trigger** | When admin changes user permissions |

**Email content:**
> **Security Alert**
>
> Hi [Name],
>
> **Account Permissions Changed**
> [Details about what changed]
>
> If you did not authorize this change or have any concerns, please contact your administrator immediately.
>
> **Action taken:** [timestamp]

---

### 2.4 Password Changed Alert ✉️
| Field | Value |
|-------|-------|
| **Recipients** | User whose password was changed |
| **Subject** | `Security Alert: Password Changed - VERSO` |
| **Trigger** | After successful password change |

**Email content:**
> **Security Alert**
>
> Hi [Name],
>
> **Password Changed**
> [Details about the password change]
>
> If you did not authorize this change or have any concerns, please contact your administrator immediately.
>
> **Action taken:** [timestamp]

---

## 3. DOCUMENT SIGNATURE EMAILS

### 3.1 Signature Request ⚠️ DISABLED
| Field | Value |
|-------|-------|
| **Recipients** | Anyone who needs to sign a document |
| **Subject** | `[Document Type] Ready for Your Signature - VERSO` |
| **Trigger** | When document requires signature |
| **Status** | ⚠️ **CURRENTLY DISABLED** - Users access signature links via the tasks portal instead |

**Email content (when enabled):**
> **Document Ready for Signature**
>
> Hi [Name],
>
> Your **[Document Type]** is ready for your electronic signature.
>
> ⏰ **Time Sensitive:** This signature link expires in [X] days ([date]).
>
> To review and sign the document, click the button below:
>
> [Review and Sign Document button]
>
> **What happens next?**
> 1. Click the link above to view the document
> 2. Review the content carefully
> 3. Draw or upload your signature
> 4. Submit to complete the signing process
>
> If you have any questions, please contact VERSO support.

**Document types supported:** Non-Disclosure Agreement, Subscription Agreement, Amendment, Other

---

## 4. INVESTOR NOTIFICATIONS

### 4.1 KYC Status Update ✉️
| Field | Value |
|-------|-------|
| **Recipients** | Investors |
| **Subject** | `[Title] - VERSO Holdings` (e.g., "KYC Approved - VERSO Holdings") |
| **Trigger** | When staff approves, rejects, or requests more info on KYC |

**Email content:**
> **VERSO Holdings**
>
> **[Title]**
>
> Hi [Name],
>
> [Message about KYC status - approved/rejected/info requested]
>
> [View in Portal button]
>
> If you have any questions, please contact our team through the platform.

---

### 4.2 KYC Expiry Reminders (Automated) ✉️
| Field | Value |
|-------|-------|
| **Recipients** | Investors with expiring KYC |
| **Subject** | `[Reminder Title] - VERSO Holdings` |
| **Trigger** | Automatically at 30 days, 14 days, 7 days, and on expiry day |

**Email content:** Same format as KYC Status Update with urgency-appropriate message

---

### 4.3 Deal Invitation ✉️
| Field | Value |
|-------|-------|
| **Recipients** | Investors invited to a deal |
| **Subject** | `[Title] - VERSO Holdings` |
| **Trigger** | When investor is invited to participate in a deal |

---

### 4.4 Subscription Update ✉️
| Field | Value |
|-------|-------|
| **Recipients** | Investors with active subscriptions |
| **Subject** | `[Title] - VERSO Holdings` |
| **Trigger** | Various subscription lifecycle events |

---

### 4.5 Term Sheet Expiry Reminders (Automated) ✉️
| Field | Value |
|-------|-------|
| **Recipients** | Investors with expiring term sheets |
| **Subject** | `[Reminder Title] - VERSO Holdings` |
| **Trigger** | At 3 days, 1 day before expiry, and on expiry day |

---

### 4.6 Capital Call ✉️
| Field | Value |
|-------|-------|
| **Recipients** | Investors with capital call requirements |
| **Subject** | `[Title] - VERSO Holdings` |
| **Trigger** | When a capital call is issued |

---

### 4.7 Escrow Confirmed ✉️
| Field | Value |
|-------|-------|
| **Recipients** | Investors who funded escrow |
| **Subject** | `[Title] - VERSO Holdings` |
| **Trigger** | When escrow funding is confirmed |

---

### 4.8 Certificate Issued ✉️
| Field | Value |
|-------|-------|
| **Recipients** | Investors receiving share certificates |
| **Subject** | `[Title] - VERSO Holdings` |
| **Trigger** | When a certificate is issued |

---

## 5. INTRODUCER NOTIFICATIONS

### Emails Sent ✉️

#### 5.1 Agreement Signed ✉️
| Field | Value |
|-------|-------|
| **Recipients** | Introducers |
| **Subject** | `[Title] - VERSO Holdings` |
| **Trigger** | When introducer agreement is fully signed |

---

#### 5.2 Agreement Pending ✉️
| Field | Value |
|-------|-------|
| **Recipients** | Introducers |
| **Subject** | `[Title] - VERSO Holdings` |
| **Trigger** | When agreement awaits signature |

---

#### 5.3 Commission Accrued ✉️
| Field | Value |
|-------|-------|
| **Recipients** | Introducers who earned commission |
| **Subject** | `[Title] - VERSO Holdings` |
| **Trigger** | When a deal closes and commission is calculated |

**Email content:**
> **VERSO Holdings**
>
> **Commission Accrued**
>
> Hi [Name],
>
> You've earned a [amount] commission for [investor]'s investment in [deal].
>
> [View in Portal button]

---

#### 5.4 Invoice Submitted ✉️
| Field | Value |
|-------|-------|
| **Recipients** | Introducers |
| **Subject** | `[Title] - VERSO Holdings` |
| **Trigger** | When introducer submits invoice |

---

#### 5.5 Payment Confirmed ✉️
| Field | Value |
|-------|-------|
| **Recipients** | Introducers |
| **Subject** | `[Title] - VERSO Holdings` |
| **Trigger** | When payment is confirmed |

---

### Portal-Only Notifications (No Email)

| Notification | Trigger |
|--------------|---------|
| Agreement Rejected | When agreement is rejected |
| Pack Sent | When subscription pack sent to referred investor |
| Pack Approved | When pack approved by referred investor |
| Pack Signed | When pack signed by referred investor |
| Escrow Funded | When escrow funded by referred investor |
| Invoice Requested | When invoice requested by arranger |
| Invoice Approved | When CEO approves invoice |
| Invoice Rejected | When invoice rejected (request for change) |

---

## 6. PARTNER NOTIFICATIONS

### Emails Sent ✉️

#### 6.1 Commission Accrued ✉️
| Field | Value |
|-------|-------|
| **Recipients** | Partners who earned commission |
| **Subject** | `[Title] - VERSO Holdings` |
| **Trigger** | When a deal closes and partner commission is calculated |

---

#### 6.2 Payment Confirmed ✉️
| Field | Value |
|-------|-------|
| **Recipients** | Partners |
| **Subject** | `[Title] - VERSO Holdings` |
| **Trigger** | When payment is confirmed |

---

### Portal-Only Notifications (No Email)

| Notification | Trigger |
|--------------|---------|
| Invoice Requested | When invoice requested by arranger |
| Invoice Submitted | When invoice submitted |
| Invoiced | When marked as invoiced |
| Rejected | When invoice rejected |
| Deal Shared | When partner shares deal with investor |

---

## 7. COMMERCIAL PARTNER NOTIFICATIONS

### All Send Emails ✉️

#### 7.1 Commission Accrued ✉️
| Field | Value |
|-------|-------|
| **Recipients** | Commercial partners who earned commission |
| **Subject** | `[Title] - VERSO Holdings` |
| **Trigger** | When a deal closes and commission is calculated |

---

#### 7.2 Invoice Requested ✉️
| Field | Value |
|-------|-------|
| **Recipients** | Commercial partners |
| **Subject** | `[Title] - VERSO Holdings` |
| **Trigger** | When invoice is requested by arranger |

---

#### 7.3 Invoice Submitted ✉️
| Field | Value |
|-------|-------|
| **Recipients** | Commercial partners |
| **Subject** | `[Title] - VERSO Holdings` |
| **Trigger** | When invoice is submitted |

---

#### 7.4 Invoice Approved ✉️
| Field | Value |
|-------|-------|
| **Recipients** | Commercial partners |
| **Subject** | `[Title] - VERSO Holdings` |
| **Trigger** | When CEO approves invoice |

---

#### 7.5 Invoice Rejected ✉️
| Field | Value |
|-------|-------|
| **Recipients** | Commercial partners |
| **Subject** | `[Title] - VERSO Holdings` |
| **Trigger** | When invoice is rejected with request for changes |

---

#### 7.6 Payment Confirmed ✉️
| Field | Value |
|-------|-------|
| **Recipients** | Commercial partners |
| **Subject** | `[Title] - VERSO Holdings` |
| **Trigger** | When payment is confirmed |

---

## 8. NOT YET IMPLEMENTED

### 8.1 Deal Dispatch Notification 🚧 TODO
| Field | Value |
|-------|-------|
| **Recipients** | Users dispatched to a deal (investors, partners, introducers, commercial partners) |
| **Subject** | TBD |
| **Trigger** | When CEO dispatches users to a deal |
| **Status** | 🚧 **NOT IMPLEMENTED** - Code has `// TODO: Send notifications to dispatched users` |

**Current behavior:** Users are dispatched but receive no email. They must check the portal to see new deal access.

**Recommended implementation:** Send email notifying user they've been granted access to a new investment opportunity.

---

## Design Standards

### Email Structure
All notification emails follow this consistent structure:
1. **Header** - Dark navy background with "VERSO Holdings" branding
2. **Accent Bar** - Colored stripe indicating notification type
3. **Content Area** - Title, personalized greeting, and message in highlighted box
4. **Call-to-Action** - "View in Portal" button
5. **Footer** - Copyright notice and "do not reply" disclaimer

### Color Coding by Notification Type
| Color | Used For |
|-------|----------|
| 🟢 Green | Positive actions (approved, signed, confirmed, paid, escrow, certificate) |
| 🔴 Red | Negative actions (rejected, deactivated) |
| 🟣 Purple | Commission-related and deal invitations |
| 🟡 Amber/Yellow | Warnings, pending items, and capital calls |
| 🔵 Blue | Informational updates, KYC status, deal access |
| 🟤 Indigo | General platform actions, subscriptions, documents |

---

## Summary: What Sends Email vs Portal-Only

### ✉️ Sends Email (21 types)
| Category | Notification Types |
|----------|-------------------|
| Invitations | Staff, Investor, Professional Partner, Staff Role, Reminders |
| Security | Password Reset, Account Deactivated, Permissions Changed, Password Changed |
| Investor | KYC Status, KYC Expiry, Deal Invite, Subscription, Term Sheet Expiry, Capital Call, Escrow Confirmed, Certificate Issued |
| Introducer | Agreement Signed, Agreement Pending, Commission Accrued, Invoice Submitted, Payment Confirmed |
| Partner | Commission Accrued, Payment Confirmed |
| Commercial Partner | Commission Accrued, Invoice Requested, Invoice Submitted, Invoice Approved, Invoice Rejected, Payment Confirmed |

### 📱 Portal-Only (10 types)
| Category | Notification Types |
|----------|-------------------|
| General | NDA Complete, Document, Task, Approval, System |
| Introducer | Agreement Rejected, Pack Sent/Approved/Signed, Escrow Funded, Invoice Requested/Approved/Rejected |
| Partner | Invoice Requested/Submitted, Invoiced, Rejected, Deal Shared |

### 🚧 Not Implemented (2)
| Feature | Status |
|---------|--------|
| Deal Dispatch Email | TODO in code - users get no email when dispatched to deals |
| Partner Deal Share Email | Notification exists but no email template |

---

## Currently Disabled

| Email Type | Reason | Alternative |
|------------|--------|-------------|
| Signature request emails | Disabled for testing | Users access signature tasks via the portal |

---

## Technical Notes

- **Email provider:** Resend
- **Templates location:** `versotech-portal/src/lib/email/resend-service.ts`
- **Notification system:** `versotech-portal/src/lib/notifications.ts`
- **Email-enabled types:** Defined in `EMAIL_NOTIFICATION_TYPES` array (line 77-100 of notifications.ts)
- **Automated reminders:** Handled by Supabase Edge Functions (cron scheduled)

---

## Asymmetry Note

⚠️ **Commercial Partners receive more email notifications than Introducers/Partners:**

Commercial Partners get emails for: Invoice Requested, Invoice Approved, Invoice Rejected

Introducers and Partners do NOT get emails for these events (portal-only).

This may be intentional or may need alignment based on business requirements.

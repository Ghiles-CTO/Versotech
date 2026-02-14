export type PersonaType = 'ceo' | 'staff' | 'investor' | 'arranger' | 'introducer' | 'partner' | 'commercial_partner' | 'lawyer'

export interface HelpItem {
  id: string
  title: string
  content: string
  personas: PersonaType[]
  category: string
  tags: string[]
  priority: number
}

export interface PersonaHelpConfig {
  displayName: string
  subtitle: string
}

export const PERSONA_HELP_MAP: Record<PersonaType, PersonaHelpConfig> = {
  ceo: { displayName: 'CEO', subtitle: 'Operational oversight & approvals' },
  staff: { displayName: 'Staff', subtitle: 'Operational oversight & approvals' },
  investor: { displayName: 'Investor', subtitle: 'Opportunities, subscriptions & portfolio' },
  arranger: { displayName: 'Arranger', subtitle: 'Vehicles, deals & fee management' },
  introducer: { displayName: 'Introducer', subtitle: 'Introductions & commissions' },
  partner: { displayName: 'Partner', subtitle: 'Referrals & partnership commissions' },
  commercial_partner: { displayName: 'Commercial Partner', subtitle: 'Deal distribution & placement' },
  lawyer: { displayName: 'Lawyer', subtitle: 'Certificates & legal review' },
}

// ---------- GETTING STARTED (universal) ----------

export const GETTING_STARTED: HelpItem[] = [
  {
    id: 'gs-login',
    title: 'Logging In & Password Setup',
    content: 'Navigate to the portal and enter your email and password. If this is your first time, click the invitation link from your email (valid for 24 hours) to set up your password. Use "Forgot Password?" on the login page if you need to reset it.',
    personas: ['ceo', 'staff', 'investor', 'arranger', 'introducer', 'partner', 'commercial_partner', 'lawyer'],
    category: 'Getting Started',
    tags: ['login', 'password', 'setup', 'account'],
    priority: 1,
  },
  {
    id: 'gs-personas',
    title: 'Understanding Personas',
    content: 'A persona represents your role on the platform. Each persona has different capabilities and views. Many users have multiple personas (e.g., an arranger who is also an investor). Use the persona switcher in the top navigation to change roles. The sidebar and dashboard update to match your active persona.',
    personas: ['ceo', 'staff', 'investor', 'arranger', 'introducer', 'partner', 'commercial_partner', 'lawyer'],
    category: 'Getting Started',
    tags: ['personas', 'roles', 'switching', 'navigation'],
    priority: 2,
  },
  {
    id: 'gs-navigation',
    title: 'Navigating the Platform',
    content: 'The left sidebar provides access to major sections based on your active persona. The top navigation bar includes the persona switcher, notifications bell, and profile menu. Many pages have a "+ New" button for common actions like creating deals or recording introductions.',
    personas: ['ceo', 'staff', 'investor', 'arranger', 'introducer', 'partner', 'commercial_partner', 'lawyer'],
    category: 'Getting Started',
    tags: ['navigation', 'sidebar', 'menu', 'layout'],
    priority: 3,
  },
]

// ---------- FAQ CONTENT ----------

export const FAQ_CONTENT: HelpItem[] = [
  // --- Investor FAQs ---
  {
    id: 'faq-inv-kyc',
    title: 'What is KYC and why do I need it?',
    content: 'KYC (Know Your Customer) is a regulatory requirement. You need to complete KYC before you can subscribe to any deal. Go to your Profile page, fill in the required information (ID documents, proof of address, accreditation), and submit. The review typically takes 1-3 business days. Your KYC status must be "approved" before you can invest.',
    personas: ['investor'],
    category: 'Compliance',
    tags: ['kyc', 'verification', 'compliance', 'documents'],
    priority: 1,
  },
  {
    id: 'faq-inv-interest',
    title: 'How do I express interest in a deal?',
    content: 'Browse active deals on the Investment Opportunities page. Click on a deal to view its details, then click "Express Interest". Your request goes to the CEO/staff for approval. Once approved, you may need to sign an NDA before accessing the full data room. You\'ll be notified by email when your interest is approved or rejected.',
    personas: ['investor'],
    category: 'Deals',
    tags: ['interest', 'deals', 'opportunities', 'investing'],
    priority: 2,
  },
  {
    id: 'faq-inv-subscribe',
    title: 'How do I subscribe to a deal?',
    content: 'After your interest is approved and you\'ve reviewed the data room, click "Subscribe" on the deal page. Enter your subscription amount and confirm. The subscription goes through review, and you\'ll receive a subscription pack to sign. After signing, you\'ll need to fund your investment by the specified deadline.',
    personas: ['investor'],
    category: 'Subscriptions',
    tags: ['subscribe', 'subscription', 'invest', 'commitment'],
    priority: 3,
  },
  {
    id: 'faq-inv-nda',
    title: 'Why do I need to sign an NDA?',
    content: 'An NDA (Non-Disclosure Agreement) protects confidential deal information. After your interest is approved, you\'ll be prompted to sign the NDA electronically via VERSOSign. Once signed, you get access to the deal\'s data room with detailed documents, financials, and due diligence materials.',
    personas: ['investor'],
    category: 'Documents',
    tags: ['nda', 'confidentiality', 'signing', 'data room'],
    priority: 4,
  },
  {
    id: 'faq-inv-dataroom',
    title: 'How does data room access work?',
    content: 'After signing the NDA, you receive time-limited access to the deal\'s data room. You can view and download documents but cannot modify them. Access is typically granted for 30 days and may be extended by the arranger. If your access expires, contact the arranger to request an extension.',
    personas: ['investor'],
    category: 'Data Room',
    tags: ['data room', 'documents', 'access', 'expiry'],
    priority: 5,
  },
  {
    id: 'faq-inv-funding',
    title: 'How do I fund my investment?',
    content: 'After your subscription pack is signed, you\'ll see funding instructions with wire transfer details, the exact amount, reference number, and deadline. Transfer funds to the specified escrow account using the exact reference. Once confirmed by the arranger, your subscription status updates to "funded".',
    personas: ['investor'],
    category: 'Funding',
    tags: ['funding', 'payment', 'wire transfer', 'escrow'],
    priority: 6,
  },
  {
    id: 'faq-inv-portfolio',
    title: 'Where can I see my investments?',
    content: 'Go to Portfolio in the sidebar to view all your active investments, positions, and historical performance. Each position shows units held, cost basis, current NAV, and returns. You can also access deal documents and statements from the portfolio view.',
    personas: ['investor'],
    category: 'Portfolio',
    tags: ['portfolio', 'investments', 'positions', 'returns'],
    priority: 7,
  },
  {
    id: 'faq-inv-subpack',
    title: 'What is a subscription pack?',
    content: 'A subscription pack is the legal document bundle you sign to formalize your investment. It includes the subscription agreement, investor questionnaire, and other required forms. You\'ll receive it after your subscription is approved. Sign all required fields via VERSOSign, then proceed to fund your investment.',
    personas: ['investor'],
    category: 'Subscriptions',
    tags: ['subscription pack', 'signing', 'documents', 'versosign'],
    priority: 8,
  },

  // --- CEO/Staff FAQs ---
  {
    id: 'faq-ceo-approvals',
    title: 'How do I handle pending approvals?',
    content: 'Go to the Approvals page to see all items awaiting your decision. You can approve or reject investor interest requests, subscription submissions, and deal close requests. Each approval shows full context. Use the "Approve" or "Reject" buttons with an optional note. Approvals have SLA tracking so try to respond promptly.',
    personas: ['ceo', 'staff'],
    category: 'Approvals',
    tags: ['approvals', 'review', 'approve', 'reject'],
    priority: 1,
  },
  {
    id: 'faq-ceo-kyc-review',
    title: 'How do I review KYC submissions?',
    content: 'Go to KYC Review to see pending investor verifications. Review submitted documents (ID, proof of address, accreditation). You can approve, reject with feedback, or request additional documents. KYC expiry dates are tracked automatically, and you\'ll be notified when renewals are needed.',
    personas: ['ceo', 'staff'],
    category: 'Compliance',
    tags: ['kyc', 'review', 'compliance', 'verification'],
    priority: 2,
  },
  {
    id: 'faq-ceo-dealclose',
    title: 'What happens when a deal close is requested?',
    content: 'When an arranger requests a deal close, it appears in your Approvals queue. Review the deal summary, verify all subscriptions are funded and packs are signed, then approve. On approval, the system automatically creates positions for funded investors, accrues commissions for introducers/partners, and updates the deal status.',
    personas: ['ceo', 'staff'],
    category: 'Deals',
    tags: ['deal close', 'approval', 'commissions', 'positions'],
    priority: 3,
  },
  {
    id: 'faq-ceo-delegation',
    title: 'Can I delegate approvals to other staff?',
    content: 'Yes. Go to the delegation settings to assign approval authority to other staff members. You can delegate specific approval types (interest, subscriptions, deal close) or grant full delegation. Delegated approvals are tracked in the audit log with the delegate\'s identity.',
    personas: ['ceo', 'staff'],
    category: 'Administration',
    tags: ['delegation', 'authority', 'staff', 'permissions'],
    priority: 4,
  },
  {
    id: 'faq-ceo-users',
    title: 'How do I manage platform users?',
    content: 'Go to Users to invite new users, assign personas, and manage access. When inviting a user, specify their email, name, and which persona(s) they should have. They\'ll receive an invitation email to set up their account. You can also deactivate users or modify their personas.',
    personas: ['ceo', 'staff'],
    category: 'Administration',
    tags: ['users', 'invite', 'manage', 'personas'],
    priority: 5,
  },
  {
    id: 'faq-ceo-reconciliation',
    title: 'How does reconciliation work?',
    content: 'The Reconciliation page shows financial summaries across vehicles and deals. Track subscription amounts, funded amounts, fees collected, and commissions paid. Use filters to drill down by vehicle, deal, or time period. Export reports for accounting and audit purposes.',
    personas: ['ceo', 'staff'],
    category: 'Finance',
    tags: ['reconciliation', 'reporting', 'finance', 'accounting'],
    priority: 6,
  },

  // --- Arranger FAQs ---
  {
    id: 'faq-arr-vehicle',
    title: 'How do I create a vehicle?',
    content: 'Go to My Mandates and click "+ New Vehicle". Fill in the vehicle details: name, jurisdiction, type (fund, SPV, etc.), service providers, and legal structure. After creation, you can create deals under this vehicle and assign lawyers for certificate signing.',
    personas: ['arranger'],
    category: 'Vehicles',
    tags: ['vehicle', 'create', 'fund', 'spv'],
    priority: 1,
  },
  {
    id: 'faq-arr-deal',
    title: 'How do I create and manage a deal?',
    content: 'From your vehicle page, click "+ New Deal". Complete the three-step form: basic details (name, target amount, currency), investment terms, and closing schedule. After creation, set up term sheets, configure fee plans, and dispatch the deal to investors. Monitor subscription progress from the deal dashboard.',
    personas: ['arranger'],
    category: 'Deals',
    tags: ['deal', 'create', 'manage', 'investment'],
    priority: 2,
  },
  {
    id: 'faq-arr-feeplan',
    title: 'How do fee plans work?',
    content: 'Fee plans are deal-specific agreements with introducers, partners, or commercial partners. Go to Fee Plans and create one for each deal-counterparty combination. Set the fee type (flat, percentage, or tiered), rate, and payment terms. Send the plan for the counterparty\'s acceptance. Once accepted, commissions are calculated automatically at deal close.',
    personas: ['arranger'],
    category: 'Fees',
    tags: ['fee plan', 'commission', 'rates', 'agreement'],
    priority: 3,
  },
  {
    id: 'faq-arr-dispatch',
    title: 'How do I dispatch deals to investors?',
    content: 'From the deal page, use the dispatch function to share the deal with selected investors. You can dispatch to individual investors, your introducer network, or partner networks. Dispatched investors see the deal on their Investment Opportunities page and can express interest.',
    personas: ['arranger'],
    category: 'Distribution',
    tags: ['dispatch', 'investors', 'distribution', 'share'],
    priority: 4,
  },
  {
    id: 'faq-arr-termsheet',
    title: 'How do I create a term sheet?',
    content: 'Navigate to your deal and go to the Term Sheets tab. Click "Create Term Sheet" and fill in the investment terms, key conditions, and financial details. Preview the generated PDF before finalizing. You can generate and download the term sheet as a professional PDF document.',
    personas: ['arranger'],
    category: 'Documents',
    tags: ['term sheet', 'pdf', 'investment terms'],
    priority: 5,
  },
  {
    id: 'faq-arr-commission',
    title: 'How are commissions processed after close?',
    content: 'When a deal closes, the system automatically accrues commissions based on fee plans. You can then request invoices from introducers/partners, review submitted invoices, and mark commissions as paid. The commission lifecycle is: accrued → invoice_requested → invoice_submitted → invoiced → paid.',
    personas: ['arranger'],
    category: 'Commissions',
    tags: ['commission', 'payment', 'invoice', 'close'],
    priority: 6,
  },

  // --- Introducer FAQs ---
  {
    id: 'faq-int-agreement',
    title: 'How do I sign my introducer agreement?',
    content: 'When onboarded, you\'ll receive an introducer agreement to sign via VERSOSign. This master agreement governs your relationship with the arranger. Review the terms, sign electronically, and your profile becomes active. You can view your signed agreement anytime from the Agreements page.',
    personas: ['introducer'],
    category: 'Onboarding',
    tags: ['agreement', 'signing', 'onboarding', 'contract'],
    priority: 1,
  },
  {
    id: 'faq-int-feeplan',
    title: 'How do I review and accept fee plans?',
    content: 'When an arranger creates a fee plan for a deal, you\'ll be notified. Go to Agreements to review the terms: fee type (flat, percentage, or tiered), rates, and payment schedule. Click "Accept" to agree or "Reject" with comments. Accepted fee plans determine your commission on successful subscriptions.',
    personas: ['introducer'],
    category: 'Fee Plans',
    tags: ['fee plan', 'accept', 'reject', 'rates'],
    priority: 2,
  },
  {
    id: 'faq-int-introduction',
    title: 'How do I make introductions?',
    content: 'Go to Introductions and click "+ New Introduction". Select the deal and enter the investor\'s details. The investor will be invited to the platform if they don\'t have an account. Track your introductions and their status (whether the investor has subscribed) from the Introductions page.',
    personas: ['introducer'],
    category: 'Introductions',
    tags: ['introduction', 'referral', 'investor', 'client'],
    priority: 3,
  },
  {
    id: 'faq-int-commission',
    title: 'How do I track my commissions?',
    content: 'Go to My Commissions to see all earnings from introductions. Summary cards show Total Owed, Total Paid, Invoice Requested, and Invoiced amounts. Filter by status and date range. When a commission status shows "invoice_requested", submit your invoice promptly to receive payment.',
    personas: ['introducer'],
    category: 'Commissions',
    tags: ['commission', 'earnings', 'tracking', 'payment'],
    priority: 4,
  },
  {
    id: 'faq-int-invoice',
    title: 'How do I submit an invoice?',
    content: 'When a commission shows "invoice_requested" status, click on it and select "Submit Invoice". Upload your invoice PDF with the correct amount, your banking details, and any required tax information. The arranger reviews and approves your invoice, then payment is processed (typically within 30 days of approval).',
    personas: ['introducer'],
    category: 'Invoicing',
    tags: ['invoice', 'submit', 'payment', 'billing'],
    priority: 5,
  },

  // --- Partner FAQs ---
  {
    id: 'faq-par-agreement',
    title: 'How does the partnership agreement work?',
    content: 'Your partnership agreement is signed during onboarding via VERSOSign. It establishes the terms of your co-arrangement or referral relationship. View your signed agreement on the Profile page. Deal-specific fee plans are then created for each opportunity.',
    personas: ['partner'],
    category: 'Onboarding',
    tags: ['agreement', 'partnership', 'onboarding'],
    priority: 1,
  },
  {
    id: 'faq-par-referral',
    title: 'How do I refer investors to deals?',
    content: 'View available deals on the Opportunities page. From a deal, use the referral function to introduce your investor clients. Track all referrals on the Transactions page, which shows referral status, subscription progress, and associated commissions.',
    personas: ['partner'],
    category: 'Referrals',
    tags: ['referral', 'investor', 'transaction', 'deals'],
    priority: 2,
  },
  {
    id: 'faq-par-commission',
    title: 'How are my commissions calculated?',
    content: 'Commissions are based on your deal-specific fee plan and the funded amount of referred investors. After a deal closes, commissions accrue automatically. Track them on My Commissions. When "invoice_requested" appears, submit your invoice for payment. Commission basis is always the investor\'s funded amount.',
    personas: ['partner'],
    category: 'Commissions',
    tags: ['commission', 'calculation', 'funded amount', 'fee plan'],
    priority: 3,
  },
  {
    id: 'faq-par-shared',
    title: 'What are shared transactions?',
    content: 'Shared Deals shows transactions where you co-referred investors with other partners or introducers. This provides transparency into joint referrals and how commissions are split between parties based on respective fee plans.',
    personas: ['partner'],
    category: 'Transactions',
    tags: ['shared', 'co-referral', 'split', 'transactions'],
    priority: 4,
  },

  // --- Commercial Partner FAQs ---
  {
    id: 'faq-cp-placement',
    title: 'How do placement agreements work?',
    content: 'A placement agreement establishes your distribution relationship with the arranger. It\'s signed during onboarding via VERSOSign. Once active, you can distribute deals to your investor network. View and manage your agreements from the Agreements page.',
    personas: ['commercial_partner'],
    category: 'Agreements',
    tags: ['placement', 'agreement', 'distribution', 'onboarding'],
    priority: 1,
  },
  {
    id: 'faq-cp-distribute',
    title: 'How do I distribute deals to my network?',
    content: 'Browse available deals on Opportunities. When you find a suitable deal, use the distribution function to share it with your client investors. Track client activity on the Client Transactions page, which shows which clients have expressed interest, subscribed, or funded.',
    personas: ['commercial_partner'],
    category: 'Distribution',
    tags: ['distribute', 'deals', 'clients', 'network'],
    priority: 2,
  },
  {
    id: 'faq-cp-commission',
    title: 'How do I track and invoice commissions?',
    content: 'My Commissions shows all your placement fees. Summary cards display Total Owed, Total Paid, and pending amounts. When "invoice_requested" appears, submit your invoice with correct amount, banking details, and tax information. Payment typically processes within 30 days of invoice approval.',
    personas: ['commercial_partner'],
    category: 'Commissions',
    tags: ['commission', 'invoice', 'payment', 'tracking'],
    priority: 3,
  },
  {
    id: 'faq-cp-portfolio',
    title: 'Can I invest in deals myself?',
    content: 'Yes, if you also have an investor persona. Switch to your investor persona using the persona switcher in the top navigation. You can then browse opportunities and subscribe to deals as an investor, separate from your commercial partner distribution activities.',
    personas: ['commercial_partner'],
    category: 'Investing',
    tags: ['invest', 'persona', 'portfolio', 'dual role'],
    priority: 4,
  },

  // --- Lawyer FAQs ---
  {
    id: 'faq-law-assignments',
    title: 'How do vehicle assignments work?',
    content: 'When an arranger creates a vehicle, they may assign you as the legal counsel. You\'ll see assigned vehicles on the Assigned Deals page. Your role involves reviewing and signing share certificates, reviewing subscription packs, and providing legal oversight for the vehicle structure.',
    personas: ['lawyer'],
    category: 'Assignments',
    tags: ['assignment', 'vehicle', 'legal counsel'],
    priority: 1,
  },
  {
    id: 'faq-law-certificates',
    title: 'How do I sign share certificates?',
    content: 'When a deal closes and positions are created, share certificates are generated for each investor. Go to VERSOSign to review and sign certificates. Each certificate requires your digital signature as legal counsel. You can review the certificate details, investor information, and position data before signing.',
    personas: ['lawyer'],
    category: 'Certificates',
    tags: ['certificate', 'signing', 'share', 'legal'],
    priority: 2,
  },
  {
    id: 'faq-law-packs',
    title: 'How do I review subscription packs?',
    content: 'Subscription packs may be sent to you for legal review before they\'re sent to investors for signing. Access them from Subscription Packs in the sidebar. Review the legal terms, investor questionnaire, and compliance sections. Provide feedback or approve for distribution.',
    personas: ['lawyer'],
    category: 'Subscription Packs',
    tags: ['subscription pack', 'review', 'legal', 'compliance'],
    priority: 3,
  },
]

// ---------- HOW-TO CONTENT ----------

export const HOW_TO_CONTENT: HelpItem[] = [
  // --- Investor How-Tos ---
  {
    id: 'how-inv-subscribe',
    title: 'Subscribe to a Deal',
    content: '1. Go to **Investment Opportunities** in the sidebar\n2. Browse active deals and click one to view details\n3. Click **"Express Interest"** and wait for approval\n4. Sign the NDA when prompted (via VERSOSign)\n5. Review the data room documents thoroughly\n6. Click **"Subscribe"** and enter your investment amount\n7. Wait for subscription approval\n8. Sign the subscription pack via VERSOSign\n9. Transfer funds using the provided wire instructions\n10. Your subscription status updates to "funded" once confirmed',
    personas: ['investor'],
    category: 'Subscriptions',
    tags: ['subscribe', 'invest', 'deal', 'step-by-step'],
    priority: 1,
  },
  {
    id: 'how-inv-kyc',
    title: 'Complete Your KYC Verification',
    content: '1. Go to **Profile** in the sidebar\n2. Click on the **KYC section**\n3. Upload your identification document (passport or national ID)\n4. Upload proof of address (utility bill or bank statement, less than 3 months old)\n5. Complete the accreditation questionnaire\n6. Provide source of funds documentation if required\n7. Click **"Submit for Review"**\n8. Wait for staff review (typically 1-3 business days)\n9. You\'ll receive an email when approved or if additional documents are needed',
    personas: ['investor'],
    category: 'Compliance',
    tags: ['kyc', 'verification', 'documents', 'setup'],
    priority: 2,
  },
  {
    id: 'how-inv-portfolio',
    title: 'View Your Portfolio & Positions',
    content: '1. Go to **Portfolio** in the sidebar\n2. View your portfolio summary with total invested value\n3. See each position with: vehicle name, units, cost basis, current NAV\n4. Click on a position for detailed history\n5. Access statements and documents for each investment\n6. Use filters to view by vehicle, date, or status',
    personas: ['investor'],
    category: 'Portfolio',
    tags: ['portfolio', 'positions', 'investments', 'view'],
    priority: 3,
  },
  {
    id: 'how-inv-sign-nda',
    title: 'Sign a Deal NDA',
    content: '1. After your interest is approved, you\'ll receive a notification\n2. Click the notification or go to the deal page\n3. Click **"Sign NDA"** to open VERSOSign\n4. Review the NDA terms carefully\n5. Click through each signature field\n6. Apply your electronic signature\n7. Click **"Complete Signing"**\n8. You\'ll get immediate access to the data room',
    personas: ['investor'],
    category: 'Documents',
    tags: ['nda', 'signing', 'versosign', 'data room'],
    priority: 4,
  },
  {
    id: 'how-inv-fund',
    title: 'Fund Your Investment',
    content: '1. After signing your subscription pack, go to the deal page\n2. View the **funding instructions** section\n3. Note the bank account details, exact amount, and reference number\n4. Initiate a wire transfer from your bank using the exact details\n5. Use the reference number provided (critical for matching)\n6. The arranger confirms receipt and updates your status\n7. Status changes from "committed" to "funded"',
    personas: ['investor'],
    category: 'Funding',
    tags: ['fund', 'wire transfer', 'payment', 'banking'],
    priority: 5,
  },

  // --- CEO/Staff How-Tos ---
  {
    id: 'how-ceo-approve-sub',
    title: 'Approve a Subscription',
    content: '1. Go to **Approvals** in the sidebar\n2. Find the subscription approval in the pending list\n3. Review the investor details, KYC status, and subscription amount\n4. Check the investor\'s accreditation and compliance status\n5. Click **"Approve"** to proceed or **"Reject"** with a reason\n6. The investor is notified and the subscription pack is prepared',
    personas: ['ceo', 'staff'],
    category: 'Approvals',
    tags: ['approve', 'subscription', 'review'],
    priority: 1,
  },
  {
    id: 'how-ceo-close-deal',
    title: 'Approve a Deal Close',
    content: '1. Go to **Approvals** and find the deal close request\n2. Review the deal summary: total subscribed, total funded, outstanding items\n3. Verify all subscription packs are signed\n4. Verify all funding has been received\n5. Click **"Approve Close"**\n6. The system automatically creates investor positions and accrues commissions\n7. Deal status changes to "closed"',
    personas: ['ceo', 'staff'],
    category: 'Deals',
    tags: ['deal close', 'approve', 'positions', 'commissions'],
    priority: 2,
  },
  {
    id: 'how-ceo-manage-users',
    title: 'Invite and Manage Users',
    content: '1. Go to **Users** in the sidebar\n2. Click **"+ Invite User"**\n3. Enter the user\'s email, name, and select their persona(s)\n4. Click **"Send Invitation"**\n5. The user receives an email to set up their account\n6. To modify a user, click on them in the list\n7. You can add/remove personas, update details, or deactivate the account',
    personas: ['ceo', 'staff'],
    category: 'Administration',
    tags: ['users', 'invite', 'manage', 'personas'],
    priority: 3,
  },
  {
    id: 'how-ceo-review-kyc',
    title: 'Review KYC Submissions',
    content: '1. Go to **KYC Review** in the sidebar\n2. See all pending KYC submissions\n3. Click on a submission to review documents\n4. Verify ID documents, proof of address, and accreditation\n5. Click **"Approve"** if compliant, or **"Request Changes"** with notes\n6. For rejections, provide clear feedback on what\'s needed\n7. The investor is notified of the decision',
    personas: ['ceo', 'staff'],
    category: 'Compliance',
    tags: ['kyc', 'review', 'approve', 'compliance'],
    priority: 4,
  },

  // --- Arranger How-Tos ---
  {
    id: 'how-arr-create-deal',
    title: 'Create a New Deal',
    content: '1. Go to **My Mandates** in the sidebar\n2. Select the vehicle (or create one first)\n3. Click **"+ New Deal"**\n4. **Step 1:** Enter deal name, description, target amount, currency, and stock type\n5. **Step 2:** Set investment terms and conditions\n6. **Step 3:** Configure the closing schedule and save as draft\n7. Create a term sheet for the deal\n8. Set up fee plans for introducers/partners\n9. When ready, change deal status to "open" to start accepting interest',
    personas: ['arranger'],
    category: 'Deals',
    tags: ['create', 'deal', 'vehicle', 'setup'],
    priority: 1,
  },
  {
    id: 'how-arr-feeplan',
    title: 'Set Up a Fee Plan',
    content: '1. Go to **Fee Plans** in the sidebar\n2. Click **"+ New Fee Plan"**\n3. Select the deal this fee plan applies to\n4. Select the counterparty (introducer, partner, or commercial partner)\n5. Choose fee type: flat amount, percentage, or tiered\n6. For tiered: define brackets (e.g., 0-500K at 2.5%, 500K-1M at 2.0%)\n7. Set payment terms\n8. Click **"Send for Acceptance"**\n9. The counterparty reviews and accepts or rejects the plan',
    personas: ['arranger'],
    category: 'Fees',
    tags: ['fee plan', 'create', 'tiered', 'commission'],
    priority: 2,
  },
  {
    id: 'how-arr-dataroom',
    title: 'Manage a Data Room',
    content: '1. Go to your deal page and open the **Data Room** tab\n2. Click **"Upload Files"** to add documents or **"Upload Folder"** for bulk upload\n3. Organize documents into categories (legal, financial, due diligence)\n4. Set access permissions for different investor groups\n5. Monitor who has accessed which documents\n6. Extend or revoke access as needed from the access management panel',
    personas: ['arranger'],
    category: 'Data Room',
    tags: ['data room', 'upload', 'documents', 'access'],
    priority: 3,
  },
  {
    id: 'how-arr-process-commission',
    title: 'Process Commissions After Close',
    content: '1. After deal close, go to the deal page\n2. View accrued commissions in the Commissions tab\n3. Click **"Request Invoice"** for each commission\n4. The introducer/partner receives a notification to submit their invoice\n5. Review submitted invoices for accuracy\n6. Click **"Approve Invoice"** if correct, or reject with feedback\n7. Process payment and mark as "paid" when complete',
    personas: ['arranger'],
    category: 'Commissions',
    tags: ['commission', 'invoice', 'payment', 'process'],
    priority: 4,
  },
  {
    id: 'how-arr-network',
    title: 'Manage Your Network',
    content: '1. Use **My Introducers**, **My Partners**, **My Commercial Partners**, and **My Lawyers** in the sidebar\n2. View all your network counterparties and their status\n3. Click on a counterparty to see their profile, agreements, and activity\n4. Add new counterparties by sending invitations\n5. Track performance metrics: introductions made, subscriptions generated, commissions earned',
    personas: ['arranger'],
    category: 'Network',
    tags: ['network', 'introducers', 'partners', 'manage'],
    priority: 5,
  },

  // --- Introducer How-Tos ---
  {
    id: 'how-int-accept-feeplan',
    title: 'Accept a Fee Plan',
    content: '1. You\'ll receive a notification when a new fee plan is sent\n2. Go to **Agreements** in the sidebar\n3. Find the fee plan with "pending" status\n4. Review the terms: deal name, fee type, rates, and payment schedule\n5. Click **"Accept"** to agree to the terms\n6. Or click **"Reject"** and provide your comments\n7. Once accepted, your commissions are automatically calculated at deal close',
    personas: ['introducer'],
    category: 'Fee Plans',
    tags: ['fee plan', 'accept', 'review', 'agreement'],
    priority: 1,
  },
  {
    id: 'how-int-track-commissions',
    title: 'Track and Manage Commissions',
    content: '1. Go to **My Commissions** in the sidebar\n2. View summary cards: Total Owed, Total Paid, Invoice Requested, Invoiced\n3. Use status and date filters to find specific commissions\n4. Click on a commission for detailed breakdown\n5. When status is "invoice_requested", prepare and submit your invoice\n6. Monitor progress from submitted → invoiced → paid',
    personas: ['introducer'],
    category: 'Commissions',
    tags: ['commission', 'track', 'earnings', 'status'],
    priority: 2,
  },
  {
    id: 'how-int-submit-invoice',
    title: 'Submit an Invoice for Payment',
    content: '1. Go to **My Commissions** and find commissions with "invoice_requested" status\n2. Click on the commission and select **"Submit Invoice"**\n3. Upload your invoice as PDF with: your details, invoice number, exact commission amount, banking details, and tax info\n4. Verify the amount matches the commission\n5. Click **"Submit"**\n6. The arranger reviews your invoice (1-7 days)\n7. If approved, payment processes within 30 days\n8. If rejected, review the feedback and resubmit a corrected invoice',
    personas: ['introducer'],
    category: 'Invoicing',
    tags: ['invoice', 'submit', 'payment', 'billing'],
    priority: 3,
  },

  // --- Partner How-Tos ---
  {
    id: 'how-par-refer-investors',
    title: 'Refer Investors to Deals',
    content: '1. Go to **Opportunities** to browse available deals\n2. Select a deal suitable for your client investors\n3. Use the referral function to introduce your investor\n4. Enter the investor\'s details if they\'re new to the platform\n5. Track the referral on the **Transactions** page\n6. Monitor whether the investor expresses interest, subscribes, and funds',
    personas: ['partner'],
    category: 'Referrals',
    tags: ['refer', 'investor', 'deal', 'introduce'],
    priority: 1,
  },
  {
    id: 'how-par-track-commissions',
    title: 'Track Commissions and Submit Invoices',
    content: '1. Go to **My Commissions** in the sidebar\n2. View your commission summary and individual entries\n3. Filter by status, deal, or date range\n4. When "invoice_requested" appears, click on the commission\n5. Upload your invoice PDF with correct details\n6. Submit and wait for arranger approval\n7. Payment typically processes within 30 days of approval',
    personas: ['partner'],
    category: 'Commissions',
    tags: ['commission', 'invoice', 'track', 'payment'],
    priority: 2,
  },
  {
    id: 'how-par-view-shared',
    title: 'View Shared Transactions',
    content: '1. Go to **Shared Deals** in the sidebar\n2. See all co-referred transactions with other partners or introducers\n3. View the commission split breakdown\n4. Track each party\'s contribution and earnings\n5. Use this for reconciliation and transparency with co-referral partners',
    personas: ['partner'],
    category: 'Transactions',
    tags: ['shared', 'co-referral', 'transactions', 'view'],
    priority: 3,
  },

  // --- Commercial Partner How-Tos ---
  {
    id: 'how-cp-distribute',
    title: 'Distribute Deals to Your Network',
    content: '1. Go to **Opportunities** in the sidebar\n2. Browse available deals and review details\n3. Select a deal suitable for your client network\n4. Use the distribution function to share with clients\n5. Track client activity on the **Client Transactions** page\n6. Monitor interest, subscriptions, and funding progress\n7. Commissions accrue automatically when deals close',
    personas: ['commercial_partner'],
    category: 'Distribution',
    tags: ['distribute', 'deals', 'clients', 'network'],
    priority: 1,
  },
  {
    id: 'how-cp-invoice',
    title: 'Submit Invoices for Placement Fees',
    content: '1. Go to **My Commissions** in the sidebar\n2. Find commissions with "invoice_requested" status\n3. Click on the commission and select **"Submit Invoice"**\n4. Upload your invoice PDF with exact amount and banking details\n5. Include any required tax information (VAT, withholding tax)\n6. Submit and monitor the approval process\n7. Payment processes within 30 days of invoice approval',
    personas: ['commercial_partner'],
    category: 'Invoicing',
    tags: ['invoice', 'placement fee', 'payment', 'submit'],
    priority: 2,
  },
  {
    id: 'how-cp-manage-clients',
    title: 'Manage Client Transactions',
    content: '1. Go to **Client Transactions** in the sidebar\n2. View all your distributed clients and their activity\n3. Track each client\'s journey: interest → NDA → subscription → funding\n4. See commission projections for each active transaction\n5. Use filters to view by deal, status, or client name',
    personas: ['commercial_partner'],
    category: 'Clients',
    tags: ['clients', 'transactions', 'manage', 'track'],
    priority: 3,
  },

  // --- Lawyer How-Tos ---
  {
    id: 'how-law-sign-cert',
    title: 'Sign Share Certificates',
    content: '1. Go to **VERSOSign** in the sidebar\n2. Find pending certificates awaiting your signature\n3. Click on a certificate to review the details\n4. Verify the investor name, position details, and share allocation\n5. Review the certificate format and legal text\n6. Apply your electronic signature\n7. Click **"Complete Signing"** to finalize\n8. The signed certificate is automatically distributed to the investor',
    personas: ['lawyer'],
    category: 'Certificates',
    tags: ['sign', 'certificate', 'share', 'versosign'],
    priority: 1,
  },
  {
    id: 'how-law-review-packs',
    title: 'Review Subscription Packs',
    content: '1. Go to **Subscription Packs** in the sidebar\n2. View packs assigned for your legal review\n3. Click on a pack to open the full document\n4. Review legal terms, investor questionnaire, and compliance sections\n5. Provide feedback or approve for distribution\n6. The arranger is notified of your review outcome',
    personas: ['lawyer'],
    category: 'Legal Review',
    tags: ['subscription pack', 'review', 'legal', 'approve'],
    priority: 2,
  },
]

/**
 * Filter help items by persona type.
 * CEO and staff share the same content.
 */
export function filterByPersona(items: HelpItem[], personaType: PersonaType): HelpItem[] {
  return items
    .filter(item => item.personas.includes(personaType))
    .sort((a, b) => a.priority - b.priority)
}

/**
 * Filter help items by multiple persona types (union).
 * Returns items matching ANY of the provided personas, sorted by priority.
 */
export function filterByPersonas(items: HelpItem[], personaTypes: PersonaType[]): HelpItem[] {
  return items
    .filter(item => item.personas.some(p => personaTypes.includes(p)))
    .sort((a, b) => a.priority - b.priority)
}

/**
 * Search across all help items by query string.
 */
export function searchHelpItems(items: HelpItem[], query: string): HelpItem[] {
  const q = query.toLowerCase().trim()
  if (!q) return items
  return items.filter(item =>
    item.title.toLowerCase().includes(q) ||
    item.content.toLowerCase().includes(q) ||
    item.tags.some(tag => tag.toLowerCase().includes(q)) ||
    item.category.toLowerCase().includes(q)
  )
}

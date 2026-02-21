/**
 * Platform Tour Configuration
 *
 * Defines comprehensive tour steps for each persona type. Steps reference elements
 * via data-tour attributes and support page navigation for multi-page tours.
 *
 * IMPORTANT: Selectors are generated from nav item names as:
 * `nav-${name.toLowerCase().replace(/\s+/g, '-')}`
 *
 * Example: "My Mandates" → nav-my-mandates
 */

export interface TourStep {
  id: string
  target: string // CSS selector with data-tour attribute
  title: string
  content: string
  detailedContent?: string // Extended description for complex features
  features?: string[] // Key capabilities as bullet points
  emptyStateContent?: string // Shown when page has no data yet
  navigateTo?: string // Route to navigate to before highlighting
  placement?: 'top' | 'bottom' | 'left' | 'right'
  highlightPadding?: number // Custom padding around highlighted element
}

export const TOUR_VERSION = '3.0.0'

// ============================================================================
// INVESTOR (Entity) TOUR - 6 steps
// For companies/entities investing through the platform
// ============================================================================
const investorEntityTour: TourStep[] = [
  {
    id: 'dashboard',
    target: '[data-tour="nav-dashboard"]',
    title: 'Your Investment Dashboard',
    content: 'Your central hub for monitoring all investments and entity activity.',
    detailedContent: `The dashboard provides a comprehensive overview of your investment portfolio.
      Here you'll see your total committed capital, active investments, pending actions, and recent
      distributions. The portal snapshot shows key dates and deadlines. For entity accounts, you can
      also see activity across all authorized members.`,
    features: [
      'Portfolio value and performance metrics',
      'Open opportunities matching your investment mandate',
      'Outstanding tasks requiring your attention',
      'Active holdings across all investment vehicles',
      'Recent activity timeline for your entity',
      'Quick access to key documents and deadlines'
    ],
    emptyStateContent: 'Once you start investing, this dashboard will display your portfolio metrics, active investments, and pending actions requiring attention.',
    placement: 'right'
  },
  {
    id: 'opportunities',
    target: '[data-tour="nav-investment-opportunities"]',
    title: 'Investment Opportunities',
    content: 'Browse available deals and express interest in new investment opportunities.',
    detailedContent: `This is where you discover new investment opportunities curated by VERSO. Each deal
      card shows the target company, investment vehicle, minimum ticket size, and key terms. You can
      express interest, view detailed documentation, and initiate the subscription process directly
      from this page.`,
    features: [
      'Browse curated investment opportunities',
      'Filter by sector, geography, and deal size',
      'View detailed deal terms and documentation',
      'Express interest with one click',
      'Track your pipeline of potential investments',
      'Access investor presentations and data rooms'
    ],
    emptyStateContent: 'Available investment opportunities will appear here. Check back regularly as new deals are added to the platform.',
    placement: 'right'
  },
  {
    id: 'portfolio',
    target: '[data-tour="nav-portfolio"]',
    title: 'Your Portfolio',
    content: 'Track your holdings, distributions, and performance across all investments.',
    detailedContent: `Your portfolio page shows every investment your entity has made. Track NAV movements,
      distributions received, and overall performance. Each holding shows your committed capital, funded
      amount, current valuation, and any distributions you've received.`,
    features: [
      'View all active holdings and their current values',
      'Track NAV changes and performance over time',
      'Monitor distributions and capital returns',
      'Download portfolio statements',
      'See investment timeline and milestones',
      'Export data for your records'
    ],
    emptyStateContent: 'After you make your first investment, your holdings will appear here with live NAV tracking and performance metrics.',
    placement: 'right'
  },
  {
    id: 'documents',
    target: '[data-tour="nav-documents"]',
    title: 'Your Documents',
    content: 'Access all your investment documents, statements, and legal agreements.',
    detailedContent: `All your investment-related documents are stored here for easy access. Find subscription
      agreements, quarterly statements, tax documents (K-1s), fund reports, and any signed legal agreements.
      Documents are organized by investment and can be downloaded individually or in bulk.`,
    features: [
      'Subscription agreements and side letters',
      'Quarterly and annual statements',
      'Tax documents including K-1 forms',
      'Fund reports and investor updates',
      'Entity compliance documents',
      'Signed agreements and amendments'
    ],
    emptyStateContent: 'Your investment documents will be stored here. After subscribing to deals, you\'ll find all related paperwork in this section.',
    placement: 'right'
  },
  {
    id: 'inbox',
    target: '[data-tour="nav-inbox"]',
    title: 'Your Inbox',
    content: 'View tasks, messages, and notifications all in one place.',
    detailedContent: `Your inbox consolidates all platform communications and action items. See pending
      tasks that require your attention, messages from arrangers and VERSO staff, and important
      notifications about your investments. Tasks are prioritized so you always know what needs
      immediate attention.`,
    features: [
      'Pending tasks requiring your action',
      'Messages from deal arrangers',
      'Platform notifications and alerts',
      'Document signing requests',
      'KYC update reminders',
      'Distribution announcements'
    ],
    emptyStateContent: 'Messages, tasks, and notifications will appear here as you engage with the platform.',
    placement: 'right'
  },
  {
    id: 'profile',
    target: '[data-tour="nav-profile"]',
    title: 'Entity Profile & Settings',
    content: 'Manage your entity details, authorized members, KYC status, and account settings.',
    detailedContent: `As an entity investor, this is where you manage your investment entity's information.
      Update company details, add or remove authorized signatories, track KYC/AML verification status,
      and configure notification preferences. You can also manage which team members have access to
      view and transact on behalf of your entity.`,
    features: [
      'Entity legal name and registration details',
      'Authorized signatories and their permissions',
      'Member access management for your team',
      'KYC/AML verification status tracking',
      'Bank account details for distributions',
      'Notification and communication preferences'
    ],
    placement: 'right'
  }
]

// ============================================================================
// INVESTOR (Individual) TOUR - 6 steps
// For individual investors (simpler, personal focus)
// ============================================================================
const investorIndividualTour: TourStep[] = [
  {
    id: 'dashboard',
    target: '[data-tour="nav-dashboard"]',
    title: 'Your Investment Dashboard',
    content: 'Your personal hub for tracking investments and portfolio activity.',
    detailedContent: `The dashboard gives you a complete picture of your investment portfolio. See your
      total invested capital, current valuations, pending opportunities, and recent activity. Key dates
      and upcoming actions are highlighted so you never miss an important deadline.`,
    features: [
      'Portfolio value at a glance',
      'Open opportunities that match your profile',
      'Tasks requiring your attention',
      'Your active investments',
      'Recent activity timeline',
      'Quick access to documents'
    ],
    emptyStateContent: 'Once you start investing, this dashboard will show your portfolio overview, active investments, and pending actions.',
    placement: 'right'
  },
  {
    id: 'opportunities',
    target: '[data-tour="nav-investment-opportunities"]',
    title: 'Investment Opportunities',
    content: 'Discover and evaluate new investment opportunities curated by VERSO.',
    detailedContent: `Browse available investment opportunities here. Each deal shows essential information
      like minimum investment size, expected returns, and key terms. You can express interest, access
      detailed documentation, and start the subscription process when you're ready.`,
    features: [
      'Browse curated investment deals',
      'View key terms and minimum tickets',
      'Access investor presentations',
      'Express interest with one click',
      'Track deals you\'re considering',
      'Start the subscription process'
    ],
    emptyStateContent: 'Investment opportunities will appear here as they become available. Check back regularly for new deals.',
    placement: 'right'
  },
  {
    id: 'portfolio',
    target: '[data-tour="nav-portfolio"]',
    title: 'Your Portfolio',
    content: 'Monitor your investments, track performance, and view distributions.',
    detailedContent: `Your portfolio page displays all your investments with live NAV tracking. See how
      much you've invested, current valuations, and any distributions you've received. Track your
      investment journey from subscription to returns.`,
    features: [
      'All your active holdings',
      'Live NAV and performance tracking',
      'Distribution history',
      'Investment timeline',
      'Downloadable statements',
      'Performance analytics'
    ],
    emptyStateContent: 'After making your first investment, you\'ll see your holdings here with real-time performance tracking.',
    placement: 'right'
  },
  {
    id: 'documents',
    target: '[data-tour="nav-documents"]',
    title: 'Your Documents',
    content: 'Access subscription agreements, statements, tax forms, and reports.',
    detailedContent: `Find all your investment documents in one place. Subscription agreements, quarterly
      statements, tax documents (K-1s), and fund reports are organized by investment for easy access.`,
    features: [
      'Subscription documents',
      'Quarterly statements',
      'Tax documents (K-1s)',
      'Fund reports',
      'Signed agreements',
      'Investor updates'
    ],
    emptyStateContent: 'Your investment documents will be stored here after you subscribe to deals.',
    placement: 'right'
  },
  {
    id: 'inbox',
    target: '[data-tour="nav-inbox"]',
    title: 'Your Inbox',
    content: 'Stay updated with messages, tasks, and important notifications.',
    detailedContent: `Your inbox keeps you informed of everything happening with your investments. See
      pending tasks, messages from the VERSO team, and important notifications about your portfolio.`,
    features: [
      'Pending action items',
      'Messages from VERSO',
      'Investment notifications',
      'Document signing requests',
      'Distribution alerts',
      'KYC reminders'
    ],
    emptyStateContent: 'Messages and notifications will appear here as you use the platform.',
    placement: 'right'
  },
  {
    id: 'profile',
    target: '[data-tour="nav-profile"]',
    title: 'Your Profile',
    content: 'Manage your personal details, verification status, and preferences.',
    detailedContent: `Update your personal information, track your KYC verification status, and manage
      your account settings. Make sure your contact details and bank information are up to date to
      ensure smooth transactions and distributions.`,
    features: [
      'Personal information',
      'KYC verification status',
      'Bank account for distributions',
      'Contact preferences',
      'Notification settings',
      'Security options'
    ],
    placement: 'right'
  }
]

// ============================================================================
// CEO TOUR - 6 steps
// Executive overview of the entire platform
// ============================================================================
const ceoTour: TourStep[] = [
  {
    id: 'dashboard',
    target: '[data-tour="nav-dashboard"]',
    title: 'Executive Dashboard',
    content: 'Platform-wide metrics, AUM tracking, and real-time activity overview.',
    detailedContent: `Your executive dashboard provides a bird's-eye view of the entire VERSO platform.
      Monitor total AUM, active deals across all arrangers, investor activity, and team performance.
      Key metrics are updated in real-time so you always have the current state of the business.`,
    features: [
      'Total AUM and growth trends',
      'Active deal pipeline across all arrangers',
      'New investor onboarding metrics',
      'Subscription activity and conversion rates',
      'Team activity and workload distribution',
      'Platform health and system status'
    ],
    emptyStateContent: 'Platform metrics will populate as deals are created and investors subscribe.',
    placement: 'right'
  },
  {
    id: 'approvals',
    target: '[data-tour="nav-approvals"]',
    title: 'Executive Approvals',
    content: 'Review and approve items requiring executive sign-off.',
    detailedContent: `All items requiring CEO approval flow through this page. Review KYC approvals,
      high-value subscriptions, fee plan changes, and other decisions that need executive authorization.
      You can approve, reject, or delegate items with full audit trail tracking.`,
    features: [
      'Pending approval requests',
      'KYC and compliance sign-offs',
      'High-value subscription approvals',
      'Fee plan authorizations',
      'Delegation capabilities',
      'Complete audit trail'
    ],
    emptyStateContent: 'Items requiring your approval will appear here. The queue is currently empty.',
    placement: 'right'
  },
  {
    id: 'deals',
    target: '[data-tour="nav-deals"]',
    title: 'Deal Pipeline',
    content: 'Monitor all deals across the platform from draft to close.',
    detailedContent: `View and manage every deal on the platform. Track deal status from draft through
      active to closed, monitor subscription progress, and oversee arranger performance. Access
      detailed deal analytics and close management tools.`,
    features: [
      'All platform deals in one view',
      'Status tracking (draft → active → closed)',
      'Subscription progress per deal',
      'Arranger performance metrics',
      'Deal close management',
      'Historical deal data and analytics'
    ],
    placement: 'right'
  },
  {
    id: 'reconciliation',
    target: '[data-tour="nav-reconciliation"]',
    title: 'Financial Reconciliation',
    content: 'Track fee collection, payments, and financial reporting.',
    detailedContent: `The reconciliation center is your financial control hub. Track fee invoicing,
      payment collection status, partner commissions, and generate financial reports. Ensure all
      fees are collected and payments are properly allocated.`,
    features: [
      'Fee billing status across all deals',
      'Payment tracking and collection',
      'Partner commission management',
      'Invoice generation and tracking',
      'Financial reports and exports',
      'Aging analysis and follow-ups'
    ],
    placement: 'right'
  },
  {
    id: 'audit',
    target: '[data-tour="nav-audit"]',
    title: 'Audit & Compliance',
    content: 'Review platform activity logs and compliance tracking.',
    detailedContent: `Complete visibility into all platform activity. Every action is logged with
      user, timestamp, and details. Filter by user, date range, or action type to investigate
      specific events. Essential for compliance, security, and operational oversight.`,
    features: [
      'Comprehensive activity logs',
      'User action tracking',
      'Security event monitoring',
      'Compliance audit trails',
      'Filter by user/date/action',
      'Export for reporting'
    ],
    placement: 'right'
  },
  {
    id: 'admin',
    target: '[data-tour="nav-admin"]',
    title: 'Administration',
    content: 'System settings, user management, and platform configuration.',
    detailedContent: `Access administrative controls for the entire platform. Manage user accounts,
      configure system settings, set up new arrangers and partners, and maintain platform security.
      Only accessible to CEO and admin roles.`,
    features: [
      'User account management',
      'Role and permission settings',
      'Platform configuration',
      'Arranger and partner setup',
      'System preferences',
      'Security settings'
    ],
    placement: 'right'
  }
]

// ============================================================================
// ARRANGER TOUR - 6 steps
// Deal arrangers managing mandates and partners
// ============================================================================
const arrangerTour: TourStep[] = [
  {
    id: 'dashboard',
    target: '[data-tour="nav-dashboard"]',
    title: 'Arranger Dashboard',
    content: 'Your deal pipeline, AUM metrics, and partner activity at a glance.',
    detailedContent: `The arranger dashboard gives you complete visibility into your mandates. Track
      your AUM, monitor subscription progress across deals, and see referral activity from your
      introducer and partner network. Key metrics help you prioritize where to focus.`,
    features: [
      'Your total AUM under management',
      'Deal pipeline by status',
      'Subscription progress tracking',
      'Partner referral activity',
      'Upcoming close dates',
      'Performance vs targets'
    ],
    emptyStateContent: 'Once you have active mandates, metrics and activity will appear here.',
    placement: 'right'
  },
  {
    id: 'mandates',
    target: '[data-tour="nav-my-mandates"]',
    title: 'My Mandates',
    content: 'Manage your deals, track subscriptions, and oversee close timelines.',
    detailedContent: `This is your command center for deals you're arranging. Create new deals, manage
      active mandates, track subscription progress, and coordinate deal closes. Each mandate shows
      investor commitments, documentation status, and timeline to closing.`,
    features: [
      'Create and configure new deals',
      'Track subscription commitments',
      'Monitor documentation completion',
      'Manage close timelines',
      'Investor communication tools',
      'Deal performance analytics'
    ],
    emptyStateContent: 'Your mandates will appear here. Start by creating a new deal or wait for deals to be assigned to you.',
    placement: 'right'
  },
  {
    id: 'subscription-packs',
    target: '[data-tour="nav-subscription-packs"]',
    title: 'Subscription Packs',
    content: 'Review and approve investor subscription documentation.',
    detailedContent: `Review subscription packs submitted by investors. Check document completeness,
      verify KYC status, and approve or request corrections. Each pack shows the investor, deal,
      commitment amount, and documentation checklist status.`,
    features: [
      'Pending subscription reviews',
      'Document completeness checking',
      'KYC verification status',
      'Approval workflow',
      'Request corrections or clarifications',
      'Historical submission tracking'
    ],
    emptyStateContent: 'Subscription packs will appear here as investors submit documentation for your deals.',
    placement: 'right'
  },
  {
    id: 'fee-plans',
    target: '[data-tour="nav-fee-plans"]',
    title: 'Fee Plans',
    content: 'Configure fee structures and partner commission agreements.',
    detailedContent: `Set up fee plans for each deal, defining investor fees and partner commissions.
      Fee plans specify the fee tiers, calculation basis, and payment terms. Each deal requires its
      own fee plan, and partner-specific agreements can override default terms.`,
    features: [
      'Deal-specific fee configuration',
      'Investor fee tier setup',
      'Partner commission rates',
      'Fee calculation rules',
      'Agreement templates',
      'Commission tracking'
    ],
    emptyStateContent: 'Create fee plans for your deals to define how fees and commissions are calculated.',
    placement: 'right'
  },
  {
    id: 'introducers',
    target: '[data-tour="nav-my-introducers"]',
    title: 'My Introducers',
    content: 'Manage your introducer network and track referrals.',
    detailedContent: `View all introducers working with you, their referral activity, and commission
      status. Add new introducers, set up fee agreements, and track which investors they've brought
      to your deals. Monitor conversion rates and reward your best referral partners.`,
    features: [
      'Active introducer relationships',
      'Referral tracking per introducer',
      'Commission agreements and rates',
      'Conversion analytics',
      'Add new introducers',
      'Communication tools'
    ],
    emptyStateContent: 'Your introducer network will be displayed here. Add introducers to start tracking referrals.',
    placement: 'right'
  },
  {
    id: 'profile',
    target: '[data-tour="nav-profile"]',
    title: 'Arranger Profile',
    content: 'Manage your arranger entity details, team, and KYC status.',
    detailedContent: `Maintain your arranger entity's profile including company details, authorized
      team members, and verification status. Keep your information current to ensure smooth deal
      processing and compliance with platform requirements.`,
    features: [
      'Entity details and registration',
      'Team member management',
      'Signatory authorizations',
      'KYC/AML status',
      'Contact information',
      'Notification preferences'
    ],
    placement: 'right'
  }
]

// ============================================================================
// INTRODUCER TOUR - 6 steps
// Referral partners tracking introductions and commissions
// ============================================================================
const introducerTour: TourStep[] = [
  {
    id: 'dashboard',
    target: '[data-tour="nav-dashboard"]',
    title: 'Introducer Dashboard',
    content: 'Track your referral metrics, conversion rates, and commission overview.',
    detailedContent: `Your dashboard shows the health of your introduction business. See total
      referrals made, conversion rates to funded investments, and commissions earned. Track trends
      over time and identify which deals and arrangers generate the best results.`,
    features: [
      'Total introductions made',
      'Conversion rate to funded deals',
      'Commissions earned and pending',
      'Top performing deals',
      'Arranger relationship metrics',
      'Recent activity feed'
    ],
    emptyStateContent: 'Your referral metrics will appear here once you start making introductions.',
    placement: 'right'
  },
  {
    id: 'introductions',
    target: '[data-tour="nav-introductions"]',
    title: 'My Introductions',
    content: 'View and track all your investor referrals and their progress.',
    detailedContent: `See every investor you've introduced to the platform. Track their journey from
      initial referral through KYC, subscription, and funding. Each introduction shows the current
      status, associated deal, and expected commission.`,
    features: [
      'All referrals in one view',
      'Status tracking per introduction',
      'Deal association',
      'Expected commission amounts',
      'Investor contact details',
      'History and timeline'
    ],
    emptyStateContent: 'Your introductions will appear here. Start referring investors to see them tracked.',
    placement: 'right'
  },
  {
    id: 'agreements',
    target: '[data-tour="nav-agreements"]',
    title: 'Fee Agreements',
    content: 'Access your fee agreements with arrangers and view commission terms.',
    detailedContent: `View all your fee agreements with different arrangers. Each agreement specifies
      your commission rates, payment terms, and any special conditions. Agreements are deal-specific,
      so you may have different terms for different investments.`,
    features: [
      'Active fee agreements',
      'Commission rate details',
      'Payment terms',
      'Arranger contact info',
      'Agreement documents',
      'Amendment history'
    ],
    emptyStateContent: 'Fee agreements with arrangers will appear here once they\'re established.',
    placement: 'right'
  },
  {
    id: 'commissions',
    target: '[data-tour="nav-my-commissions"]',
    title: 'My Commissions',
    content: 'Track earned commissions, submit invoices, and view payment history.',
    detailedContent: `Manage all your commission earnings in one place. See commissions that are
      accrued (earned but not yet payable), ready to invoice, submitted, and paid. Submit invoices
      directly through the platform and track payment status.`,
    features: [
      'Accrued commissions',
      'Invoice submission',
      'Payment tracking',
      'Commission breakdown by deal',
      'Historical payments',
      'Export for accounting'
    ],
    emptyStateContent: 'Your earned commissions will appear here as your introductions convert to funded investments.',
    placement: 'right'
  },
  {
    id: 'versosign',
    target: '[data-tour="nav-versosign"]',
    title: 'VersoSign',
    content: 'Sign documents and execute agreements electronically.',
    detailedContent: `VersoSign is VERSO's electronic signature platform. Sign fee agreements,
      amendments, and other documents that require your signature. Track pending signature requests
      and view signed document history.`,
    features: [
      'Pending signature requests',
      'Electronic signature execution',
      'Document preview',
      'Signed document archive',
      'Multi-party signatures',
      'Audit trail'
    ],
    emptyStateContent: 'Documents requiring your signature will appear here.',
    placement: 'right'
  },
  {
    id: 'profile',
    target: '[data-tour="nav-profile"]',
    title: 'Introducer Profile',
    content: 'Manage your profile, bank details, and notification settings.',
    detailedContent: `Keep your introducer profile up to date. Update contact information, bank
      details for commission payments, and configure how you want to receive notifications. Accurate
      bank details ensure commissions are paid to the right account.`,
    features: [
      'Contact information',
      'Bank account details',
      'Notification preferences',
      'Profile verification status',
      'Signature settings',
      'Account security'
    ],
    placement: 'right'
  }
]

// ============================================================================
// PARTNER TOUR - 5 steps
// Distribution partners sharing deals with their clients
// ============================================================================
const partnerTour: TourStep[] = [
  {
    id: 'dashboard',
    target: '[data-tour="nav-dashboard"]',
    title: 'Partner Dashboard',
    content: 'Monitor your partnership metrics, referred investors, and revenue.',
    detailedContent: `Your partner dashboard shows the overall health of your VERSO partnership.
      Track investors you've referred, their subscription activity, and your revenue from
      commissions. See which deals are performing best for your client base.`,
    features: [
      'Referred investor count',
      'Subscription activity',
      'Revenue and commissions',
      'Top performing deals',
      'Client engagement metrics',
      'Recent activity'
    ],
    emptyStateContent: 'Partnership metrics will appear here as you refer investors and they make investments.',
    placement: 'right'
  },
  {
    id: 'opportunities',
    target: '[data-tour="nav-opportunities"]',
    title: 'Available Opportunities',
    content: 'Browse deals available to share with your clients.',
    detailedContent: `View all investment opportunities you can share with your clients. Each deal
      shows key terms, minimum investment, and target profile. Access marketing materials and
      investor presentations to help present opportunities to your network.`,
    features: [
      'Current available deals',
      'Deal terms and minimums',
      'Marketing materials',
      'Investor presentations',
      'Share links for clients',
      'Deal status updates'
    ],
    emptyStateContent: 'Available deals for your clients will appear here.',
    placement: 'right'
  },
  {
    id: 'transactions',
    target: '[data-tour="nav-transactions"]',
    title: 'Transactions',
    content: 'Track your referred investor subscriptions and activity.',
    detailedContent: `Monitor all investment activity from clients you've referred. See their
      subscription status, commitment amounts, and funding progress. Track the complete journey
      from introduction to funded investment.`,
    features: [
      'Referred client investments',
      'Subscription status tracking',
      'Commitment amounts',
      'Funding progress',
      'Client activity timeline',
      'Deal-by-deal breakdown'
    ],
    emptyStateContent: 'Transactions from your referred clients will appear here.',
    placement: 'right'
  },
  {
    id: 'commissions',
    target: '[data-tour="nav-my-commissions"]',
    title: 'My Commissions',
    content: 'Track your revenue, submit invoices, and view payment history.',
    detailedContent: `Manage your commission earnings from client referrals. See what's accrued,
      ready to invoice, and paid. Submit invoices through the platform and track payment status.`,
    features: [
      'Earned commissions',
      'Invoice submission',
      'Payment tracking',
      'Revenue by deal',
      'Historical payments',
      'Accounting exports'
    ],
    emptyStateContent: 'Commissions from your referrals will appear here.',
    placement: 'right'
  },
  {
    id: 'profile',
    target: '[data-tour="nav-profile"]',
    title: 'Partner Profile',
    content: 'Manage your entity details, team members, and settings.',
    detailedContent: `Maintain your partner entity profile. Update company information, manage
      team members who can access the portal, and configure account settings.`,
    features: [
      'Entity details',
      'Team member access',
      'Bank account info',
      'Contact preferences',
      'Notification settings',
      'Account security'
    ],
    placement: 'right'
  }
]

// ============================================================================
// COMMERCIAL PARTNER TOUR - 5 steps
// Commercial partners who can execute investments on behalf of clients
// ============================================================================
const commercialPartnerTour: TourStep[] = [
  {
    id: 'dashboard',
    target: '[data-tour="nav-dashboard"]',
    title: 'Commercial Partner Dashboard',
    content: 'Monitor client activity, placement metrics, and revenue.',
    detailedContent: `Your dashboard provides a complete view of your commercial partnership. Track
      clients you manage, their investment activity, and your placement revenue. See which deals
      are popular with your clients and identify new opportunities.`,
    features: [
      'Client portfolio overview',
      'Placement activity metrics',
      'Revenue and commissions',
      'Client engagement stats',
      'Deal performance',
      'Recent activity feed'
    ],
    emptyStateContent: 'Client activity and metrics will appear here as you place investments.',
    placement: 'right'
  },
  {
    id: 'opportunities',
    target: '[data-tour="nav-opportunities"]',
    title: 'Investment Opportunities',
    content: 'View deals available for client placement.',
    detailedContent: `Browse investment opportunities you can place for your clients. Access deal
      terms, presentations, and documentation. As a commercial partner, you can execute
      subscriptions on behalf of your clients.`,
    features: [
      'Available deals for placement',
      'Deal terms and documentation',
      'Client suitability matching',
      'Placement tools',
      'Marketing materials',
      'Deal updates'
    ],
    emptyStateContent: 'Deals available for client placement will appear here.',
    placement: 'right'
  },
  {
    id: 'client-transactions',
    target: '[data-tour="nav-client-transactions"]',
    title: 'Client Transactions',
    content: 'Manage client subscriptions and execute investments on their behalf.',
    detailedContent: `View and manage all client investment activity. As a commercial partner,
      you can execute subscription transactions for your clients, track their portfolio, and
      manage the investment process from start to funding.`,
    features: [
      'Client subscription management',
      'Execute-for-client capability',
      'Status tracking',
      'Document management',
      'Client communication',
      'Portfolio oversight'
    ],
    emptyStateContent: 'Client transactions will appear here as you make placements.',
    placement: 'right'
  },
  {
    id: 'commissions',
    target: '[data-tour="nav-my-commissions"]',
    title: 'My Commissions',
    content: 'Track placement fees, submit invoices, and view payments.',
    detailedContent: `Manage your commercial partner revenue. Track commissions from client
      placements, submit invoices, and monitor payment status.`,
    features: [
      'Placement commissions',
      'Invoice management',
      'Payment tracking',
      'Revenue breakdown',
      'Historical payments',
      'Financial exports'
    ],
    emptyStateContent: 'Commissions from client placements will appear here.',
    placement: 'right'
  },
  {
    id: 'profile',
    target: '[data-tour="nav-profile"]',
    title: 'Commercial Partner Profile',
    content: 'Manage your profile, signature settings, and team access.',
    detailedContent: `Maintain your commercial partner profile and settings. Configure signature
      authorities, manage team access, and keep account details current.`,
    features: [
      'Entity information',
      'Signature settings',
      'Team management',
      'Bank details',
      'Notification preferences',
      'Security settings'
    ],
    placement: 'right'
  }
]

// ============================================================================
// LAWYER TOUR - 5 steps
// Legal counsel assigned to deals
// ============================================================================
const lawyerTour: TourStep[] = [
  {
    id: 'dashboard',
    target: '[data-tour="nav-dashboard"]',
    title: 'Legal Dashboard',
    content: 'Access assigned matters, pending reviews, and upcoming deadlines.',
    detailedContent: `Your legal dashboard shows all matters requiring your attention. Track deals
      you're assigned to, pending document reviews, and upcoming deadlines. Prioritize your
      workload and ensure nothing falls through the cracks.`,
    features: [
      'Assigned matters overview',
      'Pending document reviews',
      'Upcoming deadlines',
      'Matter status tracking',
      'Recent activity',
      'Workload summary'
    ],
    emptyStateContent: 'Your assigned matters and pending reviews will appear here.',
    placement: 'right'
  },
  {
    id: 'assigned-deals',
    target: '[data-tour="nav-assigned-deals"]',
    title: 'Assigned Deals',
    content: 'View deals you\'re providing legal counsel on.',
    detailedContent: `Access all deals where you've been assigned as legal counsel. Review deal
      documentation, subscription packs, and investor compliance. Your role ensures legal
      requirements are met throughout the deal lifecycle.`,
    features: [
      'Deals requiring your counsel',
      'Deal documentation access',
      'Subscription pack review',
      'Compliance tracking',
      'Document management',
      'Communication with arrangers'
    ],
    emptyStateContent: 'Deals assigned to you will appear here.',
    placement: 'right'
  },
  {
    id: 'escrow',
    target: '[data-tour="nav-escrow"]',
    title: 'Escrow Management',
    content: 'Monitor and approve escrow account activities.',
    detailedContent: `Manage escrow accounts for deals you're assigned to. Review escrow status,
      approve release requests, and ensure funds are properly held and disbursed according to
      deal terms.`,
    features: [
      'Escrow account status',
      'Release request review',
      'Approval workflow',
      'Fund tracking',
      'Compliance verification',
      'Audit trail'
    ],
    emptyStateContent: 'Escrow accounts you manage will appear here.',
    placement: 'right'
  },
  {
    id: 'versosign',
    target: '[data-tour="nav-versosign"]',
    title: 'VersoSign',
    content: 'Review and execute legal documents electronically.',
    detailedContent: `VersoSign is your electronic signature workspace. Review legal documents,
      execute agreements, and track signature workflows. All signatures are legally binding
      and include complete audit trails.`,
    features: [
      'Pending signatures',
      'Document review',
      'Electronic execution',
      'Multi-party workflows',
      'Signed document archive',
      'Compliance audit trail'
    ],
    emptyStateContent: 'Documents requiring your signature will appear here.',
    placement: 'right'
  },
  {
    id: 'profile',
    target: '[data-tour="nav-profile"]',
    title: 'Legal Profile',
    content: 'Manage your signature settings and professional details.',
    detailedContent: `Maintain your legal professional profile. Configure signature settings,
      update contact information, and manage notification preferences.`,
    features: [
      'Professional details',
      'Signature configuration',
      'Contact information',
      'Notification settings',
      'Firm affiliation',
      'Account security'
    ],
    placement: 'right'
  }
]

// ============================================================================
// STAFF TOUR - 6 steps
// Internal VERSO staff (operations, relationship managers)
// ============================================================================
const staffTour: TourStep[] = [
  {
    id: 'dashboard',
    target: '[data-tour="nav-dashboard"]',
    title: 'Staff Dashboard',
    content: 'Platform activity overview and your pending workload.',
    detailedContent: `Your staff dashboard shows what needs your attention today. Track platform
      activity, see pending items in your queue, and monitor overall system health. Prioritize
      tasks that need immediate attention.`,
    features: [
      'Pending items queue',
      'Platform activity feed',
      'Workload summary',
      'Priority items',
      'Team activity',
      'System notifications'
    ],
    emptyStateContent: 'Your dashboard will show pending items and activity once the platform is active.',
    placement: 'right'
  },
  {
    id: 'approvals',
    target: '[data-tour="nav-approvals"]',
    title: 'Approvals',
    content: 'Process approval requests and KYC reviews.',
    detailedContent: `Handle approval requests that come through the platform. Review KYC
      submissions, subscription approvals, and other items that need staff authorization.`,
    features: [
      'Approval queue',
      'KYC review workflow',
      'Subscription processing',
      'Document verification',
      'Approval/rejection actions',
      'Audit logging'
    ],
    emptyStateContent: 'Approval requests will appear here.',
    placement: 'right'
  },
  {
    id: 'deals',
    target: '[data-tour="nav-deals"]',
    title: 'Deal Management',
    content: 'View and support deals across the platform.',
    detailedContent: `Access all deals to provide operational support. Help arrangers with deal
      setup, monitor subscription progress, and assist with deal closes.`,
    features: [
      'All platform deals',
      'Deal support tools',
      'Subscription monitoring',
      'Close assistance',
      'Issue resolution',
      'Arranger communication'
    ],
    placement: 'right'
  },
  {
    id: 'investors',
    target: '[data-tour="nav-investors"]',
    title: 'Investor Management',
    content: 'Support investor accounts and resolve issues.',
    detailedContent: `Manage investor accounts across the platform. Help with onboarding, KYC
      issues, account updates, and general investor support.`,
    features: [
      'Investor directory',
      'Account support tools',
      'KYC assistance',
      'Issue resolution',
      'Communication tools',
      'Account history'
    ],
    placement: 'right'
  },
  {
    id: 'subscriptions',
    target: '[data-tour="nav-subscriptions"]',
    title: 'Subscriptions',
    content: 'Track and process subscriptions across all deals.',
    detailedContent: `View subscription activity platform-wide. Monitor status, process updates,
      and help resolve subscription issues.`,
    features: [
      'All subscriptions view',
      'Status tracking',
      'Processing tools',
      'Issue flagging',
      'Status updates',
      'Reporting'
    ],
    placement: 'right'
  },
  {
    id: 'messages',
    target: '[data-tour="nav-messages"]',
    title: 'Messages',
    content: 'Handle platform communications and support requests.',
    detailedContent: `Manage support communications with investors, arrangers, and partners.
      Respond to inquiries and coordinate with team members.`,
    features: [
      'Support inbox',
      'Message threading',
      'Team assignments',
      'Response templates',
      'Priority tagging',
      'Resolution tracking'
    ],
    placement: 'right'
  }
]

// ============================================================================
// TOUR STEPS REGISTRY
// Maps persona types to their tour configurations
// ============================================================================
const withNavigateTo = (
  steps: TourStep[],
  routesById: Record<string, string>
): TourStep[] => {
  return steps.map((step) => ({
    ...step,
    navigateTo: routesById[step.id] || step.navigateTo,
  }))
}

const investorRoutes = {
  dashboard: '/versotech_main/dashboard',
  opportunities: '/versotech_main/opportunities',
  portfolio: '/versotech_main/portfolio',
  documents: '/versotech_main/documents',
  inbox: '/versotech_main/inbox',
  profile: '/versotech_main/profile',
}

const ceoRoutes = {
  dashboard: '/versotech_main/dashboard',
  approvals: '/versotech_main/approvals',
  deals: '/versotech_main/deals',
  reconciliation: '/versotech_main/reconciliation',
  audit: '/versotech_main/audit',
  admin: '/versotech_main/admin',
}

const staffRoutes = {
  dashboard: '/versotech_main/dashboard',
  approvals: '/versotech_main/approvals',
  deals: '/versotech_main/deals',
  investors: '/versotech_main/investors',
  subscriptions: '/versotech_main/subscriptions',
  messages: '/versotech_main/messages',
}

const arrangerRoutes = {
  dashboard: '/versotech_main/dashboard',
  mandates: '/versotech_main/my-mandates',
  'subscription-packs': '/versotech_main/subscription-packs',
  'fee-plans': '/versotech_main/fee-plans',
  introducers: '/versotech_main/my-introducers',
  profile: '/versotech_main/arranger-profile',
}

const introducerRoutes = {
  dashboard: '/versotech_main/dashboard',
  introductions: '/versotech_main/introductions',
  agreements: '/versotech_main/introducer-agreements',
  commissions: '/versotech_main/my-commissions',
  versosign: '/versotech_main/versosign',
  profile: '/versotech_main/introducer-profile',
}

const partnerRoutes = {
  dashboard: '/versotech_main/dashboard',
  opportunities: '/versotech_main/opportunities',
  transactions: '/versotech_main/partner-transactions',
  commissions: '/versotech_main/my-commissions',
  profile: '/versotech_main/partner-profile',
}

const commercialPartnerRoutes = {
  dashboard: '/versotech_main/dashboard',
  opportunities: '/versotech_main/opportunities',
  'client-transactions': '/versotech_main/client-transactions',
  commissions: '/versotech_main/my-commissions',
  profile: '/versotech_main/commercial-partner-profile',
}

const lawyerRoutes = {
  dashboard: '/versotech_main/dashboard',
  'assigned-deals': '/versotech_main/assigned-deals',
  escrow: '/versotech_main/escrow',
  versosign: '/versotech_main/versosign',
  profile: '/versotech_main/lawyer-profile',
}

export const TOUR_STEPS: Record<string, TourStep[]> = {
  // Investor variants
  investor: withNavigateTo(investorEntityTour, investorRoutes), // Default to entity (more comprehensive)
  investor_entity: withNavigateTo(investorEntityTour, investorRoutes),
  investor_individual: withNavigateTo(investorIndividualTour, investorRoutes),

  // Business personas
  ceo: withNavigateTo(ceoTour, ceoRoutes),
  staff: withNavigateTo(staffTour, staffRoutes),
  arranger: withNavigateTo(arrangerTour, arrangerRoutes),
  introducer: withNavigateTo(introducerTour, introducerRoutes),
  partner: withNavigateTo(partnerTour, partnerRoutes),
  commercial_partner: withNavigateTo(commercialPartnerTour, commercialPartnerRoutes),
  lawyer: withNavigateTo(lawyerTour, lawyerRoutes),
}

/**
 * Get tour steps for a specific persona
 * Falls back to investor_entity tour if persona not found
 */
export function getTourSteps(persona: string): TourStep[] {
  return TOUR_STEPS[persona] || TOUR_STEPS.investor_entity
}

/**
 * Get persona-specific welcome message for the tour modal
 */
export function getWelcomeMessage(persona: string): { title: string; description: string } {
  const messages: Record<string, { title: string; description: string }> = {
    investor: {
      title: 'Welcome to VERSOTECH Investor Workspace',
      description: 'This walkthrough covers Dashboard, Investment Opportunities, Portfolio, Inbox, and Profile so you can move from review to execution quickly.'
    },
    investor_entity: {
      title: 'Welcome to VERSOTECH Investor Workspace',
      description: 'You will see where to track entity-level portfolio activity, manage members, and complete required actions in Inbox and Profile.'
    },
    investor_individual: {
      title: 'Welcome to VERSOTECH',
      description: 'We will walk through the pages you use most: Dashboard, Investment Opportunities, Portfolio, Inbox, and Profile.'
    },
    ceo: {
      title: 'Welcome to VERSOTECH Executive Workspace',
      description: 'This tour focuses on executive controls: Approvals, Deals, Reconciliation, Audit, and Admin.'
    },
    staff: {
      title: 'Welcome to VERSOTECH Staff Workspace',
      description: 'You will cover the operational flow across Approvals, Deals, Investors, Subscriptions, and Messages.'
    },
    arranger: {
      title: 'Welcome to VERSOTECH Arranger Workspace',
      description: 'This walkthrough maps your core workflow from My Mandates to Subscription Packs, Fee Plans, and introducer coordination.'
    },
    introducer: {
      title: 'Welcome to VERSOTECH Introducer Workspace',
      description: 'You will review where to track introductions, agreements, commissions, and signature tasks.'
    },
    partner: {
      title: 'Welcome to VERSOTECH Partner Workspace',
      description: 'This tour covers opportunities, transaction tracking, and commission operations for your referred clients.'
    },
    commercial_partner: {
      title: 'Welcome to VERSOTECH Commercial Partner Workspace',
      description: 'You will see the end-to-end placement flow: opportunities, client transactions, commissions, and profile controls.'
    },
    lawyer: {
      title: 'Welcome to VERSOTECH Legal Workspace',
      description: 'This walkthrough focuses on assigned deals, escrow actions, and legal document execution in VersoSign.'
    }
  }

  return messages[persona] || messages.investor
}

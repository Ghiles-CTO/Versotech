import { z } from 'zod'

export const workflowInputFieldSchema = z.object({
  label: z.string().optional(),
  type: z.enum(['text', 'email', 'number', 'date', 'datetime', 'select', 'checkbox', 'investor_select', 'vehicle_select', 'conversation_select']),
  placeholder: z.string().optional(),
  required: z.boolean().optional(),
  options: z.array(z.union([z.string(), z.number()])).optional(),
  helperText: z.string().optional(),
  defaultValue: z.union([z.string(), z.boolean(), z.number()]).optional(),
  dependsOn: z.string().optional(), // Field name that this field depends on
  showWhen: z.union([z.string(), z.number(), z.boolean()]).optional() // Value that triggers this field to show
})

export const workflowInputSchema = z.record(z.string(), workflowInputFieldSchema)

export type WorkflowInputSchema = z.infer<typeof workflowInputSchema>

export interface WorkflowDefinition {
  key: string
  title: string
  description: string
  detailedDescription?: string // Full description for drawer
  icon: string
  category: 'documents' | 'compliance' | 'communications' | 'data_processing' | 'multi_step'
  triggerType: 'manual' | 'scheduled' | 'both'
  requiredRole?: 'staff_admin' | 'staff_ops' | 'staff_rm'
  requiredTitles?: string[]
  inputSchema: WorkflowInputSchema
}

export const processWorkflows: WorkflowDefinition[] = [
  {
    key: 'generate-position-statement',
    title: 'Position Statement',
    description: 'Generate investor position statements with current NAV, distributions, and performance metrics',
    detailedDescription: 'Automatically generate comprehensive position statements for investors showing their current NAV, capital contributions, distributions received, and performance metrics across all vehicles or a specific fund. The statement will be generated as a PDF, watermarked, and ready for distribution.',
    icon: 'BarChart3',
    category: 'documents',
    triggerType: 'manual',
    requiredRole: 'staff_ops',
    inputSchema: {
      investor_id: {
        label: 'Investor',
        type: 'investor_select',
        placeholder: 'Select investor',
        required: true,
        helperText: 'Choose the investor to generate the position statement for'
      },
      vehicle_id: {
        label: 'Vehicle (Optional)',
        type: 'vehicle_select',
        placeholder: 'All vehicles or select specific vehicle',
        helperText: 'Leave empty for all vehicles or select a specific fund'
      },
      as_of_date: {
        label: 'As of Date',
        type: 'date',
        required: true,
        helperText: 'The date for which to generate the position statement'
      }
    }
  },
  {
    key: 'process-nda',
    title: 'NDA Agent',
    description: 'Automated NDA generation, DocuSign processing, and professional investor qualification',
    detailedDescription: 'Streamline the NDA process with automated generation, DocuSign integration for e-signatures, and professional investor qualification checks. The workflow handles document creation, sending, tracking, and storage of signed NDAs.',
    icon: 'FileText',
    category: 'compliance',
    triggerType: 'manual',
    requiredRole: 'staff_rm',
    inputSchema: {
      series_number: {
        label: 'Series Number',
        type: 'text',
        placeholder: 'VC206',
        required: true,
        helperText: 'Series identifier (e.g., VC206)'
      },
      project_description: {
        label: 'Project Description',
        type: 'text',
        placeholder: 'VERSO Capital 2 SCSP Series 206',
        required: true,
        helperText: 'Full project/series description'
      },
      investment_description: {
        label: 'Investment Description',
        type: 'text',
        placeholder: 'OPEN AI Primary Issuance July 2025',
        required: true,
        helperText: 'Description of the investment opportunity'
      },
      party_a_name: {
        label: 'Party A Name',
        type: 'text',
        placeholder: 'Investor/Company Name',
        required: true,
        helperText: 'Name of the investor or company'
      },
      party_a_registered_address: {
        label: 'Party A Address',
        type: 'text',
        placeholder: 'Full registered address',
        required: true,
        helperText: 'Registered address of Party A'
      },
      party_a_city_country: {
        label: 'Party A City/Country',
        type: 'text',
        placeholder: 'City, Country Code',
        required: true,
        helperText: 'City and country (e.g., London, GB)'
      },
      party_a_representative_name: {
        label: 'Party A Representative',
        type: 'text',
        placeholder: 'Representative Name',
        required: true,
        helperText: 'Name of authorized representative'
      },
      party_a_representative_title: {
        label: 'Party A Rep. Title',
        type: 'text',
        placeholder: 'CEO, Director, etc.',
        required: true,
        helperText: 'Title of the representative'
      },
      party_b_name: {
        label: 'Party B Name',
        type: 'text',
        placeholder: 'VERSO Capital 2 SCSP Series 206',
        defaultValue: 'VERSO Capital 2 SCSP Series 206 ("VC206")',
        helperText: 'VERSO entity name (pre-filled)'
      },
      party_b_registered_address: {
        label: 'Party B Address',
        type: 'text',
        placeholder: '2, Avenue Charles de Gaulle – L-1653',
        defaultValue: '2, Avenue Charles de Gaulle – L-1653',
        helperText: 'VERSO registered address'
      },
      party_b_city_country: {
        label: 'Party B City/Country',
        type: 'text',
        placeholder: 'Luxembourg, LU',
        defaultValue: 'Luxembourg, LU',
        helperText: 'VERSO city and country'
      },
      party_b_representative_name: {
        label: 'Party B Representative',
        type: 'text',
        placeholder: 'Julien Machot',
        defaultValue: 'Julien Machot',
        helperText: 'VERSO representative name'
      },
      party_b_representative_title: {
        label: 'Party B Rep. Title',
        type: 'text',
        placeholder: 'Managing Partner',
        defaultValue: 'Managing Partner',
        helperText: 'VERSO representative title'
      },
      dataroom_email: {
        label: 'Data Room Email',
        type: 'email',
        placeholder: 'investor@example.com',
        required: true,
        helperText: 'Email for data room access'
      },
      execution_date: {
        label: 'Execution Date',
        type: 'date',
        required: true,
        helperText: 'Date of NDA execution'
      },
      zoho_sign_document_id: {
        label: 'Zoho Sign Document ID',
        type: 'text',
        placeholder: 'Optional - auto-generated if empty',
        helperText: 'Zoho Sign tracking ID (optional)'
      }
    }
  },
  {
    key: 'shared-drive-notification',
    title: 'Shared-Drive Notification',
    description: 'Automatically notify investors when documents in shared drives are updated',
    detailedDescription: 'Monitor shared drive folders for document changes and automatically notify relevant investors when new documents are uploaded or existing ones are updated. This ensures investors stay informed about important updates without manual intervention.',
    icon: 'Database',
    category: 'communications',
    triggerType: 'scheduled',
    requiredRole: 'staff_ops',
    inputSchema: {
      document_category: {
        label: 'Document Category',
        type: 'select',
        options: ['legal', 'financial', 'marketing', 'compliance', 'reports'],
        required: true,
        helperText: 'Type of documents to monitor'
      },
      notification_group: {
        label: 'Notification Group',
        type: 'select',
        options: ['investors', 'staff', 'compliance', 'all'],
        required: true,
        helperText: 'Who should be notified of changes'
      }
    }
  },
  {
    key: 'inbox-manager',
    title: 'Inbox Manager',
    description: 'Intelligently process and route investor communications to appropriate teams',
    detailedDescription: 'Automate inbox management by processing incoming emails or VERSOTECH messages, categorizing them based on content, and routing to the appropriate team members. Supports both email filtering and internal messaging workflows.',
    icon: 'MessageSquare',
    category: 'communications',
    triggerType: 'both',
    requiredRole: 'staff_ops',
    inputSchema: {
      inbox_type: {
        label: 'Inbox Type',
        type: 'select',
        options: ['email', 'versotech_messaging'],
        required: true,
        helperText: 'Choose the type of inbox to process'
      },
      command: {
        label: 'Command/Action',
        type: 'text',
        placeholder: 'e.g., "route to compliance", "create task"',
        required: true,
        helperText: 'Specify the action to perform on matched messages'
      },
      email_subject: {
        label: 'Email Subject Filter',
        type: 'text',
        placeholder: 'Subject keywords to match',
        dependsOn: 'inbox_type',
        showWhen: 'email',
        helperText: 'Filter emails by subject line'
      },
      conversation_id: {
        label: 'Conversation',
        type: 'conversation_select',
        placeholder: 'Select conversation',
        dependsOn: 'inbox_type',
        showWhen: 'versotech_messaging',
        helperText: 'Choose the conversation to apply the command to'
      }
    }
  },
  {
    key: 'linkedin-leads-scraper',
    title: 'LinkedIn Leads Scraper',
    description: 'Identify and qualify potential high-net-worth investors and institutional clients',
    detailedDescription: 'Scrape LinkedIn profiles based on search criteria to identify potential investors. The workflow extracts contact information, professional background, and qualifies leads based on specified parameters for targeted outreach campaigns.',
    icon: 'Target',
    category: 'data_processing',
    triggerType: 'manual',
    requiredRole: 'staff_rm',
    inputSchema: {
      search_url: {
        label: 'LinkedIn Search URL',
        type: 'text',
        placeholder: 'https://www.linkedin.com/search/results/people/?...',
        required: true,
        helperText: 'Paste the full LinkedIn search URL with filters applied'
      },
      purpose: {
        label: 'Campaign Purpose',
        type: 'select',
        options: ['linkedin_outreach', 'cold_email_campaign'],
        required: true,
        helperText: 'Select the intended use for the scraped leads'
      }
    }
  },
  {
    key: 'reporting-agent',
    title: 'Reporting Agent',
    description: 'Generate comprehensive investor reports, compliance filings, and performance analytics',
    detailedDescription: 'Automate the generation of investor reports including quarterly statements, annual reports, and compliance filings. Reports can be generated on-demand or scheduled for regular distribution, with support for both public and corporate reporting formats.',
    icon: 'TrendingUp',
    category: 'documents',
    triggerType: 'both',
    requiredRole: 'staff_rm',
    inputSchema: {
      report_category: {
        label: 'Report Category',
        type: 'select',
        options: ['public', 'corporate', 'both'],
        required: true,
        helperText: 'Type of report to generate'
      },
      investor_id: {
        label: 'Investor',
        type: 'investor_select',
        placeholder: 'Select investor',
        required: true,
        helperText: 'Choose the investor to generate the report for'
      },
      vehicle_id: {
        label: 'Vehicle',
        type: 'vehicle_select',
        placeholder: 'Select vehicle',
        required: true,
        helperText: 'Choose the fund or vehicle for the report'
      },
      frequency: {
        label: 'Report Frequency',
        type: 'select',
        options: ['one-time', 'monthly', 'quarterly', 'annual'],
        required: true,
        helperText: 'How often the report should be generated'
      },
      include_charts: {
        label: 'Include Charts',
        type: 'checkbox',
        defaultValue: true,
        helperText: 'Add visual charts and graphs to the report'
      }
    }
  },
  {
    key: 'kyc-aml-processing',
    title: 'KYC/AML Processing',
    description: 'Enhanced due diligence for professional investor qualification and BVI FSC compliance',
    detailedDescription: 'Perform comprehensive KYC (Know Your Customer) and AML (Anti-Money Laundering) checks with automated sanctions screening, beneficial ownership analysis, and professional investor verification. Ensures full BVI FSC regulatory compliance.',
    icon: 'Shield',
    category: 'compliance',
    triggerType: 'manual',
    requiredRole: 'staff_admin',
    inputSchema: {
      investor_id: {
        label: 'Investor',
        type: 'investor_select',
        placeholder: 'Select investor',
        required: true,
        helperText: 'Choose the investor to perform KYC/AML checks on'
      },
      investor_type: {
        label: 'Investor Type',
        type: 'select',
        options: ['individual', 'institution', 'corporate'],
        required: true,
        helperText: 'Classification of the investor'
      },
      jurisdiction: {
        label: 'Jurisdiction',
        type: 'text',
        placeholder: 'e.g., United Kingdom, Cayman Islands',
        required: true,
        helperText: 'Legal jurisdiction of the investor'
      },
      enhanced_dd: {
        label: 'Enhanced Due Diligence',
        type: 'checkbox',
        helperText: 'Perform additional enhanced due diligence checks'
      }
    }
  },
  {
    key: 'capital-call-processing',
    title: 'Capital Call Processing',
    description: 'Generate capital call notices, wire instructions, and investor notifications',
    detailedDescription: 'Automate the capital call process by generating notices, calculating wire instructions per investor, and sending notifications. The workflow handles document generation, email distribution, and tracking of investor responses.',
    icon: 'Calendar',
    category: 'communications',
    triggerType: 'manual',
    requiredRole: 'staff_admin',
    requiredTitles: ['bizops'],
    inputSchema: {
      vehicle_id: {
        label: 'Vehicle',
        type: 'vehicle_select',
        placeholder: 'Select vehicle',
        required: true,
        helperText: 'Choose the fund or vehicle for the capital call'
      },
      call_percentage: {
        label: 'Call Percentage',
        type: 'number',
        placeholder: '30.00',
        required: true,
        helperText: 'Percentage of committed capital to call (e.g., 30 for 30%)'
      },
      due_date: {
        label: 'Due Date',
        type: 'date',
        required: true,
        helperText: 'Date by which capital must be received'
      },
      wire_deadline: {
        label: 'Wire Deadline',
        type: 'datetime',
        required: true,
        helperText: 'Specific date and time for wire transfer deadline'
      }
    }
  },
  {
    key: 'investor-onboarding',
    title: 'Investor Onboarding',
    description: 'Complete investor onboarding flow: KYC → NDA → Subscription → First Funding',
    detailedDescription: 'Execute the full investor onboarding sequence from initial KYC verification through NDA execution, subscription agreement signing, and first capital commitment. This multi-step workflow coordinates all required documentation and compliance checks.',
    icon: 'Users',
    category: 'multi_step',
    triggerType: 'manual',
    requiredRole: 'staff_ops',
    inputSchema: {
      investor_email: {
        label: 'Investor Email',
        type: 'email',
        placeholder: 'investor@example.com',
        required: true,
        helperText: 'Primary email address for the new investor'
      },
      investment_amount: {
        label: 'Initial Investment',
        type: 'number',
        placeholder: '1000000',
        required: true,
        helperText: 'Target investment amount in USD'
      },
      target_vehicle: {
        label: 'Target Vehicle',
        type: 'vehicle_select',
        placeholder: 'Select vehicle',
        required: true,
        helperText: 'Fund or vehicle the investor will participate in'
      },
      investor_type: {
        label: 'Investor Type',
        type: 'select',
        options: ['individual', 'institution', 'corporate'],
        required: true,
        helperText: 'Classification for KYC processing'
      }
    }
  },
  {
    key: 'generate-subscription-pack',
    title: 'Subscription Pack',
    description: 'Generate subscription agreements, PPM, and onboarding documents for new investors',
    detailedDescription: 'Automatically generate a complete subscription package including subscription agreements, Private Placement Memorandum (PPM), and all required onboarding documents. The package is tailored to the specific vehicle and investor type, ready for e-signature.',
    icon: 'FileCheck',
    category: 'documents',
    triggerType: 'manual',
    requiredRole: 'staff_ops',
    inputSchema: {
      investor_id: {
        label: 'Investor',
        type: 'investor_select',
        placeholder: 'Select investor',
        required: true,
        helperText: 'Choose the investor for subscription pack generation'
      },
      vehicle_id: {
        label: 'Vehicle',
        type: 'vehicle_select',
        placeholder: 'Select vehicle',
        required: true,
        helperText: 'Fund or vehicle for the subscription'
      },
      commitment_amount: {
        label: 'Commitment Amount',
        type: 'number',
        placeholder: '1000000',
        required: true,
        helperText: 'Total commitment amount in USD'
      },
      include_ppm: {
        label: 'Include PPM',
        type: 'checkbox',
        defaultValue: true,
        helperText: 'Include Private Placement Memorandum'
      }
    }
  }
]

export const workflowDefinitionMap = new Map(
  processWorkflows.map((workflow) => [workflow.key, workflow])
)

// Group workflows by category for the Process Center UI
export function getWorkflowsByCategory() {
  const categories = {
    documents: processWorkflows.filter(w => w.category === 'documents'),
    compliance: processWorkflows.filter(w => w.category === 'compliance'),
    communications: processWorkflows.filter(w => w.category === 'communications'),
    data_processing: processWorkflows.filter(w => w.category === 'data_processing'),
    multi_step: processWorkflows.filter(w => w.category === 'multi_step')
  }
  return categories
}

// Category metadata for display
export const categoryMetadata = {
  documents: {
    title: 'Document Generation',
    description: 'Position statements, reports, and compliance filings',
    icon: 'FileText',
    gradient: 'from-blue-500/20 to-cyan-500/20'
  },
  compliance: {
    title: 'Compliance & Verification',
    description: 'KYC, AML screening, and regulatory checks',
    icon: 'Shield',
    gradient: 'from-green-500/20 to-emerald-500/20'
  },
  communications: {
    title: 'Communications',
    description: 'Inbox management, notifications, and investor outreach',
    icon: 'MessageSquare',
    gradient: 'from-purple-500/20 to-pink-500/20'
  },
  data_processing: {
    title: 'Data Processing',
    description: 'Lead generation, data enrichment, and analytics',
    icon: 'Target',
    gradient: 'from-orange-500/20 to-red-500/20'
  },
  multi_step: {
    title: 'Multi-Step Workflows',
    description: 'Complex orchestrated processes and onboarding',
    icon: 'Users',
    gradient: 'from-indigo-500/20 to-violet-500/20'
  }
} as const


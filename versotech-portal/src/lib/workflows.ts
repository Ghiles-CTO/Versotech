import { z } from 'zod'

export const workflowInputFieldSchema = z.object({
  label: z.string().optional(),
  type: z.enum(['text', 'email', 'number', 'date', 'datetime', 'select', 'checkbox']),
  placeholder: z.string().optional(),
  required: z.boolean().optional(),
  options: z.array(z.union([z.string(), z.number()])).optional(),
  helperText: z.string().optional(),
  defaultValue: z.union([z.string(), z.boolean(), z.number()]).optional()
})

export const workflowInputSchema = z.record(z.string(), workflowInputFieldSchema)

export type WorkflowInputSchema = z.infer<typeof workflowInputSchema>

export interface WorkflowDefinition {
  key: string
  title: string
  description: string
  icon: string
  category: 'documents' | 'compliance' | 'communications' | 'data_processing' | 'multi_step'
  requiredRole?: 'staff_admin' | 'staff_ops' | 'staff_rm'
  requiredTitles?: string[]
  inputSchema: WorkflowInputSchema
}

export const processWorkflows: WorkflowDefinition[] = [
  {
    key: 'generate-position-statement',
    title: 'Position Statement',
    description: 'Generate investor position statements with current NAV, distributions, and performance metrics',
    icon: 'BarChart3',
    category: 'documents',
    requiredRole: 'staff_ops',
    inputSchema: {
      investor_id: {
        label: 'Investor ID',
        type: 'text',
        placeholder: 'Enter investor UUID',
        required: true
      },
      vehicle_id: {
        label: 'Vehicle ID (Optional)',
        type: 'text',
        placeholder: 'Specific vehicle or leave blank'
      },
      as_of_date: {
        label: 'As of Date',
        type: 'date',
        required: true
      }
    }
  },
  {
    key: 'process-nda',
    title: 'NDA Agent',
    description: 'Automated NDA generation, DocuSign processing, and professional investor qualification',
    icon: 'FileText',
    category: 'compliance',
    requiredRole: 'staff_rm',
    inputSchema: {
      investor_email: {
        label: 'Investor Email',
        type: 'email',
        placeholder: 'investor@example.com',
        required: true
      },
      investment_type: {
        label: 'Investment Type',
        type: 'text',
        placeholder: 'VERSO FUND, REAL Empire, etc.',
        required: true
      },
      nda_template: {
        label: 'NDA Template',
        type: 'select',
        options: ['standard', 'institutional', 'high-net-worth'],
        required: true
      }
    }
  },
  {
    key: 'shared-drive-notification',
    title: 'Shared-Drive Notification',
    description: 'Sync shared drive uploads and notify stakeholders of updates',
    icon: 'Database',
    category: 'communications',
    requiredRole: 'staff_ops',
    inputSchema: {
      document_category: {
        label: 'Document Category',
        type: 'select',
        options: ['legal', 'financial', 'marketing'],
        required: true
      },
      notification_group: {
        label: 'Notification Group',
        type: 'select',
        options: ['investors', 'staff', 'compliance'],
        required: true
      }
    }
  },
  {
    key: 'inbox-manager',
    title: 'Inbox Manager',
    description: 'Process investor communications and route requests to appropriate teams',
    icon: 'MessageSquare',
    category: 'communications',
    requiredRole: 'staff_ops',
    inputSchema: {
      email_source: {
        label: 'Email Source',
        type: 'text',
        placeholder: 'info@versoholdings.com',
        required: true
      },
      priority_level: {
        label: 'Priority Level',
        type: 'select',
        options: ['low', 'medium', 'high', 'urgent'],
        required: true
      }
    }
  },
  {
    key: 'linkedin-leads-scraper',
    title: 'LinkedIn Leads Scraper',
    description: 'Identify and qualify potential high-net-worth investors and institutional clients',
    icon: 'Target',
    category: 'data_processing',
    requiredRole: 'staff_rm',
    inputSchema: {
      search_criteria: {
        label: 'Search Criteria',
        type: 'text',
        placeholder: 'private equity London managing director',
        required: true
      },
      lead_qualification: {
        label: 'Lead Qualification',
        type: 'select',
        options: ['high-net-worth', 'institutional', 'qualified'],
        required: true
      }
    }
  },
  {
    key: 'reporting-agent',
    title: 'Reporting Agent',
    description: 'Generate quarterly investor reports, compliance filings, and board presentations',
    icon: 'TrendingUp',
    category: 'documents',
    requiredRole: 'staff_rm',
    inputSchema: {
      report_type: {
        label: 'Report Type',
        type: 'select',
        options: ['quarterly', 'annual', 'compliance', 'ad-hoc'],
        required: true
      },
      recipients: {
        label: 'Recipients',
        type: 'select',
        options: ['investors', 'regulators', 'board'],
        required: true
      },
      include_charts: {
        label: 'Include Charts',
        type: 'checkbox'
      }
    }
  },
  {
    key: 'kyc-aml-processing',
    title: 'KYC/AML Processing',
    description: 'Enhanced due diligence for professional investor qualification and BVI FSC compliance',
    icon: 'Shield',
    category: 'compliance',
    requiredRole: 'staff_admin',
    inputSchema: {
      investor_type: {
        label: 'Investor Type',
        type: 'select',
        options: ['individual', 'institution', 'corporate'],
        required: true
      },
      jurisdiction: {
        label: 'Jurisdiction',
        type: 'text',
        required: true
      },
      enhanced_dd: {
        label: 'Enhanced Due Diligence',
        type: 'checkbox'
      }
    }
  },
  {
    key: 'capital-call-processing',
    title: 'Capital Call Processing',
    description: 'Generate capital call notices, wire instructions, and investor notifications',
    icon: 'Calendar',
    category: 'documents',
    requiredRole: 'staff_admin',
    inputSchema: {
      vehicle_id: {
        label: 'Vehicle ID',
        type: 'text',
        placeholder: 'VERSO FUND I',
        required: true
      },
      call_percentage: {
        label: 'Call Percentage',
        type: 'number',
        placeholder: '30.00',
        required: true
      },
      due_date: {
        label: 'Due Date',
        type: 'date',
        required: true
      },
      wire_deadline: {
        label: 'Wire Deadline',
        type: 'datetime',
        required: true
      }
    }
  },
  {
    key: 'investor-onboarding',
    title: 'Investor Onboarding',
    description: 'Complete investor onboarding flow: KYC → NDA → Subscription → First Funding',
    icon: 'Users',
    category: 'multi_step',
    requiredRole: 'staff_ops',
    inputSchema: {
      investor_email: {
        label: 'Investor Email',
        type: 'email',
        required: true
      },
      investment_amount: {
        label: 'Initial Investment',
        type: 'number',
        placeholder: '1000000',
        required: true
      },
      target_vehicle: {
        label: 'Target Vehicle',
        type: 'text',
        placeholder: 'VERSO FUND',
        required: true
      }
    }
  }
]

export const workflowDefinitionMap = new Map(
  processWorkflows.map((workflow) => [workflow.key, workflow])
)



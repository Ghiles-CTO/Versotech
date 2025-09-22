import { AppLayout } from '@/components/layout/app-layout'
import { ProcessTrigger } from '@/components/staff/process-trigger'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  BarChart3, 
  FileText,
  Database, 
  MessageSquare, 
  Target, 
  TrendingUp,
  Users,
  Calendar,
  Shield,
  Workflow
} from 'lucide-react'
import { requireStaffAuth } from '@/lib/auth'

export default async function ProcessesPage() {
  const profile = await requireStaffAuth()

  return (
    <AppLayout brand="versotech">
      <div className="p-6 space-y-6">
        
        {/* Header */}
        <div className="border-b border-gray-200 pb-6">
          <div className="flex items-center justify-between">
        <div>
              <h1 className="text-3xl font-bold text-gray-900">Process Center</h1>
              <p className="text-lg text-gray-600 mt-1">
                n8n workflow automation for VERSO Holdings operations
          </p>
        </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Staff: {profile.display_name}</p>
              <p className="text-xs text-gray-400">{profile.role} • {profile.title}</p>
              </div>
              </div>
        </div>

        {/* Process Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          
          {/* Position Statement Generation */}
          <ProcessTrigger
            workflowKey="generate-position-statement"
            title="Position Statement"
            description="Generate investor position statements with current NAV, distributions, and performance metrics"
            iconName="BarChart3"
            schema={{
              investor_id: {
                label: "Investor ID",
                type: "text",
                placeholder: "Enter investor UUID"
              },
              vehicle_id: {
                label: "Vehicle ID (Optional)",
                type: "text", 
                placeholder: "Specific vehicle or leave blank for all"
              },
              as_of_date: {
                label: "As of Date",
                type: "date",
                placeholder: new Date().toISOString().split('T')[0]
              }
            }}
          />

          {/* NDA Processing */}
          <ProcessTrigger
            workflowKey="process-nda"
            title="NDA Agent"
            description="Automated NDA generation, DocuSign processing, and professional investor qualification"
            iconName="FileText"
            schema={{
              investor_email: {
                label: "Investor Email",
                type: "email",
                placeholder: "investor@example.com"
              },
              investment_type: {
                label: "Investment Type",
                type: "text",
                placeholder: "VERSO FUND, REAL Empire, etc."
              },
              nda_template: {
                label: "NDA Template",
                type: "text",
                placeholder: "standard, institutional, high-net-worth"
              }
            }}
          />

          {/* Shared Drive Sync */}
          <ProcessTrigger
            workflowKey="shared-drive-notification"
            title="Shared-Drive Notification"
            description="Sync VERSO document repository and notify stakeholders of updates"
            iconName="Database"
            schema={{
              document_category: {
                label: "Document Category",
                type: "text",
                placeholder: "legal, financial, marketing"
              },
              notification_group: {
                label: "Notification Group",
                type: "text",
                placeholder: "investors, staff, compliance"
              }
            }}
          />

          {/* Inbox Manager */}
          <ProcessTrigger
            workflowKey="inbox-manager"
            title="Inbox Manager"
            description="Process investor communications and route requests to appropriate teams"
            iconName="MessageSquare"
            schema={{
              email_source: {
                label: "Email Source",
                type: "text", 
                placeholder: "info@versoholdings.com, support@"
              },
              priority_level: {
                label: "Priority Level",
                type: "text",
                placeholder: "normal, high, urgent"
              }
            }}
          />

          {/* LinkedIn Leads Scraper */}
          <ProcessTrigger
            workflowKey="linkedin-leads-scraper"
            title="LinkedIn Leads Scraper"
            description="Identify and qualify potential high-net-worth investors and institutional clients"
            iconName="Target"
            schema={{
              search_criteria: {
                label: "Search Criteria",
                type: "text",
                placeholder: "private equity, family office, etc."
              },
              lead_qualification: {
                label: "Qualification Level",
                type: "text",
                placeholder: "high-net-worth, institutional, qualified"
              }
            }}
          />

          {/* Reporting Agent */}
          <ProcessTrigger
            workflowKey="reporting-agent"
            title="Reporting Agent"
            description="Generate comprehensive fund performance reports, compliance filings, and investor communications"
            iconName="TrendingUp"
            schema={{
              report_type: {
                label: "Report Type",
                type: "text",
                placeholder: "quarterly, annual, compliance, ad-hoc"
              },
              recipients: {
                label: "Recipients",
                type: "text",
                placeholder: "investors, regulators, board"
              },
              include_charts: {
                label: "Include Charts",
                type: "checkbox"
              }
            }}
          />

          {/* KYC/AML Processing */}
          <ProcessTrigger
            workflowKey="kyc-aml-processing"
            title="KYC/AML Processing"
            description="Enhanced due diligence for professional investor qualification and BVI FSC compliance"
            iconName="Shield"
            schema={{
              investor_type: {
                label: "Investor Type", 
                type: "text",
                placeholder: "individual, institution, corporate"
              },
              jurisdiction: {
                label: "Jurisdiction",
                type: "text",
                placeholder: "BVI, Luxembourg, etc."
              },
              enhanced_dd: {
                label: "Enhanced Due Diligence",
                type: "checkbox"
              }
            }}
          />

          {/* Capital Call Processing */}
          <ProcessTrigger
            workflowKey="capital-call-processing"
            title="Capital Call Processing"
            description="Generate capital call notices, wire instructions, and investor notifications"
            iconName="Calendar"
            schema={{
              vehicle_id: {
                label: "Vehicle ID",
                type: "text",
                placeholder: "VERSO FUND, REAL Empire Compartment"
              },
              call_percentage: {
                label: "Call Percentage",
                type: "number",
                placeholder: "25.00"
              },
              due_date: {
                label: "Due Date",
                type: "date"
              },
              wire_deadline: {
                label: "Wire Deadline",
                type: "date"
              }
            }}
          />

          {/* Onboarding Workflow */}
          <ProcessTrigger
            workflowKey="investor-onboarding"
            title="Investor Onboarding"
            description="Complete investor onboarding flow: KYC → NDA → Subscription → First Funding"
            iconName="Users"
            schema={{
              investor_email: {
                label: "Investor Email",
                type: "email"
              },
              investment_amount: {
                label: "Initial Investment",
                type: "number",
                placeholder: "1000000"
              },
              target_vehicle: {
                label: "Target Vehicle",
                type: "text",
                placeholder: "VERSO FUND"
              }
            }}
          />

        </div>

        {/* Workflow Status Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Workflow className="h-5 w-5" />
              Active Workflows Status
            </CardTitle>
            <CardDescription>
              Real-time status of recent n8n workflow executions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Connect to your n8n instance to see real-time workflow status here.
              <br />
              Configure webhooks to receive completion notifications and track execution history.
            </div>
          </CardContent>
        </Card>

      </div>
    </AppLayout>
  )
}
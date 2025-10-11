import { render, screen } from '@/tests/utils/test-utils'
import StaffDashboard from '@/app/(staff)/versotech/staff/page'
import { describe, it, expect, beforeEach, vi } from 'vitest'

const mockRequireStaffAuth = vi.fn()
const mockGetStaffDashboardData = vi.fn()

vi.mock('@/lib/auth', () => ({
  requireStaffAuth: () => mockRequireStaffAuth()
}))

vi.mock('@/lib/staff/dashboard-data', () => ({
  getStaffDashboardData: () => mockGetStaffDashboardData()
}))

vi.mock('@/components/layout/app-layout', () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-layout">{children}</div>
  )
}))

describe('StaffDashboard (server component)', () => {
  beforeEach(() => {
    mockRequireStaffAuth.mockResolvedValue({ id: 'staff-user' })
  })

  const baseData = {
    generatedAt: '2025-10-10T00:00:00.000Z',
    kpis: {
      activeLps: 42,
      pendingKyc: 6,
      highPriorityKyc: 2,
      workflowRunsThisMonth: 128,
      complianceRate: 98.4
    },
    pipeline: {
      kycPending: 6,
      ndaInProgress: 4,
      subscriptionReview: 3,
      nextCapitalCall: {
        name: 'Capital Call Q4',
        dueDate: '2025-11-15T00:00:00.000Z'
      }
    },
    processCenter: {
      activeWorkflows: 12
    },
    management: {
      activeDeals: 5,
      activeRequests: 7,
      complianceRate: 98.4,
      activeInvestors: 42
    },
    recentActivity: [
      {
        id: 'activity-1',
        title: 'Position Statement Generated',
        description: 'Investor ABC — Q3 2025',
        activityType: 'workflow',
        createdAt: '2025-10-10T09:15:00.000Z'
      }
    ]
  }

  it('renders KPI, pipeline, and management metrics from loader data', async () => {
    mockGetStaffDashboardData.mockResolvedValueOnce(baseData)

    const page = await StaffDashboard()
    render(page)

    expect(screen.getByTestId('app-layout')).toBeInTheDocument()

    expect(screen.getByText('Active LPs')).toBeInTheDocument()
    expect(screen.getAllByText('42')[0]).toBeInTheDocument()

    expect(screen.getByText('Pending KYC/AML')).toBeInTheDocument()
    expect(screen.getByText('2 high priority')).toBeInTheDocument()

    expect(screen.getByText('Workflow Runs (MTD)')).toBeInTheDocument()
    expect(screen.getByText('128')).toBeInTheDocument()

    expect(screen.getByText('KYC Processing')).toBeInTheDocument()
    expect(screen.getByText('6 pending')).toBeInTheDocument()
    expect(screen.getByText('NDA Execution')).toBeInTheDocument()
    expect(screen.getByText('4 in progress')).toBeInTheDocument()

    expect(screen.getByText('Deal Management')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('Request Management')).toBeInTheDocument()

    expect(screen.getByText('Position Statement Generated')).toBeInTheDocument()
    expect(screen.getByText('Investor ABC — Q3 2025')).toBeInTheDocument()
  })

  it('shows fallback messaging when no recent activity and errors present', async () => {
    mockGetStaffDashboardData.mockResolvedValueOnce({
      ...baseData,
      recentActivity: [],
      errors: ['capital calls unavailable']
    })

    const page = await StaffDashboard()
    render(page)

    expect(
      screen.getByText('Some dashboard metrics are unavailable right now.')
    ).toBeInTheDocument()
    expect(screen.getByText('No recent operations recorded.')).toBeInTheDocument()
  })
})



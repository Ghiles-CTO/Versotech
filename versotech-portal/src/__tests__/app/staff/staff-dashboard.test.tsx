import type { ReactNode } from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@/__tests__/utils/test-utils'
import StaffDashboard from '@/app/(staff)/versotech/staff/page'

interface StaffDashboardActivity {
  id: string
  title: string
  description: string | null
  activityType: string
  createdAt: string
}

interface StaffDashboardData {
  generatedAt: string
  kpis: {
    activeLps: number
    pendingKyc: number
    highPriorityKyc: number
    workflowRunsThisMonth: number
    complianceRate: number
  }
  pipeline: {
    kycPending: number
    ndaInProgress: number
    subscriptionReview: number
    nextCapitalCall?: {
      name: string
      dueDate: string
    }
  }
  processCenter: {
    activeWorkflows: number
  }
  management: {
    activeDeals: number
    activeRequests: number
    complianceRate: number
    activeInvestors: number
  }
  recentActivity: StaffDashboardActivity[]
  errors?: string[]
}

interface RealtimeDashboardMetrics {
  activeLps: number
  pendingKyc: number
  workflowRuns: number
  complianceRate: number
  kycPipeline: number
  ndaInProgress: number
  subscriptionReview: number
  activeDeals: number
  activeRequests: number
  lastUpdated: string
}

interface SupabaseProfileResponse {
  data: {
    has_seen_intro_video: boolean
  } | null
  error: null
}

interface SupabaseProfileQuery {
  single: () => Promise<SupabaseProfileResponse>
}

interface SupabaseProfileFilter {
  eq: (column: string, value: string) => SupabaseProfileQuery
}

interface SupabaseProfileSelect {
  select: (columns: string) => SupabaseProfileFilter
}

interface SupabaseServerClient {
  from: (table: string) => SupabaseProfileSelect
}

const mockRequireStaffAuth = vi.fn()
const mockGetCachedStaffDashboardData = vi.fn()
const mockRealtimeStaffDashboard = vi.fn()
const mockEnhancedStaffDashboard = vi.fn()
const mockServerClient: SupabaseServerClient = {
  from: vi.fn() as SupabaseServerClient['from']
}

vi.mock('@/lib/auth', () => ({
  requireStaffAuth: () => mockRequireStaffAuth()
}))

vi.mock('@/lib/staff/dashboard-cache', () => ({
  getCachedStaffDashboardData: () => mockGetCachedStaffDashboardData()
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => mockServerClient
}))

vi.mock('@/components/dashboard/realtime-staff-dashboard', () => ({
  RealtimeStaffDashboard: ({ initialData }: { initialData: RealtimeDashboardMetrics }) => {
    mockRealtimeStaffDashboard(initialData)
    return (
      <div data-testid="realtime-dashboard">Realtime Metrics</div>
    )
  }
}))

vi.mock('@/components/dashboard/enhanced-staff-dashboard', () => ({
  EnhancedStaffDashboard: ({ initialData }: { initialData: StaffDashboardData }) => {
    mockEnhancedStaffDashboard(initialData)
    return (
      <div data-testid="enhanced-dashboard">
        <div>Active LPs</div>
        <div>{initialData.kpis.activeLps}</div>
        <div>Pending KYC/AML</div>
        <div>{initialData.kpis.highPriorityKyc} high priority</div>
        <div>Workflow Runs (MTD)</div>
        <div>{initialData.kpis.workflowRunsThisMonth}</div>
        <div>KYC Processing</div>
        <div>{initialData.pipeline.kycPending} pending</div>
        <div>NDA Execution</div>
        <div>{initialData.pipeline.ndaInProgress} in progress</div>
        <div>Deal Management</div>
        <div>{initialData.management.activeDeals}</div>
        <div>Request Management</div>
        {initialData.errors?.length ? (
          <div>Some dashboard metrics are unavailable right now.</div>
        ) : null}
        {initialData.recentActivity.length ? (
          initialData.recentActivity.map((activity) => (
            <div key={activity.id}>
              <div>{activity.title}</div>
              {activity.description ? <div>{activity.description}</div> : null}
            </div>
          ))
        ) : (
          <div>No recent operations recorded.</div>
        )}
      </div>
    )
  }
}))

vi.mock('@/components/layout/app-layout', () => ({
  AppLayout: ({ children }: { children: ReactNode }) => (
    <div data-testid="app-layout">{children}</div>
  )
}))

vi.mock('@/app/(staff)/versotech/staff/video-intro-wrapper', () => ({
  VideoIntroWrapper: ({ children }: { children: ReactNode }) => (
    <div data-testid="video-intro-wrapper">{children}</div>
  )
}))

describe('StaffDashboard (server component)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRequireStaffAuth.mockResolvedValue({ id: 'staff-user' })

    const profileResponse: SupabaseProfileResponse = {
      data: { has_seen_intro_video: true },
      error: null
    }
    const mockSingle = vi.fn().mockResolvedValue(profileResponse)
    const mockEq = vi.fn().mockReturnValue({ single: mockSingle })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockServerClient.from.mockReturnValue({ select: mockSelect })
  })

  const baseData: StaffDashboardData = {
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
    mockGetCachedStaffDashboardData.mockResolvedValueOnce(baseData)

    const page = await StaffDashboard()
    render(page)

    expect(screen.getByTestId('video-intro-wrapper')).toBeInTheDocument()

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
    mockGetCachedStaffDashboardData.mockResolvedValueOnce({
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

import { http, HttpResponse } from 'msw'

// Mock data for testing
export const mockDashboardData = {
  kpis: {
    currentNAV: 1500000,
    totalContributed: 1200000,
    totalDistributions: 300000,
    unfundedCommitment: 800000,
    unrealizedGain: 600000,
    unrealizedGainPct: 25.5,
    dpi: 0.25,
    tvpi: 1.5,
    irr: 0.185
  },
  vehicles: [
    {
      id: 'vehicle-1',
      name: 'VERSO FUND',
      type: 'fund',
      domicile: 'BVI',
      currency: 'USD'
    },
    {
      id: 'vehicle-2',
      name: 'REAL Empire',
      type: 'fund',
      domicile: 'Luxembourg',
      currency: 'EUR'
    }
  ],
  recentActivity: [
    {
      id: 'activity-1',
      activity_type: 'valuation',
      title: 'Q3 Valuation Update',
      description: 'Portfolio valuation increased by 8.2%',
      importance: 'high',
      read_status: false,
      created_at: '2024-09-20T10:00:00Z'
    },
    {
      id: 'activity-2',
      activity_type: 'distribution',
      title: 'Distribution Payment',
      description: 'Quarterly distribution of $50,000 processed',
      importance: 'normal',
      read_status: true,
      created_at: '2024-09-19T15:30:00Z'
    }
  ]
}

export const mockDeals = [
  {
    id: 'deal-1',
    name: 'VERSO Secondary Opportunity I',
    deal_type: 'equity_secondary',
    status: 'open',
    vehicle_name: 'VERSO FUND',
    open_at: '2024-08-25T00:00:00Z',
    close_at: '2024-11-25T00:00:00Z'
  },
  {
    id: 'deal-2',
    name: 'Real Empire Growth Deal',
    deal_type: 'equity_primary',
    status: 'allocation_pending',
    vehicle_name: 'REAL Empire',
    open_at: '2024-09-10T00:00:00Z',
    close_at: '2024-12-10T00:00:00Z'
  }
]

export const mockPerformanceData = Array.from({ length: 12 }, (_, i) => ({
  period: new Date(2024, i, 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
  date: new Date(2024, i, 1).toISOString().split('T')[0],
  nav: 1000000 + (i * 50000) + (Math.random() * 100000),
  contributions: Math.min(1000000, 100000 * i),
  distributions: i > 6 ? 50000 * (i - 6) : 0,
  dpi: i > 6 ? (50000 * (i - 6)) / (100000 * i) : 0,
  tvpi: 1 + (i * 0.05) + (Math.random() * 0.1),
  irr: 0.08 + (i * 0.01) + (Math.random() * 0.02)
}))

// MSW handlers
export const handlers = [
  // Dashboard data endpoint
  http.get('/api/dashboard', () => {
    return HttpResponse.json(mockDashboardData)
  }),

  // Deals endpoint
  http.get('/api/deals', () => {
    return HttpResponse.json({ data: mockDeals })
  }),

  // Performance trends endpoint
  http.get('/api/performance-trends', () => {
    return HttpResponse.json({ data: mockPerformanceData })
  }),

  // Deal-specific data endpoint
  http.get('/api/deals/:dealId/data', ({ params }) => {
    const { dealId } = params
    const dealData = {
      ...mockDashboardData,
      kpis: {
        ...mockDashboardData.kpis,
        currentNAV: mockDashboardData.kpis.currentNAV * 0.3,
        totalContributed: mockDashboardData.kpis.totalContributed * 0.3,
        totalDistributions: mockDashboardData.kpis.totalDistributions * 0.3
      },
      vehicles: mockDashboardData.vehicles.slice(0, 1)
    }
    return HttpResponse.json(dealData)
  }),

  // Activity feed endpoint
  http.get('/api/activity', () => {
    return HttpResponse.json({ data: mockDashboardData.recentActivity })
  }),

  // Error handling
  http.get('/api/error-test', () => {
    return HttpResponse.json(
      { error: 'Test error' },
      { status: 500 }
    )
  })
]
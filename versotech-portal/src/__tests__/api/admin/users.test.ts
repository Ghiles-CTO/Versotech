/**
 * Admin Users API Tests
 *
 * Tests for /api/admin/users endpoints including:
 * - GET /api/admin/users (list)
 * - GET /api/admin/users/[id] (single)
 * - PATCH /api/admin/users/[id] (edit)
 * - POST /api/admin/users/[id]/reset-password
 * - PATCH /api/admin/users/[id]/deactivate
 * - PATCH /api/admin/users/[id]/reactivate
 * - PATCH /api/admin/users/[id]/toggle-lock
 * - GET /api/admin/users/[id]/activity
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import type { AuthUser } from '@/lib/auth'

// Mock modules before importing the routes
vi.mock('@/lib/supabase/server', () => ({
  createServiceClient: vi.fn()
}))

vi.mock('@/lib/auth', () => ({
  getCurrentUser: vi.fn()
}))

vi.mock('@/lib/api-auth', () => ({
  isSuperAdmin: vi.fn()
}))

vi.mock('@/lib/email/resend-service', () => ({
  sendPasswordResetEmail: vi.fn()
}))

vi.mock('@/lib/audit', () => ({
  auditLogger: {
    log: vi.fn()
  },
  AuditEntities: {
    USERS: 'users',
    PROFILES: 'profiles'
  }
}))

// Import mocked modules
import { createServiceClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth'
import { isSuperAdmin } from '@/lib/api-auth'
import { sendPasswordResetEmail } from '@/lib/email/resend-service'
import { auditLogger } from '@/lib/audit'

// Helper to create a mock AuthUser
const createMockUser = (id: string): AuthUser => ({
  id,
  email: `${id}@test.com`,
  displayName: `Test User ${id}`,
  role: 'staff_admin',
  created_at: new Date().toISOString()
})

// Helper to create mock Supabase client with chainable methods
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createMockSupabase = () => {
  return {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockReturnValue({ data: null, error: null }),
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({ data: [], error: null })
          })
        }),
        in: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis()
      }),
      insert: vi.fn().mockReturnValue({ data: null, error: null }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({ error: null })
      }),
      delete: vi.fn().mockReturnValue({ data: null, error: null })
    }),
    auth: {
      admin: {
        generateLink: vi.fn().mockReturnValue({
          data: { properties: { action_link: 'https://test.com/reset' } },
          error: null
        })
      }
    },
    rpc: vi.fn().mockReturnValue({ data: null, error: null })
  }
}

// Helper to create NextRequest
const createRequest = (method: string, body?: any, searchParams?: Record<string, string>) => {
  const url = new URL('http://localhost:3000/api/admin/users')
  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      url.searchParams.set(key, value)
    })
  }

  return new NextRequest(url, {
    method,
    ...(body && { body: JSON.stringify(body) })
  })
}

describe('Admin Users API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('Authorization', () => {
    it('returns 401 when user is not authenticated', async () => {
      vi.mocked(getCurrentUser).mockResolvedValue(null)

      // Import route dynamically to get fresh mocks
      const { PATCH } = await import('@/app/api/admin/users/[id]/deactivate/route')

      const request = createRequest('PATCH')
      const response = await PATCH(request, { params: Promise.resolve({ id: 'user-123' }) })
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('returns 403 when user is not super admin or CEO', async () => {
      vi.mocked(getCurrentUser).mockResolvedValue(createMockUser('actor-123'))
      vi.mocked(isSuperAdmin).mockResolvedValue(false)
      vi.mocked(createServiceClient).mockReturnValue(createMockSupabase() as any)

      const { PATCH } = await import('@/app/api/admin/users/[id]/deactivate/route')

      const request = createRequest('PATCH')
      const response = await PATCH(request, { params: Promise.resolve({ id: 'user-123' }) })
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Forbidden')
    })

    it('allows CEO users to access admin endpoints', async () => {
      vi.mocked(getCurrentUser).mockResolvedValue(createMockUser('ceo-user-123'))
      vi.mocked(isSuperAdmin).mockResolvedValue(true) // CEO returns true via isSuperAdmin

      const mockSupabase = createMockSupabase()
      // Setup profile fetch to return a user
      const profileSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockReturnValue({
            data: { deleted_at: null, email: 'target@test.com', display_name: 'Target User' },
            error: null
          })
        })
      })
      mockSupabase.from = vi.fn().mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: profileSelect,
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({ error: null })
            })
          }
        }
        return { select: vi.fn().mockReturnThis() }
      })
      vi.mocked(createServiceClient).mockReturnValue(mockSupabase as any)

      const { PATCH } = await import('@/app/api/admin/users/[id]/deactivate/route')

      const request = createRequest('PATCH')
      const response = await PATCH(request, { params: Promise.resolve({ id: 'user-123' }) })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })
  })

  describe('POST /api/admin/users/[id]/reset-password', () => {
    it('generates reset link and sends email via Resend', async () => {
      vi.mocked(getCurrentUser).mockResolvedValue(createMockUser('admin-123'))
      vi.mocked(isSuperAdmin).mockResolvedValue(true)
      vi.mocked(sendPasswordResetEmail).mockResolvedValue({ success: true, messageId: 'msg-123' })

      const mockSupabase = createMockSupabase()
      mockSupabase.from = vi.fn().mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockReturnValue({
                  data: { email: 'user@test.com', display_name: 'Test User', deleted_at: null },
                  error: null
                })
              })
            })
          }
        }
        return { select: vi.fn().mockReturnThis() }
      })
      vi.mocked(createServiceClient).mockReturnValue(mockSupabase as any)

      const { POST } = await import('@/app/api/admin/users/[id]/reset-password/route')

      const request = createRequest('POST')
      const response = await POST(request, { params: Promise.resolve({ id: 'user-123' }) })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(sendPasswordResetEmail).toHaveBeenCalledWith({
        email: 'user@test.com',
        displayName: 'Test User',
        resetUrl: 'https://test.com/reset'
      })
      expect(auditLogger.log).toHaveBeenCalled()
    })

    it('returns 400 for deactivated users', async () => {
      vi.mocked(getCurrentUser).mockResolvedValue(createMockUser('admin-123'))
      vi.mocked(isSuperAdmin).mockResolvedValue(true)

      const mockSupabase = createMockSupabase()
      mockSupabase.from = vi.fn().mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockReturnValue({
                  data: { email: 'user@test.com', display_name: 'Test User', deleted_at: '2024-01-01T00:00:00Z' },
                  error: null
                })
              })
            })
          }
        }
        return { select: vi.fn().mockReturnThis() }
      })
      vi.mocked(createServiceClient).mockReturnValue(mockSupabase as any)

      const { POST } = await import('@/app/api/admin/users/[id]/reset-password/route')

      const request = createRequest('POST')
      const response = await POST(request, { params: Promise.resolve({ id: 'user-123' }) })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('deactivated')
    })

    it('handles email send failure', async () => {
      vi.mocked(getCurrentUser).mockResolvedValue(createMockUser('admin-123'))
      vi.mocked(isSuperAdmin).mockResolvedValue(true)
      vi.mocked(sendPasswordResetEmail).mockResolvedValue({ success: false, error: 'Email service unavailable' })

      const mockSupabase = createMockSupabase()
      mockSupabase.from = vi.fn().mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockReturnValue({
                  data: { email: 'user@test.com', display_name: 'Test User', deleted_at: null },
                  error: null
                })
              })
            })
          }
        }
        return { select: vi.fn().mockReturnThis() }
      })
      vi.mocked(createServiceClient).mockReturnValue(mockSupabase as any)

      const { POST } = await import('@/app/api/admin/users/[id]/reset-password/route')

      const request = createRequest('POST')
      const response = await POST(request, { params: Promise.resolve({ id: 'user-123' }) })
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toContain('Failed to send')
    })
  })

  describe('PATCH /api/admin/users/[id]/deactivate', () => {
    it('prevents self-deactivation', async () => {
      vi.mocked(getCurrentUser).mockResolvedValue(createMockUser('user-123'))
      vi.mocked(isSuperAdmin).mockResolvedValue(true)
      vi.mocked(createServiceClient).mockReturnValue(createMockSupabase() as any)

      const { PATCH } = await import('@/app/api/admin/users/[id]/deactivate/route')

      const request = createRequest('PATCH')
      const response = await PATCH(request, { params: Promise.resolve({ id: 'user-123' }) })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('own account')
    })

    it('returns 400 if user is already deactivated', async () => {
      vi.mocked(getCurrentUser).mockResolvedValue(createMockUser('admin-123'))
      vi.mocked(isSuperAdmin).mockResolvedValue(true)

      const mockSupabase = createMockSupabase()
      mockSupabase.from = vi.fn().mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockReturnValue({
                  data: { deleted_at: '2024-01-01T00:00:00Z', email: 'user@test.com', display_name: 'Test' },
                  error: null
                })
              })
            })
          }
        }
        return { select: vi.fn().mockReturnThis() }
      })
      vi.mocked(createServiceClient).mockReturnValue(mockSupabase as any)

      const { PATCH } = await import('@/app/api/admin/users/[id]/deactivate/route')

      const request = createRequest('PATCH')
      const response = await PATCH(request, { params: Promise.resolve({ id: 'user-456' }) })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('already inactive')
    })

    it('soft deletes user and logs audit event', async () => {
      vi.mocked(getCurrentUser).mockResolvedValue(createMockUser('admin-123'))
      vi.mocked(isSuperAdmin).mockResolvedValue(true)

      const mockSupabase = createMockSupabase()
      const updateMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({ error: null })
      })
      mockSupabase.from = vi.fn().mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockReturnValue({
                  data: { deleted_at: null, email: 'user@test.com', display_name: 'Test User' },
                  error: null
                })
              })
            }),
            update: updateMock
          }
        }
        return { select: vi.fn().mockReturnThis() }
      })
      vi.mocked(createServiceClient).mockReturnValue(mockSupabase as any)

      const { PATCH } = await import('@/app/api/admin/users/[id]/deactivate/route')

      const request = createRequest('PATCH')
      const response = await PATCH(request, { params: Promise.resolve({ id: 'user-456' }) })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(auditLogger.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'user_deactivated',
          entity_id: 'user-456'
        })
      )
    })
  })

  describe('PATCH /api/admin/users/[id]/reactivate', () => {
    it('returns 400 if user is already active', async () => {
      vi.mocked(getCurrentUser).mockResolvedValue(createMockUser('admin-123'))
      vi.mocked(isSuperAdmin).mockResolvedValue(true)

      const mockSupabase = createMockSupabase()
      mockSupabase.from = vi.fn().mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockReturnValue({
                  data: { deleted_at: null, email: 'user@test.com', display_name: 'Test' },
                  error: null
                })
              })
            })
          }
        }
        return { select: vi.fn().mockReturnThis() }
      })
      vi.mocked(createServiceClient).mockReturnValue(mockSupabase as any)

      const { PATCH } = await import('@/app/api/admin/users/[id]/reactivate/route')

      const request = createRequest('PATCH')
      const response = await PATCH(request, { params: Promise.resolve({ id: 'user-456' }) })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('already active')
    })

    it('clears deleted_at and logs audit event', async () => {
      vi.mocked(getCurrentUser).mockResolvedValue(createMockUser('admin-123'))
      vi.mocked(isSuperAdmin).mockResolvedValue(true)

      const mockSupabase = createMockSupabase()
      const updateMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({ error: null })
      })
      mockSupabase.from = vi.fn().mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockReturnValue({
                  data: { deleted_at: '2024-01-01T00:00:00Z', email: 'user@test.com', display_name: 'Test User' },
                  error: null
                })
              })
            }),
            update: updateMock
          }
        }
        return { select: vi.fn().mockReturnThis() }
      })
      vi.mocked(createServiceClient).mockReturnValue(mockSupabase as any)

      const { PATCH } = await import('@/app/api/admin/users/[id]/reactivate/route')

      const request = createRequest('PATCH')
      const response = await PATCH(request, { params: Promise.resolve({ id: 'user-456' }) })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(auditLogger.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'user_reactivated',
          entity_id: 'user-456'
        })
      )
    })
  })

  describe('PATCH /api/admin/users/[id]/toggle-lock', () => {
    it('prevents self-locking', async () => {
      vi.mocked(getCurrentUser).mockResolvedValue(createMockUser('user-123'))
      vi.mocked(isSuperAdmin).mockResolvedValue(true)
      vi.mocked(createServiceClient).mockReturnValue(createMockSupabase() as any)

      const { PATCH } = await import('@/app/api/admin/users/[id]/toggle-lock/route')

      const request = createRequest('PATCH')
      const response = await PATCH(request, { params: Promise.resolve({ id: 'user-123' }) })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('own account')
    })

    it('toggles lock status and logs audit event', async () => {
      vi.mocked(getCurrentUser).mockResolvedValue(createMockUser('admin-123'))
      vi.mocked(isSuperAdmin).mockResolvedValue(true)

      const mockSupabase = createMockSupabase()
      const updateMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({ error: null })
      })
      mockSupabase.from = vi.fn().mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockReturnValue({
                  data: { deleted_at: null, email: 'user@test.com', display_name: 'Test User' },
                  error: null
                })
              })
            }),
            update: updateMock
          }
        }
        return { select: vi.fn().mockReturnThis() }
      })
      vi.mocked(createServiceClient).mockReturnValue(mockSupabase as any)

      const { PATCH } = await import('@/app/api/admin/users/[id]/toggle-lock/route')

      const request = createRequest('PATCH')
      const response = await PATCH(request, { params: Promise.resolve({ id: 'user-456' }) })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.is_locked).toBe(true)
      expect(auditLogger.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'user_locked'
        })
      )
    })
  })

  describe('PATCH /api/admin/users/[id] (edit profile)', () => {
    it('validates input schema', async () => {
      vi.mocked(getCurrentUser).mockResolvedValue(createMockUser('admin-123'))
      vi.mocked(isSuperAdmin).mockResolvedValue(true)
      vi.mocked(createServiceClient).mockReturnValue(createMockSupabase() as any)

      const { PATCH } = await import('@/app/api/admin/users/[id]/route')

      // Send empty object - should fail validation
      const request = new NextRequest('http://localhost:3000/api/admin/users/user-123', {
        method: 'PATCH',
        body: JSON.stringify({})
      })
      const response = await PATCH(request, { params: Promise.resolve({ id: 'user-123' }) })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('No fields')
    })

    it('updates user profile and logs audit with before/after', async () => {
      vi.mocked(getCurrentUser).mockResolvedValue(createMockUser('admin-123'))
      vi.mocked(isSuperAdmin).mockResolvedValue(true)

      const mockSupabase = createMockSupabase()
      const updateMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({ error: null })
      })
      mockSupabase.from = vi.fn().mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockReturnValue({
                  data: {
                    display_name: 'Old Name',
                    title: 'Old Title',
                    phone: null,
                    office_location: null,
                    email: 'user@test.com'
                  },
                  error: null
                })
              })
            }),
            update: updateMock
          }
        }
        return { select: vi.fn().mockReturnThis() }
      })
      vi.mocked(createServiceClient).mockReturnValue(mockSupabase as any)

      const { PATCH } = await import('@/app/api/admin/users/[id]/route')

      const request = new NextRequest('http://localhost:3000/api/admin/users/user-123', {
        method: 'PATCH',
        body: JSON.stringify({ display_name: 'New Name', title: 'New Title' })
      })
      const response = await PATCH(request, { params: Promise.resolve({ id: 'user-123' }) })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(auditLogger.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'profile_updated',
          metadata: expect.objectContaining({
            before: expect.objectContaining({ display_name: 'Old Name' }),
            after: expect.objectContaining({ display_name: 'New Name' })
          })
        })
      )
    })
  })

  describe('GET /api/admin/users/[id]/activity', () => {
    it('returns formatted activity logs', async () => {
      vi.mocked(getCurrentUser).mockResolvedValue(createMockUser('admin-123'))
      vi.mocked(isSuperAdmin).mockResolvedValue(true)

      const mockSupabase = createMockSupabase()
      mockSupabase.from = vi.fn().mockImplementation((table: string) => {
        if (table === 'audit_logs') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockReturnValue({
                  limit: vi.fn().mockReturnValue({
                    data: [
                      {
                        id: 'log-1',
                        action: 'user_login',
                        timestamp: '2024-01-15T10:00:00Z',
                        entity_type: 'session',
                        entity_id: 'session-1',
                        action_details: { ip: '127.0.0.1' },
                        ip_address: '127.0.0.1',
                        user_agent: 'Mozilla/5.0'
                      }
                    ],
                    error: null
                  })
                })
              })
            })
          }
        }
        return { select: vi.fn().mockReturnThis() }
      })
      vi.mocked(createServiceClient).mockReturnValue(mockSupabase as any)

      const { GET } = await import('@/app/api/admin/users/[id]/activity/route')

      const request = createRequest('GET')
      const response = await GET(request, { params: Promise.resolve({ id: 'user-456' }) })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.logs).toHaveLength(1)
      expect(data.data.logs[0].action).toBe('user login') // Formatted with spaces
    })
  })
})

describe('Date Helpers', () => {
  it('getIdExpiryWarning returns correct status', async () => {
    const { getIdExpiryWarning } = await import('@/lib/utils/date-helpers')

    // Test null input
    expect(getIdExpiryWarning(null)).toBeNull()

    // Test expired date
    const expiredDate = new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
    expect(getIdExpiryWarning(expiredDate)).toBe('expired')

    // Test expiring soon (within 30 days)
    const expiringSoonDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 15).toISOString()
    expect(getIdExpiryWarning(expiringSoonDate)).toBe('expiring_soon')

    // Test future date (more than 30 days)
    const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 60).toISOString()
    expect(getIdExpiryWarning(futureDate)).toBeNull()
  })
})

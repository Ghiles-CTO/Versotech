// Simple Demo Authentication System
// Clean, straightforward authentication for demo purposes

export interface DemoUser {
  id: string
  email: string
  password: string
  role: 'investor' | 'staff'
  displayName: string
  avatar?: string
  department?: string
}

// Demo users database (using UUIDs to match database)
export const DEMO_USERS: DemoUser[] = [
  // INVESTOR USERS
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    email: 'investor@demo.com',
    password: 'demo123',
    role: 'investor',
    displayName: 'John Investor',
    avatar: '👨‍💼'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    email: 'sarah@investor.com',
    password: 'demo123',
    role: 'investor',
    displayName: 'Sarah Wilson',
    avatar: '👩‍💼'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    email: 'family.office@demo.com',
    password: 'demo123',
    role: 'investor',
    displayName: 'Wellington Family Office',
    avatar: '🏛️'
  },

  // STAFF USERS
  {
    id: '550e8400-e29b-41d4-a716-446655440011',
    email: 'admin@demo.com',
    password: 'demo123',
    role: 'staff',
    displayName: 'Admin User',
    avatar: '👑',
    department: 'Administration'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440012',
    email: 'manager@demo.com',
    password: 'demo123',
    role: 'staff',
    displayName: 'Portfolio Manager',
    avatar: '📊',
    department: 'Portfolio Management'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440013',
    email: 'operations@demo.com',
    password: 'demo123',
    role: 'staff',
    displayName: 'Operations Team',
    avatar: '⚙️',
    department: 'Operations'
  }
]

// Simple authentication functions
export const authenticateUser = (email: string, password: string): DemoUser | null => {
  const user = DEMO_USERS.find(u => 
    u.email.toLowerCase() === email.toLowerCase() && 
    u.password === password
  )
  return user || null
}

export const getUserById = (id: string): DemoUser | null => {
  return DEMO_USERS.find(u => u.id === id) || null
}

export const getUserByEmail = (email: string): DemoUser | null => {
  return DEMO_USERS.find(u => u.email.toLowerCase() === email.toLowerCase()) || null
}

// Demo credentials for UI display
export const DEMO_CREDENTIALS = {
  investor: [
    { email: 'investor@demo.com', password: 'demo123', name: 'John Investor' },
    { email: 'sarah@investor.com', password: 'demo123', name: 'Sarah Wilson' },
    { email: 'family.office@demo.com', password: 'demo123', name: 'Wellington Family Office' }
  ],
  staff: [
    { email: 'admin@demo.com', password: 'demo123', name: 'Admin User' },
    { email: 'manager@demo.com', password: 'demo123', name: 'Portfolio Manager' },
    { email: 'operations@demo.com', password: 'demo123', name: 'Operations Team' }
  ]
}

// Session management
export const createSession = (user: DemoUser) => {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    displayName: user.displayName,
    avatar: user.avatar,
    department: user.department,
    sessionId: `session-${user.id}-${Date.now()}`,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  }
}

export type SessionData = ReturnType<typeof createSession>

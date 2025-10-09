// Enterprise Demo Authentication System
// This provides demo credentials for both portals with proper role management

export interface DemoUser {
  id: string
  email: string
  password: string
  role: 'investor' | 'staff_admin' | 'staff_ops' | 'staff_rm'
  display_name: string
  title?: string
  department?: string
  investor_profile?: {
    legal_name: string
    type: 'individual' | 'institution'
    country: string
    kyc_status: 'completed' | 'pending' | 'rejected'
  }
}

// Enterprise Demo Credentials
export const DEMO_USERS: Record<string, DemoUser> = {
  // INVESTOR PORTAL USERS
  'investor.demo@versoholdings.com': {
    id: '20000000-0000-0000-0000-000000000001',
    email: 'investor.demo@versoholdings.com',
    password: 'investor123',
    role: 'investor',
    display_name: 'Alexandra Sterling',
    investor_profile: {
      legal_name: 'Alexandra Sterling',
      type: 'individual',
      country: 'Luxembourg',
      kyc_status: 'completed'
    }
  },
  'family.office@versoholdings.com': {
    id: '20000000-0000-0000-0000-000000000002',
    email: 'family.office@versoholdings.com',
    password: 'family123',
    role: 'investor',
    display_name: 'Wellington Family Office',
    investor_profile: {
      legal_name: 'Wellington Family Office Ltd.',
      type: 'institution',
      country: 'Switzerland',
      kyc_status: 'completed'
    }
  },
  'pension.fund@versoholdings.com': {
    id: '20000000-0000-0000-0000-000000000003',
    email: 'pension.fund@versoholdings.com',
    password: 'pension123',
    role: 'investor',
    display_name: 'Nordic Pension Fund',
    investor_profile: {
      legal_name: 'Nordic Pension Fund ASA',
      type: 'institution',
      country: 'Norway',
      kyc_status: 'completed'
    }
  },

  // STAFF PORTAL USERS
  'admin@versotech.com': {
    id: '10000000-0000-0000-0000-000000000001',
    email: 'admin@versotech.com',
    password: 'admin123',
    role: 'staff_admin',
    display_name: 'Marcus Chen',
    title: 'Managing Director',
    department: 'Executive'
  },
  'operations@versotech.com': {
    id: '10000000-0000-0000-0000-000000000002',
    email: 'operations@versotech.com',
    password: 'ops123',
    role: 'staff_ops',
    display_name: 'Sarah Williams',
    title: 'Head of Operations',
    department: 'Operations'
  },
  'relations@versotech.com': {
    id: '10000000-0000-0000-0000-000000000003',
    email: 'relations@versotech.com',
    password: 'rm123',
    role: 'staff_rm',
    display_name: 'David Rodriguez',
    title: 'Senior Relationship Manager',
    department: 'Client Relations'
  },
  'compliance@versotech.com': {
    id: '10000000-0000-0000-0000-000000000004',
    email: 'compliance@versotech.com',
    password: 'compliance123',
    role: 'staff_admin',
    display_name: 'Emma Thompson',
    title: 'Chief Compliance Officer',
    department: 'Compliance'
  }
}

export const validateDemoCredentials = (email: string, password: string): DemoUser | null => {
  const user = DEMO_USERS[email.toLowerCase()]
  if (user && user.password === password) {
    return user
  }
  return null
}

export const getDemoUserByEmail = (email: string): DemoUser | null => {
  return DEMO_USERS[email.toLowerCase()] || null
}

export const isInvestorPortalUser = (email: string): boolean => {
  const user = getDemoUserByEmail(email)
  return user?.role === 'investor'
}

export const isStaffPortalUser = (email: string): boolean => {
  const user = getDemoUserByEmail(email)
  return user?.role.startsWith('staff_') || false
}

// Demo credentials for display in UI
export const DEMO_CREDENTIALS = {
  investor: [
    {
      email: 'investor.demo@versoholdings.com',
      password: 'investor123',
      description: 'High Net Worth Individual - Luxembourg'
    },
    {
      email: 'family.office@versoholdings.com', 
      password: 'family123',
      description: 'Family Office - Switzerland'
    },
    {
      email: 'pension.fund@versoholdings.com',
      password: 'pension123', 
      description: 'Institutional Investor - Norway'
    }
  ],
  staff: [
    {
      email: 'admin@versotech.com',
      password: 'admin123',
      name: 'Marcus Chen',
      description: 'Managing Director - Full Access'
    },
    {
      email: 'operations@versotech.com',
      password: 'ops123',
      name: 'Sarah Williams',
      description: 'Head of Operations'
    },
    {
      email: 'relations@versotech.com',
      password: 'rm123',
      name: 'David Rodriguez',
      description: 'Senior Relationship Manager'
    },
    {
      email: 'compliance@versotech.com',
      password: 'compliance123',
      name: 'Emma Thompson',
      description: 'Chief Compliance Officer'
    }
  ]
}


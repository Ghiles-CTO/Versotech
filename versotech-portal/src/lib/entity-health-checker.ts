/**
 * Entity Health Checker
 *
 * Provides real-time health monitoring for entities by checking:
 * - Metadata completeness
 * - Stakeholder coverage
 * - Director status
 * - Document requirements
 * - Deal activity
 * - Investor status
 */

export type HealthStatus = 'pass' | 'warning' | 'fail'

export interface HealthCheck {
  id: string
  category: string
  title: string
  status: HealthStatus
  message: string
  details?: string
  actionable?: {
    label: string
    action: string
  }
}

export interface EntityHealthResult {
  overallScore: number
  overallStatus: HealthStatus
  checks: HealthCheck[]
  passCount: number
  warningCount: number
  failCount: number
}

interface Entity {
  id: string
  name: string
  entity_code: string | null
  type: string
  status: string | null
  domicile: string | null
  legal_jurisdiction: string | null
  formation_date: string | null
  registration_number: string | null
  currency: string
}

interface Director {
  id: string
  full_name: string
  effective_from: string | null
  effective_to: string | null
}

interface Stakeholder {
  id: string
  role: string
  effective_to: string | null
}

interface Document {
  id: string
  type: string | null
  folder_id?: string | null
}

interface Folder {
  id: string
  folder_type: string
}

interface Deal {
  id: string
  status: string
}

interface Investor {
  id: string
  allocation_status: string | null
}

/**
 * Check metadata completeness
 */
export function checkMetadataCompleteness(entity: Entity): HealthCheck[] {
  const checks: HealthCheck[] = []

  // Entity name (always present)
  checks.push({
    id: 'metadata_name',
    category: 'metadata',
    title: 'Legal Name',
    status: 'pass',
    message: 'Entity has a valid legal name'
  })

  // Entity code
  if (!entity.entity_code) {
    checks.push({
      id: 'metadata_code',
      category: 'metadata',
      title: 'Entity Code',
      status: 'warning',
      message: 'Entity code is not set',
      actionable: {
        label: 'Add entity code',
        action: 'edit_metadata'
      }
    })
  } else {
    checks.push({
      id: 'metadata_code',
      category: 'metadata',
      title: 'Entity Code',
      status: 'pass',
      message: `Entity code: ${entity.entity_code}`
    })
  }

  // Status
  if (!entity.status || entity.status === 'TBD') {
    checks.push({
      id: 'metadata_status',
      category: 'metadata',
      title: 'Entity Status',
      status: 'warning',
      message: 'Entity status needs clarification',
      details: entity.status === 'TBD' ? 'Status is marked as To Be Determined' : 'No status set',
      actionable: {
        label: 'Update status',
        action: 'edit_metadata'
      }
    })
  } else {
    checks.push({
      id: 'metadata_status',
      category: 'metadata',
      title: 'Entity Status',
      status: 'pass',
      message: `Status: ${entity.status}`
    })
  }

  // Domicile
  if (!entity.domicile) {
    checks.push({
      id: 'metadata_domicile',
      category: 'metadata',
      title: 'Domicile',
      status: 'fail',
      message: 'Domicile is required but not set',
      actionable: {
        label: 'Set domicile',
        action: 'edit_metadata'
      }
    })
  } else {
    checks.push({
      id: 'metadata_domicile',
      category: 'metadata',
      title: 'Domicile',
      status: 'pass',
      message: `Domicile: ${entity.domicile}`
    })
  }

  // Legal jurisdiction
  if (!entity.legal_jurisdiction) {
    checks.push({
      id: 'metadata_jurisdiction',
      category: 'metadata',
      title: 'Legal Jurisdiction',
      status: 'warning',
      message: 'Legal jurisdiction not specified',
      actionable: {
        label: 'Add jurisdiction',
        action: 'edit_metadata'
      }
    })
  } else {
    checks.push({
      id: 'metadata_jurisdiction',
      category: 'metadata',
      title: 'Legal Jurisdiction',
      status: 'pass',
      message: `Jurisdiction: ${entity.legal_jurisdiction}`
    })
  }

  // Formation date
  if (!entity.formation_date) {
    checks.push({
      id: 'metadata_formation',
      category: 'metadata',
      title: 'Formation Date',
      status: 'warning',
      message: 'Formation date not recorded',
      actionable: {
        label: 'Add formation date',
        action: 'edit_metadata'
      }
    })
  } else {
    checks.push({
      id: 'metadata_formation',
      category: 'metadata',
      title: 'Formation Date',
      status: 'pass',
      message: `Formed: ${new Date(entity.formation_date).toLocaleDateString(undefined, { timeZone: 'UTC' })}`
    })
  }

  // Registration number
  if (!entity.registration_number) {
    checks.push({
      id: 'metadata_registration',
      category: 'metadata',
      title: 'Registration Number',
      status: 'warning',
      message: 'Registration number not recorded',
      details: 'Important for legal documentation and filings',
      actionable: {
        label: 'Add registration number',
        action: 'edit_metadata'
      }
    })
  } else {
    checks.push({
      id: 'metadata_registration',
      category: 'metadata',
      title: 'Registration Number',
      status: 'pass',
      message: `Registration: ${entity.registration_number}`
    })
  }

  return checks
}

/**
 * Check stakeholder coverage
 */
export function checkStakeholderCoverage(stakeholders: Stakeholder[]): HealthCheck[] {
  const checks: HealthCheck[] = []
  const activeStakeholders = stakeholders.filter(s => !s.effective_to)

  const requiredRoles = [
    { role: 'lawyer', title: 'Legal Counsel', severity: 'fail' as HealthStatus },
    { role: 'accountant', title: 'Accountant', severity: 'fail' as HealthStatus },
    { role: 'auditor', title: 'Auditor', severity: 'warning' as HealthStatus },
    { role: 'administrator', title: 'Administrator', severity: 'warning' as HealthStatus }
  ]

  requiredRoles.forEach(({ role, title, severity }) => {
    const hasRole = activeStakeholders.some(s => s.role === role)

    if (!hasRole) {
      checks.push({
        id: `stakeholder_${role}`,
        category: 'stakeholders',
        title: `${title} Coverage`,
        status: severity,
        message: `No active ${title.toLowerCase()} assigned`,
        details: severity === 'fail' ? 'This is a critical requirement for entity governance' : undefined,
        actionable: {
          label: `Add ${title.toLowerCase()}`,
          action: 'add_stakeholder'
        }
      })
    } else {
      const count = activeStakeholders.filter(s => s.role === role).length
      checks.push({
        id: `stakeholder_${role}`,
        category: 'stakeholders',
        title: `${title} Coverage`,
        status: 'pass',
        message: `${count} active ${title.toLowerCase()}${count > 1 ? 's' : ''} assigned`
      })
    }
  })

  // Overall stakeholder count
  if (activeStakeholders.length === 0) {
    checks.push({
      id: 'stakeholder_count',
      category: 'stakeholders',
      title: 'Total Stakeholders',
      status: 'fail',
      message: 'No stakeholders assigned to this entity',
      actionable: {
        label: 'Add stakeholders',
        action: 'add_stakeholder'
      }
    })
  } else {
    checks.push({
      id: 'stakeholder_count',
      category: 'stakeholders',
      title: 'Total Stakeholders',
      status: 'pass',
      message: `${activeStakeholders.length} active stakeholder${activeStakeholders.length > 1 ? 's' : ''}`
    })
  }

  return checks
}

/**
 * Check director status
 */
export function checkDirectorStatus(directors: Director[]): HealthCheck[] {
  const checks: HealthCheck[] = []
  const activeDirectors = directors.filter(d => !d.effective_to)

  if (activeDirectors.length === 0) {
    checks.push({
      id: 'director_count',
      category: 'directors',
      title: 'Active Directors',
      status: 'fail',
      message: 'Entity has no active directors',
      details: 'At least one director is required for legal compliance',
      actionable: {
        label: 'Add director',
        action: 'add_director'
      }
    })
  } else if (activeDirectors.length === 1) {
    checks.push({
      id: 'director_count',
      category: 'directors',
      title: 'Active Directors',
      status: 'warning',
      message: 'Only one active director',
      details: 'Consider adding additional directors for governance best practices'
    })
  } else {
    checks.push({
      id: 'director_count',
      category: 'directors',
      title: 'Active Directors',
      status: 'pass',
      message: `${activeDirectors.length} active directors`
    })
  }

  // Check for directors with invalid dates
  const invalidDirectors = directors.filter(d => {
    if (!d.effective_from) return false
    if (!d.effective_to) return false
    return new Date(d.effective_to) < new Date(d.effective_from)
  })

  if (invalidDirectors.length > 0) {
    checks.push({
      id: 'director_dates',
      category: 'directors',
      title: 'Director Date Validity',
      status: 'fail',
      message: `${invalidDirectors.length} director(s) have invalid date ranges`,
      details: 'Effective end date is before start date'
    })
  } else {
    checks.push({
      id: 'director_dates',
      category: 'directors',
      title: 'Director Date Validity',
      status: 'pass',
      message: 'All director date ranges are valid'
    })
  }

  return checks
}

/**
 * Check document requirements
 */
export function checkDocumentRequirements(documents: Document[], folders: Folder[]): HealthCheck[] {
  const checks: HealthCheck[] = []

  const requiredFolderTypes = [
    { type: 'kyc', title: 'KYC Documents', severity: 'fail' as HealthStatus },
    { type: 'legal', title: 'Legal Documents', severity: 'fail' as HealthStatus },
    { type: 'formation', title: 'Formation Documents', severity: 'warning' as HealthStatus },
    { type: 'regulatory', title: 'Regulatory Filings', severity: 'warning' as HealthStatus }
  ]

  requiredFolderTypes.forEach(({ type, title, severity }) => {
    const folder = folders.find(f => f.folder_type === type)
    if (!folder) {
      checks.push({
        id: `documents_${type}`,
        category: 'documents',
        title,
        status: severity,
        message: `No ${type} folder exists`,
        actionable: {
          label: `Create ${type} folder`,
          action: 'create_folder'
        }
      })
      return
    }

    const docsInFolder = documents.filter(d => d.folder_id === folder.id)
    if (docsInFolder.length === 0) {
      checks.push({
        id: `documents_${type}`,
        category: 'documents',
        title,
        status: severity,
        message: `No ${type} documents uploaded`,
        details: `${title} folder exists but is empty`,
        actionable: {
          label: 'Upload documents',
          action: 'upload_document'
        }
      })
    } else {
      checks.push({
        id: `documents_${type}`,
        category: 'documents',
        title,
        status: 'pass',
        message: `${docsInFolder.length} ${type} document${docsInFolder.length > 1 ? 's' : ''}`
      })
    }
  })

  // Overall document count
  if (documents.length === 0) {
    checks.push({
      id: 'documents_total',
      category: 'documents',
      title: 'Total Documents',
      status: 'fail',
      message: 'No documents uploaded for this entity',
      actionable: {
        label: 'Upload document',
        action: 'upload_document'
      }
    })
  } else {
    checks.push({
      id: 'documents_total',
      category: 'documents',
      title: 'Total Documents',
      status: 'pass',
      message: `${documents.length} document${documents.length > 1 ? 's' : ''} uploaded`
    })
  }

  return checks
}

/**
 * Check deal activity
 */
export function checkDealActivity(deals: Deal[]): HealthCheck[] {
  const checks: HealthCheck[] = []

  if (deals.length === 0) {
    checks.push({
      id: 'deal_count',
      category: 'deals',
      title: 'Deal Activity',
      status: 'warning',
      message: 'No deals linked to this entity',
      details: 'Entity may not be actively used for investments'
    })
  } else {
    const activeDeals = deals.filter(d => d.status === 'active')

    if (activeDeals.length === 0) {
      checks.push({
        id: 'deal_active',
        category: 'deals',
        title: 'Active Deals',
        status: 'warning',
        message: 'No active deals',
        details: `${deals.length} total deal${deals.length > 1 ? 's' : ''}, but none are active`
      })
    } else {
      checks.push({
        id: 'deal_active',
        category: 'deals',
        title: 'Active Deals',
        status: 'pass',
        message: `${activeDeals.length} active deal${activeDeals.length > 1 ? 's' : ''}`
      })
    }

    checks.push({
      id: 'deal_count',
      category: 'deals',
      title: 'Total Deals',
      status: 'pass',
      message: `${deals.length} deal${deals.length > 1 ? 's' : ''} linked`
    })
  }

  return checks
}

/**
 * Check investor status
 */
export function checkInvestorStatus(investors: Investor[]): HealthCheck[] {
  const checks: HealthCheck[] = []

  if (investors.length === 0) {
    checks.push({
      id: 'investor_count',
      category: 'investors',
      title: 'Investor Coverage',
      status: 'warning',
      message: 'No investors linked to this entity',
      actionable: {
        label: 'Link investor',
        action: 'link_investor'
      }
    })
  } else {
    const activeInvestors = investors.filter(i =>
      i.allocation_status === 'active' || i.allocation_status === 'committed'
    )

    if (activeInvestors.length === 0) {
      checks.push({
        id: 'investor_active',
        category: 'investors',
        title: 'Active Investors',
        status: 'warning',
        message: 'No active investor allocations',
        details: `${investors.length} investor${investors.length > 1 ? 's' : ''} linked but none are active/committed`
      })
    } else {
      checks.push({
        id: 'investor_active',
        category: 'investors',
        title: 'Active Investors',
        status: 'pass',
        message: `${activeInvestors.length} active/committed investor${activeInvestors.length > 1 ? 's' : ''}`
      })
    }

    checks.push({
      id: 'investor_count',
      category: 'investors',
      title: 'Total Investors',
      status: 'pass',
      message: `${investors.length} investor${investors.length > 1 ? 's' : ''} linked`
    })
  }

  return checks
}

/**
 * Calculate overall health score and status
 */
export function calculateOverallHealth(checks: HealthCheck[]): EntityHealthResult {
  const passCount = checks.filter(c => c.status === 'pass').length
  const warningCount = checks.filter(c => c.status === 'warning').length
  const failCount = checks.filter(c => c.status === 'fail').length

  const totalChecks = checks.length
  const score = Math.round((passCount / totalChecks) * 100)

  let overallStatus: HealthStatus
  if (failCount > 0) {
    overallStatus = 'fail'
  } else if (warningCount > 3) {
    overallStatus = 'warning'
  } else if (warningCount > 0) {
    overallStatus = 'warning'
  } else {
    overallStatus = 'pass'
  }

  return {
    overallScore: score,
    overallStatus,
    checks,
    passCount,
    warningCount,
    failCount
  }
}

/**
 * Run all health checks
 */
export function runEntityHealthChecks(data: {
  entity: Entity
  directors: Director[]
  stakeholders: Stakeholder[]
  documents: Document[]
  folders: Folder[]
  deals: Deal[]
  investors: Investor[]
}): EntityHealthResult {
  const allChecks: HealthCheck[] = [
    ...checkMetadataCompleteness(data.entity),
    ...checkStakeholderCoverage(data.stakeholders),
    ...checkDirectorStatus(data.directors),
    ...checkDocumentRequirements(data.documents, data.folders),
    ...checkDealActivity(data.deals),
    ...checkInvestorStatus(data.investors)
  ]

  return calculateOverallHealth(allChecks)
}

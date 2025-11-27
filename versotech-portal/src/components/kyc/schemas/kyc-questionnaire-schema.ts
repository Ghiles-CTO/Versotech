import { z } from 'zod'

// ============================================================================
// STEP 1: About You (Subscriber Information)
// ============================================================================
export const step1Schema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  nationality: z.string().min(2, 'Nationality is required'),
  countryOfResidence: z.string().min(2, 'Country of residence is required'),
  residentialAddress: z.string().min(5, 'Residential address is required'),
  city: z.string().min(2, 'City is required'),
  postalCode: z.string().min(2, 'Postal code is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(7, 'Phone number is required'),
  taxIdNumber: z.string().optional(),
  taxResidencyCountry: z.string().min(2, 'Tax residency country is required'),
})

// ============================================================================
// STEP 2: Investment Type
// ============================================================================
export const investmentTypeOptions = [
  { value: 'individual', label: 'Individual (Personal Assets)' },
  { value: 'joint', label: 'Joint Account' },
  { value: 'trust', label: 'Trust or Estate' },
  { value: 'corporation', label: 'Corporation / LLC' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'other', label: 'Other' },
] as const

export const step2Schema = z.object({
  investmentType: z.enum(['individual', 'joint', 'trust', 'corporation', 'partnership', 'other']),
  investmentTypeOther: z.string().optional(),
}).refine(
  (data) => data.investmentType !== 'other' || (data.investmentTypeOther && data.investmentTypeOther.length > 0),
  { message: 'Please specify the investment type', path: ['investmentTypeOther'] }
)

// ============================================================================
// STEP 3: Well-Informed Investor Status
// ============================================================================
export const wellInformedBasisOptions = [
  { value: 'net_worth', label: 'Net worth exceeds €1,250,000' },
  { value: 'professional', label: 'Professional investor (regulated entity)' },
  { value: 'institutional', label: 'Institutional investor' },
  { value: 'experience', label: 'Significant investment experience' },
  { value: 'advised', label: 'Advised by regulated advisor' },
] as const

// BUG FIX 3.5: Use proper enum array for wellInformedBasis
const wellInformedBasisValues = ['net_worth', 'professional', 'institutional', 'experience', 'advised'] as const

export const step3Schema = z.object({
  isWellInformed: z.enum(['yes', 'no', 'unsure']),
  wellInformedBasis: z.array(z.enum(wellInformedBasisValues)).optional(),
  wellInformedEvidence: z.string().optional(),
})

// ============================================================================
// STEP 4: Compliance Overview (12 questions)
// ============================================================================
export const step4Schema = z.object({
  // PEP Status
  isPEP: z.enum(['yes', 'no']),
  pepDetails: z.string().optional(),

  // Family/Associate PEP
  isRelatedToPEP: z.enum(['yes', 'no']),
  relatedPEPDetails: z.string().optional(),

  // Sanctions
  isSanctioned: z.enum(['yes', 'no']),
  sanctionedDetails: z.string().optional(),

  // Criminal Record
  hasCriminalRecord: z.enum(['yes', 'no']),
  criminalDetails: z.string().optional(),

  // Under Investigation
  isUnderInvestigation: z.enum(['yes', 'no']),
  investigationDetails: z.string().optional(),

  // Bankruptcy
  hasBankruptcy: z.enum(['yes', 'no']),
  bankruptcyDetails: z.string().optional(),

  // US Person indicator (triggers Steps 5-7)
  isUSPerson: z.enum(['yes', 'no']),

  // Source of Funds
  sourceOfFunds: z.string().min(10, 'Please describe your source of funds'),

  // Source of Wealth
  sourceOfWealth: z.string().min(10, 'Please describe your source of wealth'),
})

// ============================================================================
// STEP 5: US Person Definition (CONDITIONAL - only if isUSPerson = 'yes')
// ============================================================================
export const step5Schema = z.object({
  isUSCitizen: z.enum(['yes', 'no']),
  isUSResident: z.enum(['yes', 'no']),
  hasUSGreenCard: z.enum(['yes', 'no']),
  hasSubstantialUSPresence: z.enum(['yes', 'no']),
  hasUSMailingAddress: z.enum(['yes', 'no']),
  hasUSPhoneNumber: z.enum(['yes', 'no']),
  hasUSBankAccount: z.enum(['yes', 'no']),
  hasUSPowerOfAttorney: z.enum(['yes', 'no']),
  usConnectionDetails: z.string().optional(),
})

// ============================================================================
// STEP 6: Offer Details (CONDITIONAL)
// ============================================================================
export const step6Schema = z.object({
  isAccreditedInvestor: z.enum(['yes', 'no']),
  accreditationBasis: z.enum(['income', 'net_worth', 'professional', 'entity', 'other']).optional(),
  hasReceivedOfferingMaterials: z.enum(['yes', 'no']),
  understandsRestrictions: z.enum(['yes', 'no']),
})

// ============================================================================
// STEP 7: Additional US Compliance (CONDITIONAL)
// ============================================================================
export const step7Schema = z.object({
  acknowledgesFATCA: z.boolean().refine(val => val === true, 'You must acknowledge FATCA requirements'),
  willProvideW9: z.boolean().refine(val => val === true, 'You must agree to provide W-9 if required'),
  understandsWithholding: z.boolean().refine(val => val === true, 'You must acknowledge withholding requirements'),
  certifiesTaxCompliance: z.boolean().refine(val => val === true, 'You must certify tax compliance'),
  acknowledgesReportingObligations: z.boolean().refine(val => val === true, 'You must acknowledge reporting obligations'),
})

// ============================================================================
// STEP 8: Investment Suitability
// ============================================================================
export const educationLevelOptions = [
  { value: 'high_school', label: 'High School' },
  { value: 'bachelors', label: "Bachelor's Degree" },
  { value: 'masters', label: "Master's Degree" },
  { value: 'doctorate', label: 'Doctorate' },
  { value: 'professional', label: 'Professional Certification (CFA, CPA, etc.)' },
] as const

export const employmentStatusOptions = [
  { value: 'employed', label: 'Employed' },
  { value: 'self_employed', label: 'Self-Employed' },
  { value: 'retired', label: 'Retired' },
  { value: 'unemployed', label: 'Unemployed' },
  { value: 'student', label: 'Student' },
] as const

export const incomeRangeOptions = [
  { value: 'under_100k', label: 'Under $100,000' },
  { value: '100k_250k', label: '$100,000 - $250,000' },
  { value: '250k_500k', label: '$250,000 - $500,000' },
  { value: '500k_1m', label: '$500,000 - $1,000,000' },
  { value: '1m_plus', label: 'Over $1,000,000' },
] as const

export const netWorthRangeOptions = [
  { value: 'under_500k', label: 'Under $500,000' },
  { value: '500k_1m', label: '$500,000 - $1,000,000' },
  { value: '1m_5m', label: '$1,000,000 - $5,000,000' },
  { value: '5m_10m', label: '$5,000,000 - $10,000,000' },
  { value: '10m_plus', label: 'Over $10,000,000' },
] as const

export const investmentObjectiveOptions = [
  { value: 'capital_preservation', label: 'Capital Preservation' },
  { value: 'income', label: 'Income Generation' },
  { value: 'growth', label: 'Growth' },
  { value: 'speculation', label: 'Speculation' },
] as const

export const riskToleranceOptions = [
  { value: 'conservative', label: 'Conservative - Prefer stability over returns' },
  { value: 'moderate', label: 'Moderate - Balance of risk and return' },
  { value: 'aggressive', label: 'Aggressive - Willing to accept higher risk' },
] as const

export const timeHorizonOptions = [
  { value: 'under_3_years', label: 'Less than 3 years' },
  { value: '3_5_years', label: '3 - 5 years' },
  { value: '5_10_years', label: '5 - 10 years' },
  { value: 'over_10_years', label: 'Over 10 years' },
] as const

export const step8Schema = z.object({
  // Education & Experience
  educationLevel: z.enum(['high_school', 'bachelors', 'masters', 'doctorate', 'professional']),
  employmentStatus: z.enum(['employed', 'self_employed', 'retired', 'unemployed', 'student']),
  occupation: z.string().optional(),
  employer: z.string().optional(),
  yearsInvestingExperience: z.string().min(1, 'Please indicate your investment experience'),

  // Financial Profile
  annualIncome: z.enum(['under_100k', '100k_250k', '250k_500k', '500k_1m', '1m_plus']),
  netWorth: z.enum(['under_500k', '500k_1m', '1m_5m', '5m_10m', '10m_plus']),
  liquidNetWorth: z.enum(['under_500k', '500k_1m', '1m_5m', '5m_10m', '10m_plus']),

  // Investment Preferences
  investmentObjective: z.enum(['capital_preservation', 'income', 'growth', 'speculation']),
  riskTolerance: z.enum(['conservative', 'moderate', 'aggressive']),
  investmentHorizon: z.enum(['under_3_years', '3_5_years', '5_10_years', 'over_10_years']),

  // Investment Allocation
  percentageOfNetWorthToInvest: z.string().min(1, 'Please indicate the percentage'),
  hasAlternativeInvestmentExperience: z.enum(['yes', 'no']),
  alternativeInvestmentTypes: z.array(z.string()).optional(),
})

// ============================================================================
// STEP 9: Waiver & Risk Awareness
// ============================================================================
export const step9Schema = z.object({
  acknowledgesIlliquidity: z.boolean().refine(val => val === true, 'You must acknowledge this risk'),
  acknowledgesLossRisk: z.boolean().refine(val => val === true, 'You must acknowledge this risk'),
  acknowledgesNoGuarantees: z.boolean().refine(val => val === true, 'You must acknowledge this'),
  acknowledgesLimitedInfo: z.boolean().refine(val => val === true, 'You must acknowledge this'),
  acknowledgesNoRegulation: z.boolean().refine(val => val === true, 'You must acknowledge this'),
  acknowledgesConflicts: z.boolean().refine(val => val === true, 'You must acknowledge this'),
  acknowledgesTaxImplications: z.boolean().refine(val => val === true, 'You must acknowledge this'),
  acknowledgesFees: z.boolean().refine(val => val === true, 'You must acknowledge this'),
  hasReadOfferingDocs: z.boolean().refine(val => val === true, 'You must confirm this'),
  hasSoughtIndependentAdvice: z.boolean().refine(val => val === true, 'You must confirm this'),
})

// ============================================================================
// STEP 10: Signature & Certification
// ============================================================================
export const step10Schema = z.object({
  certifiesAccuracy: z.boolean().refine(val => val === true, 'You must certify accuracy'),
  certifiesNoOmissions: z.boolean().refine(val => val === true, 'You must certify no omissions'),
  agreesToUpdates: z.boolean().refine(val => val === true, 'You must agree to provide updates'),
  consentToProcessing: z.boolean().refine(val => val === true, 'You must consent to data processing'),
  signatureName: z.string().min(2, 'Please type your full name as signature'),
  signatureDate: z.string().min(1, 'Signature date is required'),
})

// ============================================================================
// Combined Schema
// ============================================================================
export const kycQuestionnaireSchema = z.object({
  step1: step1Schema,
  step2: step2Schema,
  step3: step3Schema,
  step4: step4Schema,
  step5: step5Schema.optional(), // Conditional
  step6: step6Schema.optional(), // Conditional
  step7: step7Schema.optional(), // Conditional
  step8: step8Schema,
  step9: step9Schema,
  step10: step10Schema,
  // Metadata
  lastCompletedStep: z.number().optional(),
  wizardVersion: z.string().default('2.0'),
})

// ============================================================================
// Types
// ============================================================================
export type Step1Data = z.infer<typeof step1Schema>
export type Step2Data = z.infer<typeof step2Schema>
export type Step3Data = z.infer<typeof step3Schema>
export type Step4Data = z.infer<typeof step4Schema>
export type Step5Data = z.infer<typeof step5Schema>
export type Step6Data = z.infer<typeof step6Schema>
export type Step7Data = z.infer<typeof step7Schema>
export type Step8Data = z.infer<typeof step8Schema>
export type Step9Data = z.infer<typeof step9Schema>
export type Step10Data = z.infer<typeof step10Schema>
export type KYCQuestionnaireData = z.infer<typeof kycQuestionnaireSchema>

// ============================================================================
// Step Configuration
// ============================================================================
export const STEP_CONFIG = [
  { key: 'step1', title: 'About You', description: "Let's start with your basic information", icon: 'User', isConditional: false },
  { key: 'step2', title: 'Investment Type', description: 'How will you be investing?', icon: 'Briefcase', isConditional: false },
  { key: 'step3', title: 'Investor Status', description: 'Your investment experience', icon: 'GraduationCap', isConditional: false },
  { key: 'step4', title: 'Compliance Check', description: 'Regulatory declarations', icon: 'Shield', isConditional: false },
  { key: 'step5', title: 'US Person Status', description: 'US tax residency details', icon: 'Flag', isConditional: true },
  { key: 'step6', title: 'Offer Details', description: 'Investment acknowledgments', icon: 'FileText', isConditional: true },
  { key: 'step7', title: 'US Tax Compliance', description: 'FATCA and reporting requirements', icon: 'FileCheck', isConditional: true },
  { key: 'step8', title: 'Suitability', description: 'Your financial profile', icon: 'TrendingUp', isConditional: false },
  { key: 'step9', title: 'Risk Awareness', description: 'Understanding the risks', icon: 'AlertTriangle', isConditional: false },
  { key: 'step10', title: 'Sign & Submit', description: 'Review and certify', icon: 'PenTool', isConditional: false },
] as const

// Helper to get schema for a step
export function getStepSchema(stepNumber: number) {
  const schemas: Record<number, z.ZodTypeAny> = {
    1: step1Schema,
    2: step2Schema,
    3: step3Schema,
    4: step4Schema,
    5: step5Schema,
    6: step6Schema,
    7: step7Schema,
    8: step8Schema,
    9: step9Schema,
    10: step10Schema,
  }
  return schemas[stepNumber]
}

// Helper to check if US Person steps should be shown
export function shouldShowUSPersonSteps(step4Data?: Step4Data): boolean {
  return step4Data?.isUSPerson === 'yes'
}

// Get visible steps based on form data
export function getVisibleSteps(formData: Partial<KYCQuestionnaireData>): number[] {
  const showUSSteps = shouldShowUSPersonSteps(formData.step4)

  if (showUSSteps) {
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  }

  // Skip steps 5, 6, 7 for non-US persons
  return [1, 2, 3, 4, 8, 9, 10]
}

// BUG FIX 2.7: Compute signature date at runtime, not module load time
function getTodayDate(): string {
  return new Date().toISOString().split('T')[0]
}

// Get default values for each step
export function getStepDefaults(stepNumber: number): Record<string, unknown> {
  // BUG FIX 2.7: Step 10 defaults are computed dynamically for signatureDate
  if (stepNumber === 10) {
    return {
      certifiesAccuracy: false,
      certifiesNoOmissions: false,
      agreesToUpdates: false,
      consentToProcessing: false,
      signatureName: '',
      signatureDate: getTodayDate(), // Computed at call time, not module load
    }
  }

  const defaults: Record<number, Record<string, unknown>> = {
    1: {
      fullName: '',
      dateOfBirth: '',
      nationality: '',
      countryOfResidence: '',
      residentialAddress: '',
      city: '',
      postalCode: '',
      email: '',
      phone: '',
      taxIdNumber: '',
      taxResidencyCountry: '',
    },
    2: {
      investmentType: undefined,
      investmentTypeOther: '',
    },
    3: {
      isWellInformed: undefined,
      wellInformedBasis: [],
      wellInformedEvidence: '',
    },
    4: {
      isPEP: undefined,
      pepDetails: '',
      isRelatedToPEP: undefined,
      relatedPEPDetails: '',
      isSanctioned: undefined,
      sanctionedDetails: '',
      hasCriminalRecord: undefined,
      criminalDetails: '',
      isUnderInvestigation: undefined,
      investigationDetails: '',
      hasBankruptcy: undefined,
      bankruptcyDetails: '',
      isUSPerson: undefined,
      sourceOfFunds: '',
      sourceOfWealth: '',
    },
    5: {
      isUSCitizen: undefined,
      isUSResident: undefined,
      hasUSGreenCard: undefined,
      hasSubstantialUSPresence: undefined,
      hasUSMailingAddress: undefined,
      hasUSPhoneNumber: undefined,
      hasUSBankAccount: undefined,
      hasUSPowerOfAttorney: undefined,
      usConnectionDetails: '',
    },
    6: {
      isAccreditedInvestor: undefined,
      accreditationBasis: undefined,
      hasReceivedOfferingMaterials: undefined,
      understandsRestrictions: undefined,
    },
    7: {
      acknowledgesFATCA: false,
      willProvideW9: false,
      understandsWithholding: false,
      certifiesTaxCompliance: false,
      acknowledgesReportingObligations: false,
    },
    8: {
      educationLevel: undefined,
      employmentStatus: undefined,
      occupation: '',
      employer: '',
      yearsInvestingExperience: '',
      annualIncome: undefined,
      netWorth: undefined,
      liquidNetWorth: undefined,
      investmentObjective: undefined,
      riskTolerance: undefined,
      investmentHorizon: undefined,
      percentageOfNetWorthToInvest: '',
      hasAlternativeInvestmentExperience: undefined,
      alternativeInvestmentTypes: [],
    },
    9: {
      acknowledgesIlliquidity: false,
      acknowledgesLossRisk: false,
      acknowledgesNoGuarantees: false,
      acknowledgesLimitedInfo: false,
      acknowledgesNoRegulation: false,
      acknowledgesConflicts: false,
      acknowledgesTaxImplications: false,
      acknowledgesFees: false,
      hasReadOfferingDocs: false,
      hasSoughtIndependentAdvice: false,
    },
  }
  return defaults[stepNumber] || {}
}

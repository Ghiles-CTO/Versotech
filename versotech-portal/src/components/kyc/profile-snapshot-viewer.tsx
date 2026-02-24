'use client'

import { useRef } from 'react'
import { getCountryName } from '@/components/kyc/country-select'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import {
  User, Phone, MapPin, Building2, FileText,
} from 'lucide-react'

// ─── Field label map ──────────────────────────────────────────────────────────
const FIELD_LABELS: Record<string, string> = {
  first_name: 'First Name',
  last_name: 'Last Name',
  date_of_birth: 'Date of Birth',
  nationality: 'Nationality',
  email: 'Email',
  phone: 'Phone',
  phone_mobile: 'Mobile Phone',
  phone_office: 'Office Phone',
  residential_street: 'Street Address',
  residential_city: 'City',
  residential_state: 'State / Region',
  residential_postal_code: 'Postal Code',
  residential_country: 'Country',
  id_type: 'ID Type',
  id_number: 'ID Number',
  id_issue_date: 'ID Issue Date',
  id_expiry_date: 'ID Expiry Date',
  id_expiry: 'ID Expiry Date',
  id_issuing_country: 'ID Issuing Country',
  proof_of_address_date: 'Proof of Address Date',
  proof_of_address_type: 'Proof of Address Type',
  proof_of_address_issuer: 'Proof of Address Issuer',
  legal_name: 'Legal Name',
  display_name: 'Display Name',
  name: 'Name',
  firm_name: 'Firm Name',
  entity_type: 'Entity Type',
  partner_type: 'Partner Type',
  cp_type: 'Commercial Partner Type',
  country_of_incorporation: 'Country of Incorporation',
  registration_number: 'Registration Number',
  tax_id: 'Tax ID',
  jurisdiction: 'Jurisdiction',
  regulator: 'Regulator',
  license_number: 'License Number',
  license_type: 'License Type',
  regulatory_status: 'Regulatory Status',
  regulatory_number: 'Regulatory Number',
  representative_name: 'Representative Name',
  representative_title: 'Representative Title',
  country: 'Country',
  address_line_1: 'Address Line 1',
  address_line_2: 'Address Line 2',
  street_address: 'Street Address',
  state_province: 'State / Region',
  postal_code: 'Postal Code',
  contact_name: 'Contact Name',
  contact_email: 'Contact Email',
  contact_phone: 'Contact Phone',
  primary_contact_name: 'Primary Contact Name',
  primary_contact_email: 'Primary Contact Email',
  primary_contact_phone: 'Primary Contact Phone',
  registered_address_line_1: 'Address Line 1',
  registered_address_line_2: 'Address Line 2',
  registered_city: 'City',
  registered_state: 'State / Region',
  registered_postal_code: 'Postal Code',
  registered_country: 'Country',
}

// ─── Section definitions ──────────────────────────────────────────────────────
interface SectionDef {
  key: string
  title: string
  icon: typeof User
  accent: { bg: string; text: string; border: string; num: string }
  fields: string[]
}

// Hide deprecated legacy fields while keeping current KYC details visible.
const PERSONAL_EXCLUDED_FIELDS = new Set<string>(['proof_of_address_expiry'])

const PERSONAL_INFO_SECTIONS: SectionDef[] = [
  {
    key: 'identity',
    title: 'Identity',
    icon: User,
    accent: { bg: 'bg-sky-500/10', text: 'text-sky-500', border: 'border-sky-500/30', num: 'bg-sky-500' },
    fields: ['first_name', 'last_name', 'date_of_birth', 'nationality'],
  },
  {
    key: 'contact',
    title: 'Contact',
    icon: Phone,
    accent: { bg: 'bg-violet-500/10', text: 'text-violet-500', border: 'border-violet-500/30', num: 'bg-violet-500' },
    fields: ['email', 'phone'],
  },
  {
    key: 'address',
    title: 'Residential Address',
    icon: MapPin,
    accent: { bg: 'bg-teal-500/10', text: 'text-teal-500', border: 'border-teal-500/30', num: 'bg-teal-500' },
    fields: ['residential_street', 'residential_city', 'residential_state', 'residential_postal_code', 'residential_country'],
  },
]

const ENTITY_INFO_SECTIONS: SectionDef[] = [
  {
    key: 'entity',
    title: 'Entity Information',
    icon: Building2,
    accent: { bg: 'bg-indigo-500/10', text: 'text-indigo-500', border: 'border-indigo-500/30', num: 'bg-indigo-500' },
    fields: ['legal_name', 'entity_type', 'country_of_incorporation', 'country'],
  },
  {
    key: 'registered_address',
    title: 'Registered Address',
    icon: MapPin,
    accent: { bg: 'bg-teal-500/10', text: 'text-teal-500', border: 'border-teal-500/30', num: 'bg-teal-500' },
    fields: ['registered_address_line_1', 'registered_address_line_2', 'registered_city', 'registered_state', 'registered_postal_code', 'registered_country'],
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
const COUNTRY_FIELDS = new Set([
  'country', 'registered_country', 'residential_country', 'country_of_incorporation',
  'country_of_birth', 'country_of_tax_residency', 'id_issuing_country', 'nationality',
])

function formatFieldValue(value: unknown, fieldKey?: string): string {
  if (value === null || value === undefined || value === '') return '\u2014'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (typeof value === 'string') {
    if (fieldKey && COUNTRY_FIELDS.has(fieldKey)) {
      return getCountryName(value) || value
    }
    return value
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
  }
  return String(value)
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface ProfileSnapshotViewerProps {
  open: boolean
  onClose: () => void
  entityName: string
  submittedAt: string
  documentType: 'personal_info' | 'entity_info'
  snapshot: Record<string, unknown>
  memberName?: string | null
}

// ─── Component ────────────────────────────────────────────────────────────────
export function ProfileSnapshotViewer({
  open,
  onClose,
  entityName,
  submittedAt,
  documentType,
  snapshot,
  memberName,
}: ProfileSnapshotViewerProps) {
  const contentRef = useRef<HTMLDivElement>(null)

  if (!snapshot) return null

  const baseSections = documentType === 'personal_info' ? PERSONAL_INFO_SECTIONS : ENTITY_INFO_SECTIONS

  // Collect all fields already covered by defined sections
  const coveredFields = new Set(baseSections.flatMap(s => s.fields))

  // Fields to exclude (handled by separate document uploads)
  const excludedFields = documentType === 'personal_info' ? PERSONAL_EXCLUDED_FIELDS : new Set<string>()

  // Find extra fields in the snapshot not covered by any section
  const extraFields = Object.keys(snapshot).filter(
    k => !coveredFields.has(k) && !excludedFields.has(k) && snapshot[k] !== undefined && snapshot[k] !== '' && snapshot[k] !== null
  )

  // Build full section list, appending an "Other Details" section if there are extra fields
  const sections: SectionDef[] = extraFields.length > 0
    ? [
        ...baseSections,
        {
          key: 'other',
          title: 'Other Details',
          icon: FileText,
          accent: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/30', num: 'bg-slate-500' },
          fields: extraFields,
        },
      ]
    : baseSections

  const sectionHasData = (section: SectionDef) =>
    section.fields.some(f => snapshot[f] !== undefined && snapshot[f] !== '' && snapshot[f] !== null)

  const visibleSections = sections.filter(sectionHasData)

  const scrollTo = (sectionKey: string) => {
    document.getElementById(`ps-${sectionKey}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const headerIcon = documentType === 'personal_info' ? User : Building2
  const HeaderIcon = headerIcon
  const headerTitle = documentType === 'personal_info' ? 'Personal Information' : 'Entity Information'

  return (
    <Sheet open={open} onOpenChange={isOpen => !isOpen && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-3xl p-0 flex flex-col gap-0 overflow-hidden">

        <SheetTitle className="sr-only">{headerTitle} — {entityName}</SheetTitle>
        <SheetDescription className="sr-only">
          Submitted {new Date(submittedAt).toLocaleDateString()}
        </SheetDescription>

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-4 px-6 py-4 border-b bg-muted/20 shrink-0 pr-14">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <HeaderIcon className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-base font-semibold text-foreground">{headerTitle}</span>
            <p className="text-sm text-muted-foreground mt-0.5 truncate">
              <span className="font-medium text-foreground">
                {memberName || entityName}
              </span>
              {' \u00b7 '}
              {new Date(submittedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>

        {/* ── Body ───────────────────────────────────────────────────────────── */}
        <div className="flex flex-1 min-h-0 overflow-hidden">

          {/* Sidebar navigation */}
          <div className="w-52 shrink-0 border-r overflow-y-auto py-2 bg-muted/10">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-4 py-2">
              Sections
            </p>
            {sections.map((section, i) => {
              const hasData = sectionHasData(section)
              const SectionIcon = section.icon

              return (
                <button
                  key={section.key}
                  onClick={() => hasData && scrollTo(section.key)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors
                    ${hasData ? 'hover:bg-muted/60 cursor-pointer' : 'opacity-35 cursor-default'}`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 text-white
                    ${hasData ? section.accent.num : 'bg-muted-foreground/30'}`}>
                    {i + 1}
                  </span>
                  <SectionIcon className={`w-3.5 h-3.5 shrink-0 ${hasData ? section.accent.text : 'text-muted-foreground'}`} />
                  <span className={`text-xs font-medium truncate flex-1 ${hasData ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {section.title}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Scrollable content area */}
          <div ref={contentRef} className="flex-1 overflow-y-auto">
            {visibleSections.map((section) => {
              const SectionIcon = section.icon
              const populated = section.fields.filter(f => snapshot[f] !== undefined && snapshot[f] !== '' && snapshot[f] !== null)
              if (populated.length === 0) return null

              return (
                <div key={section.key} id={`ps-${section.key}`} className="border-b last:border-b-0 scroll-mt-0">
                  {/* Section header */}
                  <div className={`flex items-center gap-3 px-6 py-3 ${section.accent.bg} border-b ${section.accent.border} sticky top-0 z-10`}>
                    <div className={`w-7 h-7 rounded-full ${section.accent.num} flex items-center justify-center shrink-0`}>
                      <SectionIcon className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className={`text-sm font-semibold ${section.accent.text}`}>
                      {section.title}
                    </span>
                  </div>

                  {/* Fields 2-col grid */}
                  <div className="px-6 py-4">
                    <div className="grid grid-cols-2 gap-2">
                      {populated.map(field => {
                        const value = snapshot[field]
                        const label = FIELD_LABELS[field] ?? field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                        const display = formatFieldValue(value, field)

                        return (
                          <div
                            key={field}
                            className="rounded-lg border p-3 bg-muted/30 border-border/50"
                          >
                            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground leading-tight block mb-1.5">
                              {label}
                            </span>
                            <p className={`text-sm font-medium leading-snug ${display === '\u2014' ? 'text-muted-foreground/40' : 'text-foreground'}`}>
                              {display}
                            </p>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            })}
            <div className="h-8" />
          </div>
        </div>

        {/* ── Footer ─────────────────────────────────────────────────────────── */}
        <div className="shrink-0 border-t px-6 py-3 flex items-center justify-between bg-muted/10">
          <p className="text-xs text-muted-foreground">
            {visibleSections.length} / {sections.length} sections with data
          </p>
          <Button size="sm" variant="outline" onClick={onClose}>Close</Button>
        </div>

      </SheetContent>
    </Sheet>
  )
}

/**
 * KYC Form Components
 *
 * Reusable form sections for KYC data collection across all personas
 */

// Form sections
export { PersonalInfoFormSection } from './personal-info-form-section'
export { AddressFormSection, RegisteredAddressFormSection } from './address-form-section'
export { TaxInfoFormSection } from './tax-info-form-section'
export { IdentificationFormSection, ID_TYPES } from './identification-form-section'

// Country select
export {
  CountrySelect,
  NationalitySelect,
  COUNTRIES,
  getCountryName,
  getCountryCode,
} from './country-select'
export type { CountryCode } from './country-select'

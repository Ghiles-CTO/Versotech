type ExistingCycleSummary = {
  term_sheet_id?: string | null
}

export function hasInvestorAlreadyReceivedTermSheet(args: {
  termSheetId?: string | null
  membershipTermSheetId?: string | null
  cycles?: ExistingCycleSummary[] | null
}): boolean {
  const { termSheetId, membershipTermSheetId = null, cycles = [] } = args
  const cycleList = cycles ?? []

  if (!termSheetId) return false
  if (membershipTermSheetId === termSheetId) return true

  return cycleList.some(cycle => cycle.term_sheet_id === termSheetId)
}

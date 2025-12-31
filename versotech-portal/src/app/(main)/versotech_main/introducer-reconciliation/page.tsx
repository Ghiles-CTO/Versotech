/**
 * Redirect from legacy /introducer-reconciliation to unified arranger reconciliation page
 * This page is kept for backward compatibility with bookmarks and direct links
 */
import { redirect } from 'next/navigation'

export default function IntroducerReconciliationRedirect() {
  redirect('/versotech_main/arranger-reconciliation?tab=introducers')
}

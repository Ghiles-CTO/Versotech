import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default function DocumentsPage() {
  redirect('/versoholdings/reports?view=documents')
}

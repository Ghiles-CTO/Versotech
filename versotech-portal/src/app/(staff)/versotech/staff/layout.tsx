import { AppLayout } from '@/components/layout/app-layout'

export const dynamic = 'force-dynamic'

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return <AppLayout brand="versotech">{children}</AppLayout>
}

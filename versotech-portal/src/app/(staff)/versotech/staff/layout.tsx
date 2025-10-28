import { AppLayout } from '@/components/layout/app-layout'

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return <AppLayout brand="versotech">{children}</AppLayout>
}

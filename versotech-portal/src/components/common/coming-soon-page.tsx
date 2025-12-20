'use client'

import { useTheme } from '@/components/theme-provider'
import { Card, CardContent } from '@/components/ui/card'
import { Construction } from 'lucide-react'

interface ComingSoonPageProps {
  title: string
  description?: string
  icon?: React.ComponentType<{ className?: string }>
}

export function ComingSoonPage({ title, description, icon: Icon = Construction }: ComingSoonPageProps) {
  const { theme } = useTheme()
  // Per PHASE2_BASE_PLAN.md Section 11.6: Theme is USER CHOICE, not persona-based
  const isDark = theme === 'staff-dark'

  return (
    <div className="p-6 flex items-center justify-center min-h-[60vh]">
      <Card className={`max-w-md w-full ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
        <CardContent className="pt-6 text-center">
          <div className={`h-16 w-16 rounded-full mx-auto flex items-center justify-center mb-4 ${isDark ? 'bg-white/10' : 'bg-gray-100'}`}>
            <Icon className={`h-8 w-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          </div>
          <h1 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {title}
          </h1>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {description || 'This feature is coming soon. Check back later!'}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

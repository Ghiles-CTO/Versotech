'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Building2, AlertCircle } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-emerald-500/30 relative overflow-hidden">
      {/* Ambient Background Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-emerald-500/5 dark:bg-emerald-900/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-blue-500/5 dark:bg-blue-900/10 rounded-full blur-[150px]" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.04]" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-16">
          <Building2 className="h-8 w-8 text-emerald-500" />
          <span className="text-2xl font-light tracking-wide text-muted-foreground">
            VERSO <span className="font-bold text-foreground">HOLDINGS</span>
          </span>
        </div>

        {/* Error Card */}
        <div className="relative max-w-lg w-full">
          {/* Glow Effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 blur opacity-30" />

          <div className="relative bg-card border border-border backdrop-blur-2xl p-12 shadow-2xl">
            {/* Top Border Accent */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50 shadow-[0_0_20px_rgba(16,185,129,0.5)]" />

            <div className="text-center space-y-8">
              {/* Icon */}
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-muted border border-border flex items-center justify-center">
                  <AlertCircle className="h-10 w-10 text-muted-foreground" />
                </div>
              </div>

              {/* Error Code */}
              <div>
                <h1 className="text-8xl font-light text-foreground tracking-tighter">404</h1>
                <div className="mt-4 h-px w-24 mx-auto bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
              </div>

              {/* Message */}
              <div className="space-y-3">
                <p className="text-xl text-foreground font-light tracking-wide">
                  Page Not Found
                </p>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                  The resource you&apos;re looking for doesn&apos;t exist or has been moved to a different location.
                </p>
              </div>

              {/* Actions */}
              <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/versotech_main/dashboard">
                  <Button className="h-14 px-8 font-bold rounded-none text-sm transition-all tracking-wide hover:-translate-y-0.5 w-full sm:w-auto">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="outline" className="h-14 px-8 rounded-none border-2 text-sm font-medium tracking-wide transition-all duration-300 backdrop-blur-sm w-full sm:w-auto">
                    Home
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-xs text-muted-foreground uppercase tracking-widest">
          © {new Date().getFullYear()} Verso Holdings Ltd.
        </div>
      </div>
    </div>
  )
}

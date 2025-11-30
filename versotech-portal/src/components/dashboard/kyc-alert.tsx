'use client'

import Link from 'next/link'
import { AlertTriangle, ArrowRight, CheckCircle2, Clock } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

interface KYCAlertProps {
    status: string // 'not_started' | 'pending' | 'approved' | 'rejected'
}

export function KYCAlert({ status }: KYCAlertProps) {
    if (status === 'approved') return null

    if (status === 'pending') {
        return (
            <Alert className="border-amber-500/50 bg-amber-500/20 mb-6">
                <Clock className="h-4 w-4 text-amber-500" />
                <AlertTitle className="text-amber-500 font-semibold">KYC Verification Pending</AlertTitle>
                <AlertDescription className="text-white/90">
                    Your KYC application is currently under review by our compliance team. We will notify you once the review is complete.
                </AlertDescription>
            </Alert>
        )
    }

    if (status === 'rejected') {
        return (
            <Alert variant="destructive" className="mb-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>KYC Verification Failed</AlertTitle>
                <AlertDescription className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <span>
                        Your KYC application was rejected. Please review the feedback and update your information.
                    </span>
                    <Button variant="outline" size="sm" className="w-full sm:w-auto bg-background text-foreground hover:bg-accent" asChild>
                        <Link href="/versoholdings/profile?tab=kyc">
                            Update Information
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </AlertDescription>
            </Alert>
        )
    }

    // Default: not_started or any other status
    return (
        <Alert className="border-blue-500/30 bg-blue-500/10 text-blue-200 mb-6">
            <AlertTriangle className="h-4 w-4 text-blue-400" />
            <AlertTitle className="text-blue-400">Action Required: Complete KYC</AlertTitle>
            <AlertDescription className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span>
                    To access all investment features, please complete your Know Your Customer (KYC) verification.
                </span>
                <Button size="sm" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white border-0" asChild>
                    <Link href="/versoholdings/profile?tab=kyc">
                        Complete Now
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </AlertDescription>
        </Alert>
    )
}

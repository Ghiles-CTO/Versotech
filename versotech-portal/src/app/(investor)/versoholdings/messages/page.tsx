import { AppLayout } from '@/components/layout/app-layout'
import { InvestorChat } from '@/components/messaging/investor-chat'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare, Users, Shield, Zap, Lock } from 'lucide-react'
import { requireAuth } from '@/lib/auth'

export default async function MessagesPage() {
  const profile = await requireAuth(['investor'])

  return (
    <AppLayout brand="versoholdings">
      <div className="p-6 space-y-6">
        
        {/* Header */}
        <div className="border-b border-gray-200 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <MessageSquare className="h-8 w-8 text-blue-600" />
                Messages
              </h1>
              <p className="text-lg text-gray-600 mt-1">
                Direct communication with your VERSO team
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 flex items-center justify-end gap-1">
                <Lock className="h-3 w-3" />
                Secure messaging
              </p>
              <p className="text-xs text-gray-400 mt-1">All messages are encrypted</p>
            </div>
          </div>
        </div>

        {/* Communication Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="h-5 w-5 text-green-600" />
                Secure & Compliant
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                All communications are encrypted, logged for compliance, and meet BVI FSC and GDPR requirements.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-blue-600" />
                Direct Access
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Connect directly with VERSO staff including relationship managers, operations, and compliance teams.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap className="h-5 w-5 text-purple-600" />
                Real-time Updates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Receive instant notifications about portfolio updates, capital calls, distributions, and opportunities.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* WhatsApp-Style Chat Interface */}
        <InvestorChat />

        {/* Communication Guidelines */}
        <Card>
          <CardHeader>
            <CardTitle>Communication Guidelines</CardTitle>
            <CardDescription>
              Important information about using the VERSO Holdings messaging system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Business Hours Response</h4>
                <p className="text-muted-foreground">
                  Messages sent during business hours (9 AM - 6 PM CET) typically receive responses within 2-4 hours.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Urgent Matters</h4>
                <p className="text-muted-foreground">
                  For time-sensitive matters, please mark messages as urgent or contact your relationship manager directly.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Document Sharing</h4>
                <p className="text-muted-foreground">
                  Large documents should be shared through the Documents section rather than as message attachments.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Privacy & Security</h4>
                <p className="text-muted-foreground">
                  All messages are logged for regulatory compliance. Do not share login credentials or sensitive personal data.
                </p>
                </div>
              </div>
            
            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                <Shield className="inline h-3 w-3 mr-1" />
                This communication system is monitored and recorded for regulatory compliance, quality assurance, and audit purposes in accordance with BVI FSC regulations and GDPR data protection standards.
              </p>
            </div>
          </CardContent>
        </Card>

      </div>
    </AppLayout>
  )
}
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Users, Shield } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Building2 className="h-12 w-12 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">VERSO Holdings</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Secure investment platform managing $800M+ across private equity, venture capital, and real estate investments
          </p>
        </div>

        {/* Portal Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Investor Portal */}
          <Card className="hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-200">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl text-gray-900">Investor Portal</CardTitle>
              <CardDescription className="text-gray-600">
                Access your investment portfolio, documents, and performance reports
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Portfolio Dashboard & KPIs</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Vehicle Directory & Performance</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Secure Document Access</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Report Requests & Messaging</span>
                </div>
              </div>
              <Link href="/versoholdings/login" className="block">
                <Button className="w-full bg-blue-600 hover:bg-blue-700" size="lg">
                  Access Investor Portal
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Staff Portal */}
          <Card className="hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-200">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl text-gray-900">Staff Portal</CardTitle>
              <CardDescription className="text-gray-600">
                Operations dashboard for workflow automation and investor management
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Operations Dashboard</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Workflow Process Center</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Request Management</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Audit Logs & Compliance</span>
                </div>
              </div>
              <Link href="/versotech/login" className="block">
                <Button className="w-full bg-blue-600 hover:bg-blue-700" size="lg">
                  Access Staff Portal
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 space-y-2">
          <p>VERSO Holdings Investment Platform</p>
          <p className="flex items-center justify-center gap-4">
            <span>🔒 Bank-level Security</span>
            <span>🌍 GDPR Compliant</span>
            <span>📊 Real-time Analytics</span>
          </p>
        </div>
      </div>
    </div>
  );
}
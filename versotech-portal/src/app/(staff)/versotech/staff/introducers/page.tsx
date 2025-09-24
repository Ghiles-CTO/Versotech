import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import {
  Plus,
  Edit,
  DollarSign,
  Users,
  TrendingUp,
  HandHeart,
  FileText,
  Calendar,
  Search,
  Filter,
  MoreHorizontal,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

// Mock data - in production this would come from the database
const introducers = [
  {
    id: '1',
    legal_name: 'Goldman Sachs Private Wealth',
    user: { display_name: 'Marcus Goldman', email: 'marcus@gs.com' },
    default_commission_bps: 150,
    status: 'active',
    created_at: '2024-01-15',
    total_introductions: 12,
    successful_allocations: 8,
    total_commission_earned: 125000,
    pending_commission: 25000,
    last_introduction: '2024-03-10'
  },
  {
    id: '2',
    legal_name: 'Meridian Capital Partners',
    user: { display_name: 'Sarah Chen', email: 'sarah@meridian.com' },
    default_commission_bps: 200,
    status: 'active',
    created_at: '2024-02-20',
    total_introductions: 8,
    successful_allocations: 6,
    total_commission_earned: 75000,
    pending_commission: 15000,
    last_introduction: '2024-03-08'
  },
  {
    id: '3',
    legal_name: 'Elite Family Office Network',
    user: { display_name: 'James Morrison', email: 'james@elitefn.com' },
    default_commission_bps: 175,
    status: 'inactive',
    created_at: '2023-11-10',
    total_introductions: 5,
    successful_allocations: 2,
    total_commission_earned: 45000,
    pending_commission: 0,
    last_introduction: '2024-01-15'
  }
]

const recentIntroductions = [
  {
    id: '1',
    introducer_name: 'Goldman Sachs Private Wealth',
    prospect_email: 'john.doe@wealth.com',
    deal_name: 'Tech Growth Opportunity',
    status: 'allocated',
    introduced_at: '2024-03-10',
    commission_amount: 12000
  },
  {
    id: '2',
    introducer_name: 'Meridian Capital Partners',
    prospect_email: 'investment@family-office.org',
    deal_name: 'Real Estate Secondary',
    status: 'joined',
    introduced_at: '2024-03-08',
    commission_amount: 8500
  },
  {
    id: '3',
    introducer_name: 'Goldman Sachs Private Wealth',
    prospect_email: 'portfolio@instituional.com',
    deal_name: 'Credit Trade Finance',
    status: 'invited',
    introduced_at: '2024-03-05',
    commission_amount: null
  }
]

export default async function IntroducersPage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/versotech/login')
  }

  return (
    <AppLayout brand="versotech">
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Introducer Management</h1>
            <p className="text-gray-600 mt-1">
              Manage introducer relationships, commissions, and performance tracking
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Introducer
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add New Introducer</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="legal_name">Legal Name</Label>
                  <Input id="legal_name" placeholder="Legal entity name" />
                </div>
                <div>
                  <Label htmlFor="contact_name">Contact Person</Label>
                  <Input id="contact_name" placeholder="Primary contact name" />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="contact@example.com" />
                </div>
                <div>
                  <Label htmlFor="commission_bps">Default Commission (bps)</Label>
                  <Input id="commission_bps" type="number" placeholder="150" />
                </div>
                <div>
                  <Label htmlFor="agreement">Agreement Document</Label>
                  <Input id="agreement" type="file" accept=".pdf,.doc,.docx" />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline">Cancel</Button>
                  <Button>Create Introducer</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <HandHeart className="h-4 w-4" />
                Active Introducers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {introducers.filter(i => i.status === 'active').length}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {introducers.length} total
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total Introductions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {introducers.reduce((sum, i) => sum + i.total_introductions, 0)}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {introducers.reduce((sum, i) => sum + i.successful_allocations, 0)} allocated
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Commissions Paid
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${introducers.reduce((sum, i) => sum + i.total_commission_earned, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-500 mt-1">This year</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Pending Commissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                ${introducers.reduce((sum, i) => sum + i.pending_commission, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-500 mt-1">Awaiting payment</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle>Search & Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search introducers..."
                  className="w-full"
                />
              </div>
              <Select>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Performance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="high">High Performers</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Needs Attention</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Introducers Table */}
        <Card>
          <CardHeader>
            <CardTitle>Introducers</CardTitle>
            <CardDescription>
              Manage introducer relationships and track performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {introducers.map((introducer) => (
                <div key={introducer.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <HandHeart className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{introducer.legal_name}</h3>
                        <div className="text-sm text-gray-600">
                          {introducer.user.display_name} • {introducer.user.email}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          Default: {introducer.default_commission_bps} bps commission
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="font-semibold">{introducer.total_introductions}</div>
                        <div className="text-sm text-gray-500">Introductions</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">{introducer.successful_allocations}</div>
                        <div className="text-sm text-gray-500">Allocated</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">${introducer.total_commission_earned.toLocaleString()}</div>
                        <div className="text-sm text-gray-500">Earned</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-orange-600">${introducer.pending_commission.toLocaleString()}</div>
                        <div className="text-sm text-gray-500">Pending</div>
                      </div>
                      <Badge className={introducer.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {introducer.status}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Introductions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Introductions</CardTitle>
            <CardDescription>
              Latest introducer activities and commission tracking
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentIntroductions.map((intro) => (
                <div key={intro.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${
                      intro.status === 'allocated' ? 'bg-green-500' :
                      intro.status === 'joined' ? 'bg-blue-500' : 'bg-yellow-500'
                    }`} />
                    <div>
                      <h4 className="font-medium">{intro.prospect_email}</h4>
                      <div className="text-sm text-gray-600">
                        by {intro.introducer_name} • {intro.deal_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(intro.introduced_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      {intro.commission_amount ? (
                        <div className="font-medium">${intro.commission_amount.toLocaleString()}</div>
                      ) : (
                        <div className="text-sm text-gray-500">TBD</div>
                      )}
                      <div className="text-xs text-gray-400">Commission</div>
                    </div>
                    <Badge variant="outline" className={
                      intro.status === 'allocated' ? 'border-green-200 text-green-800' :
                      intro.status === 'joined' ? 'border-blue-200 text-blue-800' :
                      'border-yellow-200 text-yellow-800'
                    }>
                      {intro.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
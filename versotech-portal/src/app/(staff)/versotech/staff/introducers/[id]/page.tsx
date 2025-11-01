import { createServiceClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Mail, DollarSign, TrendingUp } from 'lucide-react';
import { formatCurrency, formatBps } from '@/lib/format';

export default async function IntroducerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const serviceSupabase = createServiceClient();

  // Fetch introducer details
  const { data: introducer, error } = await serviceSupabase
    .from('introducers')
    .select(`
      *,
      introductions (
        id,
        prospect_email,
        status,
        introduced_at,
        deal:deals ( id, name )
      ),
      introducer_commissions (
        id,
        accrual_amount,
        status,
        paid_at,
        created_at
      )
    `)
    .eq('id', id)
    .single();

  if (error || !introducer) {
    redirect('/versotech/staff/introducers');
  }

  const introductions = introducer.introductions || [];
  const commissions = introducer.introducer_commissions || [];

  const totalIntroductions = introductions.length;
  const successfulAllocations = introductions.filter((i: any) => i.status === 'allocated').length;
  const totalCommissionPaid = commissions
    .filter((c: any) => c.status === 'paid')
    .reduce((sum: number, c: any) => sum + Number(c.accrual_amount || 0), 0);
  const pendingCommission = commissions
    .filter((c: any) => c.status === 'accrued' || c.status === 'invoiced')
    .reduce((sum: number, c: any) => sum + Number(c.accrual_amount || 0), 0);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/versotech/staff/introducers">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Introducers
          </Button>
        </Link>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">{introducer.legal_name}</h1>
          <Badge className="capitalize">
            {introducer.status}
          </Badge>
        </div>
        <p className="text-gray-400">Introducer Profile & Performance</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <TrendingUp className="h-4 w-4 inline mr-2" />
              Introductions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalIntroductions}</div>
            <p className="text-xs text-gray-400">{successfulAllocations} allocated</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <DollarSign className="h-4 w-4 inline mr-2" />
              Paid Commissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatCurrency(totalCommissionPaid)}</div>
            <p className="text-xs text-gray-400">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <DollarSign className="h-4 w-4 inline mr-2" />
              Pending Commission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{formatCurrency(pendingCommission)}</div>
            <p className="text-xs text-gray-400">Owed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Default Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatBps(introducer.default_commission_bps)}</div>
            {introducer.commission_cap_amount && (
              <p className="text-xs text-gray-400">Cap: {formatCurrency(introducer.commission_cap_amount)}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {introducer.contact_name && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-400 w-32">Contact Person:</span>
              <span className="text-white">{introducer.contact_name}</span>
            </div>
          )}
          {introducer.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-gray-400" />
              <span className="text-gray-400 w-32">Email:</span>
              <a href={`mailto:${introducer.email}`} className="text-blue-400 hover:underline">
                {introducer.email}
              </a>
            </div>
          )}
          {introducer.payment_terms && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-400 w-32">Payment Terms:</span>
              <span className="text-white">{introducer.payment_terms}</span>
            </div>
          )}
          {introducer.notes && (
            <div className="space-y-1">
              <span className="text-sm text-gray-400">Notes:</span>
              <p className="text-sm text-white whitespace-pre-wrap">{introducer.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Introductions</CardTitle>
        </CardHeader>
        <CardContent>
          {introductions.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No introductions yet</p>
          ) : (
            <div className="space-y-3">
              {introductions.map((intro: any) => (
                <div key={intro.id} className="flex items-center justify-between border border-border rounded-lg p-3">
                  <div>
                    <p className="text-sm font-medium text-white">{intro.prospect_email}</p>
                    <p className="text-xs text-gray-400">
                      {intro.deal?.name || 'Unknown deal'}
                    </p>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {intro.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Commission History</CardTitle>
        </CardHeader>
        <CardContent>
          {commissions.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No commissions yet</p>
          ) : (
            <div className="space-y-3">
              {commissions.map((comm: any) => (
                <div key={comm.id} className="flex items-center justify-between border border-border rounded-lg p-3">
                  <div>
                    <p className="text-sm font-medium text-white">{formatCurrency(comm.accrual_amount)}</p>
                    <p className="text-xs text-gray-400">
                      Created {new Date(comm.created_at).toLocaleDateString()}
                      {comm.paid_at && ` • Paid ${new Date(comm.paid_at).toLocaleDateString()}`}
                    </p>
                  </div>
                  <Badge variant={comm.status === 'paid' ? 'default' : 'secondary'} className="capitalize">
                    {comm.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

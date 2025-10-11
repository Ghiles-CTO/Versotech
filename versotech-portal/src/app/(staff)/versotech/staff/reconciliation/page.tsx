import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import {

export const dynamic = 'force-dynamic'
  Upload,
  Download,
  CheckCircle,
  AlertCircle,
  Clock,
  DollarSign,
  CreditCard,
  FileText,
  Search,
  Filter,
  Link,
  Unlink,
  RefreshCw,
  ArrowRight,
  TrendingUp,
  Activity
} from 'lucide-react'
import { redirect } from 'next/navigation'
import { requireStaffAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

export default async function ReconciliationPage() {
  const profile = await requireStaffAuth()
  if (!profile) {
    redirect('/versotech/login')
  }

  const supabase = await createClient()

  const { data: summaryData } = await supabase.rpc('get_reconciliation_summary')
  const summary = summaryData?.[0] ?? {
    total_transactions: 0,
    matched_transactions: 0,
    unmatched_transactions: 0,
    match_rate: 0,
    reconciled_amount: 0,
    pending_amount: 0
  }

  const { data: bankTransactions = [] } = await supabase
    .from('bank_transactions')
    .select('id, account_ref, amount, currency, value_date, memo, counterparty, status, matched_invoice_ids')
    .order('value_date', { ascending: false })
    .limit(50)

  const { data: invoices = [] } = await supabase
    .from('invoices')
    .select('id, investors:investors!invoices_investor_id_fkey(legal_name), deals:deals!invoices_deal_id_fkey(name), total, currency, due_date, status')
    .in('status', ['sent', 'overdue', 'partially_paid'])
    .order('due_date', { ascending: true })
    .limit(25)

  const { data: suggestedMatches = [] } = await supabase
    .from('suggested_matches')
    .select('id, bank_transaction_id, invoice_id, confidence, match_reason, amount_difference')
    .order('confidence', { ascending: false })
    .limit(20)

  const summaryDisplay = {
    matchRate: Number(summary.match_rate ?? 0),
    matchedTransactions: Number(summary.matched_transactions ?? 0),
    totalTransactions: Number(summary.total_transactions ?? 0),
    reconciledAmount: Number(summary.reconciled_amount ?? 0),
    pendingAmount: Number(summary.pending_amount ?? 0),
    unmatchedTransactions: Number(summary.unmatched_transactions ?? 0)
  }

  return (
    <AppLayout brand="versotech">
      <div className="p-6 space-y-6 text-foreground">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Bank Reconciliation</h1>
            <p className="text-muted-foreground mt-1">
              Import bank transactions and match with outstanding invoices
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" disabled>
                  <Upload className="h-4 w-4 mr-2" />
                  Import Bank Data
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Import Bank Transactions</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="account">Bank Account</Label>
                    <Input id="account" placeholder="Account selection coming soon" disabled />
                  </div>
                  <div>
                    <Label htmlFor="file">CSV File</Label>
                    <Input id="file" type="file" accept=".csv" disabled />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Upload workflow will be enabled in a future iteration.
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline">Close</Button>
                    <Button disabled>Import</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button disabled>
              <RefreshCw className="h-4 w-4 mr-2" />
              Run Auto-Match
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white/5 border border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Match Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-200">
                {summaryDisplay.matchRate}%
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {summaryDisplay.matchedTransactions} of {summaryDisplay.totalTransactions}
              </div>
              <Progress value={summaryDisplay.matchRate} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Reconciled Amount
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-200">
                ${summaryDisplay.reconciledAmount.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Successfully matched</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Pending Amount
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-200">
                ${summaryDisplay.pendingAmount.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Awaiting reconciliation</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Unmatched Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-rose-200">
                {summaryDisplay.unmatchedTransactions}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Need attention</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Suggested Matches</CardTitle>
            <CardDescription>
              Suggestions for matching bank transactions with invoices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {suggestedMatches.length === 0 && (
                <div className="text-sm text-muted-foreground">No suggested matches available.</div>
              )}
              {suggestedMatches.map((match) => {
                const transaction = bankTransactions.find(t => t.id === match.bank_transaction_id)
                const invoice = invoices.find(i => i.id === match.invoice_id)
                return (
                  <div key={match.id} className="border border-white/10 rounded-lg p-4 bg-white/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${
                          match.confidence >= 80 ? 'bg-emerald-400' :
                          match.confidence >= 60 ? 'bg-amber-400' : 'bg-rose-400'
                        }`} />
                        <div className="flex items-center gap-8">
                          <div>
                            <div className="font-medium text-foreground">Bank Transaction</div>
                            <div className="text-sm text-muted-foreground">
                              ${transaction?.amount.toLocaleString() ?? '0'} • {transaction?.counterparty ?? 'Unknown'}
                            </div>
                            <div className="text-xs text-muted-foreground">{transaction?.value_date ?? '—'}</div>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium text-foreground">Invoice</div>
                            <div className="text-sm text-muted-foreground">
                              ${invoice?.total.toLocaleString() ?? '0'} • {invoice?.investors?.legal_name ?? 'Unknown investor'}
                            </div>
                            <div className="text-xs text-muted-foreground">{invoice?.deals?.name ?? 'No deal'}</div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <Badge className={
                            match.confidence >= 80 ? 'bg-emerald-500/15 text-emerald-200 border border-emerald-400/30' :
                            match.confidence >= 60 ? 'bg-amber-500/15 text-amber-200 border border-amber-400/30' : 'bg-rose-500/20 text-rose-200 border border-rose-400/30'
                          }>
                            {match.confidence}% match
                          </Badge>
                          <div className="text-xs text-muted-foreground mt-1">{match.match_reason}</div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" disabled>
                            <Link className="h-4 w-4 mr-1" />
                            Accept
                          </Button>
                          <Button variant="outline" size="sm" disabled>
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Bank Transactions</CardTitle>
              <CardDescription>
                Imported transactions awaiting reconciliation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bankTransactions.length === 0 && (
                  <div className="text-sm text-muted-foreground">No bank transactions found.</div>
                )}
                {bankTransactions.map((transaction) => (
                  <div key={transaction.id} className="border border-white/10 rounded-lg p-4 bg-white/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          transaction.status === 'matched' ? 'bg-emerald-400' :
                          transaction.status === 'partially_matched' ? 'bg-amber-400' : 'bg-sky-400'
                        }`} />
                        <div>
                          <div className="font-medium text-foreground">
                            ${transaction.amount.toLocaleString()} {transaction.currency}
                          </div>
                          <div className="text-sm text-muted-foreground">{transaction.counterparty ?? 'Unknown counterparty'}</div>
                          <div className="text-xs text-muted-foreground">{transaction.memo}</div>
                          <div className="text-xs text-muted-foreground">{transaction.value_date}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={
                          transaction.status === 'matched' ? 'border-emerald-400/40 text-emerald-200' :
                          transaction.status === 'partially_matched' ? 'border-amber-400/40 text-amber-200' :
                          'border-slate-400/40 text-slate-200'
                        }>
                          {transaction.status.replace('_', ' ')}
                        </Badge>
                        <Button variant="outline" size="sm" disabled>
                          <Link className="h-4 w-4 mr-1" />
                          Match
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Outstanding Invoices</CardTitle>
              <CardDescription>
                Invoices awaiting payment or match
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invoices.length === 0 && (
                  <div className="text-sm text-muted-foreground">No outstanding invoices.</div>
                )}
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="border border-white/10 rounded-lg p-4 bg-white/5">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-foreground">
                          {invoice.id}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {invoice.investors?.legal_name ?? 'Unknown investor'} • {invoice.deals?.name ?? 'No deal'}
                        </div>
                        <div className="text-xs text-muted-foreground">Due {invoice.due_date}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-foreground">
                          ${invoice.total.toLocaleString()} {invoice.currency}
                        </div>
                        <Badge variant="outline" className="border-white/20 text-foreground">
                          {invoice.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
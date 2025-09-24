import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import {
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
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

// Mock data - in production this would come from the database
const reconciliationSummary = {
  totalTransactions: 247,
  matchedTransactions: 189,
  unmatchedTransactions: 58,
  matchRate: 76.5,
  pendingAmount: 145670.50,
  reconciledAmount: 2847392.25
}

const bankTransactions = [
  {
    id: '1',
    account_ref: 'VERSO-CHF-001',
    amount: 50000.00,
    currency: 'USD',
    value_date: '2024-03-10',
    memo: 'WIRE TRANSFER FROM GOLDMAN SACHS PRIVATE WEALTH',
    counterparty: 'Goldman Sachs',
    status: 'matched',
    matched_invoice: 'INV-2024-001',
    matched_amount: 50000.00,
    import_batch_id: 'BATCH-001'
  },
  {
    id: '2',
    account_ref: 'VERSO-CHF-001',
    amount: 25000.00,
    currency: 'USD',
    value_date: '2024-03-09',
    memo: 'SUBSCRIPTION FEE - TECH GROWTH OPPORTUNITY',
    counterparty: 'MERIDIAN CAPITAL',
    status: 'unmatched',
    matched_invoice: null,
    matched_amount: null,
    import_batch_id: 'BATCH-001'
  },
  {
    id: '3',
    account_ref: 'VERSO-EUR-001',
    amount: 75000.00,
    currency: 'EUR',
    value_date: '2024-03-08',
    memo: 'MANAGEMENT FEE Q1 2024',
    counterparty: 'FAMILY OFFICE NETWORK',
    status: 'partially_matched',
    matched_invoice: 'INV-2024-002',
    matched_amount: 50000.00,
    import_batch_id: 'BATCH-002'
  }
]

const outstandingInvoices = [
  {
    id: 'INV-2024-003',
    investor_name: 'Tech Ventures LLC',
    deal_name: 'Real Estate Secondary',
    total: 35000.00,
    currency: 'USD',
    due_date: '2024-03-15',
    status: 'sent',
    days_outstanding: 5
  },
  {
    id: 'INV-2024-004',
    investor_name: 'Elite Family Office',
    deal_name: 'Credit Trade Finance',
    total: 25000.00,
    currency: 'USD',
    due_date: '2024-03-20',
    status: 'sent',
    days_outstanding: 0
  }
]

const suggestedMatches = [
  {
    transaction_id: '2',
    invoice_id: 'INV-2024-003',
    confidence: 85,
    reason: 'Amount and counterparty match',
    amount_difference: 0
  },
  {
    transaction_id: '3',
    invoice_id: 'INV-2024-004',
    confidence: 65,
    reason: 'Partial amount match, similar counterparty',
    amount_difference: 25000
  }
]

export default async function ReconciliationPage() {
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
            <h1 className="text-2xl font-bold text-gray-900">Bank Reconciliation</h1>
            <p className="text-gray-600 mt-1">
              Import bank transactions and match with outstanding invoices
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
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
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select account" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="verso-chf-001">VERSO CHF Account</SelectItem>
                        <SelectItem value="verso-eur-001">VERSO EUR Account</SelectItem>
                        <SelectItem value="verso-usd-001">VERSO USD Account</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="file">CSV File</Label>
                    <Input id="file" type="file" accept=".csv" />
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>Supported formats: CSV with columns: Date, Amount, Currency, Reference, Counterparty</p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline">Cancel</Button>
                    <Button>Import</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button>
              <RefreshCw className="h-4 w-4 mr-2" />
              Run Auto-Match
            </Button>
          </div>
        </div>

        {/* Reconciliation Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Match Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {reconciliationSummary.matchRate}%
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {reconciliationSummary.matchedTransactions} of {reconciliationSummary.totalTransactions}
              </div>
              <Progress value={reconciliationSummary.matchRate} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Reconciled Amount
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ${reconciliationSummary.reconciledAmount.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500 mt-1">Successfully matched</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Pending Amount
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                ${reconciliationSummary.pendingAmount.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500 mt-1">Awaiting reconciliation</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Unmatched Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {reconciliationSummary.unmatchedTransactions}
              </div>
              <div className="text-sm text-gray-500 mt-1">Need attention</div>
            </CardContent>
          </Card>
        </div>

        {/* Suggested Matches */}
        <Card>
          <CardHeader>
            <CardTitle>Suggested Matches</CardTitle>
            <CardDescription>
              AI-powered suggestions for matching bank transactions with invoices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {suggestedMatches.map((match) => {
                const transaction = bankTransactions.find(t => t.id === match.transaction_id)
                const invoice = outstandingInvoices.find(i => i.id === match.invoice_id)

                return (
                  <div key={match.transaction_id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${
                          match.confidence >= 80 ? 'bg-green-500' :
                          match.confidence >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`} />
                        <div className="flex items-center gap-8">
                          <div>
                            <div className="font-medium">Bank Transaction</div>
                            <div className="text-sm text-gray-600">
                              ${transaction?.amount.toLocaleString()} • {transaction?.counterparty}
                            </div>
                            <div className="text-xs text-gray-500">{transaction?.value_date}</div>
                          </div>
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                          <div>
                            <div className="font-medium">Invoice</div>
                            <div className="text-sm text-gray-600">
                              ${invoice?.total.toLocaleString()} • {invoice?.investor_name}
                            </div>
                            <div className="text-xs text-gray-500">{invoice?.deal_name}</div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <Badge className={
                            match.confidence >= 80 ? 'bg-green-100 text-green-800' :
                            match.confidence >= 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                          }>
                            {match.confidence}% match
                          </Badge>
                          <div className="text-xs text-gray-500 mt-1">{match.reason}</div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Link className="h-4 w-4 mr-1" />
                            Accept
                          </Button>
                          <Button variant="outline" size="sm">
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
          {/* Bank Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Bank Transactions</CardTitle>
              <CardDescription>
                Imported transactions awaiting reconciliation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bankTransactions.map((transaction) => (
                  <div key={transaction.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          transaction.status === 'matched' ? 'bg-green-500' :
                          transaction.status === 'partially_matched' ? 'bg-yellow-500' : 'bg-gray-400'
                        }`} />
                        <div>
                          <div className="font-medium">
                            ${transaction.amount.toLocaleString()} {transaction.currency}
                          </div>
                          <div className="text-sm text-gray-600">{transaction.counterparty}</div>
                          <div className="text-xs text-gray-500">{transaction.memo}</div>
                          <div className="text-xs text-gray-400">{transaction.value_date}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={
                          transaction.status === 'matched' ? 'border-green-200 text-green-800' :
                          transaction.status === 'partially_matched' ? 'border-yellow-200 text-yellow-800' :
                          'border-gray-200 text-gray-800'
                        }>
                          {transaction.status.replace('_', ' ')}
                        </Badge>
                        {transaction.status === 'unmatched' && (
                          <Button variant="outline" size="sm">
                            <Link className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Outstanding Invoices */}
          <Card>
            <CardHeader>
              <CardTitle>Outstanding Invoices</CardTitle>
              <CardDescription>
                Invoices awaiting payment reconciliation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {outstandingInvoices.map((invoice) => (
                  <div key={invoice.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{invoice.id}</div>
                        <div className="text-sm text-gray-600">{invoice.investor_name}</div>
                        <div className="text-xs text-gray-500">{invoice.deal_name}</div>
                        <div className="text-xs text-gray-400">Due: {invoice.due_date}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${invoice.total.toLocaleString()}</div>
                        <Badge className={
                          invoice.days_outstanding > 30 ? 'bg-red-100 text-red-800' :
                          invoice.days_outstanding > 0 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }>
                          {invoice.days_outstanding === 0 ? 'Due today' :
                           `${invoice.days_outstanding} days overdue`}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Manual Matching */}
        <Card>
          <CardHeader>
            <CardTitle>Manual Matching</CardTitle>
            <CardDescription>
              Manually link bank transactions with invoices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="transaction">Select Transaction</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose transaction" />
                  </SelectTrigger>
                  <SelectContent>
                    {bankTransactions
                      .filter(t => t.status === 'unmatched')
                      .map(t => (
                        <SelectItem key={t.id} value={t.id}>
                          ${t.amount.toLocaleString()} - {t.counterparty}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="invoice">Select Invoice</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose invoice" />
                  </SelectTrigger>
                  <SelectContent>
                    {outstandingInvoices.map(i => (
                      <SelectItem key={i.id} value={i.id}>
                        {i.id} - ${i.total.toLocaleString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button>
                  <Link className="h-4 w-4 mr-2" />
                  Create Match
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
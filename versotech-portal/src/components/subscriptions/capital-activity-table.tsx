'use client'

import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowDownCircle, ArrowUpCircle, DollarSign } from 'lucide-react'

type Cashflow = {
  id: string
  type: string
  amount: number
  date: string
  ref_id?: string
}

type CapitalCall = {
  id: string
  name: string
  call_pct: number
  due_date: string
  status: string
}

type Distribution = {
  id: string
  name: string
  amount: number
  date: string
  classification: string
}

interface CapitalActivityTableProps {
  cashflows: Cashflow[]
  capitalCalls: CapitalCall[]
  distributions: Distribution[]
  currency: string
}

export function CapitalActivityTable({
  cashflows,
  capitalCalls,
  distributions,
  currency,
}: CapitalActivityTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <Tabs defaultValue="cashflows" className="w-full">
      <TabsList className="bg-gray-800">
        <TabsTrigger value="cashflows" className="data-[state=active]:bg-gray-700 text-white">
          Cashflows ({cashflows.length})
        </TabsTrigger>
        <TabsTrigger value="calls" className="data-[state=active]:bg-gray-700 text-white">
          Capital Calls ({capitalCalls.length})
        </TabsTrigger>
        <TabsTrigger value="distributions" className="data-[state=active]:bg-gray-700 text-white">
          Distributions ({distributions.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="cashflows" className="mt-4">
        <div className="rounded-md border border-gray-700">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700 hover:bg-gray-800/50">
                <TableHead className="text-gray-300">Type</TableHead>
                <TableHead className="text-gray-300">Date</TableHead>
                <TableHead className="text-right text-gray-300">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cashflows.length > 0 ? (
                cashflows.map((cf) => (
                  <TableRow key={cf.id} className="border-gray-700 hover:bg-gray-800/50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {cf.type === 'contribution' ? (
                          <ArrowDownCircle className="h-4 w-4 text-green-400" />
                        ) : (
                          <ArrowUpCircle className="h-4 w-4 text-blue-400" />
                        )}
                        <span className="capitalize text-white">{cf.type}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-300">{formatDate(cf.date)}</TableCell>
                    <TableCell className="text-right font-semibold text-white">
                      {formatCurrency(cf.amount)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-gray-400 py-8">
                    No cashflows recorded yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </TabsContent>

      <TabsContent value="calls" className="mt-4">
        <div className="rounded-md border border-gray-700">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700 hover:bg-gray-800/50">
                <TableHead className="text-gray-300">Call Name</TableHead>
                <TableHead className="text-gray-300">Call %</TableHead>
                <TableHead className="text-gray-300">Due Date</TableHead>
                <TableHead className="text-gray-300">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {capitalCalls.length > 0 ? (
                capitalCalls.map((call) => (
                  <TableRow key={call.id} className="border-gray-700 hover:bg-gray-800/50">
                    <TableCell className="font-medium text-white">{call.name}</TableCell>
                    <TableCell className="text-gray-300">{call.call_pct}%</TableCell>
                    <TableCell className="text-gray-300">{formatDate(call.due_date)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={call.status === 'completed' ? 'default' : 'secondary'}
                        className={
                          call.status === 'completed'
                            ? 'bg-green-900 text-green-200'
                            : 'bg-yellow-900 text-yellow-200'
                        }
                      >
                        {call.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-gray-400 py-8">
                    No capital calls issued yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </TabsContent>

      <TabsContent value="distributions" className="mt-4">
        <div className="rounded-md border border-gray-700">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700 hover:bg-gray-800/50">
                <TableHead className="text-gray-300">Distribution Name</TableHead>
                <TableHead className="text-gray-300">Date</TableHead>
                <TableHead className="text-gray-300">Classification</TableHead>
                <TableHead className="text-right text-gray-300">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {distributions.length > 0 ? (
                distributions.map((dist) => (
                  <TableRow key={dist.id} className="border-gray-700 hover:bg-gray-800/50">
                    <TableCell className="font-medium text-white">{dist.name}</TableCell>
                    <TableCell className="text-gray-300">{formatDate(dist.date)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize text-blue-300 border-blue-700">
                        {dist.classification}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-white">
                      {formatCurrency(dist.amount)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-gray-400 py-8">
                    No distributions made yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </TabsContent>
    </Tabs>
  )
}

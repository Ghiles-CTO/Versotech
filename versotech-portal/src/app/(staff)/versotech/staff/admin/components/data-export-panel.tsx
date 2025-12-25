'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import {
  Download,
  FileSpreadsheet,
  FileText,
  Users,
  DollarSign,
  Briefcase,
  Activity,
  Calendar,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ExportOption {
  id: string
  title: string
  description: string
  icon: typeof Download
  iconColor: string
  formats: string[]
  hasDateRange: boolean
  hasFilters?: boolean
}

const exportOptions: ExportOption[] = [
  {
    id: 'investors',
    title: 'Investors',
    description: 'Export all investor data including KYC status, contact info, and AUM',
    icon: Users,
    iconColor: 'text-blue-400',
    formats: ['csv', 'xlsx'],
    hasDateRange: false,
    hasFilters: true,
  },
  {
    id: 'subscriptions',
    title: 'Subscriptions',
    description: 'Export subscription data with commitments, funding status, and NAV',
    icon: DollarSign,
    iconColor: 'text-emerald-400',
    formats: ['csv', 'xlsx'],
    hasDateRange: true,
  },
  {
    id: 'deals',
    title: 'Deals',
    description: 'Export deal pipeline data with status, values, and participation',
    icon: Briefcase,
    iconColor: 'text-purple-400',
    formats: ['csv', 'xlsx'],
    hasDateRange: false,
  },
  {
    id: 'fee-events',
    title: 'Fee Events',
    description: 'Export fee calculations and revenue data by period',
    icon: DollarSign,
    iconColor: 'text-amber-400',
    formats: ['csv', 'xlsx'],
    hasDateRange: true,
  },
  {
    id: 'audit-logs',
    title: 'Audit Logs',
    description: 'Export compliance audit trail with user actions and timestamps',
    icon: Activity,
    iconColor: 'text-red-400',
    formats: ['csv', 'xlsx', 'json'],
    hasDateRange: true,
  },
  {
    id: 'financial-summary',
    title: 'Financial Summary',
    description: 'Generate comprehensive financial report with AUM and revenue breakdown',
    icon: FileText,
    iconColor: 'text-cyan-400',
    formats: ['xlsx', 'pdf'],
    hasDateRange: true,
  },
]

interface DataExportPanelProps {
  isDark?: boolean
}

export function DataExportPanel({ isDark = true }: DataExportPanelProps) {
  const [selectedExport, setSelectedExport] = useState<string | null>(null)
  const [format, setFormat] = useState<string>('csv')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [kycFilter, setKycFilter] = useState<string>('all')
  const [loading, setLoading] = useState(false)
  const [recentExports, setRecentExports] = useState<
    Array<{ id: string; type: string; timestamp: string; status: string }>
  >([])

  const selectedOption = exportOptions.find((opt) => opt.id === selectedExport)

  const handleExport = async () => {
    if (!selectedExport) {
      toast.error('Please select an export type')
      return
    }

    setLoading(true)
    try {
      const params = new URLSearchParams({
        type: selectedExport,
        format,
      })

      if (dateFrom) params.set('from', dateFrom)
      if (dateTo) params.set('to', dateTo)
      if (kycFilter !== 'all') params.set('kyc_status', kycFilter)

      const response = await fetch(`/api/admin/export?${params.toString()}`)

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${selectedExport}-export-${new Date().toISOString().split('T')[0]}.${format}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        a.remove()

        toast.success('Export downloaded successfully')

        // Add to recent exports
        setRecentExports((prev) => [
          {
            id: Date.now().toString(),
            type: selectedExport,
            timestamp: new Date().toISOString(),
            status: 'completed',
          },
          ...prev.slice(0, 4),
        ])
      } else {
        const error = await response.json()
        toast.error(error.error || 'Export failed')
      }
    } catch (error) {
      toast.error('Failed to generate export')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Export Options Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {exportOptions.map((option) => (
          <Card
            key={option.id}
            onClick={() => {
              setSelectedExport(option.id)
              setFormat(option.formats[0])
            }}
            className={cn(
              'cursor-pointer transition-colors',
              selectedExport === option.id
                ? isDark
                  ? 'border-white/30 bg-white/10'
                  : 'border-blue-500 bg-blue-50'
                : isDark
                  ? 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600 hover:bg-zinc-800'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 shadow-sm'
            )}
          >
            <CardContent className="p-4 text-left">
              <div className="flex items-center gap-3 mb-2">
                <option.icon className={`h-5 w-5 ${option.iconColor}`} />
                <span className={cn(
                  'font-medium',
                  isDark ? 'text-white' : 'text-gray-900'
                )}>{option.title}</span>
              </div>
              <p className={cn(
                'text-xs line-clamp-2',
                isDark ? 'text-zinc-400' : 'text-gray-500'
              )}>{option.description}</p>
              <div className="flex items-center gap-2 mt-3">
                {option.formats.map((fmt) => (
                  <Badge
                    key={fmt}
                    variant="outline"
                    className={cn(
                      'text-xs',
                      isDark
                        ? 'border-zinc-600 text-zinc-400'
                        : 'border-gray-300 text-gray-500'
                    )}
                  >
                    {fmt.toUpperCase()}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Export Configuration */}
      {selectedOption && (
        <Card className={cn(
          isDark ? 'bg-zinc-800/50 border-zinc-700' : 'bg-white border-gray-200 shadow-sm'
        )}>
          <CardHeader className={cn(
            'pb-4 border-b',
            isDark ? 'border-zinc-700' : 'border-gray-200'
          )}>
            <div className="flex items-center gap-3">
              <selectedOption.icon className={`h-6 w-6 ${selectedOption.iconColor}`} />
              <div>
                <CardTitle className={cn(
                  'text-lg',
                  isDark ? 'text-white' : 'text-gray-900'
                )}>Export {selectedOption.title}</CardTitle>
                <p className={cn(
                  'text-sm',
                  isDark ? 'text-zinc-400' : 'text-gray-500'
                )}>{selectedOption.description}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Format Selection */}
              <div className="space-y-2">
                <Label className={isDark ? 'text-zinc-400' : 'text-gray-600'}>Format</Label>
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger className={cn(
                    isDark
                      ? 'bg-zinc-900 border-zinc-700 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  )}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className={cn(
                    isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-gray-200'
                  )}>
                    {selectedOption.formats.map((fmt) => (
                      <SelectItem key={fmt} value={fmt}>
                        {fmt.toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range */}
              {selectedOption.hasDateRange && (
                <>
                  <div className="space-y-2">
                    <Label className={isDark ? 'text-zinc-400' : 'text-gray-600'}>From Date</Label>
                    <div className="relative">
                      <Calendar className={cn(
                        'absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4',
                        isDark ? 'text-zinc-400' : 'text-gray-400'
                      )} />
                      <Input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className={cn(
                          'pl-9',
                          isDark
                            ? 'bg-zinc-900 border-zinc-700 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        )}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className={isDark ? 'text-zinc-400' : 'text-gray-600'}>To Date</Label>
                    <div className="relative">
                      <Calendar className={cn(
                        'absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4',
                        isDark ? 'text-zinc-400' : 'text-gray-400'
                      )} />
                      <Input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className={cn(
                          'pl-9',
                          isDark
                            ? 'bg-zinc-900 border-zinc-700 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        )}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* KYC Filter for Investors */}
              {selectedOption.hasFilters && selectedExport === 'investors' && (
                <div className="space-y-2">
                  <Label className={isDark ? 'text-zinc-400' : 'text-gray-600'}>KYC Status</Label>
                  <Select value={kycFilter} onValueChange={setKycFilter}>
                    <SelectTrigger className={cn(
                      isDark
                        ? 'bg-zinc-900 border-zinc-700 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    )}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className={cn(
                      isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-gray-200'
                    )}>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Export Button */}
            <div className={cn(
              'pt-4 border-t',
              isDark ? 'border-zinc-700' : 'border-gray-200'
            )}>
              <Button onClick={handleExport} disabled={loading} className="w-full sm:w-auto">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Download Export
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Exports */}
      {recentExports.length > 0 && (
        <Card className={cn(
          isDark ? 'bg-zinc-900/50 border-zinc-700' : 'bg-white border-gray-200 shadow-sm'
        )}>
          <CardHeader>
            <CardTitle className={cn(
              'text-sm font-medium',
              isDark ? 'text-zinc-400' : 'text-gray-600'
            )}>Recent Exports</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentExports.map((exp) => {
              const option = exportOptions.find((o) => o.id === exp.type)
              return (
                <div
                  key={exp.id}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-lg border',
                    isDark
                      ? 'bg-zinc-800/50 border-zinc-700'
                      : 'bg-gray-50 border-gray-200'
                  )}
                >
                  <div className="flex items-center gap-3">
                    {option && <option.icon className={`h-4 w-4 ${option.iconColor}`} />}
                    <div>
                      <p className={cn(
                        'text-sm font-medium',
                        isDark ? 'text-white' : 'text-gray-900'
                      )}>{option?.title || exp.type}</p>
                      <p className={cn(
                        'text-xs',
                        isDark ? 'text-zinc-400' : 'text-gray-500'
                      )}>
                        {new Date(exp.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                    Completed
                  </Badge>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

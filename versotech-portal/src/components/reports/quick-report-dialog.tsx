import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Calendar, FileText, Sparkles } from 'lucide-react'
import { format } from 'date-fns'
import { useMemo } from 'react'
import type { ReportType } from '@/types/reports'
import { REPORT_TYPES } from '@/lib/reports/constants'

interface VehicleOption {
  id: string
  name: string
  type: string
}

interface QuickReportDialogProps {
  open: boolean
  reportType: ReportType | null
  onOpenChange: (open: boolean) => void
  config: {
    fields: string[]
    supportedScopes: Array<'all' | 'vehicle' | 'custom'>
  }
  vehicles: VehicleOption[]
  formState: Record<string, any>
  onFormStateChange: (state: Record<string, any>) => void
  onSubmit: () => Promise<void>
  submitting: boolean
}

export function QuickReportDialog({
  open,
  reportType,
  onOpenChange,
  config,
  vehicles,
  formState,
  onFormStateChange,
  onSubmit,
  submitting
}: QuickReportDialogProps) {
  const reportConfig = reportType ? REPORT_TYPES[reportType] : null

  const scopeOptions = useMemo(() => {
    if (!config.supportedScopes) return []
    return config.supportedScopes.map((scope) => {
      switch (scope) {
        case 'vehicle':
          return { value: 'vehicle', label: 'Specific Holding' }
        case 'custom':
          return { value: 'custom', label: 'Custom Filter' }
        default:
          return { value: 'all', label: 'All Holdings' }
      }
    })
  }, [config.supportedScopes])

  const setField = (name: string, value: any) => {
    onFormStateChange({
      ...formState,
      [name]: value
    })
  }

  const defaultScope = scopeOptions.find((option) => option.value === 'all') ? 'all' : scopeOptions[0]?.value

  return (
    <Dialog open={open} onOpenChange={(value) => !submitting && onOpenChange(value)}>
      <DialogContent className="max-w-xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            {reportConfig ? reportConfig.label : 'Configure Report'}
          </DialogTitle>
          <DialogDescription>
            Choose the parameters for this report before we queue it for generation.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-5 py-4">
          {config.fields.includes('scope') && scopeOptions.length > 0 && (
            <div className="space-y-2">
              <Label>Report Scope</Label>
              <Select
                value={formState.scope || defaultScope}
                onValueChange={(value) => setField('scope', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {scopeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Decide whether you want the report across all holdings or focused on a particular vehicle.
              </p>
            </div>
          )}

          {config.fields.includes('vehicle') && (formState.scope === 'vehicle' || !config.fields.includes('scope')) && (
            <div className="space-y-2">
              <Label htmlFor="report-vehicle">Select Holding</Label>
              <Select
                value={formState.vehicleId || ''}
                onValueChange={(value) => setField('vehicleId', value)}
              >
                <SelectTrigger id="report-vehicle">
                  <SelectValue placeholder="Choose a holding" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                The report will focus on this holding. Only vehicles linked to your account appear here.
              </p>
            </div>
          )}

          {config.fields.includes('asOfRange') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>From Date</Label>
                <Input
                  type="date"
                  value={formState.fromDate || ''}
                  onChange={(event) => setField('fromDate', event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>To Date</Label>
                <Input
                  type="date"
                  value={formState.toDate || ''}
                  onChange={(event) => setField('toDate', event.target.value)}
                />
              </div>
            </div>
          )}

          {config.fields.includes('fromTo') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>From</Label>
                <Input
                  type="date"
                  value={formState.fromDate || ''}
                  onChange={(event) => setField('fromDate', event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>To</Label>
                <Input
                  type="date"
                  value={formState.toDate || ''}
                  onChange={(event) => setField('toDate', event.target.value)}
                />
              </div>
            </div>
          )}

          {config.fields.includes('period') && (
            <div className="space-y-2">
              <Label>Reporting Period</Label>
              <Select
                value={formState.period || 'last_quarter'}
                onValueChange={(value) => setField('period', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last_month">Last Month</SelectItem>
                  <SelectItem value="quarter_to_date">Quarter to Date</SelectItem>
                  <SelectItem value="last_quarter">Last Quarter</SelectItem>
                  <SelectItem value="year_to_date">Year to Date</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {config.fields.includes('taxYear') && (
            <div className="space-y-2">
              <Label htmlFor="tax-year">Tax Year</Label>
              <Input
                id="tax-year"
                type="number"
                value={formState.year || new Date().getFullYear()}
                onChange={(event) => setField('year', event.target.value)}
                min={2000}
                max={new Date().getFullYear()}
              />
            </div>
          )}

          {config.fields.includes('currency') && (
            <div className="space-y-2">
              <Label htmlFor="currency">Reporting Currency</Label>
              <Input
                id="currency"
                placeholder="e.g. USD"
                value={formState.currency || 'USD'}
                onChange={(event) => setField('currency', event.target.value.toUpperCase())}
                maxLength={3}
              />
            </div>
          )}

          {config.fields.includes('includeBenchmark') && (
            <label className="flex items-start gap-2 rounded-md border p-3 text-sm bg-muted/30">
              <Checkbox
                checked={!!formState.includeBenchmark}
                onCheckedChange={(checked) => setField('includeBenchmark', !!checked)}
              />
              <div>
                <div className="font-medium">Include benchmark comparisons</div>
                <p className="text-xs text-muted-foreground">Adds relevant index benchmarks to help contextualise performance.</p>
              </div>
            </label>
          )}

          {config.fields.includes('includeExcel') && (
            <label className="flex items-start gap-2 rounded-md border p-3 text-sm bg-muted/30">
              <Checkbox
                checked={!!formState.includeExcel}
                onCheckedChange={(checked) => setField('includeExcel', !!checked)}
              />
              <div>
                <div className="font-medium">Include Excel workbook</div>
                <p className="text-xs text-muted-foreground">Adds a detailed Excel export alongside the PDF summary.</p>
              </div>
            </label>
          )}

          {config.fields.includes('delivery') && (
            <div className="space-y-2">
              <Label>Delivery Preferences</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <label className="flex items-center gap-2 rounded-md border p-3 text-sm">
                  <Checkbox
                    checked={formState.includePdf !== false}
                    onCheckedChange={(checked) => setField('includePdf', checked !== false)}
                  />
                  <span>PDF Summary</span>
                </label>
                <label className="flex items-center gap-2 rounded-md border p-3 text-sm">
                  <Checkbox
                    checked={!!formState.includeExcel}
                    onCheckedChange={(checked) => setField('includeExcel', !!checked)}
                  />
                  <span>Excel Workbook</span>
                </label>
              </div>
            </div>
          )}

          {config.fields.includes('notes') && (
            <div className="space-y-2">
              <Label htmlFor="notes">Special Instructions</Label>
              <Textarea
                id="notes"
                rows={4}
                value={formState.notes || ''}
                onChange={(event) => setField('notes', event.target.value)}
                placeholder="Anything else you'd like the team to consider when preparing this report."
              />
            </div>
          )}

          {reportConfig && (
            <div className="rounded-md border bg-muted/30 p-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-2 mb-1 font-medium text-foreground">
                <Calendar className="h-4 w-4" />
                Expected turnaround: {reportConfig.estimatedTime}
              </div>
              <p>
                Reports typically complete within the stated timeframe. You'll receive a notification once the file is ready for download.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex-shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={submitting}>
            {submitting ? 'Queueing...' : 'Queue Report'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

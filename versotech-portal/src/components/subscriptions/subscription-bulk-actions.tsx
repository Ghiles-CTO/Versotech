'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  CheckCircle2,
  X,
  Mail,
  Edit,
  Archive,
  ChevronDown,
  AlertCircle,
  PlayCircle,
  StopCircle,
  FileText
} from 'lucide-react'
import { toast } from 'sonner'

interface SubscriptionBulkActionsProps {
  selectedIds: string[]
  selectedSubscriptions: any[]
  onClearSelection: () => void
  onBulkUpdate: (ids: string[], updates: Record<string, any>) => Promise<void>
}

export function SubscriptionBulkActions({
  selectedIds,
  selectedSubscriptions,
  onClearSelection,
  onBulkUpdate,
}: SubscriptionBulkActionsProps) {
  const [showStatusDialog, setShowStatusDialog] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  if (selectedIds.length === 0) {
    return null
  }

  const handleBulkStatusChange = async () => {
    if (!newStatus) {
      toast.error('Please select a status')
      return
    }

    setIsProcessing(true)
    try {
      await onBulkUpdate(selectedIds, { status: newStatus })
      toast.success(`Updated ${selectedIds.length} subscription(s) to ${newStatus}`)
      setShowStatusDialog(false)
      setNewStatus('')
      onClearSelection()
    } catch (error) {
      console.error('Bulk update error:', error)
      toast.error('Failed to update subscriptions')
    } finally {
      setIsProcessing(false)
    }
  }

  const calculateTotals = () => {
    return selectedSubscriptions.reduce((acc, sub) => {
      acc.commitment += Number(sub.commitment) || 0
      acc.funded += Number(sub.funded_amount) || 0
      acc.outstanding += Number(sub.outstanding_amount) || 0
      return acc
    }, { commitment: 0, funded: 0, outstanding: 0 })
  }

  const totals = calculateTotals()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <>
      <Card className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-blue-700 shadow-lg">
        <div className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-blue-300" />
                <span className="text-white font-semibold">
                  {selectedIds.length} subscription{selectedIds.length !== 1 ? 's' : ''} selected
                </span>
              </div>

              <div className="hidden md:flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <span className="text-gray-400">Commitment:</span>
                  <span className="text-white font-medium">{formatCurrency(totals.commitment)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-gray-400">Funded:</span>
                  <span className="text-green-400 font-medium">{formatCurrency(totals.funded)}</span>
                </div>
                {totals.outstanding > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="text-gray-400">Outstanding:</span>
                    <span className="text-yellow-400 font-medium">{formatCurrency(totals.outstanding)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="default"
                    className="bg-white text-black hover:bg-gray-200"
                    disabled={isProcessing}
                  >
                    Bulk Actions
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-gray-900 border-gray-700">
                  <DropdownMenuLabel className="text-white">Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-700" />

                  <DropdownMenuItem
                    onClick={() => setShowStatusDialog(true)}
                    className="text-white hover:bg-gray-800 cursor-pointer"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Change Status
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="bg-gray-700" />

                  <DropdownMenuItem
                    onClick={() => {
                      // TODO: Implement bulk email
                      toast.info('Bulk email feature coming soon')
                    }}
                    className="text-white hover:bg-gray-800 cursor-pointer"
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Send Notification
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => {
                      // TODO: Implement bulk report
                      toast.info('Bulk report generation coming soon')
                    }}
                    className="text-white hover:bg-gray-800 cursor-pointer"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Reports
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="bg-gray-700" />

                  <DropdownMenuItem
                    onClick={async () => {
                      if (confirm(`Archive ${selectedIds.length} subscription(s)?`)) {
                        try {
                          await onBulkUpdate(selectedIds, { status: 'closed' })
                          toast.success(`Archived ${selectedIds.length} subscription(s)`)
                          onClearSelection()
                        } catch (error) {
                          toast.error('Failed to archive subscriptions')
                        }
                      }
                    }}
                    className="text-red-400 hover:bg-gray-800 cursor-pointer"
                  >
                    <Archive className="mr-2 h-4 w-4" />
                    Archive Selected
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="ghost"
                size="icon"
                onClick={onClearSelection}
                className="text-white hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Status Change Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent className="bg-gray-900 text-white border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Change Status</DialogTitle>
            <DialogDescription className="text-gray-400">
              Update the status for {selectedIds.length} selected subscription{selectedIds.length !== 1 ? 's' : ''}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-status" className="text-white">New Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger id="new-status" className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="pending" className="text-white">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-400" />
                      Pending
                    </div>
                  </SelectItem>
                  <SelectItem value="committed" className="text-white">
                    <div className="flex items-center gap-2">
                      <PlayCircle className="h-4 w-4 text-blue-400" />
                      Committed
                    </div>
                  </SelectItem>
                  <SelectItem value="active" className="text-white">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                      Active
                    </div>
                  </SelectItem>
                  <SelectItem value="closed" className="text-white">
                    <div className="flex items-center gap-2">
                      <Archive className="h-4 w-4 text-gray-400" />
                      Closed
                    </div>
                  </SelectItem>
                  <SelectItem value="cancelled" className="text-white">
                    <div className="flex items-center gap-2">
                      <StopCircle className="h-4 w-4 text-red-400" />
                      Cancelled
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newStatus && (
              <div className="bg-blue-900/20 border border-blue-700 rounded p-3">
                <p className="text-sm text-blue-200">
                  {selectedIds.length} subscription{selectedIds.length !== 1 ? 's' : ''} will be updated to <span className="font-semibold capitalize">{newStatus}</span>
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowStatusDialog(false)
                setNewStatus('')
              }}
              disabled={isProcessing}
              className="bg-gray-800 text-white border-gray-700 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleBulkStatusChange}
              disabled={!newStatus || isProcessing}
              className="bg-white text-black hover:bg-gray-200"
            >
              {isProcessing ? 'Updating...' : 'Update Status'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

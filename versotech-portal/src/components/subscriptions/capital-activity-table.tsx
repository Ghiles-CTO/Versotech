'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowDownCircle, ArrowUpCircle, Edit2, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

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
  vehicleId: string
  investorId: string
  isStaff?: boolean
}

type EntityType = 'cashflow' | 'capitalCall' | 'distribution'

export function CapitalActivityTable({
  cashflows,
  capitalCalls,
  distributions,
  currency,
  vehicleId,
  investorId,
  isStaff = false,
}: CapitalActivityTableProps) {
  const router = useRouter()

  // Dialog states
  const [createDialog, setCreateDialog] = useState<{ open: boolean; type: EntityType | null }>({
    open: false,
    type: null,
  })
  const [editDialog, setEditDialog] = useState<{ open: boolean; type: EntityType | null; data: any }>({
    open: false,
    type: null,
    data: null,
  })
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; type: EntityType | null; id: string | null }>({
    open: false,
    type: null,
    id: null,
  })

  // Form states
  const [formData, setFormData] = useState<any>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const handleCreate = async () => {
    if (!createDialog.type) return

    setIsSubmitting(true)
    try {
      const endpoint =
        createDialog.type === 'cashflow'
          ? '/api/cashflows'
          : createDialog.type === 'capitalCall'
          ? '/api/capital-calls'
          : '/api/distributions'

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create')
      }

      toast.success(`${createDialog.type === 'cashflow' ? 'Cashflow' : createDialog.type === 'capitalCall' ? 'Capital call' : 'Distribution'} created successfully`)

      setCreateDialog({ open: false, type: null })
      setFormData({})
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to create')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdate = async () => {
    if (!editDialog.type || !editDialog.data?.id) return

    setIsSubmitting(true)
    try {
      const endpoint =
        editDialog.type === 'cashflow'
          ? `/api/cashflows/${editDialog.data.id}`
          : editDialog.type === 'capitalCall'
          ? `/api/capital-calls/${editDialog.data.id}`
          : `/api/distributions/${editDialog.data.id}`

      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update')
      }

      toast.success(`${editDialog.type === 'cashflow' ? 'Cashflow' : editDialog.type === 'capitalCall' ? 'Capital call' : 'Distribution'} updated successfully`)

      setEditDialog({ open: false, type: null, data: null })
      setFormData({})
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteDialog.type || !deleteDialog.id) return

    setIsSubmitting(true)
    try {
      const endpoint =
        deleteDialog.type === 'cashflow'
          ? `/api/cashflows/${deleteDialog.id}`
          : deleteDialog.type === 'capitalCall'
          ? `/api/capital-calls/${deleteDialog.id}`
          : `/api/distributions/${deleteDialog.id}`

      const res = await fetch(endpoint, {
        method: 'DELETE',
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete')
      }

      toast.success(`${deleteDialog.type === 'cashflow' ? 'Cashflow' : deleteDialog.type === 'capitalCall' ? 'Capital call' : 'Distribution'} deleted successfully`)

      setDeleteDialog({ open: false, type: null, id: null })
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete')
    } finally {
      setIsSubmitting(false)
    }
  }

  const openCreateDialog = (type: EntityType) => {
    const defaultData =
      type === 'cashflow'
        ? { investor_id: investorId, vehicle_id: vehicleId, type: 'call', amount: 0, date: '' }
        : type === 'capitalCall'
        ? { vehicle_id: vehicleId, name: '', call_pct: 0, due_date: '', status: 'draft' }
        : { vehicle_id: vehicleId, name: '', amount: 0, date: '', classification: '' }

    setFormData(defaultData)
    setCreateDialog({ open: true, type })
  }

  const openEditDialog = (type: EntityType, data: any) => {
    setFormData(data)
    setEditDialog({ open: true, type, data })
  }

  const openDeleteDialog = (type: EntityType, id: string) => {
    setDeleteDialog({ open: true, type, id })
  }

  return (
    <>
      <Tabs defaultValue="cashflows" className="w-full" id={`capital-activity-tabs-${vehicleId}-${investorId}`}>
        <TabsList className="bg-muted">
          <TabsTrigger value="cashflows" className="data-[state=active]:bg-muted text-foreground">
            Cashflows ({cashflows.length})
          </TabsTrigger>
          <TabsTrigger value="calls" className="data-[state=active]:bg-muted text-foreground">
            Capital Calls ({capitalCalls.length})
          </TabsTrigger>
          <TabsTrigger value="distributions" className="data-[state=active]:bg-muted text-foreground">
            Distributions ({distributions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cashflows" className="mt-4">
          {isStaff && (
            <div className="mb-4 flex justify-end">
              <Button onClick={() => openCreateDialog('cashflow')} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Cashflow
              </Button>
            </div>
          )}
          <div className="rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-muted/50">
                  <TableHead className="text-muted-foreground">Type</TableHead>
                  <TableHead className="text-muted-foreground">Date</TableHead>
                  <TableHead className="text-right text-muted-foreground">Amount</TableHead>
                  {isStaff && <TableHead className="text-right text-muted-foreground">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {cashflows.length > 0 ? (
                  cashflows.map((cf) => (
                    <TableRow key={cf.id} className="border-border hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {cf.type === 'contribution' || cf.type === 'call' ? (
                            <ArrowDownCircle className="h-4 w-4 text-green-400" />
                          ) : (
                            <ArrowUpCircle className="h-4 w-4 text-blue-400" />
                          )}
                          <span className="capitalize text-foreground">{cf.type}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(cf.date)}</TableCell>
                      <TableCell className="text-right font-semibold text-foreground">
                        {formatCurrency(cf.amount)}
                      </TableCell>
                      {isStaff && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog('cashflow', cf)}
                              className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDeleteDialog('cashflow', cf.id)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={isStaff ? 4 : 3} className="text-center text-muted-foreground py-8">
                      No cashflows recorded yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="calls" className="mt-4">
          {isStaff && (
            <div className="mb-4 flex justify-end">
              <Button onClick={() => openCreateDialog('capitalCall')} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Capital Call
              </Button>
            </div>
          )}
          <div className="rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-muted/50">
                  <TableHead className="text-muted-foreground">Call Name</TableHead>
                  <TableHead className="text-muted-foreground">Call %</TableHead>
                  <TableHead className="text-muted-foreground">Due Date</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  {isStaff && <TableHead className="text-right text-muted-foreground">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {capitalCalls.length > 0 ? (
                  capitalCalls.map((call) => (
                    <TableRow key={call.id} className="border-border hover:bg-muted/50">
                      <TableCell className="font-medium text-foreground">{call.name}</TableCell>
                      <TableCell className="text-muted-foreground">{call.call_pct}%</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(call.due_date)}</TableCell>
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
                      {isStaff && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog('capitalCall', call)}
                              className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDeleteDialog('capitalCall', call.id)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={isStaff ? 5 : 4} className="text-center text-muted-foreground py-8">
                      No capital calls issued yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="distributions" className="mt-4">
          {isStaff && (
            <div className="mb-4 flex justify-end">
              <Button onClick={() => openCreateDialog('distribution')} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Distribution
              </Button>
            </div>
          )}
          <div className="rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-muted/50">
                  <TableHead className="text-muted-foreground">Distribution Name</TableHead>
                  <TableHead className="text-muted-foreground">Date</TableHead>
                  <TableHead className="text-muted-foreground">Classification</TableHead>
                  <TableHead className="text-right text-muted-foreground">Amount</TableHead>
                  {isStaff && <TableHead className="text-right text-muted-foreground">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {distributions.length > 0 ? (
                  distributions.map((dist) => (
                    <TableRow key={dist.id} className="border-border hover:bg-muted/50">
                      <TableCell className="font-medium text-foreground">{dist.name}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(dist.date)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize text-blue-300 border-blue-700">
                          {dist.classification}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-foreground">
                        {formatCurrency(dist.amount)}
                      </TableCell>
                      {isStaff && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog('distribution', dist)}
                              className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDeleteDialog('distribution', dist.id)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={isStaff ? 5 : 4} className="text-center text-muted-foreground py-8">
                      No distributions made yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={createDialog.open || editDialog.open} onOpenChange={(open) => {
        if (!open) {
          setCreateDialog({ open: false, type: null })
          setEditDialog({ open: false, type: null, data: null })
          setFormData({})
        }
      }}>
        <DialogContent className="bg-card text-foreground border-border">
          <DialogHeader>
            <DialogTitle>
              {editDialog.open ? 'Edit' : 'Create'}{' '}
              {createDialog.type === 'cashflow' || editDialog.type === 'cashflow'
                ? 'Cashflow'
                : createDialog.type === 'capitalCall' || editDialog.type === 'capitalCall'
                ? 'Capital Call'
                : 'Distribution'}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {editDialog.open ? 'Update the details below' : 'Fill in the details below'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Cashflow Form */}
            {(createDialog.type === 'cashflow' || editDialog.type === 'cashflow') && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={formData.type || 'call'}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger className="bg-muted border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-muted border-border">
                      <SelectItem value="call">Call</SelectItem>
                      <SelectItem value="distribution">Distribution</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount || 0}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                    className="bg-muted border-border"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date || ''}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="bg-muted border-border"
                  />
                </div>
              </>
            )}

            {/* Capital Call Form */}
            {(createDialog.type === 'capitalCall' || editDialog.type === 'capitalCall') && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-muted border-border"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="call_pct">Call %</Label>
                  <Input
                    id="call_pct"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.call_pct || 0}
                    onChange={(e) => setFormData({ ...formData, call_pct: parseFloat(e.target.value) })}
                    className="bg-muted border-border"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={formData.due_date || ''}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="bg-muted border-border"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status || 'draft'}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger className="bg-muted border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-muted border-border">
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* Distribution Form */}
            {(createDialog.type === 'distribution' || editDialog.type === 'distribution') && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-muted border-border"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount || 0}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                    className="bg-muted border-border"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date || ''}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="bg-muted border-border"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="classification">Classification</Label>
                  <Input
                    id="classification"
                    value={formData.classification || ''}
                    onChange={(e) => setFormData({ ...formData, classification: e.target.value })}
                    className="bg-muted border-border"
                    placeholder="e.g., Return of Capital, Income"
                  />
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCreateDialog({ open: false, type: null })
                setEditDialog({ open: false, type: null, data: null })
                setFormData({})
              }}
              disabled={isSubmitting}
              className="border-border text-muted-foreground hover:bg-muted"
            >
              Cancel
            </Button>
            <Button
              onClick={editDialog.open ? handleUpdate : handleCreate}
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? 'Saving...' : editDialog.open ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => {
        if (!open) setDeleteDialog({ open: false, type: null, id: null })
      }}>
        <AlertDialogContent className="bg-card text-foreground border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This action cannot be undone. This will permanently delete this{' '}
              {deleteDialog.type === 'cashflow'
                ? 'cashflow'
                : deleteDialog.type === 'capitalCall'
                ? 'capital call'
                : 'distribution'}
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border text-muted-foreground hover:bg-muted">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

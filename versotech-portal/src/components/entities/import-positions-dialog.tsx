'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Upload } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface ImportPositionsDialogProps {
  vehicleId: string
  onImported?: () => void
}

export function ImportPositionsDialog({ vehicleId, onImported }: ImportPositionsDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const router = useRouter()

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a CSV file')
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`/api/staff/vehicles/${vehicleId}/positions/import`, {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to import positions')
      }

      toast.success(data.message || `Imported ${data.imported} position(s)`)
      setIsOpen(false)
      setFile(null)
      onImported?.()
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to import positions')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload className="h-4 w-4 mr-2" />
          Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-950 border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white">Import Positions</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="positions-file">CSV File</Label>
            <Input
              id="positions-file"
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="bg-zinc-900 border-white/10"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Expected columns: investor_id, units, cost_basis, last_nav, as_of_date
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isUploading}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={!file || isUploading}>
              {isUploading ? 'Importing...' : 'Import'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}


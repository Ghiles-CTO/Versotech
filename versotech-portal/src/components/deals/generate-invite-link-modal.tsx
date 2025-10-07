'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Link as LinkIcon, Loader2, Copy, CheckCircle } from 'lucide-react'

interface GenerateInviteLinkModalProps {
  dealId: string
}

export function GenerateInviteLinkModal({ dealId }: GenerateInviteLinkModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generatedLink, setGeneratedLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const [formData, setFormData] = useState({
    role: 'investor',
    expires_in_hours: '168', // 7 days
    max_uses: '1'
  })

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/deals/${dealId}/invite-links`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: formData.role,
          expires_in_hours: parseInt(formData.expires_in_hours),
          max_uses: parseInt(formData.max_uses)
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to generate invite link')
      }

      const data = await response.json()
      setGeneratedLink(data.inviteLink.invite_url)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleClose = () => {
    setOpen(false)
    setGeneratedLink(null)
    setCopied(false)
    setError(null)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <LinkIcon className="h-4 w-4" />
          Generate Invite Link
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate Invite Link</DialogTitle>
          <DialogDescription>
            Create a shareable link for external participants
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!generatedLink ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="role">Participant Role *</Label>
                <Select value={formData.role} onValueChange={(v) => setFormData(prev => ({ ...prev, role: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="investor">Investor</SelectItem>
                    <SelectItem value="co_investor">Co-Investor</SelectItem>
                    <SelectItem value="advisor">Advisor</SelectItem>
                    <SelectItem value="lawyer">Lawyer</SelectItem>
                    <SelectItem value="banker">Banker</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expires_in_hours">Expires In (hours)</Label>
                  <Input
                    id="expires_in_hours"
                    type="number"
                    value={formData.expires_in_hours}
                    onChange={(e) => setFormData(prev => ({ ...prev, expires_in_hours: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">Default: 168 (7 days)</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_uses">Max Uses</Label>
                  <Input
                    id="max_uses"
                    type="number"
                    value={formData.max_uses}
                    onChange={(e) => setFormData(prev => ({ ...prev, max_uses: e.target.value }))}
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/20 border border-red-400/30 text-red-200 text-sm">
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={handleClose} disabled={loading}>
                  Cancel
                </Button>
                <Button onClick={handleGenerate} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Generate Link'
                  )}
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label>Invite Link</Label>
                <div className="flex gap-2">
                  <Input
                    value={generatedLink}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button onClick={handleCopy} variant="outline" className="gap-2">
                    {copied ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Share this link with the participant. Expires in {formData.expires_in_hours} hours.
                </p>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleClose}>Done</Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}


'use client'

import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { FolderUp, FolderOpen, FolderClosed, File, FileText, Loader2, Check, ChevronsUpDown, Plus, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { DATA_ROOM_DEFAULT_FOLDERS, validateFolderName } from '@/lib/data-room/constants'
import { cn } from '@/lib/utils'

interface FolderUploadProps {
  dealId: string
  onUploadComplete?: () => void
  trigger: React.ReactNode
}

interface FolderFileEntry {
  file: File
  relativePath: string
  folderPath: string
}

interface PreviewNode {
  name: string
  fullPath: string
  isFolder: boolean
  size: number
  children: PreviewNode[]
}

function buildPreviewTree(entries: FolderFileEntry[]): PreviewNode[] {
  const rootChildren: PreviewNode[] = []
  const folderMap = new Map<string, PreviewNode>()

  const getOrCreateFolder = (pathParts: string[], upTo: number): PreviewNode => {
    const fullPath = pathParts.slice(0, upTo + 1).join('/')
    if (folderMap.has(fullPath)) return folderMap.get(fullPath)!

    const node: PreviewNode = {
      name: pathParts[upTo],
      fullPath,
      isFolder: true,
      size: 0,
      children: []
    }
    folderMap.set(fullPath, node)

    if (upTo === 0) {
      rootChildren.push(node)
    } else {
      const parent = getOrCreateFolder(pathParts, upTo - 1)
      if (!parent.children.find(c => c.fullPath === fullPath)) {
        parent.children.push(node)
      }
    }

    return node
  }

  for (const entry of entries) {
    const parts = entry.relativePath.split('/')
    const fileName = parts[parts.length - 1]

    const fileNode: PreviewNode = {
      name: fileName,
      fullPath: entry.relativePath,
      isFolder: false,
      size: entry.file.size,
      children: []
    }

    if (parts.length === 1) {
      rootChildren.push(fileNode)
    } else {
      const parent = getOrCreateFolder(parts, parts.length - 2)
      parent.children.push(fileNode)
      // Accumulate size up through parents
      for (let i = parts.length - 2; i >= 0; i--) {
        const folderPath = parts.slice(0, i + 1).join('/')
        const folder = folderMap.get(folderPath)
        if (folder) folder.size += entry.file.size
      }
    }
  }

  // Sort: folders first (alphabetical), then files (alphabetical)
  const sortNodes = (nodes: PreviewNode[]) => {
    nodes.sort((a, b) => {
      if (a.isFolder && !b.isFolder) return -1
      if (!a.isFolder && b.isFolder) return 1
      return a.name.localeCompare(b.name)
    })
    for (const n of nodes) {
      if (n.children.length > 0) sortNodes(n.children)
    }
  }
  sortNodes(rootChildren)

  return rootChildren
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function countFiles(nodes: PreviewNode[]): number {
  let count = 0
  for (const n of nodes) {
    if (!n.isFolder) count++
    else count += countFiles(n.children)
  }
  return count
}

function totalSize(nodes: PreviewNode[]): number {
  let size = 0
  for (const n of nodes) {
    if (!n.isFolder) size += n.size
    else size += totalSize(n.children)
  }
  return size
}

function getFileIcon(name: string) {
  const lower = name.toLowerCase()
  if (lower.endsWith('.pdf')) return <FileText className="h-3.5 w-3.5 text-red-400 flex-shrink-0" />
  if (lower.match(/\.(xlsx?|csv)$/)) return <FileText className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
  if (lower.match(/\.(docx?|txt|rtf)$/)) return <FileText className="h-3.5 w-3.5 text-blue-400 flex-shrink-0" />
  if (lower.match(/\.(png|jpe?g|gif|svg|webp)$/)) return <File className="h-3.5 w-3.5 text-purple-400 flex-shrink-0" />
  if (lower.match(/\.(zip|rar|tar|gz)$/)) return <File className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
  return <File className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
}

interface DealFolder {
  id: string
  name: string
  path: string
  folder_type: string
}

const MAX_FOLDER_TOTAL_BYTES = 1024 * 1024 * 1024 // 1 GB
const MAX_FOLDER_FILE_COUNT = 500

export function DataRoomFolderUpload({ dealId, onUploadComplete, trigger }: FolderUploadProps) {
  const [open, setOpen] = useState(false)
  const [folderEntries, setFolderEntries] = useState<FolderFileEntry[]>([])
  const [rootFolderName, setRootFolderName] = useState('')
  const [parentFolder, setParentFolder] = useState('')
  const [visibleToInvestors, setVisibleToInvestors] = useState(false)
  const [isFeatured, setIsFeatured] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dealFolders, setDealFolders] = useState<DealFolder[]>([])
  const [loadingFolders, setLoadingFolders] = useState(false)
  const [folderComboOpen, setFolderComboOpen] = useState(false)
  const [folderSearch, setFolderSearch] = useState('')
  const folderInputRef = useRef<HTMLInputElement>(null)

  const allFolderOptions = useMemo(() => {
    const set = new Set<string>([...DATA_ROOM_DEFAULT_FOLDERS])
    dealFolders.forEach(f => set.add(f.name))
    return Array.from(set)
  }, [dealFolders])

  const fetchDealFolders = useCallback(async () => {
    setLoadingFolders(true)
    try {
      const response = await fetch(`/api/deals/${dealId}/folders`)
      if (response.ok) {
        const data = await response.json()
        setDealFolders(data.folders || [])
      }
    } catch (error) {
      console.error('Error fetching deal folders:', error)
    } finally {
      setLoadingFolders(false)
    }
  }, [dealId])

  useEffect(() => {
    if (open && dealId) {
      fetchDealFolders()
    }
  }, [open, dealId, fetchDealFolders])

  const previewTree = useMemo(() => buildPreviewTree(folderEntries), [folderEntries])
  const fileCount = useMemo(() => countFiles(previewTree), [previewTree])
  const totalBytes = useMemo(() => totalSize(previewTree), [previewTree])

  const handleFolderSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files
    if (!fileList || fileList.length === 0) return

    const entries: FolderFileEntry[] = []
    let detectedRoot = ''
    let totalBytes = 0

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i]
      const relativePath = (file as any).webkitRelativePath as string || file.name
      const parts = relativePath.split('/')

      // Detect root folder name from first file
      if (i === 0 && parts.length > 1) {
        detectedRoot = parts[0]
      }

      // Strip the root folder prefix from the relative path since we show it separately
      const pathWithoutRoot = parts.length > 1 ? parts.slice(1).join('/') : file.name
      const folderPath = parts.length > 2 ? parts.slice(1, -1).join('/') : ''

      totalBytes += file.size
      entries.push({ file, relativePath: pathWithoutRoot, folderPath })
    }

    // Validate aggregate limits
    if (entries.length > MAX_FOLDER_FILE_COUNT) {
      toast.error(`Folder contains ${entries.length} files — maximum is ${MAX_FOLDER_FILE_COUNT}`)
      e.target.value = ''
      return
    }
    if (totalBytes > MAX_FOLDER_TOTAL_BYTES) {
      toast.error(`Folder is ${formatSize(totalBytes)} — maximum is ${formatSize(MAX_FOLDER_TOTAL_BYTES)}`)
      e.target.value = ''
      return
    }

    setRootFolderName(detectedRoot)
    setFolderEntries(entries)
    e.target.value = ''
  }

  const handleUpload = async () => {
    if (folderEntries.length === 0) {
      toast.error('Please select a folder to upload')
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      let successCount = 0

      for (let i = 0; i < folderEntries.length; i++) {
        const { file, folderPath } = folderEntries[i]

        // Build the effective folder path
        // Base = rootFolderName (from OS folder), optionally nested under parentFolder
        const basePath = parentFolder
          ? `${parentFolder}/${rootFolderName}`
          : rootFolderName
        const effectiveFolder = folderPath
          ? `${basePath}/${folderPath}`
          : basePath || 'Misc'

        try {
          // Step 1: Get presigned upload URL (only JSON metadata, no file body)
          const presignRes = await fetch(`/api/deals/${dealId}/documents/presigned-upload`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileName: file.name,
              folder: effectiveFolder,
              contentType: file.type || 'application/octet-stream',
              fileSize: file.size
            })
          })

          if (!presignRes.ok) {
            const err = await presignRes.json()
            toast.error(`Failed to prepare upload for ${file.name}: ${err.error}`)
            continue
          }

          const { signedUrl, fileKey, token } = await presignRes.json()

          // Step 2: Upload file directly to Supabase Storage (bypasses Vercel 4.5MB limit)
          const uploadRes = await fetch(signedUrl, {
            method: 'PUT',
            headers: { 'Content-Type': file.type || 'application/octet-stream' },
            body: file
          })

          if (!uploadRes.ok) {
            toast.error(`Failed to upload ${file.name} to storage`)
            continue
          }

          // Step 3: Confirm upload and create DB record (only JSON metadata)
          const confirmRes = await fetch(`/api/deals/${dealId}/documents/presigned-upload`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileKey,
              token,
              fileName: file.name,
              folder: effectiveFolder,
              fileSize: file.size,
              mimeType: file.type || 'application/octet-stream',
              visibleToInvestors,
              isFeatured
            })
          })

          if (!confirmRes.ok) {
            const err = await confirmRes.json()
            toast.error(`Failed to register ${file.name}: ${err.error}`)
            continue
          }

          successCount++
        } catch (err) {
          console.error(`Upload error for ${file.name}:`, err)
          toast.error(`Failed to upload ${file.name}`)
          continue
        }

        setUploadProgress(Math.round(((i + 1) / folderEntries.length) * 100))
      }

      toast.success(`Successfully uploaded ${successCount} of ${folderEntries.length} files`)

      // Reset
      setFolderEntries([])
      setRootFolderName('')
      setParentFolder('')
      setVisibleToInvestors(false)
      setIsFeatured(false)
      setOpen(false)

      onUploadComplete?.()
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload folder')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const renderPreviewNode = (node: PreviewNode, depth: number, isLast: boolean) => {
    if (node.isFolder) {
      const childFileCount = countFiles(node.children)
      return (
        <div key={node.fullPath}>
          <div
            className="flex items-center gap-1.5 py-0.5"
            style={{ paddingLeft: depth * 16 }}
          >
            <FolderClosed className="h-3.5 w-3.5 text-blue-400 flex-shrink-0" />
            <span className="text-sm font-medium text-foreground">{node.name}/</span>
            <span className="text-[11px] text-muted-foreground ml-auto tabular-nums">
              {childFileCount} {childFileCount === 1 ? 'file' : 'files'}
            </span>
          </div>
          <div className="border-l border-border/30" style={{ marginLeft: depth * 16 + 7 }}>
            {node.children.map((child, idx) =>
              renderPreviewNode(child, depth + 1, idx === node.children.length - 1)
            )}
          </div>
        </div>
      )
    }

    return (
      <div
        key={node.fullPath}
        className="flex items-center gap-1.5 py-0.5"
        style={{ paddingLeft: depth * 16 }}
      >
        {getFileIcon(node.name)}
        <span className="text-sm text-muted-foreground truncate">{node.name}</span>
        <span className="text-[11px] text-muted-foreground ml-auto tabular-nums flex-shrink-0">
          {formatSize(node.size)}
        </span>
      </div>
    )
  }

  return (
    <>
      <div onClick={() => setOpen(true)}>{trigger}</div>

      <Dialog open={open} onOpenChange={(v) => { if (!uploading) setOpen(v) }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Upload Folder</DialogTitle>
            <DialogDescription>
              Select an OS folder to upload. The folder structure is preserved in the data room.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Hidden directory input */}
            <input
              ref={folderInputRef}
              type="file"
              // @ts-expect-error webkitdirectory is non-standard but widely supported
              webkitdirectory=""
              directory=""
              multiple
              className="hidden"
              onChange={handleFolderSelect}
            />

            {folderEntries.length === 0 ? (
              /* Dropzone-style prompt */
              <div
                className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors border-border hover:border-muted-foreground"
                onClick={() => folderInputRef.current?.click()}
              >
                <FolderUp className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                <p className="text-foreground font-medium mb-1">
                  Click to select a folder
                </p>
                <p className="text-sm text-muted-foreground">
                  The folder name and subfolder structure are preserved as-is.
                </p>
              </div>
            ) : (
              <>
                {/* Summary bar */}
                <div className="flex items-center justify-between px-3 py-2 rounded-md bg-muted/60 border border-border">
                  <div className="flex items-center gap-2 min-w-0">
                    <FolderOpen className="h-4 w-4 text-blue-400 flex-shrink-0" />
                    <span className="text-sm font-medium truncate">{rootFolderName}/</span>
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {fileCount} {fileCount === 1 ? 'file' : 'files'} &middot; {formatSize(totalBytes)}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs gap-1"
                    onClick={() => folderInputRef.current?.click()}
                    disabled={uploading}
                  >
                    <RefreshCw className="h-3 w-3" />
                    Change
                  </Button>
                </div>

                {/* Tree preview */}
                <div className="max-h-48 overflow-y-auto rounded-md border border-border bg-background p-2">
                  {previewTree.map((node, idx) =>
                    renderPreviewNode(node, 0, idx === previewTree.length - 1)
                  )}
                </div>
              </>
            )}

            {/* Upload into combobox */}
            <div className="space-y-2">
              <Label>Upload into</Label>
              <Popover open={folderComboOpen} onOpenChange={setFolderComboOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={folderComboOpen}
                    className="w-full justify-between font-normal"
                    disabled={uploading || loadingFolders}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <FolderOpen className="h-3.5 w-3.5 flex-shrink-0" />
                      {parentFolder || '/ (Root)'}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                  <Command>
                    <CommandInput
                      placeholder="Search or create folder..."
                      value={folderSearch}
                      onValueChange={setFolderSearch}
                    />
                    <CommandList>
                      <CommandEmpty>
                        {folderSearch.trim() && (
                          <button
                            className="flex w-full items-center gap-2 px-2 py-1.5 text-sm cursor-pointer hover:bg-accent rounded-sm"
                            onClick={() => {
                              const result = validateFolderName(folderSearch.trim())
                              if (!result.valid) {
                                toast.error(result.error)
                                return
                              }
                              setParentFolder(folderSearch.trim())
                              setFolderComboOpen(false)
                              setFolderSearch('')
                            }}
                          >
                            <Plus className="h-4 w-4" />
                            Create folder: &quot;{folderSearch.trim()}&quot;
                          </button>
                        )}
                      </CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value="__root__"
                          onSelect={() => {
                            setParentFolder('')
                            setFolderComboOpen(false)
                            setFolderSearch('')
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              parentFolder === '' ? "opacity-100" : "opacity-0"
                            )}
                          />
                          / (Root)
                        </CommandItem>
                        {allFolderOptions.map((f) => (
                          <CommandItem
                            key={f}
                            value={f}
                            onSelect={() => {
                              setParentFolder(f)
                              setFolderComboOpen(false)
                              setFolderSearch('')
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                parentFolder === f ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <FolderOpen className="mr-2 h-3.5 w-3.5" />
                            {f}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Checkboxes */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="folderVisible"
                  checked={visibleToInvestors}
                  onCheckedChange={(checked) => setVisibleToInvestors(checked as boolean)}
                  disabled={uploading}
                />
                <label
                  htmlFor="folderVisible"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Visible to investors
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="folderFeatured"
                  checked={isFeatured}
                  onCheckedChange={(checked) => setIsFeatured(checked as boolean)}
                  disabled={uploading}
                />
                <label
                  htmlFor="folderFeatured"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Featured document
                </label>
              </div>
            </div>

            {/* Progress */}
            {uploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)} disabled={uploading}>
                Cancel
              </Button>
              <Button onClick={handleUpload} disabled={uploading || folderEntries.length === 0}>
                {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Upload All{fileCount > 0 ? ` (${fileCount} files)` : ''}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

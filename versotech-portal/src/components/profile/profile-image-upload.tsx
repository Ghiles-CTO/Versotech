'use client'

import { useState, useRef } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Camera, Trash2, Upload, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface ProfileImageUploadProps {
  currentAvatarUrl?: string | null
  userName: string
  onAvatarUpdate: (newAvatarUrl: string) => void
  /** Compact mode shows a smaller avatar (64x64) with minimal UI for inline header usage */
  compact?: boolean
}

export function ProfileImageUpload({
  currentAvatarUrl,
  userName,
  onAvatarUpdate,
  compact = false
}: ProfileImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type', {
        description: 'Please select a JPEG, PNG, GIF, or WEBP image'
      })
      return
    }

    // Validate file size (2MB max)
    const maxSize = 2 * 1024 * 1024 // 2MB
    if (file.size > maxSize) {
      toast.error('File too large', {
        description: 'Maximum file size is 2MB'
      })
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload file
    handleUpload(file)
  }

  const handleUpload = async (file: File) => {
    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('avatar', file)

      const response = await fetch('/api/profiles/avatar', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload avatar')
      }

      toast.success('Avatar updated successfully')
      onAvatarUpdate(data.avatar_url)
      setPreviewUrl(null)
    } catch (error: any) {
      console.error('Error uploading avatar:', error)
      toast.error('Failed to upload avatar', {
        description: error.message
      })
      setPreviewUrl(null)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDelete = async () => {
    if (!currentAvatarUrl) return

    setIsDeleting(true)

    try {
      const response = await fetch('/api/profiles/avatar', {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete avatar')
      }

      toast.success('Avatar removed successfully')
      onAvatarUpdate('')
      setPreviewUrl(null)
    } catch (error: any) {
      console.error('Error deleting avatar:', error)
      toast.error('Failed to delete avatar', {
        description: error.message
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const displayUrl = previewUrl || currentAvatarUrl

  // Compact mode: smaller avatar for inline header usage
  if (compact) {
    return (
      <div className="relative">
        <Avatar className="h-16 w-16 border-2 border-background shadow-md">
          <AvatarImage src={displayUrl || undefined} alt={userName} />
          <AvatarFallback className="text-lg">
            {getInitials(userName)}
          </AvatarFallback>
        </Avatar>

        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-full">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        )}

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || isDeleting}
          className="absolute -bottom-1 -right-1 p-1.5 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-blue-700"
        >
          <Camera className="h-3 w-3" />
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="hidden"
          onChange={handleFileSelect}
          disabled={isUploading || isDeleting}
        />
      </div>
    )
  }

  // Full mode: large avatar with buttons and instructions
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
          <AvatarImage src={displayUrl || undefined} alt={userName} />
          <AvatarFallback className="text-2xl">
            {getInitials(userName)}
          </AvatarFallback>
        </Avatar>

        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || isDeleting}
          className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-blue-700"
        >
          <Camera className="h-4 w-4" />
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
        onChange={handleFileSelect}
        disabled={isUploading || isDeleting}
      />

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || isDeleting}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Change Photo
            </>
          )}
        </Button>

        {currentAvatarUrl && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={isUploading || isDeleting}
            className="hover:bg-red-50 hover:text-red-600 hover:border-red-200"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Removing...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Remove
              </>
            )}
          </Button>
        )}
      </div>

      <p className="text-xs text-gray-600 text-center max-w-xs">
        Recommended: Square image, at least 200×200px
        <br />
        Max size: 2MB • Formats: JPEG, PNG, GIF, WEBP
      </p>
    </div>
  )
}

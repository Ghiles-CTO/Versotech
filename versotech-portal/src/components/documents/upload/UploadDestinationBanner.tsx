'use client'

import React from 'react'
import { Upload, Folder, ChevronRight } from 'lucide-react'
import { DocumentFolder } from '@/types/documents'
import { cn } from '@/lib/utils'

interface UploadDestinationBannerProps {
  currentFolder: DocumentFolder | null
  className?: string
}

/**
 * UploadDestinationBanner - Clear Upload Context Component
 *
 * Displays the current upload destination in a professional banner.
 * Solves the "where are my files going?" problem.
 *
 * Design: Financial Terminal Elegance
 */
export function UploadDestinationBanner({
  currentFolder,
  className,
}: UploadDestinationBannerProps) {
  return (
    <div
      className={cn(
        'px-6 py-2.5 border-b',
        'bg-navy-50 border-navy-100',
        'transition-colors duration-200',
        className
      )}
    >
      <div className="flex items-center gap-2 text-sm">
        {/* Upload Icon */}
        <Upload className="w-4 h-4 text-navy-600 flex-shrink-0" strokeWidth={2} />

        {/* Label */}
        <span className="text-slate-700 font-medium">Upload destination:</span>

        {/* Current Folder Path */}
        {currentFolder ? (
          <div className="flex items-center gap-1.5">
            {/* Parse path into breadcrumb-style display */}
            {currentFolder.path.split('/').filter(Boolean).map((segment, index, arr) => (
              <React.Fragment key={index}>
                {index > 0 && (
                  <ChevronRight
                    className="w-3.5 h-3.5 text-navy-400 flex-shrink-0"
                    strokeWidth={2}
                  />
                )}
                <span
                  className={cn(
                    'font-medium',
                    index === arr.length - 1
                      ? 'text-navy-900' // Last segment (current folder)
                      : 'text-navy-700' // Parent segments
                  )}
                >
                  {segment}
                </span>
              </React.Fragment>
            ))}
          </div>
        ) : (
          <span className="font-medium text-navy-900">Root / All Documents</span>
        )}

        {/* Folder Icon */}
        <Folder
          className="w-4 h-4 text-navy-600 ml-1 flex-shrink-0"
          strokeWidth={2}
        />
      </div>
    </div>
  )
}

/**
 * Compact variant for dialogs/modals
 */
export function UploadDestinationBadge({
  currentFolder,
  className,
}: UploadDestinationBannerProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-md',
        'bg-navy-50 border border-navy-200',
        'text-sm',
        className
      )}
    >
      <Folder className="w-3.5 h-3.5 text-navy-600 flex-shrink-0" strokeWidth={2} />
      <span className="text-slate-700">Uploading to:</span>
      <span className="font-medium text-navy-900">
        {currentFolder?.name || 'Root'}
      </span>
    </div>
  )
}

'use client'

import React, { useState } from 'react'
import { DocumentFolder } from '@/types/documents'
import { useStaffDocuments } from '../context/StaffDocumentsContext'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { FolderPlus, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'

interface FolderActionsProps {
  folder: DocumentFolder
}

export function FolderActions({ folder }: FolderActionsProps) {
  const { dispatch, deleteFolder } = useStaffDocuments()
  const [confirmOpen, setConfirmOpen] = useState(false)

  return (
    <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <MoreHorizontal className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem
            onClick={() =>
              dispatch({ type: 'OPEN_CREATE_FOLDER_DIALOG', parentId: folder.id })
            }
          >
            <FolderPlus className="h-4 w-4 mr-2" />
            New subfolder
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              dispatch({
                type: 'OPEN_RENAME_FOLDER_DIALOG',
                folderId: folder.id,
                folderName: folder.name,
              })
            }
          >
            <Pencil className="h-4 w-4 mr-2" />
            Rename
          </DropdownMenuItem>
          <AlertDialogTrigger asChild>
            <DropdownMenuItem className="text-destructive focus:text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </AlertDialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete folder?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete "{folder.name}". This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={async () => {
              await deleteFolder(folder.id)
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

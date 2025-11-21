"use client"

import { createContext, useContext, useState, useCallback } from "react"
import { useRouter } from "next/navigation"

interface AddArrangerContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  refresh: () => void
}

const AddArrangerContext = createContext<AddArrangerContextValue | undefined>(undefined)

export function AddArrangerProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const refresh = useCallback(() => {
    router.refresh()
  }, [router])

  return (
    <AddArrangerContext.Provider value={{ open, setOpen, refresh }}>
      {children}
    </AddArrangerContext.Provider>
  )
}

export function useAddArranger() {
  const context = useContext(AddArrangerContext)
  if (!context) {
    throw new Error("useAddArranger must be used within a AddArrangerProvider")
  }
  return context
}

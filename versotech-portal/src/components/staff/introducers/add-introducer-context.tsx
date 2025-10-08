"use client"

import { createContext, useContext, useState, useCallback } from "react"
import { useRouter } from "next/navigation"

interface AddIntroducerContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  refresh: () => void
}

const AddIntroducerContext = createContext<AddIntroducerContextValue | undefined>(undefined)

export function AddIntroducerProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const refresh = useCallback(() => {
    router.refresh()
  }, [router])

  return (
    <AddIntroducerContext.Provider value={{ open, setOpen, refresh }}>
      {children}
    </AddIntroducerContext.Provider>
  )
}

export function useAddIntroducer() {
  const context = useContext(AddIntroducerContext)
  if (!context) {
    throw new Error("useAddIntroducer must be used within a AddIntroducerProvider")
  }
  return context
}

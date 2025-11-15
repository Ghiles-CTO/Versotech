"use client"

import { useTheme } from "@/components/theme-provider"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme } = useTheme()

  return (
    <Sonner
      theme={theme === 'staff-dark' ? 'dark' : 'light'}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: 'bg-background text-foreground border-border shadow-lg',
          description: 'text-muted-foreground',
          actionButton: 'bg-primary text-primary-foreground hover:bg-primary/90',
          cancelButton: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
